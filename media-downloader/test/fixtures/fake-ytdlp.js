#!/usr/bin/env node
// Stand-in for yt-dlp in tests: same CLI shape, canned answers, no network.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const url = args[args.indexOf('--') + 1] || '';
const opt = name => args[args.indexOf(name) + 1];
const sleep = ms => new Promise(r => setTimeout(r, ms));

if (args.includes('--version')) {
  console.log('2099.01.01-fake');
  process.exit(0);
}
if (url.includes('private')) {
  console.error('ERROR: [Instagram] abc: This content is private. Use --cookies, login required');
  process.exit(1);
}
if (url.includes('gone')) {
  console.error('ERROR: [youtube] xyz: Video unavailable. This video has been removed');
  process.exit(1);
}

if (args.includes('-J')) {
  if (url.includes('list=')) {
    console.log(JSON.stringify({ _type: 'playlist', title: 'Mix', entries: [] }));
    process.exit(0);
  }
  console.log(JSON.stringify({
    id: 'abc123',
    title: 'סרטון בדיקה: "quotes" / slashes?',
    uploader: 'Skitdra Labs',
    duration: 125.4,
    thumbnail: 'https://i.example.com/thumb.jpg',
    formats: [
      { format_id: '18', height: 360, vcodec: 'avc1', acodec: 'mp4a' },
      { format_id: '136', height: 720, vcodec: 'avc1', acodec: 'none' },
      { format_id: '137', height: 1080, vcodec: 'avc1', acodec: 'none' },
      { format_id: '140', vcodec: 'none', acodec: 'mp4a' },
    ],
  }));
  process.exit(0);
}

if (url.includes('huge')) {
  console.error('ERROR: File is larger than max-filesize (999999999 bytes > 524288000 bytes). Aborting.');
  process.exit(1);
}

const dir = opt('-P');
const ext = args.includes('-x') ? 'mp3' : 'mp4';
const delay = url.includes('slow') ? 900 : 20;
console.log(`[download] Destination: ${path.join(dir, 'abc123.f137.mp4')}`);
for (const done of [250, 500, 1000]) {
  console.log(`MDP ${done} 1000 NA 2048 ${Math.round((1000 - done) / 250)}`);
  await sleep(delay);
}
if (ext === 'mp4') {
  console.log(`[download] Destination: ${path.join(dir, 'abc123.f140.m4a')}`);
  console.log('MDP 100 NA 100 4096 0');
  console.log(`[Merger] Merging formats into "${path.join(dir, 'abc123.mp4')}"`);
} else {
  console.log(`[ExtractAudio] Destination: ${path.join(dir, 'abc123.mp3')}`);
}
await sleep(delay);
writeFileSync(path.join(dir, `abc123.${ext}`), `fake ${ext} for ${url}`);
