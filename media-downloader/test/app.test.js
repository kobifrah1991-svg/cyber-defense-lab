import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { JobManager } from '../src/jobs.js';
import { Ytdlp } from '../src/ytdlp.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FAKE = `${process.execPath} ${path.join(here, 'fixtures', 'fake-ytdlp.js')}`;

let server;
let base;
let jobs;
let tmpRoot;

async function start(overrides = {}) {
  const config = { ...loadConfig(), ...overrides };
  const ytdlp = new Ytdlp({ command: FAKE, maxFilesize: 1024 * 1024, infoTimeoutMs: 10_000, downloadTimeoutMs: 10_000 });
  const manager = new JobManager({
    ytdlp, hasFfmpeg: true, maxConcurrent: 2, maxQueued: 5, maxActivePerClient: 2, ttlMs: 60_000, tmpRoot,
  });
  const app = createApp({ config, ytdlp, jobs: manager, hasFfmpeg: true, ytdlpVersion: await ytdlp.version() });
  const srv = await new Promise(resolve => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  return { srv, manager, url: `http://127.0.0.1:${srv.address().port}` };
}

before(async () => {
  tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'mdp-test-'));
  ({ srv: server, manager: jobs, url: base } = await start());
});

after(async () => {
  await jobs.close();
  server.close();
  await rm(tmpRoot, { recursive: true, force: true });
});

const post = (url, body) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

async function waitForJob(id) {
  for (let i = 0; i < 100; i += 1) {
    const job = await (await fetch(`${base}/api/jobs/${id}`)).json();
    if (job.status === 'done' || job.status === 'error') return job;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error('job did not finish');
}

test('health reports yt-dlp and ffmpeg', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.ytdlp, '2099.01.01-fake');
  assert.equal(body.ffmpeg, true);
});

test('info returns sanitized metadata and real options', async () => {
  const res = await post(`${base}/api/info`, { url: 'https://www.youtube.com/watch?v=abc123' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.platform.id, 'youtube');
  assert.equal(body.uploader, 'Skitdra Labs');
  assert.equal(body.duration, 125);
  assert.deepEqual(body.options.map(o => o.id), ['v1080', 'v720', 'v480', 'v360', 'audio']);
  assert.equal(body.formats, undefined, 'raw yt-dlp data is not leaked');
});

test('info rejects bad URLs and maps platform errors', async () => {
  let res = await post(`${base}/api/info`, { url: 'http://169.254.169.254/' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'invalid_url');

  res = await post(`${base}/api/info`, { url: 'https://www.instagram.com/p/private1/' });
  assert.equal(res.status, 422);
  assert.equal((await res.json()).error.code, 'private');

  res = await post(`${base}/api/info`, { url: 'https://www.youtube.com/watch?v=gone' });
  assert.equal((await res.json()).error.code, 'unavailable');

  res = await post(`${base}/api/info`, { url: 'https://www.youtube.com/playlist?list=PL1' });
  assert.equal(res.status, 422);
});

test('bad JSON and oversized bodies get a clean 400', async () => {
  let res = await fetch(`${base}/api/info`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{nope' });
  assert.equal(res.status, 400);
  res = await post(`${base}/api/info`, { url: 'https://youtube.com/' + 'a'.repeat(5000) });
  assert.equal(res.status, 400);
});

test('video download: job runs, reports progress and serves the file with a safe name', async () => {
  const res = await post(`${base}/api/jobs`, { url: 'https://youtu.be/abc123', option: 'v720' });
  assert.equal(res.status, 202);
  const { id, status } = await res.json();
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.ok(['queued', 'downloading'].includes(status));

  const job = await waitForJob(id);
  assert.equal(job.status, 'done', JSON.stringify(job.error));
  assert.equal(job.fileName, 'סרטון בדיקה quotes slashes.mp4');
  assert.equal(job.progress.percent, 100);

  const file = await fetch(`${base}/api/jobs/${id}/file`);
  assert.equal(file.status, 200);
  assert.match(file.headers.get('content-disposition'), /filename\*=UTF-8''/);
  assert.equal(await file.text(), 'fake mp4 for https://youtu.be/abc123');
});

test('audio download produces an mp3', async () => {
  const res = await post(`${base}/api/jobs`, { url: 'https://soundcloud.com/a/b', option: 'audio' });
  const job = await waitForJob((await res.json()).id);
  assert.equal(job.status, 'done');
  assert.match(job.fileName, /\.mp3$/);
});

test('download errors are reported on the job and leave no files', async () => {
  const res = await post(`${base}/api/jobs`, { url: 'https://vimeo.com/huge', option: 'v720' });
  const job = await waitForJob((await res.json()).id);
  assert.equal(job.status, 'error');
  assert.equal(job.error.code, 'too_large');
  const leftovers = (await readdir(tmpRoot)).length;
  const files = await fetch(`${base}/api/jobs/${job.id}/file`);
  assert.equal(files.status, 404);
  assert.ok(leftovers <= 2, 'only finished jobs keep a folder');
});

test('jobs validate the option and ids', async () => {
  let res = await post(`${base}/api/jobs`, { url: 'https://youtu.be/abc123', option: 'v1080; rm -rf /' });
  assert.equal(res.status, 400);
  res = await fetch(`${base}/api/jobs/not-a-uuid`);
  assert.equal(res.status, 404);
  res = await fetch(`${base}/api/jobs/00000000-0000-4000-8000-000000000000/file`);
  assert.equal(res.status, 404);
});

test('per-client active job limit', async () => {
  const urls = ['https://youtu.be/slow1', 'https://youtu.be/slow2', 'https://youtu.be/slow3'];
  const statuses = [];
  for (const url of urls) statuses.push((await post(`${base}/api/jobs`, { url, option: 'v360' })).status);
  assert.deepEqual(statuses, [202, 202, 429]);
});

test('rate limit returns 429 with Retry-After', async () => {
  const limited = await start({ infoPerMinute: 1 });
  try {
    const body = { url: 'https://www.youtube.com/watch?v=abc123' };
    assert.equal((await post(`${limited.url}/api/info`, body)).status, 200);
    const res = await post(`${limited.url}/api/info`, body);
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers.get('retry-after')) > 0);
  } finally {
    await limited.manager.close();
    limited.srv.close();
  }
});

test('serves the site with security headers but never the server source', async () => {
  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /המוצרים שלנו/);
  assert.match(home.headers.get('content-security-policy'), /script-src 'self'/);
  assert.equal(home.headers.get('x-frame-options'), 'DENY');
  assert.equal(home.headers.get('x-powered-by'), null);

  assert.equal((await fetch(`${base}/media-downloader.html`)).status, 200);
  assert.equal((await fetch(`${base}/js/media-downloader.js`)).status, 200);
  assert.equal((await fetch(`${base}/css/media-downloader.css`)).status, 200);

  for (const p of ['/media-downloader/package.json', '/media-downloader/src/app.js', '/README.md', '/.git/config', '/css/../media-downloader/package.json', '/js/%2e%2e/media-downloader/src/app.js']) {
    assert.equal((await fetch(`${base}${p}`)).status, 404, p);
  }
});
