// Uzay istasyonları (ISS, Tiangong). Yörünge verisi (TLE) CelesTrak'tan gelir, telefonda saklanır;
// hesapları satellite.js (window.satellite) yapar. Veri yoksa ya da çok eskiyse istasyonlar gösterilmez.
import { SATS } from './objects.js';
import { sunAltitude } from './sky.js';

const SL = () => window.satellite;
const A = () => window.Astronomy;
const RAD = Math.PI / 180;
const EARTH_KM = 6371;
const KEY = 'gokbul.tle';
const REFRESH_MS = 12 * 3600e3;    // CelesTrak'ı yormamak için en fazla 12 saatte bir
const MAX_AGE_MS = 14 * 86400e3;   // 14 günden eski yörünge verisi birkaç dereceden fazla şaşar
const DARK_SKY = -6;               // geçiş listesi: güneş ufkun en az 6° altında (gökyüzü karanlık)
const DIM_SKY = -4;                // Bak ekranı: alacakaranlıkta da göster (ISS çok parlak)

let store = load();
const recs = {};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? { fetchedAt: 0, sats: {} }; }
  catch { return { fetchedAt: 0, sats: {} }; }
}

// Testler ve elle yükleme için
export function setTLE(id, line1, line2) {
  store.sats[id] = [line1, line2];
  delete recs[id];
}

// Gerekirse CelesTrak'tan taze yörünge verisi çek. Yeni veri geldiyse true döner.
export async function refreshTLE() {
  if (Date.now() - store.fetchedAt < REFRESH_MS && SATS.every(s => store.sats[s.id])) return false;
  const got = {};
  await Promise.all(SATS.map(async sat => {
    try {
      const res = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${sat.norad}&FORMAT=TLE`);
      if (!res.ok) return;
      const lines = (await res.text()).split(/\r?\n/).map(l => l.trim());
      const l1 = lines.find(l => l.startsWith('1 ')), l2 = lines.find(l => l.startsWith('2 '));
      if (l1 && l2) got[sat.id] = [l1, l2];
    } catch {} // çevrimdışı: eldeki veriyle devam
  }));
  if (!Object.keys(got).length) return false;
  store = { fetchedAt: Date.now(), sats: { ...store.sats, ...got } };
  for (const id of Object.keys(got)) delete recs[id];
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
  return true;
}

function satrec(id) {
  if (recs[id]) return recs[id];
  const tle = store.sats[id];
  if (!tle || !SL()) return null;
  try { return (recs[id] = SL().twoline2satrec(tle[0], tle[1])); } catch { return null; }
}

// Yörünge verisinin ait olduğu an
const epochOf = rec => new Date((rec.jdsatepoch - 2440587.5) * 86400e3);

export const hasData = sat => !!satrec(sat.id);

// Uydu Güneş ışığı alıyor mu? (Dünya'nın gölgesi silindir kabul edilir: birkaç saniyelik hata)
function sunlit(eci, date) {
  const s = A().GeoVector('Sun', date, true);
  const len = Math.hypot(s.x, s.y, s.z);
  const ux = s.x / len, uy = s.y / len, uz = s.z / len;
  const along = eci.x * ux + eci.y * uy + eci.z * uz;
  if (along > 0) return true; // Güneş tarafında
  const px = eci.x - along * ux, py = eci.y - along * uy, pz = eci.z - along * uz;
  return Math.hypot(px, py, pz) > EARTH_KM;
}

// Belli bir anda istasyonun yeri: azimut, yükseklik, uzaklık, güneşte mi, tahmini parlaklık
export function satPosition(sat, date, loc) {
  const rec = satrec(sat.id);
  if (!rec || Math.abs(date - epochOf(rec)) > MAX_AGE_MS) return null;
  const pv = SL().propagate(rec, date);
  if (!pv?.position) return null;
  const gmst = SL().gstime(date);
  const look = SL().ecfToLookAngles(
    { longitude: loc.lon * RAD, latitude: loc.lat * RAD, height: 0 },
    SL().eciToEcf(pv.position, gmst),
  );
  const distKm = look.rangeSat;
  const geo = SL().eciToGeodetic(pv.position, gmst);
  return {
    az: (look.azimuth / RAD + 360) % 360,
    alt: look.elevation / RAD,
    distKm,
    heightKm: geo.height,
    sunlit: sunlit(pv.position, date),
    // Standart parlaklık 1000 km uzaklık içindir; uzaklığa göre ölçekle (evre etkisi ihmal edildi)
    mag: sat.stdMag + 5 * Math.log10(distKm / 1000),
  };
}

// Bak ekranı: şu anda gözle görülebilen istasyonlar
export function visibleSats(date, loc, obs) {
  if (!loc || sunAltitude(date, obs) > DIM_SKY) return [];
  return SATS.map(obj => ({ obj, p: satPosition(obj, date, loc) }))
    .filter(({ p }) => p && p.alt > 0 && p.sunlit)
    .map(({ obj, p }) => ({ obj, ...p }));
}

// Görünür geçişler: istasyon ufkun minAlt° üstünde, Güneş ışığı alıyor ve gökyüzü karanlık.
// Bir dakikadan kısa görünenler listelenmez: yükselir yükselmez gölgeye giren geçişi kimse yakalayamaz.
export function passes(sat, from, to, loc, obs, { minAlt = 10, stepMs = 20e3, minMs = 60e3 } = {}) {
  if (!hasData(sat)) return [];
  const out = [];
  let cur = null, sunAt = -Infinity, sunAlt = 0;
  for (let t = from.getTime(); t <= to.getTime(); t += stepMs) {
    const d = new Date(t);
    if (t - sunAt >= 300e3) { sunAlt = sunAltitude(d, obs); sunAt = t; } // Güneş yavaş hareket eder
    const p = sunAlt < DARK_SKY ? satPosition(sat, d, loc) : null;
    if (p && p.alt >= minAlt && p.sunlit) {
      if (!cur) cur = { obj: sat, start: d, startAz: p.az, maxAlt: p.alt, maxAz: p.az, mag: p.mag };
      if (p.alt > cur.maxAlt) { cur.maxAlt = p.alt; cur.maxAz = p.az; }
      cur.mag = Math.min(cur.mag, p.mag);
      cur.end = d; cur.endAz = p.az;
    } else if (cur) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out.filter(p => p.end - p.start >= minMs || (p.start <= from && p.end >= to));
}
