/* LangQuest — Audio & Pronunciation Engine
 *  - Natural TTS via Web Speech API, ranked to prefer neural / natural voices per accent
 *  - Speed control: speechSynthesis `rate` slows speech without changing pitch
 *  - Karaoke: word-boundary events drive the highlight; a syllable-weighted timer is the
 *    fallback for voices that do not emit boundaries (and switches off once one arrives)
 *  - Live Voice Check: SpeechRecognition + fuzzy word alignment → per-word green/red + score
 */
(function () {
  const synth = window.speechSynthesis || null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const NATURAL_HINTS = ['natural', 'neural', 'premium', 'enhanced', 'online', 'google', 'siri', 'wavenet'];
  const ACCENT_FALLBACKS = { 'es-MX': ['es-US', 'es-419'], 'en-GB': ['en-IE', 'en-AU'], 'fr-CA': [] };

  let voices = [];
  const voiceListeners = [];

  function refreshVoices() {
    voices = synth ? synth.getVoices() : [];
    voiceListeners.forEach(fn => fn(voices));
  }
  if (synth) {
    refreshVoices();
    if ('onvoiceschanged' in synth) synth.onvoiceschanged = refreshVoices;
  }

  const normLang = l => (l || '').replace('_', '-').toLowerCase();

  function voiceScore(v) {
    const n = v.name.toLowerCase();
    let s = 0;
    NATURAL_HINTS.forEach((h, i) => { if (n.includes(h)) s += 10 - i; });
    if (v.localService === false) s += 2;
    return s;
  }

  /** Voices for an accent, best first. Falls back to sibling accents, then to the base language. */
  function voicesFor(accentCode) {
    const code = normLang(accentCode);
    const tiers = [[code], (ACCENT_FALLBACKS[accentCode] || []).map(normLang)];
    for (const tier of tiers) {
      const found = voices.filter(v => tier.includes(normLang(v.lang)));
      if (found.length) return found.sort((a, b) => voiceScore(b) - voiceScore(a));
    }
    const base = code.split('-')[0];
    return voices.filter(v => normLang(v.lang).split('-')[0] === base).sort((a, b) => voiceScore(b) - voiceScore(a));
  }

  function pickVoice(accentCode) {
    const preferred = LQStore.getSettings().voice[accentCode];
    const list = voicesFor(accentCode);
    return list.find(v => v.name === preferred) || list[0] || null;
  }

  /* ---------- speech synthesis with karaoke ---------- */
  let session = 0;
  let timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function stop() {
    session++;
    clearTimers();
    if (synth) synth.cancel();
  }

  function tokenOffsets(text) {
    const out = [];
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) out.push(m.index);
    return out;
  }

  /**
   * speak(text, { accent, rate, weights, onWord(i), onEnd() }) → Promise
   * `weights` (syllable counts per token) shape the fallback highlight timing.
   */
  function speak(text, opts = {}) {
    stop();
    const my = session;
    const rate = opts.rate || 1;
    const offsets = tokenOffsets(text);
    const weights = opts.weights || offsets.map(() => 1);
    const onWord = i => { if (my === session && opts.onWord) opts.onWord(i); };
    let boundaryMode = false;

    const runEstimator = () => {
      const perSyl = 0.27 / rate;
      let t = 0;
      weights.forEach((w, i) => {
        timers.push(setTimeout(() => { if (!boundaryMode) onWord(i); }, t * 1000));
        t += w * perSyl + 0.08 / rate;
      });
      return t;
    };

    return new Promise(resolve => {
      const finish = () => {
        if (my !== session) return resolve();
        clearTimers();
        onWord(-1);
        if (opts.onEnd) opts.onEnd();
        resolve();
      };

      if (!synth) {
        const total = runEstimator();
        timers.push(setTimeout(finish, total * 1000 + 200));
        return;
      }

      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(opts.accent);
      if (voice) u.voice = voice;
      u.lang = opts.accent || (voice && voice.lang) || 'en-US';
      u.rate = rate;
      u.pitch = 1;

      let started = false;
      u.onstart = () => { started = true; clearTimers(); if (!boundaryMode) runEstimator(); };
      u.onboundary = e => {
        if (e.name && e.name !== 'word') return;
        if (!boundaryMode) { boundaryMode = true; clearTimers(); }
        let idx = 0;
        for (let i = 0; i < offsets.length; i++) if (offsets[i] <= e.charIndex) idx = i;
        onWord(idx);
      };
      u.onend = finish;
      u.onerror = finish;

      // Chrome drops an utterance queued in the same tick as cancel()
      setTimeout(() => { if (my === session) synth.speak(u); }, 60);
      // Watchdog: some engines never start (no voices installed) — fall back to a silent timed highlight
      setTimeout(() => {
        if (my !== session || started) return;
        const total = runEstimator();
        timers.push(setTimeout(finish, total * 1000 + 200));
      }, 1500);
    });
  }

  /* ---------- speech recognition ---------- */
  const NUMBERS = {
    en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
  };

  function normWord(w, lang) {
    let s = (w || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9'ñ]/g, '');
    const nums = NUMBERS[(lang || '').slice(0, 2)];
    if (nums && /^\d+$/.test(s) && nums[+s]) s = nums[+s];
    return s;
  }

  function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return dp[a.length][b.length];
  }

  function similar(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    return 1 - levenshtein(a, b) / Math.max(a.length, b.length) >= 0.75;
  }

  /** Align spoken words to target words (LCS with fuzzy equality). */
  function scoreAgainst(targetTokens, transcript, lang) {
    const t = targetTokens.map(w => normWord(w, lang));
    const h = transcript.split(/\s+/).map(w => normWord(w, lang)).filter(Boolean);
    const dp = Array.from({ length: t.length + 1 }, () => new Array(h.length + 1).fill(0));
    for (let i = 1; i <= t.length; i++) {
      for (let j = 1; j <= h.length; j++) {
        dp[i][j] = similar(t[i - 1], h[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const matches = new Array(t.length).fill(false);
    let i = t.length, j = h.length;
    while (i > 0 && j > 0) {
      if (similar(t[i - 1], h[j - 1]) && dp[i][j] === dp[i - 1][j - 1] + 1) { matches[i - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
      else j--;
    }
    const hit = matches.filter(Boolean).length;
    // extra words the learner added cost a little
    const extra = Math.max(0, h.length - hit);
    const score = t.length ? Math.max(0, Math.round(100 * (hit - extra * 0.25) / t.length)) : 0;
    return { matches, score, transcript };
  }

  function bestScore(targetTokens, alternatives, lang) {
    return alternatives
      .map(a => scoreAgainst(targetTokens, a, lang))
      .reduce((best, r) => (!best || r.score > best.score ? r : best), null);
  }

  /** listen(accent) → Promise<string[]> (alternative transcripts). Rejects with an error code. */
  let activeRec = null;
  function listen(accent) {
    if (!Recognition) return Promise.reject(new Error('unsupported'));
    stop();
    if (activeRec) { try { activeRec.abort(); } catch { /* noop */ } }
    return new Promise((resolve, reject) => {
      const rec = new Recognition();
      activeRec = rec;
      rec.lang = accent;
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 5;
      let alts = null;
      let err = null;
      const guard = setTimeout(() => { try { rec.stop(); } catch { /* noop */ } }, 9000);
      rec.onresult = e => {
        alts = [];
        const res = e.results[0];
        for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
      };
      rec.onerror = e => { err = e.error || 'error'; };
      rec.onend = () => {
        clearTimeout(guard);
        activeRec = null;
        if (alts && alts.length) resolve(alts);
        else reject(new Error(err || 'no-speech'));
      };
      try { rec.start(); } catch (e) { clearTimeout(guard); reject(e); }
    });
  }

  function cancelListen() {
    if (activeRec) { try { activeRec.abort(); } catch { /* noop */ } }
  }

  window.LQAudio = {
    speak,
    stop,
    voicesFor,
    pickVoice,
    onVoices: fn => voiceListeners.push(fn),
    hasTTS: !!synth,
    canListen: !!Recognition,
    listen,
    cancelListen,
    bestScore,
    normWord
  };
})();
