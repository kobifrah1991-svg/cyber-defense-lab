// Assembles the app's web content into www/: the app shell, the shared downloader client,
// the built CSS and the vendored fonts/icons, plus config.js generated from environment variables.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.join(here, '..');
const repo = path.join(app, '..');
const www = path.join(app, 'www');

const env = name => (process.env[name] || '').trim();
const pkg = JSON.parse(readFileSync(path.join(app, 'package.json'), 'utf8'));

const apiBase = env('MDP_API_BASE').replace(/\/+$/, '');
const siteUrl = (env('MDP_SITE_URL') || apiBase).replace(/\/+$/, '');
if (apiBase && !apiBase.startsWith('https://')) {
  console.error('MDP_API_BASE must start with https://');
  process.exit(1);
}
if (!apiBase) {
  console.warn('⚠ MDP_API_BASE is not set: the app will ask for a server address in Settings.');
}

const config = {
  apiBase,
  productId: env('MDP_PRODUCT_ID') || 'premium',
  version: env('MDP_VERSION') || pkg.version,
  links: {
    privacy: siteUrl ? `${siteUrl}/privacy.html` : '',
    terms: siteUrl ? `${siteUrl}/terms.html` : '',
    support: env('MDP_SUPPORT_URL') || (siteUrl ? `${siteUrl}/app.html#faq` : ''),
  },
};

rmSync(www, { recursive: true, force: true });
mkdirSync(path.join(www, 'js'), { recursive: true });
mkdirSync(path.join(www, 'css'), { recursive: true });
cpSync(path.join(app, 'web'), www, { recursive: true });
cpSync(path.join(repo, 'js', 'media-downloader.js'), path.join(www, 'js', 'media-downloader.js'));
cpSync(path.join(repo, 'css', 'media-downloader.css'), path.join(www, 'css', 'media-downloader.css'));
cpSync(path.join(repo, 'css', 'vendor'), path.join(www, 'css', 'vendor'), { recursive: true });
writeFileSync(path.join(www, 'config.js'), `window.MDP_APP_CONFIG = ${JSON.stringify(config, null, 2)};\n`);

console.log(`www/ ready (server: ${apiBase || 'not set'}, product: ${config.productId}, version: ${config.version})`);
