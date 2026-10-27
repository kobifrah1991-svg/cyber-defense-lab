/* LangQuest license server — Cloudflare Worker (no dependencies)
 *
 *  GET /verify?session_id=cs_…   after Stripe Checkout: confirms payment, returns a signed license key
 *  GET /verify?token=…           re-validates a license key (subscription still active?) and refreshes it
 *  POST /tutor                   AI conversation partner for Premium licenses (see tutor.js)
 *
 *  Secrets / vars (wrangler secret put …):
 *    STRIPE_SECRET_KEY   sk_live_… (or sk_test_…)
 *    LICENSE_SECRET      long random string used to sign license keys (HMAC-SHA256)
 *    PRICE_PLANS         JSON: {"price_123":"monthly","price_456":"yearly","price_789":"lifetime"}
 *    ALLOWED_ORIGINS     comma-separated, e.g. "https://langquest.app,https://localhost"
 *    ANTHROPIC_API_KEY   for the AI tutor (wrangler secret put ANTHROPIC_API_KEY)
 *    TUTOR_KV            optional KV namespace binding → daily message cap (TUTOR_DAILY_LIMIT, default 60)
 *
 *  A license key is base64url(payload).base64url(hmac); payload = { plan, exp, sub?, cus, iat }.
 *  It carries no personal data beyond Stripe's opaque customer/subscription ids.
 */
import { tutorTurn, underDailyCap, makeClient } from './tutor.js';

const enc = new TextEncoder();
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function sign(payload, secret) {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const mac = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body));
  return body + '.' + b64url(mac);
}

export async function verifyToken(token, secret) {
  const [body, mac] = String(token || '').split('.');
  if (!body || !mac) return null;
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64url(mac), enc.encode(body));
  if (!ok) return null;
  try { return JSON.parse(new TextDecoder().decode(fromB64url(body))); } catch { return null; }
}

async function stripe(env, path) {
  const res = await fetch('https://api.stripe.com/v1/' + path, {
    headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY }
  });
  if (!res.ok) throw new Error('stripe_' + res.status);
  return res.json();
}

const ACTIVE = ['active', 'trialing', 'past_due'];

/** License payload from a completed Checkout Session, or null if it was not paid. */
export async function fromSession(env, sessionId) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const s = await stripe(env, `checkout/sessions/${sessionId}?expand[]=line_items&expand[]=subscription`);
  if (s.status !== 'complete') return null;
  const priceId = s.line_items && s.line_items.data[0] && s.line_items.data[0].price.id;
  const plan = JSON.parse(env.PRICE_PLANS || '{}')[priceId];
  if (!plan) return null;
  if (s.mode === 'subscription') {
    const sub = s.subscription;
    if (!sub || !ACTIVE.includes(sub.status)) return null;
    return { plan, exp: periodEnd(sub), sub: sub.id, cus: s.customer };
  }
  if (s.payment_status !== 'paid') return null;
  return { plan, exp: null, cus: s.customer };
}

/** Refresh a license: subscriptions are re-read from Stripe, lifetime licenses stay valid. */
export async function refresh(env, payload) {
  if (!payload.sub) return payload;
  const sub = await stripe(env, `subscriptions/${payload.sub}`);
  if (!ACTIVE.includes(sub.status)) return null;
  return { ...payload, exp: periodEnd(sub) };
}

// newer Stripe API versions moved current_period_end onto subscription items
function periodEnd(sub) {
  return sub.current_period_end || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_end) || null;
}

function cors(env, req) {
  const origin = req.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] || '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}

/** POST /tutor — only for a valid, unexpired license. `deps.client` is injectable for tests. */
export async function handleTutor(req, env, h, deps = {}) {
  let input;
  try { input = await req.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400, h); }
  const lic = await verifyToken(input && input.token, env.LICENSE_SECRET);
  if (!lic) return json({ ok: false, error: 'invalid_token' }, 401, h);
  if (lic.plan !== 'lifetime' && lic.exp && lic.exp * 1000 < Date.now()) return json({ ok: false, error: 'expired' }, 402, h);
  if (!(await underDailyCap(env, lic.sub || lic.cus || 'anon'))) return json({ ok: false, error: 'daily_limit' }, 429, h);
  const { status, body } = await tutorTurn(deps.client || makeClient(env), input);
  return json(body, status, h);
}

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    const url = new URL(req.url);
    if (url.pathname === '/tutor' && req.method === 'POST') {
      try { return await handleTutor(req, env, h); } catch { return json({ ok: false, error: 'server_error' }, 502, h); }
    }
    if (url.pathname !== '/verify' || req.method !== 'GET') return json({ ok: false, error: 'not_found' }, 404, h);
    try {
      let payload;
      if (url.searchParams.has('session_id')) {
        payload = await fromSession(env, url.searchParams.get('session_id'));
        if (!payload) return json({ ok: false, error: 'not_paid' }, 402, h);
      } else if (url.searchParams.has('token')) {
        const prev = await verifyToken(url.searchParams.get('token'), env.LICENSE_SECRET);
        if (!prev) return json({ ok: false, error: 'invalid_token' }, 400, h);
        payload = await refresh(env, prev);
        if (!payload) return json({ ok: false, error: 'inactive' }, 402, h);
      } else {
        return json({ ok: false, error: 'missing_param' }, 400, h);
      }
      payload.iat = Math.floor(Date.now() / 1000);
      const token = await sign(payload, env.LICENSE_SECRET);
      return json({ ok: true, plan: payload.plan, exp: payload.exp, token }, 200, h);
    } catch (e) {
      return json({ ok: false, error: 'server_error' }, 502, h);
    }
  }
};
