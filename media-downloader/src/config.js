import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function int(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function loadConfig() {
  return {
    port: int('PORT', 8080),
    host: process.env.HOST || '0.0.0.0',
    // Folder holding products.html, media-downloader.html, css/ and js/ (the repo root by default).
    siteRoot: path.resolve(process.env.SITE_ROOT || path.join(here, '..', '..')),
    ytdlpCommand: process.env.YTDLP_BIN || 'yt-dlp',
    ffmpegCommand: process.env.FFMPEG_BIN || 'ffmpeg',
    // Passed to yt-dlp --js-runtimes. Set YTDLP_JS_RUNTIME="" for old yt-dlp versions that lack that option.
    ytdlpJsRuntime: process.env.YTDLP_JS_RUNTIME ?? `node:${process.execPath}`,
    // Set to the number of proxies in front of the app (e.g. 1 behind nginx) so rate limits see real client IPs.
    trustProxy: int('TRUST_PROXY', 0),
    maxFilesizeMb: int('MAX_FILESIZE_MB', 500),
    maxConcurrent: int('MAX_CONCURRENT_DOWNLOADS', 2),
    maxQueued: int('MAX_QUEUED_DOWNLOADS', 20),
    maxActivePerClient: int('MAX_ACTIVE_PER_CLIENT', 2),
    fileTtlMinutes: int('FILE_TTL_MINUTES', 15),
    infoTimeoutSec: int('INFO_TIMEOUT_SEC', 45),
    downloadTimeoutSec: int('DOWNLOAD_TIMEOUT_SEC', 15 * 60),
    infoPerMinute: int('INFO_REQUESTS_PER_MINUTE', 30),
    downloadsPer10Min: int('DOWNLOADS_PER_10_MIN', 15),
    // Origins allowed to call the API from another origin: the Android app's WebView by default.
    corsOrigins: (process.env.CORS_ORIGINS ?? 'https://localhost,capacitor://localhost')
      .split(',').map(s => s.trim()).filter(Boolean),
    billing: {
      // Subscriptions are on when the Play package name is set; otherwise everything is free and unlimited.
      packageName: process.env.GOOGLE_PLAY_PACKAGE || '',
      productId: process.env.SUBSCRIPTION_PRODUCT_ID || 'premium',
      serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE || '',
      serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '',
      entitlementSecret: process.env.ENTITLEMENT_SECRET || '',
      freeDownloadsPerDay: int('FREE_DOWNLOADS_PER_DAY', 3),
      freeMaxHeight: int('FREE_MAX_HEIGHT', 720),
    },
  };
}
