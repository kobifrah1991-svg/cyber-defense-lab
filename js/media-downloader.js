// MediaDownloader Pro — client. Talks to the server API when it's there,
// and falls back to a link-detection demo on static hosting.
// The Android app reuses this file and plugs in through window.MDP_CONFIG:
//   app            true inside the app (no demo mode)
//   apiBase()      server origin, e.g. "https://dl.example.com/"
//   headers()      extra request headers (device id, entitlement)
//   exclude        platform ids the app doesn't offer
//   openFile(url)  how to save a finished file
//   onPremium(msg) called when a download needs Premium
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const cfg = window.MDP_CONFIG || {};
  const PREMIUM_CODES = new Set(['premium_required', 'quota_exceeded']);

  function apiUrl(path) {
    const base = typeof cfg.apiBase === 'function' ? cfg.apiBase() : '';
    return base ? `${base.replace(/\/+$/, '')}/api/${path}` : `api/${path}`;
  }

  const PLATFORMS = [
    { id: 'youtube', name: 'YouTube', hosts: ['youtube.com', 'youtu.be'], icon: 'fa-brands fa-youtube', tint: 'bg-red-900/40 text-red-300' },
    { id: 'tiktok', name: 'TikTok', hosts: ['tiktok.com'], icon: 'fa-brands fa-tiktok', tint: 'bg-cyan-900/40 text-cyan-300' },
    { id: 'instagram', name: 'Instagram', hosts: ['instagram.com'], icon: 'fa-brands fa-instagram', tint: 'bg-pink-900/40 text-pink-300' },
    { id: 'facebook', name: 'Facebook', hosts: ['facebook.com', 'fb.watch'], icon: 'fa-brands fa-facebook', tint: 'bg-blue-900/40 text-blue-300' },
    { id: 'x', name: 'X', hosts: ['x.com', 'twitter.com'], icon: 'fa-brands fa-x-twitter', tint: 'bg-gray-800/60 text-white' },
    { id: 'vimeo', name: 'Vimeo', hosts: ['vimeo.com'], icon: 'fa-brands fa-vimeo-v', tint: 'bg-sky-900/40 text-sky-300' },
    { id: 'reddit', name: 'Reddit', hosts: ['reddit.com', 'redd.it'], icon: 'fa-brands fa-reddit-alien', tint: 'bg-orange-900/40 text-orange-300' },
    { id: 'soundcloud', name: 'SoundCloud', hosts: ['soundcloud.com'], icon: 'fa-brands fa-soundcloud', tint: 'bg-orange-900/40 text-orange-300' },
  ];
  const DEMO_OPTIONS = [
    { id: 'v1080', kind: 'video', label: '1080p', ext: 'mp4' },
    { id: 'v720', kind: 'video', label: '720p', ext: 'mp4' },
    { id: 'audio', kind: 'audio', label: 'MP3', ext: 'mp3' },
  ];
  const STAGES = {
    queued: 'ממתין בתור…',
    starting: 'מתחבר לפלטפורמה…',
    processing: 'ממזג וממיר את הקובץ…',
  };
  const HISTORY_KEY = 'mdp-history';
  const HISTORY_MAX = 8;
  const POLL_MS = 800;

  const state = { live: false, info: null, jobId: null, pollTimer: null, busy: false };

  // ---------- helpers ----------
  function platformById(id) {
    return PLATFORMS.find(p => p.id === id);
  }

  function detectPlatform(raw) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    const host = url.hostname.toLowerCase();
    const platform = PLATFORMS.find(p => p.hosts.some(h => host === h || host.endsWith('.' + h))) || null;
    if (platform && (cfg.exclude || []).includes(platform.id)) return { ...platform, excluded: true };
    return platform;
  }

  function formatDuration(sec) {
    if (!Number.isFinite(sec)) return '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = String(sec % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i += 1;
    }
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function formatEta(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '';
    return sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
  }

  function show(el, visible) {
    el.classList.toggle('hidden', !visible);
  }

  let toastTimer = null;
  function toast(title, msg) {
    const el = $('toast');
    $('toast-title').textContent = title;
    $('toast-msg').textContent = msg;
    el.classList.remove('translate-y-32', 'opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('translate-y-32', 'opacity-0'), 3800);
  }

  // Brings a status box into view (on phones it is often below the fold).
  function reveal(el) {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  function showError(message) {
    $('error-text').textContent = message;
    show($('error-box'), Boolean(message));
  }

  function setBusy(busy) {
    state.busy = busy;
    $('fetch-btn').disabled = busy;
    $('fetch-icon').className = busy ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-bolt';
  }

  async function api(path, options = {}) {
    const res = await fetch(apiUrl(path), {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(cfg.headers ? cfg.headers() : {}),
      },
      cache: 'no-store',
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON answer (e.g. a proxy error page).
    }
    if (!res.ok) {
      const err = new Error(data?.error?.message || 'השרת לא זמין כרגע. נסו שוב בעוד רגע');
      err.code = data?.error?.code;
      throw err;
    }
    return data;
  }

  // ---------- server status ----------
  async function checkServer() {
    let health = null;
    try {
      const res = await fetch(apiUrl('health'), { cache: 'no-store', signal: AbortSignal.timeout(6000) });
      if (res.ok && (res.headers.get('content-type') || '').includes('application/json')) {
        health = await res.json();
      }
    } catch {
      // No server: static hosting.
    }

    state.live = Boolean(health?.ok);
    const dot = $('server-dot');
    if (state.live) {
      dot.className = 'h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      $('server-text').textContent = 'מחובר · מוכן להורדה';
    } else if (health) {
      dot.className = 'h-2 w-2 rounded-full bg-red-400';
      $('server-text').textContent = 'השרת פועל אבל yt-dlp חסר';
    } else if (cfg.app) {
      dot.className = 'h-2 w-2 rounded-full bg-red-400';
      $('server-text').textContent = 'אין חיבור לשרת';
    } else {
      dot.className = 'h-2 w-2 rounded-full bg-amber-400';
      $('server-text').textContent = 'מצב דמו · ללא שרת';
      show($('demo-banner'), true);
    }
    return state.live;
  }

  // Premium-only action: the app opens its paywall; the website points to the app.
  function needPremium(message) {
    if (cfg.onPremium) cfg.onPremium(message);
    else toast('זמין ב־Premium', message || 'האפשרות הזו זמינה במנוי Premium באפליקציית Android');
  }

  function handleError(err) {
    if (PREMIUM_CODES.has(err.code)) needPremium(err.message);
    showError(err.message);
  }

  function renderPlan(plan) {
    const note = $('plan-note');
    if (!note) return;
    const limited = plan?.enabled && !plan.premium;
    show(note, Boolean(limited));
    if (limited) {
      note.textContent = plan.freeLeft > 0
        ? `גרסה חינמית: נשארו ${plan.freeLeft} הורדות היום, עד ${plan.freeMaxHeight}p`
        : 'ניצלת את ההורדות החינמיות של היום';
    }
  }

  // ---------- media card ----------
  function renderThumb(url, platform) {
    const box = $('media-thumb');
    box.replaceChildren();
    const p = platformById(platform?.id);
    box.className = 'relative w-full sm:w-56 aspect-video rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-purple-500/20 text-5xl '
      + (p ? p.tint : 'bg-purple-900/40 text-purple-300');
    const icon = document.createElement('i');
    icon.className = p ? p.icon : 'fa-solid fa-photo-film';
    box.append(icon);
    if (url) {
      const img = document.createElement('img');
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      img.loading = 'lazy';
      img.className = 'absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500';
      img.addEventListener('load', () => img.classList.remove('opacity-0'));
      img.addEventListener('error', () => img.remove());
      img.src = url;
      box.append(img);
    }
  }

  function renderOptions(options) {
    const wrap = $('options');
    wrap.replaceChildren();
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      // An odd option out (usually audio) fills the row instead of sitting alone in half of it.
      const wide = opt.kind === 'audio' && options.length % 2 === 1;
      btn.className = 'option-chip' + (opt.kind === 'audio' ? ' text-pink-200' : '') + (opt.locked ? ' option-locked' : '') + (wide ? ' col-span-2' : '');
      btn.dataset.option = opt.id;

      const label = document.createElement('span');
      const icon = document.createElement('i');
      icon.className = (opt.locked ? 'fa-solid fa-crown text-amber-300' : opt.kind === 'audio' ? 'fa-solid fa-music' : 'fa-solid fa-film') + ' ml-1.5 opacity-90';
      label.append(icon, opt.label);

      const sub = document.createElement('span');
      sub.className = 'text-[11px] font-medium ' + (opt.locked ? 'text-amber-300/90' : 'text-gray-400');
      sub.textContent = opt.locked ? 'Premium' : opt.kind === 'audio' ? 'שמע בלבד' : opt.ext.toUpperCase();

      btn.append(label, sub);
      btn.addEventListener('click', () => (opt.locked
        ? needPremium(`${opt.label} זמין במנוי Premium`)
        : startDownload(opt)));
      wrap.append(btn);
    }
  }

  function renderInfo(info) {
    state.info = info;
    renderThumb(info.thumbnail, info.platform);
    $('media-platform').textContent = info.platform?.name || '';
    $('media-duration').textContent = formatDuration(info.duration);
    $('media-title').textContent = info.title || 'ללא כותרת';
    $('media-uploader').textContent = info.uploader || '';
    renderOptions(info.options);
    renderPlan(info.plan);
    show($('demo-note'), !state.live);
    show($('progress-box'), false);
    show($('done-box'), false);
    show($('media-box'), true);
    if (!info.options.length) showError('לא נמצאו קבצים להורדה בקישור הזה');
  }

  function lockOptions(locked) {
    for (const btn of $('options').querySelectorAll('button')) btn.disabled = locked;
  }

  // ---------- flow ----------
  async function lookup(rawUrl) {
    const url = rawUrl.trim();
    showError('');
    stopPolling();
    if (!url) {
      showError('הדביקו קישור לסרטון או לשיר');
      $('url-input').focus();
      return;
    }
    const platform = detectPlatform(url);
    if (!platform || platform.excluded) {
      show($('media-box'), false);
      showError(platform
        ? `${platform.name} לא נתמך באפליקציה`
        : 'הקישור לא תקין או שהפלטפורמה לא נתמכת. בדקו שהוא מתחיל ב־https://');
      return;
    }

    if (!state.live && cfg.app) {
      showError('אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב');
      return;
    }
    if (!state.live) {
      renderInfo({
        url,
        platform: { id: platform.id, name: platform.name },
        title: `זוהה קישור ${platform.name}`,
        uploader: 'בגרסה עם שרת יוצגו כאן הכותרת, היוצר והתמונה האמיתיים',
        duration: null,
        thumbnail: null,
        options: DEMO_OPTIONS,
      });
      return;
    }

    setBusy(true);
    show($('media-box'), false);
    try {
      const info = await api('info', { method: 'POST', body: JSON.stringify({ url }) });
      renderInfo(info);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function startDownload(opt) {
    if (!state.live) {
      toast('מצב דמו', `עם השרת כאן היה יורד קובץ ${opt.label}. ראו "הפעלת השרת" למטה.`);
      return;
    }
    showError('');
    lockOptions(true);
    show($('done-box'), false);
    updateProgress({ status: 'queued', stage: 'queued', progress: null }, opt);
    show($('progress-box'), true);
    reveal($('progress-box'));
    try {
      const job = await api('jobs', { method: 'POST', body: JSON.stringify({ url: state.info.url, option: opt.id }) });
      state.jobId = job.id;
      poll(job.id, opt);
    } catch (err) {
      show($('progress-box'), false);
      lockOptions(false);
      handleError(err);
    }
  }

  function stopPolling() {
    clearTimeout(state.pollTimer);
    state.pollTimer = null;
    state.jobId = null;
  }

  async function poll(id, opt) {
    if (state.jobId !== id) return;
    let job;
    try {
      job = await api(`jobs/${id}`);
    } catch (err) {
      if (state.jobId !== id) return;
      show($('progress-box'), false);
      lockOptions(false);
      showError(err.message);
      return;
    }
    if (state.jobId !== id) return;

    updateProgress(job, opt);
    if (job.status === 'done') {
      finish(job, opt);
    } else if (job.status === 'error') {
      show($('progress-box'), false);
      lockOptions(false);
      showError(job.error?.message || 'ההורדה נכשלה');
    } else {
      state.pollTimer = setTimeout(() => poll(id, opt), POLL_MS);
    }
  }

  function stageText(job, opt) {
    if (job.stage === 'downloading') {
      if (opt.kind === 'audio') return 'מוריד שמע…';
      return job.stream >= 2 ? 'מוריד את פס הקול…' : 'מוריד וידאו…';
    }
    return STAGES[job.stage] || 'מתכונן…';
  }

  function updateProgress(job, opt) {
    const p = job.progress;
    const known = job.stage === 'downloading' && Number.isFinite(p?.percent);
    $('progress-stage').textContent = stageText(job, opt);
    $('progress-percent').textContent = known ? `${Math.floor(p.percent)}%` : '';
    $('progress-track').classList.toggle('progress-indeterminate', !known);
    $('progress-fill').style.width = known ? `${Math.max(2, p.percent)}%` : '';
    const size = known && p.totalBytes ? `${formatBytes(p.downloadedBytes)} / ${formatBytes(p.totalBytes)}` : '';
    const speed = known && p.speed ? `${formatBytes(p.speed)}/s${p.eta != null ? ` · ${formatEta(p.eta)}` : ''}` : '';
    $('progress-size').textContent = size;
    $('progress-speed').textContent = speed;
  }

  function finish(job, opt) {
    state.jobId = null;
    show($('progress-box'), false);
    lockOptions(false);

    const href = apiUrl(`jobs/${encodeURIComponent(job.id)}/file`);
    const link = $('save-link');
    link.href = href;
    link.setAttribute('download', job.fileName || '');
    $('done-name').textContent = [job.fileName, formatBytes(job.fileSize)].filter(Boolean).join(' · ');
    show($('done-box'), true);
    reveal($('done-box'));
    if (cfg.openFile) cfg.openFile(new URL(href, location.href).href, job);
    else link.click();

    addHistory({
      url: state.info.url,
      title: state.info.title,
      platform: state.info.platform?.id,
      label: opt.label,
      at: Date.now(),
    });
    toast('ההורדה הושלמה', 'הקובץ נשמר. אם לא, לחצו "שמור למכשיר".');
  }

  // ---------- history (localStorage, per browser) ----------
  function readHistory() {
    try {
      const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(list) ? list.filter(item => item && typeof item.url === 'string') : [];
    } catch {
      return [];
    }
  }

  function writeHistory(list) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch {
      // Storage blocked (private mode): history just isn't kept.
    }
  }

  function addHistory(entry) {
    const list = readHistory().filter(item => !(item.url === entry.url && item.label === entry.label));
    list.unshift(entry);
    writeHistory(list.slice(0, HISTORY_MAX));
    renderHistory();
  }

  function renderHistory() {
    const list = readHistory();
    const ul = $('history-list');
    ul.replaceChildren();
    for (const item of list) {
      const p = platformById(item.platform);
      const li = document.createElement('li');
      li.className = 'flex items-center gap-3 py-2.5';

      const icon = document.createElement('i');
      icon.className = `${p ? p.icon : 'fa-solid fa-photo-film'} w-5 text-center text-gray-400`;

      const text = document.createElement('div');
      text.className = 'flex-grow min-w-0';
      const title = document.createElement('div');
      title.className = 'text-sm text-gray-100 truncate';
      title.dir = 'auto';
      title.textContent = item.title || item.url;
      const meta = document.createElement('div');
      meta.className = 'text-[11px] text-gray-500';
      meta.textContent = `${item.label || ''} · ${new Date(item.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}`;
      text.append(title, meta);

      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'text-xs font-bold text-purple-300 hover:text-white bg-purple-900/30 border border-purple-700/40 px-3 py-1.5 rounded-lg flex-shrink-0';
      again.textContent = 'שוב';
      again.addEventListener('click', () => {
        $('url-input').value = item.url;
        $('downloader').scrollIntoView({ behavior: 'smooth' });
        lookup(item.url);
      });

      li.append(icon, text, again);
      ul.append(li);
    }
    show($('history-box'), list.length > 0);
  }

  // ---------- wiring ----------
  $('url-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!state.busy) lookup($('url-input').value);
  });

  $('paste-btn').addEventListener('click', async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) return toast('הלוח ריק', 'העתיקו קישור ונסו שוב');
      $('url-input').value = text;
      lookup(text);
    } catch {
      $('url-input').focus();
      toast('אין גישה ללוח', 'הדביקו ידנית עם Ctrl+V או לחיצה ארוכה');
    }
  });

  $('save-link').addEventListener('click', event => {
    if (!cfg.openFile) return;
    event.preventDefault();
    cfg.openFile($('save-link').href);
  });

  $('history-clear').addEventListener('click', () => {
    writeHistory([]);
    renderHistory();
  });

  // Support links like media-downloader.html?url=… (e.g. from a share shortcut).
  const shared = new URLSearchParams(location.search).get('url');

  renderHistory();
  const ready = checkServer();

  // Lets the app re-check the server (new address), refresh locks after a purchase, or open a shared link.
  window.MDP = {
    checkServer,
    refresh() {
      if (state.info?.url && state.live) lookup(state.info.url);
    },
    open(url) {
      return ready.then(() => {
        $('url-input').value = url;
        return lookup(url);
      });
    },
  };

  if (shared) window.MDP.open(shared);
})();
