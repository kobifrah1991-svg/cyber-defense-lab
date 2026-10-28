// Copies the Font Awesome stylesheet and woff2 fonts into the site, so pages don't depend on a CDN.
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '..', 'node_modules', '@fortawesome', 'fontawesome-free');
const dest = path.join(here, '..', '..', 'css', 'vendor', 'fontawesome');

rmSync(dest, { recursive: true, force: true });
mkdirSync(path.join(dest, 'css'), { recursive: true });
mkdirSync(path.join(dest, 'webfonts'), { recursive: true });
cpSync(path.join(src, 'css', 'all.min.css'), path.join(dest, 'css', 'all.min.css'));
cpSync(path.join(src, 'LICENSE.txt'), path.join(dest, 'LICENSE.txt'));
for (const file of readdirSync(path.join(src, 'webfonts')).filter(f => f.endsWith('.woff2'))) {
  cpSync(path.join(src, 'webfonts', file), path.join(dest, 'webfonts', file));
}
console.log(`Font Awesome copied to ${path.relative(process.cwd(), dest)}`);
