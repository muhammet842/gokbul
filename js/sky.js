// Gökyüzü hesapları. Tüm astronomi işini astronomy-engine yapar (window.Astronomy).
import { BODIES, STARS, ALL } from './objects.js';

const A = window.Astronomy;
const KM_PER_AU = A.KM_PER_AU ?? 149597870.7;
const RAD = Math.PI / 180;

export const makeObserver = loc => new A.Observer(loc.lat, loc.lon, 0);

export function sunAltitude(date, obs) {
  const eq = A.Equator('Sun', date, obs, true, true);
  return A.Horizon(date, obs, eq.ra, eq.dec, 'normal').altitude;
}

// Bir cismin o anki yeri: azimut (kuzeyden saat yönünde), yükseklik, parlaklık
export function position(obj, date, obs) {
  let ra = obj.ra, dec = obj.dec, mag = obj.mag, distKm = null;
  if (obj.body) {
    const eq = A.Equator(obj.body, date, obs, true, true);
    ra = eq.ra; dec = eq.dec; distKm = eq.dist * KM_PER_AU;
    mag = A.Illumination(obj.body, date).mag;
  }
  const hor = A.Horizon(date, obs, ra, dec, 'normal');
  return { az: hor.azimuth, alt: hor.altitude, mag, distKm };
}

// Gökyüzünde iki nokta arasındaki açı (derece)
export function separation(az1, alt1, az2, alt2) {
  const c = Math.sin(alt1 * RAD) * Math.sin(alt2 * RAD) +
            Math.cos(alt1 * RAD) * Math.cos(alt2 * RAD) * Math.cos((az1 - az2) * RAD);
  return Math.acos(Math.min(1, Math.max(-1, c))) / RAD;
}

// Şu anda ufkun üstündeki ve gözle görülebilecek kadar parlak olan cisimler
export function visibleNow(date, obs) {
  const sun = sunAltitude(date, obs);
  // Gündüz sadece Ay ve Venüs, alacakaranlıkta parlak olanlar, gece hepsi
  const limit = sun > -1 ? -3.5 : sun > -8 ? 1 : 6;
  return ALL.map(o => ({ obj: o, ...position(o, date, obs) }))
    .filter(p => p.alt > -1 && (p.mag <= limit || p.obj.id === 'moon'));
}

// Telefonun baktığı yöne en yakın cisimler, en olası olan başta.
// Parlak cisimler biraz öne alınır: pusula hatası varken insanlar zaten parlak olana bakıyordur.
export function identify(az, alt, sky, maxSep = 16) {
  return sky
    .map(p => ({ ...p, sep: separation(az, alt, p.az, p.alt) }))
    .filter(p => p.sep <= maxSep)
    .map(p => ({ ...p, score: p.sep + Math.max(p.mag, -3) * 1.5 }))
    .sort((a, b) => a.score - b.score);
}

// Belli bir yöne (±50°) bakan kişi için o taraftaki en parlak cisim
export function brightestToward(az, kind, date, obs) {
  const pool = kind === 'planet' ? BODIES : STARS;
  return visibleNow(date, obs)
    .filter(p => pool.includes(p.obj) && p.obj.id !== 'moon' && p.alt > 3) // Ay'ı herkes tanır
    .filter(p => Math.abs(((p.az - az + 540) % 360) - 180) <= 50)
    .sort((a, b) => a.mag - b.mag)[0] ?? null;
}

// Bu gecenin karanlık aralığı: güneş battıktan 30 dk sonra → doğmadan 30 dk önce
export function nightWindow(now, obs) {
  const noon = new Date(now); noon.setHours(12, 0, 0, 0);
  if (now < noon && sunAltitude(now, obs) < -6) noon.setDate(noon.getDate() - 1); // gece yarısından sonra: dünkü gece
  const sunset = A.SearchRiseSet('Sun', obs, -1, noon, 1)?.date;
  const sunrise = sunset && A.SearchRiseSet('Sun', obs, +1, sunset, 1)?.date;
  if (!sunset || !sunrise) return null; // kutup bölgeleri
  const start = new Date(sunset.getTime() + 30 * 60e3);
  const end = new Date(sunrise.getTime() - 30 * 60e3);
  return { sunset, sunrise, start: now > start ? now : start, end };
}

const STAR_PICKS = ['sirius', 'vega', 'capella', 'arcturus', 'betelgeuse', 'pleiades'];

// "Bu gece" listesi: her cisim için ufkun 10° üstüne ilk çıktığı an
export function tonight(now, obs, max = 6) {
  const win = nightWindow(now, obs);
  if (!win || win.start >= win.end) return { win, items: [] };
  const candidates = [...BODIES, ...STARS.filter(s => STAR_PICKS.includes(s.id))];
  const items = [];
  for (const obj of candidates) {
    for (let t = win.start.getTime(); t <= win.end.getTime(); t += 10 * 60e3) {
      const d = new Date(t);
      const p = position(obj, d, obs);
      if (!obj.body && t > win.start.getTime() + 4 * 3600e3) break; // yıldızlar: sadece akşamın ilk saatleri
      if (p.alt >= 10 && p.mag <= 3) {
        const sets = obj.body ? A.SearchRiseSet(obj.body, obs, -1, d, 1)?.date : null;
        items.push({ obj, time: d, isNow: t === win.start.getTime() && now >= win.start, ...p,
                     sets: sets && sets < win.end ? sets : null });
        break;
      }
    }
  }
  // Önce Ay ve gezegenler, sonra parlak yıldızlar; sonra saate göre sırala
  const planets = items.filter(i => i.obj.body);
  const stars = items.filter(i => !i.obj.body).sort((a, b) => a.mag - b.mag);
  return { win, items: [...planets, ...stars].slice(0, max).sort((a, b) => a.time - b.time) };
}

export function moonPercent(date) {
  return Math.round(A.Illumination('Moon', date).phase_fraction * 100);
}

// Evre çizimi için: aydınlık kısım ve hangi tarafın aydınlık olduğu
export function phaseOf(obj, date) {
  if (!['moon', 'venus', 'mercury'].includes(obj.id)) return null;
  const k = A.Illumination(obj.body, date).phase_fraction;
  const litRight = obj.id === 'moon'
    ? A.MoonPhase(date) < 180
    : A.Elongation(obj.body, date).visibility === 'evening';
  return { k, litRight };
}
