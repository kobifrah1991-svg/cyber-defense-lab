// Allowlist of supported platforms. Only these hosts are ever passed to yt-dlp,
// so the server can't be used to fetch arbitrary or internal URLs (SSRF).
export const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', hosts: ['youtube.com', 'youtu.be'] },
  { id: 'tiktok', name: 'TikTok', hosts: ['tiktok.com'] },
  { id: 'instagram', name: 'Instagram', hosts: ['instagram.com'] },
  { id: 'facebook', name: 'Facebook', hosts: ['facebook.com', 'fb.watch'] },
  { id: 'x', name: 'X', hosts: ['x.com', 'twitter.com'] },
  { id: 'vimeo', name: 'Vimeo', hosts: ['vimeo.com'] },
  { id: 'reddit', name: 'Reddit', hosts: ['reddit.com', 'redd.it'] },
  { id: 'soundcloud', name: 'SoundCloud', hosts: ['soundcloud.com'] },
];

const MAX_URL_LENGTH = 2048;

function findPlatform(hostname) {
  return PLATFORMS.find(p => p.hosts.some(h => hostname === h || hostname.endsWith('.' + h)));
}

// Returns { ok: true, url, platform } or { ok: false, error } with a user-facing message.
export function parseMediaUrl(input) {
  if (typeof input !== 'string' || !input.trim()) {
    return { ok: false, error: 'נא להדביק קישור' };
  }
  const raw = input.trim();
  if (raw.length > MAX_URL_LENGTH) {
    return { ok: false, error: 'הקישור ארוך מדי' };
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: 'זה לא נראה כמו קישור תקין' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'רק קישורי http/https נתמכים' };
  }
  if (url.username || url.password) {
    return { ok: false, error: 'קישורים עם פרטי התחברות אינם נתמכים' };
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    return { ok: false, error: 'קישור לא נתמך' };
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  const platform = findPlatform(hostname);
  if (!platform) {
    return { ok: false, error: 'הפלטפורמה הזו לא נתמכת עדיין' };
  }

  url.protocol = 'https:';
  url.hash = '';
  return { ok: true, url: url.href, platform: { id: platform.id, name: platform.name } };
}
