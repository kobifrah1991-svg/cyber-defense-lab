// MediaDownloader Pro — Android shell: device identity, Google Play subscriptions and the settings sheet.
// The downloader itself is the shared js/media-downloader.js, configured through window.MDP_CONFIG.
(() => {
  'use strict';

  const APP = window.MDP_APP_CONFIG || {};
  const $ = id => document.getElementById(id);
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const KEYS = {
    device: 'mdp-device-id',
    server: 'mdp-server',
    entitlement: 'mdp-entitlement',
    purchase: 'mdp-purchase',
    history: 'mdp-history',
  };
  // Re-check the subscription with Google when the entitlement has less than this left.
  const REFRESH_BEFORE_MS = 6 * 60 * 60 * 1000;

  // ---------- storage ----------
  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Storage unavailable: the app still works, it just won't remember.
      }
    },
    json(key) {
      try { return JSON.parse(this.get(key) || 'null'); } catch { return null; }
    },
  };

  function deviceId() {
    let id = storage.get(KEYS.device);
    if (!id || !UUID.test(id)) {
      id = crypto.randomUUID();
      storage.set(KEYS.device, id);
    }
    return id;
  }

  const state = {
    entitlement: storage.json(KEYS.entitlement),
    subscription: storage.json(KEYS.purchase)?.subscription || null,
    plan: null,
    plans: [],
    selected: null,
    billing: null, // CdvPurchase.store once ready
  };

  const serverBase = () => (storage.get(KEYS.server) || APP.apiBase || '').replace(/\/+$/, '');
  const hasEntitlement = () => Boolean(state.entitlement && state.entitlement.expiresAt > Date.now());

  // ---------- hooks for the shared downloader ----------
  window.MDP_CONFIG = {
    app: true,
    apiBase: serverBase,
    exclude: ['youtube'],
    headers() {
      const headers = { 'X-Device-Id': deviceId(), 'X-Client': 'android' };
      if (hasEntitlement()) headers.Authorization = `Bearer ${state.entitlement.token}`;
      return headers;
    },
    openFile: url => openExternal(url),
    onPremium: reason => openSheet(reason),
  };

  // ---------- helpers ----------
  function openExternal(url) {
    if (url.startsWith('mailto:')) {
      location.href = url;
      return;
    }
    const browser = window.Capacitor?.Plugins?.Browser;
    if (browser) browser.open({ url, toolbarColor: '#0B0914' });
    else window.open(url, '_blank', 'noopener');
  }

  function toast(title, msg) {
    const el = $('toast');
    $('toast-title').textContent = title;
    $('toast-msg').textContent = msg;
    el.classList.remove('translate-y-32', 'opacity-0');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add('translate-y-32', 'opacity-0'), 3800);
  }

  const formatDate = ms => new Date(ms).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

  function formatMoney(micros, currency, fallback) {
    if (!Number.isFinite(micros) || !currency) return fallback;
    try {
      return new Intl.NumberFormat('he-IL', { style: 'currency', currency }).format(micros / 1e6);
    } catch {
      return fallback;
    }
  }

  // ISO-8601 period ("P7D", "P1W", "P1M", "P1Y") to days, for the trial length.
  function periodDays(period) {
    const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(period || '');
    if (!m) return 0;
    const [y, mo, w, d] = m.slice(1).map(v => Number(v || 0));
    return y * 365 + mo * 30 + w * 7 + d;
  }

  async function api(path, body) {
    const res = await fetch(`${serverBase()}/api/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...window.MDP_CONFIG.headers() },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.error?.message || 'השרת לא זמין כרגע');
      err.code = data?.error?.code;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // ---------- subscription state ----------
  async function refreshPlan() {
    try {
      state.plan = await api('plan');
    } catch {
      state.plan = null;
    }
    render();
  }

  // Confirms a Google Play purchase with our server, which returns a signed entitlement.
  async function verifyPurchase(purchaseToken) {
    const data = await api('billing/verify', { purchaseToken, productId: APP.productId });
    state.subscription = data.subscription;
    state.entitlement = data.entitlement;
    storage.set(KEYS.purchase, JSON.stringify({ purchaseToken, subscription: data.subscription }));
    storage.set(KEYS.entitlement, data.entitlement ? JSON.stringify(data.entitlement) : null);
    await refreshPlan();
    window.MDP?.refresh();
    return data;
  }

  // Keeps the entitlement fresh between purchases (renewals, cancellations, refunds).
  async function refreshEntitlement() {
    const saved = storage.json(KEYS.purchase);
    if (!saved?.purchaseToken) return;
    if (hasEntitlement() && state.entitlement.expiresAt - Date.now() > REFRESH_BEFORE_MS) return;
    try {
      await verifyPurchase(saved.purchaseToken);
    } catch (err) {
      if (err.status === 400) {
        // Google doesn't know this purchase anymore (refunded / revoked).
        storage.set(KEYS.purchase, null);
        storage.set(KEYS.entitlement, null);
        state.entitlement = null;
        state.subscription = null;
        render();
      }
    }
  }

  // Receipt validator for cordova-plugin-purchase: our server is the source of truth.
  function validator(receipt, callback) {
    const { ErrorCode, Platform } = window.CdvPurchase;
    const purchaseToken = receipt.transaction?.purchaseToken;
    if (!purchaseToken) {
      callback({ ok: false, code: ErrorCode.BAD_RESPONSE, message: 'Missing purchase token' });
      return;
    }
    verifyPurchase(purchaseToken).then(data => {
      const sub = data.subscription;
      callback({
        ok: true,
        data: {
          id: receipt.id || APP.productId,
          latest_receipt: true,
          transaction: { type: Platform.GOOGLE_PLAY },
          collection: [{
            id: APP.productId,
            platform: Platform.GOOGLE_PLAY,
            purchaseId: purchaseToken,
            expiryDate: sub.expiresAt || undefined,
            isExpired: !data.active,
            isAcknowledged: sub.acknowledged,
            isTrialPeriod: sub.isTrial,
            renewalIntent: sub.autoRenewing ? 'Renew' : 'Lapse',
          }],
        },
      });
    }).catch(err => {
      callback({
        ok: false,
        status: err.status || 0,
        code: err.status === 400 ? ErrorCode.BAD_RESPONSE : ErrorCode.COMMUNICATION,
        message: err.message,
      });
    });
  }

  // ---------- Google Play billing ----------
  function plansFromProduct(product) {
    const byPeriod = new Map();
    for (const offer of product?.offers || []) {
      const phases = offer.pricingPhases || [];
      const recurring = phases.find(p => p.recurrenceMode === 'INFINITE_RECURRING') || phases[phases.length - 1];
      if (!recurring) continue;
      const trial = phases.find(p => p.paymentMode === 'FreeTrial' || p.priceMicros === 0);
      const plan = {
        offer,
        period: recurring.billingPeriod,
        yearly: /Y$/.test(recurring.billingPeriod || '') || recurring.billingPeriod === 'P12M',
        price: recurring.price,
        priceMicros: recurring.priceMicros,
        currency: recurring.currency,
        trialDays: trial ? periodDays(trial.billingPeriod) : 0,
      };
      // Google only lists offers this user is eligible for; prefer the one with a free trial.
      const existing = byPeriod.get(plan.period);
      if (!existing || plan.trialDays > existing.trialDays) byPeriod.set(plan.period, plan);
    }
    return [...byPeriod.values()].sort((a, b) => Number(b.yearly) - Number(a.yearly));
  }

  function initBilling() {
    const lib = window.CdvPurchase;
    if (!lib) {
      $('plans-status').textContent = 'הרכישה זמינה באפליקציה שהותקנה מ־Google Play';
      return;
    }
    const { store, ProductType, Platform, LogLevel, ErrorCode } = lib;
    store.verbosity = LogLevel.WARNING;
    store.register([{ id: APP.productId, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.GOOGLE_PLAY }]);
    store.validator = validator;

    store.when()
      .productUpdated(product => {
        if (product.id !== APP.productId) return;
        state.plans = plansFromProduct(product);
        if (!state.plans.includes(state.selected)) state.selected = state.plans[0] || null;
        renderPlans();
      })
      .approved(transaction => transaction.verify())
      .verified(receipt => receipt.finish());

    store.error(err => {
      if (err.code === ErrorCode.PAYMENT_CANCELLED) return;
      console.warn('[billing]', err.code, err.message);
    });

    $('plans-status').textContent = 'טוען מחירים מ־Google Play…';
    store.initialize([Platform.GOOGLE_PLAY]).then(errors => {
      state.billing = store;
      const failed = errors?.length && !state.plans.length;
      $('plans-status').textContent = failed ? 'לא הצלחנו להתחבר ל־Google Play. בדקו שאתם מחוברים לחשבון Google' : '';
      renderPlans();
    });
  }

  async function subscribe() {
    const plan = state.selected;
    if (!plan || !state.billing) return;
    const btn = $('subscribe-btn');
    btn.disabled = true;
    try {
      const err = await plan.offer.order();
      if (err && err.code !== window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
        toast('הרכישה לא הושלמה', err.message || 'נסו שוב בעוד רגע');
      }
    } finally {
      btn.disabled = false;
    }
  }

  async function restore() {
    if (!state.billing) {
      toast('לא זמין', 'שחזור רכישות זמין באפליקציה שהותקנה מ־Google Play');
      return;
    }
    toast('משחזר רכישות', 'בודק מול Google Play…');
    await state.billing.restorePurchases();
    await refreshEntitlement();
    toast(hasEntitlement() ? 'Premium שוחזר' : 'לא נמצא מנוי', hasEntitlement() ? 'כל האפשרויות פתוחות' : 'לא מצאנו מנוי פעיל בחשבון הזה');
  }

  // ---------- rendering ----------
  function renderPlans() {
    const wrap = $('plans');
    wrap.replaceChildren();
    const monthly = state.plans.find(p => !p.yearly);
    for (const plan of state.plans) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'plan-tile';
      tile.setAttribute('role', 'radio');
      tile.setAttribute('aria-checked', String(plan === state.selected));

      const row = document.createElement('span');
      row.className = 'flex items-center gap-3';
      const radio = document.createElement('span');
      radio.className = 'plan-radio';
      const text = document.createElement('span');
      text.className = 'flex-grow min-w-0';
      const name = document.createElement('span');
      name.className = 'block font-black text-white';
      name.textContent = plan.yearly ? 'שנתי' : 'חודשי';
      const sub = document.createElement('span');
      sub.className = 'block text-xs text-purple-100/75';
      sub.textContent = plan.yearly
        ? `${formatMoney(plan.priceMicros / 12, plan.currency, '')} לחודש, בחיוב שנתי`.trim()
        : 'גמישות מלאה, ביטול בכל עת';
      text.append(name, sub);
      const price = document.createElement('span');
      price.className = 'text-left';
      const amount = document.createElement('span');
      amount.className = 'block font-black text-white';
      amount.textContent = plan.price;
      const per = document.createElement('span');
      per.className = 'block text-[11px] text-purple-100/60';
      per.textContent = plan.yearly ? 'לשנה' : 'לחודש';
      price.append(amount, per);
      row.append(radio, text, price);
      tile.append(row);

      if (plan.yearly && monthly?.priceMicros) {
        const save = Math.round((1 - plan.priceMicros / (monthly.priceMicros * 12)) * 100);
        if (save > 0) {
          const badge = document.createElement('span');
          badge.className = 'absolute -top-2.5 left-4 crown-badge text-[11px] font-black px-2.5 py-0.5 rounded-full';
          badge.textContent = `חיסכון ${save}%`;
          tile.append(badge);
        }
      }
      tile.addEventListener('click', () => {
        state.selected = plan;
        renderPlans();
      });
      wrap.append(tile);
    }

    const plan = state.selected;
    const btn = $('subscribe-btn');
    btn.disabled = !plan || !state.billing;
    btn.textContent = plan?.trialDays ? `התחילו ${plan.trialDays} ימים חינם` : 'הצטרפו ל־Premium';
    $('plan-terms').textContent = plan
      ? `${plan.trialDays ? `${plan.trialDays} ימים חינם, ואחר כך ` : ''}${plan.price} ${plan.yearly ? 'לשנה' : 'לחודש'}. `
        + 'המנוי מתחדש אוטומטית עד שמבטלים. אפשר לבטל בכל עת ב־Google Play'
        + (plan.trialDays ? ', וביטול לפני סוף הניסיון לא יעלה דבר.' : '.')
      : '';
  }

  function render() {
    const plan = state.plan;
    const billingOn = plan ? plan.enabled : true;
    const premium = hasEntitlement() || Boolean(plan?.enabled && plan.premium);

    $('premium-offer').classList.toggle('hidden', !billingOn || premium);
    $('premium-status').classList.toggle('hidden', !premium);
    $('restore-btn').classList.toggle('hidden', !billingOn);

    const sub = state.subscription;
    if (premium && sub) {
      const kind = sub.basePlanId ? (/year|annual/i.test(sub.basePlanId) ? 'שנתי' : 'חודשי') : '';
      const when = sub.expiresAt ? `${sub.autoRenewing ? 'מתחדש ב־' : 'בתוקף עד '}${formatDate(sub.expiresAt)}` : '';
      $('premium-detail').textContent = [sub.isTrial ? 'תקופת ניסיון' : '', kind && `מסלול ${kind}`, when].filter(Boolean).join(' · ');
    } else {
      $('premium-detail').textContent = '';
    }

    const badge = $('plan-badge');
    const showBadge = billingOn && Boolean(plan);
    badge.className = 'items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black '
      + (showBadge ? 'flex ' : 'hidden ')
      + (premium ? 'crown-badge' : 'bg-white/10 text-gray-200 border border-white/15');
    const icon = document.createElement('i');
    icon.className = premium ? 'fa-solid fa-crown' : 'fa-solid fa-bolt text-amber-300';
    const label = document.createElement('span');
    label.textContent = premium ? 'Premium' : plan?.freeLeft != null ? `חינם · ${plan.freeLeft}` : 'חינם';
    badge.replaceChildren(icon, label);

    const upsell = $('upsell');
    upsell.classList.toggle('hidden', !billingOn || premium || !plan);
    upsell.classList.toggle('flex', billingOn && !premium && Boolean(plan));

    $('usage-text').textContent = !plan
      ? 'אין חיבור לשרת'
      : !billingOn || premium
        ? 'ללא הגבלה'
        : `נשארו ${plan.freeLeft} מתוך ${plan.freeDownloadsPerDay} הורדות חינם · עד ${plan.freeMaxHeight}p`;
    $('server-current').textContent = serverBase() || 'לא הוגדר';
  }

  // ---------- sheet ----------
  function openSheet(reason) {
    $('paywall-reason').textContent = reason || '';
    $('paywall-reason').classList.toggle('hidden', !reason);
    $('sheet-title').textContent = reason ? 'שדרוג ל־Premium' : 'הגדרות';
    $('sheet').classList.add('open');
    $('sheet').setAttribute('aria-hidden', 'false');
    $('sheet-backdrop').classList.add('open');
    $('sheet').querySelector('.overflow-y-auto').scrollTop = 0;
    refreshPlan();
  }

  function closeSheet() {
    $('sheet').classList.remove('open');
    $('sheet').setAttribute('aria-hidden', 'true');
    $('sheet-backdrop').classList.remove('open');
  }

  const isSheetOpen = () => $('sheet').classList.contains('open');

  // ---------- wiring ----------
  $('settings-btn').addEventListener('click', () => openSheet());
  $('plan-badge').addEventListener('click', () => openSheet());
  $('upsell').addEventListener('click', () => openSheet());
  $('sheet-close').addEventListener('click', closeSheet);
  $('sheet-backdrop').addEventListener('click', closeSheet);
  $('subscribe-btn').addEventListener('click', subscribe);
  $('restore-btn').addEventListener('click', restore);
  $('manage-btn').addEventListener('click', () => {
    if (state.billing) state.billing.manageSubscriptions(window.CdvPurchase.Platform.GOOGLE_PLAY);
    else openExternal('https://play.google.com/store/account/subscriptions');
  });

  $('server-toggle').addEventListener('click', () => {
    $('server-form').classList.toggle('hidden');
    $('server-input').value = storage.get(KEYS.server) || '';
  });
  $('server-form').addEventListener('submit', event => {
    event.preventDefault();
    const value = $('server-input').value.trim();
    let url;
    try {
      url = new URL(value);
    } catch {
      toast('כתובת לא תקינה', 'הכתובת צריכה להתחיל ב־https://');
      return;
    }
    if (url.protocol !== 'https:') {
      toast('כתובת לא תקינה', 'נדרש חיבור מאובטח (https)');
      return;
    }
    storage.set(KEYS.server, url.origin);
    $('server-form').classList.add('hidden');
    window.MDP?.checkServer();
    refreshPlan();
    toast('השרת עודכן', url.origin);
  });
  $('server-reset').addEventListener('click', () => {
    storage.set(KEYS.server, null);
    $('server-form').classList.add('hidden');
    window.MDP?.checkServer();
    refreshPlan();
  });
  $('clear-data-btn').addEventListener('click', () => {
    $('history-clear').click();
    toast('ההיסטוריה נמחקה', '');
  });
  for (const el of document.querySelectorAll('[data-link]')) {
    el.addEventListener('click', () => {
      const url = APP.links?.[el.dataset.link];
      if (url) openExternal(url);
    });
  }

  $('app-version').textContent = APP.version || '';

  document.addEventListener('deviceready', () => {
    initBilling();
    // Links shared from other apps ("Share → MediaDownloader").
    window.Capacitor?.Plugins?.ShareIntent?.addListener('shared', ({ url }) => {
      closeSheet();
      window.MDP?.open(url);
    });
    const app = window.Capacitor?.Plugins?.App;
    app?.addListener('backButton', () => (isSheetOpen() ? closeSheet() : app.exitApp()));
    app?.addListener('resume', () => {
      refreshEntitlement();
      refreshPlan();
    });
  }, false);

  // Outside the app (browser preview) there is no deviceready.
  if (!window.Capacitor?.isNativePlatform?.()) {
    setTimeout(() => {
      if (!state.billing) $('plans-status').textContent = 'הרכישה זמינה באפליקציה שהותקנה מ־Google Play';
    }, 1500);
  }

  render();
  refreshEntitlement().finally(refreshPlan);
})();
