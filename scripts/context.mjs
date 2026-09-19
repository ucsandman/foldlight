#!/usr/bin/env node
// Project probe for sense-memory. Prints a compact block the skill reads before step 1.
// Never exits non-zero: a failing probe would abort the skill invocation.
//
//   node context.mjs [projectDir]

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || process.cwd());
const out = [];
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch { return ''; } };
const walk = (dir, depth, acc = []) => {
  if (depth < 0) return acc;
  let entries = [];
  try { entries = fs.readdirSync(path.join(root, dir), { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (['node_modules', '.git', '.next', 'dist', 'build', 'out', '.turbo', 'coverage'].includes(e.name)) continue;
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) walk(rel, depth - 1, acc); else acc.push(rel);
  }
  return acc;
};

const files = walk('.', 4);

// 1. Existing moment
const designMd = ['docs/DESIGN.md', 'DESIGN.md', '.agents/context/DESIGN.md'].find(exists);
const momentJson = ['docs/sense-memory.json', '.agents/context/sense-memory.json'].find(exists);
if (momentJson) {
  try {
    const j = JSON.parse(read(momentJson));
    out.push(`MOMENT_EXISTS ${momentJson}: "${j.moment?.title || j.title || '(untitled)'}" register=${j.register || '?'}`);
  } catch { out.push(`MOMENT_EXISTS ${momentJson} (unparseable)`); }
} else if (designMd && /sense memory/i.test(read(designMd))) {
  out.push(`MOMENT_EXISTS ${designMd} (Sense memory section present)`);
} else {
  out.push('MOMENT_NONE');
}
out.push(designMd ? `DESIGN_MD ${designMd}` : 'DESIGN_MD none');
out.push(exists('PRODUCT.md') ? 'PRODUCT_MD PRODUCT.md' : 'PRODUCT_MD none');

// 2. Token surface
const tokenCandidates = files.filter((f) => /(tokens?|theme|variables|globals?|app|index|main)\.(css|scss)$/i.test(f) || /tailwind\.config\.(js|ts|mjs|cjs)$/i.test(f) || /theme\.(ts|js|json)$/i.test(f));
const surfaces = [];
for (const f of tokenCandidates.slice(0, 12)) {
  const t = read(f);
  const kind = /@theme\b/.test(t) ? 'tailwind4-@theme' : /tailwind\.config/.test(f) ? 'tailwind-config' : /:root\s*\{/.test(t) ? 'css-vars' : /export\s+(default|const)/.test(t) ? 'js-theme' : null;
  if (kind) surfaces.push(`${f} [${kind}${/oklch\(/.test(t) ? ', oklch' : ''}${/--(bg|surface|ink|accent|muted)\s*:/.test(t) ? ', roles' : ''}]`);
}
out.push(surfaces.length ? 'TOKENS ' + surfaces.join(' ; ') : 'TOKENS none (greenfield: write styles/tokens.css or the framework theme)');

// 3. Fonts already committed
const fontHits = new Set();
for (const f of files.filter((x) => /\.(css|scss|html|tsx|jsx|ts|js)$/i.test(x)).slice(0, 200)) {
  const t = read(f);
  for (const m of t.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^&"'\s]+)/g)) fontHits.add(decodeURIComponent(m[1]).split(':')[0].replace(/\+/g, ' '));
  for (const m of t.matchAll(/next\/font\/google['"][\s\S]{0,200}?\{\s*(\w+)/g)) fontHits.add(m[1]);
  for (const m of t.matchAll(/font-family\s*:\s*['"]([^'"]+)['"]/g)) fontHits.add(m[1]);
}
out.push(fontHits.size ? 'FONTS ' + [...fontHits].slice(0, 8).join(', ') : 'FONTS none declared');

// 4. Register hints
const routes = files.filter((f) => /^(src\/)?(app|pages)\//.test(f));
const brand = routes.filter((f) => /(^|\/)(page|index)\.(tsx|jsx|mdx?|html)$/.test(f) && !/\/(app|dashboard|settings|admin|account)\//.test(f)).length;
const product = routes.filter((f) => /\/(app|dashboard|settings|admin|account|\(auth\))\//.test(f)).length + files.filter((f) => /(table|chart|sidebar|data-?grid)/i.test(f)).length;
out.push(`REGISTER_HINT brand_signals=${brand} product_signals=${product} -> ${product > brand ? 'product' : brand > 0 ? 'brand' : 'unknown'}`);

// 5. Stack
const pkg = exists('package.json') ? (() => { try { return JSON.parse(read('package.json')); } catch { return {}; } })() : {};
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const stack = ['next', 'react', 'vue', 'svelte', 'astro', 'tailwindcss', '@tailwindcss/vite', 'gsap', 'motion', 'framer-motion', 'lenis'].filter((d) => deps[d]);
out.push('STACK ' + (stack.length ? stack.map((d) => `${d}@${String(deps[d]).replace(/^[\^~]/, '')}`).join(' ') : 'none detected'));
out.push(`SCANNED files=${files.length} root=${root}`);

console.log(out.join('\n'));
