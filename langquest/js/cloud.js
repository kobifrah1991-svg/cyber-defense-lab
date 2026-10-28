/* TedraLingo — cloud save: sign in with Google, and the learner's place (stage, lessons, grammar units, XP,
 * streak, phrasebook) is kept in one owner-only Firestore document tedralingo/{uid} and synced across devices.
 * Web: Google popup (redirect as fallback). Android app: Google blocks sign-in inside app WebViews, so the
 * system browser opens auth.html on the web version, which hands the Google ID token back through the
 * app.scitedra.tedralingo:// deep link; the app then signs in to Firebase with that credential.
 * Offline: changes stay on the device and are pushed when the connection is back.
 */
import { initializeApp } from './vendor/firebase/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential, signOut, onAuthStateChanged } from './vendor/firebase/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from './vendor/firebase/firebase-firestore.js';

const cfg = window.LQ_FIREBASE_CONFIG;
const C = window.LQ_CLOUD || {};
const { merge, same } = window.LQCloudMerge;
const { t } = LQI18n;
const PENDING = 'tedralingo_cloud_pending';
const MAX = 200000; // characters — matches firestore.rules
const native = LQNative.isNative;

let auth = null, db = null, user = null;
let state = 'off'; // off · out · saving · saved · pending · error
let note = '';
let merged = false; // first full merge done for this user
let timer = 0;
let stopEntitlement = null;

/* ---------- Premium on the account: tedralingo_entitlements/{uid}, written by the license server ---------- */
const seconds = t => (t && typeof t.toMillis === 'function' ? Math.floor(t.toMillis() / 1000) : typeof t === 'number' ? t : null);

function watchEntitlement(u) {
  if (stopEntitlement) { stopEntitlement(); stopEntitlement = null; }
  if (!u) { LQCommerce.setAccountEntitlement(null, null); return; }
  stopEntitlement = onSnapshot(doc(db, 'tedralingo_entitlements', u.uid), snap => {
    const d = snap.exists() ? snap.data() : null;
    LQCommerce.setAccountEntitlement(u.uid, d && { premium: d.premium === true, plan: d.plan, source: d.source, expiresAt: seconds(d.expiresAt) });
  }, () => { /* offline or not allowed yet — keep the cached entitlement */ });
}

/** A license bought or restored on this device goes onto the signed-in account. */
async function linkLicense() {
  if (!user || !LQCommerce.license()) return;
  try { await LQCommerce.linkToAccount(await user.getIdToken()); } catch { /* server not configured / offline — the device license still works */ }
}

function setPending(on) { try { on ? localStorage.setItem(PENDING, '1') : localStorage.removeItem(PENDING); } catch { /* private mode */ } }
function changed() { document.dispatchEvent(new CustomEvent('lq:cloud', { detail: { state } })); }

function fail(e) {
  const c = (e && e.code) || '';
  state = 'error';
  note = c.includes('permission-denied') ? t('cloud.denied')
    : c.includes('unauthorized-domain') ? t('cloud.domain')
    : c.includes('popup-closed') || c.includes('cancelled') ? '' : t('cloud.error');
  if (c.includes('unavailable') || !navigator.onLine) { state = 'pending'; setPending(true); }
  if (!user && state === 'error' && !note) state = 'out';
  changed();
}

/** Full sync: read the cloud copy, merge it with this device, write the result to both. */
async function sync() {
  if (!user) return;
  const uid = user.uid;
  if (!navigator.onLine) { state = 'pending'; setPending(true); changed(); return; }
  state = 'saving'; changed();
  try {
    const ref = doc(db, C.collection, uid);
    const snap = await getDoc(ref);
    let remote = null;
    if (snap.exists()) { try { remote = LQStore.normalize(JSON.parse(snap.data().save)); } catch { remote = null; } }
    const cur = LQStore.exportState();
    const m = remote ? merge(cur, remote) : cur;
    if (!user || user.uid !== uid) return;
    if (!same(m, cur)) {
      LQStore.applyCloud(m);
      if (!merged && remote) LQUI.toast(t('cloud.restored'), 3200);
      document.dispatchEvent(new Event('lq:state'));
    }
    merged = true;
    await push(ref, m);
  } catch (e) { fail(e); }
}

async function push(ref, s) {
  const save = JSON.stringify(s);
  if (save.length > MAX) throw Object.assign(new Error('too large'), { code: 'too-large' });
  await setDoc(ref, { schema: 1, save, updatedAt: serverTimestamp() });
  setPending(false);
  state = 'saved'; note = ''; changed();
}

/** After every local change: push (debounced). The first time per session it is a full merge. */
function queue() {
  if (!user) return;
  setPending(true);
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!merged) return sync();
    if (!navigator.onLine) { state = 'pending'; changed(); return; }
    state = 'saving'; changed();
    push(doc(db, C.collection, user.uid), LQStore.exportState()).catch(fail);
  }, 2000);
}

async function login(select) {
  note = '';
  if (native) return nativeLogin(select);
  const p = new GoogleAuthProvider();
  if (select) p.setCustomParameters({ prompt: 'select_account' });
  try { await signInWithPopup(auth, p); } catch (e) {
    const c = (e && e.code) || '';
    if (/popup-blocked|operation-not-supported|web-storage-unsupported/.test(c)) {
      try { await signInWithRedirect(auth, p); return; } catch (e2) { fail(e2); return; }
    }
    fail(e);
  }
}

/* ---------- Android app: sign in through the system browser ---------- */
function nativeLogin(select) {
  const url = `${C.web}/auth.html?app=1&lang=${LQI18n.ui()}${select ? '&select=1' : ''}`;
  LQNative.openExternal(url);
  LQUI.toast(t('cloud.browser'), 3200);
}

async function onDeepLink(url) {
  if (!url || !url.startsWith(C.scheme + '://auth')) return;
  const browser = LQNative.plugin('Browser');
  if (browser) browser.close().catch(() => {});
  const params = new URLSearchParams((url.split('#')[1] || url.split('?')[1] || ''));
  const idt = params.get('idt');
  if (!idt) return fail({ code: params.get('error') || 'cancelled' });
  try { await signInWithCredential(auth, GoogleAuthProvider.credential(idt)); } catch (e) { fail(e); }
}

async function logout() {
  try { await signOut(auth); } catch (e) { fail(e); return; }
  state = 'out'; note = ''; merged = false; changed();
}

async function switchUser() {
  try { await signOut(auth); } catch { /* signing in again anyway */ }
  merged = false;
  login(true);
}

/* ---------- UI: a box for settings / the map ---------- */
function render(host) {
  if (!host) return;
  const esc = LQUI.esc;
  if (state === 'off') { host.innerHTML = `<p class="muted small">${esc(t('cloud.off'))}</p>`; return; }
  if (!user) {
    host.innerHTML = `
      <p class="muted small">${esc(t('cloud.sub'))}</p>
      <button class="btn google" data-cloud="in"><span class="g-logo" aria-hidden="true">G</span> ${esc(t('cloud.signIn'))}</button>
      ${native ? `<small class="muted">${esc(t('cloud.browser'))}</small>` : ''}
      ${note ? `<p class="note warn small">${esc(note)}</p>` : ''}`;
  } else {
    const st = { saved: t('cloud.saved'), saving: t('cloud.saving'), pending: t('cloud.pending') }[state] || note || t('cloud.error');
    host.innerHTML = `
      <div class="cloud-user">
        ${user.photoURL ? `<img src="${esc(user.photoURL)}" alt="" width="36" height="36" referrerpolicy="no-referrer">` : '<span class="g-logo">G</span>'}
        <div><b><bdi>${esc(user.displayName || user.email || 'Google')}</bdi></b><small class="${state === 'saved' ? 'ok' : 'muted'}">${esc(st)}</small></div>
      </div>
      <div class="row"><button class="btn ghost sm" data-cloud="switch">${esc(t('cloud.switch'))}</button><button class="btn ghost sm" data-cloud="out">${esc(t('cloud.signOut'))}</button></div>`;
  }
  const on = (k, fn) => { const b = host.querySelector(`[data-cloud=${k}]`); if (b) b.onclick = fn; };
  on('in', () => login(false));
  on('switch', switchUser);
  on('out', logout);
}

/* ---------- start ---------- */
const webOk = /^https?:$/.test(location.protocol);
if (cfg && (native || webOk)) {
  try {
    const app = initializeApp(cfg);
    auth = getAuth(app);
    db = getFirestore(app);
    auth.languageCode = LQI18n.ui();
    state = 'out';
    if (!native) getRedirectResult(auth).catch(fail);
    onAuthStateChanged(auth, u => {
      user = u;
      merged = false;
      state = u ? 'saving' : 'out';
      changed();
      watchEntitlement(u);
      if (u) { sync(); linkLicense(); }
    });
    document.addEventListener('lq:license', linkLicense);
    LQStore.onSave = queue;
    addEventListener('online', () => { if (user) sync(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && user) sync(); });
    if (native) {
      const App = LQNative.plugin('App');
      if (App) {
        App.addListener('appUrlOpen', e => onDeepLink(e && e.url));
        if (App.getLaunchUrl) App.getLaunchUrl().then(r => r && onDeepLink(r.url)).catch(() => {});
      }
    }
  } catch { auth = null; state = 'off'; }
}

window.LQCloud = {
  render, login, logout, sync,
  idToken: async () => (user ? user.getIdToken() : ''),
  get state() { return state; },
  get user() { return user ? { uid: user.uid, name: user.displayName, email: user.email } : null; },
  _deepLink: onDeepLink
};
changed();
