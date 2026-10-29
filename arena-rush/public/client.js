import * as THREE from 'three';
import { MAP } from './shared/map.js';
import { WEAPONS, WEAPON_ORDER } from './shared/weapons.js';
import { PLAYER, step, rayBox, rayWorld, hitboxes, dirFromAngles } from './shared/physics.js';
import { buildArena, setupLighting, buildCharacter, buildGun, loadCharacters, buildSoldier, soldierReady, animate, loadWeapons, muzzleDistance } from './visuals.js';
import { CHARACTERS, characterById } from './shared/characters.js';
const gunModel = (key, scale) => buildGun(key, WEAPONS[key].color, scale);

const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem('arena.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('arena.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.body.classList.add('touch');

// ======================= renderer & world =======================
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78, 1, 0.05, 300);
const shadows = !isTouch; // phones skip shadow maps to keep 60 fps
setupLighting(scene, renderer, { shadows, mode: store.get('time', 'day') });
buildArena(scene, MAP.boxes, { shadows });

// Viewmodel: rendered in its own pass so guns never clip into walls
const vmScene = new THREE.Scene();
const vmCamera = new THREE.PerspectiveCamera(65, 1, 0.01, 10);
vmScene.add(new THREE.HemisphereLight(0xdfe6ff, 0x3a2a50, 2.2));
const vmLight = new THREE.DirectionalLight(0xffffff, 1);
vmLight.position.set(1, 2, 1);
vmScene.add(vmLight);


const viewGuns = {};
const vmRoot = new THREE.Group();
vmScene.add(vmRoot);
for (const k of WEAPON_ORDER) { viewGuns[k] = gunModel(k); viewGuns[k].visible = false; vmRoot.add(viewGuns[k]); }
const flash = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff2a0, transparent: true, opacity: 0.85 }));
flash.visible = false;
vmScene.add(flash);
const flashLight = new THREE.PointLight(0xffd27a, 0, 8);
scene.add(flashLight);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = vmCamera.aspect = w / h;
  camera.updateProjectionMatrix();
  vmCamera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ======================= audio (synthesised, no assets) =======================
let actx = null, noise = null;
function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  noise = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
const SHOT_SOUND = { rifle: [2200, 0.12, 120], shotgun: [900, 0.3, 70], sniper: [1500, 0.45, 55], pistol: [2800, 0.1, 160] };
function shotSound(w, vol = 1) {
  if (!actx || vol < 0.02) return;
  const [freq, dur, thump] = SHOT_SOUND[w] || SHOT_SOUND.rifle;
  const t = actx.currentTime;
  const src = actx.createBufferSource(); src.buffer = noise;
  const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(200, t + dur);
  const g = actx.createGain(); g.gain.setValueAtTime(0.5 * vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(actx.destination);
  src.start(t, Math.random() * 0.5, dur + 0.05);
  const o = actx.createOscillator(); o.frequency.setValueAtTime(thump, t); o.frequency.exponentialRampToValueAtTime(30, t + dur * 0.8);
  const og = actx.createGain(); og.gain.setValueAtTime(0.6 * vol, t); og.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);
  o.connect(og).connect(actx.destination); o.start(t); o.stop(t + dur);
}
function blip(freq, dur = 0.08, type = 'square', vol = 0.15, delay = 0) {
  if (!actx) return;
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
}
const sfx = {
  hit: () => blip(1400, 0.05, 'square', 0.12),
  head: () => { blip(1900, 0.06, 'square', 0.14); blip(2500, 0.08, 'square', 0.12, 0.05); },
  kill: () => { blip(660, 0.12, 'triangle', 0.25); blip(990, 0.15, 'triangle', 0.25, 0.08); blip(1320, 0.25, 'triangle', 0.25, 0.16); },
  hurt: () => blip(140, 0.15, 'sawtooth', 0.25),
  reload: () => { blip(500, 0.04, 'square', 0.08); blip(700, 0.04, 'square', 0.08, 0.25); },
  empty: () => blip(300, 0.03, 'square', 0.08),
  chat: () => blip(880, 0.05, 'sine', 0.06),
};
function say(text) {
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 1.1; u.pitch = 0.8; speechSynthesis.speak(u); } catch { /* unsupported */ }
}
function vibrate(ms) { if (store.get('vibrate', true) && navigator.vibrate) navigator.vibrate(ms); }

// ======================= game state =======================
const me = {
  id: null, color: 0xffffff, p: [0, 0, 0], v: [0, 0, 0], onGround: true, yaw: 0, pitch: 0,
  alive: false, hp: 100, weapon: 'rifle', ammo: {}, reloadUntil: 0, lastShot: 0, ads: false,
  kills: 0, deaths: 0, heads: 0, streak: 0,
};
for (const k of WEAPON_ORDER) me.ammo[k] = WEAPONS[k].mag;
const remotes = new Map(); // id -> {group, buf, name, ...}
let roster = [];
let matchInfo = { state: 'playing', endsAt: 0 };
let killLimit = 25;
let quickChat = [];
const muted = new Set();
let ws = null;
let sens = store.get('sens', 1);
const keys = new Set();
let mouseDown = false;
let chatOpen = false, quickOpen = false;
let recoil = 0, bob = 0, shake = 0;
let lastHurtFrom = null, deathUntil = 0;
const touchMove = { f: 0, s: 0 };
let wantJump = false;

// ======================= remote players =======================
function nameSprite(text, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.font = 'bold 30px Rubik, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(0, 8, 256, 48);
  x.fillStyle = '#' + color.toString(16).padStart(6, '0'); x.fillText(text, 128, 33);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  s.scale.set(1.6, 0.4, 1);
  s.renderOrder = 10;
  return s;
}

let charSeed = 0;
// Realistic soldiers and weapon models replace the simple fallbacks as soon as they load
const modelUrl = (file) => (window.ARENA_MODELS?.[file]) || './models/' + file;
function rebuildModels() {
  for (const [id, r] of remotes) {
    scene.remove(r.group);
    remotes.set(id, makeRemote({ id, name: r.name, color: r.color, bot: r.bot, character: r.character }));
  }
}
loadCharacters(CHARACTERS, modelUrl).then(() => { rebuildModels(); refreshPreview(); }).catch((e) => console.warn('Soldier model unavailable, using simple characters', e));
loadWeapons((file) => modelUrl('weapons/' + file)).then(() => {
  for (const k of WEAPON_ORDER) {
    vmRoot.remove(viewGuns[k]);
    viewGuns[k] = gunModel(k);
    viewGuns[k].visible = k === me.weapon;
    vmRoot.add(viewGuns[k]);
  }
  rebuildModels();
}).catch((e) => console.warn('Weapon models unavailable, using simple guns', e));
function makeRemote(info) {
  const c = soldierReady() ? buildSoldier(info.color, charSeed++, info.character) : buildCharacter(info.color, charSeed++);
  const g = c.root;
  const guns = {};
  for (const k of WEAPON_ORDER) { guns[k] = gunModel(k, 1); guns[k].visible = false; c.gunMount.add(guns[k]); }
  const tag = nameSprite(info.name, info.color); tag.position.y = 2.3;
  const shield = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.18, depthWrite: false }));
  shield.position.y = 0.9; shield.visible = false;
  g.add(tag, shield);
  g.visible = false;
  scene.add(g);
  return { id: info.id, name: info.name, color: info.color, bot: info.bot, character: info.character, group: g, char: c, headPivot: c.neck, arm: c.aim, guns, tag, shield, buf: [], cur: null, weapon: null, lastSeen: 0, lastPos: null };
}

function syncRoster(list) {
  roster = list;
  for (const info of list) {
    if (info.id === me.id) { me.kills = info.kills; me.deaths = info.deaths; continue; }
    const r = remotes.get(info.id);
    if (!r) remotes.set(info.id, makeRemote(info));
  }
  for (const [id, r] of remotes) if (!list.find((p) => p.id === id)) { scene.remove(r.group); remotes.delete(id); }
  updateScoreboard();
}
const nameOf = (id) => (id === me.id ? 'את/ה' : roster.find((p) => p.id === id)?.name || '???');
const colorOf = (id) => '#' + ((id === me.id ? me.color : roster.find((p) => p.id === id)?.color) ?? 0xffffff).toString(16).padStart(6, '0');

const INTERP = 100; // ms behind the newest snapshot
let dtFrame = 0;
function updateRemotes(now, dt) {
  dtFrame = dt;
  const t = now - INTERP;
  for (const r of remotes.values()) {
    const b = r.buf;
    while (b.length > 2 && b[1].t <= t) b.shift();
    if (!b.length || now - r.lastSeen > 400) { r.group.visible = false; r.cur = null; continue; }
    let s;
    if (b.length >= 2 && b[0].t <= t) {
      const k = Math.min(1, (t - b[0].t) / Math.max(1, b[1].t - b[0].t));
      s = { p: b[0].p.map((v, i) => v + (b[1].p[i] - v) * k), yaw: lerpAngle(b[0].yaw, b[1].yaw, k), pitch: b[0].pitch + (b[1].pitch - b[0].pitch) * k };
    } else s = b[0];
    r.cur = s;
    r.group.visible = true;
    const speed = r.lastPos && dtFrame > 0 ? Math.hypot(s.p[0] - r.lastPos[0], s.p[2] - r.lastPos[2]) / dtFrame : 0;
    r.lastPos = s.p;
    r.speed = (r.speed || 0) + (speed - (r.speed || 0)) * 0.2;
    animate(r.char, r.speed, now / 1000, dtFrame);
    r.group.position.set(s.p[0], s.p[1], s.p[2]);
    r.group.rotation.y = s.yaw;
    r.headPivot.rotation.x = s.pitch * 0.6;
    r.arm.rotation.x = s.pitch;
    const w = b[b.length - 1].w;
    if (w !== r.weapon) { for (const k in r.guns) r.guns[k].visible = k === w; r.weapon = w; }
    r.shield.visible = !!b[b.length - 1].sp;
  }
}
function lerpAngle(a, b, k) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

// ======================= effects =======================
const tracers = [];
function tracer(from, to, color = 0xfff59d) {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from), new THREE.Vector3(...to)]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  scene.add(line);
  tracers.push({ obj: line, life: 0.08, max: 0.08 });
}
const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
function sparks(at, color = 0xffd54f, n = 6) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
    m.position.set(...at);
    scene.add(m);
    tracers.push({ obj: m, life: 0.35, max: 0.35, vel: [(Math.random() - 0.5) * 6, Math.random() * 5, (Math.random() - 0.5) * 6] });
  }
}
function updateEffects(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    const e = tracers[i];
    e.life -= dt;
    if (e.vel) { e.vel[1] -= 15 * dt; e.obj.position.x += e.vel[0] * dt; e.obj.position.y += e.vel[1] * dt; e.obj.position.z += e.vel[2] * dt; }
    e.obj.material.opacity = Math.max(0, e.life / e.max);
    if (e.life <= 0) { scene.remove(e.obj); e.obj.geometry !== sparkGeo && e.obj.geometry.dispose(); e.obj.material.dispose(); tracers.splice(i, 1); }
  }
}

const dmgNums = [];
function damageNumber(at, text, cls) {
  const el = document.createElement('div');
  el.className = 'dmg ' + (cls || '');
  el.textContent = text;
  $('dmg-numbers').appendChild(el);
  dmgNums.push({ el, pos: new THREE.Vector3(at[0], at[1] + 0.3, at[2]), life: 0.9, dx: (Math.random() - 0.5) * 40 });
}
function updateDamageNumbers(dt) {
  const v = new THREE.Vector3();
  for (let i = dmgNums.length - 1; i >= 0; i--) {
    const d = dmgNums[i];
    d.life -= dt;
    if (d.life <= 0) { d.el.remove(); dmgNums.splice(i, 1); continue; }
    v.copy(d.pos).project(camera);
    const behind = v.z > 1;
    const x = (v.x * 0.5 + 0.5) * innerWidth + d.dx * (0.9 - d.life);
    const y = (-v.y * 0.5 + 0.5) * innerHeight - (0.9 - d.life) * 60;
    d.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 + d.life * 0.3})`;
    d.el.style.left = d.el.style.top = '0';
    d.el.style.opacity = behind ? 0 : Math.min(1, d.life * 2);
  }
}

let hitTimer = 0;
function hitMarker(kind) {
  const h = $('hitmarker');
  h.className = 'on ' + kind;
  clearTimeout(hitTimer);
  hitTimer = setTimeout(() => (h.className = kind), 90);
}
function announce(text) {
  const a = $('announce');
  a.textContent = text;
  a.classList.remove('show'); void a.offsetWidth; a.classList.add('show');
}
function centerMsg(text, ms = 2000) {
  const c = $('center-msg');
  c.textContent = text;
  clearTimeout(c._t);
  c._t = setTimeout(() => (c.textContent = ''), ms);
}
function killFeed(killer, victim, w, head) {
  const el = document.createElement('div');
  el.className = 'kf' + (killer === me.id || victim === me.id ? ' me' : '');
  const k = document.createElement('b'); k.style.color = colorOf(killer); k.textContent = nameOf(killer);
  const ws_ = document.createElement('span'); ws_.className = 'w'; ws_.textContent = `[${WEAPONS[w]?.name || w}]${head ? ' 🎯' : ''}`;
  const v = document.createElement('b'); v.style.color = colorOf(victim); v.textContent = nameOf(victim);
  el.append(k, ws_, v);
  const feed = $('killfeed');
  feed.prepend(el);
  while (feed.children.length > 5) feed.lastChild.remove();
  setTimeout(() => el.remove(), 6000);
}

// ======================= HUD =======================
function updateWeaponHud() {
  const w = WEAPONS[me.weapon];
  $('weapon-name').textContent = w.name;
  $('mag').textContent = performance.now() < me.reloadUntil ? '…' : me.ammo[me.weapon];
  $('mag').classList.toggle('empty', me.ammo[me.weapon] === 0);
  $('mag-max').textContent = w.mag;
  $('weapon-slots').innerHTML = '';
  for (const k of WEAPON_ORDER) {
    const s = document.createElement('span');
    s.textContent = WEAPONS[k].key + ' ' + WEAPONS[k].name;
    if (k === me.weapon) s.className = 'on';
    $('weapon-slots').appendChild(s);
  }
}
function updateHp(hp) {
  me.hp = hp;
  $('hp-text').textContent = Math.ceil(hp);
  $('hp-fill').style.width = Math.max(0, hp) + '%';
  $('hp-fill').classList.toggle('low', hp < 35);
}
function updateScoreboard() {
  const sorted = [...roster].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  const tb = $('scoreboard').querySelector('tbody');
  tb.innerHTML = '';
  for (const p of sorted) tb.appendChild(boardRow(p, [p.kills, p.deaths, p.bot ? 'BOT' : p.ping]));
  const lead = sorted[0];
  $('leader').textContent = lead ? `מוביל/ה: ${lead.name} (${lead.kills}/${killLimit})` : '';
}
function boardRow(p, cols, rank) {
  const tr = document.createElement('tr');
  if (p.id === me.id) tr.className = 'me';
  if (rank !== undefined) { const td = document.createElement('td'); td.textContent = rank; tr.appendChild(td); }
  const td = document.createElement('td');
  const dot = document.createElement('span'); dot.className = 'dot'; dot.style.background = '#' + p.color.toString(16).padStart(6, '0');
  td.append(dot, document.createTextNode(p.name + (muted.has(p.id) ? ' 🔇' : '')));
  tr.appendChild(td);
  for (const c of cols) { const t = document.createElement('td'); t.textContent = c; tr.appendChild(t); }
  return tr;
}

// ======================= chat =======================
function addChat({ name, color, text, sys, quick, from }) {
  if (from && muted.has(from)) return;
  const el = document.createElement('div');
  if (sys) { el.className = 'sys'; el.textContent = text; }
  else {
    if (quick) el.className = 'quick';
    const b = document.createElement('b');
    b.style.color = '#' + (color ?? 0xffffff).toString(16).padStart(6, '0');
    b.textContent = name + ':';
    el.append(b, document.createTextNode(' ' + text));
    if (from !== me.id) sfx.chat();
  }
  const log = $('chat-log');
  log.appendChild(el);
  while (log.children.length > 40) log.firstChild.remove();
  setTimeout(() => el.classList.add('faded'), 10000);
}

function openChat() {
  if (chatOpen) return;
  chatOpen = true; quickOpen = false;
  $('quick-menu').classList.add('hidden');
  $('chat').classList.add('open');
  const inp = $('chat-input');
  inp.classList.remove('hidden');
  keys.clear(); mouseDown = false;
  if (document.pointerLockElement) document.exitPointerLock();
  setTimeout(() => inp.focus(), 0);
}
function closeChat(send) {
  const inp = $('chat-input');
  const text = inp.value.trim();
  inp.value = '';
  inp.classList.add('hidden');
  inp.blur();
  $('chat').classList.remove('open');
  chatOpen = false;
  if (send && text) handleChatText(text);
  if (!isTouch) lockPointer();
}
function handleChatText(text) {
  if (text.startsWith('/')) {
    const [cmd, name, ...rest] = text.slice(1).split(' ');
    const target = roster.find((p) => p.name === name);
    if (cmd === 'mute' || cmd === 'unmute') {
      if (!target) return addChat({ sys: true, text: 'לא נמצא שחקן בשם הזה.' });
      cmd === 'mute' ? muted.add(target.id) : muted.delete(target.id);
      updateScoreboard();
      return addChat({ sys: true, text: cmd === 'mute' ? `${target.name} הושתק/ה אצלך.` : `${target.name} כבר לא מושתק/ת.` });
    }
    if (cmd === 'report') {
      if (!target) return addChat({ sys: true, text: 'לא נמצא שחקן בשם הזה.' });
      return net({ t: 'report', name: target.name, reason: rest.join(' ') });
    }
    if (cmd === 'invite') return net({ t: 'invite', email: name || '' });
    if (cmd === 'room') return addChat({ sys: true, text: roomCode ? `קוד החדר: ${roomCode}` : 'אימון מקומי (בלי חדר).' });
    return addChat({ sys: true, text: 'פקודות: /invite gmail · /room · /mute שם · /unmute שם · /report שם סיבה' });
  }
  net({ t: 'chat', text });
}
function toggleQuick() {
  quickOpen = !quickOpen;
  const q = $('quick-menu');
  q.classList.toggle('hidden', !quickOpen);
  if (quickOpen) {
    q.innerHTML = '';
    quickChat.forEach((text, i) => {
      const d = document.createElement('div');
      const k = document.createElement('kbd'); k.textContent = i + 1;
      d.append(k, document.createTextNode(text));
      d.addEventListener('pointerdown', (e) => { e.stopPropagation(); sendQuick(i); });
      q.appendChild(d);
    });
  }
}
function sendQuick(i) { net({ t: 'quick', i }); quickOpen = false; $('quick-menu').classList.add('hidden'); }

$('chat-input').addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') closeChat(true);
  if (e.key === 'Escape') closeChat(false);
});

// ======================= combat (client side) =======================
function switchWeapon(k) {
  if (!WEAPONS[k] || k === me.weapon) return;
  me.weapon = k;
  me.reloadUntil = 0;
  me.lastShot = performance.now() - 200; // short equip delay
  for (const g in viewGuns) viewGuns[g].visible = g === k;
  updateWeaponHud();
}
function cycleWeapon(dir) {
  const i = WEAPON_ORDER.indexOf(me.weapon);
  switchWeapon(WEAPON_ORDER[(i + dir + WEAPON_ORDER.length) % WEAPON_ORDER.length]);
}
function reload() {
  const w = WEAPONS[me.weapon];
  if (!me.alive || performance.now() < me.reloadUntil || me.ammo[me.weapon] >= w.mag) return;
  me.reloadUntil = performance.now() + w.reload * 1000;
  const k = me.weapon;
  net({ t: 'reload', w: k });
  sfx.reload();
  setTimeout(() => { if (me.weapon === k && me.reloadUntil) { me.ammo[k] = w.mag; me.reloadUntil = 0; updateWeaponHud(); } }, w.reload * 1000);
  updateWeaponHud();
}

let semiReady = true;
function tryFire(now) {
  const w = WEAPONS[me.weapon];
  if (!me.alive || chatOpen || matchInfo.state !== 'playing') return;
  if (now < me.reloadUntil || now - me.lastShot < w.rate * 1000) return;
  if (!w.auto && !semiReady) return;
  if (me.ammo[me.weapon] <= 0) { if (semiReady) sfx.empty(); semiReady = false; reload(); return; }
  semiReady = false;
  me.lastShot = now;
  me.ammo[me.weapon]--;

  const moving = Math.hypot(me.v[0], me.v[2]) > 1;
  let spread = me.ads ? w.adsSpread : w.spread;
  if (moving) spread += w.spread * 0.4;
  if (!me.onGround) spread += w.spread;
  if (me.weapon === 'sniper' && !me.ads) spread = Math.max(spread, 0.06);
  const o = [me.p[0], me.p[1] + PLAYER.eye, me.p[2]];
  const dirs = [];
  for (let i = 0; i < w.pellets; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * spread;
    dirs.push(dirFromAngles(me.yaw + Math.cos(a) * r, me.pitch + Math.sin(a) * r));
  }
  net({ t: 'shoot', w: me.weapon, o, dirs });

  // Local visuals only — damage is decided by the server
  const muzzle = muzzleWorld();
  for (const d of dirs) {
    let dist = rayWorld(o, d, MAP.boxes, w.range), hitPlayer = false;
    for (const r of remotes.values()) {
      if (!r.cur) continue;
      const hb = hitboxes(r.cur.p);
      for (const box of [hb.head, hb.body]) {
        const t = rayBox(o, d, box[0], box[1], dist);
        if (t !== null && t < dist) { dist = t; hitPlayer = true; }
      }
    }
    const end = [o[0] + d[0] * dist, o[1] + d[1] * dist, o[2] + d[2] * dist];
    tracer(muzzle, end, w.color);
    if (dist < w.range) sparks(end, hitPlayer ? 0xff1744 : 0xffd54f, hitPlayer ? 4 : 5);
  }
  shotSound(me.weapon, 1);
  recoil += w.recoil * 6;
  me.pitch = Math.min(1.5, me.pitch + w.recoil * (me.ads ? 0.5 : 1));
  me.yaw += (Math.random() - 0.5) * w.recoil * 0.5;
  shake = Math.min(0.6, shake + w.recoil * 3);
  flash.visible = true;
  flashLight.intensity = 6;
  flashLight.position.set(...muzzle);
  setTimeout(() => { flash.visible = false; flashLight.intensity = 0; }, 45);
  vibrate(me.weapon === 'shotgun' || me.weapon === 'sniper' ? 30 : 10);
  updateWeaponHud();
  if (me.ammo[me.weapon] === 0) setTimeout(reload, 250);
}
function muzzleWorld() {
  const fwd = dirFromAngles(me.yaw, me.pitch);
  const right = [Math.cos(me.yaw), 0, -Math.sin(me.yaw)];
  return [me.p[0] + fwd[0] * 0.8 + right[0] * 0.2, me.p[1] + PLAYER.eye - 0.18 + fwd[1] * 0.8, me.p[2] + fwd[2] * 0.8 + right[2] * 0.2];
}

// ======================= networking =======================
function net(msg) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); }
let rtt = 80;

// Offline practice: runs the match simulation in this tab instead of on a server.
class LocalSocket {
  constructor() {
    this.readyState = 0;
    import('./shared/game.js').then((game) => {
      const toClient = { readyState: 1, send: (s) => setTimeout(() => this.onmessage?.({ data: s }), 0), close() {} };
      const match = game.createGame();
      match.start();
      this.conn = match.connect(toClient);
      this.readyState = 1;
      this.onopen?.();
    });
  }
  send(s) { this.conn?.message(s); }
  close() {}
}

let pinger = null;
let roomCode = null;
// action: { t: 'quick' } | { t: 'create' } | { t: 'joinCode', code }
function connect(name, action = { t: 'quick' }, offline = offlineOnly || !!selectedServer()?.offline) {
  let opened = false;
  lobby = { name, action, offline };
  ws = offline ? new LocalSocket() : new WebSocket(wsUrl(selectedServer()));
  $('menu-status').textContent = offline ? 'מכין זירת אימון…' : 'מתחבר לשרת…';
  ws.onopen = () => {
    opened = true;
    // Online: sign in (or as a guest), pick a room, then join it. Offline: join the local match directly.
    if (offline) net({ t: 'join', name, character: selectedChar });
    else net({ t: 'auth', credential: googleCredential });
  };
  ws.onerror = () => {
    // No server reachable: fall back to practice against bots in the browser
    if (!opened) { $('menu-status').textContent = 'אין שרת, עובר לאימון נגד בוטים…'; connect(name, action, true); }
  };
  ws.onclose = () => {
    if (me.id && !offline) { addChat({ sys: true, text: 'החיבור לשרת נותק. מרענן…' }); setTimeout(() => location.reload(), 2500); }
  };
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  clearInterval(pinger);
  pinger = setInterval(() => net({ t: 'ping', c: performance.now() }), 2000);
}

function onMessage(m) {
  const now = performance.now();
  switch (m.t) {
    case 'authed':
      if (m.user) { googleUser = m.user; showAccount(); }
      net(lobby.action);
      break;
    case 'room':
      roomCode = m.code;
      $('scoreboard').querySelector('h2').textContent = `טבלת ניקוד · חדר ${m.code}`;
      net({ t: 'join', name: lobby.name, character: selectedChar });
      break;
    case 'lobbyError':
      $('menu-status').textContent = m.text;
      $('play').disabled = false;
      ws.close();
      break;
    case 'invited': showInvite(m.from, m.code); break;
    case 'welcome':
      me.id = m.id; me.color = m.color;
      matchInfo = m.match; killLimit = m.killLimit; quickChat = m.quick;
      $('menu').classList.add('hidden');
      $('hud').classList.remove('hidden');
      if (isTouch) $('touch').classList.remove('hidden'); else lockPointer();
      addChat({ sys: true, text: `ברוכים הבאים ל-${MAP.name}! Enter לצ'אט, B להודעות מהירות.` });
      break;
    case 'full':
      $('menu-status').textContent = 'הזירה מלאה. נסו שוב בעוד רגע.';
      $('play').disabled = false;
      break;
    case 'roster': syncRoster(m.players); break;
    case 'snap':
      for (const s of m.players) {
        if (s.id === me.id) { updateHp(s.hp); continue; }
        const r = remotes.get(s.id);
        if (!r) continue;
        r.buf.push({ t: now, p: s.p, yaw: s.yaw, pitch: s.pitch, w: s.w, sp: s.sp });
        r.lastSeen = now;
      }
      break;
    case 'spawn':
      me.p = m.p.slice(); me.v = [0, 0, 0]; me.yaw = m.yaw; me.pitch = 0;
      me.alive = true; me.streak = 0; me.reloadUntil = 0;
      Object.assign(me.ammo, m.ammo);
      updateHp(100);
      $('death').classList.add('hidden');
      $('streak').textContent = '';
      switchWeapon(me.weapon); for (const g in viewGuns) viewGuns[g].visible = g === me.weapon;
      updateWeaponHud();
      break;
    case 'correct': me.p = m.p.slice(); me.v = [0, 0, 0]; break;
    case 'ammo': me.ammo[m.w] = m.n; updateWeaponHud(); break;
    case 'pong': rtt = rtt * 0.7 + (now - m.c) * 0.3; net({ t: 'rtt', v: rtt }); break;
    case 'shot': {
      const r = remotes.get(m.id);
      const from = r?.cur ? [r.cur.p[0], r.cur.p[1] + 1.3, r.cur.p[2]] : m.o;
      for (const e of m.ends) { tracer(from, e, WEAPONS[m.w]?.color); if (!e[3]) sparks(e, 0xffd54f, 3); }
      const dist = Math.hypot(m.o[0] - me.p[0], m.o[1] - me.p[1], m.o[2] - me.p[2]);
      shotSound(m.w, Math.min(0.8, 6 / (dist + 3)));
      break;
    }
    case 'hit': {
      hitMarker(m.kill ? 'kill' : m.head ? 'head' : '');
      if (m.at) damageNumber(m.at, m.dmg, m.kill ? 'kill' : m.head ? 'head' : '');
      m.kill ? null : m.head ? sfx.head() : sfx.hit();
      break;
    }
    case 'hurt': {
      updateHp(m.hp);
      lastHurtFrom = m.from;
      sfx.hurt();
      vibrate(40);
      shake = Math.min(0.8, shake + 0.3);
      const v = $('vignette'); v.style.transition = 'none'; v.style.opacity = 1; void v.offsetWidth; v.style.transition = ''; v.style.opacity = me.hp < 35 ? 0.5 : 0;
      showDamageDir(m.from);
      break;
    }
    case 'kill': onKillMsg(m); break;
    case 'leave': { const r = remotes.get(m.id); if (r) { scene.remove(r.group); remotes.delete(m.id); } break; }
    case 'chat': addChat(m); break;
    case 'match': onMatch(m); break;
  }
}

function showDamageDir(from) {
  if (!from) return;
  const dx = from[0] - me.p[0], dz = from[2] - me.p[2];
  const ang = Math.atan2(-dx, -dz) - me.yaw;
  const el = $('damage-dir');
  el.style.transform = `rotate(${-ang}rad)`;
  el.style.transition = 'none'; el.style.opacity = 1; void el.offsetWidth; el.style.transition = ''; el.style.opacity = 0;
}

function onKillMsg(m) {
  killFeed(m.killer, m.victim, m.w, m.head);
  if (m.killer === me.id) {
    me.streak = m.streak;
    if (m.head) me.heads++;
    sfx.kill();
    vibrate([30, 40, 60]);
    centerMsg(`חיסלת את ${nameOf(m.victim)}${m.head ? ' · ירייה בראש! 🎯' : ''}`, 1800);
    $('streak').textContent = me.streak >= 2 ? `🔥 רצף ${me.streak}` : '';
    if (m.streakName) { announce(m.streakName); say(m.streakName.toLowerCase()); }
  }
  if (m.victim === me.id) {
    me.alive = false;
    me.ads = false;
    deathUntil = performance.now() + 3000;
    $('death').classList.remove('hidden');
    $('death-by').textContent = `חוסלת על ידי ${nameOf(m.killer)}${m.head ? ' (ירייה בראש)' : ''}`;
    lastHurtFrom = m.killer;
    $('streak').textContent = '';
  }
}

function onMatch(m) {
  matchInfo = m;
  if (m.state === 'ended') {
    keys.clear(); mouseDown = false;
    if (document.pointerLockElement) document.exitPointerLock();
    const won = m.winner === me.id;
    $('end-title').textContent = won ? '🏆 ניצחת!' : `🏆 ${m.winnerName || ''} ניצח/ה!`;
    const tb = $('end-board').querySelector('tbody');
    tb.innerHTML = '';
    m.board.forEach((p, i) => tb.appendChild(boardRow(p, [p.kills, p.deaths], i + 1)));
    awardXp(won);
    $('end').classList.remove('hidden');
    const tick = () => {
      const s = Math.max(0, Math.ceil((m.next - Date.now()) / 1000));
      $('end-next').textContent = `סבב הבא בעוד ${s} שניות…`;
      if (matchInfo.state === 'ended') setTimeout(tick, 500);
    };
    tick();
  } else {
    $('end').classList.add('hidden');
    me.heads = 0;
    if (!isTouch) lockPointer();
  }
}

// Local progression (GDD §9–10): XP bar and "one more game" goal
function awardXp(won) {
  const prof = store.get('profile', { xp: 0, level: 1 });
  const gained = me.kills * 100 + me.heads * 50 + (won ? 500 : 100);
  prof.xp += gained;
  const need = (lvl) => 1000 + (lvl - 1) * 250;
  let leveled = false;
  while (prof.xp >= need(prof.level)) { prof.xp -= need(prof.level); prof.level++; leveled = true; }
  store.set('profile', prof);
  $('xp-line').textContent = `+${gained} XP · רמה ${prof.level}${leveled ? ' 🎉 עלית רמה!' : ''}`;
  $('xp-fill').style.width = '0';
  setTimeout(() => ($('xp-fill').style.width = Math.round((prof.xp / need(prof.level)) * 100) + '%'), 50);
  const left = need(prof.level) - prof.xp;
  $('next-goal').textContent = `עוד ${Math.ceil(left / 100)} הריגות לרמה ${prof.level + 1}. רק עוד משחק אחד? 😉`;
  if (leveled) { sfx.kill(); announce('LEVEL UP'); }
  showProfile();
}
function showProfile() {
  const prof = store.get('profile', { xp: 0, level: 1 });
  $('profile').textContent = `רמה ${prof.level} · ${prof.xp} XP`;
}

// ======================= input =======================
function lockPointer() {
  if (!isTouch && me.id && !chatOpen && matchInfo.state === 'playing') canvas.requestPointerLock?.();
}
document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === canvas;
  $('pause').classList.toggle('hidden', locked || chatOpen || !me.id || matchInfo.state !== 'playing' || isTouch);
  if (!locked) { mouseDown = false; me.ads = false; }
});
$('pause').addEventListener('click', () => { initAudio(); lockPointer(); });
canvas.addEventListener('click', () => { if (!isTouch) lockPointer(); });

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  const k = 0.0022 * sens * (me.ads ? camera.fov / 78 : 1);
  me.yaw -= e.movementX * k;
  me.pitch = Math.max(-1.5, Math.min(1.5, me.pitch - e.movementY * k));
});
document.addEventListener('mousedown', (e) => {
  if (document.pointerLockElement !== canvas) return;
  if (e.button === 0) mouseDown = true;
  if (e.button === 2) me.ads = true;
});
document.addEventListener('mouseup', (e) => {
  if (e.button === 0) { mouseDown = false; semiReady = true; }
  if (e.button === 2) me.ads = false;
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('wheel', (e) => { if (document.pointerLockElement === canvas) cycleWeapon(e.deltaY > 0 ? 1 : -1); });

document.addEventListener('keydown', (e) => {
  if (!me.id || chatOpen) return;
  if (e.code === 'Tab') { e.preventDefault(); $('scoreboard').classList.remove('hidden'); return; }
  if (e.code === 'Enter' || e.code === 'KeyT') { e.preventDefault(); openChat(); return; }
  if (e.code === 'KeyB') { toggleQuick(); return; }
  if (quickOpen && /^Digit[1-6]$/.test(e.code)) { sendQuick(Number(e.code.slice(5)) - 1); return; }
  if (e.code === 'Escape' && quickOpen) { toggleQuick(); return; }
  const slot = WEAPON_ORDER.find((k) => 'Digit' + WEAPONS[k].key === e.code);
  if (slot) { switchWeapon(slot); return; }
  if (e.code === 'KeyR') reload();
  if (e.code === 'KeyQ') cycleWeapon(1);
  keys.add(e.code);
});
document.addEventListener('keyup', (e) => {
  keys.delete(e.code);
  if (e.code === 'Tab') $('scoreboard').classList.add('hidden');
});
addEventListener('blur', () => { keys.clear(); mouseDown = false; });

// ---- touch ----
function setupTouch() {
  const stick = $('stick'), knob = $('stick-knob');
  let stickId = null, lookId = null, lx = 0, ly = 0;
  stick.addEventListener('touchstart', (e) => { e.preventDefault(); stickId = e.changedTouches[0].identifier; });
  addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === stickId) {
        const r = stick.getBoundingClientRect();
        let dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2);
        const l = Math.hypot(dx, dy), max = r.width / 2;
        if (l > max) { dx *= max / l; dy *= max / l; }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        touchMove.s = dx / max; touchMove.f = -dy / max;
      } else if (t.identifier === lookId) {
        const k = 0.005 * sens * (me.ads ? camera.fov / 78 : 1);
        me.yaw -= (t.clientX - lx) * k;
        me.pitch = Math.max(-1.5, Math.min(1.5, me.pitch - (t.clientY - ly) * k));
        lx = t.clientX; ly = t.clientY;
      }
    }
  }, { passive: false });
  canvas.addEventListener('touchstart', (e) => {
    initAudio();
    for (const t of e.changedTouches) if (lookId === null && t.clientX > innerWidth * 0.35) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; }
  });
  const end = (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === stickId) { stickId = null; touchMove.f = touchMove.s = 0; knob.style.transform = ''; }
      if (t.identifier === lookId) lookId = null;
    }
  };
  addEventListener('touchend', end);
  addEventListener('touchcancel', end);
  const hold = (id, down, up) => {
    const b = $(id);
    b.addEventListener('touchstart', (e) => { e.preventDefault(); initAudio(); down(); });
    if (up) b.addEventListener('touchend', (e) => { e.preventDefault(); up(); });
  };
  // The fire button also steers the camera while held
  const fire = $('t-fire');
  fire.addEventListener('touchstart', (e) => { e.preventDefault(); mouseDown = true; if (lookId === null) { const t = e.changedTouches[0]; lookId = t.identifier; lx = t.clientX; ly = t.clientY; } });
  fire.addEventListener('touchend', (e) => { e.preventDefault(); mouseDown = false; semiReady = true; });
  hold('t-ads', () => (me.ads = !me.ads));
  hold('t-jump', () => (wantJump = true));
  hold('t-reload', reload);
  hold('t-swap', () => cycleWeapon(1));
  hold('t-chat', () => (chatOpen ? closeChat(true) : openChat()));
  hold('t-quick', toggleQuick);
  hold('t-score', () => $('scoreboard').classList.toggle('hidden'));
}
if (isTouch) setupTouch();

// ======================= menu =======================
$('name').value = store.get('name', '');
$('sens').value = sens;
$('sens').addEventListener('input', (e) => { sens = Number(e.target.value); store.set('sens', sens); });
$('time').value = store.get('time', 'day');
$('time').addEventListener('change', (e) => { store.set('time', e.target.value); location.reload(); });
showProfile();
const offlineOnly = !!window.ARENA_OFFLINE || location.protocol === 'file:';
let lobby = null, googleCredential = null, googleUser = null;
try { googleCredential = sessionStorage.getItem('arena.gcred'); } catch { /* storage blocked */ }
function startOnline(action) {
  initAudio();
  const name = $('name').value.trim();
  store.set('name', name);
  for (const id of ['play', 'create', 'join-code']) $(id).disabled = true;
  if (isTouch) document.documentElement.requestFullscreen?.().catch(() => {});
  connect(name, action);
}
$('play').addEventListener('click', () => startOnline({ t: 'quick' }));
$('create').addEventListener('click', () => startOnline({ t: 'create' }));
$('join-code').addEventListener('click', () => {
  const code = $('code').value.trim().toUpperCase();
  if (code.length !== 5) { $('menu-status').textContent = 'קוד חדר הוא 5 תווים.'; return; }
  startOnline({ t: 'joinCode', code });
});

// Invitations from friends (by Gmail) and invite links (?room=CODE)
function showInvite(from, code) {
  const box = $('invite');
  box.querySelector('span').textContent = `${from} מזמין/ה אותך לחדר ${code}`;
  box.classList.remove('hidden');
  box.querySelector('.yes').onclick = () => { location.href = location.pathname + '?room=' + code; };
  box.querySelector('.no').onclick = () => box.classList.add('hidden');
}
const roomFromLink = new URLSearchParams(location.search).get('room');
if (roomFromLink) { $('code').value = roomFromLink.toUpperCase(); $('menu-status').textContent = 'הוזמנת לחדר! לחצו "הצטרף".'; }

// Google sign-in (only when the server has a Google client ID configured)
function showAccount() {
  if (!googleUser) return;
  $('account').textContent = `מחובר/ת כ-${googleUser.name} (${googleUser.email})`;
  $('gsi').classList.add('hidden');
  if (!$('name').value) $('name').value = googleUser.name;
}
let googleReadyFor = null;
function setupGoogle(clientId) {
  if (!clientId || googleUser || googleReadyFor === clientId) { if (!clientId) $('gsi').replaceChildren(); return; }
  googleReadyFor = clientId;
  const render = () => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        googleCredential = resp.credential;
        try { sessionStorage.setItem('arena.gcred', resp.credential); } catch { /* storage blocked */ }
        // Show the name straight away; the server verifies the token when we connect
        try { const p = JSON.parse(atob(resp.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); googleUser = { name: p.given_name || p.name, email: p.email }; showAccount(); } catch { /* ignore */ }
      },
    });
    google.accounts.id.renderButton($('gsi'), { theme: 'filled_black', size: 'large', text: 'signin_with', locale: 'he' });
  };
  if (window.google?.accounts) return render();
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.onload = render;
  document.head.appendChild(s);
}

// ---------- server list ----------
// public/servers.json lists online servers ({ name, region, url }); url "" means the server hosting this page.
const LOCAL_SERVER = { id: 'device', name: 'אימון במכשיר', region: 'נגד בוטים · בלי אינטרנט', offline: true };
let servers = [LOCAL_SERVER];
const serverState = new Map(); // id -> { ping, online, rooms, googleClientId, down }
let selectedServerId = store.get('server', null);
function selectedServer() { return servers.find((sv) => sv.id === selectedServerId) || servers[servers.length - 1]; }
function httpBase(sv) { return sv.url ? sv.url.replace(/\/$/, '') : ''; }
function wsUrl(sv) {
  if (sv?.url) return sv.url.replace(/^http/, 'ws').replace(/\/$/, '');
  return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
}

function renderServers() {
  const list = $('servers');
  list.replaceChildren();
  const current = selectedServer();
  for (const sv of servers) {
    const st = serverState.get(sv.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'server';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(sv === current));
    const dot = document.createElement('span');
    dot.className = 'dot ' + (sv.offline ? 'ok' : !st ? '' : st.down ? 'down' : st.ping > 150 ? 'slow' : 'ok');
    const info = document.createElement('span');
    const title = document.createElement('b'); title.textContent = sv.name;
    const sub = document.createElement('small'); sub.textContent = sv.region || '';
    info.append(title, sub);
    const meta = document.createElement('span');
    meta.className = 'meta';
    if (sv.offline) meta.textContent = 'offline';
    else if (!st) meta.textContent = '…';
    else if (st.down) meta.textContent = 'לא זמין';
    else {
      const ping = document.createElement('strong'); ping.textContent = st.ping + ' ms';
      meta.append(ping, document.createTextNode(`${st.online} online`));
    }
    btn.append(dot, info, meta);
    btn.addEventListener('click', () => { selectedServerId = sv.id; store.set('server', sv.id); renderServers(); });
    list.appendChild(btn);
  }
  // Online-only controls follow the selected server
  const online = !current.offline;
  document.querySelectorAll('.online-only').forEach((el) => el.classList.toggle('hidden', !online));
  $('play').textContent = online ? 'משחק מהיר' : 'התחל אימון';
  const st = serverState.get(current.id);
  $('online-count').textContent = online && st && !st.down ? `${st.online} מחוברים · ${st.rooms} חדרים בשרת הזה` : '';
  if (online && st && !st.down) setupGoogle(st.googleClientId);
  else $('gsi').replaceChildren();
}

async function pingServer(sv) {
  const t0 = performance.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(httpBase(sv) + '/config', { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timer);
    const cfg = await r.json();
    serverState.set(sv.id, { ping: Math.round(performance.now() - t0), online: cfg.online, rooms: cfg.rooms, googleClientId: cfg.googleClientId });
  } catch {
    serverState.set(sv.id, { down: true });
  }
  renderServers();
}

async function loadServers() {
  if (!offlineOnly) {
    let list = [{ name: 'השרת הזה', region: 'אוטומטי', url: '' }];
    try {
      const r = await fetch('servers.json', { cache: 'no-store' });
      if (r.ok) list = await r.json();
    } catch { /* keep the default */ }
    servers = [LOCAL_SERVER, ...list.map((sv, i) => ({ id: sv.id || 'srv' + i, ...sv }))];
    if (!selectedServerId || !servers.some((sv) => sv.id === selectedServerId)) selectedServerId = servers[1]?.id || LOCAL_SERVER.id;
  } else {
    selectedServerId = LOCAL_SERVER.id;
  }
  renderServers();
  servers.filter((sv) => !sv.offline).forEach(pingServer);
}
loadServers();
$('servers-refresh').addEventListener('click', () => { serverState.clear(); renderServers(); servers.filter((sv) => !sv.offline).forEach(pingServer); });

// ---------- character select with a live 3D preview ----------
let selectedChar = characterById(store.get('character', CHARACTERS[0].id)).id;
const preview = { renderer: null, scene: null, camera: null, model: null, yaw: 0.5, dragging: false, lastX: 0 };

function initPreview() {
  const c = $('char-preview');
  preview.renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
  preview.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  preview.renderer.outputColorSpace = THREE.SRGBColorSpace;
  preview.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  preview.scene = new THREE.Scene();
  preview.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x302040, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(2, 3, -3); preview.scene.add(key);
  const rim = new THREE.DirectionalLight(0xff2e88, 2); rim.position.set(-3, 2, 2); preview.scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.15 }));
  floor.rotation.x = -Math.PI / 2; preview.scene.add(floor);
  preview.camera = new THREE.PerspectiveCamera(32, 480 / 560, 0.1, 20);
  preview.camera.position.set(0, 1.25, -3.9);
  preview.camera.lookAt(0, 0.95, 0);
  c.addEventListener('pointerdown', (e) => { preview.dragging = true; preview.lastX = e.clientX; c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', (e) => { if (preview.dragging) { preview.yaw += (e.clientX - preview.lastX) * 0.01; preview.lastX = e.clientX; } });
  c.addEventListener('pointerup', () => { preview.dragging = false; });
}

function refreshPreview() {
  if (!preview.scene) return;
  if (preview.model) preview.scene.remove(preview.model.root);
  const color = 0xff2e88;
  const m = soldierReady() ? buildSoldier(color, 1, selectedChar) : buildCharacter(color, 1);
  m.gunMount.add(gunModel('rifle', 1));
  preview.model = m;
  preview.scene.add(m.root);
  const def = characterById(selectedChar);
  $('char-name').textContent = def.name;
  $('char-role').textContent = def.role;
  document.querySelectorAll('.char-card').forEach((el) => el.setAttribute('aria-checked', String(el.dataset.id === selectedChar)));
}

function chooseChar(id) {
  selectedChar = characterById(id).id;
  store.set('character', selectedChar);
  refreshPreview();
}
function stepChar(dir) {
  const i = CHARACTERS.findIndex((c) => c.id === selectedChar);
  chooseChar(CHARACTERS[(i + dir + CHARACTERS.length) % CHARACTERS.length].id);
}

for (const def of CHARACTERS) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'char-card';
  b.dataset.id = def.id;
  b.setAttribute('role', 'radio');
  b.textContent = def.name;
  b.addEventListener('click', () => chooseChar(def.id));
  $('char-list').appendChild(b);
}
$('char-list').setAttribute('role', 'radiogroup');
$('char-prev').addEventListener('click', () => stepChar(-1));
$('char-next').addEventListener('click', () => stepChar(1));
initPreview();
refreshPreview();

let previewLast = performance.now();
function previewFrame(now) {
  if ($('menu').classList.contains('hidden')) return; // stop once the game starts
  requestAnimationFrame(previewFrame);
  const dt = Math.min(0.05, (now - previewLast) / 1000);
  previewLast = now;
  if (!preview.dragging) preview.yaw += dt * 0.4;
  if (preview.model) {
    preview.model.root.rotation.y = preview.yaw;
    animate(preview.model, 0, now / 1000, dt);
  }
  preview.renderer.render(preview.scene, preview.camera);
}
requestAnimationFrame(previewFrame);
$('name').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('play').click(); });

// ======================= main loop =======================
let lastFrame = performance.now(), lastSend = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  if (me.alive && matchInfo.state === 'playing') {
    let f = 0, s = 0;
    if (!chatOpen) {
      if (keys.has('KeyW') || keys.has('ArrowUp')) f += 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) f -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) s += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) s -= 1;
    }
    f += touchMove.f; s += touchMove.s;
    step(me, { f, s, jump: keys.has('Space') || wantJump, yaw: me.yaw, ads: me.ads }, dt, MAP.boxes);
    wantJump = false;
    if (mouseDown) tryFire(now);
    const speed = Math.hypot(me.v[0], me.v[2]);
    bob += dt * speed * 1.6 * (me.onGround ? 1 : 0);
    if (now - lastSend > 50) {
      lastSend = now;
      net({ t: 'state', p: me.p.map((n) => Math.round(n * 1000) / 1000), yaw: me.yaw, pitch: me.pitch, w: me.weapon });
    }
  }

  // Camera
  recoil *= Math.pow(0.0005, dt);
  shake *= Math.pow(0.002, dt);
  const sniperScoped = me.ads && me.weapon === 'sniper' && me.alive;
  const targetFov = me.ads && me.alive ? WEAPONS[me.weapon].adsFov : 78;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 14);
  camera.updateProjectionMatrix();
  if (me.alive) {
    camera.position.set(me.p[0], me.p[1] + PLAYER.eye + Math.sin(bob * 2) * 0.03, me.p[2]);
    camera.rotation.set(me.pitch + (Math.random() - 0.5) * shake * 0.02, me.yaw + (Math.random() - 0.5) * shake * 0.02, 0, 'YXZ');
  } else if (me.id) {
    // Death cam: rise up and look at the killer
    camera.position.y += (me.p[1] + 4 - camera.position.y) * Math.min(1, dt * 2);
    const killer = remotes.get(lastHurtFrom);
    if (killer?.cur) camera.lookAt(killer.cur.p[0], killer.cur.p[1] + 1, killer.cur.p[2]);
    $('death-count').textContent = `חוזר/ת לקרב בעוד ${Math.max(0, Math.ceil((deathUntil - now) / 1000))}…`;
  }

  // Viewmodel sway, bob, recoil, reload dip
  const reloading = now < me.reloadUntil;
  const adsK = me.ads ? 1 : 0;
  vmRoot.position.set(
    0.22 * (1 - adsK) + Math.sin(bob) * 0.012 * (1 - adsK * 0.8),
    -0.2 + adsK * 0.07 + Math.abs(Math.cos(bob)) * 0.01 - (reloading ? 0.15 : 0),
    -0.45 + recoil * 0.25,
  );
  vmRoot.rotation.set(recoil * 0.6 + (reloading ? -0.6 : 0), 0, 0);
  vmRoot.visible = me.alive && !sniperScoped;
  flash.position.set(vmRoot.position.x, vmRoot.position.y + 0.03, vmRoot.position.z - muzzleDistance(me.weapon));
  $('scope').classList.toggle('hidden', !sniperScoped);
  $('crosshair').classList.toggle('hidden', sniperScoped || (me.ads && me.weapon !== 'shotgun'));
  const spreadPx = 5 + (Math.hypot(me.v[0], me.v[2]) > 1 ? 6 : 0) + (me.onGround ? 0 : 8) + recoil * 40;
  $('crosshair').style.setProperty('--gap', spreadPx + 'px');

  // Timer
  if (matchInfo.state === 'playing' && matchInfo.endsAt) {
    const left = Math.max(0, Math.ceil((matchInfo.endsAt - Date.now()) / 1000));
    $('timer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }
  if (reloading) $('mag').textContent = '…';

  updateRemotes(now, dt);
  updateEffects(dt);
  updateDamageNumbers(dt);

  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(vmScene, vmCamera);
}
for (const g in viewGuns) viewGuns[g].visible = g === me.weapon;
updateWeaponHud();
requestAnimationFrame(frame);
