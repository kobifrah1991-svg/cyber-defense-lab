import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { EntitlementSigner } from '../src/billing/entitlements.js';
import { GooglePlayClient, summarizeSubscription } from '../src/billing/google-play.js';
import { loadConfig } from '../src/config.js';
import { JobManager } from '../src/jobs.js';
import { Ytdlp } from '../src/ytdlp.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FAKE = `${process.execPath} ${path.join(here, 'fixtures', 'fake-ytdlp.js')}`;
const DAY = 24 * 3600 * 1000;
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const credentials = {
  client_email: 'billing@test.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
};

const activeSub = (overrides = {}) => ({
  subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
  acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING',
  lineItems: [{
    productId: 'premium',
    expiryTime: new Date(Date.now() + 7 * DAY).toISOString(),
    offerDetails: { basePlanId: 'monthly', offerId: 'free-trial' },
    autoRenewingPlan: { autoRenewEnabled: true },
    offerPhase: { freeTrial: {} },
  }],
  ...overrides,
});

// Fake Google: OAuth token endpoint + Play Developer API, recording calls.
function fakeGoogle(subscriptions) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || 'GET' });
    const json = (status, body) => new Response(JSON.stringify(body), { status });
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) {
      const assertion = new URLSearchParams(init.body).get('assertion');
      const [h, c, sig] = assertion.split('.');
      assert.ok(verify('RSA-SHA256', Buffer.from(`${h}.${c}`), publicKey, Buffer.from(sig, 'base64url')), 'JWT signature');
      const claims = JSON.parse(Buffer.from(c, 'base64url'));
      assert.equal(claims.iss, credentials.client_email);
      assert.equal(claims.scope, 'https://www.googleapis.com/auth/androidpublisher');
      return json(200, { access_token: 'ya29.test', expires_in: 3600 });
    }
    assert.equal(init.headers.Authorization, 'Bearer ya29.test');
    const token = decodeURIComponent(String(url).match(/tokens\/([^/:]+)/)[1]);
    if (String(url).endsWith(':acknowledge')) return new Response(null, { status: 204 });
    return subscriptions[token] ? json(200, subscriptions[token]) : json(404, { error: 'not found' });
  };
  return { calls, fetchImpl };
}

let tmpRoot;
before(async () => { tmpRoot = await mkdtemp(path.join(os.tmpdir(), 'mdp-billing-')); });
after(() => rm(tmpRoot, { recursive: true, force: true }));

async function start(subscriptions = {}) {
  const config = loadConfig();
  config.billing = { ...config.billing, packageName: 'com.example.mdp', productId: 'premium', freeDownloadsPerDay: 2 };
  const google = fakeGoogle(subscriptions);
  const play = new GooglePlayClient({ packageName: 'com.example.mdp', credentials, fetchImpl: google.fetchImpl });
  const ytdlp = new Ytdlp({ command: FAKE, maxFilesize: 1e6, infoTimeoutMs: 10_000, downloadTimeoutMs: 10_000 });
  const jobs = new JobManager({ ytdlp, hasFfmpeg: true, maxConcurrent: 2, maxQueued: 5, maxActivePerClient: 5, ttlMs: 60_000, tmpRoot });
  const app = createApp({ config, ytdlp, jobs, hasFfmpeg: true, ytdlpVersion: '1', play, signer: new EntitlementSigner('test-secret') });
  const srv = await new Promise(r => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const base = `http://127.0.0.1:${srv.address().port}/api`;
  const call = (p, body, headers = {}) => fetch(`${base}${p}`, body === undefined ? { headers } : {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  });
  const close = async () => { await jobs.close(); srv.close(); };
  return { call, close, google };
}

async function waitDone(call, id, headers) {
  for (let i = 0; i < 100; i += 1) {
    const job = await (await call(`/jobs/${id}`, undefined, headers)).json();
    if (job.status === 'done' || job.status === 'error') return job;
    await new Promise(r => setTimeout(r, 30));
  }
  throw new Error('timeout');
}

test('summarizeSubscription maps Play states to access', () => {
  assert.equal(summarizeSubscription(activeSub(), 'premium').active, true);
  assert.equal(summarizeSubscription(activeSub(), 'premium').isTrial, true);
  assert.equal(summarizeSubscription(activeSub(), 'premium').basePlanId, 'monthly');
  assert.equal(summarizeSubscription(activeSub({ subscriptionState: 'SUBSCRIPTION_STATE_CANCELED' }), 'premium').active, true, 'canceled keeps access until expiry');
  assert.equal(summarizeSubscription(activeSub({ subscriptionState: 'SUBSCRIPTION_STATE_ON_HOLD' }), 'premium').active, false);
  assert.equal(summarizeSubscription(activeSub({ subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED' }), 'premium').active, false);
  assert.equal(summarizeSubscription(activeSub(), 'other_product').active, false);
  const expired = activeSub();
  expired.lineItems[0].expiryTime = new Date(Date.now() - 1000).toISOString();
  assert.equal(summarizeSubscription(expired, 'premium').active, false);
});

test('entitlement tokens are signed, expire and resist tampering', () => {
  const signer = new EntitlementSigner('s3cret');
  const token = signer.sign({ purchaseToken: 'tok', plan: 'monthly', expiresAt: 2000 });
  assert.equal(signer.verify(token, 1000).plan, 'monthly');
  assert.equal(signer.verify(token, 2000), null);
  assert.equal(new EntitlementSigner('other').verify(token, 1000), null);
  const [payload, mac] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ plan: 'yearly', exp: 9e15 })).toString('base64url');
  assert.equal(signer.verify(`${forged}.${mac}`, 1000), null);
  assert.equal(signer.verify(`${payload}`, 1000), null);
  assert.equal(signer.verify(null), null);
});

test('free tier: limited qualities, no audio, daily quota counted on success', async () => {
  const { call, close } = await start();
  const device = { 'X-Device-Id': '6f1c2c8e-1d2b-4c3a-9f00-0123456789ab' };
  try {
    const info = await (await call('/info', { url: 'https://vimeo.com/abc' }, device)).json();
    const locked = Object.fromEntries(info.options.map(o => [o.id, o.locked]));
    assert.deepEqual(locked, { v1080: true, v720: false, v480: false, v360: false, audio: true });
    assert.equal(info.plan.premium, false);
    assert.equal(info.plan.freeLeft, 2);

    for (const option of ['v1080', 'audio']) {
      const res = await call('/jobs', { url: 'https://vimeo.com/abc', option }, device);
      assert.equal(res.status, 402);
      assert.equal((await res.json()).error.code, 'premium_required');
    }

    const failed = await (await call('/jobs', { url: 'https://vimeo.com/huge', option: 'v720' }, device)).json();
    assert.equal((await waitDone(call, failed.id, device)).status, 'error');
    for (let i = 0; i < 2; i += 1) {
      const job = await (await call('/jobs', { url: 'https://vimeo.com/abc', option: 'v720' }, device)).json();
      assert.equal((await waitDone(call, job.id, device)).status, 'done');
    }
    const plan = await (await call('/plan', undefined, device)).json();
    assert.equal(plan.freeLeft, 0, 'the failed download did not count');
    const res = await call('/jobs', { url: 'https://vimeo.com/abc', option: 'v360' }, device);
    assert.equal(res.status, 402);
    assert.equal((await res.json()).error.code, 'quota_exceeded');
  } finally {
    await close();
  }
});

test('verify: active purchase is acknowledged and unlocks Premium', async () => {
  const { call, close, google } = await start({ 'tok.valid-123': activeSub() });
  try {
    const res = await call('/billing/verify', { purchaseToken: 'tok.valid-123', productId: 'premium' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.active, true);
    assert.equal(body.subscription.isTrial, true);
    assert.equal(body.subscription.acknowledged, true);
    assert.ok(body.entitlement.expiresAt <= Date.now() + DAY);
    assert.ok(google.calls.some(c => c.method === 'POST' && c.url.endsWith('/purchases/subscriptions/premium/tokens/tok.valid-123:acknowledge')));
    assert.ok(google.calls.some(c => c.url.includes('/applications/com.example.mdp/purchases/subscriptionsv2/tokens/tok.valid-123')));

    const auth = { Authorization: `Bearer ${body.entitlement.token}` };
    const info = await (await call('/info', { url: 'https://vimeo.com/abc' }, auth)).json();
    assert.ok(info.options.every(o => !o.locked));
    assert.equal(info.plan.premium, true);
    const job = await (await call('/jobs', { url: 'https://vimeo.com/abc', option: 'audio' }, auth)).json();
    assert.equal((await waitDone(call, job.id, auth)).status, 'done');

    const forged = await call('/jobs', { url: 'https://vimeo.com/abc', option: 'audio' }, { Authorization: 'Bearer abc.def' });
    assert.equal(forged.status, 402);
  } finally {
    await close();
  }
});

test('verify: expired, unknown and malformed purchases get no entitlement', async () => {
  const expired = activeSub({ subscriptionState: 'SUBSCRIPTION_STATE_EXPIRED' });
  const { call, close, google } = await start({ 'tok.expired-1': expired });
  try {
    const body = await (await call('/billing/verify', { purchaseToken: 'tok.expired-1', productId: 'premium' })).json();
    assert.equal(body.active, false);
    assert.equal(body.entitlement, null);
    assert.ok(!google.calls.some(c => c.url.endsWith(':acknowledge')), 'expired purchases are not acknowledged');

    assert.equal((await call('/billing/verify', { purchaseToken: 'tok.unknown-1', productId: 'premium' })).status, 400);
    assert.equal((await call('/billing/verify', { purchaseToken: 'bad token!', productId: 'premium' })).status, 400);
    assert.equal((await call('/billing/verify', { purchaseToken: 'tok.expired-1', productId: 'other' })).status, 400);
  } finally {
    await close();
  }
});

test('app clients cannot use YouTube; CORS allows the app origin only', async () => {
  const { call, close } = await start();
  try {
    const app = { 'X-Client': 'android', Origin: 'https://localhost' };
    const res = await call('/info', { url: 'https://youtu.be/abc' }, app);
    assert.equal(res.status, 400);
    assert.match((await res.json()).error.message, /YouTube/);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://localhost');
    assert.equal((await call('/info', { url: 'https://youtu.be/abc' })).status, 200, 'the website still supports YouTube');

    const evil = await call('/plan', undefined, { Origin: 'https://evil.example' });
    assert.equal(evil.headers.get('access-control-allow-origin'), null);
    const pre = await fetch(`${(await call('/health', undefined)).url.replace('/health', '/info')}`, {
      method: 'OPTIONS', headers: { Origin: 'https://localhost', 'Access-Control-Request-Method': 'POST' },
    });
    assert.equal(pre.status, 204);
    assert.match(pre.headers.get('access-control-allow-headers'), /Authorization/);
  } finally {
    await close();
  }
});
