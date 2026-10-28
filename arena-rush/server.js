// Arena Rush game server: static files + WebSocket, server-authoritative damage (GDD §14).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { MAP } from './shared/map.js';
import { WEAPONS, WEAPON_ORDER, damageAt } from './shared/weapons.js';
import { PLAYER, step, rayBox, rayWorld, hitboxes, dirFromAngles } from './shared/physics.js';
import { filterChat, cleanName, QUICK_CHAT } from './shared/chatfilter.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const TICK = 1 / 30;
const SNAP_EVERY = 2;              // snapshots at 15 Hz
const MAX_PLAYERS = 12;
const MIN_COMBATANTS = Number(process.env.BOTS ?? 4); // bots fill up to this many fighters
const MATCH_SECONDS = 300;
const KILL_LIMIT = 25;
const RESPAWN_SECONDS = 3;
const SPAWN_PROTECT = 1.5;
const COLORS = [0xff2e88, 0x00e5ff, 0xffd600, 0x76ff03, 0xff6d00, 0xd500f9, 0x40c4ff, 0xff1744, 0x1de9b6, 0xf50057, 0xc6ff00, 0x651fff];
const STREAKS = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 5: 'RAMPAGE', 7: 'UNSTOPPABLE', 10: 'GODLIKE' };

// ---------- static files ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/health') { res.writeHead(200); res.end('ok'); return; }
  let base = path.join(ROOT, 'public'), rel = url === '/' ? 'index.html' : url;
  if (url.startsWith('/shared/')) base = ROOT;
  if (url.startsWith('/vendor/')) { base = path.join(ROOT, 'node_modules', 'three', 'build'); rel = url.slice('/vendor/'.length); }
  const file = path.normalize(path.join(base, rel));
  if (!file.startsWith(base + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------- state ----------
const players = new Map(); // id -> player (humans and bots)
let nextId = 1;
let tick = 0;
const match = { state: 'playing', endsAt: Date.now() + MATCH_SECONDS * 1000, winner: null };

function newPlayer(name, bot = false) {
  const used = new Set([...players.values()].map((p) => p.color));
  const p = {
    id: (bot ? 'b' : 'p') + nextId++,
    name, bot, ws: null,
    color: COLORS.find((c) => !used.has(c)) ?? COLORS[nextId % COLORS.length],
    p: [0, 0, 0], v: [0, 0, 0], onGround: true, yaw: 0, pitch: 0,
    hp: PLAYER.maxHp, alive: false, respawnAt: Date.now() + 500, protectUntil: 0,
    weapon: 'rifle', ammo: {}, reloadUntil: 0, lastShot: {}, lastHurt: 0,
    kills: 0, deaths: 0, streak: 0, heads: 0,
    history: [], rtt: 80, lastState: Date.now(), chatTimes: [], strikes: 0, mutedUntil: 0,
    ai: bot ? { wp: null, stuck: 0, target: null, seenAt: 0, strafe: 1, strafeT: 0, jumpT: 0, aimErr: 0 } : null,
  };
  refill(p);
  players.set(p.id, p);
  return p;
}

const refill = (p) => { for (const k of WEAPON_ORDER) p.ammo[k] = WEAPONS[k].mag; };
const humans = () => [...players.values()].filter((p) => !p.bot);
const send = (p, msg) => { if (p.ws && p.ws.readyState === 1) p.ws.send(JSON.stringify(msg)); };
const broadcast = (msg, except) => { const s = JSON.stringify(msg); for (const p of players.values()) if (p !== except && p.ws && p.ws.readyState === 1) p.ws.send(s); };
const sys = (text) => broadcast({ t: 'chat', sys: true, text });

function roster() {
  return [...players.values()].map((p) => ({ id: p.id, name: p.name, bot: p.bot, color: p.color, kills: p.kills, deaths: p.deaths, ping: p.bot ? 0 : Math.round(p.rtt) }));
}
const sendRoster = () => broadcast({ t: 'roster', players: roster() });

function pickSpawn(p) {
  const enemies = [...players.values()].filter((o) => o !== p && o.alive);
  let best = MAP.spawns[0], bestScore = -1;
  for (const s of MAP.spawns) {
    let d = 1e9;
    for (const e of enemies) d = Math.min(d, Math.hypot(e.p[0] - s[0], e.p[2] - s[2]));
    const score = d + Math.random() * 6;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return best;
}

function spawn(p) {
  const s = pickSpawn(p);
  p.p = [s[0], s[1], s[2]]; p.v = [0, 0, 0];
  p.yaw = Math.atan2(s[0], s[2]); // face the centre
  p.pitch = 0;
  p.hp = PLAYER.maxHp; p.alive = true; p.streak = 0;
  p.protectUntil = Date.now() + SPAWN_PROTECT * 1000;
  p.reloadUntil = 0; refill(p);
  p.history = [];
  send(p, { t: 'spawn', p: p.p, yaw: p.yaw, ammo: p.ammo });
}

// ---------- combat ----------
function positionAt(p, t) {
  const h = p.history;
  if (!h.length) return p.p;
  if (t >= h[h.length - 1].t) return h[h.length - 1].p;
  for (let i = h.length - 1; i > 0; i--) {
    const a = h[i - 1], b = h[i];
    if (a.t <= t) {
      const k = (t - a.t) / Math.max(1, b.t - a.t);
      return [a.p[0] + (b.p[0] - a.p[0]) * k, a.p[1] + (b.p[1] - a.p[1]) * k, a.p[2] + (b.p[2] - a.p[2]) * k];
    }
  }
  return h[0].p;
}

function fire(shooter, wKey, origin, dirs) {
  const w = WEAPONS[wKey];
  const now = Date.now();
  if (!w || !shooter.alive || match.state !== 'playing') return;
  if (now < shooter.reloadUntil) return;
  if (now - (shooter.lastShot[wKey] || 0) < w.rate * 1000 * 0.85) return; // rate-of-fire check
  if (shooter.ammo[wKey] <= 0) return;
  if (!Array.isArray(dirs) || dirs.length < 1 || dirs.length > w.pellets) return;
  shooter.lastShot[wKey] = now;
  shooter.ammo[wKey]--;
  shooter.weapon = wKey;
  shooter.protectUntil = 0; // firing ends spawn protection

  // The shot must start at the shooter's eye (small tolerance for latency)
  const eye = [shooter.p[0], shooter.p[1] + PLAYER.eye, shooter.p[2]];
  const o = (Array.isArray(origin) && origin.length === 3 && origin.every(Number.isFinite) &&
    Math.hypot(origin[0] - eye[0], origin[1] - eye[1], origin[2] - eye[2]) < 2.5) ? origin : eye;

  // Lag compensation: rewind targets to what the shooter saw
  const rewind = shooter.bot ? 0 : Math.min(300, shooter.rtt / 2 + 100);
  const tShot = now - rewind;
  const targets = [...players.values()].filter((t) => t !== shooter && t.alive).map((t) => ({ t, pos: positionAt(t, tShot) }));

  const ends = [];
  const dmgBy = new Map();
  for (const raw of dirs) {
    if (!Array.isArray(raw) || raw.length !== 3 || !raw.every(Number.isFinite)) continue;
    const l = Math.hypot(raw[0], raw[1], raw[2]);
    if (l < 0.5 || l > 1.5) continue;
    const d = [raw[0] / l, raw[1] / l, raw[2] / l];
    const wall = rayWorld(o, d, MAP.boxes, w.range);
    let best = wall, hitT = null, head = false;
    for (const { t, pos } of targets) {
      const hb = hitboxes(pos);
      const th = rayBox(o, d, hb.head[0], hb.head[1], best);
      if (th !== null && th < best) { best = th; hitT = t; head = true; }
      const tb = rayBox(o, d, hb.body[0], hb.body[1], best);
      if (tb !== null && tb < best) { best = tb; hitT = t; head = false; }
    }
    ends.push([o[0] + d[0] * best, o[1] + d[1] * best, o[2] + d[2] * best, hitT ? 1 : 0]);
    if (hitT) {
      const e = dmgBy.get(hitT) || { dmg: 0, head: false, at: null };
      e.dmg += damageAt(w, best, head);
      e.head = e.head || head;
      e.at = ends[ends.length - 1].slice(0, 3);
      dmgBy.set(hitT, e);
    }
  }
  broadcast({ t: 'shot', id: shooter.id, w: wKey, o, ends }, shooter);
  for (const [target, e] of dmgBy) applyDamage(shooter, target, e.dmg, e.head, wKey, e.at);
}

function applyDamage(attacker, target, dmg, head, wKey, at) {
  if (!target.alive || Date.now() < target.protectUntil) return;
  target.hp -= dmg;
  target.lastHurt = Date.now();
  const kill = target.hp <= 0;
  send(attacker, { t: 'hit', target: target.id, dmg, head, kill, at });
  send(target, { t: 'hurt', by: attacker.id, hp: Math.max(0, target.hp), from: attacker.p });
  if (target.bot && target.ai) { target.ai.target = attacker.id; target.ai.seenAt = Date.now(); }
  if (kill) onKill(attacker, target, wKey, head);
}

function onKill(killer, victim, wKey, head) {
  victim.alive = false; victim.hp = 0; victim.deaths++; victim.streak = 0;
  victim.respawnAt = Date.now() + RESPAWN_SECONDS * 1000;
  killer.kills++; killer.streak++;
  if (head) killer.heads++;
  // Kill reward: heal a little so aggressive play feels good
  if (killer.alive) killer.hp = Math.min(PLAYER.maxHp, killer.hp + 25);
  const streakName = STREAKS[killer.streak] || null;
  broadcast({ t: 'kill', killer: killer.id, victim: victim.id, w: wKey, head, streak: killer.streak, streakName, pos: victim.p });
  if (killer.streak >= 5 && streakName) sys(`🔥 ${killer.name} ב-${streakName}! (${killer.streak} ברצף)`);
  sendRoster();
  if (killer.kills >= KILL_LIMIT) endMatch(killer);
}

function endMatch(winner) {
  if (match.state !== 'playing') return;
  const board = roster().sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  winner = winner || players.get(board[0]?.id);
  match.state = 'ended';
  match.winner = winner ? winner.id : null;
  match.endsAt = Date.now() + 10000;
  broadcast({ t: 'match', state: 'ended', winner: match.winner, winnerName: winner?.name, board, next: match.endsAt });
}

function newMatch() {
  match.state = 'playing';
  match.winner = null;
  match.endsAt = Date.now() + MATCH_SECONDS * 1000;
  for (const p of players.values()) { p.kills = 0; p.deaths = 0; p.heads = 0; spawn(p); }
  broadcast({ t: 'match', state: 'playing', endsAt: match.endsAt });
  sendRoster();
  sys('סבב חדש התחיל! ראשון ל-' + KILL_LIMIT + ' הריגות מנצח.');
}

// ---------- bots ----------
const BOT_NAMES = ['ניאון', 'ברק', 'טורבו', 'פיקסל', 'רובו', 'צל', 'זיק', 'קומטה', 'גלקסי', 'ריינבו'];
function balanceBots() {
  const total = players.size;
  const bots = [...players.values()].filter((p) => p.bot);
  const want = humans().length ? Math.max(0, MIN_COMBATANTS - humans().length) : 0;
  if (bots.length < want && total < MAX_PLAYERS && humans().length > 0) {
    const used = new Set(bots.map((b) => b.name));
    const name = '🤖 ' + (BOT_NAMES.find((n) => !used.has('🤖 ' + n)) || 'בוט' + nextId);
    newPlayer(name, true);
    sendRoster();
  } else if (bots.length > want) {
    const b = bots[bots.length - 1];
    players.delete(b.id);
    broadcast({ t: 'leave', id: b.id });
    sendRoster();
  }
}

function lineOfSight(a, b) {
  const o = [a[0], a[1] + PLAYER.eye, a[2]];
  const tgt = [b[0], b[1] + 1.2, b[2]];
  const d = [tgt[0] - o[0], tgt[1] - o[1], tgt[2] - o[2]];
  const dist = Math.hypot(d[0], d[1], d[2]);
  d[0] /= dist; d[1] /= dist; d[2] /= dist;
  return rayWorld(o, d, MAP.boxes, dist) >= dist - 0.01;
}

function botThink(b, dt) {
  const ai = b.ai, now = Date.now();
  const input = { f: 0, s: 0, jump: false, yaw: b.yaw };
  // Pick the closest visible enemy
  let target = null, tDist = 45;
  for (const o of players.values()) {
    if (o === b || !o.alive || now < o.protectUntil) continue;
    const d = Math.hypot(o.p[0] - b.p[0], o.p[1] - b.p[1], o.p[2] - b.p[2]);
    const remembered = ai.target === o.id && now - ai.seenAt < 2000;
    if ((d < tDist || remembered) && lineOfSight(b.p, o.p)) { target = o; tDist = d; }
  }
  if (target) {
    if (ai.target !== target.id) { ai.reactAt = now + 500 + Math.random() * 500; ai.aimErr = 0.3; }
    ai.target = target.id; ai.seenAt = now;
    const dx = target.p[0] - b.p[0], dz = target.p[2] - b.p[2];
    const dy = target.p[1] + 0.9 - (b.p[1] + PLAYER.eye);
    const wantYaw = Math.atan2(-dx, -dz);
    const wantPitch = Math.atan2(dy, Math.hypot(dx, dz));
    let dyaw = wantYaw - b.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    b.yaw += dyaw * Math.min(1, dt * 6);
    b.pitch += (wantPitch - b.pitch) * Math.min(1, dt * 6);
    ai.aimErr = Math.max(0.055, ai.aimErr - dt * 0.15);
    // Strafe while fighting, close distance if far
    ai.strafeT -= dt;
    if (ai.strafeT <= 0) { ai.strafe = Math.random() < 0.5 ? -1 : 1; ai.strafeT = 0.6 + Math.random() * 1.2; }
    input.s = ai.strafe;
    input.f = tDist > 18 ? 1 : tDist < 6 ? -0.6 : 0;
    input.yaw = b.yaw;
    const wKey = tDist < 7 ? 'shotgun' : 'rifle';
    if (b.ammo[wKey] <= 0 && now >= b.reloadUntil) { b.reloadUntil = now + WEAPONS[wKey].reload * 1000; b.ammo[wKey] = WEAPONS[wKey].mag; }
    if (now > ai.reactAt && Math.abs(dyaw) < 0.25) {
      const w = WEAPONS[wKey];
      const dirs = [];
      for (let i = 0; i < w.pellets; i++) {
        const err = ai.aimErr + w.spread;
        dirs.push(dirFromAngles(b.yaw + (Math.random() - 0.5) * err * 2, b.pitch + (Math.random() - 0.5) * err * 2));
      }
      fire(b, wKey, [b.p[0], b.p[1] + PLAYER.eye, b.p[2]], dirs);
    }
  } else {
    // Wander between waypoints
    if (!ai.wp || Math.hypot(ai.wp[0] - b.p[0], ai.wp[2] - b.p[2]) < 1.5 || ai.stuck > 1.2) {
      ai.wp = MAP.waypoints[Math.floor(Math.random() * MAP.waypoints.length)];
      ai.stuck = 0;
    }
    const dx = ai.wp[0] - b.p[0], dz = ai.wp[2] - b.p[2];
    const wantYaw = Math.atan2(-dx, -dz);
    let dyaw = wantYaw - b.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    b.yaw += dyaw * Math.min(1, dt * 5);
    b.pitch *= 0.9;
    input.f = 1; input.yaw = b.yaw;
    const speed = Math.hypot(b.v[0], b.v[2]);
    ai.stuck = speed < 1.5 ? ai.stuck + dt : 0;
    if (ai.stuck > 0.4) input.jump = true;
  }
  step(b, input, dt, MAP.boxes);
}

// ---------- networking ----------
const wss = new WebSocketServer({ server, maxPayload: 8 * 1024 });

wss.on('connection', (ws) => {
  let me = null;
  ws.on('message', (data) => {
    let m;
    try { m = JSON.parse(data); } catch { return; }
    if (!m || typeof m.t !== 'string') return;

    if (m.t === 'join' && !me) {
      if (humans().length >= MAX_PLAYERS) { ws.send(JSON.stringify({ t: 'full' })); ws.close(); return; }
      // Make room by removing a bot if the arena is full
      if (players.size >= MAX_PLAYERS) {
        const bot = [...players.values()].find((p) => p.bot);
        if (bot) { players.delete(bot.id); broadcast({ t: 'leave', id: bot.id }); }
      }
      me = newPlayer(cleanName(m.name));
      me.ws = ws;
      send(me, { t: 'welcome', id: me.id, color: me.color, match: { state: match.state, endsAt: match.endsAt }, killLimit: KILL_LIMIT, quick: QUICK_CHAT });
      sendRoster();
      sys(`${me.name} הצטרף/ה לזירה`);
      if (match.state === 'playing') spawn(me);
      return;
    }
    if (!me) return;

    switch (m.t) {
      case 'state': {
        if (!me.alive || !Array.isArray(m.p) || m.p.length !== 3 || !m.p.every(Number.isFinite)) return;
        const now = Date.now();
        const dt = Math.min(0.5, (now - me.lastState) / 1000);
        me.lastState = now;
        // Speed sanity check: horizontal and vertical budgets with generous tolerance
        const dh = Math.hypot(m.p[0] - me.p[0], m.p[2] - me.p[2]);
        const dv = Math.abs(m.p[1] - me.p[1]);
        if (dh > PLAYER.speed * 1.6 * dt + 0.6 || dv > 14 * dt + 0.8) {
          send(me, { t: 'correct', p: me.p });
          return;
        }
        me.p = m.p;
        if (Number.isFinite(m.yaw)) me.yaw = m.yaw;
        if (Number.isFinite(m.pitch)) me.pitch = Math.max(-1.55, Math.min(1.55, m.pitch));
        if (WEAPONS[m.w]) me.weapon = m.w;
        break;
      }
      case 'shoot':
        fire(me, m.w, m.o, m.dirs);
        break;
      case 'reload': {
        const w = WEAPONS[m.w];
        if (!w || !me.alive || Date.now() < me.reloadUntil || me.ammo[m.w] >= w.mag) return;
        me.reloadUntil = Date.now() + w.reload * 1000 * 0.9;
        setTimeout(() => { if (players.has(me.id)) { me.ammo[m.w] = w.mag; send(me, { t: 'ammo', w: m.w, n: w.mag }); } }, w.reload * 1000 * 0.9);
        break;
      }
      case 'ping':
        send(me, { t: 'pong', c: m.c });
        break;
      case 'rtt':
        if (Number.isFinite(m.v)) me.rtt = Math.max(0, Math.min(1000, m.v));
        break;
      case 'chat':
        onChat(me, m.text);
        break;
      case 'quick':
        if (Number.isInteger(m.i) && QUICK_CHAT[m.i]) onChat(me, QUICK_CHAT[m.i], true);
        break;
      case 'report': {
        const target = [...players.values()].find((p) => p.name === String(m.name || ''));
        console.log(`[REPORT] ${me.name} reported ${target ? target.name : m.name}: ${String(m.reason || '').slice(0, 100)}`);
        send(me, { t: 'chat', sys: true, text: 'הדיווח התקבל. תודה ששמרת על הזירה בטוחה!' });
        break;
      }
    }
  });

  ws.on('close', () => {
    if (!me) return;
    players.delete(me.id);
    broadcast({ t: 'leave', id: me.id });
    sys(`${me.name} עזב/ה`);
    sendRoster();
  });
});

function onChat(p, text, quick = false) {
  const now = Date.now();
  if (now < p.mutedUntil) { send(p, { t: 'chat', sys: true, text: 'הצ\'אט שלך מושתק זמנית.' }); return; }
  p.chatTimes = p.chatTimes.filter((t) => now - t < 5000);
  if (p.chatTimes.length >= 4) { send(p, { t: 'chat', sys: true, text: 'לאט לאט 🙂 יותר מדי הודעות.' }); return; }
  p.chatTimes.push(now);
  const { text: clean, flagged } = quick ? { text, flagged: false } : filterChat(text);
  if (!clean) return;
  if (flagged) {
    // Graduated enforcement (GDD §13): warning, then a temporary mute
    p.strikes++;
    if (p.strikes >= 3) { p.mutedUntil = now + 60000; p.strikes = 0; send(p, { t: 'chat', sys: true, text: 'הושתקת לדקה בגלל שפה/מידע אישי.' }); }
    else send(p, { t: 'chat', sys: true, text: `אזהרה ${p.strikes}/3: אין קללות, קישורים או מידע אישי.` });
  }
  broadcast({ t: 'chat', from: p.id, name: p.name, color: p.color, text: clean, quick });
}

// ---------- main loop ----------
let last = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  tick++;

  if (match.state === 'playing' && now >= match.endsAt) endMatch(null);
  if (match.state === 'ended' && now >= match.endsAt) newMatch();
  if (tick % 15 === 0) balanceBots();

  for (const p of players.values()) {
    if (!p.alive) {
      if (match.state === 'playing' && now >= p.respawnAt) spawn(p);
      continue;
    }
    if (p.bot) botThink(p, dt);
    // Health regen after 5 s out of combat
    if (now - p.lastHurt > 5000 && p.hp < PLAYER.maxHp) p.hp = Math.min(PLAYER.maxHp, p.hp + 20 * dt);
    p.history.push({ t: now, p: [p.p[0], p.p[1], p.p[2]] });
    while (p.history.length && now - p.history[0].t > 1000) p.history.shift();
  }

  if (tick % SNAP_EVERY === 0 && players.size) {
    broadcast({
      t: 'snap', now,
      players: [...players.values()].filter((p) => p.alive).map((p) => ({
        id: p.id, p: p.p.map((n) => Math.round(n * 100) / 100), yaw: +p.yaw.toFixed(3), pitch: +p.pitch.toFixed(3), w: p.weapon, hp: Math.ceil(p.hp), sp: now < p.protectUntil ? 1 : 0,
      })),
    });
  }
}, TICK * 1000);

server.listen(PORT, () => console.log(`Arena Rush running on http://localhost:${PORT}`));
