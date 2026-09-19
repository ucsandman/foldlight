#!/usr/bin/env node
// selftest.mjs - the skill checking its own parts.
//   node selftest.mjs --no-em-dash <files...>   U+2014 count per file, exit 1 on any
//   node selftest.mjs                           atlas, aliases and envelope names agree
// Exit 0 pass, 1 findings, 2 usage, 3 a module or reference it reads is missing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const die = (code, msg) => { console.error('selftest: ' + msg); process.exit(code); };
const say = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); return ok ? 0 : 1; };
const done = (bad, msg) => { console.log(`${bad ? 'FAIL' : 'PASS'} ${msg} findings=${bad}`); process.exit(bad ? 1 : 0); };

if (argv[0] === '--no-em-dash') {
  const files = argv.slice(1), EM = new RegExp(String.fromCharCode(0x2014), 'g');
  if (!files.length) die(2, 'usage: selftest.mjs --no-em-dash <files...>');
  done(files.reduce((acc, f) => {
    const n = fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(EM) || []).length : -1;
    return acc + say(n === 0, `${f}: em-dash=${n < 0 ? 'file missing' : n}`);
  }, 0), `no-em-dash: scanned=${files.length}`);
}
if (argv.length) die(2, 'usage: selftest.mjs [--no-em-dash <files...>]');

const need = async (f, ...names) => {
  try { const m = await import(f); if (names.some((n) => !m[n])) throw new Error('no export'); return m; }
  catch (e) { die(3, `scripts/${f.slice(2)} is missing or does not export ${names.join(' and ')} (${e.code || e.message})`); }
};
const { ATLAS, DOC_ALIASES } = await need('./fold.mjs', 'ATLAS', 'DOC_ALIASES');
const { METRICS } = await need('./silhouette-lint.mjs', 'METRICS');
const md = path.join(HERE, '..', 'references', 'folds.md');
if (!fs.existsSync(md)) die(3, `${md} is missing`);
const doc = fs.readFileSync(md, 'utf8'), keys = Object.keys(ATLAS);
const env = [...new Set(keys.flatMap((k) => Object.keys(ATLAS[k].envelope || {})))];
const stray = env.filter((n) => !METRICS.includes(n)), absent = keys.filter((k) => !new RegExp(`\\b${k}\\b`).test(doc));
done(say(keys.length === 12, `atlas keys=${keys.length}/12`)
  + say(Object.keys(DOC_ALIASES).length === 37, `document aliases=${Object.keys(DOC_ALIASES).length}/37`)
  + say(!stray.length, `envelope metrics=${env.length} against METRICS=${METRICS.length}${stray.length ? ': missing ' + stray.join(', ') : ''}`)
  + say(!absent.length, `fold keys in folds.md=${keys.length - absent.length}/${keys.length}${absent.length ? ': absent ' + absent.join(', ') : ''}`), 'selftest: checks=4');
