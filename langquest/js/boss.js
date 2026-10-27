/* LangQuest — Audio Boss: a short spoken role-play at the end of each station.
 * The character speaks (TTS + karaoke), the learner answers by voice. Without a mic
 * the learner answers by choosing the right reply instead.
 */
(function () {
  const { esc, $, $$, karaoke, toast, burst, shuffle } = LQUI;
  const MAX_TRIES = 3;

  let B = null;

  function start(root, lang, stationId, onExit) {
    const st = LQData.LANGS[lang].stations[stationId];
    B = {
      root, lang, stationId, onExit,
      meta: LQData.STATIONS.find(s => s.id === stationId),
      accent: LQUI.currentAccent(),
      pass: LQStore.getPace(lang).pass,
      phrases: st.phrases,
      boss: st.boss,
      turn: 0, tries: 0, hinted: false,
      scores: []
    };
    root.innerHTML = `
      <section class="boss-wrap">
        <div class="lesson-top">
          <button class="btn ghost sm" data-act="exit">✕ יציאה</button>
          <div class="lesson-title">👑 Audio Boss · ${esc(B.meta.name)}</div>
          <div class="pdots">${B.boss.turns.map(() => '<i></i>').join('')}</div>
        </div>
        <div class="card boss">
          <div class="boss-npc"><span class="npc-ava">${B.meta.npc}</span><div><b>${esc(B.boss.title)}</b><small>דמות AI · ${esc(LQData.LANGS[lang].name)}</small></div></div>
          <div class="chat" aria-live="polite"></div>
          <div class="boss-controls"></div>
        </div>
      </section>`;
    $('[data-act=exit]', root).onclick = () => { const cb = B.onExit; stop(); cb(); };
    npcSay(B.boss.intro).then(userTurn).catch(() => {});
  }

  function stop() {
    LQAudio.stop();
    LQAudio.cancelListen();
    B = null;
  }

  function chat() { return $('.chat', B.root); }

  function scrollChat() {
    const c = chat();
    c.scrollTop = c.scrollHeight;
  }

  function npcSay([text, he]) {
    const my = B;
    const row = document.createElement('div');
    row.className = 'msg npc';
    row.innerHTML = `<span class="ava">${B.meta.npc}</span><div class="bubble"><div class="bk"></div><div class="bhe">${esc(he)}</div><button class="replay" title="השמע שוב">🔊</button></div>`;
    chat().appendChild(row);
    scrollChat();
    const k = karaoke($('.bk', row), { text, accent: B.accent });
    $('.replay', row).onclick = () => k.play(1);
    return k.play(1).then(() => new Promise(r => setTimeout(r, 250))).then(() => { if (B !== my) throw new Error('left'); });
  }

  function userSay(phrase, matches) {
    const row = document.createElement('div');
    row.className = 'msg me';
    row.innerHTML = '<div class="bubble"><div class="bk"></div></div><span class="ava">🙂</span>';
    chat().appendChild(row);
    const k = karaoke($('.bk', row), { text: phrase.text, words: phrase.words, accent: B.accent });
    if (matches) k.mark(matches);
    scrollChat();
  }

  function setDots() {
    $$('.pdots i', B.root).forEach((d, i) => {
      d.className = i < B.turn ? 'done' : i === B.turn ? 'cur' : '';
    });
  }

  function userTurn() {
    if (!B) return;
    setDots();
    B.tries = 0;
    B.hinted = false;
    const phrase = B.phrases[B.boss.turns[B.turn].expect];
    const ctl = $('.boss-controls', B.root);
    ctl.innerHTML = `
      <div class="task">🎯 תגידו: <b>${esc(phrase.he)}</b></div>
      <div class="hint-slot"></div>
      <div class="row center">
        <button class="btn ghost sm" data-act="hint">💡 רמז</button>
        ${LQAudio.canListen ? '<button class="btn mic" data-act="mic"><span class="mic-ico">🎙️</span> <span class="mic-lbl">ענו בקול</span></button>' : ''}
      </div>
      <div class="boss-fb" aria-live="polite"></div>`;
    $('[data-act=hint]', ctl).onclick = () => {
      B.hinted = true;
      $('.hint-slot', ctl).innerHTML = `<div class="hint" dir="ltr">${esc(phrase.text)}</div>`;
      LQAudio.speak(phrase.text, { accent: B.accent, rate: LQStore.getSettings().slowRate, weights: phrase.words.map(w => w.syl.length) });
    };
    if (LQAudio.canListen) bindMic(ctl, phrase);
    else renderChoices(ctl, phrase);
  }

  function bindMic(ctl, phrase) {
    const mic = $('[data-act=mic]', ctl);
    const fb = $('.boss-fb', ctl);
    mic.onclick = async () => {
      if (mic.classList.contains('live')) { LQAudio.cancelListen(); return; }
      mic.classList.add('live');
      $('.mic-lbl', mic).textContent = 'מקשיבים…';
      fb.textContent = '';
      let res = null;
      try {
        const alts = await LQAudio.listen(B.accent);
        res = LQAudio.bestScore(phrase.words.map(w => w.clean), alts, B.accent);
      } catch (e) {
        fb.textContent = e.message === 'not-allowed' ? 'צריך לאשר גישה למיקרופון 🎙️' : 'לא שמענו — נסו שוב';
      }
      if (!B) return;
      mic.classList.remove('live');
      $('.mic-lbl', mic).textContent = 'ענו בקול';
      if (!res) return;
      B.tries++;
      const score = B.hinted ? Math.min(res.score, 80) : res.score;
      if (res.score >= B.pass) {
        return answered(phrase, score, res.matches);
      }
      if (B.tries >= MAX_TRIES) {
        toast('נמשיך הלאה — הביטוי נשמר לאוסף לחזרה 📒');
        LQStore.vaultAdd(LQStore.vaultId(B.lang, B.stationId, B.boss.turns[B.turn].expect));
        return answered(phrase, score, res.matches);
      }
      fb.innerHTML = `${res.score}% — כמעט! שמענו <span dir="ltr">“${esc(res.transcript)}”</span>. נסו שוב (${MAX_TRIES - B.tries} ניסיונות)`;
    };
  }

  function renderChoices(ctl, phrase) {
    const turnPhrases = B.boss.turns.map(t => B.phrases[t.expect]);
    const opts = shuffle(turnPhrases);
    $('.boss-fb', ctl).insertAdjacentHTML('beforebegin', `
      <p class="note">אין זיהוי דיבור בדפדפן הזה — אמרו בקול ואז בחרו את התשובה:</p>
      <div class="opt-grid one">${opts.map(p => `<button class="opt" dir="ltr" data-t="${esc(p.text)}">${esc(p.text)}</button>`).join('')}</div>`);
    $$('.opt', ctl).forEach(b => b.onclick = () => {
      B.tries++;
      if (b.dataset.t === phrase.text) return answered(phrase, B.tries === 1 && !B.hinted ? 100 : 50, null);
      b.classList.add('bad');
      LQStore.vaultAdd(LQStore.vaultId(B.lang, B.stationId, B.boss.turns[B.turn].expect));
    });
  }

  function answered(phrase, score, matches) {
    B.scores.push(score);
    $('.boss-controls', B.root).innerHTML = '';
    userSay(phrase, matches);
    const reply = B.boss.turns[B.turn].reply;
    B.turn++;
    npcSay(reply).then(() => {
      if (B.turn < B.boss.turns.length) userTurn();
      else finish();
    }).catch(() => {});
  }

  function finish() {
    setDots();
    const total = Math.round(B.scores.reduce((a, b) => a + b, 0) / B.scores.length);
    const won = total >= B.pass;
    const prev = LQStore.stationProgress(B.lang, B.stationId);
    if (won) {
      LQStore.updateStation(B.lang, B.stationId, { boss: true, bestBoss: total });
      if (!prev.boss) LQStore.addXp(50);
      burst(['👑', '🏆', '⭐', '🎉']);
    }
    LQApp.refreshHeader();
    const ctl = $('.boss-controls', B.root);
    ctl.innerHTML = `
      <div class="boss-end ${won ? 'won' : ''}">
        <div class="big-emoji">${won ? '🏆' : '💪'}</div>
        <h3>${won ? 'ניצחתם את הבוס!' : 'כמעט! עוד ניסיון אחד'}</h3>
        <p>ציון שיחה: <b>${total}%</b>${won && !prev.boss ? ' · +50 XP' : ''}</p>
        <div class="row center">
          <button class="btn ghost" data-act="again">🔁 שוב</button>
          <button class="btn primary" data-act="map">🗺️ למפה</button>
        </div>
      </div>`;
    const { root, lang, stationId, onExit } = B;
    $('[data-act=again]', ctl).onclick = () => { stop(); start(root, lang, stationId, onExit); };
    $('[data-act=map]', ctl).onclick = () => { stop(); onExit(); };
  }

  window.LQBoss = { start, stop };
})();
