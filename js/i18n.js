// Arayüz metinleri. Yeni bir metin eklerken iki dile de eklemeyi unutma.

export const STRINGS = {
  tr: {
    'tab.bak': 'Bak', 'tab.gece': 'Bu gece', 'tab.sor': 'Sor',
    'bak.start': 'Telefonu gökyüzüne tut', 'bak.startHint': 'Pusula ve konum izni istenecek',
    'bak.why': 'Ayrıntılı bilgi →', 'bak.ring': 'Halkada {n} cisim var · hangisine bakıyorsun?',
    'bak.horizon': 'Ufuk', 'bak.altitude': 'Yükseklik', 'bak.below': 'Ufkun altında',
    'bak.steady': 'titreşmez', 'bak.twinkles': 'titreşir', 'bak.moving': 'hızla kayar', 'bak.fuzzy': 'bulanık leke',
    'gece.pass': 'Geçiş', 'gece.passNote': '{m} dk görünür · en parlak {mag} kadir',
    'sat.noData': 'Yörünge verisi yok (internet gerekli)', 'sat.noPass': 'Bu gece görünür geçiş yok', 'sat.height': 'Yükseklik',
    'sor.satLive': 'Şu an {n} gökyüzünde: {w}.',
    'yer.label': 'Konum', 'yer.gps': 'Konumumu kullan (GPS)', 'yer.change': 'Değiştir',
    'yer.near': '{c} yakını', 'yer.here': 'Bulunduğun yer', 'yer.default': 'Ankara (varsayılan)', 'yer.noGps': 'Konum alınamadı, şehrini seç',
    'yer.N': 'K', 'yer.S': 'G', 'yer.E': 'D', 'yer.W': 'B',
    'bak.starting': 'Pusula başlatılıyor…',
    'gece.title': 'Bu gece', 'gece.sunsetLbl': 'Gün batımı', 'gece.sunriseLbl': 'Gün doğumu',
    'gece.moonLbl': 'Ay', 'gece.moonPct': '%{p} aydınlık', 'gece.night': 'Gece', 'gece.now': 'Şimdi',
    'gece.atDusk': 'Akşam', 'gece.rises': 'Yükselir', 'gece.top': 'Tepede',
    'gece.fist': 'Yumruk', 'gece.fist1': '1 yumruk', 'gece.fistN': '{n} yumruk', 'gece.hint': 'Bir yumruk ≈ 10°. Kolunu uzat, yumruğunu ufka koy ve say.',
    'gece.empty': 'Şu an görülecek parlak bir gezegen yok. Yine de yıldızlara bak!',
    'gece.above': 'ufkun {n} yumruk üstü', 'gece.above1': 'ufkun 1 yumruk üstü', 'gece.overhead': 'neredeyse tepede',
    'gece.sets': 'Batış: {t}',
    'gece.locating': 'Konum bekleniyor…',
    'sor.q': 'Soru {n} / {m}', 'sor.restart': 'Baştan başla', 'sor.unsure': 'Emin değilim, ipucu ver',
    'sor.footer': 'Pusula veya internet gerekmez',
    'sor.move': 'Işık gökyüzünde hareket ediyor mu?', 'sor.moveHint': 'Bir binanın ya da ağacın kenarına göre yarım dakika izle.',
    'sor.moveYes': 'Evet, kayıyor', 'sor.moveNo': 'Hayır, yerinde duruyor',
    'sor.blink': 'Yanıp sönüyor ya da renkli ışıkları var mı?', 'sor.blinkHint': 'Uçakların kanat uçlarında kırmızı-yeşil ve yanıp sönen beyaz ışıklar olur.',
    'sor.blinkYes': 'Evet, yanıp sönüyor', 'sor.blinkNo': 'Hayır, sabit ışıkla kayıyor',
    'sor.twinkle': 'Işığı titreşiyor mu, yoksa sakin mi parlıyor?', 'sor.twinkleHint': 'Birkaç saniye gözünü ayırmadan bak. Yıldızlar göz kırpar gibi titrer, gezegenler sakin durur.',
    'sor.twinkleYes': 'Titreşiyor, göz kırpıyor', 'sor.twinkleNo': 'Sakin, sabit parlıyor',
    'sor.dir': 'Hangi yöne bakıyorsun?', 'sor.dirHint': 'Güneşin battığı taraf batıdır. Tam bilmesen de en yakın yönü seç.',
    'sor.plane': 'Uçak', 'sor.planeNote': 'Yanıp sönen seyrüsefer ışıkları ve düzenli bir rota uçağa işaret eder.',
    'sor.sat': 'Uydu ya da Uzay İstasyonu', 'sor.satNote': 'Yanıp sönmeden sabit hızla kayan ve birkaç dakika içinde kaybolan ışık bir yapay uydudur. En parlak geçişler genellikle Uluslararası Uzay İstasyonu’na aittir.',
    'sor.none': 'Bu yönde parlak bir cisim bulunamadı', 'sor.noneNote': 'Gözlenen ışık, kataloğdaki parlak cisimlerle eşleşmedi; sönük bir yıldız veya uydu olması muhtemeldir. Konumu “Bak” ekranıyla doğrulayabilirsin.',
    'sor.result': 'Sonuç', 'sor.noMatch': 'Eşleşme yok',
    'sor.hint.move': 'İpucu: Yıldızlar ve gezegenler birkaç dakikada fark edilir şekilde yer değiştirmez.',
    'sor.hint.blink': 'İpucu: Uydu ışığı yanıp sönmez; bazen birden kararıp kaybolur.',
    'sor.hint.twinkle': 'İpucu: Ufka yakın yıldızlar daha çok titrer. Emin değilsen “Sakin” seç.',
    'sor.hint.dir': 'İpucu: Kutup Yıldızı kuzeyi gösterir; Güneş batıda batar.',
    'sor.again': 'Yeni bir cisim sor',
    'dir.K': 'Kuzey', 'dir.KD': 'Kuzeydoğu', 'dir.D': 'Doğu', 'dir.GD': 'Güneydoğu', 'dir.G': 'Güney', 'dir.GB': 'Güneybatı', 'dir.B': 'Batı', 'dir.KB': 'Kuzeybatı',
    'cisim.back': '← Geri', 'cisim.tonight': 'Bu akşam', 'cisim.where': 'Nereye bak', 'cisim.dist': 'Uzaklık', 'cisim.mag': 'Parlaklık',
    'cisim.three': 'Bilmen gereken üç şey', 'cisim.km': '{n} milyon km', 'cisim.ly': '—', 'cisim.magUnit': 'kadir',
    'tm.title': 'Zaman makinesi', 'tm.now': 'Şimdiye dön', 'tm.evening': 'Bu akşam', 'tm.late': 'Gece yarısından sonra',
    'theme.toDay': 'Gündüz temasına geç', 'theme.toNight': 'Gece temasına geç',
    'cisim.notUp': 'Şu an ufkun altında', 'cisim.allNight': 'Bütün gece',
  },
  en: {
    'tab.bak': 'Look', 'tab.gece': 'Tonight', 'tab.sor': 'Ask',
    'bak.start': 'Hold your phone up to the sky', 'bak.startHint': 'We’ll ask for compass and location access',
    'bak.why': 'Full details →', 'bak.ring': '{n} objects in the ring · which one are you looking at?',
    'bak.horizon': 'Horizon', 'bak.altitude': 'Altitude', 'bak.below': 'Below the horizon',
    'bak.steady': 'steady', 'bak.twinkles': 'twinkles', 'bak.moving': 'moves fast', 'bak.fuzzy': 'fuzzy patch',
    'gece.pass': 'Pass', 'gece.passNote': 'Visible {m} min · peak {mag} mag',
    'sat.noData': 'No orbit data (needs internet)', 'sat.noPass': 'No visible pass tonight', 'sat.height': 'Height',
    'sor.satLive': 'Right now {n} is in the sky: {w}.',
    'yer.label': 'Location', 'yer.gps': 'Use my location (GPS)', 'yer.change': 'Change',
    'yer.near': 'Near {c}', 'yer.here': 'Your location', 'yer.default': 'Ankara (default)', 'yer.noGps': 'No location, pick your city',
    'yer.N': 'N', 'yer.S': 'S', 'yer.E': 'E', 'yer.W': 'W',
    'bak.starting': 'Starting compass…',
    'gece.title': 'Tonight', 'gece.sunsetLbl': 'Sunset', 'gece.sunriseLbl': 'Sunrise',
    'gece.moonLbl': 'Moon', 'gece.moonPct': '{p}% lit', 'gece.night': 'Night', 'gece.now': 'Now',
    'gece.atDusk': 'At dusk', 'gece.rises': 'Rises', 'gece.top': 'Overhead',
    'gece.fist': 'Fist', 'gece.fist1': '1 fist', 'gece.fistN': '{n} fists', 'gece.hint': 'One fist ≈ 10°. Stretch out your arm, rest your fist on the horizon and count.',
    'gece.empty': 'No bright planets right now. Look at the stars anyway!',
    'gece.above': '{n} fists above the horizon', 'gece.above1': '1 fist above the horizon', 'gece.overhead': 'almost overhead',
    'gece.sets': 'Sets: {t}',
    'gece.locating': 'Waiting for location…',
    'sor.q': 'Question {n} / {m}', 'sor.restart': 'Start over', 'sor.unsure': 'Not sure, give me a hint',
    'sor.footer': 'No compass or internet needed',
    'sor.move': 'Is the light moving across the sky?', 'sor.moveHint': 'Watch it against the edge of a building or tree for half a minute.',
    'sor.moveYes': 'Yes, it’s gliding', 'sor.moveNo': 'No, it stays put',
    'sor.blink': 'Is it blinking or does it have coloured lights?', 'sor.blinkHint': 'Planes have red and green wingtip lights and a flashing white light.',
    'sor.blinkYes': 'Yes, it blinks', 'sor.blinkNo': 'No, a steady gliding light',
    'sor.twinkle': 'Does it twinkle, or shine calmly?', 'sor.twinkleHint': 'Keep your eyes on it for a few seconds. Stars twinkle, planets stay calm.',
    'sor.twinkleYes': 'It twinkles', 'sor.twinkleNo': 'Calm and steady',
    'sor.dir': 'Which way are you facing?', 'sor.dirHint': 'The Sun sets in the west. Pick the closest direction.',
    'sor.plane': 'Aeroplane', 'sor.planeNote': 'Flashing navigation lights on a steady path indicate an aircraft.',
    'sor.sat': 'Satellite or Space Station', 'sor.satNote': 'A steady light gliding at constant speed and fading within minutes is an artificial satellite. The brightest passes usually belong to the International Space Station.',
    'sor.none': 'No bright object found in this direction', 'sor.noneNote': 'The light did not match any bright object in the catalogue; it is likely a fainter star or a satellite. Check its position with the “Look” screen.',
    'sor.result': 'Result', 'sor.noMatch': 'No match',
    'sor.hint.move': 'Hint: stars and planets don’t visibly shift within a few minutes.',
    'sor.hint.blink': 'Hint: satellites don’t blink; sometimes they suddenly fade out.',
    'sor.hint.twinkle': 'Hint: stars near the horizon twinkle more. If unsure, pick “Calm”.',
    'sor.hint.dir': 'Hint: Polaris marks north; the Sun sets in the west.',
    'sor.again': 'Ask about another object',
    'dir.K': 'North', 'dir.KD': 'North-east', 'dir.D': 'East', 'dir.GD': 'South-east', 'dir.G': 'South', 'dir.GB': 'South-west', 'dir.B': 'West', 'dir.KB': 'North-west',
    'cisim.back': '← Back', 'cisim.tonight': 'This evening', 'cisim.where': 'Where to look', 'cisim.dist': 'Distance', 'cisim.mag': 'Brightness',
    'cisim.three': 'Three things to know', 'cisim.km': '{n} million km', 'cisim.ly': '—', 'cisim.magUnit': 'mag',
    'tm.title': 'Time machine', 'tm.now': 'Back to now', 'tm.evening': 'This evening', 'tm.late': 'After midnight',
    'theme.toDay': 'Switch to day theme', 'theme.toNight': 'Switch to night theme',
    'cisim.notUp': 'Below the horizon now', 'cisim.allNight': 'All night',
  },
};

let lang = localStorageGet('gokbul.lang') || (navigator.language?.startsWith('tr') ? 'tr' : 'en');

function localStorageGet(k) { try { return localStorage.getItem(k); } catch { return null; } }

export const getLang = () => lang;
export function setLang(l) {
  lang = l;
  try { localStorage.setItem('gokbul.lang', l); } catch {}
  document.documentElement.lang = l;
}

export function t(key, vars = {}) {
  const s = STRINGS[lang][key] ?? STRINGS.tr[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

// Bir cismin dil alanını seç: { tr, en } → metin
export const L = obj => obj?.[lang] ?? obj?.tr;

// Türkçe büyük harf: "i" → "İ" (CSS text-transform lang="tr" ile de çalışır ama garantiye alıyoruz)
export const upper = s => lang === 'tr' ? s.toLocaleUpperCase('tr-TR') : s.toUpperCase();

export const locale = () => (lang === 'tr' ? 'tr-TR' : 'en-GB');
