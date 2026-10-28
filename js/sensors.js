// Konum ve telefon yönü.

const ANKARA = { lat: 39.925, lon: 32.837, fallback: true };

export function getLocation() {
  return new Promise(resolve => {
    try {
      const saved = JSON.parse(localStorage.getItem('gokbul.loc'));
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

// Yön verisi gelirse true döner. iOS'ta bu fonksiyon bir dokunuşun içinden çağrılmalı.
export async function startOrientation(onVector) {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') return false; }
    catch { return false; }
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
  return got;
}
