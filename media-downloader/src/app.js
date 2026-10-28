import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { EntitlementSigner } from './billing/entitlements.js';
import { BillingError, summarizeSubscription } from './billing/google-play.js';
import { PlanPolicy } from './billing/plans.js';
import { buildOptions, parseChoice } from './formats.js';
import { RateLimiter, TtlCache } from './limits.js';
import { PLATFORMS, parseMediaUrl } from './urls.js';
import { YtdlpError } from './ytdlp.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PURCHASE_TOKEN = /^[\w.\-:]{10,1024}$/;
// Google Play doesn't allow YouTube downloaders, so the Play app sends X-Client: android and YouTube is refused.
const CLIENT_EXCLUDES = { android: ['youtube'] };
// Entitlements are re-checked with Google at least daily.
const ENTITLEMENT_MAX_MS = 24 * 60 * 60 * 1000;

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
    case 'network':
      return 502;
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

export function createApp({ config, ytdlp, jobs, hasFfmpeg, ytdlpVersion, play = null, signer = null }) {
  const app = express();
  const billing = config.billing;
  const entitlements = signer || new EntitlementSigner(billing.entitlementSecret);
  const policy = new PlanPolicy({
    enabled: Boolean(billing.packageName && play),
    freeDownloadsPerDay: billing.freeDownloadsPerDay,
    freeMaxHeight: billing.freeMaxHeight,
    signer: entitlements,
  });
  const corsOrigins = new Set(config.corsOrigins);
  const excludesFor = req => CLIENT_EXCLUDES[req.get('x-client')] || [];
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  const infoLimiter = new RateLimiter({ limit: config.infoPerMinute, windowMs: 60_000 });
  const downloadLimiter = new RateLimiter({ limit: config.downloadsPer10Min, windowMs: 10 * 60_000 });
  const infoCache = new TtlCache({ ttlMs: 10 * 60_000, maxEntries: 500 });
  const billingLimiter = new RateLimiter({ limit: 20, windowMs: 60_000 });

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
  // The Android app runs the UI from its own origin (https://localhost) and calls this API cross-origin.
  api.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && corsOrigins.has(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Device-Id, X-Client',
        'Access-Control-Max-Age': '600',
      });
      res.vary('Origin');
    }
    if (req.method === 'OPTIONS') return res.status(origin && corsOrigins.has(origin) ? 204 : 403).end();
    next();
  });
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
      billing: policy.enabled ? { productId: billing.productId } : null,
    });
  });

  api.get('/plan', (req, res) => {
    const who = policy.identify(req);
    res.json(policy.describe(who, jobs.activeCount(req.ip)));
  });

  // The app sends the Google Play purchase token; we confirm it with Google and hand back an entitlement.
  api.post('/billing/verify', limit(billingLimiter), async (req, res) => {
    if (!policy.enabled) return sendError(res, 404, 'billing_disabled', 'מנויים לא מופעלים בשרת הזה');
    const { purchaseToken, productId } = req.body || {};
    if (typeof purchaseToken !== 'string' || !PURCHASE_TOKEN.test(purchaseToken)) {
      return sendError(res, 400, 'invalid_purchase', 'פרטי רכישה לא תקינים');
    }
    if (productId !== billing.productId) {
      return sendError(res, 400, 'invalid_purchase', 'מוצר לא מוכר');
    }
    try {
      const purchase = await play.getSubscription(purchaseToken);
      const subscription = summarizeSubscription(purchase, billing.productId);
      if (subscription.active && !subscription.acknowledged) {
        // Google refunds subscriptions that aren't acknowledged within 3 days.
        await play.acknowledge(billing.productId, purchaseToken).then(
          () => { subscription.acknowledged = true; },
          err => console.error(`[billing] acknowledge failed: ${err.message}`),
        );
      }
      const entitlement = subscription.active
        ? (() => {
          const expiresAt = Math.min(subscription.expiresAt, Date.now() + ENTITLEMENT_MAX_MS);
          return { token: entitlements.sign({ purchaseToken, plan: subscription.basePlanId, expiresAt }), expiresAt };
        })()
        : null;
      res.json({ active: subscription.active, subscription, entitlement });
    } catch (err) {
      if (err instanceof BillingError) return sendError(res, err.status, err.code, err.message);
      console.error('[billing]', err);
      sendError(res, 503, 'billing_unavailable', 'לא הצלחנו לאמת את המנוי. נסו שוב');
    }
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
    const parsed = parseMediaUrl(req.body?.url, { exclude: excludesFor(req) });
    if (!parsed.ok) return sendError(res, 400, 'invalid_url', parsed.error);
    try {
      const info = await loadInfo(parsed.url);
      const who = policy.identify(req);
      const body = publicInfo(info, parsed.platform, hasFfmpeg);
      body.options = body.options.map(opt => ({ ...opt, locked: !policy.allows(parseChoice(opt.id), who) }));
      body.plan = policy.describe(who, jobs.activeCount(req.ip));
      res.json({ url: parsed.url, ...body });
    } catch (err) {
      sendError(res, statusForError(err), err.code || 'failed', err instanceof YtdlpError ? err.message : 'שגיאה בשרת');
    }
  });

  api.post('/jobs', limit(downloadLimiter), async (req, res) => {
    const parsed = parseMediaUrl(req.body?.url, { exclude: excludesFor(req) });
    if (!parsed.ok) return sendError(res, 400, 'invalid_url', parsed.error);
    const choice = parseChoice(req.body?.option);
    if (!choice) return sendError(res, 400, 'invalid_option', 'אפשרות הורדה לא תקינה');

    const who = policy.identify(req);
    if (!policy.allows(choice, who)) {
      return sendError(res, 402, 'premium_required', 'האיכות הזו זמינה במנוי Premium');
    }
    if (!who.premium && policy.freeLeft(who, jobs.activeCount(req.ip)) <= 0) {
      return sendError(res, 402, 'quota_exceeded', `ניצלת את ${billing.freeDownloadsPerDay} ההורדות החינמיות של היום. עם Premium אין הגבלה`);
    }

    try {
      const info = await loadInfo(parsed.url);
      const job = jobs.create({
        url: parsed.url,
        platform: parsed.platform,
        choice: policy.effectiveChoice(choice, who),
        title: typeof info.title === 'string' ? info.title : '',
        client: req.ip,
        onSuccess: () => policy.record(who),
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
  const PUBLIC_FILES = [
    'index.html', 'products.html', 'media-downloader.html', 'app.html', 'privacy.html', 'terms.html',
    'manifest.webmanifest', 'app-release.json',
  ];
  for (const file of PUBLIC_FILES) {
    if (existsSync(path.join(config.siteRoot, file))) app.get(`/${file}`, page(file));
  }
  for (const dir of ['css', 'js', 'icons', 'images']) {
    app.use(`/${dir}`, express.static(path.join(config.siteRoot, dir), { maxAge: '1h' }));
  }

  app.use((req, res) => res.status(404).type('text').send('Not found'));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    if (!res.headersSent) sendError(res, 500, 'server_error', 'שגיאה בשרת');
  });

  return app;
}
