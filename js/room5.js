/* Room 5 — Threat Modeling board (drag assets / threats / controls) — defense only */
window.Room5 = {
  render(container, onComplete) {
    let submitted = false;

    const items = [
      { id: 'cust-db', label: 'מסד נתוני לקוחות', type: 'asset' },
      { id: 'web-app', label: 'אפליקציית Web', type: 'asset' },
      { id: 'employee-laptops', label: 'מחשבי עובדים', type: 'asset' },
      { id: 'backup', label: 'גיבויים', type: 'asset' },
      { id: 'phish', label: 'פישינג למשתמשים', type: 'threat' },
      { id: 'ransomware', label: 'כופרה על קבצים', type: 'threat' },
      { id: 'data-leak', label: 'דליפת נתונים', type: 'threat' },
      { id: 'acct-takeover', label: 'השתלטות על חשבון', type: 'threat' },
      { id: 'mfa-ctrl', label: 'MFA + אימות חזק', type: 'control' },
      { id: 'backup-ctrl', label: 'גיבויים מבודדים + שחזור', type: 'control' },
      { id: 'awareness', label: 'הדרכת מודעות', type: 'control' },
      { id: 'encryption', label: 'הצפנה במנוחה ובתעבורה', type: 'control' },
      { id: 'least-priv', label: 'הרשאות מינימום', type: 'control' },
      { id: 'edr', label: 'EDR / ניטור תחנות', type: 'control' }
    ];

    const typeToCol = { asset: 'assets', threat: 'threats', control: 'controls' };

    container.innerHTML = `
      <div class="story-box">
        <div class="story-label">📖 סיפור המשימה</div>
        <p>מידול איומים הגנתי: גררו כל פריט לעמודה הנכונה — <strong>נכסים</strong>, <strong>איומים</strong>, או <strong>בקרות</strong>. המטרה לחשוב כמו מגינים: מה שומרים, ממה חוששים, ואיך מגנים.</p>
      </div>

      <div class="sim-panel">
        <h2>🎯 לוח מידול איומים</h2>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">גררו מהמאגר לעמודות. אפשר גם ללחוץ על פריט ואז על עמודה.</p>
        <div class="tm-pool" id="tmPool"></div>
        <div class="tm-board">
          <div class="tm-column assets">
            <h4>💎 נכסים</h4>
            <div class="tm-drop-zone" data-col="assets" id="col-assets"></div>
          </div>
          <div class="tm-column threats">
            <h4>⚡ איומים</h4>
            <div class="tm-drop-zone" data-col="threats" id="col-threats"></div>
          </div>
          <div class="tm-column controls">
            <h4>🛡️ בקרות</h4>
            <div class="tm-drop-zone" data-col="controls" id="col-controls"></div>
          </div>
        </div>
        <div style="text-align:center;margin-top:1.25rem;">
          <button class="btn btn-secondary btn-sm" id="resetTm">איפוס הלוח</button>
          <button class="btn btn-primary" id="submitTm" disabled>הגישו ציון</button>
        </div>
      </div>

      <div class="recap-box" id="recap5"></div>
    `;

    const pool = container.querySelector('#tmPool');
    const placements = {}; // id -> column
    let dragId = null;
    let selectedId = null;

    function renderChip(item, parent) {
      const chip = document.createElement('div');
      chip.className = `tm-chip type-${item.type}`;
      chip.draggable = true;
      chip.dataset.id = item.id;
      chip.textContent = item.label;
      chip.addEventListener('dragstart', e => {
        if (submitted) { e.preventDefault(); return; }
        dragId = item.id;
        chip.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
      chip.addEventListener('click', () => {
        if (submitted) return;
        selectedId = selectedId === item.id ? null : item.id;
        container.querySelectorAll('.tm-chip').forEach(c => {
          c.style.outline = c.dataset.id === selectedId ? '2px solid var(--neon)' : '';
        });
      });
      parent.appendChild(chip);
    }

    // Shuffle pool
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    shuffled.forEach(item => renderChip(item, pool));

    container.querySelectorAll('.tm-drop-zone').forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain') || dragId;
        if (id) placeItem(id, zone.dataset.col);
      });
      zone.addEventListener('click', () => {
        if (selectedId) {
          placeItem(selectedId, zone.dataset.col);
          selectedId = null;
          container.querySelectorAll('.tm-chip').forEach(c => { c.style.outline = ''; });
        }
      });
    });

    // Allow returning to pool
    pool.addEventListener('dragover', e => { e.preventDefault(); });
    pool.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain') || dragId;
      if (id) placeItem(id, 'pool');
    });

    function placeItem(id, col) {
      if (submitted) return;
      const chip = container.querySelector(`.tm-chip[data-id="${id}"]`);
      if (!chip) return;
      if (col === 'pool') {
        delete placements[id];
        pool.appendChild(chip);
      } else {
        placements[id] = col;
        container.querySelector('#col-' + col).appendChild(chip);
      }
      const placed = Object.keys(placements).length;
      container.querySelector('#submitTm').disabled = placed < items.length;
    }

    container.querySelector('#resetTm').addEventListener('click', () => {
      if (submitted) return;
      Object.keys(placements).forEach(k => delete placements[k]);
      pool.innerHTML = '';
      container.querySelector('#col-assets').innerHTML = '';
      container.querySelector('#col-threats').innerHTML = '';
      container.querySelector('#col-controls').innerHTML = '';
      const reshuffle = [...items].sort(() => Math.random() - 0.5);
      reshuffle.forEach(item => renderChip(item, pool));
      container.querySelector('#submitTm').disabled = true;
    });

    container.querySelector('#submitTm').addEventListener('click', () => {
      if (submitted || Object.keys(placements).length < items.length) return;
      submitted = true;
      container.querySelector('#submitTm').disabled = true;
      container.querySelector('#resetTm').disabled = true;

      let correct = 0;
      items.forEach(item => {
        const expected = typeToCol[item.type];
        const chip = container.querySelector(`.tm-chip[data-id="${item.id}"]`);
        if (placements[item.id] === expected) {
          correct++;
          chip.style.borderColor = 'var(--neon)';
          chip.style.boxShadow = '0 0 8px rgba(0,245,160,0.3)';
        } else {
          chip.style.borderColor = 'var(--neon-red)';
          chip.style.opacity = '0.85';
        }
        chip.draggable = false;
      });

      const score = Math.round((correct / items.length) * 100);

      const recap = container.querySelector('#recap5');
      recap.classList.add('visible');
      recap.innerHTML = `
        <div class="score-display">
          <div class="score-circle">${score}</div>
          <div style="color:var(--text-muted)">${correct}/${items.length} סיווגים נכונים</div>
        </div>
        <h3>✨ מה למדת</h3>
        <ul>
          <li>מידול איומים מתחיל בנכסים — מה באמת שווה להגן עליו.</li>
          <li>לכל איום מחברים בקרות מונעות, מזהות ומגיבות.</li>
          <li>זו מסגרת חשיבה להגנה ותעדוף — לא מדריך תקיפה.</li>
        </ul>
        <div class="cta-row" id="cta5"></div>
      `;
      onComplete(score);
    });
  }
};
