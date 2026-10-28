// Teen-safe chat filter (GDD §13): profanity, personal info, external links.
// The word list is deliberately short — extend it in one place.
const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'asshole', 'bastard', 'nigger', 'faggot', 'whore', 'slut',
  'זונה', 'בן זונה', 'כוסאמק', 'כוסעמק', 'מניאק', 'שרמוטה', 'זין', 'מזדיין', 'חרא', 'מטומטם', 'אידיוט',
];

const LINK = /\b((https?:\/\/|www\.)\S+|\S+\.(com|net|org|io|gg|co|il|ru|me|xyz|ly)(\/\S*)?)\b/gi;
const EMAIL = /\S+@\S+\.\S+/g;
const PHONE = /(\+?\d[\d\s\-.()]{6,}\d)/g;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const BAD_RE = new RegExp(`(^|[^\\p{L}])(${BAD_WORDS.map(escapeRe).join('|')})(?=$|[^\\p{L}])`, 'giu');

export function filterChat(text) {
  let t = String(text).replace(/[\u0000-\u001f​-‏‪-‮]/g, '').trim().slice(0, 120);
  let flagged = false;
  const mark = (re, rep) => { t = t.replace(re, (...m) => { flagged = true; return typeof rep === 'function' ? rep(...m) : rep; }); };
  mark(EMAIL, '[מידע אישי הוסתר]');
  mark(LINK, '[קישור הוסר]');
  mark(PHONE, '[מידע אישי הוסתר]');
  mark(BAD_RE, (_m, pre, word) => pre + '*'.repeat([...word].length));
  return { text: t, flagged };
}

export function cleanName(name) {
  let n = String(name || '').replace(/[^\p{L}\p{N}_\- ]/gu, '').trim().slice(0, 16);
  if (!n || filterChat(n).flagged) n = 'שחקן' + Math.floor(100 + Math.random() * 900);
  return n;
}

export const QUICK_CHAT = ['עזרה!', 'אויב משמאל!', 'אויב מימין!', 'יפה!', 'משחק טוב!', 'עקבו אחריי!'];
