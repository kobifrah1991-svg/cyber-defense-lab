/* LangQuest — Chapter 2 lesson: Explain → Examples → Practice → Speak (grammar units, Premium) */
(function () {
  const { esc, $, $$, karaoke, voiceCheck, toast, burst, shuffle } = LQUI;
  const { t } = LQI18n;

  const PHASES = [
    { id: 'explain', icon: '📘' },
    { id: 'examples', icon: '👂' },
    { id: 'practice', icon: '✍️' },
    { id: 'speak', icon: '🎙️' }
  ];
  const TR_COL = { he: 1, en: 2, ar: 3, ru: 4 };

  let S = null;

  function units(lang) { return (window.LQGrammar || {})[lang] || []; }

  /** Chapter 2 opens after the whole spoken chapter, or straight away for intermediate+ learners. */
  function stageOpen(lang) {
    const all = LQData.STATIONS.every(x => LQStore.stationProgress(lang, x.id).lesson);
    return all || LQStore.getPace(lang).level >= 2;
  }

  function unitOpen(lang, i) {
    return i === 0 || LQStore.grammarProgress(lang, units(lang)[i - 1].id).done;
  }

  // the learner's own language, falling back to Hebrew, then English (English explanations aren't written for the English track)
  function local(obj) {
    const ui = LQI18n.ui();
    return obj[ui] || obj.he || obj.en;
  }

  // isolate target-language runs inside Hebrew / Arabic explanations so "¿Dónde está…?" keeps its order
  const LATIN_RUN = /[¿¡]?[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9'’ ·\/+\-…?!.,¿¡()=→]*[A-Za-zÀ-ÿ0-9'’?!.)…]/g;
  function rich(text) {
    let out = '', last = 0;
    for (const m of text.matchAll(LATIN_RUN)) {
      out += esc(text.slice(last, m.index)) + `<bdi dir="ltr">${esc(m[0])}</bdi>`;
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  function translation(ex) {
    return ex[TR_COL[LQI18n.ui()]] || ex[1] || '';
  }

  function asPhrase(text) {
    const tokens = text.split(/\s+/).filter(Boolean);
    return { text, words: tokens.map(tk => ({ token: tk, clean: tk.replace(/[¿¡?!.,]/g, ''), syl: [tk], he: [], stress: 0 })) };
  }

  function start(root, lang, unitId, onExit) {
    const list = units(lang);
    const idx = list.findIndex(u => u.id === unitId);
    if (idx < 0) return onExit();
    S = {
      root, lang, onExit, idx, unit: list[idx],
      accent: LQUI.currentAccent(),
      teacher: LQUI.currentTeacher(),
      phase: 0, di: 0, si: 0,
      firstTry: [], voice: [], tries: 0
    };
    // speak two of the examples: the first and the third
    S.speak = [S.unit.ex[0], S.unit.ex[2] || S.unit.ex[1]];
    render();
  }

  function stop() {
    LQAudio.stop();
    LQAudio.cancelListen();
    LQUI.closePop();
    S = null;
  }

  function render() {
    LQAudio.stop();
    LQUI.closePop();
    const ph = PHASES[S.phase];
    const u = S.unit;
    S.root.innerHTML = `
      <section class="lesson grammar">
        <div class="lesson-top">
          <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
          <div class="lesson-title">${u.icon} ${esc(local(u.title))}</div>
          <span class="lv-tag">${u.level}</span>
        </div>
        <ol class="stepper">
          ${PHASES.map((p, i) => `<li class="${i < S.phase ? 'done' : i === S.phase ? 'cur' : ''}"><span>${p.icon}</span><em>${t('gr.' + p.id)}</em></li>`).join('')}
        </ol>
        ${LQUI.teacherSays(S.teacher, esc(t('gr.' + ph.id + 'Hint')))}
        <div class="card step-body"></div>
        <div class="lesson-nav">
          <button class="btn primary" data-act="next">${t('common.next')}</button>
          ${ph.id === 'speak' ? `<button class="btn ghost sm" data-act="skip">${t('common.skip')}</button>` : ''}
        </div>
      </section>`;
    $('[data-act=exit]', S.root).onclick = () => { const cb = S.onExit; stop(); cb(); };
    $('[data-act=next]', S.root).onclick = next;
    const skip = $('[data-act=skip]', S.root);
    if (skip) skip.onclick = () => { if (S.voice[S.si] == null) S.voice[S.si] = 0; advance(); };
    const body = $('.step-body', S.root);
    ({ explain: renderExplain, examples: renderExamples, practice: renderPractice, speak: renderSpeak })[ph.id](body);
  }

  function setNext(on) {
    const b = $('[data-act=next]', S.root);
    if (b) b.disabled = !on;
  }

  function next() {
    const b = $('[data-act=next]', S.root);
    if (b && b.disabled) return;
    advance();
  }

  function advance() {
    const id = PHASES[S.phase].id;
    if (id === 'practice' && ++S.di < S.unit.drills.length) return render();
    if (id === 'speak' && ++S.si < S.speak.length) return render();
    if (++S.phase >= PHASES.length) return finish();
    render();
  }

  /* ---------- 1. explanation + table of forms ---------- */
  function renderExplain(body) {
    const u = S.unit;
    body.innerHTML = `
      <ul class="gr-rules">${local(u.explain).map(b => `<li>${rich(b)}</li>`).join('')}</ul>
      <div class="gr-table-wrap">
        <div class="muted small">${t('gr.table')}</div>
        <table class="gr-table" dir="ltr">
          ${u.table.map(row => `<tr>${row.map(c => `<td data-say="${esc(c)}">${esc(c)}</td>`).join('')}</tr>`).join('')}
        </table>
      </div>`;
    // tap a cell to hear it — the forms are what the learner must memorise
    $$('[data-say]', body).forEach(td => td.onclick = () => LQAudio.speak(td.dataset.say.replace(/·/g, ','), { accent: S.accent, rate: 0.85 }));
    setNext(true);
  }

  /* ---------- 2. examples with audio, karaoke and translation ---------- */
  function renderExamples(body) {
    body.innerHTML = S.unit.ex.map((ex, i) => `
      <div class="gr-ex" data-i="${i}">
        <div class="gr-ex-ctl">
          <button class="btn ghost sm" data-play="1" aria-label="${t('common.play')}">▶️</button>
          <button class="btn ghost sm" data-play="slow" aria-label="${t('common.slow')}">🐢</button>
        </div>
        <div><div class="gr-ex-text"></div><div class="translation">${esc(translation(ex))}</div></div>
      </div>`).join('');
    const slowRate = LQStore.getSettings().slowRate;
    $$('.gr-ex', body).forEach(row => {
      const ex = S.unit.ex[+row.dataset.i];
      const k = karaoke($('.gr-ex-text', row), { text: ex[0], accent: S.accent, gender: S.teacher && S.teacher.gender });
      $$('[data-play]', row).forEach(b => b.onclick = () => k.play(b.dataset.play === 'slow' ? slowRate : 1));
    });
    setNext(true);
  }

  /* ---------- 3. practice: pick the right form ---------- */
  function renderPractice(body) {
    const [sentence, answer, options] = S.unit.drills[S.di];
    S.tries = 0;
    const [before, after] = sentence.split('___');
    body.innerHTML = `
      <div class="muted small">${t('gr.drillCount', { i: S.di + 1, n: S.unit.drills.length })}</div>
      <div class="gr-drill" dir="ltr">${esc(before)}<span class="gap">___</span>${esc(after)}</div>
      <div class="opt-grid" dir="ltr">${shuffle(options.slice()).map(o => `<button class="opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      <div class="gr-feedback" aria-live="polite"></div>`;
    setNext(false);
    $$('[data-o]', body).forEach(b => b.onclick = () => {
      if (b.disabled) return;
      S.tries++;
      const ok = b.dataset.o === answer;
      b.classList.add(ok ? 'ok' : 'bad');
      if (!ok) {
        b.disabled = true;
        $('.gr-feedback', body).innerHTML = `<p class="note warn">${t('gr.tryAgain')}</p>`;
        return;
      }
      if (S.firstTry[S.di] == null) S.firstTry[S.di] = S.tries === 1;
      $$('[data-o]', body).forEach(x => { x.disabled = true; });
      const gap = $('.gap', body);
      gap.textContent = answer;
      gap.classList.add('filled');
      $('.gr-feedback', body).innerHTML = `<p class="note ok">${S.tries === 1 ? t('gr.correct') : t('gr.gotIt')}</p>`;
      LQAudio.speak(before + answer + after, { accent: S.accent });
      setNext(true);
    });
  }

  /* ---------- 4. say it out loud ---------- */
  function renderSpeak(body) {
    const ex = S.speak[S.si];
    body.innerHTML = `<div class="translation big">${esc(translation(ex))}</div><div class="vc-slot"></div>`;
    setNext(false);
    voiceCheck($('.vc-slot', body), {
      phrase: asPhrase(ex[0]),
      accent: S.accent,
      onResult: score => {
        S.voice[S.si] = Math.max(S.voice[S.si] || 0, score);
        if (score >= 90) LQEngage.track('voice90');
        if (score >= 100) LQEngage.track('voice100');
        setNext(true);
      }
    });
  }

  /* ---------- finish ---------- */
  function finish() {
    const { lang, unit, idx, onExit, teacher } = S;
    const firstTry = S.firstTry.filter(Boolean).length;
    const voice = S.voice.filter(v => v != null);
    const avgVoice = voice.length ? Math.round(voice.reduce((a, b) => a + b, 0) / voice.length) : 0;
    const drills = Math.round(100 * firstTry / unit.drills.length);
    const xp = 25 + firstTry * 5 + Math.round(avgVoice / 10);
    LQStore.updateGrammar(lang, unit.id, { done: true, best: drills });
    LQStore.addXp(xp);
    LQApp.refreshHeader();
    burst(['📘', '⭐', '✨']);
    setTimeout(() => LQEngage.track('lesson'), 900);
    const nextUnit = units(lang)[idx + 1];
    stop();
    LQApp.view.innerHTML = `
      <section class="card finish">
        <div class="finish-emoji">${unit.icon}</div>
        <h2>${esc(t('gr.finTitle', { name: local(unit.title) }))}</h2>
        ${LQUI.teacherSays(teacher, esc(t('teach.done')), 52)}
        <div class="stats">
          <div><b>+${xp}</b><span>XP</span></div>
          <div><b>${firstTry}/${unit.drills.length}</b><span>${t('gr.practice')}</span></div>
          <div><b>${avgVoice}%</b><span>${t('fin.accuracy')}</span></div>
        </div>
        <div class="row center">
          ${nextUnit ? `<button class="btn primary" data-act="nextUnit">${nextUnit.icon} ${esc(local(nextUnit.title))}</button>` : `<p class="note ok">${t('gr.allDone')}</p>`}
          <button class="btn ghost" data-act="map">${t('common.toMap')}</button>
        </div>
      </section>`;
    const n = $('[data-act=nextUnit]', LQApp.view);
    if (n) n.onclick = () => LQApp.go('grammar', { lang, unit: nextUnit.id });
    $('[data-act=map]', LQApp.view).onclick = onExit;
    if (!nextUnit) toast(t('gr.allDone'), 3500);
  }

  /* ---------- map section ---------- */
  function mapCard(lang) {
    const list = units(lang);
    if (!list.length) return '';
    const premium = LQCommerce.isPremium();
    const open = stageOpen(lang);
    const done = list.filter(u => LQStore.grammarProgress(lang, u.id).done).length;
    return `
      <section class="map card course">
        <div class="map-head">
          <h2><span class="chapter-tag">${t('gr.chapter2')}</span> ${t('gr.title')}</h2>
          <span class="muted">${t('gr.units', { d: done, n: list.length })}</span>
        </div>
        <p class="muted">${t('gr.sub')}</p>
        ${!premium ? `<div class="gr-prem"><span>${t('gr.premiumNote')}</span><button class="btn sm premium" data-act="paywall">${t('pay.upgrade')}</button></div>`
          : !open ? `<p class="note">${t('gr.lockedStage', { n: LQData.STATIONS.length })}</p>` : ''}
        <ol class="units">
          ${list.map((u, i) => {
            const p = LQStore.grammarProgress(lang, u.id);
            const can = premium && open && unitOpen(lang, i);
            return `
              <li class="unit ${p.done ? 'done' : can ? 'open' : 'locked'}">
                <span class="unit-ico">${can || p.done ? u.icon : '🔒'}</span>
                <div class="unit-body"><b>${i + 1}. ${esc(local(u.title))}</b><small class="muted">${u.level}${p.done ? ' · ✅' : ''}</small></div>
                ${premium
                  ? `<button class="btn sm ${p.done ? 'ghost' : 'primary'}" data-unit="${u.id}" ${can ? '' : 'disabled'}>${p.done ? t('map.redo') : t('map.start')}</button>`
                  : `<button class="btn sm premium" data-act="paywall" aria-label="${t('pay.upgrade')}">🔒</button>`}
              </li>`;
          }).join('')}
        </ol>
      </section>`;
  }

  window.LQCourse = { start, stop, mapCard, stageOpen, units };
})();
