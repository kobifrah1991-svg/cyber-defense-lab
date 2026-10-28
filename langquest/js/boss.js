/* TedraLingo — Audio Boss: a short spoken role-play at the end of each station.
 * The character speaks (TTS + karaoke), the learner answers by voice. Without a mic
 * the learner answers by choosing the right reply instead.
 */
(function () {
  const { esc, $, $$, karaoke, toast, burst, shuffle } = LQUI;
  const { t, f, tr } = LQI18n;
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
          <button class="btn ghost sm" data-act="exit">${t('common.exit')}</button>
          <div class="lesson-title">👑 Audio Boss · ${esc(f(B.meta, 'name'))}</div>
          <div class="pdots">${B.boss.turns.map(() => '<i></i>').join('')}</div>
        </div>
        <div class="card boss">
          <div class="boss-npc">${LQUI.npcAvatar(B.meta, 56)}<div><b>${esc(f(B.boss, 'title'))}</b><small>${esc(t('boss.ai', { lang: f(LQData.LANGS[lang], 'name') }))}</small></div></div>
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

  function npcSay(line) {
    const text = line.text;
    const my = B;
    const row = document.createElement('div');
    row.className = 'msg npc';
    row.innerHTML = `<span class="ava">${LQUI.npcAvatar(B.meta, 36)}</span><div class="bubble"><div class="bk"></div>${lineTl(line)}<div class="bhe">${esc(tr(line))}</div><button class="replay" title="${t('boss.replay')}">🔊</button></div>`;
    chat().appendChild(row);
    scrollChat();
    const k = karaoke($('.bk', row), { text, accent: B.accent, gender: B.meta.npcGender });
    $('.replay', row).onclick = () => k.play(1);
    return k.play(1).then(() => new Promise(r => setTimeout(r, 250))).then(() => { if (B !== my) throw new Error('left'); });
  }

  // how the line sounds, in the learner's own script (when "show pronunciation" is on)
  function lineTl(line) {
    const tl = LQI18n.showTranslit() && line.tl && line.tl[LQI18n.ui()];
    return tl ? `<div class="btl" dir="auto">${esc(tl)}</div>` : '';
  }
  function phraseTl(phrase) {
    return LQI18n.showTranslit() ? `<div class="btl translit">${LQUI.translitLine(phrase)}</div>` : '';
  }

  function userSay(phrase, matches) {
    const row = document.createElement('div');
    row.className = 'msg me';
    row.innerHTML = `<div class="bubble"><div class="bk"></div>${phraseTl(phrase)}</div><span class="ava">🙂</span>`;
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
      <div class="task">${t('boss.say')} <b>${esc(tr(phrase))}</b></div>
      <div class="hint-slot"></div>
      <div class="row center">
        <button class="btn ghost sm" data-act="hint">${t('boss.hint')}</button>
        ${LQAudio.canListen ? `<button class="btn mic" data-act="mic"><span class="mic-ico">🎙️</span> <span class="mic-lbl">${t('boss.answer')}</span></button>` : ''}
      </div>
      <div class="boss-fb" aria-live="polite"></div>`;
    $('[data-act=hint]', ctl).onclick = () => {
      B.hinted = true;
      $('.hint-slot', ctl).innerHTML = `<div class="hint" dir="${LQUI.tdir(B.lang)}">${esc(phrase.text)}</div>${phraseTl(phrase)}`;
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
      $('.mic-lbl', mic).textContent = t('vc.listening');
      fb.textContent = '';
      let res = null;
      try {
        const alts = await LQAudio.listen(B.accent);
        res = LQAudio.bestScore(phrase.words.map(w => w.clean), alts, B.accent);
      } catch (e) {
        fb.textContent = e.message === 'not-allowed' ? t('mic.notAllowed') : t('boss.notHeard');
      }
      if (!B) return;
      mic.classList.remove('live');
      $('.mic-lbl', mic).textContent = t('boss.answer');
      if (!res) return;
      B.tries++;
      const score = B.hinted ? Math.min(res.score, 80) : res.score;
      if (res.score >= B.pass) {
        return answered(phrase, score, res.matches);
      }
      if (B.tries >= MAX_TRIES) {
        toast(t('boss.moveOn'));
        LQStore.vaultAdd(LQStore.vaultId(B.lang, B.stationId, B.boss.turns[B.turn].expect));
        return answered(phrase, score, res.matches);
      }
      fb.innerHTML = t('boss.almost', { s: res.score, heard: `<span dir="${LQUI.tdir(B.lang)}">“${esc(res.transcript)}”</span>`, n: MAX_TRIES - B.tries });
    };
  }

  function renderChoices(ctl, phrase) {
    const turnPhrases = B.boss.turns.map(t => B.phrases[t.expect]);
    const opts = shuffle(turnPhrases);
    $('.boss-fb', ctl).insertAdjacentHTML('beforebegin', `
      <p class="note">${t('boss.noMic')}</p>
      <div class="opt-grid one">${opts.map(p => `<button class="opt" dir="${LQUI.tdir(B.lang)}" data-t="${esc(p.text)}">${esc(p.text)}</button>`).join('')}</div>`);
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
      setTimeout(() => LQEngage.track('boss'), 900);
    }
    LQApp.refreshHeader();
    const ctl = $('.boss-controls', B.root);
    ctl.innerHTML = `
      <div class="boss-end ${won ? 'won' : ''}">
        <div class="big-emoji">${won ? '🏆' : '💪'}</div>
        <h3>${won ? t('boss.won') : t('boss.lost')}</h3>
        <p>${t('boss.score')} <b>${total}%</b>${won && !prev.boss ? ' · +50 XP' : ''}</p>
        <div class="row center">
          <button class="btn ghost" data-act="again">${t('common.again')}</button>
          <button class="btn primary" data-act="map">${t('common.toMap')}</button>
        </div>
      </div>`;
    const { root, lang, stationId, onExit } = B;
    $('[data-act=again]', ctl).onclick = () => { stop(); start(root, lang, stationId, onExit); };
    $('[data-act=map]', ctl).onclick = () => { stop(); onExit(); };
  }

  window.LQBoss = { start, stop };
})();
