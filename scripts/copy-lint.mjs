#!/usr/bin/env node
// copy-lint.mjs - lint the strings of a surface against the voice spec derived from the moment.
// Companion to moment-lint.mjs: that one lints color, this one lints words.
//
//   node copy-lint.mjs <file.html|file.md|copy.json> --spec docs/voice.json
//   node copy-lint.mjs <file> --spec docs/voice.json --json
//   node copy-lint.mjs --hook --spec docs/voice.json    PreToolUse payload on stdin (Write|Edit)
//
// The twelve rules (references/voice.md section 5): banned-phrase, prop-leak, median-band,
// ceiling, headline-words, clause-cap, person, exclamation, tagline-slot, label-case,
// state-coverage, em-dash. Four more survive from the tournament script because they caught
// real copy: slogan, slogan-shape, abstraction, brand-echo, lorem, volume.
//
// Extraction: text-bearing tags of the body, plus alt, placeholder and title attributes.
// A <head><title> is not copy on the page and is not extracted. Strings of one or two words
// are beats: counted for the ban list, never averaged into the sentence band.
//
// Exit 0 pass, 1 findings, 2 usage. The verdict line prints the volume it processed (L2):
// strings, words, sentences, beats, median, states covered. A file with no strings is ignored.

import fs from 'node:fs';
import path from 'node:path';

// ---------- the ban lists (the reflex-reject list for prose) ----------
const BANNED = [
  // the promise
  'seamless', 'seamlessly', 'effortless', 'effortlessly', 'frictionless', 'painless',
  'powerful', 'robust', 'cutting-edge', 'state of the art', 'best-in-class', 'world-class',
  'game-chang', 'revolutionary', 'reimagine', 'reinvent', 'transform your', 'supercharge',
  'unlock', 'unleash', 'elevate your', 'level up', 'take it to the next level',
  // the pitch
  'built for', 'designed for', 'made for teams', 'meet ', 'say goodbye', 'no more ',
  'the all-in-one', 'one platform', 'everything you need', 'and so much more',
  'in just seconds', 'in seconds', 'minutes, not hours', '10x', 'ai-powered', 'powered by ai',
  'trusted by', 'join thousands', 'loved by', 'get started in', 'start free',
  // the filler
  'simply', 'just works', 'easily', 'blazing', 'lightning fast', 'delightful', 'magical',
  'we believe', "we're on a mission", 'our mission is', 'at its core', 'under the hood',
  'the future of', 'welcome to the', 'imagine a world',
];
const ABSTRACTION = ['platform', 'solution', 'ecosystem', 'workflow', 'experience', 'journey',
  'suite', 'toolkit', 'framework for', 'infrastructure for', 'capabilities', 'stakeholders',
  'leverage', 'utilize', 'synerg', 'holistic', 'end-to-end', 'best practice'];
const URGENCY = ['hurry', "don't miss", 'act now', 'limited time', 'right now', 'instantly',
  'immediately', 'urgent', 'asap', 'last chance'];
// finite verbs and auxiliaries: a heading of 3+ words with none of these is a slogan
const FINITE = new Set(('is are was were be been am has have had do does did will would can could ' +
  'should may might must holds hold held keeps keep kept goes go went comes come came makes make ' +
  'made takes take took gives give gave puts put runs run ran sits sit sat stays stay stayed ' +
  'waits wait waited starts start started stops stop stopped opens open opened arrives arrive ' +
  'arrived asks ask asked tells tell told shows show showed knows know knew wakes wake woke ' +
  'reads read counts count counted hands hand handed lets let sets set carries carry carried ' +
  'says say said needs need needed wants want brings bring').split(' '));

// person: the pronoun set each gaze row forces (references/voice.md section 1)
const PRONOUNS = {
  first: ['i', 'me', 'my', 'mine'],
  'first-plural': ['we', 'us', 'our', 'ours'],
  second: ['you', 'your', 'yours'],
  'second-imperative': ['you', 'your', 'yours'],
  third: ['they', 'them', 'their', 'theirs', 'he', 'him', 'his', 'she', 'her', 'hers'],
};

const DEFAULT_SPEC = {
  brand: null, person: 'second', volume: 'quiet',
  median: [5, 9], ceiling: 14, headlineWords: 8, clauseCap: 1,
  props: [], states: ['empty', 'loading', 'error', 'offline', 'done', 'first-run'],
  labelCase: 'sentence',
};

// ---------- extraction ----------
const stripTags = (s) => s.replace(/<[^>]*>/g, ' ');
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>').replace(/&(?:middot|#183);/g, '.').replace(/&(?:rsquo|#8217);/g, "'");

function extract(text, file) {
  if (file.endsWith('.json')) {
    const deck = JSON.parse(text);
    return Object.entries(deck).map(([k, v]) => ({ kind: k.startsWith('h') ? 'heading' : 'body', at: 0, state: null, brandSlot: false, text: String(v) }));
  }
  if (file.endsWith('.md')) {
    return text.split(/\n{2,}/).filter((b) => b.trim() && !b.startsWith('```')).map((b, i) => ({
      kind: /^#{1,3} /.test(b) ? 'heading' : 'body', at: i, state: null, brandSlot: false,
      text: b.replace(/^#{1,6} /, '').replace(/[*_`>]/g, '').trim(),
    }));
  }
  // html: drop head, script, style, svg; then match each text-bearing tag innermost-first
  const body = text.replace(/<head[\s\S]*?<\/head>/gi, '').replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, '');
  const TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'li', 'a', 'button', 'figcaption', 'dt', 'dd', 'td', 'th',
    'label', 'small', 'time', 'blockquote', 'span', 'summary'];
  const out = [];
  for (const tag of TAGS) {
    // innermost: the inner text may not contain another opening tag of the same name
    const re = new RegExp(`<(${tag})\\b([^>]*)>((?:(?!<${tag}[\\s>])[\\s\\S])*?)</${tag}>`, 'gi');
    let m;
    while ((m = re.exec(body))) {
      const [, , attrs, inner] = m;
      const s = decode(stripTags(inner)).replace(/\s+/g, ' ').trim();
      if (!s) continue;
      out.push({
        kind: /^h[1-4]$/i.test(tag) ? 'heading' : 'body',
        at: m.index,
        state: (attrs.match(/data-state="([^"]+)"/) || [])[1] || null,
        brandSlot: /data-role="(wordmark|brand)"/.test(attrs),
        tagline: /data-role="tagline"/.test(attrs),
        marked: /data-(state|role|copy)=/.test(attrs),
        text: s,
      });
    }
  }
  // alt text, placeholders and title attributes are copy the reader meets too
  for (const m of body.matchAll(/\b(alt|placeholder|title)="([^"]+)"/gi)) {
    const s = decode(m[2]).replace(/\s+/g, ' ').trim();
    if (s) out.push({ kind: 'body', at: m.index, state: null, brandSlot: false, marked: true, attr: m[1].toLowerCase(), text: s });
  }
  out.sort((a, b) => a.at - b.at);
  // an inline span inside a paragraph is the same copy twice: keep the longer one
  const seen = new Set();
  return out.filter((o, i) => {
    const k = o.kind + '|' + o.text;
    if (seen.has(k)) return false;
    seen.add(k);
    if (o.marked) return true;
    return !out.some((p, j) => j !== i && p.text.length > o.text.length && p.text.includes(o.text));
  });
}

// U+2014 and U+2013, built by code point so this file never carries one itself
const DASH_RE = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');

const words = (s) => (s.match(/[A-Za-z0-9$'’-]+(?::\d+)?/g) || []);
const sentences = (s) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); const i = b.length >> 1; return b.length % 2 ? b[i] : (b[i - 1] + b[i]) / 2; };

export function lintCopy(text, { file = '(stdin)', spec = {}, checkStates = true } = {}) {
  const opts = { checkStates };
  const S = { ...DEFAULT_SPEC, ...spec };
  const strings = extract(text, file);
  const findings = [];
  const add = (rule, msg) => findings.push(`${rule}: ${msg}`);

  const all = strings.map((s) => s.text).join(' ');
  const lower = all.toLowerCase();
  const totalWords = words(all).length;

  // 1 sentence band: median-band and ceiling (fragments of 1-2 words are beats, counted, not averaged)
  const lens = [], beats = [];
  for (const s of strings) for (const sen of sentences(s.text)) {
    const n = words(sen).length;
    (n <= 2 ? beats : lens).push(n);
    if (n > S.ceiling) add('ceiling', `${n} words, ceiling is ${S.ceiling}: "${sen.slice(0, 72)}"`);
  }
  const med = median(lens);
  if (lens.length >= 4 && (med < S.median[0] || med > S.median[1]))
    add('median-band', `median sentence is ${med} words over ${lens.length} sentences, the moment's band is ${S.median[0]}-${S.median[1]}.`);

  // 2 clause cap
  for (const s of strings) for (const sen of sentences(s.text)) {
    const clauses = (sen.match(/,|;|\b(and|but|which|while|so that|because|however)\b/gi) || []).length;
    if (clauses > S.clauseCap)
      add('clause-cap', `${clauses} clause breaks, cap is ${S.clauseCap}: "${sen.slice(0, 72)}"`);
  }

  // 3 slogan shape, the tagline slot and headline-words
  for (const s of strings) {
    if (s.tagline) add('tagline-slot', `"${s.text}" sits in the tagline slot under the wordmark. A tagline is a slogan with a job title. Delete it or make it a sentence that is true.`);
    if (s.kind !== 'heading') continue;
    if (S.brand && new RegExp(`^${S.brand}\\b\\s*(is\\b|:)`, 'i').test(s.text))
      add('tagline-slot', `heading "${s.text}" opens with the product name plus is or a colon. No pattern begins that way.`);
    const w = words(s.text);
    if (w.length < 3) continue;                                   // a two word stamp is a label
    if (/^\d{1,2}:\d{2}/.test(s.text)) continue;                  // a timestamp
    if (!w.some((x) => FINITE.has(x.toLowerCase())))
      add('slogan', `heading "${s.text}" has no finite verb. Headings are sentences that are true, not noun phrases.`);
    if (/^[\w ]+, every [\w ]+$/i.test(s.text) || /^the [\w ]+ for [\w ]+$/i.test(s.text))
      add('slogan-shape', `heading "${s.text}" is the two beat slogan pattern.`);
  }
  const headings = strings.filter((s) => s.kind === 'heading');
  for (const h of headings) {
    const n = words(h.text).length;
    if (n > S.headlineWords)
      add('headline-words', `heading is ${n} words, ceiling is ${S.headlineWords}: "${h.text}"`);
  }

  // 4 banned phrases, abstraction, volume, exclamation, em dash
  for (const b of BANNED) { const i = lower.indexOf(b); if (i > -1) add('banned-phrase', `"${b}" (SaaS reflex) near "...${all.slice(Math.max(0, i - 24), i + b.length + 24).trim()}..."`); }
  for (const b of ABSTRACTION) if (lower.includes(b)) add('abstraction', `"${b}" is above the altitude of the moment's nouns. Name the thing a hand can hold.`);
  if (S.volume === 'quiet') {
    for (const u of URGENCY) if (lower.includes(u)) add('volume', `"${u}" is louder than the moment's sound row.`);
    const ex = (all.match(/!/g) || []).length;
    if (ex) add('exclamation', `${ex} exclamation mark(s) in a scene whose sound row is near silence.`);
  }
  if (DASH_RE.test(all)) add('em-dash', 'copy contains an em or en dash.');
  if (/\b(lorem ipsum|dolor sit)\b/i.test(all)) add('lorem', 'placeholder latin.');

  // 5 person: the pronoun set the gaze row forces
  const expected = PRONOUNS[S.person] || PRONOUNS.second;
  const tokens = words(all).map((w) => w.toLowerCase());
  const countOf = (set) => tokens.filter((t) => set.includes(t)).length;
  const mine = countOf(expected);
  for (const [name, set] of Object.entries(PRONOUNS)) {
    if (name === S.person) continue;
    if (name === 'second-imperative' || (S.person === 'second-imperative' && name === 'second')) continue;
    const n = countOf(set.filter((p) => !expected.includes(p)));
    if (n >= 2 && n > mine)
      add('person', `${n} ${name}-person pronouns against ${mine} in the moment's person (${S.person}). The gaze row sets the person; pick one and hold it.`);
  }

  // 6 brand echo
  if (S.brand) {
    const re = new RegExp(`\\b${S.brand}\\b`, 'gi');
    const inBody = strings.filter((s) => !s.brandSlot).map((s) => s.text).join(' ');
    const n = (inBody.match(re) || []).length;
    const allowed = Math.max(1, Math.ceil(words(inBody).length / 150));
    if (n > allowed) add('brand-echo', `"${S.brand}" is the subject ${n} times in ${words(inBody).length} words of copy; allowed ${allowed}. The reader knows whose page this is.`);
  }

  // 7 prop leak: rule zero, enforced on words
  for (const p of S.props) if (new RegExp(`\\b${p}\\b`, 'i').test(all))
    add('prop-leak', `"${p}" is a prop from the scene. Carry the light and the feeling, never the props.`);

  // 8 state coverage: every state name in the spec is an element carrying data-state
  const covered = new Set(strings.map((s) => s.state).filter((s) => s && S.states.includes(s)));
  const missing = S.states.filter((s) => !covered.has(s));
  if (missing.length && opts.checkStates !== false) add('state-coverage', `${covered.size}/${S.states.length} states written. Missing: ${missing.join(', ')}. Mark each with data-state.`);

  // 9 label case
  if (S.labelCase === 'sentence') {
    for (const s of strings) {
      if (words(s.text).length > 6) continue;
      if (/^[A-Z0-9][A-Za-z0-9'’-]*(\s+[A-Z][A-Za-z'’-]+)+$/.test(s.text) && !/^(I|A)\b/.test(s.text))
        add('label-case', `"${s.text}" is Title Case. This moment's document was written by hand; labels are sentence case.`);
      if (/^[A-Z][A-Z\s]{4,}$/.test(s.text))
        add('label-case', `"${s.text}" is set in caps. No uppercase label in a scene written in pen.`);
    }
  }

  return {
    file, strings: strings.length, words: totalWords, sentences: lens.length, beats: beats.length,
    median: med, states: `${covered.size}/${S.states.length}`, findings, pass: findings.length === 0,
  };
}

function report(r) {
  const head = `${r.pass ? 'PASS' : 'FAIL'} ${r.file}: strings=${r.strings} words=${r.words} sentences=${r.sentences} beats=${r.beats} median=${r.median} states=${r.states} findings=${r.findings.length}`;
  return [head, ...r.findings.map((f) => '  - ' + f)].join('\n');
}

const argv = process.argv.slice(2);
if (process.argv[1] && process.argv[1].endsWith('copy-lint.mjs')) {
  const specArg = argv.includes('--spec') ? argv[argv.indexOf('--spec') + 1] : null;
  const hookMode = argv.includes('--hook');
  if (argv.includes('--spec') && (!specArg || !fs.existsSync(specArg))) {
    // No voice.json yet (the project has not reached step 5b): a hook has nothing to
    // lint against and must never block a write. The CLI form still reports usage.
    if (hookMode) process.exit(0);
    console.error(`usage: --spec needs a voice.json that exists (got "${specArg || ''}")`); process.exit(2);
  }
  const spec = specArg ? JSON.parse(fs.readFileSync(specArg, 'utf8')) : {};
  if (hookMode) {
    let raw = '';
    process.stdin.on('data', (d) => (raw += d));
    process.stdin.on('end', () => {
      let payload = {}; try { payload = JSON.parse(raw || '{}'); } catch { process.exit(0); }
      const input = payload.tool_input || {};
      const target = input.file_path || '';
      if (!/\.(html|htm|jsx|tsx|md)$/i.test(target)) process.exit(0);
      let text = input.content ?? input.new_string ?? '';
      if (!text && target && fs.existsSync(target)) text = fs.readFileSync(target, 'utf8');
      // state-coverage is a whole-document rule for markup surfaces. A markdown brief,
      // a snippet Edit or a partial component never carries all six states.
      const checkStates = /\.(html|htm|jsx|tsx)$/i.test(target) && /<body[\s>]/i.test(text);
      const r = lintCopy(text, { file: target, spec, checkStates });
      if (r.strings === 0 || r.pass) process.exit(0);
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse', permissionDecision: 'deny',
          permissionDecisionReason: 'foldlight copy lint: ' + r.findings.slice(0, 4).join(' | '),
          additionalContext: report(r),
        },
      }));
      process.exit(0);
    });
  } else {
    const file = argv.find((a) => !a.startsWith('--') && a !== specArg);
    if (!file) { console.error('usage: copy-lint.mjs <file.html|file.md|copy.json> --spec docs/voice.json [--json]'); process.exit(2); }
    const r = lintCopy(fs.readFileSync(path.resolve(file), 'utf8'), { file, spec });
    console.log(argv.includes('--json') ? JSON.stringify(r, null, 2) : report(r));
    process.exit(r.pass ? 0 : 1);
  }
}
