import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { buildOptions, parseChoice } from './formats.js';
import { RateLimiter, TtlCache } from './limits.js';
import { PLATFORMS, parseMediaUrl } from './urls.js';
import { YtdlpError } from './ytdlp.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Thumbnails come from each platform's CDN.
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

// Keeps the download name readable (Hebrew included) but safe for every filesystem.
export function safeFileName(title, ext) {
  const base = String(title || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+/, '')
    .slice(0, 80)
    .trim();
  const safeExt = /^[a-z0-9]{1,5}$/i.test(ext || '') ? ext.toLowerCase() : 'bin';
  return `${base || 'media'}.${safeExt}`;
}

function sendError(res, status, code, message, extra = {}) {
  res.status(status).json({ error: { code, message }, ...extra });
}

function statusForError(err) {
  if (!(err instanceof YtdlpError)) return 500;
  switch (err.code) {
    case 'private':
    case 'unsupported':
    case 'unavailable':
    case 'too_large':
      return 422;
    case 'rate_limited':
    case 'busy':
    case 'busy_client':
      return 429;
    case 'timeout':
      return 504;
    case 'missing':
      return 503;
    default:
      return 502;
  }
}

function publicInfo(info, platform, hasFfmpeg) {
  return {
    platform,
    title: typeof info.title === 'string' ? info.title.slice(0, 300) : '',
    uploader: typeof (info.uploader || info.channel) === 'string' ? (info.uploader || info.channel).slice(0, 120) : '',
    duration: Number.isFinite(info.duration) ? Math.round(info.duration) : null,
    thumbnail: typeof info.thumbnail === 'string' && info.thumbnail.startsWith('https://') ? info.thumbnail : null,
    options: buildOptions(info, hasFfmpeg),
  };
}

function publicJob(job) {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    stream: job.stream,
    title: job.title,
    platform: job.platform,
    progress: job.progress,
    error: job.error,
    fileSize: job.fileSize,
    fileName: job.status === 'done' ? safeFileName(job.title, path.extname(job.filePath).slice(1)) : null,
  };
}

export function createApp({ config, ytdlp, jobs, hasFfmpeg, ytdlpVersion }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  const infoLimiter = new RateLimiter({ limit: config.infoPerMinute, windowMs: 60_000 });
  const downloadLimiter = new RateLimiter({ limit: config.downloadsPer10Min, windowMs: 10 * 60_000 });
  const infoCache = new TtlCache({ ttlMs: 10 * 60_000, maxEntries: 500 });

  app.use((req, res, next) => {
    res.set(SECURITY_HEADERS);
    next();
  });

  const limit = limiter => (req, res, next) => {
    const retryAfter = limiter.take(req.ip);
    if (!retryAfter) return next();
    res.set('Retry-After', String(retryAfter));
    sendError(res, 429, 'rate_limited', `יותר מדי בקשות. נסו שוב בעוד ${retryAfter} שניות`);
  };

  const api = express.Router();
  api.use(express.json({ limit: '4kb' }));
  api.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  api.get('/health', (req, res) => {
    res.json({
      ok: Boolean(ytdlpVersion),
      ytdlp: ytdlpVersion,
      ffmpeg: hasFfmpeg,
      platforms: PLATFORMS.map(p => p.name),
      maxFilesizeMb: config.maxFilesizeMb,
    });
  });

  async function loadInfo(url) {
    const cached = infoCache.get(url);
    if (cached) return cached;
    const info = await ytdlp.info(url);
    if (info._type === 'playlist') {
      throw new YtdlpError('unsupported', 'זה קישור לרשימת השמעה. הדביקו קישור לסרטון אחד');
    }
    infoCache.set(url, info);
    return info;
  }

  api.post('/info', limit(infoLimiter), async (req, res) => {
    const parsed = parseMediaUrl(req.body?.url);
    if (!parsed.ok) return sendError(res, 400, 'invalid_url', parsed.error);
    try {
      const info = await loadInfo(parsed.url);
      res.json({ url: parsed.url, ...publicInfo(info, parsed.platform, hasFfmpeg) });
    } catch (err) {
      sendError(res, statusForError(err), err.code || 'failed', err instanceof YtdlpError ? err.message : 'שגיאה בשרת');
    }
  });

  api.post('/jobs', limit(downloadLimiter), async (req, res) => {
    const parsed = parseMediaUrl(req.body?.url);
    if (!parsed.ok) return sendError(res, 400, 'invalid_url', parsed.error);
    const choice = parseChoice(req.body?.option);
    if (!choice) return sendError(res, 400, 'invalid_option', 'אפשרות הורדה לא תקינה');
    try {
      const info = await loadInfo(parsed.url);
      const job = jobs.create({
        url: parsed.url,
        platform: parsed.platform,
        choice,
        title: typeof info.title === 'string' ? info.title : '',
        client: req.ip,
      });
      res.status(202).json(publicJob(job));
    } catch (err) {
      sendError(res, statusForError(err), err.code || 'failed', err instanceof YtdlpError ? err.message : 'שגיאה בשרת');
    }
  });

  api.get('/jobs/:id', (req, res) => {
    const job = UUID.test(req.params.id) && jobs.get(req.params.id);
    if (!job) return sendError(res, 404, 'not_found', 'ההורדה לא נמצאה או שפג תוקפה');
    res.json(publicJob(job));
  });

  api.get('/jobs/:id/file', (req, res) => {
    const job = UUID.test(req.params.id) && jobs.get(req.params.id);
    if (!job || job.status !== 'done' || !job.filePath) {
      return sendError(res, 404, 'not_found', 'הקובץ לא נמצא או שפג תוקפו');
    }
    const name = safeFileName(job.title, path.extname(job.filePath).slice(1));
    res.download(job.filePath, name, err => {
      if (err && !res.headersSent) sendError(res, 404, 'not_found', 'הקובץ לא נמצא');
    });
  });

  api.use((req, res) => sendError(res, 404, 'not_found', 'נתיב לא קיים'));
  api.use((err, req, res, next) => {
    if (err.type === 'entity.too.large' || err.type === 'entity.parse.failed') {
      return sendError(res, 400, 'bad_request', 'בקשה לא תקינה');
    }
    next(err);
  });
  app.use('/api', api);

  // The static site: only these files and folders are public, never the server source.
  const page = file => (req, res) => res.sendFile(path.join(config.siteRoot, file));
  app.get('/', page('products.html'));
  for (const file of ['index.html', 'products.html', 'media-downloader.html']) {
    if (existsSync(path.join(config.siteRoot, file))) app.get(`/${file}`, page(file));
  }
  app.use('/css', express.static(path.join(config.siteRoot, 'css'), { maxAge: '1h' }));
  app.use('/js', express.static(path.join(config.siteRoot, 'js'), { maxAge: '1h' }));

  app.use((req, res) => res.status(404).type('text').send('Not found'));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    if (!res.headersSent) sendError(res, 500, 'server_error', 'שגיאה בשרת');
  });

  return app;
}
