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

test('aynı anahtar bir dilde iki kez yazılmamış (sonraki öncekini sessizce ezer)', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../js/i18n.js', import.meta.url), 'utf8');
  const [, tr, en] = src.split(/\n  (?:tr|en): \{/);
  for (const [lang, block] of [['tr', tr], ['en', en.split('\n  },')[0]]]) {
    const keys = [...block.matchAll(/'([\w.]+)':/g)].map(m => m[1]);
    assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], `${lang} içinde tekrar eden anahtar`);
  }
});
