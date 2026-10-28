import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMediaUrl } from '../src/urls.js';

test('accepts supported platforms and normalizes the URL', () => {
  const r = parseMediaUrl('  http://m.youtube.com/watch?v=abc#t=10 ');
  assert.equal(r.ok, true);
  assert.equal(r.url, 'https://m.youtube.com/watch?v=abc');
  assert.deepEqual(r.platform, { id: 'youtube', name: 'YouTube' });
  assert.equal(parseMediaUrl('https://www.tiktok.com/@u/video/1').platform.id, 'tiktok');
  assert.equal(parseMediaUrl('https://youtu.be/abc').platform.id, 'youtube');
  assert.equal(parseMediaUrl('https://YOUTUBE.COM./watch?v=a').ok, true);
});

test('rejects hosts outside the allowlist, including look-alikes', () => {
  for (const url of [
    'https://youtube.com.evil.example/watch',
    'https://notyoutube.com/watch',
    'https://evil-instagram.com/p/1',
    'http://localhost:8080/',
    'http://127.0.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'https://example.com/video.mp4',
  ]) {
    assert.equal(parseMediaUrl(url).ok, false, url);
  }
});

test('rejects other schemes, credentials, odd ports and junk', () => {
  for (const url of [
    'javascript:alert(1)',
    'file:///etc/passwd',
    'ftp://youtube.com/a',
    'https://user:pw@youtube.com/watch',
    'https://youtube.com:8443/watch',
    'not a url',
    '',
    null,
    { url: 'https://youtube.com' },
    'https://youtube.com/' + 'a'.repeat(3000),
  ]) {
    assert.equal(parseMediaUrl(url).ok, false, String(url).slice(0, 40));
  }
});
