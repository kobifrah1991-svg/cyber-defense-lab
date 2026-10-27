// Copies the static web app into www/ — the folder Capacitor packages into the Android app.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const ENTRIES = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons', 'img'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const e of ENTRIES) {
  const src = join(root, e);
  if (existsSync(src)) cpSync(src, join(out, e), { recursive: true, filter: p => !p.endsWith('README.md') });
}
console.log('web app copied to www/');
