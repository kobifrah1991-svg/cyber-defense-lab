import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { formatArgs } from './formats.js';

// Ignore any yt-dlp config on the host so behaviour only depends on these arguments.
const BASE_ARGS = ['--ignore-config', '--no-playlist', '--no-warnings', '--no-color'];
const MAX_INFO_OUTPUT = 25 * 1024 * 1024;
const MAX_STDERR = 64 * 1024;

const PROGRESS_PREFIX = 'MDP ';
const PROGRESS_TEMPLATE = `download:${PROGRESS_PREFIX}%(progress.downloaded_bytes)s %(progress.total_bytes)s %(progress.total_bytes_estimate)s %(progress.speed)s %(progress.eta)s`;
const POSTPROCESS_LINE = /^\[(Merger|ExtractAudio|VideoConvertor|VideoRemuxer|Fixup\w*)\]/;

export class YtdlpError extends Error {
  constructor(code, message, detail = '') {
    super(message);
    this.code = code;
    this.detail = detail;
  }
}

// Turns yt-dlp's stderr into a short message the user can act on.
export function classifyError(stderr) {
  const text = stderr.toLowerCase();
  if (/private|login required|log in|sign in|cookies|members-only|age-restricted|confirm your age/.test(text)) {
    return new YtdlpError('private', 'התוכן פרטי או דורש התחברות, ולכן אי אפשר להוריד אותו', stderr);
  }
  if (/max-filesize|larger than max-filesize|file is larger/.test(text)) {
    return new YtdlpError('too_large', 'הקובץ גדול מהמגבלה של השרת', stderr);
  }
  if (/unsupported url|no video formats|no media found|there is no video/.test(text)) {
    return new YtdlpError('unsupported', 'לא נמצאה מדיה להורדה בקישור הזה', stderr);
  }
  if (/not available|unavailable|removed|does not exist|404/.test(text)) {
    return new YtdlpError('unavailable', 'התוכן לא זמין (אולי נמחק או חסום באזור)', stderr);
  }
  if (/429|too many requests|rate.?limit/.test(text)) {
    return new YtdlpError('rate_limited', 'הפלטפורמה חוסמת זמנית בקשות. נסו שוב בעוד כמה דקות', stderr);
  }
  if (/unable to connect|connection (refused|reset)|timed out|network is unreachable|getaddrinfo|name or service not known|proxyerror/.test(text)) {
    return new YtdlpError('network', 'השרת לא הצליח להתחבר לפלטפורמה. נסו שוב בעוד רגע', stderr);
  }
  return new YtdlpError('failed', 'ההורדה נכשלה. בדקו את הקישור ונסו שוב', stderr);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseProgressLine(line) {
  if (!line.startsWith(PROGRESS_PREFIX)) return null;
  const [downloaded, total, estimate, speed, eta] = line.slice(PROGRESS_PREFIX.length).trim().split(/\s+/);
  const totalBytes = num(total) ?? num(estimate);
  const downloadedBytes = num(downloaded);
  return {
    downloadedBytes,
    totalBytes,
    percent: totalBytes && downloadedBytes != null ? Math.min(100, (downloadedBytes / totalBytes) * 100) : null,
    speed: num(speed),
    eta: num(eta),
  };
}

export class Ytdlp {
  constructor({ command, maxFilesize, infoTimeoutMs, downloadTimeoutMs, jsRuntime = '' }) {
    const [bin, ...prefix] = command.trim().split(/\s+/);
    this.bin = bin;
    this.prefix = prefix;
    // YouTube needs a JS runtime to solve its player challenges; this server's own Node works.
    this.baseArgs = jsRuntime ? [...BASE_ARGS, '--js-runtimes', jsRuntime] : BASE_ARGS;
    this.maxFilesize = maxFilesize;
    this.infoTimeoutMs = infoTimeoutMs;
    this.downloadTimeoutMs = downloadTimeoutMs;
  }

  // Runs yt-dlp with an argument array (never a shell), so URLs can't inject commands.
  run(args, { timeoutMs, onStdoutLine, collectStdout = false, signal } = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(this.bin, [...this.prefix, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
      });
      let stdout = '';
      let stderr = '';
      let buffered = '';
      let settled = false;

      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', onAbort);
        fn(value);
      };
      const kill = () => { if (child.exitCode === null) child.kill('SIGKILL'); };
      const onAbort = () => { kill(); finish(reject, new YtdlpError('cancelled', 'ההורדה בוטלה')); };
      const timer = setTimeout(() => {
        kill();
        finish(reject, new YtdlpError('timeout', 'הפעולה לקחה יותר מדי זמן ובוטלה'));
      }, timeoutMs);
      signal?.addEventListener('abort', onAbort);

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', chunk => {
        if (collectStdout) {
          stdout += chunk;
          if (stdout.length > MAX_INFO_OUTPUT) {
            kill();
            finish(reject, new YtdlpError('failed', 'התשובה מהפלטפורמה גדולה מדי'));
          }
        }
        if (onStdoutLine) {
          buffered += chunk;
          const lines = buffered.split(/\r?\n/);
          buffered = lines.pop();
          lines.forEach(onStdoutLine);
        }
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', chunk => {
        if (stderr.length < MAX_STDERR) stderr += chunk;
      });
      child.on('error', err => {
        finish(reject, err.code === 'ENOENT'
          ? new YtdlpError('missing', 'yt-dlp לא מותקן בשרת')
          : err);
      });
      child.on('close', code => {
        if (buffered && onStdoutLine) onStdoutLine(buffered);
        if (code === 0) finish(resolve, { stdout, stderr });
        else finish(reject, classifyError(stderr));
      });
    });
  }

  async version() {
    try {
      const { stdout } = await this.run(['--version'], { timeoutMs: 15000, collectStdout: true });
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  async info(url) {
    const { stdout } = await this.run([...this.baseArgs, '-J', '--', url], {
      timeoutMs: this.infoTimeoutMs,
      collectStdout: true,
    });
    try {
      return JSON.parse(stdout);
    } catch {
      throw new YtdlpError('failed', 'לא הצלחנו לקרוא את פרטי המדיה');
    }
  }

  // Downloads into `dir` and resolves with the path of the finished file.
  async download({ url, choice, hasFfmpeg, dir, onProgress, onStage, signal }) {
    const args = [
      ...this.baseArgs,
      '--newline',
      '--progress-template', PROGRESS_TEMPLATE,
      '--max-filesize', String(this.maxFilesize),
      '--no-part',
      '--restrict-filenames',
      '-P', dir,
      '-o', '%(id).60s.%(ext)s',
      ...formatArgs(choice, hasFfmpeg),
      '--', url,
    ];
    let streams = 0;
    await this.run(args, {
      timeoutMs: this.downloadTimeoutMs,
      signal,
      onStdoutLine: line => {
        if (line.startsWith('[download] Destination:')) {
          streams += 1;
          onStage?.('downloading', streams);
          return;
        }
        if (POSTPROCESS_LINE.test(line)) {
          onStage?.('processing', streams);
          return;
        }
        const progress = parseProgressLine(line);
        if (progress) onProgress?.(progress);
      },
    });

    const files = (await readdir(dir)).filter(name => !name.endsWith('.part') && !name.endsWith('.ytdl'));
    if (!files.length) {
      throw new YtdlpError('failed', 'ההורדה הסתיימה אבל לא נוצר קובץ');
    }
    // After merging, intermediate streams are deleted; if several remain, the merged/final one is the largest.
    if (files.length === 1) return path.join(dir, files[0]);
    const sized = await Promise.all(files.map(async name => ({ name, size: (await stat(path.join(dir, name))).size })));
    sized.sort((a, b) => b.size - a.size);
    return path.join(dir, sized[0].name);
  }
}
