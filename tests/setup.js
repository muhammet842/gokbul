// Testler için tarayıcı ortamını taklit et: sky.js astronomy-engine'i window.Astronomy'den okur.
// Saat dilimi sabit olsun ki "bu gece" hesapları her bilgisayarda aynı sonucu versin.
process.env.TZ = 'Europe/Istanbul';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
globalThis.window = { Astronomy: require('../vendor/astronomy.browser.min.js') };
