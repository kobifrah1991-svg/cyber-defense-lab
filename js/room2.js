/* Room 2 — Network Map: place controls + triage order */
window.Room2 = {
  render(container, onComplete) {
    let placed = {}; // nodeId -> [controlIds]
    let triageOrder = [];
    let phase = 'map'; // map | triage | done
    let submitted = false;

    const nodes = [
      { id: 'laptop', label: 'מחשב משתמש', x: 12, y: 45, emoji: '💻' },
      { id: 'firewall', label: 'חומת אש', x: 38, y: 45, emoji: '🧱' },
      { id: 'web', label: 'שרת Web', x: 64, y: 28, emoji: '🌐' },
      { id: 'db', label: 'מסד נתונים', x: 64, y: 68, emoji: '🗄️' }
    ];

    const controls = [
      { id: 'mfa', label: '🔑 MFA', forNodes: ['laptop', 'web'] },
      { id: 'patch', label: '🩹 עדכון אבטחה', forNodes: ['laptop', 'web', 'db', 'firewall'] },
      { id: 'least', label: '👤 הרשאות מינימום', forNodes: ['db', 'web', 'laptop'] },
      { id: 'segment', label: '🔀 סגמנטציה', forNodes: ['firewall'] },
      { id: 'waf', label: '🛡️ WAF', forNodes: ['web', 'firewall'] }
    ];

    const idealPlacement = {
      laptop: ['mfa', 'patch', 'least'],
      firewall: ['segment', 'patch'],
      web: ['mfa', 'patch', 'waf', 'least'],
      db: ['least', 'patch']
    };

    // Correct triage order for suspicious login
    const triageSteps = [
      { id: 'verify', label: 'אימות ההתראה מול יומני התחברות ומקור ה-IP' },
      { id: 'isolate', label: 'בידוד זמני של החשבון / דרישת MFA מחדש' },
      { id: 'investigate', label: 'בדיקת פעילות חריגה אחרי ההתחברות' },
      { id: 'document', label: 'תיעוד הממצאים ועדכון הטיקט' }
    ];
    const correctOrder = ['verify', 'isolate', 'investigate', 'document'];

    let selectedNode = null;
    let selectedControl = null;

    container.innerHTML = `
      <div class="story-box">
        <div class="story-label">📖 סיפור המשימה</div>
        <p>התקבלה התראת <strong>התחברות חשודה</strong> לרשת הארגונית. לפני שרצים — ממפים את הרשת, ממקמים בקרות הגנה על הצמתים, ואז מבצעים טריאז׳ בסדר הנכון.</p>
      </div>

      <div class="sim-panel" id="mapPhase">
        <h2>🗺️ מפת רשת אינטראקטיבית</h2>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.75rem;">בחרו בקרה, ואז לחצו על צומת מתאים כדי להציב אותה. אפשר להציב כמה בקרות על צומת.</p>
        <div class="node-controls" id="ctrlChips"></div>
        <div class="network-canvas-wrap">
          <svg id="networkSvg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div class="node-info empty" id="nodeInfo">בחרו צומת או בקרה כדי להתחיל</div>
        <div style="margin-top:1rem;text-align:center;">
          <button class="btn btn-primary" id="toTriage" disabled>המשיכו לטריאז׳ התראה ←</button>
        </div>
      </div>

      <div class="sim-panel" id="triagePhase" style="display:none;">
        <h2>🚨 התראת SIEM: Suspicious Login</h2>
        <div style="background:var(--bg-deep);border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem;font-family:var(--mono);font-size:0.82rem;direction:ltr;text-align:left;color:var(--text-muted);">
          <div style="color:var(--neon-orange);">[HIGH] ALERT-8842 · Suspicious Login</div>
          <div>user=dana.cohen · src=185.220.xx.xx (Tor exit?) · dest=vpn.corp.local · geo≠usual</div>
          <div>time=02:14 Asia/Jerusalem · MFA=not completed</div>
        </div>
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.75rem;">לחצו על הצעדים <strong>בסדר הנכון</strong> (1→4):</p>
        <div class="triage-steps" id="triageList"></div>
        <div class="order-feedback" id="orderFb"></div>
        <div style="margin-top:1rem;text-align:center;">
          <button class="btn btn-secondary btn-sm" id="resetTriage">איפוס סדר</button>
          <button class="btn btn-primary" id="submitNet" disabled>הגישו ציון</button>
        </div>
      </div>

      <div class="recap-box" id="recap2"></div>
    `;

    // Draw SVG network
    const svg = container.querySelector('#networkSvg');
    const links = [
      ['laptop', 'firewall'],
      ['firewall', 'web'],
      ['firewall', 'db'],
      ['web', 'db']
    ];

    function nodeById(id) { return nodes.find(n => n.id === id); }

    links.forEach(([a, b]) => {
      const na = nodeById(a), nb = nodeById(b);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', na.x); line.setAttribute('y1', na.y);
      line.setAttribute('x2', nb.x); line.setAttribute('y2', nb.y);
      line.setAttribute('stroke', '#1e2d45');
      line.setAttribute('stroke-width', '0.6');
      line.setAttribute('stroke-dasharray', '1.5 1');
      svg.appendChild(line);
    });

    nodes.forEach(n => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';
      g.dataset.node = n.id;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', n.x); circle.setAttribute('cy', n.y);
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', '#1a2332');
      circle.setAttribute('stroke', '#00f5a0');
      circle.setAttribute('stroke-width', '0.5');
      circle.classList.add('node-circle');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', n.x); text.setAttribute('y', n.y + 1.5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '5');
      text.textContent = n.emoji;

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', n.x); label.setAttribute('y', n.y + 13);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '3.2');
      label.setAttribute('fill', '#8899b0');
      label.textContent = n.label;

      const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badge.setAttribute('x', n.x + 6); badge.setAttribute('y', n.y - 6);
      badge.setAttribute('font-size', '3');
      badge.setAttribute('fill', '#00d4ff');
      badge.classList.add('ctrl-badge');
      badge.textContent = '';

      g.appendChild(circle); g.appendChild(text); g.appendChild(label); g.appendChild(badge);
      g.addEventListener('click', () => onNodeClick(n.id));
      svg.appendChild(g);
    });

    // Control chips
    const chips = container.querySelector('#ctrlChips');
    controls.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'control-chip';
      chip.dataset.id = c.id;
      chip.textContent = c.label;
      chip.addEventListener('click', () => {
        if (phase !== 'map') return;
        selectedControl = selectedControl === c.id ? null : c.id;
        chips.querySelectorAll('.control-chip').forEach(el => {
          el.style.outline = el.dataset.id === selectedControl ? '2px solid var(--neon)' : '';
        });
        updateInfo();
      });
      chips.appendChild(chip);
    });

    function onNodeClick(nodeId) {
      if (phase !== 'map') return;
      selectedNode = nodeId;
      if (selectedControl) {
        const ctrl = controls.find(c => c.id === selectedControl);
        if (!ctrl.forNodes.includes(nodeId)) {
          container.querySelector('#nodeInfo').innerHTML =
            `<span style="color:var(--neon-orange)">⚠️ הבקרה "${ctrl.label}" לא מתאימה לצומת הזה. נסו צומת אחר.</span>`;
          return;
        }
        if (!placed[nodeId]) placed[nodeId] = [];
        if (!placed[nodeId].includes(selectedControl)) {
          placed[nodeId].push(selectedControl);
        }
        refreshBadges();
        const totalPlaced = Object.values(placed).reduce((s, a) => s + a.length, 0);
        container.querySelector('#toTriage').disabled = totalPlaced < 3;
      }
      updateInfo();
    }

    function refreshBadges() {
      nodes.forEach(n => {
        const g = svg.querySelector(`[data-node="${n.id}"]`);
        const badge = g.querySelector('.ctrl-badge');
        const count = (placed[n.id] || []).length;
        badge.textContent = count ? `+${count}` : '';
        const circle = g.querySelector('.node-circle');
        circle.setAttribute('stroke', count ? '#00d4ff' : '#00f5a0');
      });
      // mark chips
      const used = new Set(Object.values(placed).flat());
      chips.querySelectorAll('.control-chip').forEach(el => {
        el.classList.toggle('placed', used.has(el.dataset.id));
      });
    }

    function updateInfo() {
      const info = container.querySelector('#nodeInfo');
      if (!selectedNode) {
        info.className = 'node-info empty';
        info.textContent = selectedControl
          ? `בקרה נבחרה — לחצו על צומת מתאים`
          : 'בחרו צומת או בקרה כדי להתחיל';
        return;
      }
      const n = nodeById(selectedNode);
      const list = (placed[selectedNode] || []).map(id => controls.find(c => c.id === id).label);
      info.className = 'node-info';
      info.innerHTML = `<strong>${n.emoji} ${n.label}</strong><br>
        בקרות מוצבות: ${list.length ? list.join(' · ') : '<span style="color:var(--text-dim)">אין עדיין</span>'}`;
    }

    container.querySelector('#toTriage').addEventListener('click', () => {
      phase = 'triage';
      container.querySelector('#mapPhase').style.opacity = '0.5';
      container.querySelector('#mapPhase').style.pointerEvents = 'none';
      container.querySelector('#toTriage').disabled = true;
      container.querySelector('#triagePhase').style.display = 'block';
      buildTriage();
    });

    function buildTriage() {
      const list = container.querySelector('#triageList');
      list.innerHTML = '';
      // shuffle display order
      const shuffled = [...triageSteps].sort(() => Math.random() - 0.5);
      shuffled.forEach(step => {
        const el = document.createElement('div');
        el.className = 'triage-step';
        el.dataset.id = step.id;
        el.innerHTML = `<span class="step-num">?</span><span>${step.label}</span>`;
        el.addEventListener('click', () => pickStep(step.id, el));
        list.appendChild(el);
      });
    }

    function pickStep(id, el) {
      if (submitted || triageOrder.includes(id)) return;
      triageOrder.push(id);
      el.classList.add('selected');
      el.querySelector('.step-num').textContent = triageOrder.length;
      container.querySelector('#submitNet').disabled = triageOrder.length < 4;
      container.querySelector('#orderFb').textContent =
        triageOrder.length < 4 ? `נבחרו ${triageOrder.length}/4` : 'מוכנים להגשה!';
    }

    container.querySelector('#resetTriage').addEventListener('click', () => {
      if (submitted) return;
      triageOrder = [];
      container.querySelector('#submitNet').disabled = true;
      container.querySelector('#orderFb').textContent = '';
      buildTriage();
    });

    function scorePlacement() {
      let hits = 0, total = 0;
      Object.keys(idealPlacement).forEach(nid => {
        idealPlacement[nid].forEach(cid => {
          total++;
          if ((placed[nid] || []).includes(cid)) hits++;
        });
      });
      // Also penalize nothing placed
      const any = Object.values(placed).flat().length;
      if (any === 0) return 0;
      return Math.round((hits / total) * 100);
    }

    function scoreTriage() {
      let correct = 0;
      triageOrder.forEach((id, i) => {
        if (correctOrder[i] === id) correct++;
      });
      return Math.round((correct / 4) * 100);
    }

    container.querySelector('#submitNet').addEventListener('click', () => {
      if (submitted || triageOrder.length < 4) return;
      submitted = true;
      container.querySelector('#submitNet').disabled = true;
      container.querySelector('#resetTriage').disabled = true;

      // Mark wrong steps
      container.querySelectorAll('.triage-step').forEach(el => {
        const idx = triageOrder.indexOf(el.dataset.id);
        if (idx >= 0 && correctOrder[idx] !== el.dataset.id) {
          el.classList.add('wrong');
        }
      });

      const mapScore = scorePlacement();
      const triScore = scoreTriage();
      const score = Math.round(mapScore * 0.45 + triScore * 0.55);

      const recap = container.querySelector('#recap2');
      recap.classList.add('visible');
      recap.innerHTML = `
        <div class="score-display">
          <div class="score-circle">${score}</div>
          <div style="color:var(--text-muted)">מפה: ${mapScore} · טריאז׳: ${triScore}</div>
        </div>
        <h3>✨ מה למדת</h3>
        <ul>
          <li>הפרדת רשתות, MFA, עדכונים והרשאות מינימום מצמצמים משטח תקיפה.</li>
          <li>בטריאז׳ התחברות חשודה: אמת ← בודד ← חקור ← תעד.</li>
          <li>סדר נכון מונע מחיקת ראיות ומגביל נזק בזמן אמת.</li>
        </ul>
        <div class="cta-row" id="cta2"></div>
      `;
      onComplete(score);
    });
  }
};
