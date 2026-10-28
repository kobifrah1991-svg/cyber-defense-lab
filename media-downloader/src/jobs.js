import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { YtdlpError } from './ytdlp.js';

// In-memory download queue. Each job gets its own temp directory, which is
// removed when the job expires, so finished files never pile up on disk.
export class JobManager {
  constructor({ ytdlp, hasFfmpeg, maxConcurrent, maxQueued, maxActivePerClient, ttlMs, tmpRoot = os.tmpdir() }) {
    this.ytdlp = ytdlp;
    this.hasFfmpeg = hasFfmpeg;
    this.maxConcurrent = maxConcurrent;
    this.maxQueued = maxQueued;
    this.maxActivePerClient = maxActivePerClient;
    this.ttlMs = ttlMs;
    this.tmpRoot = tmpRoot;
    this.jobs = new Map();
    this.queue = [];
    this.running = 0;
    this.sweeper = setInterval(() => this.sweep(), Math.min(ttlMs, 60_000));
    this.sweeper.unref();
  }

  activeCount(client) {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.client === client && (job.status === 'queued' || job.status === 'downloading' || job.status === 'processing')) {
        count += 1;
      }
    }
    return count;
  }

  create({ url, platform, choice, title, client, onSuccess = null }) {
    if (this.activeCount(client) >= this.maxActivePerClient) {
      throw new YtdlpError('busy_client', 'יש לך כבר הורדות פעילות. חכו שיסתיימו ונסו שוב');
    }
    if (this.queue.length >= this.maxQueued) {
      throw new YtdlpError('busy', 'השרת עמוס כרגע. נסו שוב בעוד דקה');
    }
    const job = {
      id: randomUUID(),
      url,
      platform,
      choice,
      title,
      client,
      status: 'queued',
      stage: 'queued',
      stream: 0,
      progress: null,
      error: null,
      filePath: null,
      fileSize: null,
      dir: null,
      createdAt: Date.now(),
      finishedAt: null,
      controller: new AbortController(),
      onSuccess,
    };
    this.jobs.set(job.id, job);
    this.queue.push(job);
    this.pump();
    return job;
  }

  get(id) {
    return this.jobs.get(id) || null;
  }

  pump() {
    while (this.running < this.maxConcurrent && this.queue.length) {
      const job = this.queue.shift();
      this.running += 1;
      this.execute(job).finally(() => {
        this.running -= 1;
        this.pump();
      });
    }
  }

  async execute(job) {
    try {
      job.dir = await mkdtemp(path.join(this.tmpRoot, 'mdp-'));
      job.status = 'downloading';
      job.stage = 'starting';
      job.filePath = await this.ytdlp.download({
        url: job.url,
        choice: job.choice,
        hasFfmpeg: this.hasFfmpeg,
        dir: job.dir,
        signal: job.controller.signal,
        onStage: (stage, stream) => {
          job.stage = stage;
          job.stream = stream;
          if (stage === 'processing') job.status = 'processing';
        },
        onProgress: progress => {
          job.progress = progress;
        },
      });
      job.fileSize = (await stat(job.filePath)).size;
      job.status = 'done';
      job.stage = 'done';
      job.onSuccess?.();
    } catch (err) {
      job.status = 'error';
      job.error = err instanceof YtdlpError
        ? { code: err.code, message: err.message }
        : { code: 'failed', message: 'ההורדה נכשלה' };
      if (!(err instanceof YtdlpError) || err.code === 'failed') {
        console.error(`[job ${job.id}] ${err.detail || err.stack || err}`);
      }
      await this.removeFiles(job);
    } finally {
      job.finishedAt = Date.now();
    }
  }

  async removeFiles(job) {
    if (!job.dir) return;
    await rm(job.dir, { recursive: true, force: true }).catch(() => {});
    job.dir = null;
    job.filePath = null;
  }

  async sweep(now = Date.now()) {
    for (const job of this.jobs.values()) {
      const stuck = !job.finishedAt && now - job.createdAt > this.ttlMs * 3;
      if (stuck) job.controller.abort();
      if ((job.finishedAt && now - job.finishedAt > this.ttlMs) || stuck) {
        this.jobs.delete(job.id);
        this.queue = this.queue.filter(j => j !== job);
        await this.removeFiles(job);
      }
    }
  }

  async close() {
    clearInterval(this.sweeper);
    for (const job of this.jobs.values()) {
      job.controller.abort();
      await this.removeFiles(job);
    }
    this.jobs.clear();
    this.queue = [];
  }
}
