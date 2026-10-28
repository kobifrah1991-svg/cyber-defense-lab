import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { verifyIdToken, entitlementFields, _reset } from '../accounts.js';
import worker, { sign, handleTutor } from '../license-worker.js';

const enc = new TextEncoder();
const b64url = buf => Buffer.from(buf).toString('base64url');
const RS256 = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
const gen = () => crypto.subtle.generateKey({ ...RS256, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ['sign', 'verify']);

// "Google": a Firebase signing key (published as JWKS) and a service-account key
const fb = await gen(), other = await gen(), sa = await gen();
const fbJwk = { ...(await crypto.subtle.exportKey('jwk', fb.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
const saPem = '-----BEGIN PRIVATE KEY-----\n' + Buffer.from(await crypto.subtle.exportKey('pkcs8', sa.privateKey)).toString('base64') + '\n-----END PRIVATE KEY-----\n';

const PROJECT = 'cyberlab-3d';
const now = Math.floor(Date.now() / 1000);
async function idToken(claims = {}, key = fb.privateKey, kid = 'k1') {
  const head = b64url(enc.encode(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' })));
  const body = b64url(enc.encode(JSON.stringify({
    iss: 'https://securetoken.google.com/' + PROJECT, aud: PROJECT, sub: 'uid_123', iat: now - 10, auth_time: now - 10, exp: now + 3600, ...claims
  })));
  return `${head}.${body}.${b64url(await crypto.subtle.sign(RS256, key, enc.encode(head + '.' + body)))}`;
}

const env = {
  FIREBASE_PROJECT_ID: PROJECT,
  GOOGLE_SERVICE_ACCOUNT: JSON.stringify({ client_email: 'tl@cyberlab-3d.iam.gserviceaccount.com', private_key: saPem }),
  LICENSE_SECRET: 'test-secret', STRIPE_SECRET_KEY: 'sk_test_x', ALLOWED_ORIGINS: 'https://tedralingo.web.app'
};

let writes, oauthCalls;
let accountDocs = {};
const subs = { sub_ok: { id: 'sub_ok', status: 'active', current_period_end: now + 86400 * 30 }, sub_dead: { id: 'sub_dead', status: 'canceled' } };
beforeEach(() => {
  _reset(); writes = []; oauthCalls = 0;
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (u.startsWith('https://www.googleapis.com/service_accounts/')) return resp({ keys: [fbJwk] }, 200, { 'Cache-Control': 'public, max-age=20000' });
    if (u === 'https://oauth2.googleapis.com/token') {
      oauthCalls++;
      // the assertion must be a JWT signed by the service account's key
      const assertion = new URLSearchParams(opts.body).get('assertion');
      const [h, b, s] = assertion.split('.');
      const ok = await crypto.subtle.verify(RS256, sa.publicKey, Buffer.from(s, 'base64url'), enc.encode(h + '.' + b));
      const claims = JSON.parse(Buffer.from(b, 'base64url'));
      assert.ok(ok, 'assertion signed with the service account key');
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/datastore');
      return resp({ access_token: 'ya29.test', expires_in: 3600 });
    }
    if (u.startsWith('https://firestore.googleapis.com/') && !opts.method) {
      assert.equal(opts.headers.Authorization, 'Bearer ya29.test');
      const d = accountDocs[u.split('/').pop()];
      return d ? resp({ fields: d }) : resp({ error: 'not found' }, 404);
    }
    if (u.startsWith('https://firestore.googleapis.com/')) {
      assert.equal(opts.method, 'PATCH'); assert.equal(opts.headers.Authorization, 'Bearer ya29.test');
      writes.push({ url: u, body: JSON.parse(opts.body) });
      return resp({ name: 'doc' });
    }
    if (u.startsWith('https://api.stripe.com/v1/subscriptions/')) { const s = subs[u.split('/').pop()]; return resp(s, s ? 200 : 404); }
    throw new Error('unexpected fetch ' + u);
  };
});
function resp(body, status = 200, headers = {}) { return { ok: status < 300, status, headers: new Headers(headers), json: async () => body }; }

test('a genuine Firebase ID token gives its uid; forged, foreign, expired or wrong-project tokens do not', async () => {
  assert.equal(await verifyIdToken(await idToken(), env), 'uid_123');
  assert.equal(await verifyIdToken(await idToken({}, other.privateKey), env), null, 'signed with another key');
  assert.equal(await verifyIdToken(await idToken({}, fb.privateKey, 'unknown'), env), null, 'unknown key id');
  assert.equal(await verifyIdToken(await idToken({ exp: now - 1 }), env), null, 'expired');
  assert.equal(await verifyIdToken(await idToken({ aud: 'other-project' }), env), null, 'other project');
  assert.equal(await verifyIdToken(await idToken({ iss: 'https://evil.example/' + PROJECT }), env), null, 'other issuer');
  assert.equal(await verifyIdToken(await idToken({ sub: '' }), env), null, 'no subject');
  const t = await idToken(); const [h, , s] = t.split('.');
  const tampered = h + '.' + b64url(enc.encode(JSON.stringify({ iss: 'https://securetoken.google.com/' + PROJECT, aud: PROJECT, sub: 'attacker', iat: now, auth_time: now, exp: now + 3600 }))) + '.' + s;
  assert.equal(await verifyIdToken(tampered, env), null, 'payload changed after signing');
  assert.equal(await verifyIdToken('not.a.token', env), null);
});

const link = (body) => worker.fetch(new Request('https://w.dev/link', { method: 'POST', body: JSON.stringify(body), headers: { Origin: 'https://tedralingo.web.app' } }), env);

test('POST /link writes the paid plan onto the account (subscription re-read from Stripe)', async () => {
  const token = await sign({ plan: 'yearly', exp: now + 10, sub: 'sub_ok', cus: 'cus_1' }, env.LICENSE_SECRET);
  const res = await link({ idToken: await idToken(), token });
  const body = await res.json();
  assert.equal(res.status, 200); assert.equal(body.plan, 'yearly'); assert.equal(body.exp, subs.sub_ok.current_period_end);
  assert.equal(writes.length, 1);
  assert.match(writes[0].url, /projects\/cyberlab-3d\/databases\/\(default\)\/documents\/tedralingo_entitlements\/uid_123$/);
  const f = writes[0].body.fields;
  assert.equal(f.premium.booleanValue, true); assert.equal(f.plan.stringValue, 'yearly'); assert.equal(f.source.stringValue, 'stripe');
  assert.equal(f.ref.stringValue, 'sub_ok'); assert.equal(f.expiresAt.timestampValue, new Date(subs.sub_ok.current_period_end * 1000).toISOString());
});

test('lifetime licenses never expire on the account; the access token is reused', async () => {
  const token = await sign({ plan: 'lifetime', exp: null, cus: 'cus_2' }, env.LICENSE_SECRET);
  for (let i = 0; i < 2; i++) assert.equal((await link({ idToken: await idToken(), token })).status, 200);
  assert.deepEqual(writes[0].body.fields.expiresAt, { nullValue: null });
  assert.equal(oauthCalls, 1);
});

test('POST /link refuses: no or bad account, forged license, cancelled subscription — nothing written', async () => {
  const good = await sign({ plan: 'monthly', exp: now + 10, sub: 'sub_ok' }, env.LICENSE_SECRET);
  assert.equal((await link({ token: good })).status, 401);
  assert.equal((await link({ idToken: await idToken({}, other.privateKey), token: good })).status, 401);
  assert.equal((await link({ idToken: await idToken(), token: await sign({ plan: 'lifetime', exp: null }, 'wrong') })).status, 400);
  assert.equal((await link({ idToken: await idToken(), token: await sign({ plan: 'monthly', exp: now, sub: 'sub_dead' }, env.LICENSE_SECRET) })).status, 402);
  assert.equal(writes.length, 0);
});

test('entitlement document shape', () => {
  const f = entitlementFields({ premium: true, plan: 'monthly', source: 'play', expiresAt: 1800000000, ref: 'GPA.1' }, 1700000000);
  assert.deepEqual(Object.keys(f).sort(), ['expiresAt', 'plan', 'premium', 'ref', 'source', 'updatedAt']);
  assert.equal(f.updatedAt.timestampValue, new Date(1700000000 * 1000).toISOString());
});

test('AI tutor: Premium on the account (no device license) is accepted; no or expired entitlement is not', async () => {
  const iso = sec => new Date(sec * 1000).toISOString();
  accountDocs = {
    uid_123: { premium: { booleanValue: true }, plan: { stringValue: 'yearly' }, source: { stringValue: 'play' }, expiresAt: { timestampValue: iso(now + 3600) } },
    uid_old: { premium: { booleanValue: true }, plan: { stringValue: 'monthly' }, source: { stringValue: 'play' }, expiresAt: { timestampValue: iso(now - 60) } }
  };
  const calls = [];
  const client = { beta: { messages: { parse: async p => { calls.push(p); return { stop_reason: 'end_turn', parsed_output: { reply: 'Hola', translation: 'שלום', correction: null, suggestions: [] } }; } } } };
  const ask = async claims => handleTutor(new Request('https://w.dev/tutor', { method: 'POST', body: JSON.stringify({
    idToken: await idToken(claims), target: 'es', base: 'he', level: 1, teacher: { name: 'Lucía', city: 'Madrid', age: 23 }, scenario: 'x', messages: [{ role: 'user', content: 'hola' }] }) }), env, {}, { client });
  assert.equal((await ask({})).status, 200);
  assert.equal((await ask({ sub: 'uid_old' })).status, 402, 'expired subscription');
  assert.equal((await ask({ sub: 'uid_none' })).status, 402, 'no entitlement');
  assert.equal(calls.length, 1, 'the model is called only for the Premium account');
  accountDocs = {};
});
