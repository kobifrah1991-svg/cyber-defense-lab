/* LangQuest — Audio & Pronunciation Engine
 *  - Natural TTS via Web Speech API, ranked to prefer neural / natural voices per accent
 *  - Speed control: speechSynthesis `rate` slows speech without changing pitch
 *  - Karaoke: word-boundary events drive the highlight; a syllable-weighted timer is the
 *    fallback for voices that do not emit boundaries (and switches off once one arrives)
 *  - Live Voice Check: SpeechRecognition + fuzzy word alignment → per-word green/red + score
 */
(function () {
  // Android app: native engines (the system WebView has no speech recognition and unreliable TTS)
  const nativeTts = LQNative.plugin('TextToSpeech');
  const nativeStt = LQNative.plugin('SpeechRecognition');
  const synth = nativeTts ? null : window.speechSynthesis || null;
  const Recognition = nativeStt ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null;

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

  // common voice names by gender across Chrome / Edge / Safari / Android
  const FEMALE = ['female', 'woman', 'aria', 'jenny', 'sonia', 'libby', 'maisie', 'samantha', 'victoria', 'karen', 'moira', 'tessa',
    'zira', 'hazel', 'susan', 'ava', 'allison', 'elvira', 'dalia', 'paulina', 'monica', 'mónica', 'helena', 'laura', 'lucia', 'lucía',
    'sabina', 'marisol', 'renata', 'esperanza', 'ximena', 'abril', 'larissa', 'emma', 'michelle', 'ana'];
  const MALE = ['male', ' man', 'guy', 'ryan', 'thomas', 'daniel', 'alex', 'fred', 'arthur', 'oliver', 'george', 'mark', 'david',
    'eric', 'christopher', 'alvaro', 'álvaro', 'jorge', 'pablo', 'raul', 'raúl', 'diego', 'gerardo', 'liberto', 'tristan', 'jamie', 'juan', 'carlos'];

  function voiceGender(v) {
    const n = ' ' + v.name.toLowerCase();
    if (FEMALE.some(h => n.includes(h)) && !n.includes(' male')) return 'f';
    if (MALE.some(h => n.includes(h))) return 'm';
    return null;
  }

  function voiceScore(v, gender) {
    const n = v.name.toLowerCase();
    let s = 0;
    NATURAL_HINTS.forEach((h, i) => { if (n.includes(h)) s += 10 - i; });
    if (v.localService === false) s += 2;
    if (gender && voiceGender(v) === gender) s += 30;
    return s;
  }

  /** Voices for an accent, best first (matching `gender` when given). Falls back to sibling accents, then the base language. */
  function voicesFor(accentCode, gender) {
    const code = normLang(accentCode);
    const by = (a, b) => voiceScore(b, gender) - voiceScore(a, gender);
    const tiers = [[code], (ACCENT_FALLBACKS[accentCode] || []).map(normLang)];
    for (const tier of tiers) {
      const found = voices.filter(v => tier.includes(normLang(v.lang)));
      if (found.length) return found.sort(by);
    }
    const base = code.split('-')[0];
    return voices.filter(v => normLang(v.lang).split('-')[0] === base).sort(by);
  }

  /** The narrator: the learner's chosen voice, else one matching the teacher's (or a character's) gender. */
  function pickVoice(accentCode, gender) {
    const preferred = gender ? null : LQStore.getSettings().voice[accentCode];
    if (!gender) {
      const tc = LQData.teacherFor(LQStore.getSettings().lang, accentCode);
      if (tc && tc.accent === accentCode) gender = tc.gender;
    }
    const list = voicesFor(accentCode, gender);
    return list.find(v => v.name === preferred) || list[0] || null;
  }

  const speaking = on => document.dispatchEvent(new CustomEvent('lq:speaking', { detail: on }));

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
    document.documentElement.classList.remove('is-speaking');
    if (synth) synth.cancel();
    if (nativeTts) nativeTts.stop().catch(() => {});
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
        speaking(false);
        onWord(-1);
        if (opts.onEnd) opts.onEnd();
        resolve();
      };

      if (nativeTts) {
        speaking(true);
        runEstimator();
        nativeTts.speak({ text, lang: opts.accent || 'en-US', rate, pitch: 1, volume: 1, category: 'playback' })
          .then(finish, finish);
        return;
      }

      if (!synth) {
        speaking(true);
        const total = runEstimator();
        timers.push(setTimeout(finish, total * 1000 + 200));
        return;
      }

      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(opts.accent, opts.gender);
      if (voice) u.voice = voice;
      u.lang = opts.accent || (voice && voice.lang) || 'en-US';
      u.rate = rate;
      u.pitch = 1;

      let started = false;
      u.onstart = () => { started = true; clearTimers(); speaking(true); if (!boundaryMode) runEstimator(); };
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
        speaking(true);
        const total = runEstimator();
        timers.push(setTimeout(finish, total * 1000 + 200));
      }, 1500);
    });
  }

  /* ---------- speech recognition ---------- */
  const NUMBERS = {
    en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
    es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'],
    it: ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici']
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
  async function listenNative(accent) {
    stop();
    let perm = await nativeStt.checkPermissions();
    if (perm.speechRecognition !== 'granted') perm = await nativeStt.requestPermissions();
    if (perm.speechRecognition !== 'granted') throw new Error('not-allowed');
    const { available } = await nativeStt.available();
    if (!available) throw new Error('unsupported');
    const res = await nativeStt.start({ language: accent, maxResults: 5, partialResults: false, popup: false });
    const matches = (res && res.matches) || [];
    if (!matches.length) throw new Error('no-speech');
    return matches;
  }

  function listen(accent) {
    if (nativeStt) return listenNative(accent);
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
    if (nativeStt) { nativeStt.stop().catch(() => {}); return; }
    if (activeRec) { try { activeRec.abort(); } catch { /* noop */ } }
  }

  window.LQAudio = {
    speak,
    stop,
    voicesFor,
    pickVoice,
    onVoices: fn => voiceListeners.push(fn),
    hasTTS: !!(synth || nativeTts),
    canListen: !!(Recognition || nativeStt),
    listen,
    cancelListen,
    bestScore,
    normWord
  };
})();
