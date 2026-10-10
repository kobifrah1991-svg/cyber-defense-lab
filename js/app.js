/* HackerBot Defense Lab — main app (Hebrew RTL) */
(function () {
  const ROOM_RENDERERS = {
    'password-fortress': () => window.Room1,
    'network-map': () => window.Room2,
    'https-shield': () => window.Room3,
    'alert-triage': () => window.Room4,
    'threat-modeling': () => window.Room5
  };

  let currentRoomId = null;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  function updateHeader() {
    const p = DefenseStorage.getProgress();
    $('#hdrLevel').textContent = p.level;
    $('#hdrXp').textContent = p.xp;
    $('#hdrXpBar').style.width = p.xpPercent + '%';
  }

  function renderDashboard() {
    updateHeader();
    const p = DefenseStorage.getProgress();
    const rooms = window.ROOMS_META;

    const completed = rooms.filter(r => p.rooms[r.id] && p.rooms[r.id].completed).length;
    const avgScore = (() => {
      const scores = rooms.map(r => p.rooms[r.id]?.score).filter(s => s != null);
      if (!scores.length) return 0;
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    })();

    $('#dashCompleted').textContent = completed;
    $('#dashTotal').textContent = rooms.length;
    $('#dashAvg').textContent = avgScore;
    $('#dashXp').textContent = p.xp;
    $('#dashLevel').textContent = p.level;

    const grid = $('#roomsGrid');
    grid.innerHTML = '';

    rooms.forEach(room => {
      const unlocked = DefenseStorage.isRoomUnlocked(room.id, rooms);
      const data = p.rooms[room.id];
      const done = data && data.completed;
      const card = document.createElement('div');
      card.className = `room-card diff-${room.difficulty}` +
        (unlocked ? '' : ' locked') +
        (done ? ' completed' : '');

      card.innerHTML = `
        ${done ? '<div class="room-done-badge">✓</div>' : ''}
        <div class="room-card-header">
          <span class="room-num">חדר ${room.num}</span>
          <span class="diff-badge ${room.difficulty}">${room.difficultyHe}</span>
        </div>
        <div class="room-icon-badge">${room.icon}</div>
        <h3>${room.title}</h3>
        <p>${room.desc}</p>
        <div class="room-card-footer">
          ${unlocked
            ? `<span class="room-xp">+${room.xp} XP</span>
               <span class="room-score">${done ? `ציון: ${data.score}` : 'לא הושלם'}</span>`
            : `<span class="lock-icon">🔒</span><span class="room-score">השלימו חדרים קודמים</span>`
          }
        </div>
      `;

      card.addEventListener('click', () => {
        if (!unlocked) {
          toast('🔒 החדר נעול — השלימו את החדרים הקודמים');
          return;
        }
        openRoom(room.id);
      });
      grid.appendChild(card);
    });

    showView('view-home');
  }

  function openRoom(roomId) {
    const room = window.ROOMS_META.find(r => r.id === roomId);
    if (!room) return;
    if (!DefenseStorage.isRoomUnlocked(roomId, window.ROOMS_META)) {
      toast('🔒 החדר נעול');
      return;
    }

    currentRoomId = roomId;
    const mount = $('#roomMount');
    $('#roomTitle').textContent = `${room.icon} ${room.title}`;
    $('#roomDiff').className = `diff-badge ${room.difficulty}`;
    $('#roomDiff').textContent = room.difficultyHe;
    $('#roomXpBadge').textContent = `+${room.xp} XP`;
    mount.innerHTML = '';

    showView('view-room');

    const renderer = ROOM_RENDERERS[roomId]?.();
    if (!renderer) {
      mount.innerHTML = '<p style="color:var(--neon-red)">שגיאה בטעינת החדר</p>';
      return;
    }

    renderer.render(mount, (score) => onRoomComplete(room, score));
  }

  function onRoomComplete(room, score) {
    const prev = DefenseStorage.getProgress();
    const wasDone = prev.rooms[room.id]?.completed;
    const state = DefenseStorage.saveRoomScore(room.id, score, room.xp);
    updateHeader();

    if (!wasDone && score >= 50) {
      toast(`🎉 +${room.xp} XP · רמה ${state.level}`);
    } else if (score >= 50) {
      toast(`✓ ציון נשמר: ${score}`);
    } else {
      toast(`ציון ${score} — נסו שוב לשיפור (עוברים מ־50)`);
    }

    // Inject CTA buttons into recap
    const cta = document.querySelector(`#cta${room.num}`) || document.querySelector('.recap-box.visible .cta-row');
    if (cta) {
      cta.innerHTML = '';
      const homeBtn = document.createElement('button');
      homeBtn.className = 'btn btn-secondary';
      homeBtn.textContent = '← לוח הבקרה';
      homeBtn.addEventListener('click', renderDashboard);
      cta.appendChild(homeBtn);

      const next = window.ROOMS_META.find(r => r.num === room.num + 1);
      if (next) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary';
        const canNext = DefenseStorage.isRoomUnlocked(next.id, window.ROOMS_META);
        nextBtn.textContent = canNext ? `החדר הבא: ${next.title} →` : `החדר הבא נעול 🔒`;
        nextBtn.disabled = !canNext;
        nextBtn.addEventListener('click', () => {
          if (canNext) openRoom(next.id);
        });
        cta.appendChild(nextBtn);
      } else {
        const doneBtn = document.createElement('button');
        doneBtn.className = 'btn btn-primary';
        doneBtn.textContent = '🏆 סיימתם את כל החדרים!';
        doneBtn.addEventListener('click', renderDashboard);
        cta.appendChild(doneBtn);
      }

      if (score < 50) {
        const retry = document.createElement('button');
        retry.className = 'btn btn-ghost';
        retry.textContent = '↻ נסו שוב';
        retry.addEventListener('click', () => openRoom(room.id));
        cta.appendChild(retry);
      }
    }
  }

  function init() {
    $('#logoBtn').addEventListener('click', e => {
      e.preventDefault();
      renderDashboard();
    });
    $('#btnBackHome').addEventListener('click', renderDashboard);
    $('#btnReset').addEventListener('click', () => {
      if (confirm('לאפס את כל ההתקדמות?')) {
        DefenseStorage.resetProgress();
        toast('ההתקדמות אופסה');
        renderDashboard();
      }
    });
    renderDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
