// Testler için tarayıcı ortamını taklit et: sky.js ve satellites.js kütüphaneleri window'dan okur.
// Saat dilimi sabit olsun ki "bu gece" hesapları her bilgisayarda aynı sonucu versin.
process.env.TZ = 'Europe/Istanbul';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = {
  Astronomy: require('../vendor/astronomy.browser.min.js'),
  satellite: require('../vendor/satellite.min.js'),
};
