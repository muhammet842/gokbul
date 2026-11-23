// Çevrimdışı çalışma.
// Uygulama dosyaları: önce ağ (yeni sürüm hemen gelsin), ağ yoksa ya da yavaşsa önbellek.
// Yazı tipleri gibi dış dosyalar: önce önbellek (değişmezler).
// VERSION'ı sadece SHELL listesi değişince artırman yeterli; dosya içerikleri kendiliğinden tazelenir.
const VERSION = 'gokbul-v6';
const SHELL = [
  './', 'index.html', 'css/style.css', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/app.js', 'js/i18n.js', 'js/objects.js', 'js/sky.js', 'js/sensors.js', 'js/satellites.js',
  'vendor/astronomy.browser.min.js', 'vendor/satellite.min.js',
];
const NETWORK_TIMEOUT = 3000; // sahada zayıf çekimde uzun beklemesin

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function save(req, res) {
  if (res.ok || res.type === 'opaque') {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy));
  }
  return res;
}

function networkFirst(req) {
  // no-cache: tarayıcının kendi önbelleğini atla, sunucuya "değişti mi?" diye sor.
  // GitHub Pages dosyaları 10 dk önbellekte tutturuyor; yoksa yeni sürüm telefona 10 dk geç gelirdi.
  const net = fetch(req, { cache: 'no-cache' }).then(res => save(req, res));
  const timeout = new Promise(r => setTimeout(r, NETWORK_TIMEOUT));
  const cached = () => caches.match(req, { ignoreSearch: true });
  // Zaman aşımında önbellekteki varsa onu ver; yoksa ağı beklemeye devam et
  return Promise.race([net, timeout.then(() => cached().then(hit => hit || net))])
    .catch(() => cached().then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())));
}

function cacheFirst(req) {
  return caches.match(req).then(hit => hit || fetch(req).then(res => save(req, res)));
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Yörünge verisi her zaman taze gelsin; uygulama onu zaten kendisi saklıyor
  if (new URL(e.request.url).hostname === 'celestrak.org') return;
  const sameOrigin = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(sameOrigin ? networkFirst(e.request) : cacheFirst(e.request));
});
