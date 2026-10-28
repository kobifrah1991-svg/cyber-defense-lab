import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Short-lived signed proof that a device has an active subscription.
// The app gets one after the server verifies its purchase with Google, and sends it as a Bearer token.
export class EntitlementSigner {
  constructor(secret) {
    this.secret = secret || randomBytes(32).toString('hex');
    this.ephemeral = !secret;
  }

  mac(payload) {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  sign({ purchaseToken, plan, expiresAt }) {
    const payload = Buffer.from(JSON.stringify({
      sub: createHash('sha256').update(purchaseToken).digest('hex').slice(0, 24),
      plan,
      exp: expiresAt,
    })).toString('base64url');
    return `${payload}.${this.mac(payload)}`;
  }

  verify(token, now = Date.now()) {
    if (typeof token !== 'string' || token.length > 1024) return null;
    const [payload, mac] = token.split('.');
    if (!payload || !mac) return null;
    const expected = Buffer.from(this.mac(payload));
    const given = Buffer.from(mac);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
    try {
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      return Number.isFinite(claims.exp) && claims.exp > now ? claims : null;
    } catch {
      return null;
    }
  }
}
