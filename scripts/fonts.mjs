#!/usr/bin/env node
// fonts.mjs - find a typeface from the physical qualities of the lettering in the moment.
// A live catalog query replaces recall: a ban list can only subtract, and it returns the same
// two faces forever. Keyless, no deps.
//
//   node fonts.mjs --role display --method pen --contrast medium --terminal wedge \
//                  --width normal --need opsz,wght --limit 3
//   node fonts.mjs --role body --method pen --contrast low --terminal round --need wght \
//                  --specimen docs/specimen.html --string "What last night left you." \
//                  --size 88 --bg "oklch(0.17 0.014 58)" --ink "oklch(0.93 0.018 78)"
//   node fonts.mjs --role display --method led --need wdth --json
//
// Sources (both keyless):
//   https://fonts.google.com/metadata/fonts     families, axes, stroke, classifications, popularity
//   https://api.fontshare.com/v2/fonts?limit=100
//
// The reflex list (references/reflex-fonts.json, embedded fallback) is a post-filter that DEMOTES
// rather than deletes, so a listed face can still be chosen and its provenance recorded.
//
// Exit 0 ok, 2 usage, 3 the catalog could not be fetched (name three candidates from the method
// table in references/type.md instead, and say the catalog was unreachable; never name a face
// without a specimen).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOOGLE = 'https://fonts.google.com/metadata/fonts';
const FONTSHARE = 'https://api.fontshare.com/v2/fonts?limit=100';
const HERE = path.dirname(fileURLToPath(import.meta.url));

// Fallback only. The list of record is references/reflex-fonts.json (32 names, translation.md s6).
const REFLEX_EMBEDDED = ['Inter', 'Geist', 'Roboto', 'Arial', 'Helvetica', 'Fraunces', 'Newsreader',
  'Lora', 'Crimson', 'Playfair', 'Cormorant', 'Syne', 'IBM Plex', 'Space Mono', 'Space Grotesk',
  'DM Sans', 'DM Serif', 'Outfit', 'Plus Jakarta', 'Instrument Sans', 'Instrument Serif', 'Manrope',
  'Sora', 'Caveat', 'Pacifico', 'Bebas Neue', 'Montserrat', 'Poppins', 'Open Sans', 'Lato',
  'Raleway', 'Nunito'];
// The fontshare monoculture, always applied: these never reach the JSON list, which is a Google list.
const REFLEX_FONTSHARE = ['Satoshi', 'General Sans', 'Cabinet Grotesk', 'Switzer', 'Clash Display'];

// Axes that carry a physical quality rather than just weight.
const EXPRESSIVE = {
  opsz: 'optical size: the design changes with the size it is set at',
  wdth: 'width: the air of the room',
  slnt: 'true variable slant, not a faux oblique',
  CASL: 'casual: interpolates a written skeleton into a rational one',
  FLAR: 'flare: broad-nib swelling at the stem ends',
  VOLM: 'volume: how round the terminals close',
  SOFT: 'softness of the corners',
  GRAD: 'grade: weight without width change',
  MONO: 'monospace axis: same family can set a table',
  ROND: 'roundness', BLED: 'ink bleed', SCAN: 'scan line', ELSH: 'element shape',
  YOPQ: 'thin stroke opacity', XOPQ: 'thick stroke opacity', CRSV: 'cursive',
};

// Physical quality -> what to prefer in the catalog. The literal match is penalised on purpose:
// a pen does not mean a handwriting font, it means a written skeleton in a printed face.
const METHOD = {
  pen:        { want: ['Serif', 'Sans Serif'], axes: ['CASL', 'FLAR', 'VOLM', 'slnt', 'opsz'], veto: ['Handwriting'], note: 'written skeleton, printed face' },
  letterpress:{ want: ['Serif', 'Slab Serif'], axes: ['opsz', 'GRAD', 'BLED', 'SOFT'], veto: ['Handwriting'], note: 'impression, ink spread, optical sizes' },
  led:        { want: ['Sans Serif'], axes: ['wdth', 'MONO', 'SCAN', 'ELSH'], veto: ['Handwriting'], note: 'matrix, fixed advance, no contrast' },
  routed:     { want: ['Sans Serif', 'Slab Serif'], axes: ['wdth', 'ROND', 'SOFT'], veto: ['Handwriting'], note: 'constant tool radius, no thin strokes' },
  typewriter: { want: ['Slab Serif', 'Sans Serif'], axes: ['MONO', 'BLED', 'wght'], veto: [], note: 'fixed advance, inked impression' },
  stamp:      { want: ['Sans Serif', 'Slab Serif'], axes: ['BLED', 'GRAD', 'wdth'], veto: ['Handwriting'], note: 'pressed ink, blunt ends, broken edges' },
  brush:      { want: ['Sans Serif', 'Serif'], axes: ['CASL', 'CRSV', 'slnt'], veto: ['Handwriting'], note: 'stroke direction without a script face' },
  stencil:    { want: ['Sans Serif'], axes: ['wdth', 'ELSH'], veto: ['Handwriting'], note: 'bridges, cut counters' },
  engraved:   { want: ['Serif'], axes: ['opsz', 'wdth', 'GRAD'], veto: ['Handwriting'], note: 'burin line, high contrast at size' },
  screen:     { want: ['Sans Serif'], axes: ['opsz', 'GRAD', 'wght'], veto: ['Handwriting'], note: 'rendered, not printed' },
};
const CONTRAST = { low: ['Sans Serif'], medium: ['Serif', 'Sans Serif'], high: ['Serif'] };
// How the stroke ends. No catalog carries this field, so it is read off stroke plus the shape axes.
const TERMINAL = {
  round: { want: ['Sans Serif'], axes: ['ROND', 'SOFT', 'VOLM'], against: ['Slab Serif'], note: 'closed, rounded ends' },
  wedge: { want: ['Serif'], axes: ['FLAR', 'opsz', 'CASL'], against: [], note: 'flared, broad-nib ends' },
  ball:  { want: ['Serif'], axes: ['VOLM', 'opsz'], against: ['Slab Serif'], note: 'a droplet at the stem end' },
  flat:  { want: ['Sans Serif', 'Slab Serif'], axes: ['GRAD', 'wdth', 'ELSH'], against: [], note: 'cut square, no swelling' },
};
const ROLES = ['display', 'body', 'mono'];

function arg(name, dflt = null) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return dflt;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}
const has = (n) => process.argv.includes('--' + n);
function usage(msg) { console.error('usage: ' + msg + '\n  fonts.mjs --role display|body --method <pen|led|letterpress|routed|typewriter|stamp|screen> [--contrast low|medium|high] [--terminal round|wedge|ball|flat] [--width condensed|normal|wide] [--era any|<decade>] [--need <axes,comma>] [--include <family>] [--limit 3] [--specimen out.html --string "<text>" --size <px> --bg <css> --ink <css>] [--json]'); process.exit(2); }

function reflexList() {
  const file = path.join(HERE, '..', 'references', 'reflex-fonts.json');
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(j.families) && j.families.length) return { names: j.families, source: 'references/reflex-fonts.json' };
  } catch { /* falls through to the embedded copy */ }
  return { names: REFLEX_EMBEDDED, source: 'embedded' };
}

async function getJSON(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'foldlight/fonts.mjs' } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  const t = await r.text();
  return JSON.parse(t.replace(/^\)\]\}'\s*/, ''));
}

async function catalogs() {
  const out = [];
  let g;
  try { g = await getJSON(GOOGLE); } catch (e) {
    console.error(`fetch failed: ${e.message}. The catalog is unreachable; name candidates from the method table in references/type.md and say so. A face is still never named without a specimen.`);
    process.exit(3);
  }
  for (const f of g.familyMetadataList) {
    out.push({
      catalog: 'google', family: f.family, stroke: f.stroke || '(unclassified)',
      classifications: f.classifications || [], axes: (f.axes || []).map((a) => ({ tag: a.tag, min: a.min, max: a.max, def: a.defaultValue })),
      popularity: f.popularity, added: (f.dateAdded || '').slice(0, 4), designers: (f.designers || []).join(', '),
    });
  }
  try {
    const fsh = await getJSON(FONTSHARE);
    for (const f of fsh.fonts || []) {
      const styles = f.styles || [];
      out.push({
        catalog: 'fontshare', family: f.name, stroke: /serif/i.test(f.category || '') ? 'Serif' : 'Sans Serif',
        classifications: /display/i.test(f.category || '') ? ['Display'] : [],
        axes: styles.some((s) => s.is_variable) ? [{ tag: 'wght', min: 100, max: 900, def: 400 }] : [],
        popularity: 9999, added: (f.inserted_at || '').slice(0, 4),
        designers: f.publisher?.name || 'Indian Type Foundry',
      });
    }
  } catch { /* fontshare is the second source; google alone is a catalog */ }
  return out.filter((f) => f.family);
}

function score(f, q, reflex) {
  const why = [];
  let s = 0;
  const tags = f.axes.map((a) => a.tag);
  const m = METHOD[q.method] || METHOD.screen;

  const needed = q.need.filter(Boolean);
  const hit = needed.filter((t) => tags.includes(t));
  if (needed.length) {
    s += (hit.length / needed.length) * 34;
    if (hit.length) why.push(`carries ${hit.join(', ')}`);
    const missing = needed.filter((t) => !tags.includes(t));
    if (missing.length) why.push(`no ${missing.join(', ')}`);
  }
  const extra = tags.filter((t) => EXPRESSIVE[t] && t !== 'wght' && !needed.includes(t));
  // A spare axis is a small convenience, not evidence of fit: capped so a many-axis
  // face cannot outrank a better-suited one on axis count alone.
  if (extra.length) { s += Math.min(6, extra.length * 3); why.push(`spare axes ${extra.join(', ')}`); }

  if (m.want.includes(f.stroke)) { s += 14; why.push(`${f.stroke.toLowerCase()} suits ${q.method} (${m.note})`); }
  if ((CONTRAST[q.contrast] || []).includes(f.stroke)) s += 8;
  for (const a of m.axes) if (tags.includes(a) && !needed.includes(a)) s += 3;

  const t = TERMINAL[q.terminal];
  if (t) {
    if (t.want.includes(f.stroke)) { s += 8; why.push(`${f.stroke.toLowerCase()} ends ${t.note}`); }
    if (t.against.includes(f.stroke)) s -= 8;
    const th = t.axes.filter((a) => tags.includes(a));
    if (th.length) { s += Math.min(9, th.length * 5); why.push(`terminal ${q.terminal} is on an axis: ${th.join(', ')}`); }
  }

  for (const v of m.veto) if (f.classifications.includes(v)) { s -= 55; why.push(`${v.toLowerCase()} is the literal trap for ${q.method}`); }
  if (q.role !== 'display' && f.classifications.includes('Display')) { s -= 26; why.push('display face asked to set body'); }
  if (q.role === 'mono' && !f.classifications.includes('Monospace') && !tags.includes('MONO')) s -= 40;
  if (q.width === 'condensed' || q.width === 'wide') { if (tags.includes('wdth')) { s += 10; why.push('width axis answers the document width'); } }

  // post-filter: demote, never delete, so provenance can be recorded next to the choice
  const ref = [...reflex.names, ...REFLEX_FONTSHARE].find((r) => f.family.toLowerCase().startsWith(r.toLowerCase()));
  if (ref) { s -= 120; why.push(`reflex-reject: ${ref}`); }
  if (f.catalog === 'google' && f.popularity <= 40) { s -= 30; why.push(`popularity rank ${f.popularity}: monoculture`); }
  else if (f.catalog === 'google' && f.popularity <= 120) { s -= 8; why.push(`popularity rank ${f.popularity}`); }
  if (q.era === 'contemporary' && +f.added >= 2019) s += 6;
  if (q.era === 'pre1960' && +f.added <= 2014) s += 4;

  return { ...f, score: Math.round(s), reflex: ref || null, why };
}

function css2(f) {
  if (f.catalog !== 'google') return `https://api.fontshare.com/v2/css?f[]=${f.family.toLowerCase().replace(/\s+/g, '-')}@1,2&display=swap`;
  const custom = f.axes.filter((a) => /^[A-Z]+$/.test(a.tag)).sort((a, b) => a.tag.localeCompare(b.tag));
  const reg = f.axes.filter((a) => !/^[A-Z]+$/.test(a.tag)).sort((a, b) => a.tag.localeCompare(b.tag));
  const all = [...custom, ...reg];
  if (!all.length) return `https://fonts.googleapis.com/css2?family=${f.family.replace(/\s+/g, '+')}&display=swap`;
  return `https://fonts.googleapis.com/css2?family=${f.family.replace(/\s+/g, '+')}:${all.map((a) => a.tag).join(',')}@${all.map((a) => `${a.min}..${a.max}`).join(',')}&display=swap`;
}

// The specimen is the gate: the real string, at the real size, on the real background.
function specimen(list, q, file) {
  const links = list.filter((f) => f.catalog === 'google')
    .map((f) => `<link rel="stylesheet" href="${css2(f).replace(/&/g, '&amp;')}">`).join('\n');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = list.map((f, i) => `
  <section>
    <p class="meta">rank ${i + 1} &middot; ${esc(f.family)} &middot; ${f.catalog} &middot; ${esc(f.stroke)} &middot; axes ${f.axes.map((a) => a.tag).join(' ') || 'none'} &middot; score ${f.score}</p>
    <div class="poster" style="font-family:'${esc(f.family)}',serif">${esc(q.string)}</div>
    <p class="body" style="font-family:'${esc(f.family)}',serif">${esc(q.body)} 0123456789</p>
  </section>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>specimen ${esc(q.role)}</title>${links}
<style>
 body{background:${q.bg};color:${q.ink};margin:0;padding:48px 64px;font-family:system-ui}
 section{border-top:1px solid color-mix(in oklch, ${q.ink} 25%, transparent);padding:28px 0}
 .meta{font:500 12px/1.4 ui-monospace,monospace;color:color-mix(in oklch, ${q.ink} 60%, transparent);letter-spacing:.04em;margin:0 0 12px}
 .poster{font-size:${q.size}px;line-height:1;font-variation-settings:'opsz' 72,'wght' 260;margin-bottom:8px}
 .body{font-size:18px;line-height:1.5;max-width:56ch;font-variation-settings:'opsz' 12,'wght' 380;opacity:.86}
</style>${rows}
`;
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(path.resolve(file), html);
}

const q = {
  role: arg('role', 'display'), method: arg('method', 'screen'), contrast: arg('contrast', 'medium'),
  terminal: arg('terminal', 'flat'), width: arg('width', 'normal'), era: arg('era', 'any'),
  need: String(arg('need', 'wght')).split(',').map((s) => s.trim()),
  limit: +arg('limit', 3),
  string: String(arg('string', 'Aa 6:40')), size: +arg('size', 112),
  body: String(arg('body', 'Nobody else is up yet. The quiet has a weight to it, and the first coffee is still too hot to drink.')),
  bg: String(arg('bg', 'oklch(0.16 0.014 65)')), ink: String(arg('ink', 'oklch(0.95 0.012 85)')),
};
if (!ROLES.includes(q.role)) usage(`--role "${q.role}" is not one of ${ROLES.join(', ')}`);
if (!METHOD[q.method]) usage(`--method "${q.method}" is not one of ${Object.keys(METHOD).join(', ')}`);
if (!CONTRAST[q.contrast]) usage(`--contrast "${q.contrast}" is not one of low, medium, high`);
if (!TERMINAL[q.terminal]) usage(`--terminal "${q.terminal}" is not one of ${Object.keys(TERMINAL).join(', ')}`);
if (!Number.isFinite(q.limit) || q.limit < 1) usage('--limit takes a number of 1 or more');
if (has('specimen') && arg('specimen') === true) usage('--specimen takes an output html path');

const reflex = reflexList();
const all = await catalogs();
const ranked = all.map((f) => score(f, q, reflex)).sort((a, b) => b.score - a.score);
const pinned = String(arg('include', '')).split(',').map((s) => s.trim()).filter(Boolean)
  .map((n) => ranked.find((f) => f.family.toLowerCase() === n.toLowerCase())).filter(Boolean);
const top = [...pinned, ...ranked.slice(0, q.limit).filter((f) => !pinned.includes(f))];
const demoted = ranked.filter((f) => f.reflex || f.why.some((w) => w.includes('monoculture'))).slice(0, 6);

if (has('json')) {
  console.log(JSON.stringify({ query: q, scanned: all.length, reflexSource: reflex.source, reflexCount: reflex.names.length, top, demoted }, null, 1));
} else {
  console.log(`scanned=${all.length} families (google+fontshare) role=${q.role} method=${q.method} contrast=${q.contrast} terminal=${q.terminal} need=${q.need.join(',')} reflex=${reflex.source} n=${reflex.names.length} ranked=${ranked.length}`);
  top.forEach((f, i) => {
    console.log(`rank=${i + 1} ${f.family} score=${f.score} axes=${f.axes.map((a) => a.tag).join(',') || 'static'} source=${f.catalog} url=${css2(f)}`);
    for (const w of f.why) console.log(`    - ${w}`);
  });
  console.log(`demoted=${demoted.length}: ${demoted.map((f) => f.family).join(', ') || 'none'}`);
}
const spec = arg('specimen');
if (spec) { specimen(top, q, String(spec)); console.log(`specimen=${spec} faces=${top.length} string="${q.string}" size=${q.size}px bg=${q.bg}`); }
