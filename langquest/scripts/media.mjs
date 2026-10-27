// Lists the portrait photos that exist (img/teachers/*.webp, img/npc/*.webp) into img/media.json,
// so the app only requests photos that are really there. Run after adding photos: npm run media
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const img = join(dirname(fileURLToPath(import.meta.url)), '..', 'img');
const list = dir => (existsSync(join(img, dir)) ? readdirSync(join(img, dir)) : [])
  .filter(f => /\.(webp|jpe?g|png)$/i.test(f)).sort();
const media = { teachers: list('teachers'), npc: list('npc') };
writeFileSync(join(img, 'media.json'), JSON.stringify(media, null, 2) + '\n');
console.log('img/media.json:', JSON.stringify(media));
