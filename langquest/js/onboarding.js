/* LangQuest — first-run onboarding
 *  1. Languages I already know + level in each
 *  2. Language I want to learn + my current level in it
 *  3. Daily practice minutes + reminder time(s) / days
 *  4. Personal plan (pace derived from level and known languages) → start
 */
(function () {
  const { esc, $, $$ } = LQUI;
  const { LEVELS, KNOWN_LANGS, LANGS } = LQData;
  const MINUTES = [3, 5, 10, 15];
  const STEPS = ['השפות שלי', 'מה לומדים', 'זמן ותזכורות', 'התוכנית שלי'];

  let O = null;

  function start(root, onDone) {
    const p = LQStore.getProfile();
    const s = LQStore.getSettings();
    O = {
      root, onDone, step: 0,
      known: p.known.map(k => ({ ...k })),
      target: s.lang,
      level: LQStore.getLevel(s.lang),
      minutes: p.minutes
    };
    render();
  }

  function knownLevel(lang) {
    const k = O.known.find(x => x.lang === lang);
    return k ? k.level : null;
  }

  function render() {
    O.root.innerHTML = `
      <section class="onb">
        <ol class="onb-steps">${STEPS.map((n, i) => `<li class="${i < O.step ? 'done' : i === O.step ? 'cur' : ''}"><i>${i + 1}</i><span>${n}</span></li>`).join('')}</ol>
        <div class="card onb-body"></div>
        <div class="lesson-nav">
          <button class="btn primary" data-act="next">${O.step === STEPS.length - 1 ? '🚀 יוצאים למסע' : 'המשך ←'}</button>
          ${O.step > 0 ? '<button class="btn ghost" data-act="back">→ חזרה</button>' : ''}
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
      : O.step === 1 ? !!O.target && O.level != null
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
      <button class="lvl ${current === l.id ? 'on' : ''}" role="radio" aria-checked="${current === l.id}" data-lang="${lang}" data-lvl="${l.id}" title="${esc(l.desc)}">
        ${l.icon} ${esc(l.name)} <small dir="ltr">${l.cefr}</small>
      </button>`).join('')}</div>`;
  }

  function stepKnown(body) {
    body.innerHTML = `
      <div class="onb-hero">👋</div>
      <h2>ברוכים הבאים ל-LangQuest!</h2>
      <p class="muted">כדי להתאים את הקצב בשבילכם — אילו שפות אתם כבר יודעים, ובאיזו רמה?</p>
      <div class="known-list">
        ${KNOWN_LANGS.map(L => {
          const lvl = knownLevel(L.id);
          return `
            <div class="known ${lvl != null ? 'on' : ''}">
              <button class="known-toggle" data-k="${L.id}" aria-pressed="${lvl != null}">
                <span class="flag">${L.flag}</span> <b>${esc(L.name)}</b> <span class="tick">${lvl != null ? '✓' : '＋'}</span>
              </button>
              ${lvl != null ? levelChips(L.id, lvl) : ''}
            </div>`;
        }).join('')}
      </div>
      <details class="lvl-help"><summary>מה אומרת כל רמה?</summary>
        <ul>${LEVELS.filter(l => l.id > 0).map(l => `<li>${l.icon} <b>${esc(l.name)}</b> <small dir="ltr">(${l.cefr})</small> — ${esc(l.desc)}</li>`).join('')}</ul>
      </details>`;
    $$('[data-k]', body).forEach(b => b.onclick = () => {
      const id = b.dataset.k;
      if (knownLevel(id) != null) O.known = O.known.filter(k => k.lang !== id);
      else O.known.push({ lang: id, level: id === 'he' ? 4 : 1 });
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
      <h2>איזו שפה נלמד? 🧭</h2>
      <div class="lang-grid">
        ${Object.values(LANGS).map(L => `
          <button class="lang-card ${L.id === O.target ? 'on' : ''}" data-lang="${L.id}" ${L.status === 'ready' ? '' : 'disabled'}>
            <span class="flag big">${L.flag}</span><b>${esc(L.name)}</b><small dir="ltr">${esc(L.native)}</small>
            <small>${L.status === 'ready' ? L.accents.map(a => a.flag).join(' ') : 'בקרוב'}</small>
          </button>`).join('')}
      </div>
      <h3 class="sub">מה הרמה שלכם ב${esc(T.name)} היום?</h3>
      <div class="level-cards">
        ${LEVELS.filter(l => !l.knownOnly).map(l => `
          <button class="level-card ${O.level === l.id ? 'on' : ''}" data-level="${l.id}">
            <span class="lc-ico">${l.icon}</span>
            <span><b>${esc(l.name)}</b> <small dir="ltr">${l.cefr}</small><br><small class="muted">${esc(l.desc)}</small></span>
          </button>`).join('')}
      </div>`;
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
      <h2>כמה זמן ביום? ⏱️</h2>
      <p class="muted">עדיף מעט כל יום מאשר הרבה פעם בשבוע. הרצף 🔥 נספר כשמגיעים ליעד היומי.</p>
      <div class="min-chips">${MINUTES.map(m => `<button class="lvl ${O.minutes === m ? 'on' : ''}" data-min="${m}"><b>${m}</b> דקות</button>`).join('')}</div>
      <h3 class="sub">⏰ מתי אתם פנויים ללמוד?</h3>
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
      <h2>התוכנית שלכם ל${esc(T.name)}</h2>
      <div class="plan">
        <div class="plan-row"><span>רמה נוכחית</span><b>${lvl.icon} ${esc(lvl.name)} <small dir="ltr">${lvl.cefr}</small></b></div>
        <div class="plan-row"><span>קצב למידה</span><b>${pace.icon} ${esc(pace.name)}</b></div>
        <p class="plan-desc">${esc(pace.desc)}</p>
        ${boostLang ? `<p class="plan-boost">✨ ${pace.boost.type === 'related'
          ? `${esc(boostLang.name)} שלכם קרובה ל${esc(T.name)} — הרבה מילים וצלילים יהיו מוכרים, אז מתחילים קצת מהר יותר.`
          : `אתם כבר דוברים ${esc(boostLang.name)} — יש לכם ניסיון בלמידת שפה, אז מתחילים בקצב רגיל.`}</p>` : ''}
        <div class="plan-row"><span>יעד יומי</span><b>🔥 ${O.minutes} דקות</b></div>
        <div class="plan-row"><span>תזכורות</span><b>⏰ ${esc(LQReminders.summary())}</b></div>
        <div class="plan-row"><span>תחנות פתוחות</span><b>🗺️ ${pace.unlocked} מתוך ${LQData.STATIONS.length}</b></div>
      </div>
      <p class="muted small">אפשר לשנות הכול בכל רגע דרך ⚙️ הגדרות.</p>`;
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
      <h2>${T.flag} מה הרמה שלכם ב${esc(T.name)}?</h2>
      <p class="muted">נתאים את הקצב, מהירות ההקראה והתעתיק.</p>
      <div class="level-cards">
        ${LEVELS.filter(l => !l.knownOnly).map(l => `
          <button class="level-card" data-level="${l.id}">
            <span class="lc-ico">${l.icon}</span>
            <span><b>${esc(l.name)}</b> <small dir="ltr">${l.cefr}</small><br><small class="muted">${esc(l.desc)}</small></span>
          </button>`).join('')}
      </div>`;
    $$('[data-level]', container).forEach(b => b.onclick = () => onPick(+b.dataset.level));
  }

  window.LQOnboarding = { start, levelPicker };
})();
