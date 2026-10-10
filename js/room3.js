/* Room 3 — HTTPS Shield: animated TLS handshake + quiz */
window.Room3 = {
  render(container, onComplete) {
    let animDone = false;
    let quizAnswers = {};
    let submitted = false;

    const tlsSteps = [
      { id: 'hello', label: 'ClientHello', from: 'client', msg: 'ClientHello + cipher suites' },
      { id: 'server', label: 'ServerHello', from: 'server', msg: 'ServerHello + Certificate' },
      { id: 'verify', label: 'אימות תעודה', from: 'client', msg: 'Verify certificate chain' },
      { id: 'keys', label: 'החלפת מפתחות', from: 'both', msg: 'Key exchange (ECDHE)' },
      { id: 'finished', label: 'Finished', from: 'both', msg: 'Finished · Encrypted!' }
    ];

    const quiz = [
      {
        id: 'q1',
        text: 'מה TLS/HTTPS מגן עליו?',
        options: [
          { id: 'a', label: 'הצפנת התעבורה בין הלקוח לשרת', correct: true },
          { id: 'b', label: 'מניעת באגים בלוגיקת האפליקציה', correct: false },
          { id: 'c', label: 'החלפת סיסמאות חלשות אוטומטית', correct: false }
        ],
        explain: 'TLS מצפין את הערוץ ומוודא זהות השרת — לא מתקן לוגיקת אפליקציה.'
      },
      {
        id: 'q2',
        text: 'מה HTTPS לא מחליף?',
        options: [
          { id: 'a', label: 'אימות משתמש (סיסמה/MFA) והרשאות', correct: true },
          { id: 'b', label: 'הצפנת תעבורה ברשת', correct: false },
          { id: 'c', label: 'אימות זהות השרת באמצעות תעודה', correct: false }
        ],
        explain: 'HTTPS מאבטח את הצינור — עדיין צריך אימות משתמש, הרשאות והגנת אפליקציה.'
      },
      {
        id: 'q3',
        text: 'מה תפקיד תעודת השרת (Certificate)?',
        options: [
          { id: 'a', label: 'לאפשר לדפדפן לוודא שהוא מדבר עם השרת הנכון', correct: true },
          { id: 'b', label: 'למחוק וירוסים מהשרת', correct: false },
          { id: 'c', label: 'להחליף חומת אש', correct: false }
        ],
        explain: 'התעודה קושרת מפתח ציבורי לזהות (דומיין) דרך רשות אישורים (CA).'
      },
      {
        id: 'q4',
        text: 'כמגינים — מה נכון לעשות לגבי TLS?',
        options: [
          { id: 'a', label: 'להשבית גרסאות ישנות (TLS 1.0/1.1) ולהשתמש בתעודות תקפות', correct: true },
          { id: 'b', label: 'לשתף מפתחות פרטיים בטיקטים', correct: false },
          { id: 'c', label: 'לבטל HTTPS בסביבת פיתוח תמיד', correct: false }
        ],
        explain: 'הקשחה: פרוטוקולים מעודכנים, תעודות תקפות, HSTS — בלי לחשוף מפתחות.'
      }
    ];

    container.innerHTML = `
      <div class="story-box">
        <div class="story-label">📖 סיפור המשימה</div>
        <p>צוות הפיתוח שואל: "יש לנו HTTPS — האם אנחנו מוגנים מכל דבר?" צפו בלחיצת יד TLS מונפשת, ואז ענו על חידון שמדגיש מה TLS מגן — ומה לא.</p>
      </div>

      <div class="sim-panel">
        <h2>🔒 המחשת לחיצת יד TLS</h2>
        <div class="tls-steps-list" id="tlsDots"></div>
        <div class="tls-viz" id="tlsViz">
          <div class="tls-actors">
            <div class="tls-actor" id="actorClient">
              <div class="tls-actor-icon" id="iconClient">👤</div>
              <div class="tls-actor-label">לקוח (דפדפן)</div>
            </div>
            <div class="tls-actor" id="actorServer">
              <div class="tls-actor-icon" id="iconServer">🖥️</div>
              <div class="tls-actor-label">שרת HTTPS</div>
            </div>
          </div>
          <div class="tls-messages" id="tlsMsgs"></div>
          <div class="tls-lock" id="tlsLock">🔐</div>
        </div>
        <div style="text-align:center;margin-top:1rem;">
          <button class="btn btn-primary" id="playTls">▶ הפעלת אנימציה</button>
          <button class="btn btn-secondary btn-sm" id="replayTls" style="display:none;">↻ נגן שוב</button>
        </div>
      </div>

      <div class="sim-panel" id="quizPanel" style="opacity:0.4;pointer-events:none;">
        <h2>📝 חידון: מה TLS מגן / לא מגן</h2>
        <div class="quiz-grid" id="quizGrid"></div>
        <div style="text-align:center;margin-top:1rem;">
          <button class="btn btn-primary" id="submitTls" disabled>הגישו ציון</button>
        </div>
      </div>

      <div class="recap-box" id="recap3"></div>
    `;

    const dots = container.querySelector('#tlsDots');
    tlsSteps.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'tls-step-dot';
      d.id = 'dot-' + s.id;
      d.textContent = `${i + 1}. ${s.label}`;
      dots.appendChild(d);
    });

    const quizGrid = container.querySelector('#quizGrid');
    quiz.forEach(q => {
      const item = document.createElement('div');
      item.className = 'quiz-item';
      item.innerHTML = `<div class="q-text">${q.text}</div><div class="quiz-options" id="opts-${q.id}"></div>
        <div class="quiz-explain" id="exp-${q.id}">${q.explain}</div>`;
      quizGrid.appendChild(item);
      const opts = item.querySelector('.quiz-options');
      q.options.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = o.label;
        btn.addEventListener('click', () => answerQuiz(q, o, btn));
        opts.appendChild(btn);
      });
    });

    function answerQuiz(q, o, btn) {
      if (submitted || quizAnswers[q.id]) return;
      quizAnswers[q.id] = o.id;
      const opts = container.querySelectorAll(`#opts-${q.id} .quiz-opt`);
      opts.forEach(b => b.classList.add('answered'));
      const correct = q.options.find(x => x.correct);
      if (o.correct) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('incorrect');
        opts.forEach(b => {
          if (b.textContent === correct.label) b.classList.add('correct');
        });
      }
      container.querySelector('#exp-' + q.id).classList.add('show');
      container.querySelector('#submitTls').disabled = Object.keys(quizAnswers).length < quiz.length;
    }

    async function runAnimation() {
      const playBtn = container.querySelector('#playTls');
      playBtn.disabled = true;
      playBtn.textContent = '⏳ בתהליך…';
      container.querySelector('#tlsLock').classList.remove('visible');
      container.querySelector('#iconClient').classList.remove('secure', 'active');
      container.querySelector('#iconServer').classList.remove('secure', 'active');
      container.querySelectorAll('.tls-step-dot').forEach(d => d.classList.remove('active', 'done'));
      container.querySelector('#tlsMsgs').innerHTML = '';

      const viz = container.querySelector('#tlsViz');
      const vizRect = viz.getBoundingClientRect();

      for (let i = 0; i < tlsSteps.length; i++) {
        const step = tlsSteps[i];
        const dot = container.querySelector('#dot-' + step.id);
        dot.classList.add('active');

        const clientIcon = container.querySelector('#iconClient');
        const serverIcon = container.querySelector('#iconServer');
        clientIcon.classList.toggle('active', step.from === 'client' || step.from === 'both');
        serverIcon.classList.toggle('active', step.from === 'server' || step.from === 'both');

        const msg = document.createElement('div');
        msg.className = 'tls-msg';
        msg.textContent = step.msg;
        // Position along the middle
        const progress = (i + 1) / (tlsSteps.length + 1);
        msg.style.top = (30 + progress * 40) + '%';
        msg.style.left = '50%';
        msg.style.transform = 'translateX(-50%)';
        container.querySelector('#tlsMsgs').appendChild(msg);
        requestAnimationFrame(() => msg.classList.add('visible'));

        await sleep(900);
        dot.classList.remove('active');
        dot.classList.add('done');
        clientIcon.classList.remove('active');
        serverIcon.classList.remove('active');
      }

      container.querySelector('#tlsLock').classList.add('visible');
      container.querySelector('#iconClient').classList.add('secure');
      container.querySelector('#iconServer').classList.add('secure');

      animDone = true;
      playBtn.style.display = 'none';
      container.querySelector('#replayTls').style.display = 'inline-flex';
      const qp = container.querySelector('#quizPanel');
      qp.style.opacity = '1';
      qp.style.pointerEvents = 'auto';
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    container.querySelector('#playTls').addEventListener('click', runAnimation);
    container.querySelector('#replayTls').addEventListener('click', () => {
      if (submitted) return;
      runAnimation();
    });

    container.querySelector('#submitTls').addEventListener('click', () => {
      if (submitted || Object.keys(quizAnswers).length < quiz.length) return;
      submitted = true;
      container.querySelector('#submitTls').disabled = true;

      let correct = 0;
      quiz.forEach(q => {
        const ans = quizAnswers[q.id];
        if (q.options.find(o => o.id === ans && o.correct)) correct++;
      });
      const quizScore = Math.round((correct / quiz.length) * 100);
      const animBonus = animDone ? 10 : 0;
      const score = Math.min(100, Math.round(quizScore * 0.9 + animBonus));

      const recap = container.querySelector('#recap3');
      recap.classList.add('visible');
      recap.innerHTML = `
        <div class="score-display">
          <div class="score-circle">${score}</div>
          <div style="color:var(--text-muted)">${correct}/${quiz.length} תשובות נכונות</div>
        </div>
        <h3>✨ מה למדת</h3>
        <ul>
          <li>TLS מצפין תעבורה ומוודא זהות שרת — זה בסיס לתקשורת מאובטחת.</li>
          <li>HTTPS לא מחליף אימות משתמש, הרשאות, או אבטחת קוד האפליקציה.</li>
          <li>מגינים מקשיחים: גרסאות TLS מעודכנות, תעודות תקפות, HSTS.</li>
        </ul>
        <div class="cta-row" id="cta3"></div>
      `;
      onComplete(score);
    });
  }
};
