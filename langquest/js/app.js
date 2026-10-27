/* LangQuest — app shell: header · world map · phrasebook vault · settings · daily streak timer */
(function () {
  const { esc, $, $$, karaoke, translitLine, toast, burst, shuffle } = LQUI;
  const { STATIONS, LANGS } = LQData;
  const { t, f, tr } = LQI18n;
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
    if ((name === 'lesson' || name === 'boss') && !LQCommerce.canOpen(STATIONS.findIndex(x => x.id === params.station))) {
      current = 'map';
      renderMap();
      refreshHeader();
      return openPaywall();
    }
    if (name === 'lesson') LQLesson.start(view, params.lang, params.station, back);
    else if (name === 'boss') LQBoss.start(view, params.lang, params.station, back);
    else if (name === 'vault') renderVault();
    else if (name === 'review') startReview();
    else if (name === 'onboarding') LQOnboarding.start(view, () => { go('map'); LQUI.burst(['🗺️', '✨', '⭐']); });
    else renderMap();
    refreshHeader();
  }

  /* ---------- header ---------- */
  function refreshHeader() {
    const L = LANGS[lang()];
    const st = LQStore.getStreak();
    const due = LQStore.vaultList(lang()).filter(v => v.isDue).length;
    LQI18n.apply();
    $('#hdrLang').innerHTML = `<span class="flag">${L.flag}</span><span class="hide-sm">${esc(f(L, 'name'))}</span>`;
    $('#hdrStreak').innerHTML = `
      <span class="fire-ring ${st.doneToday ? 'lit' : ''}" style="--p:${Math.min(100, Math.round(100 * st.todaySec / st.goalSec))}"><span>🔥</span></span>
      <b>${st.count}</b>`;
    $('#hdrStreak').title = st.doneToday
      ? t('hdr.streakDone', { n: st.count })
      : t('hdr.streakTip', { m: Math.floor(st.todaySec / 60), g: st.goalSec / 60, n: st.count });
    document.body.classList.toggle('onboarding', current === 'onboarding');
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
    const goalMin = st.goalSec / 60;
    const pace = LQStore.getPace(L.id);
    const lvl = LQData.LEVELS[pace.level];
    const slot = LQReminders.pendingSlot();
    const nextStation = STATIONS.find((x, i) => LQStore.isStationUnlocked(L.id, STATIONS, i) && !LQStore.stationProgress(L.id, x.id).lesson);

    view.innerHTML = `
      <div class="map-grid"><div class="map-main">
      ${slot ? `
      <section class="card due-banner">
        <span class="due-ico">⏰</span>
        <div><b>${esc(t('map.dueTitle', { t: slot }))}</b><small>${t('map.dueLeft', { n: Math.max(1, goalMin - mins) })} ${st.count ? t('map.dueStreak', { n: st.count }) : ''}</small></div>
        <button class="btn primary" data-act="due">${nextStation ? `▶️ ${nextStation.icon} ${esc(f(nextStation, 'name'))}` : t('map.review')}</button>
      </section>` : ''}
      <section class="hero">
        <div>
          <h1>${esc(t('map.title', { lang: f(L, 'name') }))} <span class="flag">${L.flag}</span></h1>
          <p class="muted">${t('map.sub')}</p>
          <div class="accent-pick" role="radiogroup" aria-label="${t('map.accent')}">
            ${L.accents.map(a => `<button role="radio" aria-checked="${s.accent[L.id] === a.code}" class="pill ${s.accent[L.id] === a.code ? 'on' : ''}" data-accent="${a.code}">${a.flag} ${esc(f(a, 'label'))}</button>`).join('')}
            <button class="pill ghost" data-act="test">${t('map.testVoice')}</button>
          </div>
          <button class="pace-pill" data-act="level" title="${t('map.changeLevel')}">${t('map.levelPill', { li: lvl.icon, level: esc(f(lvl, 'name')), pi: pace.icon, pace: esc(f(pace, 'name')) })} <span class="muted">✎</span></button>
        </div>
      </section>

      <section class="map card">
        <div class="map-head"><h2>${t('map.mapTitle')}</h2><span class="muted">${t('map.stationsCount', { d: doneCount, n: STATIONS.length })}</span></div>
        <ol class="path">
          ${STATIONS.map((x, i) => {
            const p = LQStore.stationProgress(L.id, x.id);
            const open = LQStore.isStationUnlocked(L.id, STATIONS, i);
            const premiumLock = !LQCommerce.canOpen(i);
            const state = p.lesson ? 'done' : open ? 'open' : 'locked';
            const bossOpen = p.lesson || (pace.bossFree && open);
            return `
              <li class="node ${state}" style="--i:${i}">
                <div class="node-ico">${open ? x.icon : '🔒'}</div>
                <div class="node-body">
                  <div class="node-name">${i + 1}. ${esc(f(x, 'name'))} ${premiumLock ? `<span class="prem-badge">${t('pay.badge')}</span>` : ''}</div>
                  <div class="node-meta">${p.lesson ? t('map.done', { n: p.bestVoice }) : open ? t('map.openMeta') : t('map.locked')}${p.boss ? t('map.bossBeaten') : ''}</div>
                  <div class="node-actions">
                    ${premiumLock && open ? `<button class="btn sm premium" data-act="paywall">${t('pay.upgrade')}</button>` : `
                    <button class="btn sm ${p.lesson ? 'ghost' : 'primary'}" data-lesson="${x.id}" ${open ? '' : 'disabled'}>${p.lesson ? t('map.redo') : t('map.start')}</button>`}
                    <button class="btn sm boss" data-boss="${x.id}" ${bossOpen ? '' : 'disabled'} title="${bossOpen ? '' : t('map.bossLocked')}">👑 Boss</button>
                  </div>
                </div>
              </li>`;
          }).join('')}
        </ol>
      </section>
      </div><aside class="map-side">
      <section class="goal card">
          <div class="goal-top"><span class="big-fire ${st.doneToday ? 'lit' : ''}">🔥</span><div><b>${t('map.streakDays', { n: st.count })}</b><small>${t('map.best', { n: st.best })}</small></div></div>
          <div class="bar"><i style="width:${Math.min(100, Math.round(100 * st.todaySec / st.goalSec))}%"></i></div>
          <small>${st.doneToday ? t('map.goalDone', { g: goalMin }) : t('map.goalProgress', { m: mins, g: goalMin })}</small>
          <button class="rem-line" data-act="reminders">${esc(t('map.reminders', { s: LQReminders.summary() }))}</button>
      </section>
      <section class="card vault-cta">
        <div><h3>${t('map.vaultTitle')}</h3><p class="muted">${due ? t('map.vaultDue', { n: due }) : t('map.vaultEmpty')}</p></div>
        <div class="row">
          ${due ? `<button class="btn primary" data-act="review">${t('map.reviewNow')}</button>` : ''}
          <button class="btn ghost" data-act="vault">${t('map.toVault')}</button>
        </div>
      </section>
      </aside></div>`;

    $$('[data-accent]', view).forEach(b => b.onclick = () => {
      LQStore.setAccent(L.id, b.dataset.accent);
      renderMap();
      testVoice();
    });
    $('[data-act=test]', view).onclick = testVoice;
    $('[data-act=level]', view).onclick = () => openLevelPicker(L.id);
    $('[data-act=reminders]', view).onclick = openReminders;
    const dueBtn = $('[data-act=due]', view);
    if (dueBtn) dueBtn.onclick = () => (nextStation ? go('lesson', { lang: L.id, station: nextStation.id }) : go(due ? 'review' : 'map'));
    $$('[data-lesson]', view).forEach(b => b.onclick = () => go('lesson', { lang: L.id, station: b.dataset.lesson }));
    $$('[data-boss]', view).forEach(b => b.onclick = () => go('boss', { lang: L.id, station: b.dataset.boss }));
    $$('[data-act=paywall]', view).forEach(b => b.onclick = openPaywall);
    const r = $('[data-act=review]', view);
    if (r) r.onclick = () => go('review');
    $('[data-act=vault]', view).onclick = () => go('vault');
  }

  function testVoice() {
    const p = LANGS[lang()].stations.airport.phrases[0];
    const accent = LQUI.currentAccent();
    const v = LQAudio.pickVoice(accent);
    LQAudio.speak(p.text, { accent, rate: 1 });
    if (!LQAudio.hasTTS) toast(t('voice.noTts'));
    else if (!v) toast(t('voice.noVoice', { a: accent }));
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
        <div class="map-head"><h2>${t('vault.title')}</h2><button class="btn ghost sm" data-act="back">${t('common.backToMap')}</button></div>
        <p class="muted">${t('vault.desc')}</p>
        ${due ? `<button class="btn primary" data-act="review">${t('vault.reviewN', { n: due })}</button>` : ''}
        ${items.length ? `<ul class="vault-list">${items.map(i => `
          <li>
            <span class="v-emoji">${i.phrase.emoji}</span>
            <div class="v-body">
              <button class="v-text" dir="ltr" data-say="${esc(i.id)}">${esc(i.phrase.text)}</button>
              <div class="muted">${esc(tr(i.phrase))} · ${i.station.icon}</div>
            </div>
            <div class="v-meta">
              <div class="boxes" title="${t('vault.mastery')}">${LQStore.SRS_INTERVALS.map((_, k) => `<i class="${k <= i.box ? 'on' : ''}"></i>`).join('')}</div>
              <small>${i.isDue ? t('vault.today') : esc(i.due)}</small>
            </div>
            <button class="btn ghost sm" data-rm="${esc(i.id)}" title="${t('common.remove')}">✕</button>
          </li>`).join('')}</ul>` : `<p class="empty">${t('vault.empty')}</p>`}
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
      const showHe = LQI18n.showTranslit();
      view.innerHTML = `
        <section class="lesson">
          <div class="lesson-top">
            <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
            <div class="lesson-title">${t('review.title')}</div>
            <div class="muted">${idx + 1}/${queue.length}</div>
          </div>
          <div class="card review">
            <div class="phrase-emoji">${it.phrase.emoji}</div>
            <div class="translation big">${esc(tr(it.phrase))}</div>
            <p class="muted">${t('review.ask')}</p>
            <div class="reveal-slot hidden">
              <div class="kara-slot"></div>
              ${showHe ? `<div class="translit">${translitLine(it.phrase)}</div>` : ''}
            </div>
            <div class="row center actions">
              <button class="btn primary" data-act="reveal">${t('review.reveal')}</button>
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
          <button class="btn bad" data-k="0">${t('common.again')}</button>
          <button class="btn ok" data-k="1">${t('review.knew')}</button>`;
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
          <h2>${queue.length ? t('review.doneTitle') : t('review.none')}</h2>
          ${queue.length ? `<div class="stats"><div><b>${knew}/${queue.length}</b><span>${t('review.knewLabel')}</span></div><div><b>+${xp}</b><span>XP</span></div></div>` : ''}
          <div class="row center"><button class="btn primary" data-act="map">${t('common.toMap')}</button><button class="btn ghost" data-act="vault">${t('common.toVault')}</button></div>
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
      <h2>${t('langs.title')}</h2>
      <div class="lang-grid">
        ${Object.values(LANGS).map(L => {
          const isUi = L.id === LQI18n.ui();
          return `
          <button class="lang-card ${L.id === lang() ? 'on' : ''}" data-lang="${L.id}" ${L.status === 'ready' && !isUi ? '' : 'disabled'}>
            <span class="flag big">${L.flag}</span>
            <b>${esc(f(L, 'name'))}</b>
            <small dir="ltr">${esc(L.native)}</small>
            <small>${isUi ? t('langs.isUi') : L.status === 'ready' ? L.accents.map(a => a.flag).join(' ') : t('common.soon')}</small>
          </button>`;
        }).join('')}
      </div>`, body => {
      $$('[data-lang]', body).forEach(b => b.onclick = () => {
        const id = b.dataset.lang;
        LQStore.setSetting('lang', id);
        if (LQStore.getLevel(id) == null) return openLevelPicker(id);
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
    const pace = LQStore.getPace(L.id);
    const lvl = LQData.LEVELS[pace.level];
    openModal(`
      <h2>${t('set.title')}</h2>
      <div class="set-group">
        <label class="field"><span>🌐 ${t('common.uiLang')}</span>
          <select data-f="ui">${Object.entries(LQI18n.UI_LANGS).map(([code, U]) => `<option value="${code}" ${code === LQI18n.ui() ? 'selected' : ''}>${U.flag} ${esc(U.name)}</option>`).join('')}</select>
        </label>
        <div class="plan-row"><span>${esc(t('set.levelIn', { lang: f(L, 'name') }))}</span><b>${lvl.icon} ${esc(f(lvl, 'name'))} · ${pace.icon} ${esc(f(pace, 'name'))}</b></div>
        <label class="field"><span>${t('set.goal')}</span>
          <select data-f="minutes">${[3, 5, 10, 15].map(m => `<option value="${m}" ${LQStore.getProfile().minutes === m ? 'selected' : ''}>${t('common.minutes', { n: m })}</option>`).join('')}</select>
        </label>
        <div class="row">
          <button class="btn ghost sm" data-act="level">${t('set.changeLevel')}</button>
          <button class="btn ghost sm" data-act="reminders">${esc(t('set.reminders', { s: LQReminders.summary() }))}</button>
          <button class="btn ghost sm" data-act="profile">${t('set.profile')}</button>
        </div>
      </div>
      ${premiumSection()}
      <h3 class="sub">${t('set.voiceTitle')}</h3>
      <label class="field"><span>${esc(t('set.accent', { lang: f(L, 'name') }))}</span>
        <select data-f="accent">${L.accents.map(a => `<option value="${a.code}" ${a.code === accent ? 'selected' : ''}>${a.flag} ${esc(f(a, 'label'))} · ${a.code}</option>`).join('')}</select>
      </label>
      <label class="field"><span>${t('set.voice')}</span>
        <select data-f="voice" ${voices.length ? '' : 'disabled'}>
          ${voices.length ? voices.map(v => `<option ${chosen && v.name === chosen.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('') : `<option>${t('set.noVoices')}</option>`}
        </select>
        <small class="muted">${t('set.voiceHint')}</small>
      </label>
      <label class="field"><span>${t('set.slow')} <b data-out>${Math.round(s.slowRate * 100)}%</b></span>
        <input type="range" min="0.5" max="0.7" step="0.05" value="${s.slowRate}" data-f="rate">
      </label>
      ${LQI18n.ui() === 'he' ? `<label class="field check"><input type="checkbox" data-f="translit" ${s.translit ? 'checked' : ''}> <span>${t('set.translit')}</span></label>` : ''}
      <div class="row">
        <button class="btn ghost" data-act="test">${t('set.test')}</button>
        <button class="btn ghost" data-act="test-slow">${t('set.testSlow')}</button>
      </div>
      <p class="muted small">${LQAudio.canListen ? t('set.micYes') : t('set.micNo')}</p>
      <hr>
      <div class="row spread"><button class="btn bad sm" data-act="reset">${t('set.reset')}</button><button class="btn primary" data-act="close">${t('common.close')}</button></div>`, body => {
      $('[data-f=ui]', body).onchange = e => { switchUi(e.target.value); openSettings(); };
      bindPremiumSection(body);
      $('[data-f=accent]', body).onchange = e => { LQStore.setAccent(L.id, e.target.value); openSettings(); if (current === 'map') renderMap(); };
      const vs = $('[data-f=voice]', body);
      vs.onchange = () => LQStore.setVoice(accent, vs.value);
      const rate = $('[data-f=rate]', body);
      rate.oninput = () => { $('[data-out]', body).textContent = Math.round(rate.value * 100) + '%'; };
      rate.onchange = () => LQStore.setSetting('slowRate', +rate.value);
      const tl = $('[data-f=translit]', body);
      if (tl) tl.onchange = e => { LQStore.setSetting('translit', e.target.checked); };
      $('[data-f=minutes]', body).onchange = e => { LQStore.updateProfile({ minutes: +e.target.value }); refreshHeader(); };
      $('[data-act=level]', body).onclick = () => openLevelPicker(L.id);
      $('[data-act=reminders]', body).onclick = openReminders;
      $('[data-act=profile]', body).onclick = () => { closeModal(); go('onboarding'); };
      const sample = LANGS[lang()].stations.restaurant.phrases[0];
      $('[data-act=test]', body).onclick = () => LQAudio.speak(sample.text, { accent, rate: 1 });
      $('[data-act=test-slow]', body).onclick = () => LQAudio.speak(sample.text, { accent, rate: +rate.value });
      $('[data-act=reset]', body).onclick = () => {
        if (confirm(t('set.resetConfirm'))) { LQStore.resetAll(); closeModal(); go('map'); }
      };
      $('[data-act=close]', body).onclick = () => { closeModal(); if (current === 'map') renderMap(); };
    });
  }

  function openLevelPicker(langId) {
    openModal('', body => LQOnboarding.levelPicker(body, langId, level => {
      const pace = LQStore.setLevel(langId, level);
      closeModal();
      toast(t('set.levelToast', { icon: pace.icon, pace: f(pace, 'name'), level: f(LQData.LEVELS[level], 'name') }));
      go('map');
    }));
  }

  function openReminders() {
    openModal(`
      <h2>${t('rem.modalTitle')}</h2>
      <p class="muted">${t('rem.modalSub')}</p>
      <div class="rem-slot"></div>
      <div class="row spread"><span></span><button class="btn primary" data-act="close">${t('common.save')}</button></div>`, body => {
      LQReminders.editor($('.rem-slot', body));
      $('[data-act=close]', body).onclick = () => { closeModal(); if (current === 'map') renderMap(); };
    });
  }

  /* ---------- Premium: paywall & license ---------- */
  const PERIOD = { month: 'pay.perMonth', year: 'pay.perYear', once: 'pay.once' };

  function openPaywall() {
    const C = LQCommerce;
    openModal(`
      <div class="paywall">
        <h2>${t('pay.title')}</h2>
        <p class="muted">${t('pay.sub')}</p>
        <ul class="perks">${['pay.f1', 'pay.f2', 'pay.f3', 'pay.f4'].map(k => `<li>✅ ${t(k)}</li>`).join('')}</ul>
        <div class="plans">
          ${C.PLANS.map(p => `
            <div class="plan-card ${p.best ? 'best' : ''}">
              ${p.best ? `<span class="plan-flag">${t('pay.best')}</span>` : ''}
              <b>${t('pay.' + p.id)}</b>
              <div class="plan-price">${esc(C.priceLabel(p))}</div>
              <small class="muted">${t(PERIOD[p.period])}</small>
              <button class="btn ${p.best ? 'primary' : 'ghost'}" data-buy="${p.id}">${t('pay.buy')}</button>
            </div>`).join('')}
        </div>
        <p class="muted small">${esc(t('pay.free', { n: C.FREE_STATIONS }))}</p>
        ${C.demoMode() ? `<p class="note warn small">🧪 ${t('pay.demo')}</p>` : ''}
        <details class="restore"><summary>${t('pay.restore')}</summary>
          <div class="row"><input class="key-input" dir="ltr" placeholder="${t('pay.restorePh')}"><button class="btn sm" data-act="activate">${t('pay.activate')}</button></div>
        </details>
        <div class="row spread"><span></span><button class="btn ghost" data-act="close">${t('common.close')}</button></div>
      </div>`, body => {
      $$('[data-buy]', body).forEach(b => b.onclick = () => {
        const r = C.buy(b.dataset.buy);
        if (r === 'demo') unlocked();
        else if (r === 'unavailable') toast(t('pay.unavailable'));
      });
      $('[data-act=activate]', body).onclick = async () => {
        const key = $('.key-input', body).value.trim();
        if (!key) return;
        try { await C.restore(key); unlocked(); } catch { toast(t('pay.error')); }
      };
      $('[data-act=close]', body).onclick = closeModal;
    });
  }

  function unlocked() {
    closeModal();
    toast(t('pay.thanks'), 3500);
    burst(['⭐', '👑', '🎉']);
    go(current === 'vault' ? 'vault' : 'map');
  }

  function premiumSection() {
    const lic = LQCommerce.license();
    const ui = LQI18n.ui();
    const status = !lic ? t('pay.statusFree')
      : lic.plan === 'lifetime' ? t('pay.lifetime')
      : t('pay.until', { plan: t('pay.' + lic.plan), date: new Date(lic.exp * 1000).toLocaleDateString({ he: 'he-IL', ar: 'ar', ru: 'ru-RU' }[ui] || 'en-US') });
    return `
      <div class="set-group prem">
        <div class="plan-row"><span>${t('pay.status')}</span><b>${lic ? '⭐ ' : ''}${esc(status)}</b></div>
        ${lic ? `
          <label class="field"><span>${t('pay.key')}</span>
            <div class="row"><input class="key-input" dir="ltr" readonly value="${esc(lic.token)}"><button class="btn ghost sm" data-act="copy-key">${t('pay.copy')}</button></div>
          </label>
          <button class="btn ghost sm" data-act="sign-out">${t('pay.signOut')}</button>`
        : `<div class="row"><button class="btn premium sm" data-act="upgrade">${t('pay.upgrade')}</button></div>`}
      </div>`;
  }

  function bindPremiumSection(body) {
    const up = $('[data-act=upgrade]', body);
    if (up) up.onclick = openPaywall;
    const copy = $('[data-act=copy-key]', body);
    if (copy) copy.onclick = () => {
      const inp = $('.prem .key-input', body);
      inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).catch(() => document.execCommand('copy'));
      copy.textContent = t('pay.copied');
    };
    const out = $('[data-act=sign-out]', body);
    if (out) out.onclick = () => { LQCommerce.signOut(); openSettings(); if (current === 'map') renderMap(); };
  }

  /** Change the base language: re-render in place, keep the learner's own language in their profile. */
  function switchUi(code) {
    LQI18n.setUi(code);
    const p = LQStore.getProfile();
    if (!p.known.some(k => k.lang === code)) LQStore.updateProfile({ known: [...p.known, { lang: code, level: 4 }] });
    if (lang() === code) {
      const other = Object.values(LANGS).find(L => L.status === 'ready' && L.id !== code);
      if (other) LQStore.setSetting('lang', other.id);
    }
    refreshHeader();
    if (current === 'map' || current === 'vault') go(current);
  }

  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.addEventListener('close', () => LQAudio.stop());

  /* ---------- daily active-time tracking (streak) ---------- */
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { lastInteraction = Date.now(); }, { passive: true }));
  setInterval(() => {
    if (document.hidden || !LEARNING_VIEWS.includes(current)) return;
    if (Date.now() - lastInteraction > 90000) return;
    if (LQStore.addActiveSeconds(5)) {
      toast(t('streak.reached', { n: LQStore.getProfile().minutes }), 3500);
      burst(['🔥', '⭐', '🔥']);
    }
    refreshHeader();
  }, 5000);

  /* ---------- install as an app (PWA) ---------- */
  let installEvent = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvent = e;
    $('#hdrInstall').classList.remove('hidden');
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    $('#hdrInstall').classList.add('hidden');
    toast(t('pwa.installed'));
  });
  $('#hdrInstall').onclick = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    installEvent = null;
    $('#hdrInstall').classList.add('hidden');
  };

  /* ---------- boot ---------- */
  $('#hdrLang').onclick = openLangPicker;
  $('#hdrSettings').onclick = openSettings;
  $('#hdrVault').onclick = () => go('vault');
  $('#logoBtn').onclick = e => { e.preventDefault(); go('map'); };
  LQAudio.onVoices(() => { if ($('#modal[open] [data-f=voice]')) openSettings(); });

  LQReminders.onDue(slotTime => {
    toast(t('rem.dueToast', { t: slotTime }), 5000);
    if (current === 'map') renderMap();
  });

  window.LQApp = { go, refreshHeader, view, switchUi, openPaywall };

  // back from Stripe Checkout → verify; and re-check subscriptions now and then
  LQCommerce.handleReturn()
    .then(lic => { if (lic) { toast(t('pay.thanks'), 3500); burst(['⭐', '👑', '🎉']); if (current === 'map') renderMap(); } })
    .catch(() => toast(t('pay.error'), 5000));
  LQCommerce.revalidate().then(() => { if (current === 'map') renderMap(); });
  go(LQStore.getProfile().onboarded ? 'map' : 'onboarding');
})();
