import { sign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

// Subscription states that still grant access (CANCELED = auto-renew turned off, paid period not over yet).
const ENTITLED_STATES = new Set([
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  'SUBSCRIPTION_STATE_CANCELED',
]);

export class BillingError extends Error {
  constructor(code, message, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const b64url = data => Buffer.from(data).toString('base64url');

export function loadServiceAccount({ file, json }) {
  const raw = json || (file ? readFileSync(file, 'utf8') : '');
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON is missing client_email or private_key');
  }
  return parsed;
}

// Minimal Google Play Developer API client: service-account OAuth, read and acknowledge subscriptions.
export class GooglePlayClient {
  constructor({ packageName, credentials, fetchImpl = fetch, now = () => Date.now() }) {
    this.packageName = packageName;
    this.credentials = credentials;
    this.fetch = fetchImpl;
    this.now = now;
    this.token = null;
  }

  async accessToken() {
    if (this.token && this.token.expiresAt - 60_000 > this.now()) return this.token.value;

    const iat = Math.floor(this.now() / 1000);
    const tokenUri = this.credentials.token_uri || 'https://oauth2.googleapis.com/token';
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claims = b64url(JSON.stringify({
      iss: this.credentials.client_email,
      scope: SCOPE,
      aud: tokenUri,
      iat,
      exp: iat + 3600,
    }));
    const signature = sign('RSA-SHA256', Buffer.from(`${header}.${claims}`), this.credentials.private_key).toString('base64url');

    const res = await this.fetch(tokenUri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${header}.${claims}.${signature}`,
      }),
    });
    if (!res.ok) {
      throw new BillingError('billing_auth', `Google OAuth failed (${res.status})`, 503);
    }
    const body = await res.json();
    this.token = { value: body.access_token, expiresAt: this.now() + (body.expires_in || 3600) * 1000 };
    return this.token.value;
  }

  async call(method, url) {
    const res = await this.fetch(url, {
      method,
      headers: { Authorization: `Bearer ${await this.accessToken()}` },
    });
    if (res.status === 400 || res.status === 404 || res.status === 410) {
      throw new BillingError('invalid_purchase', 'הרכישה לא נמצאה ב־Google Play', 400);
    }
    if (!res.ok) {
      throw new BillingError('billing_unavailable', 'לא הצלחנו לאמת את המנוי מול Google Play. נסו שוב', 503);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  getSubscription(purchaseToken) {
    const pkg = encodeURIComponent(this.packageName);
    return this.call('GET', `${API}/${pkg}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`);
  }

  acknowledge(productId, purchaseToken) {
    const pkg = encodeURIComponent(this.packageName);
    return this.call('POST', `${API}/${pkg}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`);
  }
}

// Reduces a SubscriptionPurchaseV2 to what the app needs.
export function summarizeSubscription(purchase, productId, now = Date.now()) {
  const items = (purchase.lineItems || []).filter(item => item.productId === productId);
  const latest = items
    .map(item => ({ item, expiresAt: Date.parse(item.expiryTime) || 0 }))
    .sort((a, b) => b.expiresAt - a.expiresAt)[0];
  const state = purchase.subscriptionState || 'SUBSCRIPTION_STATE_UNSPECIFIED';
  const expiresAt = latest?.expiresAt || 0;

  return {
    productId,
    state,
    active: Boolean(latest) && ENTITLED_STATES.has(state) && expiresAt > now,
    expiresAt: expiresAt || null,
    basePlanId: latest?.item.offerDetails?.basePlanId || null,
    autoRenewing: Boolean(latest?.item.autoRenewingPlan?.autoRenewEnabled),
    isTrial: Boolean(latest?.item.offerPhase?.freeTrial),
    acknowledged: purchase.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
    testPurchase: Boolean(purchase.testPurchase),
  };
}
