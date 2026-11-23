// Arayüz metinleri iki dilde de eksiksiz mi? Çalıştır: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS } from '../js/i18n.js';

test('her Türkçe metnin İngilizcesi var (ve tersi)', () => {
  const tr = Object.keys(STRINGS.tr), en = Object.keys(STRINGS.en);
  assert.deepEqual(tr.filter(k => !(k in STRINGS.en)), [], 'İngilizcesi eksik');
  assert.deepEqual(en.filter(k => !(k in STRINGS.tr)), [], 'Türkçesi eksik');
});

test('yer tutucular ({n}, {t}…) iki dilde aynı', () => {
  const vars = s => (s.match(/\{\w+\}/g) ?? []).sort().join();
  for (const k of Object.keys(STRINGS.tr)) assert.equal(vars(STRINGS.en[k]), vars(STRINGS.tr[k]), k);
});
