#!/usr/bin/env node
// Render a one-page "moment card" from a token file so a human can run the stranger test
// on real pixels before any page is built. No deps.
//
//   node preview.mjs <tokens.css> [out.html] [--moment "five words"] [--signature "one sentence"]

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : ''; };
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const src = positional[0];
if (!src) { console.error('usage: preview.mjs <tokens.css> [out.html] [--moment "..."] [--signature "..."]'); process.exit(2); }
const out = positional[1] || path.join(path.dirname(src), 'sense-memory-preview.html');
const css = fs.readFileSync(src, 'utf8');

const get = (name, fallback) => { const m = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`)); return m ? m[1].trim() : fallback; };
const comment = (name) => { const m = css.match(new RegExp(`--${name}\\s*:[^;]*;\\s*/\\*\\s*([^*]+?)\\s*\\*/`)); return m ? m[1] : ''; };
const roles = ['bg', 'surface', 'ink', 'accent', 'muted'];
const moment = flag('--moment') || (css.match(/\/\*\s*Sense memory:\s*([^*]+?)\s*\*\//) || [])[1] || 'untitled moment';
const signature = flag('--signature') || '';
const display = get('font-display', 'inherit'), body = get('font-body', 'system-ui, sans-serif');
const fast = get('duration-fast', '200ms'), slow = get('duration-slow', '400ms');
const ease = get('ease-out-quint', get('ease', 'cubic-bezier(0.22, 1, 0.36, 1)'));
const radiusCard = get('radius-card', get('radius', '6px')), radiusShell = get('radius-shell', radiusCard);
const shadow = get('shadow-card', 'none');

const swatch = (r) => `<div class="sw"><div class="chip" style="background:var(--${r})"></div><b>--${r}</b><span>${comment(r) || '&nbsp;'}</span></div>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Moment card</title>
<style>
${css}
html,body{margin:0;background:var(--bg);color:var(--ink);font-family:${body};line-height:1.45}
main{max-width:920px;margin:0 auto;padding:clamp(24px,5vw,64px) 16px;display:grid;gap:40px}
h1{font-family:${display};font-size:clamp(2rem,6vw,4.5rem);line-height:1.02;margin:0;letter-spacing:-0.01em;text-wrap:balance}
.meta{color:var(--muted);font-size:.95rem}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.sw{display:grid;gap:6px;font-size:.8rem}.sw b{font-weight:600}.sw span{color:var(--muted)}
.chip{height:72px;border-radius:${radiusCard};box-shadow:${shadow}}
.panel{background:var(--surface);border-radius:${radiusCard};box-shadow:${shadow};padding:24px;display:grid;gap:12px;transition:transform ${fast} ${ease},box-shadow ${fast} ${ease}}
.panel:hover{transform:translateY(-2px)}
.panel h2{font-family:${display};margin:0;font-size:1.5rem}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}td,th{text-align:left;padding:8px 0;border-bottom:1px solid color-mix(in oklch,var(--muted) 35%,transparent)}th{color:var(--muted);font-weight:500;font-size:.85rem}
.btn{display:inline-block;background:var(--accent);color:var(--bg);border:0;border-radius:${radiusShell};padding:12px 20px;font:inherit;font-weight:600;cursor:pointer;transition:transform ${fast} ${ease},filter ${fast} ${ease}}
.btn:hover{filter:brightness(1.06)}.btn:active{transform:scale(.98)}
.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--muted)}
.sel{background:color-mix(in oklch,var(--accent) 18%,var(--surface))}
.sig{border-top:1px solid var(--muted);padding-top:16px;color:var(--muted)}
.reveal{animation:in ${slow} ${ease} both}@keyframes in{from{transform:translateY(6px)}to{transform:none}}
@media (prefers-reduced-motion:reduce){.reveal,.panel,.btn{animation:none;transition:none}}
</style></head><body><main>
<header class="reveal"><p class="meta">Sense memory preview. Ask a stranger what this feels like. If they can name the holiday, a prop leaked.</p>
<h1>${moment}</h1></header>
<section class="row reveal">${roles.map(swatch).join('')}</section>
<section class="panel reveal"><h2>Weekly summary</h2>
<table><thead><tr><th>Item</th><th>Count</th><th>Change</th></tr></thead><tbody>
<tr><td>Open requests</td><td>128</td><td>+4</td></tr><tr class="sel"><td>Awaiting review (selected)</td><td>17</td><td>-3</td></tr><tr><td>Closed this week</td><td>92</td><td>+11</td></tr></tbody></table>
<div><button class="btn">Approve selection</button> <button class="btn ghost">Export</button></div></section>
<p class="sig reveal">Signature: ${signature || 'not recorded in the token file; pass --signature'}. Motion: ${fast} / ${slow}, ${ease}. Type: ${display} over ${body}.</p>
</main></body></html>`;

fs.writeFileSync(out, html);
console.log(`wrote ${out} roles=${roles.filter((r) => css.includes('--' + r + ':')).length}/5`);
