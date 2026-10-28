// Çevrimdışı çalışma: uygulama dosyalarını önbelleğe al. Dosya eklersen SHELL'e ve sürüme dokun.
const VERSION = 'gokbul-v1';
const SHELL = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest', 'icons/icon.svg',
  'js/app.js', 'js/i18n.js', 'js/objects.js', 'js/sky.js', 'js/sensors.js',
  'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    if (res.ok || res.type === 'opaque') caches.open(VERSION).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match('index.html'))));
});
