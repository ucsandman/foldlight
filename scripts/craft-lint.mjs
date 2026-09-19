#!/usr/bin/env node
// craft-lint: measure the RENDERED page, not the token file.
//
//   node craft-lint.mjs <file.html|url> [--wide 1440x900] [--narrow 390x844]
//                       [--register brand|product] [--json]
//
// Three passes (wide, narrow, wide under prefers-reduced-motion) plus a 24-key Tab
// walk. Fifteen rules: contrast, concentric-radii, hairline-system, tabular-figures,
// optical-stroke, shadow-origin, type-inventory, orphans, spacing-vocabulary,
// overflow, tap-targets, motion-twin, fold-budget, safe-box, states.
//
// Every rule prints the volume it processed next to its verdict (no bare OK from
// an instrument that touched nothing). Exit 0 = pass, 1 = findings, 2 = usage,
// 3 = Playwright could not be resolved.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

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

const RULES = ['contrast', 'concentric-radii', 'hairline-system', 'tabular-figures', 'optical-stroke',
  'shadow-origin', 'type-inventory', 'orphans', 'spacing-vocabulary', 'overflow', 'tap-targets',
  'motion-twin', 'fold-budget', 'safe-box', 'states'];
const STATE_NAMES = ['empty', 'loading', 'error', 'offline', 'done', 'first-run'];

const argv = process.argv.slice(2);
const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
const FLAGS = new Set(['wide', 'narrow', 'register']);
const target = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && FLAGS.has(argv[i - 1].slice(2))));
if (!target) { console.error('usage: craft-lint.mjs <file.html|url> [--wide WxH] [--narrow WxH] [--register brand|product] [--json]'); process.exit(2); }
const size = (s) => ({ width: +s.split('x')[0], height: +s.split('x')[1] });
const wide = size(arg('wide', '1440x900'));
const narrow = size(arg('narrow', '390x844'));
const register = arg('register', 'product') === 'brand' ? 'brand' : 'product';
const url = /^https?:|^file:/.test(target) ? target : 'file:///' + path.resolve(target).replace(/\\/g, '/');

// ---------------------------------------------------------------- in-page measurement
const MEASURE = (OPT) => {
  const STATE_NAMES = OPT.stateNames;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.globalCompositeOperation = 'copy';
  const px = (c) => { cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const all = [...document.querySelectorAll('*')].filter((e) => {
    const s = getComputedStyle(e); const r = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  });
  const root = getComputedStyle(document.documentElement);
  const rootPx = parseFloat(root.fontSize) || 16;
  const out = { nodes: all.length, rules: {}, kit: { keyAngle: root.getPropertyValue('--key-angle').trim(), plateSafe: root.getPropertyValue('--plate-safe').trim() } };
  const R = (k, v) => (out.rules[k] = v);
  const name = (el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`;
  const V = { w: window.innerWidth, h: window.innerHeight };
  const inFold = (r) => r.top < V.h && r.bottom > 0 && r.left < V.w && r.right > 0;
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();

  // painted background behind an element (alpha-composited up the tree; gradients reported unknown)
  function behind(el) {
    let node = el, acc = null, gradient = false;
    while (node && node !== document.documentElement.parentNode) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== 'none') gradient = true;
      const c = px(s.backgroundColor);
      if (c[3] > 0) { acc = acc === null ? c : [...over(acc, c), 1]; if (c[3] >= 0.999) break; }
      node = node.parentElement;
    }
    if (!acc) acc = [255, 255, 255, 1];
    return { rgb: acc.slice(0, 3), gradient };
  }

  // 1 contrast per element, against what is actually painted behind it
  {
    const bad = []; let checked = 0, skipped = 0;
    for (const el of all) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const s = getComputedStyle(el);
      const b = behind(el);
      if (b.gradient) { skipped++; continue; }
      const fg = over(px(s.color), b.rgb);
      const size = parseFloat(s.fontSize), w = parseInt(s.fontWeight) || 400;
      const need = (size >= 24 || (size >= 18.66 && w >= 700)) ? 3 : 4.5;
      const r = ratio(fg, b.rgb); checked++;
      if (r < need) bad.push(`${name(el)} "${el.textContent.trim().slice(0, 26)}" ${r.toFixed(2)}:1 needs ${need}`);
    }
    R('contrast', { n: checked, skipped, fail: bad });
  }

  // 2 concentric radii, per corner: child corner within 12px of the parent corner
  {
    const bad = []; let corners = 0;
    const rad = (s) => [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].map((v) => parseFloat(v) || 0);
    for (const el of all) {
      const cs = getComputedStyle(el), cr = rad(cs), c = el.getBoundingClientRect();
      if (!cr.some((v) => v > 0) && px(cs.backgroundColor)[3] === 0) continue;
      let p = el.parentElement, ps = null;
      while (p) { const s = getComputedStyle(p); if (rad(s).some((v) => v > 0)) { ps = s; break; } p = p.parentElement; }
      if (!ps) continue;
      const pr = rad(ps), b = p.getBoundingClientRect();
      if (c.width * c.height < 0.25 * b.width * b.height) continue;   // chips inside buttons are not nested containers
      const ins = [[c.left - b.left, c.top - b.top], [b.right - c.right, c.top - b.top], [b.right - c.right, b.bottom - c.bottom], [c.left - b.left, b.bottom - c.bottom]];
      ins.forEach(([dx, dy], i) => {
        if (dx > 12 || dy > 12 || dx < 0 || dy < 0) return;
        corners++;
        const want = Math.max(0, pr[i] - Math.min(dx, dy));
        if (Math.abs(cr[i] - want) > 1.5) bad.push(`${name(el)} corner ${i}: ${cr[i]}px, concentric would be ${want}px`);
      });
    }
    R('concentric-radii', { n: corners, fail: bad });
  }

  // 3 hairline system: distinct visible border widths and colours
  {
    const w = new Map(), col = new Map(); let n = 0;
    for (const el of all) {
      const s = getComputedStyle(el);
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const bw = parseFloat(s['border' + side + 'Width']);
        if (!bw || s['border' + side + 'Style'] === 'none') continue;
        const c = px(s['border' + side + 'Color']); if (c[3] < 0.02) continue;
        n++; w.set(bw, (w.get(bw) || 0) + 1);
        col.set(c.map((v, i) => (i < 3 ? Math.round(v) : v.toFixed(2))).join(','), 1);
      }
    }
    const fail = [];
    if (w.size > 2) fail.push(`${w.size} distinct rule weights: ${[...w.keys()].sort().join(', ')}px`);
    if (col.size > 3) fail.push(`${col.size} distinct rule colours`);
    R('hairline-system', { n, weights: [...w.keys()].sort(), colours: col.size, fail });
  }

  // 4 tabular figures: digit advance must not vary inside a numeric-dominant element
  {
    const bad = []; let cells = 0;
    const NUM = /^[^A-Za-z]*\d[\d.,:$€£%\s]*$/;
    for (const el of all) {
      const t = el.textContent.trim();
      if (!NUM.test(t) || !/\d/.test(t)) continue;
      if ([...el.children].length) continue;
      const node = el.firstChild; if (!node || node.nodeType !== 3) continue;
      const s = getComputedStyle(el);
      const widths = [];
      for (let i = 0; i < node.textContent.length; i++) {
        if (!/\d/.test(node.textContent[i])) continue;
        const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1);
        widths.push(r.getBoundingClientRect().width);
      }
      if (widths.length < 2) continue;
      cells++;
      const spread = Math.max(...widths) - Math.min(...widths);
      if (spread > 0.12) bad.push(`"${t.slice(0, 18)}" digit advance varies ${spread.toFixed(2)}px (${s.fontFamily.split(',')[0]} ${s.fontSize}); set font-variant-numeric: tabular-nums`);
    }
    R('tabular-figures', { n: cells, fail: bad });
  }

  // 5 optical stroke weight of everything drawn
  {
    const set = new Map(); let n = 0;
    for (const svg of document.querySelectorAll('svg')) {
      const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
      const r = svg.getBoundingClientRect(); if (!r.width) continue;
      const k = vb.length === 4 && vb[2] ? r.width / vb[2] : 1;
      for (const p of svg.querySelectorAll('path,circle,rect,line,polyline')) {
        const sw = parseFloat(getComputedStyle(p).strokeWidth); if (!sw) continue;
        const stroke = getComputedStyle(p).stroke; if (!stroke || stroke === 'none') continue;
        n++; const o = (sw * k).toFixed(2); set.set(o, (set.get(o) || 0) + 1);
      }
    }
    const fail = set.size > 2 ? [`${set.size} distinct optical stroke weights: ${[...set.keys()].join(', ')}px`] : [];
    R('optical-stroke', { n, optical: [...set.keys()], fail });
  }

  // 6 shadow origin: every drop shadow points away from the one light source.
  //   With --key-angle the shadow offset must sit within 20 degrees of key-angle + 180
  //   (the formula in references/light.md); without it, all shadows must agree with
  //   each other within 60 degrees (the tournament's proven check).
  {
    const ang = new Set(); let n = 0; const bad = [];
    const keyRaw = parseFloat(out.kit.keyAngle);
    const key = Number.isFinite(keyRaw) ? ((keyRaw + 180) % 360 + 360) % 360 : null;
    const diff = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
    for (const el of all) {
      const s = getComputedStyle(el).boxShadow; if (!s || s === 'none') continue;
      for (const part of s.split(/,(?![^()]*\))/)) {
        if (/inset/.test(part)) continue;
        const nums = (part.match(/-?[\d.]+px/g) || []).map(parseFloat);
        if (nums.length < 2) continue;
        const [x, y] = nums; if (Math.hypot(x, y) < 0.5) continue;
        n++;
        const a = ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360;
        ang.add(Math.round(a / 15) * 15);
        if (key !== null && diff(a, key) > 20) bad.push(`${name(el)} shadow at ${Math.round(a)}deg, --key-angle ${Math.round(keyRaw)}deg wants ${Math.round(key)}deg (+/-20)`);
      }
    }
    const a = [...ang].sort((x, y) => x - y);
    const spread = a.length ? a[a.length - 1] - a[0] : 0;
    if (key === null && spread > 60) bad.push(`shadow offsets span ${spread} degrees: more than one light source`);
    R('shadow-origin', { n, angles: a, key: key === null ? 'none' : Math.round(key), fail: bad });
  }

  // 7 type inventory
  {
    const fam = new Set(), wt = new Set(), sz = new Set(); let n = 0;
    for (const el of all) {
      if (![...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())) continue;
      const s = getComputedStyle(el); n++;
      fam.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      wt.add(s.fontWeight); sz.add(Math.round(parseFloat(s.fontSize)));
    }
    const cap = OPT.register === 'brand' ? 9 : 7;
    const fail = [];
    if (fam.size > 2) fail.push(`${fam.size} families: ${[...fam].join(', ')}`);
    if (wt.size > 4) fail.push(`${wt.size} weights: ${[...wt].sort().join(', ')}`);
    if (sz.size > cap) fail.push(`${sz.size} sizes (${OPT.register} allows ${cap}): ${[...sz].sort((a, b) => a - b).join(', ')}px`);
    R('type-inventory', { n, families: [...fam], weights: [...wt].sort(), sizes: [...sz].sort((a, b) => a - b), fail });
  }

  // 8 orphans: no last line of one word in a multi-line heading or paragraph
  {
    const bad = []; let blocks = 0;
    for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,figcaption,blockquote')) {
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim().split(/\s+/).length > 2);
      if (!node) continue;
      const text = node.textContent; const lines = new Map(); let i = 0;
      for (const w of text.split(/(\s+)/)) {
        if (w.trim()) {
          const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + w.length);
          const top = Math.round(r.getBoundingClientRect().top);
          lines.set(top, (lines.get(top) || 0) + 1);
        }
        i += w.length;
      }
      if (lines.size < 2) continue;
      blocks++;
      const last = [...lines.values()].pop();
      if (last === 1) bad.push(`<${el.tagName.toLowerCase()}> "${text.trim().slice(0, 40)}" ends on a one-word line`);
    }
    R('orphans', { n: blocks, fail: bad });
  }

  // 9 spacing vocabulary: how many distinct vertical paddings and gaps the page uses
  {
    const vals = new Map(); let n = 0;
    for (const el of all) {
      const s = getComputedStyle(el);
      for (const p of ['paddingTop', 'paddingBottom', 'rowGap']) {
        const v = parseFloat(s[p]); if (!v || Number.isNaN(v)) continue; n++;
        vals.set(v, (vals.get(v) || 0) + 1);
      }
    }
    const list = [...vals.keys()].sort((a, b) => a - b);
    R('spacing-vocabulary', { n, values: list, fail: list.length > 12 ? [`${list.length} distinct vertical spacing values: ${list.join(', ')}`] : [] });
  }

  // 10 overflow
  {
    const de = document.documentElement;
    const overs = [...all].filter((e) => e.getBoundingClientRect().right > de.clientWidth + 1)
      .map((e) => name(e));
    R('overflow', { n: all.length, fail: de.scrollWidth > de.clientWidth + 1 ? [`page scrolls sideways: ${de.scrollWidth} > ${de.clientWidth} (${[...new Set(overs)].slice(0, 4).join(', ')})`] : [] });
  }

  // 11 tap targets (only meaningful in the narrow pass)
  {
    const bad = []; let n = 0;
    for (const el of document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[tabindex]:not([tabindex="-1"])')) {
      const r = el.getBoundingClientRect(); if (!r.width) continue; n++;
      if (Math.min(r.width, r.height) < 44) bad.push(`${name(el)} "${el.textContent.trim().slice(0, 16)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    R('tap-targets', { n, fail: bad });
  }

  // 12 fold budget: the first viewport is allowed three sizes, one action, nine objects
  {
    const widePass = V.w >= 900;
    const sizes = new Set(); let objects = 0, display = 0; const actions = [];
    for (const el of all) {
      const r = el.getBoundingClientRect(); if (!inFold(r)) continue;
      const s = getComputedStyle(el);
      const t = ownText(el);
      const filled = px(s.backgroundColor)[3] > 0.02 || s.backgroundImage !== 'none' || /^(IMG|SVG|CANVAS|VIDEO|PICTURE)$/.test(el.tagName);
      if (t) { const fs2 = Math.round(parseFloat(s.fontSize)); sizes.add(fs2); display = Math.max(display, fs2); }
      if (t || filled) objects++;
      if (/^(A|BUTTON)$/.test(el.tagName) || el.getAttribute('role') === 'button' || (el.tagName === 'INPUT' && /submit|button/.test(el.type || ''))) {
        if (px(s.backgroundColor)[3] >= 0.5) actions.push(name(el));
      }
    }
    const needRem = widePass ? (OPT.register === 'brand' ? 3 : 2.4) : (OPT.register === 'brand' ? 2.4 : 1.8);
    const need = needRem * rootPx;
    const fail = [];
    if (widePass) {
      if (sizes.size > 3) fail.push(`${sizes.size} distinct font sizes in the fold (budget 3): ${[...sizes].sort((a, b) => b - a).join(', ')}px`);
      if (actions.length !== 1) fail.push(`${actions.length} primary actions in the fold (budget exactly 1)${actions.length ? ': ' + actions.slice(0, 4).join(', ') : ''}`);
      if (objects > 9) fail.push(`${objects} elements with visible text or fill in the fold (budget 9)`);
    }
    if (display < need - 0.5) fail.push(`display step ${display}px, ${OPT.register} at ${V.w} needs ${needRem}rem (${need.toFixed(1)}px)`);
    R('fold-budget', { n: objects, sizes: [...sizes].sort((a, b) => b - a), actions: actions.length, display, need: +need.toFixed(1), fail });
  }

  // 13 safe box: headlines and nav over the plate stay inside --plate-safe
  {
    const bad = []; let n = 0;
    const raw = out.kit.plateSafe;
    const nums = raw ? raw.split(/\s+/).map(parseFloat) : [];
    let plate = null;
    if (nums.length === 4 && nums.every((v) => Number.isFinite(v))) {
      for (const el of all) {
        const s = getComputedStyle(el);
        if (!/url\(/.test(s.backgroundImage) && el.tagName !== 'IMG') continue;
        const r = el.getBoundingClientRect();
        if (!plate || r.width * r.height > plate.r.width * plate.r.height) plate = { el, r };
      }
    }
    if (plate) {
      const b = plate.r;
      const safe = { left: b.left + b.width * nums[0] / 100, top: b.top + b.height * nums[1] / 100 };
      safe.right = safe.left + b.width * nums[2] / 100;
      safe.bottom = safe.top + b.height * nums[3] / 100;
      for (const el of document.querySelectorAll('h1,h2,nav')) {
        const r = el.getBoundingClientRect();
        if (!(r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom)) continue;
        n++;
        if (r.left < safe.left - 1 || r.right > safe.right + 1 || r.top < safe.top - 1 || r.bottom > safe.bottom + 1) {
          bad.push(`${name(el)} "${el.textContent.trim().slice(0, 24)}" leaves --plate-safe (${raw})`);
        }
      }
    }
    R('safe-box', { n, plate: plate ? 'yes' : 'none', safe: raw || 'none', fail: bad });
  }

  // 14 states: the six mandatory state strings, carried as data-state
  {
    const found = new Set();
    const seen = [...document.querySelectorAll('[data-state]')];
    for (const el of seen) { const v = (el.getAttribute('data-state') || '').trim(); if (STATE_NAMES.includes(v)) found.add(v); }
    const missing = STATE_NAMES.filter((s) => !found.has(s));
    R('states', { n: seen.length, states: `${found.size}/6`, fail: missing.length ? [`states=${found.size}/6, missing: ${missing.join(', ')}`] : [] });
  }
  return out;
};

// ---------------------------------------------------------------- driver
const pw = loadPlaywright();
if (!pw) { console.error('craft-lint: playwright could not be resolved. Run: npx --yes playwright install chromium'); process.exit(3); }
const { chromium } = pw;
const browser = await chromium.launch();

async function pass(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, reducedMotion: opts.reducedMotion });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(opts.settle ?? 2200);
  const res = await page.evaluate(MEASURE, { register, stateNames: STATE_NAMES });
  // keyboard walk: every stop must paint a focus ring worth 3:1
  const focus = { n: 0, fail: [] };
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().split(' ')[0], ow: parseFloat(s.outlineWidth) || 0, os: s.outlineStyle, shadow: s.boxShadow };
    });
    if (!r) break;
    focus.n++;
    const ring = (r.ow >= 1.5 && r.os !== 'none') || /rgb/.test(r.shadow || '');
    if (!ring) focus.fail.push(`${r.tag}.${r.cls} takes focus with no visible ring`);
  }
  res.rules['focus-walk'] = focus;
  // reduced motion twin
  const anim = await page.evaluate(() => {
    let live = 0, total = 0, substantive = 0;
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      const d = (s.animationName !== 'none' ? s.animationDuration : '').split(',').map((v) => parseFloat(v) * (v.includes('ms') ? 1 : 1000));
      if (s.animationName !== 'none') { total++; if (d.some((x) => x > 0.05)) live++; }
      const td = s.transitionDuration.split(',').map((v) => parseFloat(v) * (v.includes('ms') ? 1 : 1000));
      if (s.transitionProperty !== 'none' && td.some((x) => x > 0.05)) live++;
      if (s.transitionProperty !== 'none' && /opacity|color|filter|box-shadow/.test(s.transitionProperty)) substantive++;
    }
    return { total, live, substantive };
  });
  res.anim = anim;
  await ctx.close();
  return res;
}

const W = await pass(wide);
const N = await pass(narrow);
const RM = await pass(wide, { reducedMotion: 'reduce', settle: 400 });
await browser.close();

const findings = [];
const lines = [];
function emit(label, r, where) {
  if (!r) return;
  const extra = r.optical ? ` optical=${r.optical.join('/')}` : r.weights ? ` weights=${r.weights.join('/')}` : r.angles ? ` angle=${r.angles.join('/')} key=${r.key}` : r.values ? ` values=${r.values.length}` : r.sizes && label === 'type-inventory' ? ` sizes=${r.sizes.join('/')}` : r.states ? ` states=${r.states}` : label === 'fold-budget' ? ` sizes=${r.sizes.length} actions=${r.actions} display=${r.display}px/${r.need}px` : label === 'safe-box' ? ` plate=${r.plate} box=${r.safe}` : '';
  const ok = !r.fail.length;
  lines.push(`  ${ok ? 'ok  ' : 'FAIL'} ${(label + ' ' + where).padEnd(26)} n=${String(r.n).padEnd(5)}${extra}`);
  for (const f of r.fail) { findings.push(`${label} ${where}: ${f}`); lines.push(`        - ${f}`); }
}
for (const [k, v] of Object.entries(W.rules)) if (k !== 'tap-targets') emit(k, v, '1440');
emit('orphans', N.rules.orphans, '390');
emit('tap-targets', N.rules['tap-targets'], '390');
emit('overflow', N.rules.overflow, '390');
emit('contrast', N.rules.contrast, '390');
emit('fold-budget', N.rules['fold-budget'], '390');
if (RM.anim.live > 0) { findings.push(`motion-twin reduce: ${RM.anim.live} animations or transitions still running under prefers-reduced-motion`); lines.push(`  FAIL motion-twin reduce        n=${RM.anim.total}  live=${RM.anim.live} substantive=${RM.anim.substantive}`); }
else lines.push(`  ok   motion-twin reduce        n=${RM.anim.total}  live=0 substantive=${RM.anim.substantive} under prefers-reduced-motion`);

const head = `${findings.length ? 'FAIL' : 'PASS'} ${path.basename(target)}: nodes=${W.nodes} rules=${RULES.length} states=${W.rules.states.states} findings=${findings.length}`;
if (argv.includes('--json')) console.log(JSON.stringify({ head, rules: RULES, findings, wide: W.rules, narrow: N.rules }, null, 2));
else console.log([head, ...lines].join('\n'));
process.exit(findings.length ? 1 : 0);
