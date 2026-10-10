/* Room 4 — Alert Triage SOC: classify SIEM-style alerts */
window.Room4 = {
  render(container, onComplete) {
    let classified = {};
    let submitted = false;

    // Defense framing only — classification training, no exploit steps
    const alerts = [
      {
        id: 'ALT-1001',
        sev: 'critical',
        sevHe: 'קריטי',
        time: '02:14',
        title: 'התחברות מוצלחת ממדינה חריגה + כשל MFA',
        detail: 'user=cfo · src_geo=unusual · mfa=failed×3 then success via recovery code · dest=webmail',
        correct: 'escalate',
        explain: 'חשבון בכיר + גיאוגרפיה חריגה + שימוש בקוד שחזור — יש להסליג לצוות IR ולבודד.'
      },
      {
        id: 'ALT-1002',
        sev: 'medium',
        sevHe: 'בינוני',
        time: '09:02',
        title: 'סריקת פורטים פנימית מתחנת עבודה',
        detail: 'host=WS-IT-04 · dest_ports=many · process=nmap-like scanner · user=it.admin',
        correct: 'tp',
        explain: 'סריקה פנימית היא חיובי אמיתי לבדיקה — גם אם זה IT, צריך לאשר מול שינוי מתוכנן.'
      },
      {
        id: 'ALT-1003',
        sev: 'low',
        sevHe: 'נמוך',
        time: '10:30',
        title: 'כשל התחברות בודד ל-VPN',
        detail: 'user=yael.m · failures=1 · src=known home IP · followed by success+MFA',
        correct: 'fp',
        explain: 'כשל בודד ממקור מוכר ואחריו הצלחה עם MFA — דפוס נפוץ של טעות הקלדה. חיובי שגוי סביר.'
      },
      {
        id: 'ALT-1004',
        sev: 'high',
        sevHe: 'גבוה',
        time: '11:45',
        title: 'שינוי הרשאות Admin על תיקיית שיתוף רגישה',
        detail: 'actor=svc-backup · action=ACL modify · target=\\\\fs\\Finance\\Q4 · unexpected time',
        correct: 'escalate',
        explain: 'שינוי ACL על נתונים פיננסיים ע״י חשבון שירות בשעה חריגה — הסלמה וסגירת הרשאה מיידית.'
      },
      {
        id: 'ALT-1005',
        sev: 'medium',
        sevHe: 'בינוני',
        time: '14:10',
        title: 'התראת אנטי-וירוס: קובץ בבידוד אוטומטי',
        detail: 'host=WS-Sales-12 · threat=generic.pu · action=quarantined · user reported phishing drill',
        correct: 'fp',
        explain: 'תרגיל פישינג מתוכנן + בידוד אוטומטי הצליח — סמנו כחיובי שגוי בהקשר תרגיל (תעדו).'
      },
      {
        id: 'ALT-1006',
        sev: 'high',
        sevHe: 'גבוה',
        time: '16:22',
        title: 'יצוא המוני של רשומות מ-CRM',
        detail: 'user=contractor.ext · rows=50k · api=crm.export · off-hours · first time for this user',
        correct: 'tp',
        explain: 'ייצוא המוני ראשון ע״י קבלן מחוץ לשעות — חיובי אמיתי; עצרו גישה ובדקו היקף.'
      }
    ];

    container.innerHTML = `
      <div class="story-box">
        <div class="story-label">📖 סיפור המשימה</div>
        <p>אתם במשמרת SOC. הזנה מדומה של התראות SIEM ממתינה לסיווג. לכל התראה בחרו: <strong>חיובי אמיתי</strong>, <strong>חיובי שגוי</strong>, או <strong>הסלמה</strong> — וקראו את המשוב.</p>
      </div>

      <div class="sim-panel" style="padding:0;overflow:hidden;">
        <div class="siem-header">
          <div class="siem-title">SOC · Alert Queue · LIVE</div>
          <div style="font-size:0.75rem;color:var(--text-dim);" id="classCount">0 / ${alerts.length} סווגו</div>
        </div>
        <div class="alert-feed" id="alertFeed"></div>
      </div>

      <div style="text-align:center;margin:1.5rem 0;">
        <button class="btn btn-primary" id="submitSoc" disabled>סיכום משמרת — הגישו ציון</button>
      </div>

      <div class="recap-box" id="recap4"></div>
    `;

    const feed = container.querySelector('#alertFeed');
    alerts.forEach(a => {
      const card = document.createElement('div');
      card.className = 'alert-card';
      card.id = 'card-' + a.id;
      card.innerHTML = `
        <div class="alert-top">
          <span class="sev-badge ${a.sev}">${a.sevHe}</span>
          <span class="alert-id">${a.id}</span>
          <span class="alert-time">${a.time}</span>
        </div>
        <div class="alert-title">${a.title}</div>
        <div class="alert-detail">${a.detail}</div>
        <div class="alert-actions" id="acts-${a.id}">
          <button class="btn btn-ghost btn-sm tp" data-choice="tp">חיובי אמיתי</button>
          <button class="btn btn-ghost btn-sm fp" data-choice="fp">חיובי שגוי</button>
          <button class="btn btn-ghost btn-sm esc" data-choice="escalate">הסלמה</button>
        </div>
        <div class="alert-feedback" id="fb-${a.id}"></div>
      `;
      feed.appendChild(card);

      card.querySelectorAll('button[data-choice]').forEach(btn => {
        btn.addEventListener('click', () => classify(a, btn.dataset.choice, card));
      });
    });

    function classify(alert, choice, card) {
      if (submitted || classified[alert.id]) return;
      classified[alert.id] = choice;
      const ok = choice === alert.correct;
      const acts = card.querySelectorAll('button[data-choice]');
      acts.forEach(b => {
        b.disabled = true;
        if (b.dataset.choice === choice) {
          b.classList.add(ok ? 'chosen-correct' : 'chosen-wrong');
        }
        if (b.dataset.choice === alert.correct && !ok) {
          b.classList.add('chosen-correct');
        }
      });
      const fb = card.querySelector('.alert-feedback');
      fb.classList.add('show', ok ? 'ok' : 'bad');
      fb.textContent = (ok ? '✓ נכון. ' : '✗ לא מדויק. ') + alert.explain;
      card.classList.add('classified');

      container.querySelector('#classCount').textContent =
        `${Object.keys(classified).length} / ${alerts.length} סווגו`;
      container.querySelector('#submitSoc').disabled =
        Object.keys(classified).length < alerts.length;
    }

    container.querySelector('#submitSoc').addEventListener('click', () => {
      if (submitted || Object.keys(classified).length < alerts.length) return;
      submitted = true;
      container.querySelector('#submitSoc').disabled = true;

      let correct = 0;
      alerts.forEach(a => { if (classified[a.id] === a.correct) correct++; });
      const score = Math.round((correct / alerts.length) * 100);

      const recap = container.querySelector('#recap4');
      recap.classList.add('visible');
      recap.innerHTML = `
        <div class="score-display">
          <div class="score-circle">${score}</div>
          <div style="color:var(--text-muted)">${correct}/${alerts.length} סיווגים מדויקים</div>
        </div>
        <h3>✨ מה למדת</h3>
        <ul>
          <li>הקשר וקו בסיס קובעים אם התראה היא אמיתית, שגויה, או דורשת הסלמה.</li>
          <li>חשבונות בכירים, ייצוא המוני ושינויי ACL רגישים — בדרך כלל הסלמה מהירה.</li>
          <li>תרגילים וכשלים בודדים מוכרים חוסכים זמן כשמסומנים נכון כחיובי שגוי.</li>
        </ul>
        <div class="cta-row" id="cta4"></div>
      `;
      onComplete(score);
    });
  }
};
