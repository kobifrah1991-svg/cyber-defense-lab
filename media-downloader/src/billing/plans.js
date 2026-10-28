// Free vs Premium rules. Enforced on the server, so the limits hold no matter what the client sends.
const DAY_MS = 24 * 60 * 60 * 1000;
const DEVICE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// Several people can share one IP (home Wi-Fi, mobile carrier NAT), so the IP limit is looser.
const IP_MULTIPLIER = 4;

export class PlanPolicy {
  constructor({ enabled, freeDownloadsPerDay, freeMaxHeight, signer, now = () => Date.now() }) {
    this.enabled = enabled;
    this.freeDownloadsPerDay = freeDownloadsPerDay;
    this.freeMaxHeight = freeMaxHeight;
    this.signer = signer;
    this.now = now;
    this.usage = new Map();
  }

  // Who is asking, and are they Premium?
  identify(req) {
    const deviceId = req.get('x-device-id');
    const auth = req.get('authorization') || '';
    const claims = auth.startsWith('Bearer ') ? this.signer.verify(auth.slice(7), this.now()) : null;
    return {
      premium: !this.enabled || Boolean(claims),
      deviceKey: deviceId && DEVICE_ID.test(deviceId) ? `d:${deviceId.toLowerCase()}` : null,
      ipKey: `ip:${req.ip}`,
      entitlement: claims,
    };
  }

  allows(choice, who) {
    if (who.premium) return true;
    if (choice.kind === 'audio') return false;
    return choice.height == null || choice.height <= this.freeMaxHeight;
  }

  // 'best' has no height cap, so free users get it capped at the free maximum.
  effectiveChoice(choice, who) {
    if (who.premium || choice.kind !== 'video' || choice.height != null) return choice;
    return { kind: 'video', height: this.freeMaxHeight };
  }

  day() {
    return Math.floor(this.now() / DAY_MS);
  }

  used(key) {
    const entry = this.usage.get(key);
    return entry && entry.day === this.day() ? entry.count : 0;
  }

  freeLeft(who, pending = 0) {
    if (who.premium) return null;
    const left = [this.freeDownloadsPerDay - this.used(who.ipKey) / IP_MULTIPLIER];
    if (who.deviceKey) left.push(this.freeDownloadsPerDay - this.used(who.deviceKey));
    return Math.max(0, Math.floor(Math.min(...left)) - pending);
  }

  // Called when a free download finishes successfully, so failed downloads don't use up the quota.
  record(who) {
    if (who.premium) return;
    const day = this.day();
    for (const key of [who.ipKey, who.deviceKey].filter(Boolean)) {
      const entry = this.usage.get(key);
      this.usage.set(key, { day, count: entry && entry.day === day ? entry.count + 1 : 1 });
    }
    if (this.usage.size > 50_000) {
      for (const [key, entry] of this.usage) if (entry.day !== day) this.usage.delete(key);
    }
  }

  describe(who, pending = 0) {
    return {
      enabled: this.enabled,
      premium: who.premium,
      expiresAt: who.entitlement?.exp ?? null,
      freeLeft: this.enabled ? this.freeLeft(who, pending) : null,
      freeDownloadsPerDay: this.freeDownloadsPerDay,
      freeMaxHeight: this.freeMaxHeight,
    };
  }
}
