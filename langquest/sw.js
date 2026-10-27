/* LangQuest service worker
 *  - Offline: app shell is precached; pages and scripts are network-first (updates arrive on the
 *    next load) with the cache as the offline fallback; images and fonts are cache-first
 *  - Reminders: focuses the app when a notification is clicked
 * Bump VERSION on release so old caches are dropped.
 */
const VERSION = 'lq-v4';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/langquest.css',
  './js/data.js', './js/store.js', './js/i18n.js', './js/audio.js', './js/native.js', './js/ui.js',
  './js/commerce.js', './js/reminders.js', './js/onboarding.js', './js/lesson.js', './js/boss.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      // one missing file must not block installation
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(req) {
  return fetch(req).then(res => {
    if (res.ok) caches.open(VERSION).then(c => c.put(req, res.clone()));
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')));
}

function cacheFirst(req) {
  return caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') caches.open(VERSION).then(c => c.put(req, res.clone()));
    return res;
  }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
  if (url.origin !== self.location.origin && !isFont) return;   // payment / API calls go straight to the network
  if (isFont || req.destination === 'image' || req.destination === 'font') e.respondWith(cacheFirst(req));
  else e.respondWith(networkFirst(req));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow(url);
    })
  );
});
