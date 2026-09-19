#!/usr/bin/env node
// Make exactly one plate for a moment. The procedural renderer is the default
// and needs no key and no network: it draws the shot record as a light study
// (SVG) and rasterizes it to 1536x1024 with Playwright.
//
//   node plate.mjs <shot.json> <out.png>                        procedural (default)
//   node plate.mjs <shot.json> <out.png> --provider auto        gemini, then openai, then procedural
//   node plate.mjs <shot.json> <out.png> --provider openai      photography, needs a key
//   node plate.mjs <shot.json> <out.png> --provider openai --dry-run   print the request, send nothing
//   node plate.mjs <shot.json> <out.png> --regenerate           overwrite an existing plate
//   node plate.mjs --import <photo> <out.png>                   a real photograph from the client
//
// One plate per moment, forever: the script refuses to overwrite without
// --regenerate. Every plate carries a tEXt chunk `provider=<name>` (plus `lit`,
// `kelvin` and `title` from the shot record) so plate-tokens.mjs can read the
// lamp back out of the file. Keys resolve through creds first and a .env second
// and are never printed.
//
// Exit 0 = written, 1 = every provider failed, 2 = usage, 3 = refused overwrite
// or Playwright is missing.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const W = 1536, H = 1024;

// playwright may live in the npx cache rather than in node_modules
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require('playwright'); } catch {}
  const cache = path.join(process.env.LOCALAPPDATA || process.env.HOME || '', 'npm-cache', '_npx');
  if (fs.existsSync(cache)) {
    for (const d of fs.readdirSync(cache)) {
      const p = path.join(cache, d, 'node_modules', 'playwright');
      if (fs.existsSync(p)) { try { return require(p); } catch {} }
    }
  }
  const e = new Error('playwright not found: npx --yes playwright install chromium');
  e.code = 3;
  throw e;
}

// ---------------------------------------------------------------- colour
function oklchToHex(L, C, h, a) {
  const A = C * Math.cos(h * Math.PI / 180), B = C * Math.sin(h * Math.PI / 180);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.2914855480 * B, 3);
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  const hex = lin.map((v) => {
    const c = Math.min(1, Math.max(0, v));
    const srgb = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(srgb * 255).toString(16).padStart(2, '0');
  }).join('');
  return a === undefined ? '#' + hex : '#' + hex + Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');
}

// kelvin to the neutral tint hue (references/light.md, translation section 1)
export function kelvinHue(k) {
  if (k <= 2700) return { hue: 60 + 15 * Math.min(1, Math.max(0, (k - 1800) / 900)), neutral: false };
  if (k <= 4000) return { hue: 75 + 15 * (k - 2700) / 1300, neutral: false };
  if (k <= 5500) return { hue: 0, neutral: true };
  return { hue: 230 + 20 * Math.min(1, (k - 5500) / 3000), neutral: false };
}

// clock (1 to 12, as seen from the camera) to the light origin in percent
export const CLOCK_XY = {
  1: [82, 3], 2: [98, 14], 3: [100, 45], 4: [95, 52], 5: [90, 60], 6: [50, 100],
  7: [10, 60], 8: [5, 52], 9: [0, 45], 10: [5, 14], 11: [18, 3], 12: [50, 0],
};
const falloffFor = (lit) => (lit <= 0.2 ? 3.0 : lit <= 0.5 ? 2.2 : 1.4);

// ---------------------------------------------------------------- the light study
export function buildSVG(shot) {
  const lit = Math.min(1, Math.max(0, (shot.litPct ?? 12) / 100));
  const { hue, neutral } = kelvinHue(shot.kelvin ?? 2700);
  const cf = neutral ? 0 : 1;
  const [cxPct, cyPct] = CLOCK_XY[shot.keyClock] || CLOCK_XY[8];
  const cx = (cxPct / 100) * W, cy = (cyPct / 100) * H;
  const r = (0.55 + lit * 0.4) * W;
  const falloff = falloffFor(lit);
  const midAlpha = Math.pow(0.35, falloff / 2.2);

  const ground = oklchToHex(0.10, 0.01 * cf, hue);
  const core = oklchToHex(0.95, 0.045 * cf, hue);
  const warm = oklchToHex(0.80, 0.155 * cf, hue);

  // one specular from the dominant material, on the line from the key to centre
  const ux = (W / 2 - cx), uy = (H / 2 - cy);
  const un = Math.hypot(ux, uy) || 1;
  const sx = cx + (ux / un) * r * 0.6, sy = cy + (uy / un) * r * 0.6;
  const material = String(shot.material || shot.camera?.material || shot.dominantMaterial || 'glazed ceramic').toLowerCase();
  const spec = [];
  if (material.includes('ceramic')) {
    spec.push(`<ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="${(W * 0.04).toFixed(1)}" ry="${(W * 0.012).toFixed(1)}" fill="${warm}" opacity="0.9" filter="url(#soft)"/>`);
  } else if (material.includes('wood')) {
    spec.push(`<rect x="${(sx - W * 0.15).toFixed(1)}" y="${sy.toFixed(1)}" width="${(W * 0.30).toFixed(1)}" height="${(H * 0.035).toFixed(1)}" fill="url(#sheen)" opacity="0.75" transform="rotate(6 ${sx.toFixed(1)} ${sy.toFixed(1)})" filter="url(#soft)"/>`);
  } else if (material.includes('glass')) {
    spec.push(`<ellipse cx="${(sx - W * 0.05).toFixed(1)}" cy="${sy.toFixed(1)}" rx="${(W * 0.02).toFixed(1)}" ry="${(W * 0.01).toFixed(1)}" fill="${warm}" opacity="0.9" filter="url(#soft)"/>`);
    spec.push(`<ellipse cx="${(sx + W * 0.07).toFixed(1)}" cy="${(sy + H * 0.04).toFixed(1)}" rx="${(W * 0.013).toFixed(1)}" ry="${(W * 0.007).toFixed(1)}" fill="${warm}" opacity="0.6" filter="url(#soft)"/>`);
  } else if (material.includes('steel')) {
    spec.push(`<rect x="${(sx - W * 0.12).toFixed(1)}" y="${sy.toFixed(1)}" width="${(W * 0.24).toFixed(1)}" height="${(W * 0.01).toFixed(1)}" fill="${warm}" opacity="0.85" filter="url(#soft)"/>`);
  }
  // wool: no specular at all

  // the fill lights: a row of 2px points behind the key, never a visible prop
  const fills = [];
  const fy = H * 0.74;
  for (let n = 0; n < 26; n++) {
    const fx = W * 0.08 + n * (W * 0.84 / 25);
    fills.push(`<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="1" fill="${core}" opacity="0.02"/>`);
  }

  const grain = shot.grain > 0
    ? `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${shot.grain}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="key" gradientUnits="userSpaceOnUse" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}">
      <stop offset="0%" stop-color="${core}" stop-opacity="1"/>
      <stop offset="35%" stop-color="${warm}" stop-opacity="${midAlpha.toFixed(3)}"/>
      <stop offset="100%" stop-color="${warm}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${warm}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${warm}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${warm}" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${(W * 0.012).toFixed(1)}"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${ground}"/>
  ${fills.join('\n  ')}
  <rect width="${W}" height="${H}" fill="url(#key)"/>
  ${spec.join('\n  ')}
  ${grain}
</svg>`;
}

// ---------------------------------------------------------------- png tEXt
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let n = 0; n < buf.length; n++) c = CRC_TABLE[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
// Insert tEXt chunks straight after IHDR. Reading and writing PNG here uses
// node:zlib and nothing else.
export function stampPNG(buf, entries) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a png');
  const ihdrLen = buf.readUInt32BE(8);
  const at = 8 + 12 + ihdrLen;
  const chunks = Object.entries(entries).map(([k, v]) =>
    chunk('tEXt', Buffer.concat([Buffer.from(k, 'latin1'), Buffer.from([0]), Buffer.from(String(v), 'latin1')])));
  return Buffer.concat([buf.subarray(0, at), ...chunks, buf.subarray(at)]);
}
export function readIHDR(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), depth: buf[24], colorType: buf[25] };
}

async function rasterize(svg) {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#000;width:${W}px;height:${H}px;overflow:hidden}svg{display:block}</style>${svg}`);
    await page.waitForTimeout(250);
    return await page.screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------- keys
// creds first, .env second. The value is returned, never printed.
function resolveKey(name) {
  const creds = process.env.CREDS_CLI || 'C:/Projects/creds/creds.mjs';
  if (fs.existsSync(creds)) {
    try {
      const out = execFileSync(process.execPath, [creds, 'resolve', name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      const line = out.split(/\r?\n/).filter(Boolean).pop() || '';
      if (line && !/not found|unknown|error/i.test(line)) return line;
    } catch {}
  }
  for (const f of ['.env', '.env.local']) {
    if (!fs.existsSync(f)) continue;
    for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
      const i = l.indexOf('=');
      if (i > 0 && l.slice(0, i).trim() === name) return l.slice(i + 1).trim();
    }
  }
  return process.env[name] || '';
}

const PROVIDERS = {
  gemini: {
    key: 'GEMINI_API_KEY',
    shape(shot, key) {
      return {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
        headers: { 'x-goog-api-key': `<GEMINI_API_KEY resolved=${key ? 'yes' : 'no'}, not printed>`, 'content-type': 'application/json' },
        body: {
          contents: [{ parts: [{ text: `${shot.prompt}\n\nDo not include: ${shot.negative}.` }] }],
          generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
        },
      };
    },
    cost: 'about $0.04 per image at published rates (gemini-2.5-flash-image)',
    async send(shape, key) {
      const r = await fetch(shape.url, {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
        body: JSON.stringify(shape.body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { error: `HTTP ${r.status} ${String(j?.error?.message || '').slice(0, 200)}` };
      const part = (j.candidates?.[0]?.content?.parts || []).find((p) => p.inlineData);
      if (!part) return { error: 'no image part; finish=' + j.candidates?.[0]?.finishReason };
      return { png: Buffer.from(part.inlineData.data, 'base64'), usage: j.usageMetadata || {} };
    },
  },
  openai: {
    key: 'OPENAI_API_KEY',
    shape(shot, key) {
      return {
        method: 'POST',
        url: 'https://api.openai.com/v1/images/generations',
        headers: { authorization: `Bearer <OPENAI_API_KEY resolved=${key ? 'yes' : 'no'}, not printed>`, 'content-type': 'application/json' },
        body: { model: 'gpt-image-1', size: '1536x1024', quality: 'high', n: 1, prompt: `${shot.prompt}\n\nDo not include: ${shot.negative}.` },
      };
    },
    cost: 'about $0.25 per plate at published rates (gpt-image-1, high, 1536x1024)',
    async send(shape, key) {
      const r = await fetch(shape.url, {
        method: 'POST',
        headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
        body: JSON.stringify(shape.body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { error: `HTTP ${r.status} ${String(j?.error?.message || '').slice(0, 200)}` };
      const b64 = j.data?.[0]?.b64_json;
      if (!b64) return { error: 'no image in response' };
      return { png: Buffer.from(b64, 'base64'), usage: j.usage || {} };
    },
  },
};

function textOf(shot) {
  const t = {};
  if (shot.litPct !== undefined) t.lit = String(shot.litPct / 100);
  if (shot.kelvin !== undefined) t.kelvin = String(shot.kelvin);
  if (shot.keyClock !== undefined) t['key-clock'] = String(shot.keyClock);
  if (shot.title) t.title = shot.title;
  return t;
}
function write(out, png, provider, shot) {
  const stamped = stampPNG(png, { provider, ...textOf(shot) });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, stamped);
  const d = readIHDR(stamped);
  console.log(`PLATE ${out}: ${d.width}x${d.height} provider=${provider} bytes=${stamped.length} colorType=${d.colorType}`);
  return d;
}

// ---------------------------------------------------------------- cli
const argv = process.argv.slice(2);
if (process.argv[1] && process.argv[1].endsWith('plate.mjs')) {
  const flagVal = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
  const positional = [];
  for (let n = 0; n < argv.length; n++) {
    if (argv[n] === '--provider' || argv[n] === '--import') { n++; continue; }
    if (!argv[n].startsWith('--')) positional.push(argv[n]);
  }
  const imported = flagVal('--import');
  const dryRun = argv.includes('--dry-run');
  const shotFile = imported ? undefined : positional[0];
  const out = imported ? positional[0] : positional[1];
  if (!out || (!imported && !shotFile)) {
    console.error('usage: plate.mjs <shot.json> <out.png> [--provider auto|procedural|gemini|openai] [--regenerate] [--dry-run]');
    console.error('       plate.mjs --import <photo> <out.png>');
    process.exit(2);
  }
  if (fs.existsSync(out) && !argv.includes('--regenerate')) {
    console.error(`REFUSED ${out} already exists. One plate per moment, forever. Pass --regenerate to overwrite it.`);
    process.exit(3);
  }

  if (imported) {
    if (!fs.existsSync(imported)) { console.error('REJECTED no such file: ' + imported); process.exit(3); }
    let png;
    if (imported.toLowerCase().endsWith('.png')) {
      png = fs.readFileSync(imported);
    } else {
      try {
        const { chromium } = loadPlaywright();
        const b64 = fs.readFileSync(imported).toString('base64');
        const ext = path.extname(imported).slice(1).toLowerCase();
        const browser = await chromium.launch();
        try {
          const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
          await page.setContent(`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000}img{display:block;width:${W}px;height:${H}px;object-fit:cover}</style><img src="data:image/${ext};base64,${b64}">`);
          await page.waitForTimeout(250);
          png = await page.screenshot({ type: 'png' });
        } finally { await browser.close(); }
      } catch (e) { console.error('plate.mjs: ' + e.message); process.exit(e.code === 3 ? 3 : 1); }
    }
    write(out, png, 'import', {});
    process.exit(0);
  }

  let shot;
  try { shot = JSON.parse(fs.readFileSync(shotFile, 'utf8')); }
  catch (e) { console.error('plate.mjs: cannot read ' + shotFile + ': ' + e.message); process.exit(3); }

  const want = flagVal('--provider') || 'procedural';
  const order = want === 'auto' ? ['gemini', 'openai', 'procedural'] : [want];
  if (!order.every((p) => p === 'procedural' || PROVIDERS[p])) {
    console.error('usage: --provider auto|procedural|gemini|openai');
    process.exit(2);
  }

  const failures = [];
  for (const name of order) {
    if (name === 'procedural') {
      const svg = buildSVG(shot);
      if (dryRun) {
        console.log(`DRY-RUN procedural: svg=${svg.length} chars, target ${W}x${H}, key at clock ${shot.keyClock}, lit ${shot.litPct}%, grain ${shot.grain}. Nothing sent, nothing written.`);
        process.exit(0);
      }
      try {
        const png = await rasterize(svg);
        write(out, png, 'procedural', shot);
        console.log(`  NOT PHOTOGRAPHIC: a rendered light study, key clock ${shot.keyClock}, ${shot.kelvin}K, ${shot.litPct}% lit, svg=${svg.length} chars`);
        process.exit(0);
      } catch (e) {
        if (e.code === 3) { console.error('plate.mjs: ' + e.message); process.exit(3); }
        failures.push('procedural: ' + e.message);
        continue;
      }
    }
    const p = PROVIDERS[name];
    const key = resolveKey(p.key);
    const shape = p.shape(shot, key);
    if (dryRun) {
      const body = { ...shape.body };
      const promptText = name === 'openai' ? body.prompt : body.contents[0].parts[0].text;
      if (name === 'openai') body.prompt = `<${promptText.length} chars>`;
      else body.contents = [{ parts: [{ text: `<${promptText.length} chars>` }] }];
      console.log(`DRY-RUN ${name}: ${shape.method} ${shape.url}`);
      console.log('  headers: ' + JSON.stringify(shape.headers));
      console.log('  body:    ' + JSON.stringify(body));
      console.log('  prompt:  ' + promptText.slice(0, 120).replace(/\s+/g, ' ') + ' ...');
      console.log(`  cost:    ${p.cost}`);
      console.log(`  nothing sent (dry run). prompt=${promptText.length} chars negative=${shot.negative.length} chars`);
      process.exit(0);
    }
    if (!key) { failures.push(`${name}: no ${p.key} resolved`); continue; }
    const r = await p.send(shape, key);
    if (r.error) { failures.push(`${name}: ${r.error}`); continue; }
    write(out, r.png, name, shot);
    console.log(`  usage=${JSON.stringify(r.usage)}`);
    console.log(`  cost: ${p.cost}`);
    process.exit(0);
  }
  for (const f of failures) console.error('  - ' + f);
  console.error(`PLATE FAILED ${out}: providers tried=${order.length} failures=${failures.length}`);
  process.exit(1);
}
