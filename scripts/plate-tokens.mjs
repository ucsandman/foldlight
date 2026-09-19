#!/usr/bin/env node
// Read the plate, emit the role tokens it is actually lit by, the light kit and
// the text safe box the layout must obey. No dependencies: PNG inflate with
// node:zlib, OKLab by hand.
//
//   node plate-tokens.mjs <plate.png> <tokens.css> [--fold <key>] [--register brand|product]
//   node plate-tokens.mjs <plate.png> <tokens.css> --twin        add the theme twin block
//   node plate-tokens.mjs <plate.png> <tokens.css> --check       compare the file to the plate
//   node plate-tokens.mjs <plate.png> <tokens.css> --json        machine-readable
//   node plate-tokens.mjs <plate.png> <tokens.css> --title "..."  first header line
//
// Sampling bands, clamps and lifts are the tournament's, verbatim. A role that
// departs from its sampled cluster by more than dL 0.04, dC 0.03 or dh 12 is
// drift unless its line carries an /* override: <reason> */ comment.
//
// Exit 0 = written (or no drift), 1 = a contrast floor could not be met by
// lifting, or --check found drift, 2 = usage, 3 = the PNG was rejected.

import fs from 'node:fs';
import zlib from 'node:zlib';

export const DRIFT = { dL: 0.04, dC: 0.03, dh: 12 };

// ---------------------------------------------------------------- png
export function decodePNG(buf) {
  let p = 8, w = 0, h = 0, depth = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ct = d[9];
      if (d[12]) throw new Error('interlaced png not supported');
    } else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || (ct !== 2 && ct !== 6)) throw new Error('unsupported png depth=' + depth + ' colorType=' + ct);
  const ch = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let o = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[o++];
    const line = raw.subarray(o, o + stride);
    o += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 255;
    }
  }
  return { w, h, ch, px: out };
}

// tEXt chunks: plate.mjs stamps provider, lit, kelvin, key-clock and title there
export function readText(buf) {
  const out = {};
  let p = 8;
  while (p + 8 <= buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    if (type === 'tEXt') {
      const d = buf.subarray(p + 8, p + 8 + len);
      const z = d.indexOf(0);
      if (z > 0) out[d.toString('latin1', 0, z)] = d.toString('latin1', z + 1);
    }
    if (type === 'IEND') break;
    p += 12 + len;
  }
  return out;
}

// ---------------------------------------------------------------- colour
const s2l = (u) => { const c = u / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
export function oklab(r8, g8, b8) {
  const r = s2l(r8), g = s2l(g8), b = s2l(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360];
}
// same transform the skill linter uses, so the two agree on contrast
function oklchToRgb(L, C, h) {
  const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180);
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
export const ratio = (c1, c2) => {
  const pair = [lum(oklchToRgb(c1[0], c1[1], c1[2])), lum(oklchToRgb(c2[0], c2[1], c2[2]))].sort((x, y) => y - x);
  return (pair[0] + 0.05) / (pair[1] + 0.05);
};
const meanH = (hs) => {
  let x = 0, y = 0;
  for (const h of hs) { x += Math.cos(h * Math.PI / 180); y += Math.sin(h * Math.PI / 180); }
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const r3 = (c) => [Number(c[0].toFixed(3)), Number(c[1].toFixed(3)), Math.round(c[2])];
const okl = (c) => 'oklch(' + r3(c).join(' ') + ')';

// ---------------------------------------------------------------- sampling
const BANDS = {
  base: { bg: [0.06, 0.20], surface: [0.55, 0.72], ink: [0.985, 1.0] },
  // the twins remap bg and ink (3.4 section 8) and take surface from the band
  // next to their own bg, one step toward the light; a twin surface left at the
  // base band sits between bg and ink and can carry no text at all
  dark: { bg: [0.02, 0.10], surface: [0.10, 0.25], ink: [0.90, 1.0] },
  light: { bg: [0.85, 0.95], surface: [0.72, 0.85], ink: [0.04, 0.12] },
};
const BAND_NOTE_LIGHT = {
  bg: 'the lit ground of the scene, plate luminance p85 to p95',
  surface: 'the subject one step below the ground, plate p72 to p85',
  ink: 'the deepest shadow in the frame, plate p04 to p12',
  accent: 'the hottest chroma the light makes, top 1 percent',
  muted: '62 percent of the way from bg to ink, on ink hue',
};
let BAND_NOTE = {
  bg: 'the room outside the lamp, plate luminance p06 to p20',
  surface: 'the lit body of the subject, plate p55 to p72',
  ink: 'the face of the light source itself, plate p98 and up',
  accent: 'the hottest chroma the lamp makes, top 1 percent',
  muted: '62 percent of the way from bg to ink, on ink hue',
};

function rolesFrom(pts, byL, bands, notes, tag) {
  const band = (lo, hi) => byL.slice(Math.floor(lo * byL.length), Math.min(byL.length, Math.max(Math.floor(lo * byL.length) + 1, Math.floor(hi * byL.length))));
  const avg = (g) => [g.reduce((s, p) => s + p[0], 0) / g.length, g.reduce((s, p) => s + p[1], 0) / g.length, meanH(g.map((p) => p[2]))];

  let bg = avg(band(...bands.bg));
  let surface = avg(band(...bands.surface));
  let ink = avg(band(...bands.ink));
  const inkL0 = ink[0];
  const chromaSorted = pts.filter((p) => p[0] > 0.30 && p[0] < 0.88).sort((a, b) => b[1] - a[1]);
  const accent = chromaSorted.length
    ? avg(chromaSorted.slice(0, Math.max(40, Math.floor(chromaSorted.length * 0.01))))
    : [ink[0], 0.02, ink[2]];

  const clampC = (c, max, name) => {
    if (c[1] > max) { notes.push(`${tag}chroma-clamp ${name} ${c[1].toFixed(3)} -> ${Number(max.toFixed(3))} (accent is the only saturated role)`); c[1] = max; }
    return c;
  };
  bg = clampC(bg, 0.045, '--bg');
  surface = clampC(surface, 0.05, '--surface');
  // the saturation correction: a computed ink may carry the lamp's own chroma
  ink = clampC(ink, Math.min(accent[1], 0.12), '--ink');

  // cream trap: a warm near-white ground is the AI default, never a sampled room
  const creamClamp = (c, name) => {
    if (c[0] >= 0.84 && c[0] <= 0.98 && c[1] > 0.004 && c[1] < 0.06 && c[2] >= 40 && c[2] <= 100) {
      notes.push(`${tag}cream-clamp ${name} ${c[1].toFixed(3)} -> 0 (L ${c[0].toFixed(3)} hue ${Math.round(c[2])} is the warm near-white band)`);
      c[1] = 0;
    }
    return c;
  };
  bg = creamClamp(bg, '--bg');
  surface = creamClamp(surface, '--surface');

  // sampler limits: a flat, high-key plate collapses bg and surface into one band
  const lightTheme = bg[0] >= 0.5;
  if (Math.abs(bg[0] - surface[0]) < 0.03) {
    const widened = Number(Math.min(0.99, Math.max(0.01, bg[0] + (lightTheme ? 0.06 : 0.05))).toFixed(3));
    notes.push(`${tag}NARROW_BANDS --bg L ${bg[0].toFixed(3)} and --surface L ${surface[0].toFixed(3)} within dL 0.03; --surface widened to L ${widened} (${lightTheme ? 'light' : 'dark'} theme)`);
    surface[0] = widened;
  }

  // lifts: ink and muted move away from the grounds, accent away from bg
  const dir = ink[0] >= bg[0] ? 1 : -1;
  const lo = 0.02, hi = 0.995;
  const failures = [];
  const lift = (c, floors, name, record = true) => {
    let steps = 0;
    while (floors.some(([g, f]) => ratio(c, g) < f) && c[0] + dir * 0.005 > lo && c[0] + dir * 0.005 < hi) {
      c[0] = Number((c[0] + dir * 0.005).toFixed(3));
      steps++;
    }
    const worst = floors.map(([g, f]) => ratio(c, g) / f).sort((a, b) => a - b)[0];
    if (record && worst < 1) failures.push(`${name} could not clear its floor by lifting: ceiling L ${c[0].toFixed(3)}, worst ${floors.map(([g, f]) => ratio(c, g).toFixed(2) + ':1 vs ' + f).join(' ')}`);
    return steps;
  };
  const inkSteps = lift(ink, [[bg, 4.6], [surface, 4.6]], '--ink', false);
  if (inkSteps) notes.push(`${tag}ink lifted L ${inkL0.toFixed(3)} -> ${ink[0].toFixed(3)} to clear 4.5:1 on both grounds`);
  // A surface the ink cannot sit on is not a surface. When the sampled band
  // lands between bg and ink, pull it back toward bg until the ink clears.
  if (ratio(ink, surface) < 4.6) {
    const from = surface[0];
    const step = bg[0] > surface[0] ? 0.005 : -0.005;
    let guard = 0;
    while (ratio(ink, surface) < 4.6 && guard++ < 220 && Math.abs(surface[0] - bg[0]) > 0.005) {
      surface[0] = Number((surface[0] + step).toFixed(3));
    }
    notes.push(`${tag}SURFACE_PULLED --surface L ${from.toFixed(3)} -> ${surface[0].toFixed(3)} toward --bg so --ink clears 4.5:1 on it (the sampled band sat between --bg and --ink)`);
    lift(ink, [[bg, 4.6], [surface, 4.6]], '--ink');
  } else {
    lift(ink, [[bg, 4.6], [surface, 4.6]], '--ink');
  }
  const accentL0 = accent[0];
  const accSteps = lift(accent, [[bg, 3.05]], '--accent');
  if (accSteps) notes.push(`${tag}accent lifted L ${accentL0.toFixed(3)} -> ${accent[0].toFixed(3)} to clear 3:1 on --bg`);
  const muted = [Number((bg[0] + (ink[0] - bg[0]) * 0.62).toFixed(3)), Math.min(0.045, ink[1]), ink[2]];
  const mutedL0 = muted[0];
  const mutedSteps = lift(muted, [[bg, 4.6], [surface, 4.6]], '--muted');
  if (mutedSteps) notes.push(`${tag}muted lifted L ${mutedL0.toFixed(3)} -> ${muted[0].toFixed(3)} to clear 4.5:1 on --bg and --surface`);

  return { roles: { bg, surface, ink, accent, muted }, failures, lightTheme };
}

// the largest run of dark, even cells; type sits there, no scrim. On a light
// plate the criterion inverts: the largest run of bright, even cells.
function safeBox(pts, lightTheme) {
  const GX = 32, GY = 20, cells = [];
  const bins = Array.from({ length: GX * GY }, () => []);
  for (const p of pts) {
    const gx = Math.min(GX - 1, Math.floor(p[3] * GX));
    const gy = Math.min(GY - 1, Math.floor(p[4] * GY));
    bins[gy * GX + gx].push(p[0]);
  }
  for (const g of bins) {
    if (!g.length) { cells.push(0); continue; }
    const mL = g.reduce((s, v) => s + v, 0) / g.length;
    const sd = Math.sqrt(g.reduce((s, v) => s + (v - mL) ** 2, 0) / g.length);
    cells.push((lightTheme ? mL > 0.80 : mL < 0.30) && sd < 0.055 ? 1 : 0);
  }
  let best = { area: 0, x: 0, y: 0, w: 0, h: 0 };
  const heights = new Array(GX).fill(0);
  for (let gy = 0; gy < GY; gy++) {
    for (let gx = 0; gx < GX; gx++) heights[gx] = cells[gy * GX + gx] ? heights[gx] + 1 : 0;
    for (let l = 0; l < GX; l++) {
      let minH = Infinity;
      for (let r = l; r < GX; r++) {
        minH = Math.min(minH, heights[r]);
        const area = minH * (r - l + 1);
        if (area > best.area) best = { area, x: l, y: gy - minH + 1, w: r - l + 1, h: minH };
      }
    }
  }
  return {
    x: Number((best.x / GX * 100).toFixed(1)), y: Number((best.y / GY * 100).toFixed(1)),
    w: Number((best.w / GX * 100).toFixed(1)), h: Number((best.h / GY * 100).toFixed(1)),
    cells: best.area,
  };
}

export function sampleRoles(pngPath) {
  const buf = fs.readFileSync(pngPath);
  const meta = readText(buf);
  const img = decodePNG(buf);
  const pts = [];
  for (let y = 0; y < img.h; y += 3) {
    for (let x = 0; x < img.w; x += 3) {
      const i = (y * img.w + x) * img.ch;
      const c = oklab(img.px[i], img.px[i + 1], img.px[i + 2]);
      pts.push([c[0], c[1], c[2], x / img.w, y / img.h]);
    }
  }
  const byL = pts.slice().sort((a, b) => a[0] - b[0]);
  const notes = [];
  // A high-key plate (median luminance at or above 0.5) is read with the light bands:
  // bg from the bright ground, ink from the deepest shadow. The dark bands on a light
  // plate put ink above bg and no lift can clear the floor.
  const highKey = byL[Math.floor(byL.length / 2)][0] >= 0.5;
  if (highKey) { notes.push('HIGH_KEY median L at or above 0.5: sampled with the light bands (bg p85 to p95, surface p72 to p85, ink p04 to p12)'); BAND_NOTE = BAND_NOTE_LIGHT; }
  const base = rolesFrom(pts, byL, highKey ? BANDS.light : BANDS.base, notes, '');

  // the lamp: centroid of the top 2 percent luminance cells
  const top = byL.slice(Math.floor(byL.length * 0.98));
  const sx = top.reduce((s, p) => s + p[3], 0) / top.length;
  const sy = top.reduce((s, p) => s + p[4], 0) / top.length;
  // key-angle points from the centre of the frame to the lamp; every shadow is
  // cast along key-angle + 180deg (references/light.md section 2)
  const keyAngle = Math.round(((Math.atan2(sy - 0.5, sx - 0.5) * 180 / Math.PI) + 360) % 360);

  const litText = meta.lit !== undefined && meta.lit !== '' ? Number(meta.lit) : null;
  const measuredLit = pts.filter((p) => p[0] >= 0.35).length / pts.length;
  const lit = Number((litText === null || Number.isNaN(litText) ? measuredLit : litText).toFixed(3));
  const falloff = lit <= 0.2 ? 3.0 : lit <= 0.5 ? 2.2 : 1.4;

  return {
    file: pngPath,
    sampled: pts.length,
    size: { w: img.w, h: img.h },
    provider: meta.provider || 'unknown',
    title: meta.title || '',
    theme: base.lightTheme ? 'light' : 'dark',
    roles: base.roles,
    notes,
    failures: base.failures,
    box: safeBox(pts, base.lightTheme),
    kit: {
      'source-x': Number((sx * 100).toFixed(1)),
      'source-y': Number((sy * 100).toFixed(1)),
      'key-angle': keyAngle,
      falloff,
      lit,
      grain: lit <= 0.3 ? 0.055 : 0,
      litSource: litText === null || Number.isNaN(litText) ? 'measured' : 'tEXt',
    },
    twin(kind) {
      const n = [];
      const t = rolesFrom(pts, byL, BANDS[kind], n, kind + '-twin ');
      return { kind, roles: t.roles, notes: n, failures: t.failures };
    },
    pts, byL,
  };
}

const ROLE_RE = (role) => new RegExp(`--${role}\\s*:\\s*oklch\\(\\s*([\\d.]+%?)\\s+([\\d.]+)\\s+([\\d.]+)[^;]*;([^\\n]*)`);

export function checkDrift(pngPath, tokensCssText) {
  const s = sampleRoles(pngPath);
  const out = [];
  for (const role of ['bg', 'surface', 'ink', 'accent', 'muted']) {
    const m = tokensCssText.match(ROLE_RE(role));
    if (!m) { out.push({ role, dL: null, dC: null, dh: null, drift: true, reason: 'not declared' }); continue; }
    const L = m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
    const cur = [L, parseFloat(m[2]), parseFloat(m[3])];
    const want = s.roles[role];
    const dL = Number(Math.abs(cur[0] - want[0]).toFixed(4));
    const dC = Number(Math.abs(cur[1] - want[1]).toFixed(4));
    const dh = Number(dHue(cur[2], want[2]).toFixed(1));
    const override = /\/\*\s*override:/.test(m[4] || '');
    const over = dL > DRIFT.dL || dC > DRIFT.dC || dh > DRIFT.dh;
    out.push({ role, dL, dC, dh, drift: over && !override, override, sampled: r3(want), declared: r3(cur) });
  }
  return out;
}

// ---------------------------------------------------------------- cli
const argv = process.argv.slice(2);
if (process.argv[1] && process.argv[1].endsWith('plate-tokens.mjs')) {
  const flagVal = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
  const positional = [];
  for (let n = 0; n < argv.length; n++) {
    if (['--fold', '--register', '--title'].includes(argv[n])) { n++; continue; }
    if (!argv[n].startsWith('--')) positional.push(argv[n]);
  }
  const file = positional[0];
  const outCss = positional[1] || 'tokens.css';
  if (!file) {
    console.error('usage: plate-tokens.mjs <plate.png> <tokens.css> [--fold <key>] [--register brand|product] [--twin] [--check] [--json] [--title "..."]');
    process.exit(2);
  }
  let s;
  try { s = sampleRoles(file); }
  catch (e) { console.error('REJECTED ' + file + ': ' + e.message); process.exit(3); }

  if (argv.includes('--check')) {
    if (!fs.existsSync(outCss)) { console.error('REJECTED no token file at ' + outCss); process.exit(3); }
    const rows = checkDrift(file, fs.readFileSync(outCss, 'utf8'));
    const bad = rows.filter((r) => r.drift);
    if (argv.includes('--json')) console.log(JSON.stringify(rows, null, 2));
    else {
      console.log(`${bad.length ? 'FAIL' : 'PASS'} ${outCss} vs ${file}: roles=${rows.length} drift=${bad.length} tolerance dL ${DRIFT.dL} dC ${DRIFT.dC} dh ${DRIFT.dh}`);
      for (const r of rows) {
        console.log(`  --${r.role.padEnd(8)} dL ${r.dL === null ? 'n/a' : r.dL.toFixed(3)} dC ${r.dC === null ? 'n/a' : r.dC.toFixed(3)} dh ${r.dh === null ? 'n/a' : String(r.dh).padStart(4)}  ${r.drift ? 'plate-drift' : r.override ? 'override' : 'within'}  declared ${r.declared ? r.declared.join(' ') : '-'} sampled ${r.sampled ? r.sampled.join(' ') : '-'}`);
      }
    }
    process.exit(bad.length ? 1 : 0);
  }

  const fold = flagVal('--fold');
  const register = flagVal('--register') || 'product';
  const title = flagVal('--title') || s.title || s.file;
  const twin = argv.includes('--twin') ? (s.theme === 'light' ? 'dark' : 'light') : null;
  const t = twin ? s.twin(twin) : null;
  const R = s.roles;
  const pad = (k) => ('--' + k + ':').padEnd(14);
  const line = (k, c, note) => '  ' + pad(k) + ' ' + okl(c) + '; /* ' + note + ' */';

  const css = [
    `/* Foldlight: ${title} */`,
    `/* fold: ${fold || 'none'} */`,
    `/* plate: ${s.file} provider=${s.provider} */`,
    ':root {',
    line('bg', R.bg, BAND_NOTE.bg),
    line('surface', R.surface, BAND_NOTE.surface),
    line('ink', R.ink, BAND_NOTE.ink),
    line('accent', R.accent, BAND_NOTE.accent),
    line('muted', R.muted, BAND_NOTE.muted),
    '',
    `  ${pad('source-x')} ${s.kit['source-x']}%;`,
    `  ${pad('source-y')} ${s.kit['source-y']}%;`,
    `  ${pad('key-angle')} ${s.kit['key-angle']}deg; /* every shadow falls along key-angle + 180deg */`,
    `  ${pad('falloff')} ${s.kit.falloff};`,
    `  ${pad('lit')} ${s.kit.lit};`,
    `  ${pad('grain')} ${s.kit.grain};`,
    `  ${pad('plate-safe')} ${s.box.x}% ${s.box.y}% ${s.box.w}% ${s.box.h}%; /* type goes here, no scrim */`,
    '}',
  ];
  if (t) {
    css.push('', `[data-theme="${t.kind}"] {`,
      line('bg', t.roles.bg, `${t.kind} twin, plate luminance ${t.kind === 'light' ? 'p85 to p95' : 'p02 to p10'}`),
      line('surface', t.roles.surface, `${t.kind} twin, plate luminance ${t.kind === 'light' ? 'p72 to p85' : 'p10 to p25'}`),
      line('ink', t.roles.ink, `${t.kind} twin, ${t.kind === 'light' ? 'p04 to p12' : 'p90 and up'}`),
      line('accent', t.roles.accent, `${t.kind} twin, top 1 percent chroma`),
      line('muted', t.roles.muted, `${t.kind} twin, 62 percent of the way from bg to ink`),
      '}');
  }
  css.push('');
  fs.writeFileSync(outCss, css.join('\n'));

  const floors = [
    ['ink/bg', ratio(R.ink, R.bg), 4.5], ['ink/surface', ratio(R.ink, R.surface), 4.5],
    ['accent/bg', ratio(R.accent, R.bg), 3.0], ['muted/bg', ratio(R.muted, R.bg), 4.5],
    ['muted/surface', ratio(R.muted, R.surface), 4.5],
  ];
  const failures = [...s.failures, ...(t ? t.failures : [])];
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ file: s.file, sampled: s.sampled, theme: s.theme, provider: s.provider, roles: Object.fromEntries(Object.entries(R).map(([k, v]) => [k, r3(v)])), kit: s.kit, box: s.box, notes: s.notes, contrast: Object.fromEntries(floors.map(([n, r]) => [n, Number(r.toFixed(2))])), failures }, null, 2));
  } else {
    console.log(`${failures.length ? 'FAIL' : 'PASS'} PLATE-TOKENS ${s.file}: sampled=${s.sampled}px of ${s.size.w}x${s.size.h} roles=5 theme=${s.theme} provider=${s.provider} register=${register} fold=${fold || 'none'} findings=${failures.length}`);
    for (const k of ['bg', 'surface', 'ink', 'accent', 'muted']) {
      console.log(`  --${k.padEnd(8)} ${okl(R[k]).padEnd(26)} ${BAND_NOTE[k]}`);
    }
    for (const [name, r, floor] of floors) {
      console.log(`  contrast ${name.padEnd(14)} ${r.toFixed(2)}:1   floor ${floor.toFixed(1)}:1   ${r >= floor ? 'OK' : 'UNDER'}`);
    }
    console.log(`  clamps   ${s.notes.length} applied`);
    for (const n of s.notes) console.log('    - ' + n);
    console.log(`  safe box x${s.box.x}% y${s.box.y}% w${s.box.w}% h${s.box.h}%  (${s.box.cells} of 640 grid cells, ${s.theme === 'light' ? 'mean L over 0.80' : 'mean L under 0.30'}, sd under 0.055)`);
    console.log(`  key      --source-x ${s.kit['source-x']}% --source-y ${s.kit['source-y']}% --key-angle ${s.kit['key-angle']}deg --falloff ${s.kit.falloff} --lit ${s.kit.lit} (${s.kit.litSource}) --grain ${s.kit.grain}`);
    if (t) {
      console.log(`  twin     [data-theme="${t.kind}"] ${['bg', 'surface', 'ink', 'accent', 'muted'].map((k) => okl(t.roles[k])).join(' ')}`);
      for (const n of t.notes) console.log('    - ' + n);
    }
    for (const f of failures) console.log('  - ' + f);
    console.log(`  wrote    ${outCss} (roles=5 kit=7 twin=${t ? t.kind : 'no'} lines=${css.length})`);
  }
  process.exit(failures.length ? 1 : 0);
}
