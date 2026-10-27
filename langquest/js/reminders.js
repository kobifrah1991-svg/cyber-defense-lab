/* LangQuest — study reminders
 *  - In-app scheduler: while the app is open (even in a background tab) it fires a system
 *    notification + in-app banner at the learner's chosen times on chosen weekdays
 *  - Calendar export (.ics with a recurring event + alarm, or a Google Calendar link) so the
 *    reminder also arrives when the app is closed
 */
(function () {
  const { esc, $, $$ } = LQUI;
  const { t, f } = LQI18n;
  const dayNames = () => t('rem.dayNames');   // Sunday = 0
  const ICS_DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const MAX_TIMES = 3;
  const LATE_WINDOW_MIN = 30;   // still notify if the app was opened up to 30 min after the slot

  const dueListeners = [];
  let swReg = null;

  if (navigator.serviceWorker && location.protocol.startsWith('http') && !LQNative.isNative) {
    navigator.serviceWorker.register('sw.js').then(r => { swReg = r; }).catch(() => {});
  }

  const pad = n => String(n).padStart(2, '0');
  const hm = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  /* ---------- notifications ---------- */
  // Android app: real scheduled notifications, delivered even when the app is closed
  const LN = LQNative.plugin('LocalNotifications');
  const NATIVE_BASE_ID = 4100;
  let nativePerm = 'default';

  const mapPerm = p => (p === 'granted' ? 'granted' : p === 'denied' ? 'denied' : 'default');

  function permission() {
    if (LN) return nativePerm;
    return 'Notification' in window ? Notification.permission : 'unsupported';
  }

  async function requestPermission() {
    if (LN) {
      const r = await LN.requestPermissions().catch(() => ({ display: 'denied' }));
      nativePerm = mapPerm(r.display);
      await syncNative();
      return nativePerm;
    }
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'default') {
      try { return await Notification.requestPermission(); } catch { return Notification.permission; }
    }
    return Notification.permission;
  }

  /** Re-create the weekly native notifications from the reminder settings. */
  async function syncNative() {
    if (!LN) return;
    try {
      const pending = await LN.getPending();
      const ours = pending.notifications.filter(n => n.id >= NATIVE_BASE_ID && n.id < NATIVE_BASE_ID + 100);
      if (ours.length) await LN.cancel({ notifications: ours.map(n => ({ id: n.id })) });
      const r = LQStore.getProfile().reminder;
      if (!r.enabled || nativePerm !== 'granted') return;
      const { title, body } = reminderText();
      const notifications = [];
      r.days.forEach(d => r.times.forEach((time, i) => {
        const [hour, minute] = time.split(':').map(Number);
        notifications.push({
          id: NATIVE_BASE_ID + d * 10 + i, title, body, smallIcon: 'ic_stat_langquest',
          schedule: { on: { weekday: d + 1, hour, minute }, allowWhileIdle: true }   // Capacitor: 1 = Sunday
        });
      }));
      if (notifications.length) await LN.schedule({ notifications });
    } catch { /* plugin unavailable on this device */ }
  }

  if (LN) {
    LN.checkPermissions().then(p => { nativePerm = mapPerm(p.display); syncNative(); }).catch(() => {});
  }

  async function notify(title, body) {
    if (permission() !== 'granted') return false;
    if (LN) {
      await LN.schedule({ notifications: [{ id: NATIVE_BASE_ID + 99, title, body, smallIcon: 'ic_stat_langquest', schedule: { at: new Date(Date.now() + 1500) } }] });
      return true;
    }
    const opts = {
      body,
      tag: 'langquest-reminder',
      renotify: true,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗺️</text></svg>",
      data: { url: location.href.split('#')[0] }
    };
    try {
      if (swReg && swReg.showNotification) { await swReg.showNotification(title, opts); return true; }
      new Notification(title, opts);
      return true;
    } catch {
      return false;
    }
  }

  function reminderText() {
    const p = LQStore.getProfile();
    const L = LQData.LANGS[LQStore.getSettings().lang];
    const st = LQStore.getStreak();
    return {
      title: t('rem.title', { lang: f(L, 'name') }),
      body: st.count ? t('rem.bodyStreak', { m: p.minutes, n: st.count }) : t('rem.body', { m: p.minutes })
    };
  }

  /* ---------- scheduler ---------- */
  function slotsToday(now = new Date()) {
    const r = LQStore.getProfile().reminder;
    if (!r.enabled || !r.days.includes(now.getDay())) return [];
    return r.times.slice().sort();
  }

  /** The latest reminder time that already passed today, if today's goal is not done yet. */
  function pendingSlot(now = new Date()) {
    if (LQStore.getStreak().doneToday) return null;
    const passed = slotsToday(now).filter(t => toMin(t) <= toMin(hm(now)));
    return passed.length ? passed[passed.length - 1] : null;
  }

  function tick() {
    const now = new Date();
    const r = LQStore.getProfile().reminder;
    const today = LQStore.dayKey(now);
    const nowMin = toMin(hm(now));
    for (const t of slotsToday(now)) {
      const key = today + ' ' + t;
      const late = nowMin - toMin(t);
      if (late < 0 || late > LATE_WINDOW_MIN || r.fired[key]) continue;
      const fired = { [key]: true };
      Object.keys(r.fired).forEach(k => { if (k.startsWith(today)) fired[k] = true; });   // drop older days
      LQStore.setReminder({ fired });
      if (LQStore.getStreak().doneToday) continue;
      const { title, body } = reminderText();
      if (!LN) notify(title, body);   // the app already has a scheduled system notification
      dueListeners.forEach(fn => fn(t));
    }
  }

  setInterval(tick, 20000);
  setTimeout(tick, 1500);

  /* ---------- calendar export ---------- */
  function nextDate(days, time) {
    const d = new Date();
    for (let i = 0; i < 8; i++) {
      const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      if (days.includes(c.getDay()) && (i > 0 || toMin(time) > toMin(hm(d)))) return c;
    }
    return d;
  }

  const stamp = (d, time) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${time.replace(':', '')}00`;

  function eventText() {
    const p = LQStore.getProfile();
    const L = LQData.LANGS[LQStore.getSettings().lang];
    return {
      summary: t('rem.summary', { m: p.minutes, lang: f(L, 'name') }),
      details: t('rem.details', { m: p.minutes, lang: f(L, 'name') }) + ' ' + location.href.split('#')[0]
    };
  }

  function buildIcs() {
    const r = LQStore.getProfile().reminder;
    const p = LQStore.getProfile();
    const { summary, details } = eventText();
    const byday = r.days.map(d => ICS_DAYS[d]).join(',');
    const now = new Date();
    const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LangQuest//Study Reminder//HE', 'CALSCALE:GREGORIAN'];
    r.times.forEach((t, i) => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:langquest-${i}-${t.replace(':', '')}-${now.getTime()}@langquest`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${stamp(nextDate(r.days, t), t)}`,
        `DURATION:PT${p.minutes}M`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${details.replace(/([,;])/g, '\\$1')}`,
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${summary}`, 'TRIGGER:-PT0M', 'END:VALARM',
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  function downloadIcs() {
    const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'langquest-reminder.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function googleLink(time) {
    const r = LQStore.getProfile().reminder;
    const p = LQStore.getProfile();
    const { summary, details } = eventText();
    const d = nextDate(r.days, time);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), ...time.split(':').map(Number));
    end.setMinutes(end.getMinutes() + p.minutes);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: summary,
      details,
      dates: `${stamp(d, time)}/${stamp(end, hm(end))}`,
      recur: `RRULE:FREQ=WEEKLY;BYDAY=${r.days.map(x => ICS_DAYS[x]).join(',')}`
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  /* ---------- editor UI (used in onboarding and settings) ---------- */

  function editor(container, { onChange } = {}) {
    const draw = () => {
      const r = LQStore.getProfile().reminder;
      const perm = permission();
      container.innerHTML = `
        <div class="rem">
          <label class="field check"><input type="checkbox" data-r="enabled" ${r.enabled ? 'checked' : ''}> <span>${t('rem.enable')}</span></label>
          <div class="rem-body ${r.enabled ? '' : 'off'}">
            <div class="field"><span>${t('rem.timeQ')}</span>
              <div class="times">
                ${r.times.map((t, i) => `
                  <span class="time-item"><input type="time" value="${esc(t)}" data-t="${i}">
                  ${r.times.length > 1 ? `<button class="btn ghost sm" data-rm="${i}" title="${t('common.remove')}">✕</button>` : ''}</span>`).join('')}
                ${r.times.length < MAX_TIMES ? `<button class="btn ghost sm" data-r="add">${t('rem.addTime')}</button>` : ''}
              </div>
            </div>
            <div class="field"><span>${t('rem.daysQ')}</span>
              <div class="days">${dayNames().map((n, d) => `<button class="day ${r.days.includes(d) ? 'on' : ''}" data-d="${d}" aria-pressed="${r.days.includes(d)}">${n}</button>`).join('')}</div>
            </div>
            <div class="perm">${t('rem.perm.' + perm)}</div>
            <div class="row">
              ${perm === 'default' ? `<button class="btn primary sm" data-r="perm">${t('rem.allow')}</button>` : ''}
              ${perm === 'granted' ? `<button class="btn ghost sm" data-r="test">${t('rem.test')}</button>` : ''}
              <button class="btn ghost sm" data-r="ics">${t('rem.ics')}</button>
              ${r.times.map(t => `<a class="btn ghost sm" target="_blank" rel="noopener" href="${esc(googleLink(t))}">Google Calendar ${esc(t)}</a>`).join('')}
            </div>
            <p class="muted small">${t(LN ? 'rem.noteNative' : 'rem.note')}</p>
          </div>
        </div>`;

      $('[data-r=enabled]', container).onchange = async e => {
        LQStore.setReminder({ enabled: e.target.checked });
        if (e.target.checked) await requestPermission();
        changed();
      };
      $$('[data-t]', container).forEach(inp => inp.onchange = () => {
        if (!inp.value) return;
        const times = LQStore.getProfile().reminder.times.slice();
        times[+inp.dataset.t] = inp.value;
        LQStore.setReminder({ times: Array.from(new Set(times)).sort() });
        changed();
      });
      $$('[data-rm]', container).forEach(b => b.onclick = () => {
        const times = LQStore.getProfile().reminder.times.filter((_, i) => i !== +b.dataset.rm);
        LQStore.setReminder({ times });
        changed();
      });
      const add = $('[data-r=add]', container);
      if (add) add.onclick = () => {
        const times = LQStore.getProfile().reminder.times;
        const last = toMin(times[times.length - 1]);
        const nt = Math.min(last + 180, 23 * 60);
        LQStore.setReminder({ times: Array.from(new Set([...times, pad(Math.floor(nt / 60)) + ':' + pad(nt % 60)])).sort() });
        changed();
      };
      $$('[data-d]', container).forEach(b => b.onclick = () => {
        const d = +b.dataset.d;
        let days = LQStore.getProfile().reminder.days;
        days = days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort();
        if (!days.length) return LQUI.toast(t('rem.oneDay'));
        LQStore.setReminder({ days });
        changed();
      });
      const permBtn = $('[data-r=perm]', container);
      if (permBtn) permBtn.onclick = async () => { await requestPermission(); changed(); };
      const test = $('[data-r=test]', container);
      if (test) test.onclick = () => { const { title, body } = reminderText(); notify(title, body); };
      $('[data-r=ics]', container).onclick = downloadIcs;
    };
    const changed = () => { draw(); syncNative(); if (onChange) onChange(); };
    draw();
  }

  function summary() {
    const r = LQStore.getProfile().reminder;
    if (!r.enabled) return t('rem.off');
    const days = r.days.length === 7 ? t('rem.everyDay') : r.days.map(d => dayNames()[d]).join(' ');
    return `${days} · ${r.times.join(', ')}`;
  }

  window.LQReminders = {
    editor, summary, pendingSlot, notify, requestPermission, permission, buildIcs, googleLink,
    onDue: fn => dueListeners.push(fn),
    syncNative,
    tick
  };
})();
