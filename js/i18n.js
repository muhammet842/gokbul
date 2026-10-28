// Arayüz metinleri. Yeni bir metin eklerken iki dile de eklemeyi unutma.

const STRINGS = {
  tr: {
    'tab.bak': 'Bak', 'tab.gece': 'Bu gece', 'tab.sor': 'Sor',
    'bak.start': 'Telefonu gökyüzüne tut', 'bak.startHint': 'Pusula ve konum izni istenecek',
    'bak.nosensor': 'Bu cihazda pusula yok. Ekranı parmağınla kaydırarak etrafa bakabilirsin.',
    'bak.likely': 'Büyük ihtimalle', 'bak.maybe': 'Olabilir', 'bak.nothing': 'Burada belirgin bir cisim yok',
    'bak.nothingHint': 'Telefonu yavaşça parlak bir noktaya doğru çevir.',
    'bak.why': 'Daha fazlası →', 'bak.other': 'Diğer aday',
    'bak.horizon': 'Ufuk', 'bak.altitude': 'Yükseklik', 'bak.below': 'Ufkun altında',
    'gece.title': 'Bu gece', 'gece.sunset': 'Gün batımı {t}', 'gece.sunsetPast': 'Gün batımı {t}',
    'gece.moon': 'Ay %{p}', 'gece.night': 'Gece', 'gece.now': 'Şimdi',
    'gece.fist': 'YMR', 'gece.hint': 'Bir yumruk ≈ 10°. Kolunu uzat, yumruğunu ufka koy ve say.',
    'gece.empty': 'Şu an görülecek parlak bir gezegen yok. Yine de yıldızlara bak!',
    'gece.above': 'ufkun {n} yumruk üstü', 'gece.above1': 'ufkun 1 yumruk üstü', 'gece.overhead': 'neredeyse tepede',
    'gece.sets': 'Batış: {t}', 'gece.rises': 'Doğuş: {t}',
    'gece.locating': 'Konum bekleniyor…', 'gece.defaultLoc': 'Konum alınamadı, Ankara kullanılıyor',
    'sor.q': 'Soru {n} / {m}', 'sor.restart': 'Baştan başla', 'sor.unsure': 'Emin değilim, ipucu ver',
    'sor.footer': 'Pusula veya internet gerekmez',
    'sor.move': 'Işık gökyüzünde hareket ediyor mu?', 'sor.moveHint': 'Bir binanın ya da ağacın kenarına göre yarım dakika izle.',
    'sor.moveYes': 'Evet, kayıyor', 'sor.moveNo': 'Hayır, yerinde duruyor',
    'sor.blink': 'Yanıp sönüyor ya da renkli ışıkları var mı?', 'sor.blinkHint': 'Uçakların kanat uçlarında kırmızı-yeşil ve yanıp sönen beyaz ışıklar olur.',
    'sor.blinkYes': 'Evet, yanıp sönüyor', 'sor.blinkNo': 'Hayır, sabit ışıkla kayıyor',
    'sor.twinkle': 'Işığı titreşiyor mu, yoksa sakin mi parlıyor?', 'sor.twinkleHint': 'Birkaç saniye gözünü ayırmadan bak. Yıldızlar göz kırpar gibi titrer, gezegenler sakin durur.',
    'sor.twinkleYes': 'Titreşiyor, göz kırpıyor', 'sor.twinkleNo': 'Sakin, sabit parlıyor',
    'sor.dir': 'Hangi yöne bakıyorsun?', 'sor.dirHint': 'Güneşin battığı taraf batıdır. Tam bilmesen de en yakın yönü seç.',
    'sor.plane': 'Uçak', 'sor.planeNote': 'Yanıp sönen ışıklar ve sabit bir rota: büyük ihtimalle bir uçak.',
    'sor.sat': 'Uydu ya da Uzay İstasyonu', 'sor.satNote': 'Sabit ışıkla sessizce kayan, birkaç dakikada kaybolan nokta bir uydudur. Çok parlaksa Uluslararası Uzay İstasyonu olabilir.',
    'sor.none': 'Bu yönde parlak bir cisim bulamadım', 'sor.noneNote': 'Gördüğün şey sönük bir yıldız ya da bir uydu olabilir. Bir de “Bak” ekranıyla dene.',
    'sor.hint.move': 'İpucu: Yıldızlar ve gezegenler birkaç dakikada fark edilir şekilde yer değiştirmez.',
    'sor.hint.blink': 'İpucu: Uydu ışığı yanıp sönmez; bazen birden kararıp kaybolur.',
    'sor.hint.twinkle': 'İpucu: Ufka yakın yıldızlar daha çok titrer. Emin değilsen “Sakin” seç.',
    'sor.hint.dir': 'İpucu: Kutup Yıldızı kuzeyi gösterir; Güneş batıda batar.',
    'sor.again': 'Yeni bir cisim sor',
    'dir.K': 'Kuzey', 'dir.KD': 'Kuzeydoğu', 'dir.D': 'Doğu', 'dir.GD': 'Güneydoğu', 'dir.G': 'Güney', 'dir.GB': 'Güneybatı', 'dir.B': 'Batı', 'dir.KB': 'Kuzeybatı',
    'cisim.back': '← Geri', 'cisim.tonight': 'Bu akşam', 'cisim.where': 'Nereye bak', 'cisim.dist': 'Uzaklık', 'cisim.mag': 'Parlaklık',
    'cisim.three': 'Bilmen gereken üç şey', 'cisim.km': '{n} milyon km', 'cisim.ly': '—', 'cisim.magUnit': 'kadir',
    'theme.toDay': 'Gündüz temasına geç', 'theme.toNight': 'Gece temasına geç',
    'cisim.notUp': 'Şu an ufkun altında', 'cisim.allNight': 'Bütün gece',
  },
  en: {
    'tab.bak': 'Look', 'tab.gece': 'Tonight', 'tab.sor': 'Ask',
    'bak.start': 'Hold your phone up to the sky', 'bak.startHint': 'We’ll ask for compass and location access',
    'bak.nosensor': 'No compass on this device. Drag the screen with your finger to look around.',
    'bak.likely': 'Most likely', 'bak.maybe': 'Could be', 'bak.nothing': 'Nothing notable here',
    'bak.nothingHint': 'Slowly turn the phone towards a bright dot.',
    'bak.why': 'Learn more →', 'bak.other': 'Other candidate',
    'bak.horizon': 'Horizon', 'bak.altitude': 'Altitude', 'bak.below': 'Below the horizon',
    'gece.title': 'Tonight', 'gece.sunset': 'Sunset at {t}', 'gece.sunsetPast': 'Sun set at {t}',
    'gece.moon': 'Moon {p}%', 'gece.night': 'Night', 'gece.now': 'Now',
    'gece.fist': 'FST', 'gece.hint': 'One fist ≈ 10°. Stretch out your arm, rest your fist on the horizon and count.',
    'gece.empty': 'No bright planets right now. Look at the stars anyway!',
    'gece.above': '{n} fists above the horizon', 'gece.above1': '1 fist above the horizon', 'gece.overhead': 'almost overhead',
    'gece.sets': 'Sets: {t}', 'gece.rises': 'Rises: {t}',
    'gece.locating': 'Waiting for location…', 'gece.defaultLoc': 'No location, using Ankara',
    'sor.q': 'Question {n} / {m}', 'sor.restart': 'Start over', 'sor.unsure': 'Not sure, give me a hint',
    'sor.footer': 'No compass or internet needed',
    'sor.move': 'Is the light moving across the sky?', 'sor.moveHint': 'Watch it against the edge of a building or tree for half a minute.',
    'sor.moveYes': 'Yes, it’s gliding', 'sor.moveNo': 'No, it stays put',
    'sor.blink': 'Is it blinking or does it have coloured lights?', 'sor.blinkHint': 'Planes have red and green wingtip lights and a flashing white light.',
    'sor.blinkYes': 'Yes, it blinks', 'sor.blinkNo': 'No, a steady gliding light',
    'sor.twinkle': 'Does it twinkle, or shine calmly?', 'sor.twinkleHint': 'Keep your eyes on it for a few seconds. Stars twinkle, planets stay calm.',
    'sor.twinkleYes': 'It twinkles', 'sor.twinkleNo': 'Calm and steady',
    'sor.dir': 'Which way are you facing?', 'sor.dirHint': 'The Sun sets in the west. Pick the closest direction.',
    'sor.plane': 'Aeroplane', 'sor.planeNote': 'Blinking lights on a steady path: almost certainly a plane.',
    'sor.sat': 'Satellite or Space Station', 'sor.satNote': 'A steady light gliding silently and fading within minutes is a satellite. If it is very bright, it may be the International Space Station.',
    'sor.none': 'I couldn’t find a bright object that way', 'sor.noneNote': 'It may be a fainter star or a satellite. Try the “Look” screen too.',
    'sor.hint.move': 'Hint: stars and planets don’t visibly shift within a few minutes.',
    'sor.hint.blink': 'Hint: satellites don’t blink; sometimes they suddenly fade out.',
    'sor.hint.twinkle': 'Hint: stars near the horizon twinkle more. If unsure, pick “Calm”.',
    'sor.hint.dir': 'Hint: Polaris marks north; the Sun sets in the west.',
    'sor.again': 'Ask about another object',
    'dir.K': 'North', 'dir.KD': 'North-east', 'dir.D': 'East', 'dir.GD': 'South-east', 'dir.G': 'South', 'dir.GB': 'South-west', 'dir.B': 'West', 'dir.KB': 'North-west',
    'cisim.back': '← Back', 'cisim.tonight': 'This evening', 'cisim.where': 'Where to look', 'cisim.dist': 'Distance', 'cisim.mag': 'Brightness',
    'cisim.three': 'Three things to know', 'cisim.km': '{n} million km', 'cisim.ly': '—', 'cisim.magUnit': 'mag',
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
