/* LangQuest — shared UI components */
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const t = (k, v) => LQI18n.t(k, v);

  function currentAccent() {
    const s = LQStore.getSettings();
    return s.accent[s.lang] || LQData.LANGS[s.lang].accents[0].code;
  }

  /* ---------- syllables & stress ---------- */
  function sylHtml(word) {
    return word.syl.map((s, k) => (k === word.stress && word.syl.length > 1
      ? `<b class="stress" title="${t('ui.stressed')}">${esc(s)}</b>`
      : `<span>${esc(s)}</span>`)).join('<i class="dot">·</i>');
  }

  function heHtml(word) {
    if (!word.he.length || !word.he[0]) return '';
    return word.he.map((s, k) => (k === word.stress && word.he.length > 1
      ? `<b class="stress">${esc(s)}</b>`
      : `<span>${esc(s)}</span>`)).join('<i class="dot">·</i>');
  }

  function translitLine(phrase) {
    return phrase.words.map(w => `<span class="tl-word">${heHtml(w)}</span>`).join(' ');
  }

  /* ---------- word popover ---------- */
  let pop = null;
  function closePop() {
    if (pop) { pop.remove(); pop = null; }
  }
  document.addEventListener('click', e => {
    if (pop && !pop.contains(e.target) && !e.target.closest('.kw')) closePop();
  });
  window.addEventListener('scroll', closePop, { passive: true });

  function showWordPop(anchor, word, accent) {
    closePop();
    LQAudio.speak(word.clean, { accent, rate: LQStore.getSettings().slowRate, weights: [word.syl.length] });
    if (!word.meaning) return;
    pop = document.createElement('div');
    pop.className = 'word-pop';
    pop.innerHTML = `
      <div class="wp-word" dir="ltr">${sylHtml(word)}</div>
      ${LQI18n.showTranslit() ? `<div class="wp-he">${heHtml(word)}</div>` : ''}
      <div class="wp-meaning">${esc(LQI18n.f(word, 'meaning'))}</div>
      <div class="wp-actions">
        <button class="chip" data-r="1">${t('common.normal')}</button>
        <button class="chip" data-r="slow">${t('common.slow')}</button>
      </div>`;
    document.body.appendChild(pop);
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const left = Math.min(window.innerWidth - pw - 8, Math.max(8, r.left + r.width / 2 - pw / 2));
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    $$('button', pop).forEach(b => b.addEventListener('click', ev => {
      ev.stopPropagation();
      const rate = b.dataset.r === 'slow' ? LQStore.getSettings().slowRate : 1;
      LQAudio.speak(word.clean, { accent, rate, weights: [word.syl.length] });
    }));
  }

  /* ---------- karaoke text ---------- */
  /**
   * karaoke(container, { text, words?, accent, big? })
   * `words` (parsed phrase words) enable meaning popovers and syllable-weighted timing.
   */
  function karaoke(container, opts) {
    const tokens = opts.text.split(/\s+/).filter(Boolean);
    const words = opts.words || tokens.map(t => ({ token: t, clean: t.replace(/[¿¡?!.,]/g, ''), syl: [t], he: [], stress: 0 }));
    container.innerHTML = `<div class="karaoke${opts.big ? ' big' : ''}" dir="ltr">${
      tokens.map((t, i) => `<span class="kw" data-i="${i}" tabindex="0" role="button">${esc(t)}</span>`).join(' ')
    }</div>`;
    const spans = $$('.kw', container);

    const highlight = i => spans.forEach((s, k) => {
      s.classList.toggle('on', k === i);
      s.classList.toggle('past', i >= 0 && k < i);
    });

    spans.forEach((s, i) => {
      const act = e => { e.stopPropagation(); highlight(i); showWordPop(s, words[i], opts.accent); };
      s.addEventListener('click', act);
      s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(e); } });
    });

    return {
      spans,
      highlight,
      play(rate = 1) {
        closePop();
        return LQAudio.speak(opts.text, {
          accent: opts.accent,
          rate,
          weights: words.map(w => w.syl.length),
          onWord: highlight
        });
      },
      /** Play word by word with a pause — used in Slow Practice */
      async playWords(rate, onEach) {
        for (let i = 0; i < words.length; i++) {
          if (container.isConnected === false) return;
          highlight(i);
          if (onEach) onEach(i);
          await LQAudio.speak(words[i].clean, { accent: opts.accent, rate, weights: [words[i].syl.length] });
          highlight(i);
          await new Promise(r => setTimeout(r, 350));
        }
        highlight(-1);
        if (onEach) onEach(-1);
      },
      mark(matches) {
        spans.forEach((s, k) => {
          s.classList.remove('on', 'past', 'ok', 'bad');
          if (matches) s.classList.add(matches[k] ? 'ok' : 'bad');
        });
      }
    };
  }

  /* ---------- phonetic breakdown ---------- */
  function breakdown(phrase, { onlyHard = false } = {}) {
    const showHe = LQI18n.showTranslit();
    const list = phrase.words.map((w, i) => ({ w, i })).filter(({ w }) => !onlyHard || w.syl.length > 1);
    if (!list.length) return '';
    return `<div class="breakdown">${list.map(({ w, i }) => `
      <button class="bd-card" data-wi="${i}">
        <span class="bd-syl" dir="ltr">${sylHtml(w)}</span>
        ${showHe ? `<span class="bd-he">${heHtml(w)}</span>` : ''}
        <span class="bd-mean">${esc(LQI18n.f(w, 'meaning'))}</span>
      </button>`).join('')}</div>`;
  }

  function bindBreakdown(root, phrase, accent) {
    $$('.bd-card', root).forEach(b => b.addEventListener('click', () => {
      const w = phrase.words[+b.dataset.wi];
      $$('.bd-card', root).forEach(x => x.classList.toggle('on', x === b));
      LQAudio.speak(w.clean, { accent, rate: LQStore.getSettings().slowRate, weights: [w.syl.length] })
        .then(() => b.classList.remove('on'));
    }));
  }

  /* ---------- voice check widget ---------- */
  const MIC_ERRORS = {
    'not-allowed': 'mic.notAllowed',
    'service-not-allowed': 'mic.notAllowed',
    'no-speech': 'mic.noSpeech',
    'audio-capture': 'mic.noCapture',
    'network': 'mic.network',
    'aborted': 'mic.aborted'
  };

  function micError(code) { return t(MIC_ERRORS[code] || 'mic.generic'); }

  function scoreLabel(score) {
    if (score >= 90) return [t('score.great'), 'great'];
    if (score >= 70) return [t('score.good'), 'good'];
    if (score >= 40) return [t('score.mid'), 'mid'];
    return [t('score.low'), 'low'];
  }

  /**
   * voiceCheck(container, { phrase, accent, onResult(score, selfAssessed) })
   * Renders the model sentence, a mic button and the scored result.
   */
  function voiceCheck(container, { phrase, accent, onResult }) {
    container.innerHTML = `
      <div class="vc">
        <div class="vc-text"></div>
        <div class="vc-controls">
          <button class="btn ghost" data-act="model">${t('common.play')}</button>
          <button class="btn ghost" data-act="slow">🐢</button>
          ${LQAudio.canListen
            ? `<button class="btn mic" data-act="mic"><span class="mic-ico">🎙️</span> <span class="mic-lbl">${t('vc.speak')}</span></button>`
            : ''}
        </div>
        <div class="vc-result" aria-live="polite"></div>
      </div>`;
    const kara = karaoke($('.vc-text', container), { text: phrase.text, words: phrase.words, accent, big: true });
    const result = $('.vc-result', container);
    const slowRate = LQStore.getSettings().slowRate;

    $('[data-act=model]', container).onclick = () => { kara.mark(null); kara.play(1); };
    $('[data-act=slow]', container).onclick = () => { kara.mark(null); kara.play(slowRate); };

    if (!LQAudio.canListen) {
      result.innerHTML = `
        <p class="note">${t('vc.noRec')}</p>
        <div class="row"><button class="btn" data-self="1">${t('vc.selfOk')}</button><button class="btn ghost" data-self="0">${t('vc.selfBad')}</button></div>`;
      $$('[data-self]', result).forEach(b => b.onclick = () => onResult(b.dataset.self === '1' ? 100 : 0, true));
      return kara;
    }

    const mic = $('[data-act=mic]', container);
    mic.onclick = async () => {
      if (mic.classList.contains('live')) { LQAudio.cancelListen(); return; }
      kara.mark(null);
      mic.classList.add('live');
      $('.mic-lbl', mic).textContent = t('vc.listening');
      result.innerHTML = `<p class="note pulse">${t('vc.sayNow')}</p>`;
      try {
        const alts = await LQAudio.listen(accent);
        const best = LQAudio.bestScore(phrase.words.map(w => w.clean), alts, accent);
        kara.mark(best.matches);
        const [label, tone] = scoreLabel(best.score);
        result.innerHTML = `
          <div class="score-row">
            <div class="ring ${tone}" style="--p:${best.score}"><span>${best.score}%</span></div>
            <div>
              <div class="score-label">${label}</div>
              <div class="heard">${t('vc.heard')} <span dir="ltr">“${esc(best.transcript)}”</span></div>
              ${best.matches.includes(false) ? `<div class="note">${t('vc.tapRed')}</div>` : ''}
            </div>
          </div>`;
        onResult(best.score, false);
      } catch (e) {
        result.innerHTML = `<p class="note warn">${esc(micError(e.message))}</p>`;
      } finally {
        mic.classList.remove('live');
        $('.mic-lbl', mic).textContent = t('vc.retry');
      }
    };
    return kara;
  }

  /* ---------- toast & celebration ---------- */
  function toast(msg, ms = 2600) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
  }

  function burst(emojis = ['⭐', '🎉', '✨', '🔥']) {
    const layer = document.createElement('div');
    layer.className = 'burst';
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.textContent = emojis[i % emojis.length];
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.animationDelay = (Math.random() * 0.4) + 's';
      s.style.fontSize = (18 + Math.random() * 18) + 'px';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2200);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  window.LQUI = {
    esc, $, $$, currentAccent,
    sylHtml, heHtml, translitLine,
    karaoke, breakdown, bindBreakdown, voiceCheck,
    showWordPop, closePop, toast, burst, shuffle, micError
  };
})();
