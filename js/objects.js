// Uygulamanın bildiği gök cisimleri: sadece çıplak gözle görülenler.
// Yıldız koordinatları J2000 (ra: saat, dec: derece). mag: görünür parlaklık (küçük = parlak).

export const BODIES = [
  {
    id: 'moon', body: 'Moon', type: 'uydu',
    name: { tr: 'Ay', en: 'Moon' }, alias: { tr: 'Dünya’nın uydusu', en: 'Earth’s satellite' },
    note: { tr: 'Kendi ışığı yoktur; gördüğün parlaklık Güneş ışığının yansımasıdır.', en: 'It has no light of its own; what you see is reflected sunlight.' },
    facts: {
      tr: ['Bize hep aynı yüzünü gösterir.', 'Her yıl Dünya’dan yaklaşık 3,8 cm uzaklaşıyor.', 'Üzerinde 12 insan yürüdü; hepsi 1969–1972 arasında.'],
      en: ['It always shows us the same face.', 'It drifts about 3.8 cm farther from Earth every year.', '12 people have walked on it, all between 1969 and 1972.'],
    },
  },
  {
    id: 'mercury', body: 'Mercury', type: 'gezegen',
    name: { tr: 'Merkür', en: 'Mercury' }, alias: { tr: 'en hızlı gezegen', en: 'the swiftest planet' },
    note: { tr: 'Hep Güneş’e yakın durduğu için sadece alacakaranlıkta, ufka yakın görünür.', en: 'Always close to the Sun, so it only shows up low in twilight.' },
    facts: {
      tr: ['Bir yılı sadece 88 gün sürer.', 'Gündüz 430 °C, gece −180 °C olur.', 'Güneş Sistemi’nin en küçük gezegenidir.'],
      en: ['A year there lasts only 88 days.', 'Days reach 430 °C, nights drop to −180 °C.', 'It is the smallest planet in the Solar System.'],
    },
  },
  {
    id: 'venus', body: 'Venus', type: 'gezegen',
    name: { tr: 'Venüs', en: 'Venus' }, alias: { tr: '“akşam yıldızı”', en: '“the evening star”' },
    note: { tr: 'Akşam batıda ilk beliren “yıldız” çoğu zaman Venüs’tür. Güneş ışığını yansıtır.', en: 'The first “star” in the western evening sky is often Venus. It reflects sunlight.' },
    facts: {
      tr: ['Venüs’te bir gün, bir yılından daha uzun sürer.', 'Yüzeyi 460 °C: kurşunu eritecek kadar sıcak.', 'Ay gibi evreleri vardır. Dürbünle hilal hâlinde görebilirsin.'],
      en: ['A day on Venus is longer than its year.', 'Its surface is 460 °C, hot enough to melt lead.', 'It has phases like the Moon; binoculars can show its crescent.'],
    },
  },
  {
    id: 'mars', body: 'Mars', type: 'gezegen',
    name: { tr: 'Mars', en: 'Mars' }, alias: { tr: 'kızıl gezegen', en: 'the red planet' },
    note: { tr: 'Turuncu-kırmızı, titreşmeyen bir nokta olarak görünür.', en: 'Looks like a steady orange-red dot.' },
    facts: {
      tr: ['Rengini yüzeyindeki pas (demir oksit) verir.', 'Güneş Sistemi’nin en yüksek dağı Olympus Mons buradadır.', 'Dünya’ya yaklaştığında parlaklığı birkaç kat artar.'],
      en: ['Its colour comes from rust (iron oxide) on its surface.', 'The tallest mountain in the Solar System, Olympus Mons, is here.', 'It gets several times brighter when it comes close to Earth.'],
    },
  },
  {
    id: 'jupiter', body: 'Jupiter', type: 'gezegen',
    name: { tr: 'Jüpiter', en: 'Jupiter' }, alias: { tr: 'dev gezegen', en: 'the giant planet' },
    note: { tr: 'Gece boyunca görülen, beyaz ve sakin parlayan çok parlak bir nokta.', en: 'A very bright, steady white dot that can stay up all night.' },
    facts: {
      tr: ['İçine 1300’den fazla Dünya sığar.', 'Dürbünle dört büyük uydusu küçük noktalar hâlinde görünür.', 'Büyük Kırmızı Leke, Dünya’dan büyük bir fırtınadır.'],
      en: ['More than 1,300 Earths would fit inside it.', 'Binoculars show its four big moons as tiny dots.', 'The Great Red Spot is a storm bigger than Earth.'],
    },
  },
  {
    id: 'saturn', body: 'Saturn', type: 'gezegen',
    name: { tr: 'Satürn', en: 'Saturn' }, alias: { tr: 'halkalı gezegen', en: 'the ringed planet' },
    note: { tr: 'Sarımsı, sakin bir nokta. Halkaları için küçük bir teleskop gerekir.', en: 'A calm, yellowish dot. You need a small telescope for the rings.' },
    facts: {
      tr: ['Halkaları buz ve kaya parçalarından oluşur.', 'Yoğunluğu sudan düşüktür.', 'Yüzlerce bilinen uydusu vardır; en büyüğü Titan.'],
      en: ['Its rings are made of chunks of ice and rock.', 'It is less dense than water.', 'It has hundreds of known moons; the largest is Titan.'],
    },
  },
];

const star = (id, tr, en, ra, dec, mag, noteTr, noteEn, type = 'yildiz') =>
  ({ id, type, ra, dec, mag, name: { tr, en }, note: { tr: noteTr, en: noteEn } });

export const STARS = [
  star('sirius', 'Sirius', 'Sirius', 6.752, -16.716, -1.46, 'Gece gökyüzünün en parlak yıldızı. Ufka yakınken renk renk titrer.', 'The brightest star of the night sky. Near the horizon it flickers in colours.'),
  star('arcturus', 'Arktürüs', 'Arcturus', 14.261, 19.182, -0.05, 'Turuncu renkli dev bir yıldız.', 'An orange giant star.'),
  star('vega', 'Vega', 'Vega', 18.616, 38.784, 0.03, 'Yaz Üçgeni’nin en parlak köşesi.', 'The brightest corner of the Summer Triangle.'),
  star('capella', 'Kapella', 'Capella', 5.278, 45.998, 0.08, 'Kış akşamları kuzeydoğuda parlayan sarımsı yıldız.', 'A yellowish star high in the north-east on winter evenings.'),
  star('rigel', 'Rigel', 'Rigel', 5.242, -8.202, 0.13, 'Avcı takımyıldızının mavi-beyaz ayağı.', 'The blue-white foot of Orion.'),
  star('procyon', 'Prokyon', 'Procyon', 7.655, 5.225, 0.34, 'Küçük Köpek takımyıldızının en parlak yıldızı.', 'The brightest star in Canis Minor.'),
  star('betelgeuse', 'Betelgöz', 'Betelgeuse', 5.919, 7.407, 0.5, 'Avcı’nın omzundaki kırmızı süperdev.', 'The red supergiant on Orion’s shoulder.'),
  star('altair', 'Altair', 'Altair', 19.846, 8.868, 0.77, 'Yaz Üçgeni’nin güney köşesi.', 'The southern corner of the Summer Triangle.'),
  star('aldebaran', 'Aldebaran', 'Aldebaran', 4.599, 16.509, 0.85, 'Boğa’nın turuncu gözü.', 'The orange eye of Taurus the Bull.'),
  star('spica', 'Spika', 'Spica', 13.420, -11.161, 0.97, 'Başak takımyıldızının mavi-beyaz yıldızı.', 'The blue-white star of Virgo.'),
  star('antares', 'Antares', 'Antares', 16.490, -26.432, 1.06, 'Akrep’in kırmızı kalbi; Mars ile karıştırılır.', 'The red heart of Scorpius, often mistaken for Mars.'),
  star('pollux', 'Polluks', 'Pollux', 7.755, 28.026, 1.14, 'İkizler’in iki parlak yıldızından biri.', 'One of the two bright stars of Gemini.'),
  star('fomalhaut', 'Fomalhaut', 'Fomalhaut', 22.961, -29.622, 1.16, 'Sonbahar akşamları güneyde yalnız parlayan yıldız.', 'A lonely bright star low in the south on autumn evenings.'),
  star('deneb', 'Deneb', 'Deneb', 20.690, 45.280, 1.25, 'Kuğu’nun kuyruğu, Yaz Üçgeni’nin üçüncü köşesi.', 'The tail of Cygnus, third corner of the Summer Triangle.'),
  star('regulus', 'Regulus', 'Regulus', 10.140, 11.967, 1.35, 'Aslan’ın kalbi.', 'The heart of Leo.'),
  star('polaris', 'Kutup Yıldızı', 'Polaris', 2.530, 89.264, 1.98, 'Hep kuzeyde, aynı yerde durur. Yön bulmak için kullanılır.', 'It always sits in the north. Used for finding direction.'),
  star('pleiades', 'Ülker', 'Pleiades', 3.791, 24.105, 1.6, 'Bulanık küçük bir yıldız kümesi. Kaç yıldız sayabilirsin?', 'A small hazy star cluster. How many stars can you count?', 'kume'),
];

export const TYPE_LABEL = {
  uydu: { tr: 'Doğal uydu', en: 'Natural satellite' },
  gezegen: { tr: 'Gezegen', en: 'Planet' },
  yildiz: { tr: 'Yıldız', en: 'Star' },
  kume: { tr: 'Yıldız kümesi', en: 'Star cluster' },
};

export const ALL = [...BODIES, ...STARS];
export const byId = id => ALL.find(o => o.id === id);
