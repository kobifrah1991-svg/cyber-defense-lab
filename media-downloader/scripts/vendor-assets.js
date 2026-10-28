// Copies Font Awesome and the Heebo font into the site, so pages (and the app) don't depend on a CDN.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const modules = path.join(here, '..', 'node_modules');
const vendor = path.join(here, '..', '..', 'css', 'vendor');

// Font Awesome: stylesheet + woff2 fonts (modern browsers never need the .ttf fallbacks).
const fa = path.join(modules, '@fortawesome', 'fontawesome-free');
const faDest = path.join(vendor, 'fontawesome');
rmSync(faDest, { recursive: true, force: true });
mkdirSync(path.join(faDest, 'css'), { recursive: true });
mkdirSync(path.join(faDest, 'webfonts'), { recursive: true });
cpSync(path.join(fa, 'css', 'all.min.css'), path.join(faDest, 'css', 'all.min.css'));
cpSync(path.join(fa, 'LICENSE.txt'), path.join(faDest, 'LICENSE.txt'));
for (const file of readdirSync(path.join(fa, 'webfonts')).filter(f => f.endsWith('.woff2'))) {
  cpSync(path.join(fa, 'webfonts', file), path.join(faDest, 'webfonts', file));
}

// Heebo variable font: only the Hebrew and Latin subsets.
const heebo = path.join(modules, '@fontsource-variable', 'heebo');
const heeboDest = path.join(vendor, 'heebo');
const subsets = ['hebrew', 'latin', 'latin-ext'];
rmSync(heeboDest, { recursive: true, force: true });
mkdirSync(path.join(heeboDest, 'files'), { recursive: true });
const blocks = readFileSync(path.join(heebo, 'index.css'), 'utf8').split(/(?=\/\* heebo-)/);
const kept = blocks.filter(block => subsets.some(s => block.startsWith(`/* heebo-${s}-wght`)));
writeFileSync(path.join(heeboDest, 'heebo.css'), kept.join('').trim() + '\n');
for (const s of subsets) {
  const file = `heebo-${s}-wght-normal.woff2`;
  cpSync(path.join(heebo, 'files', file), path.join(heeboDest, 'files', file));
}
cpSync(path.join(heebo, 'LICENSE'), path.join(heeboDest, 'LICENSE'));

console.log(`Vendored Font Awesome and Heebo into ${path.relative(process.cwd(), vendor)}`);
