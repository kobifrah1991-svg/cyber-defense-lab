/* TedraLingo — The 4-Step Micro-Learning Cycle
 *  1. Listen & Feel   — natural speed + karaoke, breakdown of complex sounds
 *  2. Slow Practice   — turtle mode, word-by-word, syllables + Hebrew transliteration, echo
 *  3. Interactive Game — sound→picture · fill the gap · build the sentence
 *  4. Live Voice Check — mic → green / red words + accuracy score
 */
(function () {
  const { esc, $, $$, karaoke, breakdown, bindBreakdown, translitLine, voiceCheck, toast, burst, shuffle } = LQUI;
  const { t, f, tr } = LQI18n;

  const STEPS = [
    { id: 'listen', icon: '👂' },
    { id: 'slow', icon: '🐢' },
    { id: 'game', icon: '🎮' },
    { id: 'voice', icon: '🎙️' }
  ];
  const GAMES = ['pic', 'gap', 'build'];

  let S = null;

  function start(root, lang, stationId, onExit) {
    const meta = LQData.STATIONS.find(s => s.id === stationId);
    S = {
      root, lang, stationId, meta, onExit,
      accent: LQUI.currentAccent(),
      pace: LQStore.getPace(lang),
      teacher: LQUI.currentTeacher(),
      scene: true,
      phrases: LQData.LANGS[lang].stations[stationId].phrases,
      step: 0, pi: 0,
      canNext: true,
      voice: [], gameFirstTry: [], missed: new Set()
    };
    render();
  }

  function stop() {
    LQAudio.stop();
    LQAudio.cancelListen();
    LQUI.closePop();
    S = null;
  }

  function vid(pi) { return LQStore.vaultId(S.lang, S.stationId, pi); }

  function markMissed(pi) {
    if (!S.missed.has(pi)) {
      S.missed.add(pi);
      LQStore.vaultAdd(vid(pi));
    }
  }

  /** Opening scene: the teacher sets up the story of this station. */
  function renderScene() {
    const tc = S.teacher;
    const city = tc ? (tc.city[LQI18n.ui()] || tc.city.en) : '';
    S.root.innerHTML = `
      <section class="lesson">
        <div class="lesson-top">
          <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
          <div class="lesson-title">${S.meta.icon} ${esc(f(S.meta, 'name'))}</div>
          <span></span>
        </div>
        <div class="card scene">
          ${tc ? LQUI.teacherAvatar(tc, 120) : ''}
          ${tc ? `<div class="scene-name">${esc(tc.name)} <small class="muted">📍 ${esc(city)}</small></div>` : ''}
          <p class="scene-text">${esc(t('story.' + S.stationId, { city }))}</p>
          <div class="scene-preview" dir="${LQUI.tdir(S.lang)}">${S.phrases.map(p => `<span>${p.emoji} ${esc(p.text)}</span>`).join('')}</div>
          <button class="btn primary big-cta" data-act="go">${t('story.start')}</button>
        </div>
      </section>`;
    $('[data-act=exit]', S.root).onclick = () => { const cb = S.onExit; stop(); cb(); };
    $('[data-act=go]', S.root).onclick = () => { S.scene = false; render(); };
  }

  function render() {
    LQAudio.stop();
    LQUI.closePop();
    if (S.scene) return renderScene();
    const step = STEPS[S.step];
    const game = GAMES[S.pi % GAMES.length];
    const hint = step.id === 'game' ? t(`game.${game}.hint`) : t(`step.${step.id}.hint`);
    S.root.innerHTML = `
      <section class="lesson">
        <div class="lesson-top">
          <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
          <div class="lesson-title">${S.meta.icon} ${esc(f(S.meta, 'name'))}</div>
          <div class="pdots">${S.phrases.map((_, i) => `<i class="${i < S.pi ? 'done' : i === S.pi ? 'cur' : ''}"></i>`).join('')}</div>
        </div>
        <ol class="stepper">
          ${STEPS.map((s, i) => `<li class="${i < S.step ? 'done' : i === S.step ? 'cur' : ''}"><span>${s.icon}</span><em>${t('step.' + s.id)}</em></li>`).join('')}
        </ol>
        ${LQUI.teacherSays(S.teacher, `${step.id === 'game' ? `<b>${t('game.' + game)}</b> · ` : ''}${esc(hint)}`)}
        <div class="card step-body"></div>
        <div class="lesson-nav">
          <button class="btn primary" data-act="next">${isLast() ? t('common.finish') : t('common.next')}</button>
          ${step.id === 'voice' ? `<button class="btn ghost sm" data-act="skip">${t('common.skip')}</button>` : ''}
          ${S.pace.skipSteps && (step.id === 'listen' || step.id === 'slow') ? `<button class="btn ghost sm" data-act="skip-step">${t('lesson.skipStep')}</button>` : ''}
        </div>
      </section>`;
    $('[data-act=exit]', S.root).onclick = () => { const cb = S.onExit; stop(); cb(); };
    $('[data-act=next]', S.root).onclick = next;
    const skip = $('[data-act=skip]', S.root);
    if (skip) skip.onclick = () => { if (S.voice[S.pi] == null) { S.voice[S.pi] = 0; markMissed(S.pi); } advance(); };
    const skipStep = $('[data-act=skip-step]', S.root);
    if (skipStep) skipStep.onclick = () => { S.step = 2; S.pi = 0; S.canNext = false; render(); };

    const body = $('.step-body', S.root);
    ({ listen: renderListen, slow: renderSlow, game: renderGame, voice: renderVoice })[step.id](body, S.phrases[S.pi]);
    setNext(S.canNext);
  }

  function isLast() { return S.step === STEPS.length - 1 && S.pi === S.phrases.length - 1; }

  function setNext(on) {
    S.canNext = on;
    const b = $('[data-act=next]', S.root);
    if (b) b.disabled = !on;
  }

  function next() {
    if (!S.canNext) return;
    advance();
  }

  function advance() {
    S.pi++;
    if (S.pi >= S.phrases.length) { S.pi = 0; S.step++; }
    if (S.step >= STEPS.length) return finish();
    S.canNext = STEPS[S.step].id === 'listen' || STEPS[S.step].id === 'slow';
    render();
  }

  /* ---------- shared phrase header ---------- */
  function phraseHead(phrase, pi) {
    const showHe = LQI18n.showTranslit();
    const saved = LQStore.inVault(vid(pi));
    return `
      <div class="phrase-head">
        <div class="phrase-emoji">${phrase.emoji}</div>
        <button class="star ${saved ? 'on' : ''}" data-act="star" title="${t('lesson.star')}">${saved ? '⭐' : '☆'}</button>
      </div>
      <div class="kara-slot"></div>
      ${showHe ? `<div class="translit">${translitLine(phrase)}</div>` : ''}
      <div class="translation">${esc(tr(phrase))}</div>
      ${phrase.fusha ? `<details class="fusha"><summary>📜 ${t('lesson.fusha')}</summary>
        <button class="fusha-text" dir="rtl" data-act="fusha">${esc(phrase.fusha)} 🔊</button></details>` : ''}`;
  }

  // the same phrase in Standard Arabic, read with a Standard Arabic voice
  function bindFusha(body, phrase) {
    const b = $('[data-act=fusha]', body);
    if (b) b.onclick = () => LQAudio.speak(phrase.fusha, { accent: LQData.LANGS[S.lang].fushaAccent || S.accent, rate: LQStore.getSettings().slowRate });
  }

  function bindStar(body, pi) {
    bindFusha(body, S.phrases[pi]);
    const star = $('[data-act=star]', body);
    if (!star) return;
    star.onclick = () => {
      const id = vid(pi);
      if (LQStore.inVault(id)) { LQStore.vaultRemove(id); star.textContent = '☆'; star.classList.remove('on'); toast(t('lesson.starOff')); }
      else { LQStore.vaultAdd(id); star.textContent = '⭐'; star.classList.add('on'); toast(t('lesson.starOn')); }
      LQApp.refreshHeader();
    };
  }

  /* ---------- step 1: listen & feel ---------- */
  function renderListen(body, phrase) {
    body.innerHTML = `
      ${phraseHead(phrase, S.pi)}
      <div class="row center">
        <button class="btn play" data-act="play">${t('lesson.playNatural')}</button>
        <button class="btn ghost" data-act="slow">${t('common.slow')}</button>
      </div>
      ${phrase.words.some(w => w.syl.length > 1) ? `<h4 class="sub">${t('lesson.hard')}</h4>${breakdown(phrase, { onlyHard: true })}` : ''}`;
    const k = karaoke($('.kara-slot', body), { text: phrase.text, words: phrase.words, accent: S.accent, big: true });
    $('[data-act=play]', body).onclick = () => k.play(1);
    $('[data-act=slow]', body).onclick = () => k.play(LQStore.getSettings().slowRate);
    bindBreakdown(body, phrase, S.accent);
    bindStar(body, S.pi);
    k.play(1);
  }

  /* ---------- step 2: slow practice ---------- */
  function renderSlow(body, phrase) {
    const rate = LQStore.getSettings().slowRate;
    body.innerHTML = `
      ${phraseHead(phrase, S.pi)}
      <div class="row center">
        <button class="btn play" data-act="slow">${t('lesson.playSlow', { n: Math.round(rate * 100) })}</button>
        <button class="btn ghost" data-act="words">${t('lesson.wordByWord')}</button>
      </div>
      <h4 class="sub">${t('lesson.breakdown')}</h4>
      ${breakdown(phrase)}
      <details class="echo">
        <summary>${t('lesson.echo')}</summary>
        <div class="echo-slot"></div>
      </details>`;
    const k = karaoke($('.kara-slot', body), { text: phrase.text, words: phrase.words, accent: S.accent, big: true });
    $('[data-act=slow]', body).onclick = () => k.play(rate);
    $('[data-act=words]', body).onclick = () => k.playWords(rate, i => {
      $$('.bd-card', body).forEach(c => c.classList.toggle('on', +c.dataset.wi === i));
    });
    bindBreakdown(body, phrase, S.accent);
    bindStar(body, S.pi);
    const echo = $('.echo', body);
    echo.addEventListener('toggle', () => {
      if (echo.open && !$('.vc', echo)) voiceCheck($('.echo-slot', echo), { phrase, accent: S.accent, onResult: () => {} });
    }, { once: false });
    k.play(rate);
  }

  /* ---------- step 3: interactive games ---------- */
  function renderGame(body, phrase) {
    const kind = S.pi % GAMES.length;
    S.gameTries = 0;
    [gameSoundPicture, gameFillGap, gameBuild][kind](body, phrase);
  }

  function gameResult(ok) {
    S.gameTries++;
    if (ok) {
      if (S.gameFirstTry[S.pi] == null) {
        S.gameFirstTry[S.pi] = S.gameTries === 1;
        if (S.gameTries === 1) LQEngage.track('perfect');
      }
      setNext(true);
      toast(S.gameTries === 1 ? t('lesson.correct') : t('lesson.correct2'), 1400);
    } else {
      markMissed(S.pi);
    }
  }

  function playBar(phrase, label = t('common.replay')) {
    return `<div class="row center"><button class="btn play" data-act="hear">${label}</button>
      <button class="btn ghost" data-act="hear-slow">🐢</button></div>`;
  }

  function bindPlay(body, phrase) {
    const speak = rate => LQAudio.speak(phrase.text, { accent: S.accent, rate, weights: phrase.words.map(w => w.syl.length) });
    $('[data-act=hear]', body).onclick = () => speak(1);
    $('[data-act=hear-slow]', body).onclick = () => speak(LQStore.getSettings().slowRate);
    speak(1);
  }

  function gameSoundPicture(body, phrase) {
    const own = S.phrases.map(p => p.emoji);
    const others = [];
    Object.values(LQData.LANGS[S.lang].stations).forEach(st => st.phrases.forEach(p => {
      if (!own.includes(p.emoji) && !others.includes(p.emoji)) others.push(p.emoji);
    }));
    const options = shuffle([...own, ...shuffle(others).slice(0, 1)]);
    body.innerHTML = `
      <div class="game-ear">👂</div>
      ${playBar(phrase)}
      <div class="pic-grid">${options.map(e => `<button class="pic" data-e="${e}">${e}</button>`).join('')}</div>`;
    bindPlay(body, phrase);
    $$('.pic', body).forEach(b => b.onclick = () => {
      if (S.canNext) return;
      const ok = b.dataset.e === phrase.emoji;
      b.classList.add(ok ? 'ok' : 'bad');
      if (!ok) setTimeout(() => b.classList.remove('bad'), 600);
      gameResult(ok);
      if (ok) body.insertAdjacentHTML('beforeend', `<div class="reveal" dir="${LQUI.tdir(S.lang)}">${esc(phrase.text)}</div><div class="translation">${esc(tr(phrase))}</div>`);
    });
  }

  function gameFillGap(body, phrase) {
    let gi = 0;
    phrase.words.forEach((w, i) => {
      const g = phrase.words[gi];
      if (w.syl.length > g.syl.length || (w.syl.length === g.syl.length && w.clean.length > g.clean.length)) gi = i;
    });
    const target = phrase.words[gi].clean;
    const pool = [];
    Object.values(LQData.LANGS[S.lang].stations).forEach(st => st.phrases.forEach(p => p.words.forEach(w => {
      const c = w.clean;
      if (c.length > 2 && c.toLowerCase() !== target.toLowerCase() && !pool.some(x => x.toLowerCase() === c.toLowerCase())) pool.push(c);
    })));
    const options = shuffle([target, ...shuffle(pool).slice(0, 3)]);
    const sentence = phrase.words.map((w, i) => (i === gi
      ? `<span class="gap">${w.token.replace(w.clean, '<b>_____</b>')}</span>`
      : esc(w.token))).join(' ');
    body.innerHTML = `
      ${playBar(phrase)}
      <div class="gap-sentence" dir="${LQUI.tdir(S.lang)}">${sentence}</div>
      <div class="translation">${esc(tr(phrase))}</div>
      <div class="opt-grid">${options.map(o => `<button class="opt" dir="${LQUI.tdir(S.lang)}" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
    bindPlay(body, phrase);
    $$('.opt', body).forEach(b => b.onclick = () => {
      if (S.canNext) return;
      const ok = b.dataset.o === target;
      b.classList.add(ok ? 'ok' : 'bad');
      if (!ok) setTimeout(() => b.classList.remove('bad'), 600);
      gameResult(ok);
      if (ok) $('.gap b', body).textContent = target;
    });
  }

  function gameBuild(body, phrase) {
    const tokens = phrase.words.map((w, i) => ({ i, t: w.token }));
    let pool = shuffle(tokens);
    if (pool.every((p, k) => p.i === k) && pool.length > 1) pool = pool.slice(1).concat(pool[0]);
    let answer = [];
    body.innerHTML = `
      ${playBar(phrase)}
      <div class="translation">${esc(tr(phrase))}</div>
      <div class="build-answer" dir="${LQUI.tdir(S.lang)}"></div>
      <div class="build-pool" dir="${LQUI.tdir(S.lang)}"></div>
      <div class="row center"><button class="btn ghost sm" data-act="clear">${t('lesson.clear')}</button></div>`;
    bindPlay(body, phrase);
    const ansEl = $('.build-answer', body);
    const poolEl = $('.build-pool', body);
    const draw = () => {
      ansEl.innerHTML = answer.length ? answer.map((a, k) => `<button class="tok" data-k="${k}">${esc(a.t)}</button>`).join('') : `<span class="ph">${t('lesson.buildPh')}</span>`;
      poolEl.innerHTML = pool.map((p, k) => `<button class="tok" data-k="${k}">${esc(p.t)}</button>`).join('');
      $$('.tok', poolEl).forEach(b => b.onclick = () => {
        if (S.canNext) return;
        answer.push(pool.splice(+b.dataset.k, 1)[0]);
        draw();
        if (!pool.length) check();
      });
      $$('.tok', ansEl).forEach(b => b.onclick = () => {
        if (S.canNext) return;
        pool.push(answer.splice(+b.dataset.k, 1)[0]);
        draw();
      });
    };
    const check = () => {
      const ok = answer.map(a => a.t).join(' ') === phrase.words.map(w => w.token).join(' ');
      ansEl.classList.add(ok ? 'ok' : 'bad');
      gameResult(ok);
      if (!ok) setTimeout(() => { ansEl.classList.remove('bad'); pool = shuffle(tokens); answer = []; draw(); }, 900);
    };
    $('[data-act=clear]', body).onclick = () => { if (S.canNext) return; pool = shuffle(tokens); answer = []; draw(); };
    draw();
  }

  /* ---------- step 4: live voice check ---------- */
  function renderVoice(body, phrase) {
    body.innerHTML = `<div class="translation big">${esc(tr(phrase))}</div><div class="vc-slot"></div>`;
    voiceCheck($('.vc-slot', body), {
      phrase,
      accent: S.accent,
      onResult: (score) => {
        S.voice[S.pi] = Math.max(S.voice[S.pi] || 0, score);
        if (score >= 90) LQEngage.track('voice90');
        if (score >= 100) LQEngage.track('voice100');
        if (score < S.pace.pass + 10) markMissed(S.pi);
        setNext(true);
      }
    });
  }

  /* ---------- finish ---------- */
  function finish() {
    const voiceScores = S.voice.filter(v => v != null);
    const avgVoice = voiceScores.length ? Math.round(voiceScores.reduce((a, b) => a + b, 0) / voiceScores.length) : 0;
    const firstTry = S.gameFirstTry.filter(Boolean).length;
    const xp = 30 + firstTry * 5 + Math.round(avgVoice / 5);
    const prev = LQStore.stationProgress(S.lang, S.stationId);
    LQStore.updateStation(S.lang, S.stationId, { lesson: true, bestVoice: avgVoice });
    LQStore.addXp(xp);
    LQApp.refreshHeader();
    burst();
    setTimeout(() => LQEngage.track('lesson'), 900);
    const { meta, onExit, missed, teacher } = S;
    const lang = S.lang;
    stop();
    LQApp.view.innerHTML = `
      <section class="card finish">
        <div class="finish-emoji">${meta.icon}</div>
        <h2>${esc(t('fin.title', { name: f(meta, 'name') }))}</h2>
        ${LQUI.teacherSays(teacher, esc(t('teach.done')), 52)}
        <div class="stats">
          <div><b>+${xp}</b><span>XP</span></div>
          <div><b>${avgVoice}%</b><span>${t('fin.accuracy')}</span></div>
          <div><b>${firstTry}/3</b><span>${t('fin.games')}</span></div>
        </div>
        ${missed.size ? `<p class="note">${t('fin.saved', { n: missed.size })}</p>` : ''}
        ${!prev.lesson ? `<p class="note">${t('fin.unlocked')}</p>` : ''}
        <div class="row center">
          <button class="btn boss" data-act="boss">${t('fin.boss')}</button>
          <button class="btn ghost" data-act="map">${t('common.toMap')}</button>
        </div>
      </section>`;
    $('[data-act=boss]', LQApp.view).onclick = () => LQApp.go('boss', { lang, station: meta.id });
    $('[data-act=map]', LQApp.view).onclick = onExit;
  }

  window.LQLesson = { start, stop };
})();
