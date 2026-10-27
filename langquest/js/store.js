/* LangQuest — LocalStorage: settings · progress · XP · daily streak · Phrasebook Vault (SRS) */
const LQ_KEY = 'langquest_v1';
// Leitner boxes → days until next review
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

const LQ_DEFAULT = {
  settings: {
    lang: 'en',
    accent: { en: 'en-US', es: 'es-ES' },
    voice: {},          // accentCode → voice name
    slowRate: 0.6,
    translit: true
  },
  xp: 0,
  progress: {},         // lang → station → { lesson, boss, bestVoice, bestBoss }
  grammar: {},          // lang → chapter-2 unit → { done, best }
  streak: { count: 0, best: 0, lastGoalDay: null, today: null, todaySec: 0 },
  vault: {},            // "lang:station:idx" → { box, due, added, reviews }
  // motivation: daily quests, streak freezes, XP per day (weekly league), counters and badges
  engage: { freezes: 0, freezeUsed: null, quests: null, xpDays: {}, counters: {}, badges: {} },
  profile: {
    onboarded: false,
    known: [{ lang: 'he', level: 4 }],   // languages the learner already speaks
    levels: {},                          // target lang → proficiency level (LQData.LEVELS)
    minutes: 5,                          // personal daily goal
    reminder: { enabled: false, times: ['19:00'], days: [0, 1, 2, 3, 4, 5, 6], fired: {} }
  }
};

function dayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function dayDiff(a, b) {
  return Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000);
}

function lqLoad() {
  try {
    const raw = localStorage.getItem(LQ_KEY);
    if (!raw) return structuredClone(LQ_DEFAULT);
    const s = JSON.parse(raw);
    const d = structuredClone(LQ_DEFAULT);
    return {
      ...d,
      ...s,
      settings: { ...d.settings, ...s.settings, accent: { ...d.settings.accent, ...(s.settings || {}).accent } },
      streak: { ...d.streak, ...s.streak },
      engage: { ...d.engage, ...s.engage },
      profile: {
        ...d.profile,
        ...s.profile,
        reminder: { ...d.profile.reminder, ...(s.profile || {}).reminder }
      }
    };
  } catch {
    return structuredClone(LQ_DEFAULT);
  }
}

let lqState = lqLoad();

function lqSave() {
  try { localStorage.setItem(LQ_KEY, JSON.stringify(lqState)); } catch { /* private mode */ }
}

/* ---------- settings ---------- */
function getSettings() { return lqState.settings; }

function setSetting(key, value) {
  lqState.settings[key] = value;
  lqSave();
}

function setAccent(lang, code) {
  lqState.settings.accent[lang] = code;
  lqSave();
}

function setVoice(accentCode, name) {
  lqState.settings.voice[accentCode] = name;
  lqSave();
}

/* ---------- progress ---------- */
function stationProgress(lang, station) {
  return ((lqState.progress[lang] || {})[station]) || { lesson: false, boss: false, bestVoice: 0, bestBoss: 0 };
}

function updateStation(lang, station, patch) {
  lqState.progress[lang] = lqState.progress[lang] || {};
  const prev = stationProgress(lang, station);
  lqState.progress[lang][station] = {
    ...prev,
    ...patch,
    bestVoice: Math.max(prev.bestVoice || 0, patch.bestVoice || 0),
    bestBoss: Math.max(prev.bestBoss || 0, patch.bestBoss || 0),
    lesson: prev.lesson || !!patch.lesson,
    boss: prev.boss || !!patch.boss
  };
  lqSave();
}

function grammarProgress(lang, unit) {
  return ((lqState.grammar || {})[lang] || {})[unit] || { done: false, best: 0 };
}

function updateGrammar(lang, unit, patch) {
  lqState.grammar = lqState.grammar || {};
  lqState.grammar[lang] = lqState.grammar[lang] || {};
  const prev = grammarProgress(lang, unit);
  lqState.grammar[lang][unit] = { done: prev.done || !!patch.done, best: Math.max(prev.best || 0, patch.best || 0) };
  lqSave();
}

function isStationUnlocked(lang, stations, idx) {
  return idx < getPace(lang).unlocked || stationProgress(lang, stations[idx - 1].id).lesson;
}

/* ---------- learner profile & pace ---------- */
function getProfile() { return lqState.profile; }

function updateProfile(patch) {
  lqState.profile = { ...lqState.profile, ...patch };
  lqSave();
}

function setReminder(patch) {
  lqState.profile.reminder = { ...lqState.profile.reminder, ...patch };
  lqSave();
}

function getLevel(lang) {
  const l = lqState.profile.levels[lang];
  return l == null ? null : l;
}

/**
 * Pace for a target language: driven by the learner's level in it, nudged up one notch for
 * absolute beginners who already speak a related language (or any foreign language) well.
 */
function getPace(lang) {
  const level = getLevel(lang) || 0;
  let paceId = Math.min(level, LQData.PACES.length - 1);
  const boost = paceBoost(lang);
  if (paceId === 0 && boost) paceId = 1;
  return { ...LQData.PACES[paceId], level, boost };
}

/** Returns a short reason when the learner's other languages justify a faster start, else null. */
function paceBoost(lang) {
  const fam = LQData.LANG_FAMILY[lang];
  const base = window.LQI18n ? LQI18n.ui() : 'he';   // the learner's own language isn't a "foreign" one
  const strong = lqState.profile.known.filter(k => k.lang !== lang && k.lang !== base && k.level >= 2);
  const related = strong.find(k => (LQData.KNOWN_LANGS.find(x => x.id === k.lang) || {}).family === fam);
  if (related) return { type: 'related', lang: related.lang };
  if (strong.length) return { type: 'multilingual', lang: strong[0].lang };
  return null;
}

/** Set the level for a target language and apply that pace's audio defaults. */
function setLevel(lang, level) {
  lqState.profile.levels[lang] = level;
  const pace = getPace(lang);
  lqState.settings.slowRate = pace.slowRate;
  lqState.settings.translit = pace.translit;
  lqSave();
  return pace;
}

function goalSec() { return (lqState.profile.minutes || 5) * 60; }

function addXp(n) {
  lqState.xp += n;
  const day = dayKey();
  lqState.engage.xpDays[day] = (lqState.engage.xpDays[day] || 0) + n;
  lqSave();
  return lqState.xp;
}

function getXp() { return lqState.xp; }

/* ---------- streak / daily fire ---------- */
function rollDay() {
  const today = dayKey();
  const s = lqState.streak;
  if (s.today !== today) {
    s.today = today;
    s.todaySec = 0;
  }
  // a missed full day breaks the streak — unless streak freezes cover every missed day
  if (s.lastGoalDay && s.count > 0) {
    const missed = dayDiff(s.lastGoalDay, today) - 1;
    if (missed > 0) {
      const e = lqState.engage;
      if (e.freezes >= missed) {
        e.freezes -= missed;
        e.freezeUsed = { day: today, n: missed };
        const y = new Date(); y.setDate(y.getDate() - 1);
        s.lastGoalDay = dayKey(y);
      } else {
        s.count = 0;
      }
      lqSave();
    }
  }
}

/** Add active learning seconds. Returns true the moment today's goal is reached. */
function addActiveSeconds(sec) {
  rollDay();
  const s = lqState.streak;
  const goal = goalSec();
  const before = s.todaySec;
  s.todaySec += sec;
  let reached = false;
  if (before < goal && s.todaySec >= goal && s.lastGoalDay !== s.today) {
    s.count = s.lastGoalDay && dayDiff(s.lastGoalDay, s.today) === 1 ? s.count + 1 : 1;
    s.best = Math.max(s.best, s.count);
    s.lastGoalDay = s.today;
    lqState.xp += 20;
    lqState.engage.xpDays[s.today] = (lqState.engage.xpDays[s.today] || 0) + 20;
    reached = true;
  }
  lqSave();
  return reached;
}

function getStreak() {
  rollDay();
  const s = lqState.streak;
  return {
    count: s.count,
    best: s.best,
    todaySec: s.todaySec,
    goalSec: goalSec(),
    doneToday: s.lastGoalDay === s.today
  };
}

/* ---------- Phrasebook Vault (Leitner spaced repetition) ---------- */
function vaultId(lang, station, idx) { return `${lang}:${station}:${idx}`; }

function inVault(id) { return !!lqState.vault[id]; }

function vaultAdd(id) {
  if (lqState.vault[id]) {
    // struggling again → back to box 0, due now
    lqState.vault[id].box = 0;
    lqState.vault[id].due = dayKey();
  } else {
    lqState.vault[id] = { box: 0, due: dayKey(), added: dayKey(), reviews: 0 };
  }
  lqSave();
}

function vaultRemove(id) {
  delete lqState.vault[id];
  lqSave();
}

function vaultReview(id, knew) {
  const item = lqState.vault[id];
  if (!item) return;
  item.box = knew ? Math.min(item.box + 1, SRS_INTERVALS.length - 1) : 0;
  const due = new Date();
  due.setDate(due.getDate() + Math.max(knew ? 1 : 0, SRS_INTERVALS[item.box]));
  item.due = dayKey(due);
  item.reviews++;
  lqSave();
}

function vaultList(lang) {
  const today = dayKey();
  return Object.entries(lqState.vault)
    .filter(([id]) => !lang || id.startsWith(lang + ':'))
    .map(([id, v]) => ({ id, ...v, isDue: v.due <= today }));
}

/* ---------- engagement state (logic lives in engage.js) ---------- */
function getEngage() { rollDay(); return lqState.engage; }
function saveEngage() { lqSave(); }

function resetAll() {
  lqState = structuredClone(LQ_DEFAULT);
  lqSave();
}

window.LQStore = {
  getSettings, setSetting, setAccent, setVoice,
  stationProgress, updateStation, isStationUnlocked, grammarProgress, updateGrammar,
  getProfile, updateProfile, setReminder, getLevel, setLevel, getPace, dayKey,
  addXp, getXp,
  addActiveSeconds, getStreak,
  vaultId, inVault, vaultAdd, vaultRemove, vaultReview, vaultList,
  getEngage, saveEngage,
  resetAll, SRS_INTERVALS
};
