#!/usr/bin/env node
// fold-metrics.mjs - measure the FIRST FOLD of a rendered page and print a fingerprint.
//
//   node fold-metrics.mjs <url|file> [--viewport 1440x900] [--label name] [--json out.json]
//                         [--compare prev.json] [--bands] [--fold <key>] [--wait 2500]
//
// Prints one line per metric plus a JSON blob. No judgement, only numbers.
// --compare prints one DELTA line against a previous run.
// --bands reads references/fold-bands.md and prints IN or OUT per band.
//
// Exit 0 = pass, 1 = a pass-condition band is OUT, 2 = usage, 3 = no Playwright.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// playwright may live in the npx cache rather than node_modules; never a hardcoded path
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const cache = path.join(process.env.LOCALAPPDATA || process.env.HOME || '', 'npm-cache', '_npx');
  if (fs.existsSync(cache)) {
    for (const d of fs.readdirSync(cache)) {
      const p = path.join(cache, d, 'node_modules', 'playwright');
      if (fs.existsSync(p)) { try { return require(p); } catch {} }
    }
  }
  try { return require('playwright'); } catch {}
  const local = path.resolve('node_modules', 'playwright');
  if (fs.existsSync(local)) { try { return require(local); } catch {} }
  return null;
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BANDS_MD = path.join(HERE, '..', 'references', 'fold-bands.md');
const VALUE_FLAGS = new Set(['viewport', 'label', 'json', 'compare', 'wait', 'fold']);
const NO_PLATE = ['ledger', 'gift-tag', 'setlist', 'receipt', 'scoreboard'];

const argv = process.argv.slice(2);
const target = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && VALUE_FLAGS.has(argv[i - 1].slice(2))));
if (!target) { console.error('usage: fold-metrics.mjs <url|file> [--viewport WxH] [--label n] [--json out] [--compare prev.json] [--bands] [--fold key]'); process.exit(2); }
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const [vw, vh] = arg('viewport', '1440x900').split('x').map(Number);
const label = arg('label', target);
const wait = Number(arg('wait', 2500));
const foldKey = arg('fold', null);
const url = /^https?:|^file:/.test(target) ? target : 'file:///' + path.resolve(target).replace(/\\/g, '/');

const measure = () => {
  const V = { w: window.innerWidth, h: window.innerHeight };
  const foldArea = V.w * V.h;
  const clip = (r) => {
    const t = Math.max(0, r.top), b = Math.min(V.h, r.bottom), l = Math.max(0, r.left), x = Math.min(V.w, r.right);
    return b > t && x > l ? (b - t) * (x - l) : 0;
  };
  const all = [...document.querySelectorAll('body *')];
  const paints = [], texts = []; let visibleInFold = 0;
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.06) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const a = clip(r);
    if (!a) continue;
    visibleInFold++;
    const ownText = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    const painted = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'
      || /^(IMG|SVG|CANVAS|VIDEO|PICTURE)$/.test(el.tagName) || parseFloat(cs.borderTopWidth) > 0;
    if (painted) paints.push({ a, r: { w: r.width, h: r.height, x: r.left }, bg: cs.backgroundColor, img: cs.backgroundImage !== 'none', radius: cs.borderRadius, tag: el.tagName });
    if (ownText.length) texts.push({
      a, len: ownText.length, size: Math.round(parseFloat(cs.fontSize)), weight: cs.fontWeight,
      color: cs.color, family: cs.fontFamily.split(',')[0].replace(/["']/g, ''),
      ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
      lh: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2,
      w: r.width, h: r.height, cx: r.left + r.width / 2, text: ownText.slice(0, 60),
    });
  }
  // post-render contrast: every colour actually painted, not the five in the token file.
  // A text node over a gradient is measured against the nearest opaque ancestor colour,
  // which is approximate for light ink over a glow; flagged as approx in the output.
  const _cv = document.createElement('canvas'); _cv.width = _cv.height = 1;
  const _ctx = _cv.getContext('2d', { willReadFrequently: true });
  const parse = (css) => { // computed colours arrive as oklch(); let the engine resolve them to sRGB
    try {
      _ctx.clearRect(0, 0, 1, 1); _ctx.fillStyle = '#000000'; _ctx.fillStyle = css; _ctx.fillRect(0, 0, 1, 1);
      const d = _ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
    } catch { return [0, 0, 0, 0]; }
  };
  const lum = (rgb) => { const f = rgb.slice(0, 3).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bgOf = (el) => {
    let n = el, approx = false;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') approx = true;
      const c = parse(cs.backgroundColor);
      if (c[3] >= 0.98) return { c, approx };
      n = n.parentElement;
    }
    return { c: parse(getComputedStyle(document.body).backgroundColor), approx: true };
  };
  const contrasts = [];
  for (const el of all) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.5) continue;
    const r = el.getBoundingClientRect();
    if (!clip(r)) continue;
    const fg = parse(cs.color); const { c: bgc, approx } = bgOf(el);
    const size = parseFloat(cs.fontSize); const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    contrasts.push({ ratio: +ratio(fg, bgc).toFixed(2), need: large ? 3 : 4.5, size: Math.round(size), approx, text: own.slice(0, 34) });
  }
  contrasts.sort((a, b) => a.ratio / a.need - b.ratio / b.need);
  const mode = (arr) => { const m = {}; let best = null; for (const v of arr) { m[v] = (m[v] || 0) + 1; if (!best || m[v] > m[best]) best = v; } return Number(best); };
  const bodyCands = texts.filter((t) => t.len >= 40);
  const body = bodyCands.length ? mode(bodyCands.map((t) => t.size)) : (texts.length ? mode(texts.map((t) => t.size)) : 0);
  const heroT = texts.reduce((m, t) => (t.size > (m?.size || 0) ? t : m), null);
  const sizes = [...new Set(texts.map((t) => t.size))].sort((a, b) => b - a);
  const families = [...new Set(texts.map((t) => t.family))];
  const inkArea = texts.reduce((s, t) => s + t.a, 0);
  const nonShell = paints.filter((p) => p.a < foldArea * 0.85);
  const biggest = nonShell.reduce((m, p) => Math.max(m, p.a), 0);
  const bleed = paints.some((p) => p.r.w >= V.w * 0.95 && p.r.h >= V.h * 0.22 && p.a < foldArea * 0.98);
  const centered = texts.filter((t) => Math.abs(t.cx - V.w / 2) < V.w * 0.04).length;
  const measures = bodyCands.map((t) => t.len / Math.max(1, Math.round(t.h / t.lh)));
  return {
    viewport: V,
    hero: heroT ? heroT.size : 0,
    heroText: heroT ? heroT.text : '',
    heroTracking: heroT && heroT.size ? +(heroT.ls / heroT.size).toFixed(3) : 0,
    heroWeight: heroT ? heroT.weight : '',
    body,
    scale: body ? +((heroT ? heroT.size : 0) / body).toFixed(2) : 0,
    sizeCount: sizes.length,
    sizes: sizes.slice(0, 12),
    families,
    elements: visibleInFold,
    textBlocks: texts.length,
    paintedBlocks: paints.length,
    inkCoverage: +(inkArea / foldArea).toFixed(3),
    biggestObject: +(biggest / foldArea).toFixed(3),
    fullBleed: bleed,
    centerShare: texts.length ? +(centered / texts.length).toFixed(2) : 0,
    textColors: [...new Set(texts.map((t) => t.color))].length,
    surfaceColors: [...new Set(paints.map((p) => p.bg))].length,
    radii: [...new Set(nonShell.map((p) => p.radius))].filter((r) => r && r !== '0px').length,
    measureMax: measures.length ? Math.round(Math.max(...measures)) : 0,
    images: paints.filter((p) => p.img || p.tag === 'IMG' || p.tag === 'SVG' || p.tag === 'CANVAS').length,
    contrastFails: contrasts.filter((c) => c.ratio < c.need).length,
    contrastWorst: contrasts.slice(0, 4),
  };
};

// ---------------------------------------------------------------- bands
// Parses section 2 of references/fold-bands.md: | Metric | Low | High | Pass |
function readBands(file) {
  const src = fs.readFileSync(file, 'utf8');
  const expires = (src.match(/^expires:\s*(\S+)/m) || [])[1] || 'unknown';
  const keyOf = { hero: 'hero', scale: 'scale', contrastfails: 'contrastFails', biggest: 'biggestObject', bleed: 'fullBleed', images: 'images' };
  const bands = [];
  for (const line of src.split('\n')) {
    const m = line.match(/^\|\s*([A-Za-z]+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(yes|no)\s*\|\s*$/);
    if (!m) continue;
    const key = keyOf[m[1].toLowerCase()];
    if (!key) continue;
    bands.push({ name: m[1], key, low: m[2], high: m[3], pass: m[4] === 'yes' });
  }
  return { expires, bands };
}

const pw = loadPlaywright();
if (!pw) { console.error('fold-metrics: playwright could not be resolved. Run: npx --yes playwright install chromium'); process.exit(3); }
const { chromium } = pw;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
let m;
try {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(wait);
  m = await page.evaluate(measure);
} finally { await browser.close(); }

m.label = label;
m.url = url;
const out = arg('json', null);
if (out) fs.writeFileSync(out, JSON.stringify(m, null, 2));
const row = (k, v) => console.log('  ' + k.padEnd(14) + String(v));
console.log(`FOLD ${label}  ${vw}x${vh}  elements=${m.elements}`);
row('hero', `${m.hero}px  w${m.heroWeight}  tracking ${m.heroTracking}em  "${m.heroText}"`);
row('body', `${m.body}px`);
row('scale', `${m.scale}x`);
row('sizes', `${m.sizeCount} distinct  [${m.sizes.join(' ')}]`);
row('families', m.families.join(' / '));
row('blocks', `${m.textBlocks} text  ${m.paintedBlocks} painted  ${m.images} image/vector`);
row('ink', `${(m.inkCoverage * 100).toFixed(1)}% of fold`);
row('biggest', `${(m.biggestObject * 100).toFixed(1)}% of fold`);
row('bleed', m.fullBleed);
row('centered', `${(m.centerShare * 100).toFixed(0)}% of text blocks`);
row('colors', `${m.textColors} ink  ${m.surfaceColors} surface  ${m.radii} radii`);
row('measure', `${m.measureMax} chars max`);
row('contrast', `${m.contrastFails} below floor  worst: ` + m.contrastWorst.map((c) => `${c.ratio}/${c.need} ${c.size}px "${c.text}"${c.approx ? ' ~' : ''}`).join('  |  '));

const prevPath = arg('compare', null);
if (prevPath) {
  const p = JSON.parse(fs.readFileSync(prevPath, 'utf8'));
  const d = (k) => `${p[k]} -> ${m[k]}`;
  console.log(`DELTA hero ${d('hero')} | scale ${d('scale')} | biggest ${d('biggestObject')} | bleed ${d('fullBleed')} | images ${d('images')}`);
}

let exit = 0;
if (argv.includes('--bands')) {
  if (!fs.existsSync(BANDS_MD)) { console.error(`fold-metrics: bands file missing: ${BANDS_MD}`); process.exit(3); }
  const { expires, bands } = readBands(BANDS_MD);
  const skipImages = foldKey && NO_PLATE.includes(foldKey);
  const verdicts = [];
  console.log(`BANDS ${label}  ${path.basename(BANDS_MD)}  bands=${bands.length}  expires ${expires}`);
  for (const b of bands) {
    const v = m[b.key];
    let inBand, shown;
    if (b.low === 'true' || b.low === 'false') { inBand = String(v) === b.low; shown = `${v}  band ${b.low}`; }
    else { inBand = Number(v) >= Number(b.low) && Number(v) <= Number(b.high); shown = `${v}  band ${b.low} to ${b.high}`; }
    if (b.key === 'images' && skipImages) {
      console.log('  ' + b.name.padEnd(14) + shown.padEnd(30) + `n/a (fold ${foldKey} carries no plate)`);
      continue;
    }
    console.log('  ' + b.name.padEnd(14) + shown.padEnd(30) + (inBand ? 'IN' : 'OUT') + (b.pass ? '  (pass condition)' : ''));
    verdicts.push(`${b.name} ${inBand ? 'IN' : 'OUT'}`);
    if (b.pass && !inBand) exit = 1;
  }
  console.log(`${exit ? 'FAIL' : 'PASS'} ${label}: bands=${bands.length} ${verdicts.join(' ')}`);
}
process.exit(exit);
