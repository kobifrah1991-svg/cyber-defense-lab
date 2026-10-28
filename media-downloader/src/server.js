import { spawn } from 'node:child_process';
import { createApp } from './app.js';
import { EntitlementSigner } from './billing/entitlements.js';
import { GooglePlayClient, loadServiceAccount } from './billing/google-play.js';
import { loadConfig } from './config.js';
import { JobManager } from './jobs.js';
import { Ytdlp } from './ytdlp.js';

function commandWorks(command, args) {
  return new Promise(resolve => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('close', code => resolve(code === 0));
  });
}

const config = loadConfig();
const ytdlp = new Ytdlp({
  command: config.ytdlpCommand,
  maxFilesize: config.maxFilesizeMb * 1024 * 1024,
  infoTimeoutMs: config.infoTimeoutSec * 1000,
  downloadTimeoutMs: config.downloadTimeoutSec * 1000,
  jsRuntime: config.ytdlpJsRuntime,
});

const [ytdlpVersion, hasFfmpeg] = await Promise.all([
  ytdlp.version(),
  commandWorks(config.ffmpegCommand, ['-version']),
]);
if (!ytdlpVersion) {
  console.warn(`⚠ yt-dlp not found ("${config.ytdlpCommand}"). Install it or set YTDLP_BIN; downloads will fail.`);
}
if (!hasFfmpeg) {
  console.warn('⚠ ffmpeg not found: only single-file formats and M4A audio will be offered.');
}

const jobs = new JobManager({
  ytdlp,
  hasFfmpeg,
  maxConcurrent: config.maxConcurrent,
  maxQueued: config.maxQueued,
  maxActivePerClient: config.maxActivePerClient,
  ttlMs: config.fileTtlMinutes * 60_000,
});

let play = null;
const { billing } = config;
if (billing.packageName) {
  const credentials = loadServiceAccount({ file: billing.serviceAccountFile, json: billing.serviceAccountJson });
  if (!credentials) {
    console.error('GOOGLE_PLAY_PACKAGE is set but no service account was given (GOOGLE_SERVICE_ACCOUNT_FILE or _JSON).');
    process.exit(1);
  }
  play = new GooglePlayClient({ packageName: billing.packageName, credentials });
  console.log(`Subscriptions on: ${billing.packageName} / ${billing.productId} (free: ${billing.freeDownloadsPerDay}/day up to ${billing.freeMaxHeight}p)`);
}
const signer = new EntitlementSigner(billing.entitlementSecret);
if (play && signer.ephemeral) {
  console.warn('⚠ ENTITLEMENT_SECRET not set: subscribers will be re-verified with Google after every restart.');
}

const app = createApp({ config, ytdlp, jobs, hasFfmpeg, ytdlpVersion, play, signer });
const server = app.listen(config.port, config.host, () => {
  console.log(`MediaDownloader Pro on http://localhost:${config.port}  (yt-dlp ${ytdlpVersion || 'missing'}, ffmpeg ${hasFfmpeg ? 'yes' : 'no'})`);
});

async function shutdown() {
  server.close();
  await jobs.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
