/* TedraLingo accounts — Premium on the learner's Firebase account (Cloudflare Worker, no dependencies)
 *
 * The account's entitlement lives in Firestore at tedralingo_entitlements/{uid}:
 *   { premium: bool, plan: 'monthly'|'yearly'|'lifetime', source: 'stripe'|'play', expiresAt: timestamp|null, ref, updatedAt }
 * Only this server writes it (with a Google service account); the rules let a learner read their own document.
 *
 *  verifyIdToken(idToken, env)    → uid of a valid Firebase ID token (signature, audience, issuer, expiry), else null
 *  writeEntitlement(env, uid, e)  → creates / replaces the account's entitlement
 *  activeEntitlement(env, uid)    → the account's entitlement if it is Premium and not expired, else null
 *
 * Vars / secrets:
 *   FIREBASE_PROJECT_ID          e.g. cyberlab-3d
 *   GOOGLE_SERVICE_ACCOUNT       JSON key of a service account with "Cloud Datastore User" on that project (wrangler secret put)
 */
const enc = new TextEncoder();
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const COLLECTION = 'tedralingo_entitlements';

const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const json64 = s => JSON.parse(new TextDecoder().decode(fromB64url(s)));
const RS256 = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

/* ---------- Firebase ID tokens ---------- */
let jwks = { keys: null, until: 0 };

async function publicKey(kid) {
  if (!jwks.keys || Date.now() > jwks.until) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error('jwks_' + res.status);
    const age = /max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '');
    jwks = { keys: (await res.json()).keys || [], until: Date.now() + (age ? +age[1] : 3600) * 1000 };
  }
  const jwk = jwks.keys.find(k => k.kid === kid);
  return jwk ? crypto.subtle.importKey('jwk', jwk, RS256, false, ['verify']) : null;
}

export async function verifyIdToken(idToken, env) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) return null;
  let head, claims;
  try { head = json64(parts[0]); claims = json64(parts[1]); } catch { return null; }
  if (head.alg !== 'RS256' || !head.kid) return null;
  const key = await publicKey(head.kid);
  if (!key) return null;
  const ok = await crypto.subtle.verify(RS256, key, fromB64url(parts[2]), enc.encode(parts[0] + '.' + parts[1]));
  if (!ok) return null;
  const now = Math.floor(Date.now() / 1000);
  const project = env.FIREBASE_PROJECT_ID;
  if (claims.aud !== project || claims.iss !== 'https://securetoken.google.com/' + project) return null;
  if (!(claims.exp > now) || !(claims.iat <= now + 300) || !(claims.auth_time <= now + 300)) return null;
  if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128) return null;
  return claims.sub;
}

/* ---------- Google access token for the service account ---------- */
let access = { token: null, until: 0 };

function pemToPkcs8(pem) {
  return fromB64url(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
}

async function accessToken(env) {
  if (access.token && Date.now() < access.until) return access.token;
  const sa = typeof env.GOOGLE_SERVICE_ACCOUNT === 'string' ? JSON.parse(env.GOOGLE_SERVICE_ACCOUNT) : env.GOOGLE_SERVICE_ACCOUNT;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const body = b64url(enc.encode(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: TOKEN_URL, iat: now, exp: now + 3600
  })));
  const key = await crypto.subtle.importKey('pkcs8', pemToPkcs8(sa.private_key), RS256, false, ['sign']);
  const sig = b64url(await crypto.subtle.sign(RS256, key, enc.encode(head + '.' + body)));
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` })
  });
  if (!res.ok) throw new Error('oauth_' + res.status);
  const t = await res.json();
  access = { token: t.access_token, until: Date.now() + (t.expires_in - 120) * 1000 };
  return access.token;
}

/* ---------- Firestore ---------- */
const ts = sec => ({ timestampValue: new Date(sec * 1000).toISOString() });

export function entitlementFields(e, nowSec = Math.floor(Date.now() / 1000)) {
  return {
    premium: { booleanValue: !!e.premium },
    plan: { stringValue: String(e.plan || '') },
    source: { stringValue: String(e.source || '') },
    expiresAt: e.expiresAt ? ts(e.expiresAt) : { nullValue: null },
    ref: { stringValue: String(e.ref || '') },
    updatedAt: ts(nowSec)
  };
}

export async function writeEntitlement(env, uid, e) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(uid)) throw new Error('bad_uid');
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${uid}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + (await accessToken(env)), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: entitlementFields(e) })
  });
  if (!res.ok) throw new Error('firestore_' + res.status);
  return res.json();
}

export async function activeEntitlement(env, uid) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(uid)) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${COLLECTION}/${uid}`;
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + (await accessToken(env)) } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('firestore_' + res.status);
  const f = (await res.json()).fields || {};
  if (!(f.premium && f.premium.booleanValue === true)) return null;
  const exp = f.expiresAt && f.expiresAt.timestampValue ? Math.floor(Date.parse(f.expiresAt.timestampValue) / 1000) : null;
  if (exp && exp * 1000 < Date.now()) return null;
  return { plan: f.plan ? f.plan.stringValue : '', exp, source: f.source ? f.source.stringValue : '' };
}

/** for tests: forget cached keys and tokens */
export function _reset() { jwks = { keys: null, until: 0 }; access = { token: null, until: 0 }; }
