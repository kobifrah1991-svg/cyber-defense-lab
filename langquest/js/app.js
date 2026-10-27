/* LangQuest — app shell: header · world map · phrasebook vault · settings · daily streak timer */
(function () {
  const { esc, $, $$, karaoke, translitLine, toast, burst, shuffle } = LQUI;
  const { STATIONS, LANGS } = LQData;
  const LEARNING_VIEWS = ['lesson', 'boss', 'review'];

  const view = $('#view');
  let current = 'map';
  let lastInteraction = Date.now();

  function lang() { return LQStore.getSettings().lang; }

  /* ---------- router ---------- */
  function go(name, params = {}) {
    LQLesson.stop();
    LQBoss.stop();
    LQAudio.stop();
    LQUI.closePop();
    current = name;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const back = () => go('map');
    if (name === 'lesson') LQLesson.start(view, params.lang, params.station, back);
    else if (name === 'boss') LQBoss.start(view, params.lang, params.station, back);
    else if (name === 'vault') renderVault();
    else if (name === 'review') startReview();
    else renderMap();
    refreshHeader();
  }

  /* ---------- header ---------- */
  function refreshHeader() {
    const L = LANGS[lang()];
    const st = LQStore.getStreak();
    const due = LQStore.vaultList(lang()).filter(v => v.isDue).length;
    $('#hdrLang').innerHTML = `<span class="flag">${L.flag}</span><span class="hide-sm">${esc(L.name)}</span>`;
    $('#hdrStreak').innerHTML = `
      <span class="fire-ring ${st.doneToday ? 'lit' : ''}" style="--p:${Math.min(100, Math.round(100 * st.todaySec / st.goalSec))}"><span>🔥</span></span>
      <b>${st.count}</b>`;
    $('#hdrStreak').title = st.doneToday
      ? `יעד היום הושג! רצף: ${st.count} ימים`
      : `היום: ${Math.floor(st.todaySec / 60)} / ${st.goalSec / 60} דקות · רצף: ${st.count} ימים`;
    $('#hdrXp').innerHTML = `⭐ <b>${LQStore.getXp()}</b>`;
    $('#hdrVault').innerHTML = `📒${due ? `<i class="badge">${due}</i>` : ''}`;
  }

  /* ---------- world map ---------- */
  function renderMap() {
    const L = LANGS[lang()];
    const s = LQStore.getSettings();
    const st = LQStore.getStreak();
    const due = LQStore.vaultList(lang()).filter(v => v.isDue).length;
    const doneCount = STATIONS.filter(x => LQStore.stationProgress(L.id, x.id).lesson).length;
    const mins = Math.floor(st.todaySec / 60);

    view.innerHTML = `
      <section class="hero">
        <div>
          <h1>המסע שלך ב${esc(L.name)} <span class="flag">${L.flag}</span></h1>
          <p class="muted">שפה מדוברת לחו״ל — 3-5 דקות לתחנה: שומעים, מאטים, משחקים ומדברים.</p>
          <div class="accent-pick" role="radiogroup" aria-label="מבטא">
            ${L.accents.map(a => `<button role="radio" aria-checked="${s.accent[L.id] === a.code}" class="pill ${s.accent[L.id] === a.code ? 'on' : ''}" data-accent="${a.code}">${a.flag} ${esc(a.label)}</button>`).join('')}
            <button class="pill ghost" data-act="test">🔊 בדיקת קול</button>
          </div>
        </div>
        <div class="goal card">
          <div class="goal-top"><span class="big-fire ${st.doneToday ? 'lit' : ''}">🔥</span><div><b>${st.count} ימי רצף</b><small>שיא: ${st.best}</small></div></div>
          <div class="bar"><i style="width:${Math.min(100, Math.round(100 * st.todaySec / st.goalSec))}%"></i></div>
          <small>${st.doneToday ? '✅ יעד 5 הדקות של היום הושג' : `היום: ${mins} / 5 דקות למידה`}</small>
        </div>
      </section>

      <section class="map card">
        <div class="map-head"><h2>🗺️ מפת המסע</h2><span class="muted">${doneCount}/${STATIONS.length} תחנות</span></div>
        <ol class="path">
          ${STATIONS.map((x, i) => {
            const p = LQStore.stationProgress(L.id, x.id);
            const open = LQStore.isStationUnlocked(L.id, STATIONS, i);
            const state = p.lesson ? 'done' : open ? 'open' : 'locked';
            return `
              <li class="node ${state}" style="--i:${i}">
                <div class="node-ico">${open ? x.icon : '🔒'}</div>
                <div class="node-body">
                  <div class="node-name">${i + 1}. ${esc(x.name)}</div>
                  <div class="node-meta">${p.lesson ? `✅ הושלם · הגייה ${p.bestVoice}%` : open ? '3 ביטויים · ~4 דק׳' : 'השלימו את התחנה הקודמת'}${p.boss ? ' · 👑 בוס הובס' : ''}</div>
                  <div class="node-actions">
                    <button class="btn sm ${p.lesson ? 'ghost' : 'primary'}" data-lesson="${x.id}" ${open ? '' : 'disabled'}>${p.lesson ? '🔁 שיעור' : '▶️ התחל'}</button>
                    <button class="btn sm boss" data-boss="${x.id}" ${p.lesson ? '' : 'disabled'} title="${p.lesson ? '' : 'נפתח אחרי השיעור'}">👑 Boss</button>
                  </div>
                </div>
              </li>`;
          }).join('')}
        </ol>
      </section>

      <section class="card vault-cta">
        <div><h3>📒 אוסף הביטויים</h3><p class="muted">${due ? `${due} ביטויים מחכים לחזרה היום` : 'אין חזרות להיום — ביטויים קשים נשמרים כאן אוטומטית'}</p></div>
        <div class="row">
          ${due ? '<button class="btn primary" data-act="review">🧠 חזרה עכשיו</button>' : ''}
          <button class="btn ghost" data-act="vault">לאוסף</button>
        </div>
      </section>`;

    $$('[data-accent]', view).forEach(b => b.onclick = () => {
      LQStore.setAccent(L.id, b.dataset.accent);
      renderMap();
      testVoice();
    });
    $('[data-act=test]', view).onclick = testVoice;
    $$('[data-lesson]', view).forEach(b => b.onclick = () => go('lesson', { lang: L.id, station: b.dataset.lesson }));
    $$('[data-boss]', view).forEach(b => b.onclick = () => go('boss', { lang: L.id, station: b.dataset.boss }));
    const r = $('[data-act=review]', view);
    if (r) r.onclick = () => go('review');
    $('[data-act=vault]', view).onclick = () => go('vault');
  }

  function testVoice() {
    const p = LANGS[lang()].stations.airport.phrases[0];
    const accent = LQUI.currentAccent();
    const v = LQAudio.pickVoice(accent);
    LQAudio.speak(p.text, { accent, rate: 1 });
    if (!LQAudio.hasTTS) toast('הדפדפן לא תומך בהקראה (TTS)');
    else if (!v) toast(`לא נמצא קול ${accent} במכשיר — ייתכן שיושמע קול ברירת מחדל`);
    else toast(`🔊 ${v.name}`);
  }

  /* ---------- vault ---------- */
  function vaultEntries() {
    return LQStore.vaultList(lang())
      .map(v => {
        const [lg, station, idx] = v.id.split(':');
        return { ...v, phrase: LQData.getPhrase(lg, station, +idx), station: STATIONS.find(s => s.id === station) };
      })
      .filter(v => v.phrase);
  }

  function renderVault() {
    const items = vaultEntries().sort((a, b) => (a.due > b.due ? 1 : -1));
    const due = items.filter(i => i.isDue).length;
    const accent = LQUI.currentAccent();
    view.innerHTML = `
      <section class="card">
        <div class="map-head"><h2>📒 אוסף הביטויים</h2><button class="btn ghost sm" data-act="back">→ למפה</button></div>
        <p class="muted">ביטויים שהתקשיתם בהם נשמרים כאן אוטומטית (או בלחיצה על ☆). החזרות מתוזמנות בשיטת Spaced Repetition: 1 → 3 → 7 → 14 → 30 ימים.</p>
        ${due ? `<button class="btn primary" data-act="review">🧠 חזרה על ${due} ביטויים</button>` : ''}
        ${items.length ? `<ul class="vault-list">${items.map(i => `
          <li>
            <span class="v-emoji">${i.phrase.emoji}</span>
            <div class="v-body">
              <button class="v-text" dir="ltr" data-say="${esc(i.id)}">${esc(i.phrase.text)}</button>
              <div class="muted">${esc(i.phrase.he)} · ${i.station.icon}</div>
            </div>
            <div class="v-meta">
              <div class="boxes" title="רמת שליטה">${LQStore.SRS_INTERVALS.map((_, k) => `<i class="${k <= i.box ? 'on' : ''}"></i>`).join('')}</div>
              <small>${i.isDue ? '⏰ היום' : esc(i.due)}</small>
            </div>
            <button class="btn ghost sm" data-rm="${esc(i.id)}" title="הסרה">✕</button>
          </li>`).join('')}</ul>` : '<p class="empty">האוסף ריק — התחילו שיעור ושמרו ביטויים עם ☆</p>'}
      </section>`;
    $('[data-act=back]', view).onclick = () => go('map');
    const r = $('[data-act=review]', view);
    if (r) r.onclick = () => go('review');
    $$('[data-say]', view).forEach(b => b.onclick = () => {
      const it = items.find(x => x.id === b.dataset.say);
      LQAudio.speak(it.phrase.text, { accent, weights: it.phrase.words.map(w => w.syl.length) });
    });
    $$('[data-rm]', view).forEach(b => b.onclick = () => { LQStore.vaultRemove(b.dataset.rm); renderVault(); refreshHeader(); });
  }

  /* ---------- spaced-repetition review ---------- */
  function startReview() {
    const queue = shuffle(vaultEntries().filter(i => i.isDue));
    const accent = LQUI.currentAccent();
    let idx = 0, knew = 0;

    const card = () => {
      if (idx >= queue.length) return done();
      const it = queue[idx];
      const showHe = LQStore.getSettings().translit;
      view.innerHTML = `
        <section class="lesson">
          <div class="lesson-top">
            <button class="btn ghost sm" data-act="exit">✕ יציאה</button>
            <div class="lesson-title">🧠 חזרה חכמה</div>
            <div class="muted">${idx + 1}/${queue.length}</div>
          </div>
          <div class="card review">
            <div class="phrase-emoji">${it.phrase.emoji}</div>
            <div class="translation big">${esc(it.phrase.he)}</div>
            <p class="muted">איך אומרים את זה? אמרו בקול ואז חשפו.</p>
            <div class="reveal-slot hidden">
              <div class="kara-slot"></div>
              ${showHe ? `<div class="translit">${translitLine(it.phrase)}</div>` : ''}
            </div>
            <div class="row center actions">
              <button class="btn primary" data-act="reveal">👀 חשוף ושמע</button>
            </div>
          </div>
        </section>`;
      $('[data-act=exit]', view).onclick = () => go('map');
      $('[data-act=reveal]', view).onclick = () => {
        $('.reveal-slot', view).classList.remove('hidden');
        const k = karaoke($('.kara-slot', view), { text: it.phrase.text, words: it.phrase.words, accent, big: true });
        k.play(1);
        $('.actions', view).innerHTML = `
          <button class="btn ghost" data-act="replay">🔊</button>
          <button class="btn ghost" data-act="slow">🐢</button>
          <button class="btn bad" data-k="0">🔁 שוב</button>
          <button class="btn ok" data-k="1">✅ ידעתי</button>`;
        $('[data-act=replay]', view).onclick = () => k.play(1);
        $('[data-act=slow]', view).onclick = () => k.play(LQStore.getSettings().slowRate);
        $$('[data-k]', view).forEach(b => b.onclick = () => {
          const ok = b.dataset.k === '1';
          LQStore.vaultReview(it.id, ok);
          if (ok) knew++;
          idx++;
          card();
        });
      };
    };

    const done = () => {
      const xp = knew * 2;
      if (xp) LQStore.addXp(xp);
      refreshHeader();
      if (queue.length) burst(['🧠', '⭐', '✨']);
      view.innerHTML = `
        <section class="card finish">
          <div class="finish-emoji">🧠</div>
          <h2>${queue.length ? 'סיימתם את החזרה של היום!' : 'אין חזרות להיום'}</h2>
          ${queue.length ? `<div class="stats"><div><b>${knew}/${queue.length}</b><span>ידעתם</span></div><div><b>+${xp}</b><span>XP</span></div></div>` : ''}
          <div class="row center"><button class="btn primary" data-act="map">🗺️ למפה</button><button class="btn ghost" data-act="vault">📒 לאוסף</button></div>
        </section>`;
      $('[data-act=map]', view).onclick = () => go('map');
      $('[data-act=vault]', view).onclick = () => go('vault');
    };

    card();
  }

  /* ---------- modals: language & settings ---------- */
  const modal = $('#modal');

  function openModal(html, bind) {
    $('.modal-body', modal).innerHTML = html;
    bind($('.modal-body', modal));
    if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
  }

  function closeModal() {
    if (modal.close) modal.close(); else modal.removeAttribute('open');
  }

  function openLangPicker() {
    openModal(`
      <h2>באיזו שפה נדבר?</h2>
      <div class="lang-grid">
        ${Object.values(LANGS).map(L => `
          <button class="lang-card ${L.id === lang() ? 'on' : ''}" data-lang="${L.id}" ${L.status === 'ready' ? '' : 'disabled'}>
            <span class="flag big">${L.flag}</span>
            <b>${esc(L.name)}</b>
            <small dir="ltr">${esc(L.native)}</small>
            <small>${L.status === 'ready' ? L.accents.map(a => a.flag).join(' ') : 'בקרוב'}</small>
          </button>`).join('')}
      </div>`, body => {
      $$('[data-lang]', body).forEach(b => b.onclick = () => {
        LQStore.setSetting('lang', b.dataset.lang);
        closeModal();
        go('map');
      });
    });
  }

  function openSettings() {
    const s = LQStore.getSettings();
    const L = LANGS[lang()];
    const accent = LQUI.currentAccent();
    const voices = LQAudio.voicesFor(accent);
    const chosen = LQAudio.pickVoice(accent);
    openModal(`
      <h2>⚙️ הגדרות קול והגייה</h2>
      <label class="field"><span>מבטא (${esc(L.name)})</span>
        <select data-f="accent">${L.accents.map(a => `<option value="${a.code}" ${a.code === accent ? 'selected' : ''}>${a.flag} ${esc(a.label)} · ${a.code}</option>`).join('')}</select>
      </label>
      <label class="field"><span>קריין</span>
        <select data-f="voice" ${voices.length ? '' : 'disabled'}>
          ${voices.length ? voices.map(v => `<option ${chosen && v.name === chosen.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('') : '<option>לא נמצאו קולות למבטא הזה במכשיר</option>'}
        </select>
        <small class="muted">קולות המסומנים Natural / Neural / Online נשמעים הכי טבעיים.</small>
      </label>
      <label class="field"><span>מהירות מצב צב 🐢: <b data-out>${Math.round(s.slowRate * 100)}%</b></span>
        <input type="range" min="0.5" max="0.7" step="0.05" value="${s.slowRate}" data-f="rate">
      </label>
      <label class="field check"><input type="checkbox" data-f="translit" ${s.translit ? 'checked' : ''}> <span>הצגת תעתיק עברי מנוקד</span></label>
      <div class="row">
        <button class="btn ghost" data-act="test">🔊 בדיקה</button>
        <button class="btn ghost" data-act="test-slow">🐢 בדיקה איטית</button>
      </div>
      <p class="muted small">${LQAudio.canListen ? '🎙️ זיהוי דיבור זמין בדפדפן הזה.' : '🎙️ זיהוי דיבור לא זמין בדפדפן הזה — מומלץ Chrome או Edge.'}</p>
      <hr>
      <div class="row spread"><button class="btn bad sm" data-act="reset">איפוס כל ההתקדמות</button><button class="btn primary" data-act="close">סגירה</button></div>`, body => {
      $('[data-f=accent]', body).onchange = e => { LQStore.setAccent(L.id, e.target.value); openSettings(); if (current === 'map') renderMap(); };
      const vs = $('[data-f=voice]', body);
      vs.onchange = () => LQStore.setVoice(accent, vs.value);
      const rate = $('[data-f=rate]', body);
      rate.oninput = () => { $('[data-out]', body).textContent = Math.round(rate.value * 100) + '%'; };
      rate.onchange = () => LQStore.setSetting('slowRate', +rate.value);
      $('[data-f=translit]', body).onchange = e => { LQStore.setSetting('translit', e.target.checked); };
      const sample = LANGS[lang()].stations.restaurant.phrases[0];
      $('[data-act=test]', body).onclick = () => LQAudio.speak(sample.text, { accent, rate: 1 });
      $('[data-act=test-slow]', body).onclick = () => LQAudio.speak(sample.text, { accent, rate: +rate.value });
      $('[data-act=reset]', body).onclick = () => {
        if (confirm('לאפס את כל ההתקדמות, הרצף והאוסף?')) { LQStore.resetAll(); closeModal(); go('map'); }
      };
      $('[data-act=close]', body).onclick = () => { closeModal(); if (current === 'map') renderMap(); };
    });
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.addEventListener('close', () => LQAudio.stop());

  /* ---------- daily active-time tracking (streak) ---------- */
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { lastInteraction = Date.now(); }, { passive: true }));
  setInterval(() => {
    if (document.hidden || !LEARNING_VIEWS.includes(current)) return;
    if (Date.now() - lastInteraction > 90000) return;
    if (LQStore.addActiveSeconds(5)) {
      toast('🔥 יעד 5 הדקות היומי הושג! הרצף ממשיך (+20 XP)', 3500);
      burst(['🔥', '⭐', '🔥']);
    }
    refreshHeader();
  }, 5000);

  /* ---------- boot ---------- */
  $('#hdrLang').onclick = openLangPicker;
  $('#hdrSettings').onclick = openSettings;
  $('#hdrVault').onclick = () => go('vault');
  $('#logoBtn').onclick = e => { e.preventDefault(); go('map'); };
  LQAudio.onVoices(() => { if ($('#modal[open] [data-f=voice]')) openSettings(); });

  window.LQApp = { go, refreshHeader, view };
  go('map');
})();
