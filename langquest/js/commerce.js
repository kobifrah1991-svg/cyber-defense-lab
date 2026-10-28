/* TedraLingo — sales model (freemium) and entitlements
 *
 *  Free:    the first FREE_STATIONS stations of every language (lesson + Boss), phrasebook, reminders
 *  Premium: every station and Boss in every language (monthly / yearly / lifetime)
 *
 *  Purchase flow (web & APK distributed outside Google Play):
 *    1. "Buy" opens a Stripe Payment Link (CONFIG.checkout[plan]).
 *    2. The Payment Link's success URL returns to the app with ?session_id={CHECKOUT_SESSION_ID}.
 *    3. The app asks the license server (server/license-worker.js) to verify the session; the server
 *       answers with a signed license key, stored locally and re-validated periodically.
 *    4. "Restore" accepts that license key on another device.
 *    5. Signed in with Google (js/cloud.js), the license is put on the learner's account (POST /link): the server
 *       writes tedralingo_entitlements/{uid} in Firestore and every device signed in to that account is Premium.
 *       Google Play purchases will write the same account entitlement (source 'play').
 *  Until CONFIG is filled in, purchases run in demo mode on localhost only (clearly labelled).
 *  Google Play builds must use Play Billing for in-app digital purchases instead — see README.
 */
(function () {
  const CONFIG = {
    // Stripe Payment Links (https://dashboard.stripe.com/payment-links) — one per plan
    checkout: { monthly: '', yearly: '', lifetime: '' },
    // Deployed server/license-worker.js, e.g. 'https://tedralingo-license.<you>.workers.dev'
    licenseApi: '',
    // AI tutor endpoint; defaults to licenseApi + '/tutor'
    tutorApi: '',
    // Public download URL of the signed APK (GitHub Release asset or your site)
    apkUrl: '',
    revalidateDays: 3,
    // free trial on subscriptions — set the same number of days on the Stripe prices / Payment Links
    trialDays: 3
  };

  const FREE_STATIONS = 3;

  const PLANS = [
    { id: 'monthly', price: { ILS: 24.9, USD: 6.99 }, period: 'month' },
    { id: 'yearly', price: { ILS: 149, USD: 39.99 }, period: 'year', best: true },
    { id: 'lifetime', price: { ILS: 299, USD: 79 }, period: 'once' }
  ];

  const KEY = 'langquest_license_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  }

  function save(lic) {
    try {
      if (lic) localStorage.setItem(KEY, JSON.stringify(lic));
      else localStorage.removeItem(KEY);
    } catch { /* private mode */ }
  }

  const isLocal = () => ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
  const configured = () => !!CONFIG.licenseApi && PLANS.every(p => !!CONFIG.checkout[p.id]);
  const demoMode = () => !configured() && isLocal();

  function license() {
    const lic = load();
    if (!lic) return null;
    if (lic.plan !== 'lifetime' && lic.exp && lic.exp * 1000 < Date.now()) return null;
    return lic;
  }

  /* ---------- Premium on the account (read from Firestore by js/cloud.js, cached for offline use) ---------- */
  const ACC_KEY = 'tedralingo_entitlement_v1';
  let account = (() => { try { return JSON.parse(localStorage.getItem(ACC_KEY)) || null; } catch { return null; } })();

  /** Called by cloud.js with the signed-in uid and the entitlement document ({ premium, plan, source, expiresAt sec|null }), or nulls on sign-out. */
  function setAccountEntitlement(uid, e) {
    const next = uid && e && e.premium ? { uid, plan: e.plan || '', source: e.source || '', expiresAt: e.expiresAt || null } : null;
    if (JSON.stringify(next) === JSON.stringify(account)) return;
    account = next;
    try { next ? localStorage.setItem(ACC_KEY, JSON.stringify(next)) : localStorage.removeItem(ACC_KEY); } catch { /* private mode */ }
    document.dispatchEvent(new Event('lq:premium'));
  }

  function accountEntitlement() {
    if (!account) return null;
    if (account.expiresAt && account.expiresAt * 1000 < Date.now()) return null;
    return account;
  }

  function isPremium() { return !!license() || !!accountEntitlement(); }

  function stationIsFree(index) { return index < FREE_STATIONS; }

  function canOpen(index) { return stationIsFree(index) || isPremium(); }

  function currency() {
    const ui = window.LQI18n ? LQI18n.ui() : 'he';
    return ui === 'he' ? 'ILS' : 'USD';
  }

  function priceLabel(plan) {
    const cur = currency();
    const ui = window.LQI18n ? LQI18n.ui() : 'he';
    const locale = { he: 'he-IL', en: 'en-US', ar: 'ar', ru: 'ru-RU' }[ui] || 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(plan.price[cur]);
  }

  /* ---------- server calls ---------- */
  async function callApi(params) {
    const url = CONFIG.licenseApi.replace(/\/$/, '') + '/verify?' + new URLSearchParams(params);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || 'verify_failed');
    return body;   // { ok, plan, exp, token }
  }

  function store(body) {
    const lic = { plan: body.plan, exp: body.exp || null, token: body.token, checkedAt: Date.now() };
    save(lic);
    document.dispatchEvent(new Event('lq:license'));   // signed in → cloud.js puts it on the account
    return lic;
  }

  /** Put this device's license on the signed-in learner's account. `idToken` is their Firebase ID token. */
  async function linkToAccount(idToken) {
    const lic = license();
    if (!lic || !CONFIG.licenseApi || lic.token.startsWith('DEMO-')) return null;
    const res = await fetch(CONFIG.licenseApi.replace(/\/$/, '') + '/link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken, token: lic.token })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || 'link_failed');
    return body;
  }

  /** Returns from Stripe Checkout with ?session_id=… → verify and store the license. */
  async function handleReturn() {
    const params = new URLSearchParams(location.search);
    const sid = params.get('session_id');
    if (!sid || !CONFIG.licenseApi) return null;
    params.delete('session_id');
    history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
    return store(await callApi({ session_id: sid }));
  }

  /** Activate on another device with the license key shown in settings. */
  async function restore(token) {
    if (demoMode() && token.startsWith('DEMO-')) return store({ plan: token.split('-')[1] || 'lifetime', exp: null, token });
    if (!CONFIG.licenseApi) throw new Error('not_configured');
    return store(await callApi({ token: token.trim() }));
  }

  /** Re-check subscriptions every few days so cancelled ones stop working. */
  async function revalidate() {
    const lic = load();
    if (!lic || !CONFIG.licenseApi || lic.token.startsWith('DEMO-')) return;
    if (Date.now() - (lic.checkedAt || 0) < CONFIG.revalidateDays * 86400000) return;
    try { store(await callApi({ token: lic.token })); }
    catch (e) { if (e.message === 'inactive' || e.message === 'invalid_token') save(null); }   // offline → keep
  }

  /** Start a purchase. Returns 'redirect' | 'demo' | 'unavailable'. */
  function buy(planId) {
    if (demoMode()) {
      const plan = PLANS.find(p => p.id === planId);
      const exp = plan.period === 'once' ? null : Math.floor(Date.now() / 1000) + (plan.period === 'year' ? 365 : 31) * 86400;
      store({ plan: planId, exp, token: `DEMO-${planId}-${Date.now().toString(36)}` });
      return 'demo';
    }
    const link = CONFIG.checkout[planId];
    if (!link) return 'unavailable';
    const url = new URL(link);
    if (window.LQI18n) url.searchParams.set('locale', LQI18n.ui());
    if (window.LQNative && LQNative.isNative) LQNative.openExternal(url.toString());
    else location.href = url.toString();
    return 'redirect';
  }

  function signOut() { save(null); }

  window.LQCommerce = {
    CONFIG, PLANS, FREE_STATIONS,
    license, isPremium, stationIsFree, canOpen, priceLabel, demoMode, configured,
    handleReturn, restore, revalidate, buy, signOut,
    setAccountEntitlement, accountEntitlement, linkToAccount
  };
})();
