// Konum ve telefon yönü.

const ANKARA = { lat: 39.925, lon: 32.837, fallback: true };

// Konum izni verilmezse (okullarda sık olur) elle seçilebilecek şehirler
export const CITIES = [
  ['adana', 'Adana', 37.00, 35.32], ['ankara', 'Ankara', 39.93, 32.86], ['antalya', 'Antalya', 36.90, 30.70],
  ['bursa', 'Bursa', 40.19, 29.06], ['diyarbakir', 'Diyarbakır', 37.91, 40.24], ['erzurum', 'Erzurum', 39.90, 41.27],
  ['eskisehir', 'Eskişehir', 39.78, 30.52], ['gaziantep', 'Gaziantep', 37.07, 37.38], ['istanbul', 'İstanbul', 41.01, 28.98],
  ['izmir', 'İzmir', 38.42, 27.14], ['kayseri', 'Kayseri', 38.73, 35.48], ['konya', 'Konya', 37.87, 32.48],
  ['malatya', 'Malatya', 38.35, 38.31], ['samsun', 'Samsun', 41.29, 36.33], ['trabzon', 'Trabzon', 41.00, 39.72],
  ['van', 'Van', 38.50, 43.38],
].map(([id, name, lat, lon]) => ({ id, name, lat, lon }));

// Elle şehir seç (city: CITIES'ten biri) ya da null ile seçimi kaldırıp yeniden GPS'e dön
export function setManualLocation(city) {
  try {
    if (city) localStorage.setItem('gokbul.loc', JSON.stringify({ lat: city.lat, lon: city.lon, city: city.id, manual: true }));
    else localStorage.removeItem('gokbul.loc');
  } catch {}
  return city ? { lat: city.lat, lon: city.lon, city: city.id, manual: true } : null;
}

export function getLocation() {
  return new Promise(resolve => {
    try {
      const saved = JSON.parse(localStorage.getItem('gokbul.loc'));
      if (saved?.manual) return resolve(saved); // elle seçilen şehir GPS'le ezilmesin
      if (saved) resolve({ ...saved, cached: true }); // hızlı başlangıç; aşağıda tazelenir
    } catch {}
    if (!navigator.geolocation) return resolve(ANKARA);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        try { localStorage.setItem('gokbul.loc', JSON.stringify(loc)); } catch {}
        resolve(loc);
      },
      () => resolve(ANKARA),
      { timeout: 8000, maximumAge: 60 * 60e3 },
    );
  });
}

const RAD = Math.PI / 180;

// Telefonun arka kamerasının baktığı yön. W3C DeviceOrientation açılarından (alpha, beta, gamma)
// cihazın -z eksenini Dünya koordinatlarına (Doğu, Kuzey, Yukarı) çeviriyoruz.
export function pointing(alpha, beta, gamma) {
  const a = alpha * RAD, b = beta * RAD, g = gamma * RAD;
  const east  = -Math.sin(g) * Math.cos(a) - Math.cos(g) * Math.sin(b) * Math.sin(a);
  const north = -Math.sin(g) * Math.sin(a) + Math.cos(g) * Math.sin(b) * Math.cos(a);
  const up    = -Math.cos(b) * Math.cos(g);
  return { east, north, up };
}

export const toAzAlt = v => {
  const len = Math.hypot(v.east, v.north, v.up) || 1;
  return {
    az: (Math.atan2(v.east, v.north) / RAD + 360) % 360,
    alt: Math.asin(v.up / len) / RAD,
  };
};

// Yön sensörünü başlatır. Sonuç:
//   'live'   yön verisi geliyor
//   'denied' izin verilmedi ya da izin bir dokunuş gerektiriyor (iOS Safari, dokunuşsuz çağrılınca)
//   'none'   cihazda pusula yok (masaüstü)
// Android Chrome izni dokunuşsuz verir; bu yüzden açılışta kendiliğinden denenebilir.
export async function startOrientation(onVector) {
  if (typeof DeviceOrientationEvent === 'undefined') return 'none';
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') return 'denied'; }
    catch { return 'denied'; }
  }
  let got = false;
  const handler = e => {
    // iOS gerçek pusula yönünü ayrıca verir; Android'de "absolute" olay zaten kuzeye göredir
    const alpha = e.webkitCompassHeading != null ? 360 - e.webkitCompassHeading : e.alpha;
    if (alpha == null || e.beta == null || e.gamma == null) return;
    got = true;
    onVector(pointing(alpha, e.beta, e.gamma));
  };
  const type = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  window.addEventListener(type, handler);
  await new Promise(r => setTimeout(r, 1200));
  if (!got) window.removeEventListener(type, handler);
  return got ? 'live' : 'none';
}
