#!/usr/bin/env node
// Lint a token surface against the sense-memory checks. Deterministic, no deps.
//
//   node moment-lint.mjs <file.css|file.json|file.ts>      lint a file
//   node moment-lint.mjs --hook                            read a PreToolUse JSON payload on stdin
//   node moment-lint.mjs --json <file>                     machine-readable verdict
//
// Exit 0 = pass, 1 = findings, 2 = usage. In --hook mode a failing lint prints the
// PreToolUse deny payload so the write is blocked with the findings as the reason;
// a file that carries no palette roles is ignored (exit 0, no output).

import fs from 'node:fs';
import path from 'node:path';

const ROLE_RE = /--(bg|surface|ink|accent|muted)\s*:\s*oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/g;
const OKLCH_ANY_RE = /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/g;
const TELL_NAMES = /--(cream|paper|bone|sand|linen|parchment|wheat|biscuit|ivory|flour|oatmeal|eggshell|beige)\b/gi;
const TELL_HEX = {
  '#6366f1': 'tailwind indigo-500', '#4f46e5': 'tailwind indigo-600', '#8b5cf6': 'tailwind violet-500',
  '#7c3aed': 'tailwind violet-600', '#a855f7': 'tailwind purple-500', '#3b82f6': 'tailwind blue-500',
  '#2563eb': 'tailwind blue-600', '#0d6efd': 'bootstrap blue', '#d97757': 'claude terracotta',
  '#f4f1ea': 'ai cream', '#0b0b0b': 'tinted near-black', '#111111': 'tinted near-black',
};
const REFLEX_FONTS = ['Inter', 'Fraunces', 'Newsreader', 'Lora', 'Crimson', 'Playfair', 'Cormorant', 'Syne',
  'IBM Plex', 'Space Mono', 'Space Grotesk', 'DM Sans', 'DM Serif', 'Outfit', 'Plus Jakarta', 'Instrument Sans', 'Manrope', 'Sora', 'Caveat', 'Montserrat', 'Poppins', 'Open Sans', 'Lato', 'Raleway', 'Nunito', 'Bebas Neue',
  'Instrument Serif', 'Geist', 'Roboto', 'Arial'];

function num(v) { return v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v); }

// OKLCH -> sRGB (0..1), clipped. Standard Björn Ottosson transform.
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

export function lint(text, { file = '(stdin)' } = {}) {
  const findings = [];
  const roles = {};
  for (const m of text.matchAll(ROLE_RE)) roles[m[1]] = [num(m[2]), parseFloat(m[3]), parseFloat(m[4])];
  const roleCount = Object.keys(roles).length;
  const oklchCount = [...text.matchAll(OKLCH_ANY_RE)].length;

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
  const sat = Object.entries(roles).filter(([k, c]) => k !== 'accent' && c[1] > 0.08).map(([k]) => k);
  if (sat.length) findings.push(`saturation: ${sat.map((k) => '--' + k).join(', ')} carry chroma over 0.08; accent is the only saturated role.`);

  for (const m of text.matchAll(TELL_NAMES)) findings.push(`tell-name: token ${m[0]} names the AI default; name it after the object.`);
  for (const [hex, why] of Object.entries(TELL_HEX)) if (text.toLowerCase().includes(hex)) findings.push(`tell-hex: ${hex} (${why}).`);
  for (const f of REFLEX_FONTS) if (new RegExp(`['"]${f}[\\w -]*['"]`, 'i').test(text)) findings.push(`reflex-font: "${f}" is on the reflex-reject list; choose from a catalog search against the scene's lettering.`);
  if (/—/.test(text)) findings.push('em-dash: file contains an em dash.');
  if (/cubic-bezier\(\s*0?\.68\s*,\s*-0?\.55|elastic|bounce/i.test(text)) findings.push('easing: bounce or elastic easing; the tempo row never produces overshoot on interface elements.');
  if (roleCount > 0 && roleCount < 5) findings.push(`roles: only ${roleCount} of 5 palette roles found (bg, surface, ink, accent, muted).`);

  return { file, roleCount, oklchCount, findings, pass: findings.length === 0 };
}

function report(r) {
  const head = `${r.pass ? 'PASS' : 'FAIL'} ${r.file}: roles=${r.roleCount} oklch=${r.oklchCount} findings=${r.findings.length}`;
  return [head, ...r.findings.map((f) => '  - ' + f)].join('\n');
}

const argv = process.argv.slice(2);
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('moment-lint.mjs')) {
  if (argv.includes('--hook')) {
    let raw = '';
    process.stdin.on('data', (d) => (raw += d));
    process.stdin.on('end', () => {
      let payload = {};
      try { payload = JSON.parse(raw || '{}'); } catch { process.exit(0); }
      const input = payload.tool_input || {};
      const target = input.file_path || '';
      if (!/\.(css|scss|json|ts|js|mjs|cjs|md)$/i.test(target)) process.exit(0);
      let text = input.content ?? input.new_string ?? '';
      if (!text && target && fs.existsSync(target)) text = fs.readFileSync(target, 'utf8');
      const r = lint(text, { file: target });
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
    const file = argv.find((a) => !a.startsWith('--'));
    if (!file) { console.error('usage: moment-lint.mjs <file> | --hook | --json <file>'); process.exit(2); }
    const r = lint(fs.readFileSync(path.resolve(file), 'utf8'), { file });
    console.log(json ? JSON.stringify(r, null, 2) : report(r));
    process.exit(r.pass ? 0 : 1);
  }
}
