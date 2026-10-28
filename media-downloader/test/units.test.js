import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeFileName } from '../src/app.js';
import { RateLimiter, TtlCache } from '../src/limits.js';
import { classifyError, parseProgressLine } from '../src/ytdlp.js';

test('parseProgressLine reads the progress template', () => {
  assert.deepEqual(parseProgressLine('MDP 512 1024 NA 100.5 5'), {
    downloadedBytes: 512, totalBytes: 1024, percent: 50, speed: 100.5, eta: 5,
  });
  assert.equal(parseProgressLine('MDP 10 NA 40 NA NA').percent, 25);
  assert.equal(parseProgressLine('MDP 10 NA NA NA NA').percent, null);
  assert.equal(parseProgressLine('[download] 50%'), null);
});

test('classifyError maps yt-dlp errors to friendly codes', () => {
  assert.equal(classifyError('ERROR: This content is private').code, 'private');
  assert.equal(classifyError('ERROR: Sign in to confirm your age').code, 'private');
  assert.equal(classifyError('ERROR: File is larger than max-filesize').code, 'too_large');
  assert.equal(classifyError('ERROR: Unsupported URL: https://x').code, 'unsupported');
  assert.equal(classifyError('ERROR: Video unavailable').code, 'unavailable');
  assert.equal(classifyError('HTTP Error 429: Too Many Requests').code, 'rate_limited');
  assert.equal(classifyError("ERROR: Unable to download API page: ('Unable to connect to proxy')").code, 'network');
  assert.equal(classifyError('something odd').code, 'failed');
});

test('safeFileName keeps Hebrew and strips unsafe characters', () => {
  assert.equal(safeFileName('סרטון: "בדיקה" / 1?', 'mp4'), 'סרטון בדיקה 1.mp4');
  assert.equal(safeFileName('../../etc/passwd', 'mp3'), 'etc passwd.mp3');
  assert.equal(safeFileName('', 'mp4'), 'media.mp4');
  assert.equal(safeFileName('a\u0000b\nc', 'exe;rm'), 'a b c.bin');
  assert.equal(safeFileName('x'.repeat(200), 'mp4').length, 84);
});

test('RateLimiter blocks after the limit and resets after the window', () => {
  const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(limiter.take('a', 0), 0);
  assert.equal(limiter.take('a', 10), 0);
  assert.equal(limiter.take('a', 20), 1);
  assert.equal(limiter.take('b', 20), 0);
  assert.equal(limiter.take('a', 1000), 0);
});

test('TtlCache expires and evicts', () => {
  const cache = new TtlCache({ ttlMs: 100, maxEntries: 2 });
  cache.set('a', 1, 0);
  cache.set('b', 2, 0);
  assert.equal(cache.get('a', 50), 1);
  cache.set('c', 3, 0);
  assert.equal(cache.get('a', 50), undefined);
  assert.equal(cache.get('c', 150), undefined);
});
