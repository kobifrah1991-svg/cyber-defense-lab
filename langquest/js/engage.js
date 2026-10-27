/* TedraLingo — motivation layer
 *  - Daily quests: 3 per day (same 3 all day, picked by date); +15 XP each, all three earn a streak freeze
 *  - Streak freezes: protect the streak on a missed day (applied automatically in store.rollDay)
 *  - Personal weekly league: Bronze → Silver → Gold → Diamond by this week's XP (no fake competitors)
 *  - Levels from total XP, badges for milestones, and a shareable progress card
 * Learning screens report what happened through LQEngage.track(event).
 */
(function () {
  const { esc, toast, burst } = LQUI;
  const t = (k, v) => LQI18n.t(k, v);

  const QUEST_XP = 15;
  const ALL_DONE_XP = 30;
  const MAX_FREEZES = 2;

  // id → target and which tracked events count toward it
  const QUESTS = {
    lesson: { icon: '✏️', target: () => 1, on: ['lesson'] },
    voice90: { icon: '🎙️', target: () => 1, on: ['voice90'] },
    review: { icon: '🧠', target: () => 3, on: ['review'] },
    boss: { icon: '👑', target: () => 1, on: ['boss'] },
    perfect: { icon: '🎯', target: () => 3, on: ['perfect'] },
    words: { icon: '👆', target: () => 5, on: ['word'] },
    minutes: { icon: '⏱️', target: () => LQStore.getProfile().minutes, on: [] }   // read from today's practice time
  };

  const TIERS = [
    { id: 1, icon: '🥉', xp: 150 },
    { id: 2, icon: '🥈', xp: 400 },
    { id: 3, icon: '🥇', xp: 800 },
    { id: 4, icon: '💎', xp: 1500 }
  ];

  const BADGES = [
    { id: 'first_lesson', icon: '🌱', check: c => c.lesson >= 1 },
    { id: 'first_boss', icon: '👑', check: c => c.boss >= 1 },
    { id: 'streak3', icon: '🔥', check: (c, s) => s.best >= 3 },
    { id: 'streak7', icon: '⚡', check: (c, s) => s.best >= 7 },
    { id: 'streak30', icon: '🏆', check: (c, s) => s.best >= 30 },
    { id: 'perfect', icon: '💯', check: c => c.voice100 >= 1 },
    { id: 'explorer', icon: '🗺️', check: () => Object.keys(LQData.LANGS).some(lg => LQData.LANGS[lg].status === 'ready'
      && LQData.STATIONS.every(st => LQStore.stationProgress(lg, st.id).lesson)) },
    { id: 'reviewer', icon: '🐘', check: c => c.review >= 50 },
    { id: 'polyglot', icon: '🌍', check: () => Object.keys(LQData.LANGS).filter(lg => LQData.STATIONS.some(st => LQStore.stationProgress(lg, st.id).lesson)).length >= 2 },
    { id: 'quests7', icon: '📅', check: c => c.questDays >= 7 }
  ];

  /* ---------- daily quests ---------- */
  function seeded(seed) {
    let h = 0;
    for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return () => { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; };
  }

  function todaysQuests() {
    const e = LQStore.getEngage();
    const today = LQStore.dayKey();
    if (e.quests && e.quests.day === today) return e.quests;
    const rnd = seeded(today);
    const dueReviews = LQStore.vaultList(LQStore.getSettings().lang).filter(v => v.isDue).length;
    const pool = Object.keys(QUESTS).filter(id => id !== 'lesson' && !(id === 'review' && dueReviews < 3));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    e.quests = {
      day: today,
      allDone: false,
      list: ['lesson', ...pool.slice(0, 2)].map(id => ({ id, target: QUESTS[id].target(), progress: 0, done: false }))
    };
    LQStore.saveEngage();
    return e.quests;
  }

  /**
   * Record something the learner did. Returns what it unlocked; also shows the celebration.
   * events: lesson · voice90 · voice100 · review · boss · perfect · word · tick
   */
  function track(event, amount = 1) {
    const e = LQStore.getEngage();
    const q = todaysQuests();
    const c = e.counters;
    if (event !== 'tick') c[event] = (c[event] || 0) + amount;
    const unlocked = { quests: [], allDone: false, freeze: false, badges: [] };

    q.list.forEach(item => {
      if (item.done) return;
      if (item.id === 'minutes') item.progress = Math.floor(LQStore.getStreak().todaySec / 60);
      else if (QUESTS[item.id].on.includes(event)) item.progress += amount;
      if (item.progress >= item.target) {
        item.progress = item.target;
        item.done = true;
        LQStore.addXp(QUEST_XP);
        unlocked.quests.push(item.id);
      }
    });
    if (!q.allDone && q.list.every(i => i.done)) {
      q.allDone = true;
      unlocked.allDone = true;
      c.questDays = (c.questDays || 0) + 1;
      if (e.freezes < MAX_FREEZES) { e.freezes++; unlocked.freeze = true; } else LQStore.addXp(ALL_DONE_XP);
    }

    const streak = LQStore.getStreak();
    BADGES.forEach(b => {
      if (!e.badges[b.id] && b.check(c, streak)) { e.badges[b.id] = LQStore.dayKey(); unlocked.badges.push(b.id); }
    });
    LQStore.saveEngage();
    celebrate(unlocked);
    return unlocked;
  }

  function celebrate(u) {
    let delay = 0;
    const later = fn => { setTimeout(fn, delay); delay += 1800; };
    u.quests.forEach(id => later(() => toast(t('quest.done', { name: questName({ id, target: QUESTS[id].target() }) }), 2200)));
    if (u.allDone) later(() => { toast(t(u.freeze ? 'quest.allDone' : 'quest.allDoneXp'), 3200); burst(['🎁', '❄️', '⭐']); });
    u.badges.forEach(id => later(() => { toast(t('aw.new', { name: t('b.' + id) }), 3000); burst(['🏅', '✨']); }));
    if (window.LQApp) LQApp.refreshHeader();
  }

  function questName(item) {
    return t('quest.' + item.id, { n: item.target });
  }

  /** A freeze was spent overnight → tell the learner once. */
  function freezeNotice() {
    const e = LQStore.getEngage();
    if (e.freezeUsed && e.freezeUsed.day === LQStore.dayKey() && !e.freezeUsed.shown) {
      e.freezeUsed.shown = true;
      LQStore.saveEngage();
      setTimeout(() => toast(t('freeze.used'), 4000), 800);
    }
  }

  /* ---------- levels & weekly league ---------- */
  // level n starts at 50·n·(n−1) XP: 0, 100, 300, 600, 1000, …
  function level(xp = LQStore.getXp()) {
    let n = 1;
    while (50 * (n + 1) * n <= xp) n++;
    const from = 50 * n * (n - 1);
    const to = 50 * (n + 1) * n;
    return { n, from, to, pct: Math.round(100 * (xp - from) / (to - from)) };
  }

  function weekStart(d) {
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    s.setDate(s.getDate() - s.getDay());   // weeks start on Sunday
    return s;
  }

  function weekXp(offset = 0) {
    const days = LQStore.getEngage().xpDays;
    const start = weekStart(new Date());
    start.setDate(start.getDate() - 7 * offset);
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i);
      sum += days[LQStore.dayKey(d)] || 0;
    }
    return sum;
  }

  function bestWeek() {
    const days = LQStore.getEngage().xpDays;
    const weeks = {};
    Object.entries(days).forEach(([k, v]) => {
      const wk = LQStore.dayKey(weekStart(new Date(k + 'T12:00')));
      weeks[wk] = (weeks[wk] || 0) + v;
    });
    return Math.max(0, ...Object.values(weeks));
  }

  function league() {
    const xp = weekXp();
    const tier = [...TIERS].reverse().find(x => xp >= x.xp) || null;
    const next = TIERS.find(x => xp < x.xp) || null;
    return { xp, tier, next, last: weekXp(1), best: bestWeek() };
  }

  /* ---------- UI: map cards ---------- */
  function questsCard() {
    const q = todaysQuests();
    const e = LQStore.getEngage();
    // keep the minutes quest live
    q.list.forEach(i => { if (i.id === 'minutes' && !i.done) i.progress = Math.min(i.target, Math.floor(LQStore.getStreak().todaySec / 60)); });
    return `
      <section class="card quests">
        <div class="card-head"><h3>${t('quest.title')}</h3><span class="freeze" title="${esc(t('freeze.what'))}">${esc(t('freeze.count', { n: e.freezes }))}</span></div>
        <ul>${q.list.map(i => `
          <li class="${i.done ? 'done' : ''}">
            <span class="q-ico">${i.done ? '✅' : QUESTS[i.id].icon}</span>
            <div class="q-body"><span>${esc(questName(i))}</span><div class="bar"><i style="width:${Math.round(100 * i.progress / i.target)}%"></i></div></div>
            <small>${i.progress}/${i.target}</small>
          </li>`).join('')}</ul>
        <small class="muted">${t('quest.reward')}</small>
      </section>`;
  }

  function leagueCard() {
    const L = league();
    const tierName = L.tier ? `${L.tier.icon} ${t('league.t' + L.tier.id)}` : t('league.t0');
    const pct = L.next ? Math.round(100 * L.xp / L.next.xp) : 100;
    return `
      <section class="card league">
        <div class="card-head"><h3>${t('league.title')}</h3><b>${tierName}</b></div>
        <div class="tiers">${TIERS.map(x => `<span class="${L.xp >= x.xp ? 'on' : ''}" title="${x.xp} XP">${x.icon}</span>`).join('')}</div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <small>${esc(t('league.week', { xp: L.xp }))} · ${esc(L.next ? t('league.next', { n: L.next.xp - L.xp, tier: t('league.t' + L.next.id) }) : t('league.top'))}</small>
        <small class="muted">${esc(t('league.last', { xp: L.last, best: L.best }))}</small>
      </section>`;
  }

  /* ---------- UI: achievements page ---------- */
  function renderAwards(view, onBack) {
    const e = LQStore.getEngage();
    const lv = level();
    const c = e.counters;
    view.innerHTML = `
      <section class="card awards">
        <div class="map-head"><h2>${t('aw.title')}</h2><button class="btn ghost sm" data-act="back">${t('common.backToMap')}</button></div>
        <div class="lv-row">
          <div class="lv-badge">${lv.n}</div>
          <div class="lv-body"><b>${esc(t('lvl.short', { n: lv.n }))}</b><div class="bar"><i style="width:${lv.pct}%"></i></div>
            <small class="muted">${esc(t('lvl.progress', { x: LQStore.getXp() - lv.from, y: lv.to - lv.from }))}</small></div>
        </div>
        <p class="muted">${esc(t('aw.stats', { lessons: c.lesson || 0, bosses: c.boss || 0, reviews: c.review || 0 }))}</p>
        <div class="badges">${BADGES.map(b => `
          <div class="badge-tile ${e.badges[b.id] ? 'on' : ''}">
            <span class="b-ico">${e.badges[b.id] ? b.icon : '🔒'}</span>
            <b>${esc(t('b.' + b.id))}</b><small>${esc(t('bd.' + b.id))}</small>
          </div>`).join('')}</div>
        <div class="row center"><button class="btn primary" data-act="share">${t('aw.share')}</button></div>
        <div class="share-preview"></div>
      </section>`;
    view.querySelector('[data-act=back]').onclick = onBack;
    view.querySelector('[data-act=share]').onclick = () => share(view.querySelector('.share-preview'));
  }

  /* ---------- shareable progress card ---------- */
  function drawCard() {
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const rtl = LQI18n.UI_LANGS[LQI18n.ui()].dir === 'rtl';
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0891b2'); grad.addColorStop(0.6, '#0e7490'); grad.addColorStop(1, '#f97316');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.beginPath(); g.arc(W * 0.85, H * 0.12, 260, 0, Math.PI * 2); g.fill();
    g.textAlign = 'center'; g.fillStyle = '#fff';
    g.direction = rtl ? 'rtl' : 'ltr';

    const L = LQData.LANGS[LQStore.getSettings().lang];
    const font = (w, px) => `${w} ${px}px Heebo, "Noto Sans Arabic", Nunito, system-ui, sans-serif`;
    g.font = font(900, 64); g.fillText('TedraLingo', W / 2, 140);
    g.font = font(800, 58); g.fillText(`${L.flag} ${t('card.title', { lang: LQI18n.f(L, 'name') })}`, W / 2, 260);

    const st = LQStore.getStreak();
    const lv = level();
    const done = LQData.STATIONS.filter(s => LQStore.stationProgress(L.id, s.id).lesson).length;
    const stats = [['🔥', st.best, t('card.streak')], ['⭐', lv.n, t('card.level')], ['🗺️', `${done}/${LQData.STATIONS.length}`, t('card.stations')]];
    stats.forEach(([ico, val, label], i) => {
      const x = W / 2 + (i - 1) * 320;
      g.fillStyle = 'rgba(255,255,255,.16)';
      g.beginPath(); g.roundRect(x - 140, 360, 280, 300, 40); g.fill();
      g.fillStyle = '#fff';
      g.font = font(400, 90); g.fillText(ico, x, 470);
      g.font = font(900, 92); g.fillText(String(val), x, 580);
      g.font = font(700, 38); g.fillText(label, x, 635);
    });

    const earned = BADGES.filter(b => LQStore.getEngage().badges[b.id]).map(b => b.icon);
    g.font = font(400, 96);
    g.fillText(earned.length ? earned.slice(0, 7).join(' ') : '🌱', W / 2, 860);
    g.font = font(800, 54);
    g.fillText(`${LQStore.getXp()} XP`, W / 2, 1000);
    g.font = font(600, 40);
    g.fillText(t('card.cta'), W / 2, 1200);
    return cv;
  }

  async function share(preview) {
    const cv = drawCard();
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = new File([blob], 'tedralingo-progress.png', { type: 'image/png' });
    const text = t('card.cta');
    preview.innerHTML = `<img src="${cv.toDataURL('image/png')}" alt="">`;
    try {
      const Share = LQNative.plugin('Share');
      const Fs = LQNative.plugin('Filesystem');
      if (Share && Fs) {
        const data = cv.toDataURL('image/png').split(',')[1];
        const { uri } = await Fs.writeFile({ path: 'tedralingo-progress.png', data, directory: 'CACHE' });
        await Share.share({ title: 'TedraLingo', text, files: [uri] });
        return;
      }
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'TedraLingo', text });
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tedralingo-progress.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  window.LQEngage = { track, todaysQuests, questsCard, leagueCard, renderAwards, level, league, freezeNotice, drawCard, BADGES, QUESTS };
})();
