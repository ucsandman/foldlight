#!/usr/bin/env node
// fold-card.mjs - render one HTML card, in the project's own tokens, that a human can
// read as a stranger before any page exists. Replaces preview.mjs.
//
//   node fold-card.mjs <tokens.css> <out.html> --plate <png> --fold <key>
//                      [--specimen <png>] [--voice <voice.json>]
//                      [--string "<display string>"] [--size <px>]
//   node fold-card.mjs --sheet <a.png> <b.png> ... <out.html>
//
// The card shows: the blocking diagram at 24x14 cells, the plate with its measured
// safe box and key-light crosshair, the five roles as swatches with source band and
// contrast ratio, the display specimen, the six state strings, the fold envelope and
// the light kit. --sheet tiles PNGs at 200px into one contact sheet.
//
// No dependencies. The fold atlas is imported lazily from ./fold.mjs; without it the
// card still renders and says the diagram is unavailable.
//
// Exit 0 = written, 2 = usage.

import fs from 'node:fs';
import path from 'node:path';

const STATE_NAMES = ['empty', 'loading', 'error', 'offline', 'done', 'first-run'];
const VALUE_FLAGS = new Set(['plate', 'fold', 'specimen', 'voice', 'string', 'size']);

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rel = (from, to) => path.relative(path.dirname(path.resolve(from)), path.resolve(to)).replace(/\\/g, '/');

// ---------------------------------------------------------------- oklch -> sRGB (Ottosson)
function oklchToRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  return lin.map((v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, c));
  });
}
const relLum = ([r, g, b]) => {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => { const [x, y] = [relLum(a), relLum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// ---------------------------------------------------------------- PNG header and tEXt chunks
function pngInfo(file) {
  const info = { width: 0, height: 0, provider: '' };
  let buf;
  try { buf = fs.readFileSync(file); } catch { return info; }
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return info;
  info.width = buf.readUInt32BE(16); info.height = buf.readUInt32BE(20);
  let off = 8;
  while (off + 8 < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IEND') break;
    if (type === 'tEXt' || type === 'iTXt') {
      const raw = buf.toString('latin1', off + 8, off + 8 + len);
      const z = raw.indexOf('\0');
      const key = z === -1 ? '' : raw.slice(0, z);
      const val = z === -1 ? raw : raw.slice(z + 1).replace(/\0/g, ' ').trim();
      if (key.toLowerCase() === 'provider') info.provider = val;
      else { const m = (key + ' ' + val).match(/provider=([\w-]+)/); if (m && !info.provider) info.provider = m[1]; }
    }
    off += 12 + len;
  }
  return info;
}

// ---------------------------------------------------------------- sheet mode
if (argv.includes('--sheet')) {
  const items = argv.slice(argv.indexOf('--sheet') + 1).filter((a) => !a.startsWith('--'));
  const given = Math.max(0, items.length - 1);
  const out = items.pop();
  const pngs = items.filter((f) => fs.existsSync(f));
  if (!out || !pngs.length) { console.error('usage: fold-card.mjs --sheet <a.png> <b.png> ... <out.html>'); process.exit(2); }
  const tiles = pngs.map((p) => {
    const i = pngInfo(p);
    return `<figure><img src="${esc(rel(out, p))}" alt="${esc(path.basename(p))}"><figcaption>${esc(path.basename(path.dirname(p)))}/${esc(path.basename(p))} <span>${i.width}x${i.height}</span></figcaption></figure>`;
  }).join('\n');
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Contact sheet</title>
<style>
:root{color-scheme:dark}
body{margin:0;padding:32px;background:#0c0c0d;color:#e8e6e2;font:13px/1.5 ui-sans-serif,system-ui,sans-serif}
h1{font-size:15px;font-weight:500;letter-spacing:.02em;margin:0 0 4px}
p.note{margin:0 0 28px;color:#8f8b85}
.grid{display:grid;grid-template-columns:repeat(auto-fill,200px);gap:24px}
figure{margin:0}
img{width:200px;height:auto;display:block;border:1px solid #2a2a2c}
figcaption{margin-top:6px;font-size:11px;color:#8f8b85}
figcaption span{color:#5f5c58}
</style></head><body>
<h1>Contact sheet</h1>
<p class="note">${pngs.length} folds at 200px. Read it as a stranger: no two alike, none nameable as an event.</p>
<div class="grid">
${tiles}
</div>
</body></html>
`);
  console.log(`wrote ${out} tiles=${pngs.length}/${given} mode=sheet`);
  process.exit(0);
}

// ---------------------------------------------------------------- card mode
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && VALUE_FLAGS.has(argv[i - 1].slice(2))));
const src = positional[0], out = positional[1];
if (!src || !out) { console.error('usage: fold-card.mjs <tokens.css> <out.html> --plate <png> --fold <key> [--specimen <png>] [--voice <voice.json>]'); process.exit(2); }
if (!fs.existsSync(src)) { console.error(`fold-card: token file not found: ${src}`); process.exit(2); }
const css = fs.readFileSync(src, 'utf8');
const plate = arg('plate', null);
const foldKey = arg('fold', null);
const specimen = arg('specimen', null);
const voiceFile = arg('voice', null);
const displaySize = Number(arg('size', 88));

const token = (n) => { const m = css.match(new RegExp(`--${n}\\s*:\\s*([^;]+);`)); return m ? m[1].trim() : ''; };
const band = (n) => { const m = css.match(new RegExp(`--${n}\\s*:[^;]*;\\s*/\\*\\s*([^*]+?)\\s*\\*/`)); return m ? m[1].trim() : ''; };
const title = (css.match(/\/\*\s*Sense memory:\s*([^*]+?)\s*\*\//) || [])[1] || path.basename(src);
const plateLine = (css.match(/\/\*\s*plate:\s*([^*]+?)\s*\*\//) || [])[1] || '';
const foldLine = (css.match(/\/\*\s*fold:\s*([\w-]+)\s*\*\//) || [])[1] || '';
const key = foldKey || foldLine || 'none';

const ROLES = ['bg', 'surface', 'ink', 'accent', 'muted'];
const roles = {};
for (const r of ROLES) {
  const v = token(r);
  const m = v.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/);
  roles[r] = { css: v, band: band(r), rgb: m ? oklchToRgb(m[1].endsWith('%') ? parseFloat(m[1]) / 100 : parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])) : null };
}
const rolesFound = ROLES.filter((r) => roles[r].css).length;
const pair = (a, b) => (roles[a].rgb && roles[b].rgb ? contrast(roles[a].rgb, roles[b].rgb).toFixed(2) + ':1' : 'n/a');
const RATIOS = [['ink', 'bg'], ['ink', 'surface'], ['accent', 'bg'], ['muted', 'bg'], ['muted', 'surface']];

const KIT = ['source-x', 'source-y', 'key-angle', 'falloff', 'lit', 'grain', 'plate-safe'];
const kit = Object.fromEntries(KIT.map((k) => [k, token(k)]));
const safe = kit['plate-safe'].split(/\s+/).map(parseFloat);
const hasSafe = safe.length === 4 && safe.every(Number.isFinite);
const px = pngInfo(plate || '');
const provider = px.provider || (plateLine.match(/provider=([\w-]+)/) || [])[1] || 'unknown';

// voice: the six mandatory state strings
let strings = {}, declared = [];
if (voiceFile && fs.existsSync(voiceFile)) {
  try {
    const v = JSON.parse(fs.readFileSync(voiceFile, 'utf8'));
    if (v.states && !Array.isArray(v.states)) strings = v.states;
    else declared = Array.isArray(v.states) ? v.states : [];
    strings = { ...strings, ...(v.stateStrings || v.strings || {}) };
  } catch { /* a malformed voice file leaves the card with no strings, and says so */ }
}
const stateRows = STATE_NAMES.map((n) => ({ name: n, text: strings[n] || '', declared: declared.includes(n) || !!strings[n] }));
const stateCount = stateRows.filter((s) => s.declared).length;

// the atlas is another module's; import it only if it is there
let atlas = null, importError = '';
try { atlas = (await import('./fold.mjs')).ATLAS; }
catch (e) { importError = `scripts/fold.mjs is not present (${e.code || 'import failed'})`; }
const entry = atlas && key !== 'none' ? atlas[key] : null;
const diagram = entry && Array.isArray(entry.diagram) ? entry.diagram : null;
const envelope = entry && entry.envelope ? entry.envelope : null;

const LEGEND = {
  '#': ['var(--ink)', 'display type'], '=': ['var(--muted)', 'body text'],
  '|': ['color-mix(in oklch, var(--muted) 40%, transparent)', 'vertical rule'],
  '-': ['color-mix(in oklch, var(--muted) 40%, transparent)', 'hairline'],
  '@': ['var(--accent)', 'the primary action'], '%': ['var(--surface)', 'plate or image'],
  '.': ['transparent', 'unlit or empty'], n: ['var(--surface)', 'navigation'],
};
const cells = diagram
  ? diagram.map((row) => [...row.padEnd(24, '.').slice(0, 24)].map((ch) => `<i style="background:${(LEGEND[ch] || LEGEND['.'])[0]}" title="${esc(ch)}"></i>`).join('')).join('\n')
  : '';

const swatches = ROLES.map((r) => {
  const c = roles[r];
  return `<div class="sw"><span class="chip" style="background:${esc(c.css || 'transparent')}"></span>
  <b>--${r}</b><code>${esc(c.css || 'missing')}</code><em>${esc(c.band || 'no source band in the token file')}</em></div>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fold card: ${esc(title)}</title>
<style>
:root{
${ROLES.map((r) => `  --${r}: ${roles[r].css || 'transparent'};`).join('\n')}
${KIT.filter((k) => kit[k]).map((k) => `  --${k}: ${kit[k]};`).join('\n')}
  --font-display: ${token('font-display') || 'Georgia, serif'};
  --font-body: ${token('font-body') || 'ui-sans-serif, system-ui, sans-serif'};
}
*{box-sizing:border-box}
body{margin:0;padding:40px 48px 64px;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:14px;line-height:1.55}
h1{font-family:var(--font-display);font-size:34px;font-weight:400;margin:0 0 2px}
.sub{color:var(--muted);margin:0 0 36px;font-size:13px}
section{margin:0 0 40px}
h2{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500;margin:0 0 14px;
   padding-bottom:6px;border-bottom:1px solid color-mix(in oklch, var(--muted) 30%, transparent)}
.diagram{display:grid;grid-template-columns:repeat(24,20px);grid-auto-rows:20px;gap:0;width:480px;
   background:var(--bg);outline:1px solid color-mix(in oklch, var(--muted) 30%, transparent)}
.diagram i{display:block;width:20px;height:20px}
.plate{position:relative;width:720px;max-width:100%}
.plate img{width:100%;display:block}
.safe{position:absolute;outline:2px solid var(--accent);outline-offset:-1px}
.safe b{position:absolute;left:0;top:100%;margin-top:4px;font-size:11px;color:var(--accent);font-weight:500}
.cross{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px}
.cross:before,.cross:after{content:"";position:absolute;background:var(--accent)}
.cross:before{left:0;right:0;top:16px;height:2px}
.cross:after{top:0;bottom:0;left:16px;width:2px}
.sw{display:grid;grid-template-columns:44px 96px 220px 1fr;gap:14px;align-items:center;padding:7px 0;
   border-bottom:1px solid color-mix(in oklch, var(--muted) 22%, transparent)}
.chip{display:block;width:44px;height:28px;border:1px solid color-mix(in oklch, var(--muted) 40%, transparent)}
.sw b{font-weight:500;font-size:13px}
.sw code{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted)}
.sw em{font-style:normal;font-size:12px;color:var(--muted)}
.ratios{display:flex;gap:26px;flex-wrap:wrap;margin-top:14px;font-size:12px;color:var(--muted)}
.ratios b{color:var(--ink);font-weight:500}
.specimen{font-family:var(--font-display);font-size:${displaySize}px;line-height:1.05;margin:0;color:var(--ink)}
.specimen img{max-width:100%;display:block}
.states{display:grid;grid-template-columns:120px 1fr;gap:6px 18px;font-size:14px}
.states dt{color:var(--muted);font-size:12px;padding-top:2px}
.states dd{margin:0}
.states dd.miss{color:var(--muted);font-style:italic}
table{border-collapse:collapse;font-size:13px}
td{padding:4px 22px 4px 0;font-variant-numeric:tabular-nums}
td:first-child{color:var(--muted)}
.note{color:var(--muted);font-size:13px;margin:0}
</style></head>
<body>
<h1>${esc(title)}</h1>
<p class="sub">fold ${esc(key)} &middot; plate ${esc(plate ? path.basename(plate) : 'none')} provider=${esc(provider)} &middot; roles ${rolesFound}/5 &middot; states ${stateCount}/6</p>

<section>
  <h2>Blocking diagram, 24 x 14</h2>
  ${diagram ? `<div class="diagram">\n${cells}\n</div>` : `<p class="note">Diagram unavailable: ${esc(importError || `the atlas has no entry for '${key}'`)}. The rest of this card is measured from the token file and the plate.</p>`}
</section>

<section>
  <h2>Plate, safe box and key light</h2>
  ${plate ? `<div class="plate">
    <img src="${esc(rel(out, plate))}" alt="the plate this palette was sampled from">
    ${hasSafe ? `<div class="safe" style="left:${safe[0]}%;top:${safe[1]}%;width:${safe[2]}%;height:${safe[3]}%"><b>--plate-safe ${esc(kit['plate-safe'])}</b></div>` : ''}
    ${kit['source-x'] && kit['source-y'] ? `<div class="cross" style="left:${esc(kit['source-x'])};top:${esc(kit['source-y'])}"></div>` : ''}
  </div>
  <p class="note">${px.width}x${px.height}px${hasSafe ? '' : ' &middot; no --plate-safe in the token file, no box drawn'}${kit['source-x'] && kit['source-y'] ? '' : ' &middot; no --source-x/--source-y, no crosshair drawn'}</p>`
    : '<p class="note">No plate passed. Run plate.mjs and pass --plate.</p>'}
</section>

<section>
  <h2>Five roles, sampled</h2>
  ${swatches}
  <div class="ratios">${RATIOS.map(([a, b]) => `<span>${a}/${b} <b>${pair(a, b)}</b></span>`).join('')}</div>
</section>

<section>
  <h2>Display specimen</h2>
  ${specimen && fs.existsSync(specimen)
    ? `<p class="specimen"><img src="${esc(rel(out, specimen))}" alt="rendered specimen"></p>`
    : `<p class="specimen">${esc(arg('string', title))}</p>`}
</section>

<section>
  <h2>The six states</h2>
  <dl class="states">
  ${stateRows.map((s) => `<dt>${esc(s.name)}</dt><dd${s.text ? '' : ' class="miss"'}>${esc(s.text || (s.declared ? 'declared, no string in voice.json' : 'not written yet'))}</dd>`).join('\n  ')}
  </dl>
</section>

<section>
  <h2>Envelope</h2>
  ${envelope ? `<table>${Object.entries(envelope).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(Array.isArray(v) ? v.join(' ') : v)}</td></tr>`).join('')}</table>`
    : `<p class="note">Envelope unavailable: ${esc(importError || `no atlas entry for '${key}'`)}.</p>`}
</section>

<section>
  <h2>Light kit</h2>
  <table>${KIT.map((k) => `<tr><td>--${esc(k)}</td><td>${esc(kit[k] || 'not in the token file')}</td></tr>`).join('')}</table>
</section>
</body></html>
`;

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, html);
console.log(`wrote ${out} roles=${rolesFound}/5 fold=${key} plate=${provider} states=${stateCount}/6${diagram ? '' : ' diagram=unavailable'}`);
process.exit(0);
