#!/usr/bin/env node
// Lint a token surface against the sense-memory checks. Deterministic, no deps.
//
//   node moment-lint.mjs <file.css|.json|.ts|.html|.jsx|.tsx>   lint a file
//   node moment-lint.mjs <file> --register brand|product        timid-type floor (default product)
//   node moment-lint.mjs <file> --plate assets/plate-01.png     adds plate-drift findings
//   node moment-lint.mjs --hook                                 read a PreToolUse JSON payload on stdin
//   node moment-lint.mjs --json <file>                          machine-readable verdict
//
// Exit 0 = pass, 1 = findings, 2 = usage, 3 = input rejected. In --hook mode a failing
// lint prints the PreToolUse deny payload so the write is blocked with the findings as
// the reason; a file that carries no palette roles is ignored (exit 0, no findings).
// For html/htm/jsx/tsx the linter reads every <style> block plus every :root { and
// @theme { block outside them; the role regex is unchanged.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const ROLE_RE = /--(bg|surface|ink|accent|muted)\s*:\s*oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/g;
const OKLCH_ANY_RE = /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/g;
const SEMANTIC_RE = /--(ok|warn|danger|info|success|error)\s*:\s*oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/g;
const TELL_NAMES = /--(cream|paper|bone|sand|linen|parchment|wheat|biscuit|ivory|flour|oatmeal|eggshell|beige)\b/gi;
const TELL_HEX = {
  '#6366f1': 'tailwind indigo-500', '#4f46e5': 'tailwind indigo-600', '#8b5cf6': 'tailwind violet-500',
  '#7c3aed': 'tailwind violet-600', '#a855f7': 'tailwind purple-500', '#3b82f6': 'tailwind blue-500',
  '#2563eb': 'tailwind blue-600', '#0d6efd': 'bootstrap blue', '#d97757': 'claude terracotta',
  '#f4f1ea': 'ai cream', '#0b0b0b': 'tinted near-black', '#111111': 'tinted near-black',
};
// Fallback only. The list of record is references/reflex-fonts.json; when it is missing
// the output line says reflex-list=embedded so a silent fallback is impossible.
const REFLEX_FONTS = ['Inter', 'Fraunces', 'Newsreader', 'Lora', 'Crimson', 'Playfair', 'Cormorant', 'Syne',
  'IBM Plex', 'Space Mono', 'Space Grotesk', 'DM Sans', 'DM Serif', 'Outfit', 'Plus Jakarta', 'Instrument Sans', 'Manrope', 'Sora', 'Caveat', 'Montserrat', 'Poppins', 'Open Sans', 'Lato', 'Raleway', 'Nunito', 'Bebas Neue',
  'Instrument Serif', 'Geist', 'Roboto', 'Arial'];

// The twelve atlas keys. fold.mjs is the source of truth; this is the fallback when it
// has not been written yet (see loadFoldKeys).
const FOLD_KEYS = ['ledger', 'gift-tag', 'field-notebook', 'ticket-stub', 'trail-map', 'museum-label',
  'broadsheet', 'recipe-card', 'setlist', 'receipt', 'scoreboard', 'contact-sheet'];

// One verb per moment: the property whitelist each verb is allowed to animate (motion.md 2).
const VERB_PROPS = {
  reveal: ['opacity', 'clip-path', 'mask', 'mask-image', 'filter', 'color', '--*'],
  settle: ['transform', 'translate', 'opacity'],
  warm: ['color', 'background-color', 'box-shadow', 'filter'],
  count: ['content', '--*'],
  rise: ['transform', 'translate'],
};
// A reduced-motion twin made only of these is a switch, not a design.
const SWITCH_PROPS = new Set(['animation', 'transition', 'animation-duration', 'transition-duration',
  'animation-delay', 'transition-delay', 'animation-iteration-count', 'animation-play-state',
  'animation-name', 'transition-property', 'scroll-behavior', 'animation-timing-function',
  'transition-timing-function', 'view-transition-name']);
const OVERSHOOT_BANNED = ['transform', 'translate', 'top', 'left', 'right', 'bottom', 'margin', 'inset'];

export function loadReflexFonts(dir = HERE) {
  const file = path.join(dir, '..', 'references', 'reflex-fonts.json');
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(j.families) && j.families.length) return { families: j.families, embedded: false };
  } catch { /* falls through to the embedded array */ }
  return { families: REFLEX_FONTS, embedded: true };
}

export async function loadFoldKeys() {
  try {
    const m = await import('./fold.mjs');
    const keys = Object.keys(m.ATLAS || {});
    if (keys.length) return keys;
  } catch { /* fold.mjs not written yet */ }
  return FOLD_KEYS;
}

function num(v) { return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); }

// OKLCH -> sRGB (0..1), clipped. Standard Bjorn Ottosson transform.
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  return lin.map((v) => Math.min(1, Math.max(0, v)));
}
function luminance([r, g, b]) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(c1, c2) {
  const [a, b] = [luminance(oklchToRgb(...c1)), luminance(oklchToRgb(...c2))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// --- text shaping -----------------------------------------------------------

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');

// Every <style> block, then every :root { or @theme { block outside them.
export function extractStyleText(text) {
  const parts = [];
  let rest = text;
  for (const m of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    parts.push(m[1]);
    rest = rest.replace(m[0], ' ');
  }
  for (const m of rest.matchAll(/(:root|@theme)[^{]*\{/g)) {
    const open = m.index + m[0].length - 1;
    const body = braceBody(rest, open);
    if (body !== null) parts.push(m[0] + body + '}');
  }
  return parts.join('\n');
}

function braceBody(s, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') { depth--; if (depth === 0) return s.slice(openIndex + 1, i); }
  }
  return null;
}

// Every block in the file as { prelude, body }; nested blocks appear too.
function blocksOf(css) {
  const out = [];
  const stack = [];
  let last = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') { stack.push({ prelude: css.slice(last, i).trim(), start: i + 1 }); last = i + 1; }
    else if (ch === '}') { const b = stack.pop(); if (b) out.push({ prelude: b.prelude, body: css.slice(b.start, i) }); last = i + 1; }
  }
  return out;
}

// Split on top-level commas only: cubic-bezier(.68, -.55, .27, 1.55) is one token.
function splitTop(value) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of String(value)) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function declsOf(body) {
  const out = [];
  for (const m of body.matchAll(/(?:^|[;{}])\s*(--[\w-]+|[a-zA-Z-][\w-]*)\s*:\s*([^;{}]+)/g)) {
    out.push({ prop: m[1].trim().toLowerCase(), value: m[2].trim() });
  }
  return out;
}

// --- size resolution (timid-type) -------------------------------------------

function varMap(css) {
  const map = {};
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)) map[m[1]] = m[2].trim();
  return map;
}

function resolveVars(value, map, depth = 0) {
  if (depth > 4) return value;
  const next = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (all, name, fb) => (map[name] !== undefined ? map[name] : (fb ?? all)));
  return next === value ? value : resolveVars(next, map, depth + 1);
}

function toPx(token) {
  const m = /^(-?[\d.]+)(px|rem|em|pt)?$/.exec(token.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  switch (m[2]) {
    case 'rem': case 'em': return n * 16;
    case 'pt': return n * (96 / 72);
    case 'px': case undefined: return m[2] ? n : null;
    default: return null;
  }
}

// clamp(a, b, c) resolves to its upper bound; a bare length resolves to itself.
function sizeToPx(raw, map) {
  const v = resolveVars(String(raw), map).trim();
  const clamp = /clamp\(([^()]*(?:\([^()]*\)[^()]*)*)\)/i.exec(v);
  if (clamp) {
    const args = clamp[1].split(',');
    return toPx(args[args.length - 1] || '');
  }
  const first = v.split(/[\s,/]+/)[0];
  return toPx(first);
}

export function typeScale(css) {
  const map = varMap(css);
  const sizes = new Map();
  for (const m of css.matchAll(/font-size\s*:\s*([^;{}!]+)/gi)) {
    const px = sizeToPx(m[1], map);
    if (px === null || !isFinite(px) || px < 11) continue;
    sizes.set(px.toFixed(2), px);
  }
  const list = [...sizes.values()].sort((a, b) => a - b);
  if (!list.length) return { count: 0, min: 0, max: 0, range: 0 };
  const min = list[0], max = list[list.length - 1];
  return { count: list.length, min, max, range: max / min };
}

// --- the lint ---------------------------------------------------------------

export function lint(text, { file = '(stdin)', register = 'product', foldKeys = FOLD_KEYS, reflex = null } = {}) {
  const findings = [];
  const reflexList = reflex || loadReflexFonts();
  const isMarkup = /\.(html|htm|jsx|tsx|vue|svelte)$/i.test(file) || /<style\b/i.test(text);
  const css = isMarkup ? extractStyleText(text) : text;
  const bare = stripComments(css);

  const roles = {};
  for (const m of css.matchAll(ROLE_RE)) roles[m[1]] = [num(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  const roleCount = Object.keys(roles).length;
  const oklchCount = [...css.matchAll(OKLCH_ANY_RE)].length;

  const foldLine = /\/\*\s*fold:\s*([a-z0-9-]+)\s*\*\//i.exec(css.split(/\r?\n/).filter((l) => l.trim()).slice(0, 3).join('\n'));
  const fold = foldLine ? foldLine[1] : null;
  const kit = /--source-x\s*:/.test(css);
  const platePath = (/\/\*\s*plate:\s*([^\s*]+)/i.exec(css) || [])[1] || null;
  const sizes = typeScale(css);

  // A file with no palette roles is not a token surface: report it and stop, the way the
  // hook does, so an unrelated README or component file is never held to palette rules.
  if (roleCount === 0) {
    return { file, roleCount, oklchCount, fold, kit, sizes, register, reflexEmbedded: reflexList.embedded, findings, pass: true };
  }

  // --- palette
  for (const role of ['bg', 'surface']) {
    const c = roles[role];
    if (c && c[0] >= 0.84 && c[0] <= 0.98 && c[1] < 0.06 && c[1] > 0.004 && c[2] >= 40 && c[2] <= 100)
      findings.push(`cream-trap: --${role} oklch(${c.join(' ')}) sits in the warm near-white band (L .84-.98, hue 40-100). Take the object's real color or set chroma 0.`);
  }
  const acc = roles.accent;
  if (acc && acc[1] > 0.08 && acc[2] >= 255 && acc[2] <= 305)
    findings.push(`indigo-band: --accent hue ${acc[2]} is the indigo/violet default. Only keep it if the scene physically contains it.`);
  if (roles.ink && roles.bg) {
    const r = contrast(roles.ink, roles.bg);
    if (r < 4.5) findings.push(`contrast: ink on bg is ${r.toFixed(2)}:1, needs 4.5:1.`);
  }
  if (roles.ink && roles.surface) {
    const r = contrast(roles.ink, roles.surface);
    if (r < 4.5) findings.push(`contrast: ink on surface is ${r.toFixed(2)}:1, needs 4.5:1.`);
  }
  if (roles.accent && roles.bg) {
    const r = contrast(roles.accent, roles.bg);
    if (r < 3) findings.push(`contrast: accent on bg is ${r.toFixed(2)}:1, needs 3:1 for large text and icons.`);
  }
  // muted-contrast: the role the BEFORE dashboard uses for text 29 times at 1440.
  for (const ground of ['bg', 'surface']) {
    if (roleCount === 5 && roles.muted && roles[ground]) {
      const r = contrast(roles.muted, roles[ground]);
      // printed floored, so a 4.4996 never reads as a passing 4.50 next to "needs 4.5"
      if (r < 4.5) findings.push(`muted-contrast: --muted on --${ground} is ${(Math.floor(r * 100) / 100).toFixed(2)}:1, needs 4.5:1. The page sets text in this role.`);
    }
  }
  // saturation: a computed file (it carries a plate) may take chroma up to min(C(accent), 0.12).
  const computed = !!platePath;
  const satCap = computed ? Math.min(acc ? acc[1] : 0.12, 0.12) : 0.08;
  const sat = Object.entries(roles).filter(([k, c]) => k !== 'accent' && c[1] > satCap).map(([k]) => k);
  if (sat.length) findings.push(`saturation: ${sat.map((k) => '--' + k).join(', ')} carry chroma over ${satCap.toFixed(3)}; accent is the only saturated role${computed ? ' (computed file: cap is min(C(accent), 0.12))' : ''}.`);
  // lamp-band: a status or series role lit by a different lamp than the accent.
  if (acc) {
    for (const m of css.matchAll(SEMANTIC_RE)) {
      const [L, C] = [num(m[2]), parseFloat(m[3])];
      if (Math.abs(L - acc[0]) > 0.06 || C > acc[1])
        findings.push(`lamp-band: --${m[1]} oklch(${L} ${C} ${parseFloat(m[4])}) is outside the lamp (L ${acc[0]} +/- 0.06, C <= ${acc[1]}). One lamp lights the page.`);
    }
  }

  // --- composition and light
  if (roleCount === 5 && (!fold || !foldKeys.includes(fold)))
    findings.push(`missing-fold: ${fold ? `/* fold: ${fold} */ is not an atlas key` : 'no /* fold: <key> */ line in the first three lines'}. Block the page first: node fold.mjs --gaze <gaze row> --document "<document row>".`);
  if (roleCount === 5 && !kit)
    findings.push('no-light-kit: five roles and no --source-x. The light kit (--source-x, --source-y, --key-angle, --falloff, --lit, --grain, --plate-safe) comes from plate-tokens.mjs.');

  // --- type
  if (sizes.count >= 2) {
    const floor = register === 'brand' ? 8 : 4.5;
    if (sizes.range < floor)
      findings.push(`timid-type: sizes=${sizes.count} min=${sizes.min.toFixed(1)}px max=${sizes.max.toFixed(1)}px range=${sizes.range.toFixed(1)}x, under the ${floor}x floor for ${register} register.`);
  }
  for (const f of reflexList.families) {
    const base = f.replace(/\s*\(.*\)\s*$/, '').trim();
    const re = new RegExp(`['"]${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\w -]*['"]`, 'i');
    for (const line of css.split(/\r?\n/)) {
      if (!re.test(line)) continue;
      if (/fonts\.mjs\s+rank=[1-3]\b/.test(line)) continue;     // queried, not recalled
      findings.push(`reflex-font: "${base}" is on the reflex list with no provenance. Keep it only with /* fonts.mjs rank=<1..3> ... */ on the same line.`);
      break;
    }
  }

  // --- tells
  for (const m of css.matchAll(TELL_NAMES)) findings.push(`tell-name: token ${m[0]} names the AI default; name it after the object.`);
  for (const [hex, why] of Object.entries(TELL_HEX)) if (css.toLowerCase().includes(hex)) findings.push(`tell-hex: ${hex} (${why}).`);
  if (text.includes(String.fromCharCode(0x2014))) findings.push('em-dash: file contains an em dash.');

  // --- motion
  const budget = parseFloat((/\/\*\s*travel:\s*([\d.]+)px/i.exec(css) || [])[1] || '8');
  const verb = ((/\/\*\s*verb:\s*([a-z]+)\s*\*\//i.exec(css) || [])[1] || '').toLowerCase();
  const blocks = blocksOf(bare);
  const animated = new Set();
  let travelWorst = 0, travelCount = 0;

  for (const b of blocks) {
    const isKeyframe = /@keyframes/.test(b.prelude) || /^\d+%|^(from|to)$/i.test(b.prelude);
    const decls = declsOf(b.body);
    const transitions = decls.filter((d) => d.prop === 'transition' || d.prop === 'transition-property');
    const transitionProps = transitions.flatMap((d) => splitTop(d.value).map((part) => part.split(/\s+/)[0].toLowerCase()));
    for (const p of transitionProps) if (p && p !== 'none') animated.add(p);
    if (isKeyframe) for (const d of decls) if (d.prop !== 'animation-timing-function') animated.add(d.prop);

    // travel-budget: px translation in a keyframe body, or on a block that transitions transform
    const movesOnTransition = transitionProps.some((p) => p === 'transform' || p === 'translate' || p === 'all');
    if ((isKeyframe || movesOnTransition) && !b.body.includes('{')) {   // innermost blocks only, no double count
      for (const m of b.body.matchAll(/translate(?:3d|X|Y|Z)?\(([^)]*)\)/gi)) {
        for (const t of m[1].split(',')) {
          const px = /(-?[\d.]+)px/.exec(t);
          if (!px) continue;
          const v = Math.abs(parseFloat(px[1]));
          if (v > budget) { travelCount++; travelWorst = Math.max(travelWorst, v); }
        }
      }
    }

    // overshoot-channel: a negative control point is a filament, not a button.
    for (const d of decls) {
      const over = /cubic-bezier\(\s*-?[\d.]+\s*,\s*-[\d.]+|cubic-bezier\(\s*-[\d.]+|bounce|elastic/i.test(d.value);
      if (!over) continue;
      let channels = [];
      if (d.prop === 'transition') channels = splitTop(d.value).map((p) => p.split(/\s+/)[0].toLowerCase());
      else if (d.prop === 'animation' || d.prop === 'animation-timing-function' || d.prop === 'transition-timing-function') channels = [...animated];
      else if (d.prop.startsWith('--')) channels = [];
      const hit = channels.filter((c) => OVERSHOOT_BANNED.includes(c) || c === 'all');
      if (hit.length)
        findings.push(`overshoot-channel: overshoot on ${hit.join(', ')} (${d.prop}: ${d.value.slice(0, 48)}). Overshoot belongs on filter, opacity, background-color, box-shadow or a custom property.`);
    }
  }
  if (travelCount)
    findings.push(`travel-budget: ${travelCount} px translation(s) over the ${budget}px budget, worst ${travelWorst}px. The tempo row sets the budget; declare it with /* travel: <n>px */.`);

  if (verb) {
    const allow = VERB_PROPS[verb];
    if (!allow) findings.push(`verb-property: /* verb: ${verb} */ is not one of reveal, settle, warm, count, rise.`);
    else {
      const bad = [...animated].filter((p) => !allow.includes(p) && !(allow.includes('--*') && p.startsWith('--')));
      if (bad.length) findings.push(`verb-property: verb=${verb} animates ${bad.join(', ')}; its whitelist is ${allow.join(', ')}. One verb per moment, ${animated.size} properties animated.`);
    }
  }

  // twin-is-a-switch: the reduced-motion block is a design, not a kill switch.
  const twins = blocks.filter((b) => /prefers-reduced-motion\s*:\s*reduce/i.test(b.prelude));
  for (const t of twins) {
    const decls = declsOf(t.body);
    const substantive = decls.filter((d) => !SWITCH_PROPS.has(d.prop) && !/^\s*(none|auto|0\.01ms|0s|1)\s*$/i.test(d.value.replace(/!important/i, '')));
    if (!substantive.length)
      findings.push(`twin-is-a-switch: the prefers-reduced-motion block declares ${decls.length} properties and ${substantive.length} substantive ones. Write the still design (a crossfade, a lit static state), not animation: none.`);
  }

  // --- imagery laws, only on a file that carries a plate
  if (platePath) {
    for (const b of blocks) {
      const hasImage = /background-image\s*:\s*[^;]*url\(/i.test(b.body) || /(^|[\s,>+~])img\b/i.test(b.prelude);
      if (!hasImage) continue;
      const radius = /border-radius\s*:\s*([\d.]+)px/i.exec(b.body);
      const shadow = /box-shadow\s*:\s*(?!none)/i.test(b.body);
      if ((radius && parseFloat(radius[1]) > 8) || shadow)
        findings.push(`photo-in-a-card: ${b.prelude.slice(0, 40) || '(block)'} puts the plate in a card (${radius ? 'border-radius ' + radius[1] + 'px' : 'box-shadow'}). The plate bleeds to two edges and takes no radius, border or shadow.`);
      for (const g of b.body.matchAll(/linear-gradient\(([^;]*)\)/gi)) {
        const alphas = [...g[1].matchAll(/(?:\/\s*|,\s*)(0?\.\d+|1)\s*[),]/g)].map((a) => parseFloat(a[1]));
        if (alphas.some((a) => a >= 0.45))
          findings.push(`scrim: ${b.prelude.slice(0, 40) || '(block)'} lays a gradient at alpha ${Math.max(...alphas)} over an image. A scrim is a confession the shot was wrong; recompile the shot with a larger reserved-empty side.`);
      }
    }
    const plateStem = platePath.replace(/\.[a-z0-9]+$/i, '');
    const rasters = new Set();
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+\.(?:png|jpe?g|webp|avif|gif))/gi)) {
      const u = m[1].trim();
      if (u.includes(plateStem)) continue;
      rasters.add(u);
    }
    if (rasters.size + 1 > 1 && rasters.size >= 1)
      findings.push(`one-plate: ${rasters.size + 1} distinct rasters (${[...rasters].slice(0, 3).join(', ')}). One plate per page; supporting images are crops of ${platePath}.`);
  }

  if (roleCount > 0 && roleCount < 5) findings.push(`roles: only ${roleCount} of 5 palette roles found (bg, surface, ink, accent, muted).`);

  return { file, roleCount, oklchCount, fold, kit, sizes, register, plate: platePath, reflexEmbedded: reflexList.embedded, findings, pass: findings.length === 0 };
}

function report(r) {
  const head = `${r.pass ? 'PASS' : 'FAIL'} ${r.file}: roles=${r.roleCount} oklch=${r.oklchCount} fold=${r.fold || 'none'} kit=${r.kit ? 'yes' : 'no'}${r.reflexEmbedded ? ' reflex-list=embedded' : ''} findings=${r.findings.length}`;
  return [head, ...r.findings.map((f) => '  - ' + f)].join('\n');
}

// plate-drift lives in plate-tokens.mjs; it is imported only when --plate is given.
async function plateDrift(platePng, cssText) {
  let checkDrift;
  try { ({ checkDrift } = await import('./plate-tokens.mjs')); }
  catch { console.log('plate-drift: plate-tokens.mjs not present'); return []; }
  try {
    const rows = await checkDrift(platePng, cssText);
    const n = (v, d) => (v === null || v === undefined || !isFinite(v) ? '-' : Number(v).toFixed(d));
    return (rows || []).filter((row) => row.drift).map((row) =>
      `plate-drift: --${row.role} is dL ${n(row.dL, 3)} dC ${n(row.dC, 3)} dh ${n(row.dh, 1)} from its sampled cluster in ${platePng}${row.reason ? ' (' + row.reason + ')' : ''}. Add /* override: <reason> */ or take the sampled value.`);
  } catch (e) {
    console.log(`plate-drift: could not read ${platePng} (${e.message})`);
    return [];
  }
}

const argv = process.argv.slice(2);
const flagValue = (name) => { const i = argv.indexOf('--' + name); return i > -1 ? argv[i + 1] : null; };

const invoked = process.argv[1] || '';   // empty under `node -e`, where this module is only imported
if (invoked && (import.meta.url === `file:///${invoked.replace(/\\/g, '/')}` || invoked.endsWith('moment-lint.mjs'))) {
  const reflex = loadReflexFonts();
  if (argv.includes('--hook')) {
    let raw = '';
    process.stdin.on('data', (d) => (raw += d));
    process.stdin.on('end', async () => {
      let payload = {};
      try { payload = JSON.parse(raw || '{}'); } catch { process.exit(0); }
      const input = payload.tool_input || {};
      const target = input.file_path || '';
      if (!/\.(css|scss|json|ts|js|mjs|cjs|md|html|htm|jsx|tsx)$/i.test(target)) process.exit(0);
      let text = input.content ?? input.new_string ?? '';
      if (!text && target && fs.existsSync(target)) text = fs.readFileSync(target, 'utf8');
      const r = lint(text, { file: target, foldKeys: await loadFoldKeys(), reflex });
      if (r.roleCount === 0 || r.pass) process.exit(0);
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: 'sense-memory lint: ' + r.findings.join(' | '),
          additionalContext: report(r),
        },
      }));
      process.exit(0);
    });
  } else {
    const json = argv.includes('--json');
    const register = flagValue('register') || 'product';
    const plate = flagValue('plate');
    const taken = new Set([flagValue('register'), flagValue('plate')].filter(Boolean));
    const file = argv.find((a) => !a.startsWith('--') && !taken.has(a));
    if (!file) { console.error('usage: moment-lint.mjs <file> [--register brand|product] [--plate <png>] [--json] | --hook'); process.exit(2); }
    if (!['brand', 'product'].includes(register)) { console.error(`moment-lint: --register must be brand or product, got "${register}"`); process.exit(3); }
    if (!fs.existsSync(path.resolve(file))) { console.error(`moment-lint: no such file ${file}`); process.exit(3); }
    const text = fs.readFileSync(path.resolve(file), 'utf8');
    const r = lint(text, { file, register, foldKeys: await loadFoldKeys(), reflex });
    if (plate) {
      if (!fs.existsSync(path.resolve(plate))) { console.error(`moment-lint: no such plate ${plate}`); process.exit(3); }
      r.findings.push(...await plateDrift(path.resolve(plate), text));
      r.pass = r.findings.length === 0;
    }
    console.log(json ? JSON.stringify(r, null, 2) : report(r));
    process.exit(r.pass ? 0 : 1);
  }
}
