import { spawn } from 'node:child_process';
import { createApp } from './app.js';
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

const app = createApp({ config, ytdlp, jobs, hasFfmpeg, ytdlpVersion });
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
