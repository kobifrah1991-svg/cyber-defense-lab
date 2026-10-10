/* Room 1 — Password Fortress (defense policy + conceptual guess-time) */
window.Room1 = {
  render(container, onComplete) {
    let policyScore = 0;
    let checklistScore = 0;
    let submitted = false;

    const policies = [
      { id: 'min12', title: 'אורך מינימום 12', desc: 'דרישת אורך בסיסית וחזקה', good: true },
      { id: 'complexity', title: 'מורכבות תווים', desc: 'אותיות, ספרות וסימנים', good: true },
      { id: 'mfa', title: 'MFA חובה', desc: 'אימות דו-שלבי לכל משתמש', good: true },
      { id: 'breach', title: 'בדיקת דליפות', desc: 'חסימת סיסמאות ידועות מדליפות', good: true },
      { id: 'rotate30', title: 'החלפה כל 30 יום', desc: 'מדיניות ישנה — גורמת לסיסמאות חלשות', good: false },
      { id: 'hint', title: 'רמז סיסמה ציבורי', desc: 'חושף מידע לעוקבים', good: false }
    ];

    const checks = [
      { id: 'len', label: 'לפחות 12 תווים', test: p => p.length >= 12 },
      { id: 'upper', label: 'אות גדולה (A–Z)', test: p => /[A-Z]/.test(p) },
      { id: 'lower', label: 'אות קטנה (a–z)', test: p => /[a-z]/.test(p) },
      { id: 'digit', label: 'ספרה', test: p => /\d/.test(p) },
      { id: 'special', label: 'תו מיוחד (!@#...)', test: p => /[^A-Za-z0-9]/.test(p) },
      { id: 'noCommon', label: 'לא סיסמה נפוצה', test: p => !/^(password|123456|qwerty|admin|letmein|welcome)/i.test(p) && p.length > 0 }
    ];

    const selected = new Set();

    container.innerHTML = `
      <div class="story-box">
        <div class="story-label">📖 סיפור המשימה</div>
        <p>אתם אנליסטים בהגנת זהויות. ההנהלה מבקשת מדיניות סיסמאות חדשה. בדקו חוזק סיסמה לדוגמה, בחרו בקרות מדיניות נכונות, והבינו כיצד מדיניות טובה מאריכה את זמן הניחוש <strong>התיאורטי</strong> — בלי כלי פריצה.</p>
      </div>

      <div class="sim-panel">
        <h2>🔐 מד חוזק אינטראקטיבי</h2>
        <div class="sim-section">
          <label for="pwDemo" class="section-label">הקלידו סיסמה לדוגמה (לא נשמרת בשרת — הכל מקומי):</label>
          <input type="text" id="pwDemo" class="pw-input" placeholder="Type a sample password..." autocomplete="off" spellcheck="false">
          <div class="pw-meter-wrap">
            <div class="strength-bar"><div class="strength-fill" id="strFill"></div></div>
            <div class="strength-label">
              <span id="strLabel" style="color:var(--text-muted)">התחילו להקליד…</span>
              <span id="strPct" style="color:var(--text-dim)">0%</span>
            </div>
          </div>
          <ul class="checklist" id="pwCheck"></ul>
        </div>

        <div class="sim-section">
          <h3 class="panel-subtitle">⚙️ בחירת מדיניות ארגונית</h3>
          <p class="panel-hint">לחצו על הבקרות שתרצו לאמץ. חלקן מחזקות — וחלקן מחלישות.</p>
          <div class="policy-grid" id="policyGrid"></div>
        </div>

        <div class="guess-time-box">
          <div class="section-label" style="margin-bottom:0.55rem;">⏱️ זמן ניחוש תיאורטי (המחשה קונספטואלית)</div>
          <div class="time-val" id="guessTime">—</div>
          <div class="time-lbl" id="guessNote">הגדירו סיסמה ומדיניות כדי לראות הערכה</div>
          <div class="guess-visual"><div class="guess-visual-fill" id="guessFill" style="width:5%"></div></div>
        </div>

        <div class="submit-row">
          <button class="btn btn-primary" id="submitPw" disabled>סיימו והגישו ציון</button>
        </div>
      </div>

      <div class="recap-box" id="recap1"></div>
    `;

    const checkUl = container.querySelector('#pwCheck');
    checks.forEach(c => {
      const li = document.createElement('li');
      li.id = 'chk-' + c.id;
      li.innerHTML = `<span class="check-icon"></span><span>${c.label}</span>`;
      checkUl.appendChild(li);
    });

    const grid = container.querySelector('#policyGrid');
    policies.forEach(p => {
      const el = document.createElement('div');
      el.className = 'policy-item';
      el.dataset.id = p.id;
      el.innerHTML = `<div class="pol-title">${p.title}</div><div class="pol-desc">${p.desc}</div>`;
      el.addEventListener('click', () => {
        if (submitted) return;
        if (selected.has(p.id)) { selected.delete(p.id); el.classList.remove('active'); }
        else { selected.add(p.id); el.classList.add('active'); }
        updateGuess();
        updateSubmit();
      });
      grid.appendChild(el);
    });

    const input = container.querySelector('#pwDemo');
    input.addEventListener('input', () => {
      if (submitted) return;
      updateStrength();
      updateGuess();
      updateSubmit();
    });

    function updateStrength() {
      const pw = input.value;
      let done = 0;
      checks.forEach(c => {
        const li = container.querySelector('#chk-' + c.id);
        const ok = c.test(pw);
        li.classList.toggle('done', ok);
        li.querySelector('.check-icon').textContent = ok ? '✓' : '';
        if (ok) done++;
      });
      checklistScore = Math.round((done / checks.length) * 100);
      const pct = checklistScore;
      const fill = container.querySelector('#strFill');
      fill.style.width = pct + '%';
      let color = 'var(--neon-red)', label = 'חלשה מאוד';
      if (pct >= 85) { color = 'var(--neon)'; label = 'חזקה מאוד'; }
      else if (pct >= 70) { color = 'var(--neon-blue)'; label = 'חזקה'; }
      else if (pct >= 50) { color = 'var(--neon-yellow)'; label = 'בינונית'; }
      else if (pct >= 30) { color = 'var(--neon-orange)'; label = 'חלשה'; }
      fill.style.background = color;
      container.querySelector('#strLabel').textContent = label;
      container.querySelector('#strLabel').style.color = color;
      container.querySelector('#strPct').textContent = pct + '%';
    }

    function updateGuess() {
      const pw = input.value;
      const goodPol = policies.filter(p => p.good && selected.has(p.id)).length;
      const badPol = policies.filter(p => !p.good && selected.has(p.id)).length;
      policyScore = Math.max(0, Math.round(((goodPol / 4) * 100) - (badPol * 20)));

      // Conceptual estimate — entropy-inspired, NOT a real cracker
      let score = pw.length * 4;
      if (/[A-Z]/.test(pw)) score += 10;
      if (/[a-z]/.test(pw)) score += 10;
      if (/\d/.test(pw)) score += 8;
      if (/[^A-Za-z0-9]/.test(pw)) score += 15;
      score += goodPol * 12;
      score -= badPol * 15;
      score = Math.max(0, score);

      let timeStr, note, fillPct;
      if (pw.length === 0 && selected.size === 0) {
        timeStr = '—'; note = 'הגדירו סיסמה ומדיניות כדי לראות הערכה'; fillPct = 5;
      } else if (score < 30) {
        timeStr = 'שניות–דקות'; note = 'חלש מדי — מדיניות ומורכבות נדרשות'; fillPct = 15;
      } else if (score < 50) {
        timeStr = 'שעות–ימים'; note = 'בינוני — הוסיפו אורך ו-MFA'; fillPct = 35;
      } else if (score < 70) {
        timeStr = 'חודשים–שנים'; note = 'טוב — MFA מעלה משמעותית את הרף'; fillPct = 60;
      } else if (score < 90) {
        timeStr = 'עשרות שנים+'; note = 'חזק — שילוב אורך + MFA + בדיקת דליפות'; fillPct = 85;
      } else {
        timeStr = 'מאות שנים+'; note = 'מצוין להמחשה — זכרו: MFA עדיין חובה בעולם האמיתי'; fillPct = 100;
      }

      container.querySelector('#guessTime').textContent = timeStr;
      container.querySelector('#guessNote').textContent = note;
      container.querySelector('#guessFill').style.width = fillPct + '%';
    }

    function updateSubmit() {
      const btn = container.querySelector('#submitPw');
      btn.disabled = submitted || (input.value.length < 4 && selected.size < 2);
    }

    container.querySelector('#submitPw').addEventListener('click', () => {
      if (submitted) return;
      submitted = true;
      updateStrength();
      updateGuess();

      // Score: 50% checklist + 50% policy choices
      const goodPol = policies.filter(p => p.good && selected.has(p.id)).length;
      const badPol = policies.filter(p => !p.good && selected.has(p.id)).length;
      const polPts = Math.max(0, (goodPol / 4) * 100 - badPol * 25);
      const score = Math.round(checklistScore * 0.5 + Math.max(0, polPts) * 0.5);

      container.querySelector('#submitPw').disabled = true;
      input.disabled = true;

      const recap = container.querySelector('#recap1');
      recap.classList.add('visible');
      recap.innerHTML = `
        <div class="score-display">
          <div class="score-circle">${score}</div>
          <div style="color:var(--text-muted)">מתוך 100</div>
        </div>
        <h3>✨ מה למדת</h3>
        <ul>
          <li>סיסמה ארוכה ומגוונת קשה בהרבה לניחוש מאשר סיסמה קצרה.</li>
          <li>מדיניות נכונה: אורך מינימלי, MFA, ואיסור סיסמאות מדליפות — לא החלפה תכופה בכוח.</li>
          <li>מגינים מודדים חוזק ומדיניות; אין צורך בכלי תקיפה כדי ללמוד הגנה.</li>
        </ul>
        <div class="cta-row" id="cta1"></div>
      `;
      onComplete(score);
    });

    updateStrength();
  }
};
