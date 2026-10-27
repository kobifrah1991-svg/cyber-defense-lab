import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { sign, verifyToken } from '../license-worker.js';

const env = {
  STRIPE_SECRET_KEY: 'sk_test_x',
  LICENSE_SECRET: 'test-secret',
  PRICE_PLANS: JSON.stringify({ price_m: 'monthly', price_l: 'lifetime' }),
  ALLOWED_ORIGINS: 'https://app.example'
};
const now = Math.floor(Date.now() / 1000);

// mock Stripe API
const fixtures = {
  'checkout/sessions/cs_sub_ok': { status: 'complete', mode: 'subscription', customer: 'cus_1', line_items: { data: [{ price: { id: 'price_m' } }] }, subscription: { id: 'sub_1', status: 'active', current_period_end: now + 86400 * 30 } },
  'checkout/sessions/cs_life_ok': { status: 'complete', mode: 'payment', payment_status: 'paid', customer: 'cus_2', line_items: { data: [{ price: { id: 'price_l' } }] } },
  'checkout/sessions/cs_unpaid': { status: 'open', mode: 'payment', payment_status: 'unpaid', line_items: { data: [{ price: { id: 'price_l' } }] } },
  'checkout/sessions/cs_unknown_price': { status: 'complete', mode: 'payment', payment_status: 'paid', line_items: { data: [{ price: { id: 'price_other' } }] } },
  'subscriptions/sub_1': { id: 'sub_1', status: 'active', items: { data: [{ current_period_end: now + 86400 * 60 }] } },
  'subscriptions/sub_dead': { id: 'sub_dead', status: 'canceled' }
};
globalThis.fetch = async (url, opts) => {
  assert.equal(opts.headers.Authorization, 'Bearer sk_test_x');
  const path = url.replace('https://api.stripe.com/v1/', '').split('?')[0];
  const body = fixtures[path];
  return { ok: !!body, status: body ? 200 : 404, json: async () => body };
};

const call = (qs, origin = 'https://app.example') =>
  worker.fetch(new Request('https://w.dev/verify?' + qs, { headers: { Origin: origin } }), env)
    .then(async r => ({ status: r.status, cors: r.headers.get('Access-Control-Allow-Origin'), body: await r.json() }));

test('sign/verify round trip and tamper detection', async () => {
  const t = await sign({ plan: 'yearly', exp: 1 }, 's');
  assert.deepEqual(await verifyToken(t, 's'), { plan: 'yearly', exp: 1 });
  assert.equal(await verifyToken(t, 'other'), null);
  const [b, m] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ plan: 'lifetime', exp: null })).toString('base64url');
  assert.equal(await verifyToken(forged + '.' + m, 's'), null);
  assert.equal(await verifyToken('garbage', 's'), null);
});

test('paid subscription session → monthly license with expiry', async () => {
  const r = await call('session_id=cs_sub_ok');
  assert.equal(r.status, 200);
  assert.equal(r.body.plan, 'monthly');
  assert.ok(r.body.exp > now);
  assert.equal(r.cors, 'https://app.example');
  const payload = await verifyToken(r.body.token, env.LICENSE_SECRET);
  assert.equal(payload.sub, 'sub_1');
});

test('one-time payment → lifetime license, no expiry', async () => {
  const r = await call('session_id=cs_life_ok');
  assert.equal(r.body.plan, 'lifetime');
  assert.equal(r.body.exp, null);
});

test('unpaid, unknown price and malformed sessions are refused', async () => {
  assert.equal((await call('session_id=cs_unpaid')).status, 402);
  assert.equal((await call('session_id=cs_unknown_price')).status, 402);
  assert.equal((await call('session_id=../../charges')).status, 402);
  assert.equal((await call('session_id=cs_missing')).status, 502);
});

test('token refresh: active subscription extends, cancelled one is refused, lifetime stays', async () => {
  const active = await sign({ plan: 'monthly', exp: now + 10, sub: 'sub_1', cus: 'c' }, env.LICENSE_SECRET);
  const r1 = await call('token=' + encodeURIComponent(active));
  assert.equal(r1.status, 200);
  assert.ok(r1.body.exp > now + 86400 * 50);

  const dead = await sign({ plan: 'monthly', exp: now + 10, sub: 'sub_dead', cus: 'c' }, env.LICENSE_SECRET);
  const r2 = await call('token=' + encodeURIComponent(dead));
  assert.equal(r2.status, 402);
  assert.equal(r2.body.error, 'inactive');

  const life = await sign({ plan: 'lifetime', exp: null, cus: 'c' }, env.LICENSE_SECRET);
  assert.equal((await call('token=' + encodeURIComponent(life))).body.plan, 'lifetime');

  const forged = await sign({ plan: 'lifetime', exp: null }, 'not-the-secret');
  assert.equal((await call('token=' + encodeURIComponent(forged))).body.error, 'invalid_token');
});

test('CORS falls back to the first allowed origin for unknown origins; bad routes 404', async () => {
  assert.equal((await call('session_id=cs_life_ok', 'https://evil.example')).cors, 'https://app.example');
  const r = await worker.fetch(new Request('https://w.dev/other'), env);
  assert.equal(r.status, 404);
});
