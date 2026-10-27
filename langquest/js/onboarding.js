/* LangQuest — first-run onboarding
 *  1. Languages I already know + level in each
 *  2. Language I want to learn + my current level in it
 *  3. Daily practice minutes + reminder time(s) / days
 *  4. Personal plan (pace derived from level and known languages) → start
 */
(function () {
  const { esc, $, $$ } = LQUI;
  const { LEVELS, KNOWN_LANGS, LANGS } = LQData;
  const { t, f } = LQI18n;
  const MINUTES = [3, 5, 10, 15];
  const STEPS = ['onb.s1', 'onb.s2', 'onb.s3', 'onb.s4'];

  let O = null;

  function start(root, onDone) {
    const p = LQStore.getProfile();
    const s = LQStore.getSettings();
    const ui = LQI18n.ui();
    // the base language counts as a native language unless the learner already said otherwise
    if (!p.known.some(k => k.lang === ui)) LQStore.updateProfile({ known: [{ lang: ui, level: 4 }, ...p.known.filter(k => k.lang !== 'he' || ui === 'he')] });
    O = {
      root, onDone, step: 0,
      known: LQStore.getProfile().known.map(k => ({ ...k })),
      target: s.lang === ui ? firstTarget() : s.lang,
      level: LQStore.getLevel(s.lang),
      minutes: p.minutes
    };
    render();
  }

  function firstTarget() {
    const L = Object.values(LANGS).find(x => x.status === 'ready' && x.id !== LQI18n.ui());
    return L ? L.id : null;
  }

  function knownLevel(lang) {
    const k = O.known.find(x => x.lang === lang);
    return k ? k.level : null;
  }

  function render() {
    O.root.innerHTML = `
      <section class="onb">
        <ol class="onb-steps">${STEPS.map((n, i) => `<li class="${i < O.step ? 'done' : i === O.step ? 'cur' : ''}"><i>${i + 1}</i><span>${t(n)}</span></li>`).join('')}</ol>
        <div class="card onb-body"></div>
        <div class="lesson-nav">
          <button class="btn primary" data-act="next">${O.step === STEPS.length - 1 ? t('onb.go') : t('common.continue')}</button>
          ${O.step > 0 ? `<button class="btn ghost" data-act="back">${t('common.back')}</button>` : ''}
        </div>
      </section>`;
    const body = $('.onb-body', O.root);
    [stepKnown, stepTarget, stepTime, stepPlan][O.step](body);
    $('[data-act=next]', O.root).onclick = next;
    const back = $('[data-act=back]', O.root);
    if (back) back.onclick = () => { O.step--; render(); };
    validate();
  }

  function validate() {
    const ok = O.step === 0 ? O.known.length > 0
      : O.step === 1 ? !!O.target && O.target !== LQI18n.ui() && O.level != null
      : true;
    $('[data-act=next]', O.root).disabled = !ok;
  }

  function next() {
    if (O.step < STEPS.length - 1) {
      // carry a level the learner already gave for the target language
      if (O.step === 0 && O.level == null) {
        const kl = knownLevel(O.target);
        if (kl != null) O.level = Math.min(kl, 3);
      }
      // calendar/notification texts in step 3 name the target language
      if (O.step === 1) LQStore.setSetting('lang', O.target);
      O.step++;
      return render();
    }
    finish();
  }

  /* ---------- step 1: languages I know ---------- */
  function levelChips(lang, current, { knownOnly = true } = {}) {
    return `<div class="lvl-chips" role="radiogroup">${LEVELS.filter(l => knownOnly || !l.knownOnly).filter(l => l.id > 0).map(l => `
      <button class="lvl ${current === l.id ? 'on' : ''}" role="radio" aria-checked="${current === l.id}" data-lang="${lang}" data-lvl="${l.id}" title="${esc(f(l, 'desc'))}">
        ${l.icon} ${esc(f(l, 'name'))} ${l.cefr !== f(l, 'name') ? `<small dir="ltr">${l.cefr}</small>` : ''}
      </button>`).join('')}</div>`;
  }

  function stepKnown(body) {
    body.innerHTML = `
      <div class="onb-hero">👋</div>
      <h2>${t('onb.welcome')}</h2>
      <div class="ui-pick">
        <span>🌐 ${t('onb.uiQ')}</span>
        <div class="min-chips">${Object.entries(LQI18n.UI_LANGS).map(([code, U]) => `
          <button class="lvl ${code === LQI18n.ui() ? 'on' : ''}" data-ui="${code}">${U.flag} ${esc(U.name)}</button>`).join('')}</div>
      </div>
      <p class="muted">${t('onb.knownQ')}</p>
      <div class="known-list">
        ${KNOWN_LANGS.map(L => {
          const lvl = knownLevel(L.id);
          return `
            <div class="known ${lvl != null ? 'on' : ''}">
              <button class="known-toggle" data-k="${L.id}" aria-pressed="${lvl != null}">
                <span class="flag">${L.flag}</span> <b>${esc(f(L, 'name'))}</b> <span class="tick">${lvl != null ? '✓' : '＋'}</span>
              </button>
              ${lvl != null ? levelChips(L.id, lvl) : ''}
            </div>`;
        }).join('')}
      </div>
      <details class="lvl-help"><summary>${t('onb.levelsHelp')}</summary>
        <ul>${LEVELS.filter(l => l.id > 0).map(l => `<li>${l.icon} <b>${esc(f(l, 'name'))}</b> <small dir="ltr">(${l.cefr})</small> — ${esc(f(l, 'desc'))}</li>`).join('')}</ul>
      </details>`;
    $$('[data-ui]', body).forEach(b => b.onclick = () => {
      const code = b.dataset.ui;
      LQApp.switchUi(code);
      if (!O.known.some(k => k.lang === code)) O.known.unshift({ lang: code, level: 4 });
      if (O.target === code) { O.target = firstTarget(); O.level = null; }
      render();
    });
    $$('[data-k]', body).forEach(b => b.onclick = () => {
      const id = b.dataset.k;
      if (knownLevel(id) != null) O.known = O.known.filter(k => k.lang !== id);
      else O.known.push({ lang: id, level: id === LQI18n.ui() ? 4 : 1 });
      stepKnown(body);
      validate();
    });
    $$('[data-lvl]', body).forEach(b => b.onclick = () => {
      O.known.find(k => k.lang === b.dataset.lang).level = +b.dataset.lvl;
      stepKnown(body);
    });
  }

  /* ---------- step 2: target language & level ---------- */
  function stepTarget(body) {
    const T = LANGS[O.target];
    body.innerHTML = `
      <h2>${t('onb.targetQ')}</h2>
      <div class="lang-grid">
        ${Object.values(LANGS).map(L => {
          const isUi = L.id === LQI18n.ui();
          return `
          <button class="lang-card ${L.id === O.target ? 'on' : ''}" data-lang="${L.id}" ${L.status === 'ready' && !isUi ? '' : 'disabled'}>
            <span class="flag big">${L.flag}</span><b>${esc(f(L, 'name'))}</b><small dir="ltr">${esc(L.native)}</small>
            <small>${isUi ? t('langs.isUi') : L.status === 'ready' ? L.accents.map(a => a.flag).join(' ') : t('common.soon')}</small>
          </button>`;
        }).join('')}
      </div>
      ${T ? `<h3 class="sub">${esc(t('onb.levelQ', { lang: f(T, 'name') }))}</h3>`: ''}
      <div class="level-cards">
        ${LEVELS.filter(l => !l.knownOnly).map(l => `
          <button class="level-card ${O.level === l.id ? 'on' : ''}" data-level="${l.id}">
            <span class="lc-ico">${l.icon}</span>
            <span><b>${esc(f(l, 'name'))}</b> <small dir="ltr">${l.cefr}</small><br><small class="muted">${esc(f(l, 'desc'))}</small></span>
          </button>`).join('')}
      </div>
      ${T && LQData.TEACHERS[O.target] ? `<h3 class="sub">${t('teach.choose')}</h3>${LQUI.teacherCards(O.target, LQStore.getSettings().accent[O.target] || T.accents[0].code)}` : ''}`;
    $$('[data-accent]', body).forEach(b => b.onclick = () => {
      LQStore.setAccent(O.target, b.dataset.accent);
      stepTarget(body);
      const tc = LQData.TEACHERS[O.target].find(x => x.id === b.dataset.teacher);
      LQAudio.speak(LQData.LANGS[O.target].stations.airport.phrases[0].text, { accent: tc.accent });
    });
    $$('[data-lang]', body).forEach(b => b.onclick = () => {
      O.target = b.dataset.lang;
      const stored = LQStore.getLevel(O.target);
      const kl = knownLevel(O.target);
      O.level = stored != null ? stored : kl != null ? Math.min(kl, 3) : null;
      stepTarget(body);
      validate();
    });
    $$('[data-level]', body).forEach(b => b.onclick = () => {
      O.level = +b.dataset.level;
      stepTarget(body);
      validate();
    });
  }

  /* ---------- step 3: time & reminders ---------- */
  function stepTime(body) {
    body.innerHTML = `
      <h2>${t('onb.timeQ')}</h2>
      <p class="muted">${t('onb.timeSub')}</p>
      <div class="min-chips">${MINUTES.map(m => `<button class="lvl ${O.minutes === m ? 'on' : ''}" data-min="${m}">${t('common.minutes', { n: `<b>${m}</b>` })}</button>`).join('')}</div>
      <h3 class="sub">${t('onb.whenQ')}</h3>
      <div class="rem-slot"></div>`;
    $$('[data-min]', body).forEach(b => b.onclick = () => { O.minutes = +b.dataset.min; LQStore.updateProfile({ minutes: O.minutes }); stepTime(body); });
    if (!LQStore.getProfile().reminder.enabled && !O.remTouched) {
      LQStore.setReminder({ enabled: true });
      O.remTouched = true;
    }
    LQReminders.editor($('.rem-slot', body));
  }

  /* ---------- step 4: plan ---------- */
  function previewPace() {
    // compute the pace with the draft profile without committing the level yet
    const saved = LQStore.getProfile();
    const prev = { known: saved.known, levels: saved.levels };
    LQStore.updateProfile({ known: O.known, levels: { ...saved.levels, [O.target]: O.level } });
    const pace = LQStore.getPace(O.target);
    LQStore.updateProfile(prev);
    return pace;
  }

  function stepPlan(body) {
    const T = LANGS[O.target];
    const pace = previewPace();
    const lvl = LEVELS[O.level];
    const boostLang = pace.boost && KNOWN_LANGS.find(k => k.id === pace.boost.lang);
    body.innerHTML = `
      <div class="onb-hero">${T.flag}</div>
      <h2>${esc(t('onb.planTitle', { lang: f(T, 'name') }))}</h2>
      <div class="plan">
        <div class="plan-row"><span>${t('onb.curLevel')}</span><b>${lvl.icon} ${esc(f(lvl, 'name'))} <small dir="ltr">${lvl.cefr}</small></b></div>
        <div class="plan-row"><span>${t('onb.pace')}</span><b>${pace.icon} ${esc(f(pace, 'name'))}</b></div>
        <p class="plan-desc">${esc(f(pace, 'desc'))}</p>
        ${boostLang ? `<p class="plan-boost">✨ ${esc(t(pace.boost.type === 'related' ? 'onb.boostRelated' : 'onb.boostMulti', { known: f(boostLang, 'name'), lang: f(T, 'name') }))}</p>` : ''}
        <div class="plan-row"><span>${t('onb.goal')}</span><b>🔥 ${t('common.minutes', { n: O.minutes })}</b></div>
        <div class="plan-row"><span>${t('onb.rem')}</span><b>⏰ ${esc(LQReminders.summary())}</b></div>
        <div class="plan-row"><span>${t('onb.open')}</span><b>🗺️ ${t('onb.of', { a: pace.unlocked, b: LQData.STATIONS.length })}</b></div>
      </div>
      <p class="muted small">${t('onb.editLater')}</p>`;
  }

  function finish() {
    LQStore.updateProfile({ known: O.known, minutes: O.minutes, onboarded: true });
    LQStore.setSetting('lang', O.target);
    LQStore.setLevel(O.target, O.level);
    LQReminders.tick();
    const cb = O.onDone;
    O = null;
    cb();
  }

  /** Small modal flow: pick a level for a language the learner switches to for the first time. */
  function levelPicker(container, lang, onPick) {
    const T = LANGS[lang];
    container.innerHTML = `
      <h2>${T.flag} ${esc(t('onb.lvlPickTitle', { lang: f(T, 'name') }))}</h2>
      <p class="muted">${t('onb.lvlPickSub')}</p>
      <div class="level-cards">
        ${LEVELS.filter(l => !l.knownOnly).map(l => `
          <button class="level-card" data-level="${l.id}">
            <span class="lc-ico">${l.icon}</span>
            <span><b>${esc(f(l, 'name'))}</b> <small dir="ltr">${l.cefr}</small><br><small class="muted">${esc(f(l, 'desc'))}</small></span>
          </button>`).join('')}
      </div>`;
    $$('[data-level]', container).forEach(b => b.onclick = () => onPick(+b.dataset.level));
  }

  window.LQOnboarding = { start, levelPicker };
})();
