#!/usr/bin/env node
// Compile a sensory inventory into an art-direction record (the shot). Pure
// lookup: the same JSON in gives the same prompt out, no model creativity.
//
//   node shot.mjs <sense-memory.json>                      print the shot, write shot.json
//   node shot.mjs <sense-memory.json> --out docs/shot.json write somewhere else
//   node shot.mjs <sense-memory.json> --check              fail on a Never token in the prompt
//   node shot.mjs <sense-memory.json> --json               machine-readable record
//
// The Never list goes only into `negative`. --check tokenizes `never` and reads
// the positive prompt (which carries inventory.light.fill verbatim), so a prop
// that survived the rewrite into light is caught: NEVER_LEAK <n>: <tokens>.
//
// Exit 0 = written, 1 = never leak, 2 = usage, 3 = the light row is missing a field.

import fs from 'node:fs';

// ---------------------------------------------------------------- lookup tables
// Gaze row to camera. The four canonical gaze words; a longer row ("down at
// hands", "across a crowd") matches on its gaze word.
const GAZE = {
  down: { lens: '50mm macro', distance: '35cm', fstop: 'f/2.0', angle: 'camera at chest height, tilted 40 degrees down', dof: 'focus on the near rim, everything past 12cm falls off' },
  out: { lens: '35mm', distance: '3m', fstop: 'f/8', angle: 'camera level, horizon on the lower third', dof: 'deep, everything sharp' },
  up: { lens: '24mm', distance: '2m', fstop: 'f/4', angle: 'camera tilted 30 degrees up', dof: 'deep' },
  across: { lens: '85mm', distance: '6m', fstop: 'f/2.8', angle: 'camera at eye height, compressed', dof: 'shallow, one plane sharp' },
};
// Material row to specular behaviour. Named materials only; anything else is dropped.
const MATERIAL = {
  'glazed ceramic': 'one hard specular highlight no wider than 4mm on the lit edge, then a long soft falloff across the body; the glaze reads wet, not matte',
  wool: 'no specular at all; a fine lit fuzz where the rim light grazes the fibres, deep micro shadow between them',
  wood: 'a long low sheen running with the grain, never a hotspot',
  glass: 'two specular hits, one on the near wall and one refracted through the far wall',
  steel: 'a single anisotropic streak stretched along the brush direction',
};
// Tempo row to shutter.
const TEMPO = {
  slow: '1/60s, so anything moving in the air is slightly smeared',
  held: '1/250s, everything just short of frozen',
  burst: '1/1000s, frozen mid-flight',
  crisp: '1/500s',
  drift: '1/30s, movement drawn as a soft trail',
};
// Light clock (1 to 12, where the key sits as seen from the camera) to direction.
const CLOCK = {
  1: 'from the upper right',
  2: 'from the upper right',
  3: 'from the right',
  4: 'from the right and low',
  5: 'from the right and low',
  6: 'from low in front, below the subject',
  7: 'from the left and slightly behind',
  8: 'from the left, low, just out of frame',
  9: 'from the left',
  10: 'from the upper left',
  11: 'from the upper left',
  12: 'from directly behind the subject',
};
const RESERVED = 40; // percent of the frame kept dark and empty, opposite the key
const STOP = new Set(['and', 'any', 'the', 'a', 'an', 'or', 'of', 'with', 'from', 'for', 'into', 'its', 'that', 'this', 'all']);

export function tokenize(list) {
  const out = new Set();
  for (const entry of list || []) {
    for (const w of String(entry).toLowerCase().split(/[^a-z]+/)) {
      if (w.length >= 3 && !STOP.has(w)) out.add(w);
    }
  }
  return [...out];
}

export function compile(src) {
  const i = src.inventory || {};
  const L = i.light || {};
  for (const field of ['source', 'clock', 'kelvin', 'litFraction', 'fill']) {
    if (L[field] === undefined || L[field] === null) {
      const e = new Error(`light row is missing "${field}". The Light row is a record of five fields: source, clock, kelvin, litFraction, fill.`);
      e.code = 3;
      throw e;
    }
  }
  const gazeWord = ['down', 'out', 'up', 'across'].find((k) => new RegExp(`\\b${k}\\b`).test(String(i.gaze || '').toLowerCase())) || 'down';
  const cam = GAZE[gazeWord];
  const shutter = TEMPO[i.tempo] || TEMPO.slow;
  const mat = (i.materials || []).map((m) => MATERIAL[String(m).toLowerCase()]).filter(Boolean);
  const objects = (i.objects || []).join(', ');
  const litPct = Math.round(L.litFraction * 100);
  const fill = Array.isArray(L.fill) ? L.fill.join('; ') : String(L.fill || '');
  // The reserved empty side is a light instruction, not a layout afterthought:
  // the dark side of the frame is where the headline will sit, so it is opposite
  // the key. Clocks 7 to 11 are left-hand keys, 1 to 5 right-hand.
  const safeSide = L.clock >= 7 && L.clock <= 11 ? 'right' : L.clock >= 1 && L.clock <= 5 ? 'left' : 'right';

  const prompt = [
    `A single photograph. ${i.keepsake}, ${i.gesture}.`,
    objects ? `In frame: ${objects}.` : '',
    `${cam.lens} at ${cam.distance}, ${cam.fstop}, ${cam.angle}; ${cam.dof}.`,
    `One light only: ${L.source}, ${CLOCK[L.clock] || CLOCK[8]}, ${L.kelvin}K. About ${litPct} percent of the frame is lit; the rest falls to a deep neutral black that keeps its detail.`,
    mat.length ? `Surfaces: ${mat.join('. ')}.` : '',
    `Shutter ${shutter}.`,
    `Shot on 35mm film at ISO 800: fine grain, no lifted shadows, no HDR, no colour grading beyond the lamp's own ${L.kelvin}K cast.`,
    `Leave the ${safeSide} ${RESERVED} percent of the frame in near darkness and empty. Nothing enters it.`,
    fill ? `Out of frame but contributing light: ${fill}. It is never visible, only felt on the far edge of the subject.` : '',
    `No people's faces, no text, no logos, no props beyond what is listed.`,
  ].filter(Boolean).join(' ');

  const negative = [...(src.never || []), 'studio softbox', 'two light sources', 'colour gel', 'bokeh balls', 'glossy advertising retouch', 'text', 'watermark', 'illustration', 'CGI look'].join(', ');

  return {
    title: src.title || '',
    prompt,
    negative,
    camera: { lens: cam.lens, distance: cam.distance, fstop: cam.fstop, angle: cam.angle, dof: cam.dof, shutter },
    material: (i.materials || [])[0] || 'glazed ceramic',
    kelvin: L.kelvin,
    keyClock: L.clock,
    litPct,
    safeSide,
    grain: L.litFraction < 0.3 ? 0.045 : 0,
  };
}

// Never tokens must not reach the positive prompt. The prompt carries the light
// fill verbatim, so a fill that still names its prop is caught here.
export function checkLeak(src, shot) {
  const tokens = tokenize(src.never);
  const text = shot.prompt.toLowerCase();
  const hit = tokens.filter((t) => new RegExp(`\\b${t}\\b`).test(text));
  return { tokens, hit, words: shot.prompt.split(/\s+/).length };
}

const argv = process.argv.slice(2);
if (process.argv[1] && process.argv[1].endsWith('shot.mjs')) {
  const positional = [];
  for (let n = 0; n < argv.length; n++) {
    if (argv[n] === '--out') { n++; continue; }
    if (!argv[n].startsWith('--')) positional.push(argv[n]);
  }
  const file = positional[0];
  if (!file) { console.error('usage: shot.mjs <sense-memory.json> [--out shot.json] [--check] [--json]'); process.exit(2); }
  const out = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'shot.json';
  let src;
  try { src = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error('shot.mjs: cannot read ' + file + ': ' + e.message); process.exit(3); }
  let shot;
  try { shot = compile(src); }
  catch (e) { console.error('shot.mjs: ' + e.message); process.exit(e.code === 3 ? 3 : 2); }
  fs.writeFileSync(out, JSON.stringify(shot, null, 2));
  if (argv.includes('--json')) { console.log(JSON.stringify(shot, null, 2)); }
  else {
    console.log('PROMPT    ' + shot.prompt);
    console.log('');
    console.log('NEGATIVE  ' + shot.negative);
    console.log('');
    console.log(`CAMERA    ${shot.camera.lens} at ${shot.camera.distance}, ${shot.camera.fstop}, ${shot.kelvin}K, ${shot.litPct}% lit, shutter ${shot.camera.shutter.split(',')[0]}, ${shot.safeSide} ${RESERVED}% reserved empty`);
    console.log(`SAFE SIDE ${shot.safeSide} ${RESERVED}% reserved for type | key light at ${shot.keyClock} o'clock | ${shot.litPct}% lit | grain ${shot.grain} | wrote ${out}`);
  }
  if (argv.includes('--check')) {
    const { tokens, hit, words } = checkLeak(src, shot);
    if (hit.length) {
      console.log(`NEVER_LEAK ${hit.length}: ${hit.join(', ')} (never-tokens=${tokens.length} scanned=${words} prompt words)`);
      process.exit(1);
    }
    console.log(`NEVER_LEAK 0 (never-tokens=${tokens.length} scanned=${words} prompt words)`);
  }
  process.exit(0);
}
