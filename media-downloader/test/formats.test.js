import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildOptions, formatArgs, parseChoice } from '../src/formats.js';

const fmt = (height, acodec = 'none') => ({ height, vcodec: 'avc1', acodec });

test('offers at most four real qualities plus audio', () => {
  const info = { formats: [fmt(360, 'mp4a'), fmt(720), fmt(1080), fmt(2160)] };
  assert.deepEqual(buildOptions(info, true).map(o => o.id), ['v2160', 'v1440', 'v1080', 'v720', 'audio']);
  assert.equal(buildOptions(info, true)[0].label, '4K');
});

test('does not offer qualities above the source', () => {
  const ids = buildOptions({ formats: [fmt(720, 'mp4a')] }, true).map(o => o.id);
  assert.deepEqual(ids, ['v720', 'v480', 'v360', 'audio']);
  assert.ok(buildOptions({ formats: [fmt(1072, 'mp4a')] }, true).some(o => o.id === 'v1080'));
});

test('handles low-res, audio-only and silent media', () => {
  assert.deepEqual(buildOptions({ formats: [fmt(240, 'aac')] }, true).map(o => o.id), ['best', 'audio']);
  assert.deepEqual(buildOptions({ formats: [{ vcodec: 'none', acodec: 'mp3' }] }, true).map(o => o.id), ['audio']);
  assert.deepEqual(buildOptions({ formats: [fmt(480)] }, true).map(o => o.id), ['v480', 'v360']);
  assert.equal(buildOptions({ formats: [fmt(480, 'aac')] }, false).at(-1).label, 'M4A');
  // Direct file links come back without codec or height info.
  assert.deepEqual(buildOptions({ formats: [{ ext: 'mp4', video_ext: 'mp4', audio_ext: 'none' }] }, true).map(o => o.id), ['best', 'audio']);
  assert.deepEqual(buildOptions({ formats: [{ vcodec: 'none', acodec: 'opus', video_ext: 'none' }] }, true).map(o => o.id), ['audio']);
});

test('parseChoice only accepts known ids', () => {
  assert.deepEqual(parseChoice('v1080'), { kind: 'video', height: 1080 });
  assert.deepEqual(parseChoice('audio'), { kind: 'audio' });
  assert.deepEqual(parseChoice('best'), { kind: 'video', height: null });
  for (const bad of ['v999', 'v1080 --exec x', 'V1080', '', null, undefined, 'mp3', ['v720']]) {
    assert.equal(parseChoice(bad), null, String(bad));
  }
});

test('formatArgs uses merging only when ffmpeg is available', () => {
  assert.ok(formatArgs({ kind: 'video', height: 720 }, true).includes('--merge-output-format'));
  assert.deepEqual(formatArgs({ kind: 'video', height: 720 }, false), ['-f', 'b[height<=720][ext=mp4]/b[height<=720]/b']);
  assert.ok(formatArgs({ kind: 'audio' }, true).includes('-x'));
  assert.ok(!formatArgs({ kind: 'audio' }, false).includes('-x'));
});
