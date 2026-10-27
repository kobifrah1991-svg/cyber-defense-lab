/* TedraLingo — AI conversation partner (Premium)
 * Free spoken conversation with the learner's teacher: the teacher answers in the target language
 * (read aloud with karaoke), with a translation, a gentle correction and two suggested replies.
 * Talks to server/tutor.js; until it is configured, a demo mode on localhost replays the station's Boss lines.
 */
(function () {
  const { esc, $, $$, karaoke, toast } = LQUI;
  const t = (k, v) => LQI18n.t(k, v);

  // what the teacher role-plays (sent to the model in English)
  const SCENARIOS = {
    free: 'Casual chat: get to know the learner, ask about their upcoming trip and what they want to do there.',
    airport: 'Role-play at the airport: you are the border officer checking the learner\'s passport and asking about their trip.',
    taxi: 'Role-play: you are a taxi driver picking the learner up at the airport; ask where to go and chat on the way.',
    hotel: 'Role-play: you are the hotel receptionist checking the learner in and answering questions about the hotel.',
    cafe: 'Role-play: you are a barista taking the learner\'s order at a busy café.',
    restaurant: 'Role-play: you are a waiter at a restaurant; seat the learner, take the order and bring the check.',
    directions: 'Role-play: you are a friendly local helping the learner, who is lost, find their way.',
    sights: 'Role-play: you sell tickets at a museum and answer questions about opening hours and photos.',
    shopping: 'Role-play: you are a shop assistant helping the learner find clothes in the right size and pay.',
    smalltalk: 'Role-play: you meet the learner at a party; introduce yourselves and make small talk.',
    emergency: 'Role-play: you are a calm paramedic helping the learner, who needs medical help; keep it reassuring and simple.'
  };

  let C = null;   // current conversation

  function apiUrl() {
    const cfg = LQCommerce.CONFIG;
    return cfg.tutorApi || (cfg.licenseApi ? cfg.licenseApi.replace(/\/$/, '') + '/tutor' : '');
  }

  const demo = () => !apiUrl() && LQCommerce.demoMode();

  function start(view, params, onBack) {
    const s = LQStore.getSettings();
    const teacher = LQUI.currentTeacher();
    C = {
      view, onBack, teacher,
      lang: s.lang,
      accent: LQUI.currentAccent(),
      scenario: params.scenario || 'free',
      history: [],       // { role, content } sent to the server
      demoStep: 0,
      busy: false
    };
    render();
    send(null);          // the teacher opens the conversation
  }

  function stop() {
    if (!C) return;
    LQAudio.stop();
    LQAudio.cancelListen();
    C = null;
  }

  function render() {
    const tc = C.teacher;
    const stations = LQData.STATIONS;
    C.view.innerHTML = `
      <section class="chat-wrap">
        <div class="lesson-top">
          <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
          <div class="lesson-title">💬 ${esc(t('chat.title', { name: tc ? tc.name : '' }))}</div>
          <button class="btn ghost sm" data-act="new">${t('chat.new')}</button>
        </div>
        <div class="card tutor">
          <div class="tutor-head">
            ${tc ? LQUI.teacherAvatar(tc, 52) : ''}
            <div><b>${esc(tc ? tc.name : '')}</b><small>📍 ${esc(tc ? (tc.city[LQI18n.ui()] || tc.city.en) : '')}</small></div>
            <label class="scn"><span>${t('chat.scenario')}</span>
              <select data-act="scenario">
                <option value="free">${t('chat.free')}</option>
                ${stations.map(st => `<option value="${st.id}" ${C.scenario === st.id ? 'selected' : ''}>${st.icon} ${esc(LQI18n.f(st, 'name'))}</option>`).join('')}
              </select>
            </label>
          </div>
          ${demo() ? `<p class="note warn small">🧪 ${t('chat.demo')}</p>` : ''}
          <div class="chat tutor-log" aria-live="polite"></div>
          <div class="suggest"></div>
          <form class="composer" autocomplete="off">
            ${LQAudio.canListen ? '<button type="button" class="btn mic round" data-act="mic" title="🎙️"><span class="mic-ico">🎙️</span></button>' : ''}
            <input class="chat-input" dir="auto" maxlength="300" placeholder="${esc(t('chat.placeholder'))}">
            <button class="btn primary" type="submit">${t('chat.send')}</button>
          </form>
        </div>
      </section>`;
    $('[data-act=exit]', C.view).onclick = () => { const cb = C.onBack; stop(); cb(); };
    $('[data-act=new]', C.view).onclick = () => { const { view, onBack, scenario } = C; stop(); start(view, { scenario }, onBack); };
    $('[data-act=scenario]', C.view).onchange = e => { const { view, onBack } = C; stop(); start(view, { scenario: e.target.value }, onBack); };
    $('.composer', C.view).onsubmit = e => {
      e.preventDefault();
      const inp = $('.chat-input', C.view);
      const text = inp.value.trim();
      if (!text || C.busy) return;
      inp.value = '';
      send(text);
    };
    const mic = $('[data-act=mic]', C.view);
    if (mic) mic.onclick = () => listen(mic);
  }

  async function listen(mic) {
    if (C.busy) return;
    if (mic.classList.contains('live')) { LQAudio.cancelListen(); return; }
    mic.classList.add('live');
    try {
      const alts = await LQAudio.listen(C.accent);
      if (C && alts[0]) send(alts[0]);
    } catch (e) {
      toast(LQUI.micError(e.message));
    } finally {
      mic.classList.remove('live');
    }
  }

  function log() { return $('.tutor-log', C.view); }

  function scroll() { const l = log(); l.scrollTop = l.scrollHeight; }

  function addUser(text) {
    const row = document.createElement('div');
    row.className = 'msg me';
    row.innerHTML = `<div class="bubble"><div dir="auto">${esc(text)}</div><div class="fix-slot"></div></div><span class="ava">🙂</span>`;
    log().appendChild(row);
    scroll();
    return row;
  }

  function addTeacher(res) {
    const row = document.createElement('div');
    row.className = 'msg npc';
    row.innerHTML = `<span class="ava">${C.teacher ? LQUI.teacherAvatar(C.teacher, 36) : '🧑‍🏫'}</span>
      <div class="bubble"><div class="bk"></div><div class="bhe">${esc(res.translation || '')}</div><button class="replay" title="${t('boss.replay')}">🔊</button></div>`;
    log().appendChild(row);
    scroll();
    const k = karaoke($('.bk', row), { text: res.reply, accent: C.accent });
    $('.replay', row).onclick = () => k.play(1);
    k.play(1);
  }

  function showCorrection(row, correction) {
    if (!row || !correction) return;
    $('.fix-slot', row).innerHTML = `
      <div class="fix"><b>✏️ ${t('chat.correction')}</b> ${esc(correction.note)}
        <button class="fix-better" dir="ltr">${esc(correction.better)} 🔊</button></div>`;
    $('.fix-better', row).onclick = () => LQAudio.speak(correction.better, { accent: C.accent, rate: LQStore.getSettings().slowRate });
  }

  function showSuggestions(list) {
    const box = $('.suggest', C.view);
    box.innerHTML = (list || []).length ? `<span>${t('chat.try')}</span>${list.map(s => `<button class="chip" dir="ltr">${esc(s)}</button>`).join('')}` : '';
    $$('.chip', box).forEach(b => b.onclick = () => {
      $('.chat-input', C.view).value = b.textContent;
      LQAudio.speak(b.textContent, { accent: C.accent, rate: LQStore.getSettings().slowRate });
    });
  }

  function typing(on) {
    let el = $('.typing', C.view);
    if (on && !el) {
      el = document.createElement('div');
      el.className = 'typing';
      el.textContent = `${C.teacher ? C.teacher.name : ''} ✍️ …`;
      log().appendChild(el);
      scroll();
    }
    if (!on && el) el.remove();
    $$('.composer button, .composer input', C.view).forEach(x => { x.disabled = on; });
  }

  /** Send the learner's message (null = let the teacher open the scene). */
  async function send(text) {
    const my = C;
    let userRow = null;
    if (text) {
      userRow = addUser(text);
      C.history.push({ role: 'user', content: text });
    }
    C.busy = true;
    typing(true);
    let res;
    try {
      res = demo() ? await demoReply() : await callServer();
    } catch {
      res = { ok: false, error: 'network' };
    }
    if (C !== my) return;
    C.busy = false;
    typing(false);
    if (!res.ok) {
      if (text) C.history.pop();   // let the learner try again
      toast(t({ daily_limit: 'chat.err.limit', refusal: 'chat.err.refusal' }[res.error] || 'chat.err.generic'), 3500);
      return;
    }
    C.history.push({ role: 'assistant', content: res.reply });
    showCorrection(userRow, res.correction);
    addTeacher(res);
    showSuggestions(res.suggestions);
    if (text) LQEngage.track('chat');
  }

  async function callServer() {
    const lic = LQCommerce.license();
    const tc = C.teacher || {};
    const r = await fetch(apiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: lic ? lic.token : '',
        target: C.lang,
        base: LQI18n.ui(),
        level: LQStore.getPace(C.lang).level,
        teacher: { name: tc.name, city: tc.city ? tc.city.en : '', age: tc.age },
        scenario: SCENARIOS[C.scenario] || SCENARIOS.free,
        messages: C.history
      })
    });
    return r.json();
  }

  /** Demo: walk through the scenario station's Boss dialogue (already translated) with its phrases as suggestions. */
  async function demoReply() {
    await new Promise(r => setTimeout(r, 700));
    const st = LQData.LANGS[C.lang].stations[C.scenario === 'free' ? 'smalltalk' : C.scenario];
    const lines = [st.boss.intro, ...st.boss.turns.map(x => x.reply)];
    const line = lines[C.demoStep % lines.length];
    const next = st.boss.turns[C.demoStep % st.boss.turns.length];
    C.demoStep++;
    return { ok: true, reply: line.text, translation: LQI18n.tr(line), correction: null, suggestions: [st.phrases[next.expect].text] };
  }

  window.LQTutor = { start, stop, SCENARIOS };
})();
