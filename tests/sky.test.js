// Gökyüzü hesaplarının bilinen olaylarla karşılaştırılması. Çalıştır: npm test
import './setup.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const sky = await import('../js/sky.js');
const { byId, ALL } = await import('../js/objects.js');

const ANKARA = sky.makeObserver({ lat: 39.925, lon: 32.837 });
const at = s => new Date(s);
const minutesBetween = (a, b) => Math.abs(a - b) / 60e3;

test('Ay evresi: dolunay %100, yeniay %0', () => {
  assert.equal(sky.moonPercent(at('2024-01-25T17:54:00Z')), 100); // 25 Ocak 2024 dolunayı
  assert.equal(sky.moonPercent(at('2024-04-08T18:21:00Z')), 0);   // 8 Nisan 2024 güneş tutulması
});

test('Ankara gün batımı saatleri (±5 dk)', () => {
  const yaz = sky.nightWindow(at('2024-06-21T19:00:00+03:00'), ANKARA);
  assert.ok(minutesBetween(yaz.sunset, at('2024-06-21T20:20:00+03:00')) < 5, `yaz: ${yaz.sunset}`);
  const kis = sky.nightWindow(at('2024-12-21T19:00:00+03:00'), ANKARA);
  assert.ok(minutesBetween(kis.sunset, at('2024-12-21T17:27:00+03:00')) < 5, `kış: ${kis.sunset}`);
});

test('gece yarısından sonra açılınca dünkü gece kullanılır', () => {
  const aksam = sky.nightWindow(at('2024-12-21T19:00:00+03:00'), ANKARA);
  const gece = sky.nightWindow(at('2024-12-22T02:00:00+03:00'), ANKARA);
  assert.equal(gece.sunset.getTime(), aksam.sunset.getTime());
  assert.ok(gece.start <= at('2024-12-22T02:00:00+03:00'));
});

test('karanlık aralık: gün batımından 30 dk sonra başlar, doğuştan 30 dk önce biter', () => {
  const w = sky.nightWindow(at('2024-12-21T12:30:00+03:00'), ANKARA);
  assert.equal(w.start - w.sunset, 30 * 60e3);
  assert.equal(w.sunrise - w.end, 30 * 60e3);
});

test('Kutup Yıldızı: kuzeyde, yüksekliği enleme yakın', () => {
  const p = sky.position(byId('polaris'), at('2024-12-21T21:00:00+03:00'), ANKARA);
  assert.ok(Math.min(p.az, 360 - p.az) < 2, `az ${p.az}`);
  assert.ok(Math.abs(p.alt - 39.9) < 1.5, `alt ${p.alt}`);
});

test('Aralık 2024 akşamı: Venüs, Jüpiter ve Satürn listede; Venüs akşam evresinde', () => {
  const { items } = sky.tonight(at('2024-12-21T19:00:00+03:00'), ANKARA);
  const ids = items.map(i => i.obj.id);
  for (const id of ['venus', 'jupiter', 'saturn']) assert.ok(ids.includes(id), `${id} yok: ${ids}`);
  assert.ok(items.every((x, i) => i === 0 || items[i - 1].time <= x.time), 'saate göre sıralı değil');

  const ph = sky.phaseOf(byId('venus'), at('2024-12-21T18:00:00+03:00'));
  assert.ok(ph.k > 0.5 && ph.k < 0.7, `evre ${ph.k}`);
  assert.equal(ph.litRight, true);
  assert.equal(sky.phaseOf(byId('jupiter'), at('2024-12-21T18:00:00+03:00')), null);
});

test('separation: temel açılar', () => {
  assert.equal(Math.round(sky.separation(0, 0, 90, 0)), 90);
  assert.equal(Math.round(sky.separation(123, 45, 123, 45)), 0);
  assert.equal(Math.round(sky.separation(10, 89, 190, 89)), 2); // tepe noktasının iki yanı
});

test('identify: tam bakılan cisim ilk sırada, uzaktakiler elenir', () => {
  const date = at('2024-12-21T21:00:00+03:00');
  const visible = sky.visibleNow(date, ANKARA);
  const jup = visible.find(p => p.obj.id === 'jupiter');
  assert.ok(jup, 'Jüpiter görünür olmalı');
  assert.equal(sky.identify(jup.az, jup.alt, visible)[0].obj.id, 'jupiter');
  assert.ok(sky.identify(jup.az, jup.alt, visible).every(h => h.sep <= 16));
});

test('visibleNow: gündüz yalnızca çok parlak cisimler', () => {
  const noon = sky.visibleNow(at('2024-12-21T12:30:00+03:00'), ANKARA);
  assert.ok(noon.every(p => p.mag <= -3.5 || p.obj.id === 'moon'), noon.map(p => p.obj.id).join());
});

test('cisim kataloğu: her cismin iki dilde adı ve notu var, id tekrarı yok', () => {
  const ids = new Set();
  for (const o of ALL) {
    assert.ok(o.name.tr && o.name.en && o.note.tr && o.note.en, o.id);
    assert.ok(!ids.has(o.id), `tekrar: ${o.id}`);
    ids.add(o.id);
  }
});
