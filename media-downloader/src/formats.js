// Quality presets offered to the user, and the yt-dlp arguments behind each one.
const PRESET_HEIGHTS = [2160, 1440, 1080, 720, 480, 360];
const MAX_VIDEO_OPTIONS = 4;

function heightLabel(height) {
  if (height === 2160) return '4K';
  if (height === 1440) return '2K';
  return `${height}p`;
}

// Option ids are the only thing the client sends back, so they're validated here.
export function parseChoice(id) {
  if (typeof id !== 'string') return null;
  if (id === 'audio') return { kind: 'audio' };
  if (id === 'best') return { kind: 'video', height: null };
  const match = /^v(\d{3,4})$/.exec(id);
  if (match && PRESET_HEIGHTS.includes(Number(match[1]))) {
    return { kind: 'video', height: Number(match[1]) };
  }
  return null;
}

export function buildOptions(info, hasFfmpeg) {
  const formats = Array.isArray(info.formats) && info.formats.length ? info.formats : [info];
  const videoHeights = formats
    .filter(f => f && f.vcodec !== 'none' && Number.isFinite(f.height) && f.height > 0)
    .map(f => f.height);
  // Unknown acodec counts as "maybe audio"; only an explicit 'none' everywhere rules it out (e.g. GIFs on X).
  const hasAudio = formats.some(f => f && f.acodec !== 'none');

  const options = [];
  if (videoHeights.length) {
    const maxHeight = Math.max(...videoHeights);
    // Allow a little slack: 1072p or 1920x1080 crops still count as 1080p.
    const presets = PRESET_HEIGHTS.filter(h => maxHeight >= h * 0.95).slice(0, MAX_VIDEO_OPTIONS);
    for (const height of presets) {
      options.push({ id: `v${height}`, kind: 'video', label: heightLabel(height), ext: 'mp4' });
    }
    if (!presets.length) {
      options.push({ id: 'best', kind: 'video', label: 'האיכות הזמינה', ext: 'mp4' });
    }
  } else if (formats.some(f => f && f.vcodec !== 'none' && f.video_ext !== 'none')) {
    // Video without height metadata (e.g. a direct file link): offer whatever is there.
    options.push({ id: 'best', kind: 'video', label: 'האיכות הזמינה', ext: 'mp4' });
  }
  if (hasAudio) {
    options.push({ id: 'audio', kind: 'audio', label: hasFfmpeg ? 'MP3' : 'M4A', ext: hasFfmpeg ? 'mp3' : 'm4a' });
  }
  return options;
}

export function formatArgs(choice, hasFfmpeg) {
  if (choice.kind === 'audio') {
    return hasFfmpeg
      ? ['-f', 'ba/b', '-x', '--audio-format', 'mp3', '--audio-quality', '0']
      : ['-f', 'ba[ext=m4a]/ba/b'];
  }

  const h = choice.height;
  if (hasFfmpeg) {
    // Prefer H.264/AAC in MP4 so the file plays everywhere, capped at the chosen height.
    const sort = h ? `res:${h},ext:mp4:m4a` : 'ext:mp4:m4a';
    return ['-f', 'bv*+ba/b', '-S', sort, '--merge-output-format', 'mp4'];
  }
  // Without ffmpeg only single-file (progressive) formats can be downloaded.
  return h
    ? ['-f', `b[height<=${h}][ext=mp4]/b[height<=${h}]/b`]
    : ['-f', 'b[ext=mp4]/b'];
}
