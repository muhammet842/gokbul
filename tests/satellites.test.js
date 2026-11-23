// Uzay istasyonu hesapları. CelesTrak'tan 22 Kasım 2026'da alınmış gerçek ISS yörünge verisiyle.
import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const sky = await import('../js/sky.js');
const sats = await import('../js/satellites.js');
const { byId, SATS } = await import('../js/objects.js');

const ISS = byId('iss');
sats.setTLE('iss',
  '1 25544U 98067A   26326.88107701  .00007004  00000+0  13256-3 0  9991',
  '2 25544  51.6321 234.7611 0007401  54.9189 305.2493 15.49554967596351');
const LOC = { lat: 39.925, lon: 32.837 }; // Ankara
const OBS = sky.makeObserver(LOC);
const at = s => new Date(s);

function sampleDay(fn) {
  for (let t = Date.parse('2026-11-23T00:00:00Z'); t < Date.parse('2026-11-24T00:00:00Z'); t += 60e3) fn(new Date(t));
}

test('ISS yüksekliği 400–450 km arasında kalır', () => {
  sampleDay(d => {
    const p = sats.satPosition(ISS, d, LOC);
    assert.ok(p.heightKm > 400 && p.heightKm < 450, `${d.toISOString()}: ${p.heightKm}`);
  });
});

test('ufkun üstündeyken uzaklık 400–2500 km (ufka yakınken uzak, tepedeyken yakın)', () => {
  sampleDay(d => {
    const p = sats.satPosition(ISS, d, LOC);
    if (p.alt > 0) assert.ok(p.distKm > 400 && p.distKm < 2500, `${p.alt}° → ${p.distKm} km`);
  });
});

test('yörüngenin bir kısmı Dünya’nın gölgesinde, çoğu güneşte', () => {
  let lit = 0, n = 0;
  sampleDay(d => { n++; if (sats.satPosition(ISS, d, LOC).sunlit) lit++; });
  assert.ok(lit / n > 0.5 && lit / n < 1, `güneşte geçen oran ${lit / n}`);
});

test('geçişler: başlangıç < bitiş, en fazla 12 dk, en az 10° yüksek, makul parlaklık', () => {
  const list = sats.passes(ISS, at('2026-11-23T17:00:00+03:00'), at('2026-11-25T07:00:00+03:00'), LOC, OBS);
  assert.ok(list.length > 0, 'iki gecede en az bir görünür geçiş olmalı');
  for (const p of list) {
    assert.ok(p.start < p.end || +p.start === +p.end);
    assert.ok(p.end - p.start <= 12 * 60e3, `süre ${(p.end - p.start) / 60e3} dk`);
    assert.ok(p.maxAlt >= 10 && p.maxAlt <= 90);
    assert.ok(p.mag > -4.5 && p.mag < 2, `parlaklık ${p.mag}`);
    // Geçiş sırasında gökyüzü karanlık olmalı
    assert.ok(sky.sunAltitude(p.start, OBS) < -5, `güneş ${sky.sunAltitude(p.start, OBS)}°`);
  }
});

test('gündüz ISS gösterilmez', () => {
  assert.deepEqual(sats.visibleSats(at('2026-11-23T12:30:00+03:00'), LOC, OBS), []);
});

test('14 günden eski yörünge verisiyle hesap yapılmaz', () => {
  assert.equal(sats.satPosition(ISS, at('2026-12-20T20:00:00+03:00'), LOC), null);
  assert.deepEqual(sats.passes(ISS, at('2026-12-20T17:00:00+03:00'), at('2026-12-21T07:00:00+03:00'), LOC, OBS), []);
});

test('verisi olmayan istasyon için hesap yok (çökmeden boş döner)', () => {
  const tg = byId('tiangong');
  assert.equal(sats.hasData(tg), false);
  assert.equal(sats.satPosition(tg, at('2026-11-23T20:00:00+03:00'), LOC), null);
});

test('istasyonların iki dilde adı, notu ve üç bilgisi var', () => {
  for (const s of SATS) {
    assert.ok(s.name.tr && s.name.en && s.note.tr && s.note.en, s.id);
    assert.equal(s.facts.tr.length, 3); assert.equal(s.facts.en.length, 3);
  }
});
