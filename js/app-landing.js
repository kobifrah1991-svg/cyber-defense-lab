// Landing page for the Android app: fills download links, version, checksum and prices
// from app-release.json, so a new release only means editing that one file.
(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.remove('translate-y-32', 'opacity-0');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.add('translate-y-32', 'opacity-0'), 2600);
  }

  function enable(link, href, label, primary) {
    link.href = href;
    link.removeAttribute('aria-disabled');
    link.className = primary
      ? 'glow-button py-3.5 rounded-2xl font-black text-center text-white'
      : 'py-3.5 rounded-2xl font-black text-center text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-colors';
    link.querySelector('span').textContent = label;
  }

  // Prices are display strings like "₪14.90"; pull the number out to compute the monthly equivalent.
  function amount(price) {
    const n = Number(String(price).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function render(release) {
    const trial = Number(release.trialDays) || 7;
    for (const el of document.querySelectorAll('[data-trial-days]')) el.textContent = trial;

    if (release.version) $('version-line').textContent = `גרסה ${release.version}.`;

    if (release.playUrl) enable($('play-link'), release.playUrl, 'להורדה מ־Google Play', true);

    const apk = release.apk || {};
    if (apk.url) {
      enable($('apk-link'), apk.url, 'הורדת APK', false);
      $('apk-link').setAttribute('download', '');
      const size = apk.sizeBytes ? `${(apk.sizeBytes / 1024 / 1024).toFixed(1)} MB` : '';
      $('apk-meta').textContent = [release.version && `גרסה ${release.version}`, size].filter(Boolean).join(' · ');
      if (apk.sha256) {
        $('apk-sha').textContent = apk.sha256;
        $('apk-verify').classList.remove('hidden');
      }
    }

    const { monthly, yearly } = release.prices || {};
    const currency = String(yearly || monthly || '').replace(/[\d.,\s]/g, '') || '';
    if (yearly && amount(yearly)) {
      $('price-yearly-monthly').textContent = `${currency}${(amount(yearly) / 12).toFixed(2)}`;
      $('price-caption').textContent = 'לחודש, בחיוב שנתי';
      $('price-detail').textContent = `${yearly} לשנה${monthly ? ` · או ${monthly} בחודשי` : ''}`;
    } else if (monthly) {
      $('price-yearly-monthly').textContent = monthly;
      $('price-caption').textContent = 'לחודש';
    }
  }

  $('copy-sha').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('apk-sha').textContent);
      toast('טביעת ה־SHA-256 הועתקה');
    } catch {
      toast('סמנו את הטקסט והעתיקו ידנית');
    }
  });

  // iPhone and iPad (iPadOS reports itself as a Mac with touch).
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) $('ios-banner').classList.remove('hidden');

  fetch('app-release.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : {}))
    .then(render)
    .catch(() => render({}));
})();
