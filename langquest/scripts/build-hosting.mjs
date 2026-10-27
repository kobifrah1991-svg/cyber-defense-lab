// Builds dist/ for Firebase Hosting: the web app at the root and the landing page at /site/
// ("/" redirects to /site/ — see firebase.json; the landing page links back to ../index.html).
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(join(root, 'www'), out, { recursive: true });
cpSync(join(root, 'site'), join(out, 'site'), { recursive: true, filter: p => !p.endsWith('README.md') });
console.log('hosting bundle written to dist/');
