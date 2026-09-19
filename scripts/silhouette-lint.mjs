#!/usr/bin/env node
// silhouette-lint.mjs - judge a page by the shape of its blob map, not by its prose.
//
//   node silhouette-lint.mjs <screenshot.png>                          the two template detectors
//   node silhouette-lint.mjs <screenshot.png> --fold ledger            plus the declared fold's envelope
//   node silhouette-lint.mjs <mobile.png> --fold ledger --viewport 390x844
//   node silhouette-lint.mjs <screenshot.png> --map                    the 200-wide ASCII map
//   node silhouette-lint.mjs <screenshot.png> --json
//
// Decodes the PNG with node:zlib only (no dependencies) and reduces it to three
// 200-cell-wide maps by max pooling:
//   FILL   cell differs from the page ground        (panels, bands, bars, images)
//   DETAIL cell has internal contrast               (type, rules, edges: actual content)
//   EDGE   cell has a horizontal luminance step     (card boundaries, sidebars)
// A uniform panel is FILL without DETAIL, which is why a half-empty page with a
// full-bleed background used to score as full. Content metrics read DETAIL; structural
// metrics read FILL.
//
// Rejects the two folds every generated page lands on, SAAS_FOLD and AWWWARDS_FOLD,
// and with --fold checks the declared fold's envelope from the atlas, so a page cannot
// declare "ledger" and ship a card grid. A narrow viewport (--viewport 390x844) moves the
// hero band to the first 844 rows and relaxes every symmetry ceiling by 0.1, because one
// column at 390 is narrower than the page.
//
// Exit 0 pass, 1 fail, 2 usage.

import fs from 'node:fs';
import zlib from 'node:zlib';
import { ATLAS } from './fold.mjs';

const W = 200;
const INK = 28;       // 8-bit distance from ground that counts as fill
const DET = 26;       // 8-bit range inside one cell that counts as detail
const EDG = 14;       // 8-bit horizontal step inside one cell that counts as a vertical edge
const ROW_MIN = 0.01;
const NARROW_RELAX = 0.1;   // symmetry ceilings at 390: one column is narrower than a page
const NARROW_WAIVE = new Set(['rightCol', 'vRules']);   // side columns and their rules collapse at 390

/* ---------- PNG decode (depth 8, color types 0/2/3/4/6, non-interlaced) ---------- */
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8; const idat = []; let ihdr = null; let plte = null;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'PLTE') plte = data;
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (!ihdr) throw new Error('no IHDR');
  if (ihdr.depth !== 8 || ihdr.interlace !== 0) throw new Error(`unsupported PNG: depth ${ihdr.depth}, interlace ${ihdr.interlace}`);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.color];
  if (!ch) throw new Error(`unsupported color type ${ihdr.color}`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { w, h } = ihdr; const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[p++];
    const line = raw.subarray(p, p + stride); p += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[i] = v & 255;
    }
  }
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, n = w * h; i < n; i++) {
    let r, g, b;
    if (ihdr.color === 3) { const j = out[i] * 3; r = plte[j]; g = plte[j + 1]; b = plte[j + 2]; }
    else if (ihdr.color === 0) { r = g = b = out[i]; }
    else if (ihdr.color === 4) { r = g = b = out[i * 2]; }
    else { const j = i * ch; r = out[j]; g = out[j + 1]; b = out[j + 2]; }
    rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
  }
  return { w, h, rgb };
}

/* ---------- the three maps ---------- */
function blobMaps({ w, h, rgb }) {
  const hist = new Map();
  for (let i = 0, n = w * h; i < n; i++) {
    const k = ((rgb[i * 3] >> 4) << 8) | ((rgb[i * 3 + 1] >> 4) << 4) | (rgb[i * 3 + 2] >> 4);
    hist.set(k, (hist.get(k) || 0) + 1);
  }
  let best = 0, bk = 0;
  for (const [k, v] of hist) if (v > best) { best = v; bk = k; }
  let sr = 0, sg = 0, sb = 0, c = 0;
  for (let i = 0, n = w * h; i < n; i++) {
    const k = ((rgb[i * 3] >> 4) << 8) | ((rgb[i * 3 + 1] >> 4) << 4) | (rgb[i * 3 + 2] >> 4);
    if (k === bk) { sr += rgb[i * 3]; sg += rgb[i * 3 + 1]; sb += rgb[i * 3 + 2]; c++; }
  }
  const ground = [sr / c, sg / c, sb / c];
  const scale = w / W;
  const H = Math.max(1, Math.round(h / scale));
  const fill = new Uint8Array(W * H), detail = new Uint8Array(W * H), edge = new Uint8Array(W * H);
  for (let oy = 0; oy < H; oy++) {
    const y0 = Math.floor(oy * scale), y1 = Math.min(h, Math.max(y0 + 1, Math.floor((oy + 1) * scale)));
    for (let ox = 0; ox < W; ox++) {
      const x0 = Math.floor(ox * scale), x1 = Math.min(w, Math.max(x0 + 1, Math.floor((ox + 1) * scale)));
      let mx = 0, lo = 255, hi = 0, gx = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const i = (y * w + x) * 3;
        const d = Math.max(Math.abs(rgb[i] - ground[0]), Math.abs(rgb[i + 1] - ground[1]), Math.abs(rgb[i + 2] - ground[2]));
        if (d > mx) mx = d;
        const L = (rgb[i] * 299 + rgb[i + 1] * 587 + rgb[i + 2] * 114) / 1000;
        if (L < lo) lo = L; if (L > hi) hi = L;
        if (x + 1 < w) { const k = (y * w + x + 1) * 3; const L2 = (rgb[k] * 299 + rgb[k + 1] * 587 + rgb[k + 2] * 114) / 1000; const g = Math.abs(L2 - L); if (g > gx) gx = g; }
      }
      const j = oy * W + ox;
      fill[j] = mx > INK ? 1 : 0;
      detail[j] = (hi - lo) > DET ? 1 : 0;
      edge[j] = gx > EDG ? 1 : 0;
    }
  }
  return { fill, detail, edge, H, ground: ground.map(Math.round), groundShare: best / (w * h) };
}

/* ---------- row and column profiles ---------- */
function profile(map, H) {
  const ink = [], left = [], right = [], maxRun = [], runs = [];
  for (let y = 0; y < H; y++) {
    let n = 0, l = -1, r = -1, s = -1, best = 0; const rr = [];
    for (let x = 0; x <= W; x++) {
      const on = x < W && map[y * W + x];
      if (on) { n++; if (l < 0) l = x; r = x; if (s < 0) s = x; }
      else if (s >= 0) { const len = x - s; rr.push([s, len]); if (len > best) best = len; s = -1; }
    }
    ink.push(n / W); left.push(l); right.push(r); maxRun.push(best / W); runs.push(rr);
  }
  const inked = []; for (let y = 0; y < H; y++) if (ink[y] >= ROW_MIN) inked.push(y);
  const colHit = [];
  for (let x = 0; x < W; x++) { let n = 0; for (const y of inked) if (map[y * W + x]) n++; colHit.push(inked.length ? n / inked.length : 0); }
  return { ink, left, right, maxRun, runs, inked, colHit };
}

function measure(detail, fill, edge, H, foldRows) {
  const D0 = profile(detail, H), F = profile(fill, H);

  // continuous vertical rules: narrow columns present on most inked rows
  let vRules = 0; const ruleCols = [];
  {
    const lo0 = Math.round(W * 0.04), hi0 = Math.round(W * 0.96);
    for (let x = lo0; x < hi0;) {
      if (D0.colHit[x] < 0.6) { x++; continue; }
      let e = x; while (e < hi0 && D0.colHit[e] >= 0.6) e++;
      if (e - x <= 4 && (x === lo0 || D0.colHit[x - 1] < 0.4) && (e >= hi0 || D0.colHit[e] < 0.4)) { vRules++; for (let k = x - 1; k <= e; k++) ruleCols.push(k); }
      x = e;
    }
  }
  // page furniture is not row content: a ruled column is removed before rows are measured
  const content = Uint8Array.from(detail);
  for (let y = 0; y < H; y++) for (const x of ruleCols) if (x >= 0 && x < W) content[y * W + x] = 0;
  const D = profile(content, H);
  const inked = D.inked;
  const ink = D.ink.reduce((a, b) => a + b, 0) / H;

  const iou = (rows, map) => {
    let i = 0, u = 0;
    for (const y of rows) for (let x = 0; x < W; x++) { const a = map[y * W + x], b = map[y * W + (W - 1 - x)]; if (a && b) i++; if (a || b) u++; }
    return u ? i / u : 0;
  };
  const foldRowList = Array.from({ length: foldRows }, (_, i) => i);
  const heroRows = Array.from({ length: Math.max(4, Math.round(foldRows * 0.55)) }, (_, i) => i);
  const symmetry = iou(foldRowList, content);
  const heroSymmetry = iou(heroRows, fill);
  let hc = 0; for (const y of heroRows) for (let x = 0; x < W; x++) if (fill[y * W + x]) hc++;
  const heroInk = hc / (heroRows.length * W);
  let fc = 0; for (const y of foldRowList) for (let x = 0; x < W; x++) if (content[y * W + x]) fc++;
  const foldInk = fc / (foldRows * W);

  // thin full-measure rules on the detail map: runs of wide rows no more than 2 cells tall
  const wide = new Array(H).fill(0);
  for (let y = 0; y < H; y++) wide[y] = (D.maxRun[y] >= 0.55 || (D.ink[y] >= 0.30 && (D.right[y] - D.left[y] + 1) / W >= 0.7)) ? 1 : 0;
  let ruleRows = 0; const isRule = new Array(H).fill(0);
  for (let y = 0; y < H;) {
    if (!wide[y]) { y++; continue; }
    let e = y; while (e < H && wide[e]) e++;
    if (e - y <= 2) { ruleRows++; for (let k = y; k < e; k++) isRule[k] = 1; }
    y = e;
  }

  // a band is a thick full-measure mass, never a hairline
  const bandRows = inked.filter((y) => !isRule[y]);
  const band = bandRows.filter((y) => F.maxRun[y] >= 0.85).length;
  const bandRatio = bandRows.length ? band / bandRows.length : 0;

  const lo = Math.round(W * 0.04), hi = Math.round(W * 0.96);
  let gutters = 0;
  for (let x = lo; x < hi; x++) if (D.colHit[x] < 0.04 && D.colHit[x - 1] >= 0.04) {
    let e = x; while (e < hi && D.colHit[e] < 0.04) e++;
    if (e - x >= 2) gutters++;
    x = e;
  }

  const bucket = new Map();
  for (const y of inked) { const b = Math.round(D.left[y] / (W * 0.03)); bucket.set(b, (bucket.get(b) || 0) + 1); }
  const leftFlush = inked.length ? Math.max(0, ...bucket.values()) / inked.length : 0;

  const xs = inked.map((y) => D.left[y]).filter((v) => v >= 0);
  const x0 = xs.length ? Math.min(...xs) : 0;
  const x1 = inked.length ? Math.max(...inked.map((y) => D.right[y])) : 0;
  const rStart = Math.floor(x1 - (x1 - x0) * 0.15);
  let rHits = 0;
  for (const y of inked) for (let x = rStart; x <= x1; x++) if (content[y * W + x]) { rHits++; break; }
  const rightCol = inked.length ? rHits / inked.length : 0;
  const maxInkWidth = (x1 - x0 + 1) / W;

  // repeated equal blocks in one row: cards. Read from the vertical-edge map, because a
  // card grid is a row of evenly spaced vertical boundaries whatever its fill colour is.
  let cardRepeat = 0;
  for (let y = 0; y < H; y++) {
    const cols = []; for (let x = 0; x < W; x++) if (edge[y * W + x]) { if (!cols.length || x - cols[cols.length - 1] > 1) cols.push(x); }
    if (cols.length < 4) continue;
    const gaps = []; for (let i = 1; i < cols.length; i++) gaps.push(cols[i] - cols[i - 1]);
    for (const g of gaps) {
      if (g < W * 0.10) continue;
      const like = gaps.filter((o) => Math.abs(o - g) <= g * 0.15).length;
      if (like + 1 > cardRepeat) cardRepeat = like + 1;
    }
  }

  let moved = 0;
  for (let i = 1; i < inked.length; i++) if (Math.abs(D.left[inked[i]] - D.left[inked[i - 1]]) > W * 0.02) moved++;
  const stagger = inked.length > 1 ? moved / (inked.length - 1) : 0;

  let dead = 0; for (let y = H - 1; y >= 0 && D.ink[y] < 0.005; y--) dead++;
  const deadBottom = dead / H;

  // an empty lower right: the page stopped but the background kept going
  let q = 0, qn = 0;
  for (let y = Math.round(H * 0.62); y < H; y++) for (let x = Math.round(W * 0.35); x < W; x++) { qn++; if (!detail[y * W + x]) q++; }
  const deadQuad = qn ? q / qn : 0;

  // full-measure fill band in the top 9% of the fold: the nav bar
  const topRows = Math.max(1, Math.round(foldRows * 0.09));
  let topBand = 0;
  for (let y = 0; y < topRows; y++) if (!isRule[y]) topBand = Math.max(topBand, F.maxRun[y]);

  // the sidebar: a full-height vertical division near the left edge with sparse content behind it
  let sidebar = 0;
  let totalDetail = 0; for (let i = 0; i < W * H; i++) totalDetail += content[i];
  for (let x = Math.round(W * 0.06); x < W * 0.30; x++) {
    let e = 0; for (let y = 0; y < H; y++) if (edge[y * W + x]) e++;
    if (e / H < 0.7) continue;
    let leftDetail = 0; for (let y = 0; y < H; y++) for (let k = 0; k < x; k++) leftDetail += content[y * W + k];
    if (totalDetail && leftDetail / totalDetail < 0.25) sidebar = Math.max(sidebar, x / W);
  }

  // a centred display line is one contiguous mass, not a row that happens to reach both margins
  let heroRow = 0;
  for (let y = 0; y < Math.round(foldRows / 3); y++) for (const [s0, len] of D.runs[y]) {
    const cx = (s0 + len / 2) / W;
    if (Math.abs(cx - 0.5) < 0.06 && len / W > heroRow) heroRow = len / W;
  }
  const heroTop = Math.max(4, Math.round(foldRows * 0.55));
  let axisN = 0, axisC = 0;
  for (const y of inked) {
    if (y >= heroTop || isRule[y]) continue;
    const span = (D.right[y] - D.left[y] + 1) / W;
    if (span > 0.75) continue;
    axisN++;
    if (Math.abs((D.left[y] + D.right[y]) / 2 / W - 0.5) < 0.06) axisC++;
  }
  const axisCentered = axisN ? axisC / axisN : 0;

  const lowBand = inked.length ? inked.filter((y) => y > H * 0.55).length / inked.length : 0;
  const edgeBleed = maxInkWidth;

  return { H, inkedRows: inked.length, ink, foldInk, heroInk, symmetry, heroSymmetry, axisCentered, bandRatio, ruleRows, vRules, gutters, leftFlush, rightCol, maxInkWidth, cardRepeat, stagger, deadBottom, deadQuad, topBand, sidebar, heroRow, lowBand, edgeBleed };
}

function detect(m) {
  const saas = [
    ['a full-height division with sparse content behind it', m.sidebar > 0 && m.vRules <= 1],
    ['three or more equal blocks in one row', m.cardRepeat >= 3],
    ['stacked full-measure bands', m.bandRatio >= 0.45],
    ['no continuous ruled column anywhere', m.vRules === 0],
    ['one container edge (leftFlush >= 0.55)', m.leftFlush >= 0.55],
    ['an empty lower right (deadQuad >= 0.85)', m.deadQuad >= 0.85],
  ];
  const aww = [
    ['mirror-symmetric fold (heroSymmetry >= 0.62)', m.heroSymmetry >= 0.62],
    ['near-empty fold (heroInk <= 0.16)', m.heroInk <= 0.16],
    ['full-measure top bar', m.topBand >= 0.80],
    ['the fold is pinned to the centre axis (axisCentered >= 0.60)', m.axisCentered >= 0.60],
  ];
  return { saas: saas.filter(([, v]) => v), saasN: saas.length, aww: aww.filter(([, v]) => v), awwN: aww.length };
}

const OPS = { '>=': (a, b) => a >= b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '<': (a, b) => a < b };
const SYMMETRY_METRICS = new Set(['symmetry', 'heroSymmetry']);

// Every metric measure() returns. An atlas envelope may only name one of these, which is
// what scripts/selftest.mjs asserts against the twelve envelopes in fold.mjs.
export const METRICS = ['ink', 'foldInk', 'heroInk', 'symmetry', 'heroSymmetry', 'axisCentered', 'bandRatio', 'ruleRows', 'vRules', 'gutters', 'leftFlush', 'rightCol', 'maxInkWidth', 'cardRepeat', 'stagger', 'deadBottom', 'deadQuad', 'topBand', 'sidebar', 'heroRow', 'lowBand', 'edgeBleed'];

const isMain = Boolean(process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('silhouette-lint.mjs'));
if (isMain) main();

function main() {
const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : undefined; };
const flagVals = new Set([arg('fold'), arg('viewport')]);
const file = argv.find((a) => !a.startsWith('--') && !flagVals.has(a));
if (!file || !fs.existsSync(file)) {
  console.error('usage: silhouette-lint.mjs <screenshot.png> [--fold <key>] [--viewport 1440x900|390x844] [--map] [--json]');
  process.exit(2);
}
const viewport = arg('viewport') || '1440x900';
const [vw, vh] = viewport.split('x').map(Number);
if (!vw || !vh) {
  console.error(`usage: --viewport takes <width>x<height> (got "${viewport}")`);
  process.exit(2);
}
const relax = vw <= 500 ? NARROW_RELAX : 0;
const img = decodePng(fs.readFileSync(file));
const { fill, detail, edge, H, ground, groundShare } = blobMaps(img);
const foldRows = Math.max(4, Math.min(H, Math.round((vh / vw) * W)));
const m = measure(detail, fill, edge, H, foldRows);
const d = detect(m);

const findings = [];
if (d.saas.length >= 3) findings.push(`SAAS_FOLD: ${d.saas.length} of ${d.saasN} shape conditions met (${d.saas.map(([t]) => t).join('; ')}). This is the admin template. Rebuild the composition from the document row.`);
if (d.aww.length >= 3) findings.push(`AWWWARDS_FOLD: ${d.aww.length} of ${d.awwN} shape conditions met (${d.aww.map(([t]) => t).join('; ')}). This is the premium template. Rebuild the composition from the document row.`);
if (m.deadBottom >= 0.12) findings.push(`DEAD_BOTTOM: the last ${(m.deadBottom * 100).toFixed(0)}% of the page carries no content. The page stopped before the page ended.`);

const foldKey = arg('fold');
let checked = 0;
const waived = [];
if (foldKey) {
  const f = ATLAS[foldKey];
  if (!f) { console.error(`unknown fold "${foldKey}". node fold.mjs --list`); process.exit(2); }
  for (const [metric, [op, want0]] of Object.entries(f.envelope)) {
    const got = m[metric];
    if (got === undefined) continue;
    // One column at 390 legitimately collapses a fold's side columns and rules; the
    // shape is judged on band ratio, rule rows and symmetry there.
    if (relax && NARROW_WAIVE.has(metric)) { waived.push(metric); continue; }
    const want = (relax && op === '<=' && SYMMETRY_METRICS.has(metric)) ? want0 + relax : want0;
    checked++;
    if (!OPS[op](got, want)) findings.push(`ENVELOPE ${foldKey}.${metric}: ${got.toFixed(3)} fails ${op} ${want}${want === want0 ? '' : ` (relaxed +${relax} at ${viewport})`}. The page declares ${foldKey} and does not have its shape.`);
  }
}

const num = (v) => (typeof v === 'number' ? v.toFixed(3) : String(v));
const keys = ['symmetry', 'heroSymmetry', 'axisCentered', 'heroInk', 'foldInk', 'bandRatio', 'ruleRows', 'vRules', 'gutters', 'leftFlush', 'rightCol', 'maxInkWidth', 'cardRepeat', 'stagger', 'deadBottom', 'deadQuad', 'topBand', 'sidebar', 'heroRow'];
if (argv.includes('--json')) {
  console.log(JSON.stringify({ file, pass: !findings.length, fold: foldKey || null, viewport, foldRows, envelopeChecked: checked, metrics: m, findings }, null, 2));
} else {
  console.log(`${findings.length ? 'FAIL' : 'PASS'} ${file}: cells=${W}x${H} viewport=${viewport} foldRows=${foldRows} inkedRows=${m.inkedRows} ground=rgb(${ground.join(',')}) ${(groundShare * 100).toFixed(0)}% envelope=${checked}${waived.length ? ` waived=${waived.join(',')}` : ''} fold=${foldKey || 'none'} findings=${findings.length}`);
  console.log('  ' + keys.map((k) => `${k}=${num(m[k])}`).join(' '));
  console.log(`  SAAS_FOLD ${d.saas.length}/${d.saasN}  AWWWARDS_FOLD ${d.aww.length}/${d.awwN}`);
  for (const f of findings) console.log('  - ' + f);
  if (argv.includes('--map')) {
    const step = Math.max(1, Math.round(H / 56));
    for (let y = 0; y < H; y += step) {
      let s = '';
      for (let x = 0; x < W; x += 2) s += (detail[y * W + x] || detail[y * W + x + 1]) ? '#' : (fill[y * W + x] ? '+' : '.');
      console.log('  ' + s);
    }
  }
}
process.exit(findings.length ? 1 : 0);
}
