# GökBul

Gökyüzündeki parlak nokta ne? Telefonu tut, GökBul söylesin.
Okulda ve günlük hayatta kullanmak için, sadece çıplak gözle görülen gök cisimlerini anlatan Türkçe/İngilizce bir web uygulaması (PWA).

**Uygulama:** https://muhammet842.github.io/gokbul/
Tasarım taslağı (Figma): https://www.figma.com/design/0SRMOugamIOCJKef3KDSc9

## Güncelleme yayınlama

`main` dalına her `git push` yapıldığında GitHub Pages siteyi bir iki dakika içinde kendiliğinden günceller.
Servis çalışanı uygulama dosyalarını önce ağdan ister, bu yüzden telefonlar yeni sürümü kendiliğinden alır.
`sw.js` içindeki `VERSION` değerini (`gokbul-v4` → `gokbul-v5`) sadece `SHELL` listesine dosya ekleyip çıkardığında artırman yeterli.

Push etmeden önce testleri çalıştır (Node 20+ yeterli, kurulum gerekmez):

```bash
npm test
```

> Vercel'de de bir kopya var (gokbul.vercel.app), ama bazı mobil operatörler `vercel.app` adreslerini engellediği için
> paylaşılacak adres GitHub Pages adresidir.

## Zaman makinesi (şenlik ve ders sunumu için)

Üst çubuktaki saat düğmesi bu akşam 18:00 ile sabah 06:00 arasında bir saat seçmeyi sağlar; bütün ekranlar o saatin gökyüzünü gösterir.
Gündüz açılırsa doğrudan 21:00'e gider. Uygulamayı belli bir saatle açmak için adrese `?saat=21:00` ekle:

https://muhammet842.github.io/gokbul/?saat=21:00

## Ekranlar

| # | Ekran | Ne yapar |
|---|---|---|
| 01 | **Bak** | Telefonun pusulası ve eğimiyle baktığın yöndeki cismi bulur. Pusulası olmayan cihazda ekran sürüklenerek kullanılır. |
| 02 | **Bu gece** | O akşam görülebilecek Ay, gezegenler ve parlak yıldızlar; saat ve “kaç yumruk yukarıda” bilgisiyle. |
| 03 | **Sor** | Pusulasız tanıma: “Hareket ediyor mu? Titreşiyor mu? Hangi yöne bakıyorsun?” soruları ile cevaba ulaşır. |
| 04 | **Cisim sayfası** | Cismin adı (TR/EN), evresi, bu akşam ne zaman görüleceği, uzaklığı ve bilinmesi gereken üç şey. |

## Çalıştırma

Hiçbir kurulum gerekmez. Proje klasöründe:

```bash
python -m http.server 8765
```

Sonra tarayıcıda `http://localhost:8765` aç.

> Telefonun pusulası ve konumu sadece **https** üzerinden çalışır; telefonda yayındaki adresi kullan.

## Dosyalar

```
index.html            Sayfa iskeleti, üst çubuk ve alt menü
css/style.css         Tasarım: renkler (Figma değişkenleriyle aynı), yazı tipleri, ekranlar
icons/                SVG ikon + ana ekran için PNG'ler (180 iOS, 192/512 Android)
js/app.js             Ekranlar ve yönlendirme (#bak, #gece, #sor, #cisim/venus)
js/sky.js             Gökyüzü hesapları (astronomy-engine kütüphanesi ile)
js/satellites.js      ISS ve Tiangong: yörünge verisi (CelesTrak, 12 saatte bir), konum, görünür geçişler
js/sensors.js         Konum (GPS ya da elle seçilen şehir) ve telefon yönü (pusula + jiroskop)
js/objects.js         Gök cisimleri ve bilgileri (TR/EN)
js/i18n.js            Arayüz metinleri (TR/EN)
sw.js                 Çevrimdışı çalışma (dosya eklersen SHELL listesine ekle, VERSION'ı artır)
vendor/               astronomy-engine 2.1.19 ve satellite.js 5.0.0 (CDN yerine projede; çevrimdışı ve güvenli)
tests/                Gökyüzü hesapları ve TR/EN metin testleri (npm test)
```

## Tasarım kuralları

- **Gözlem defteri** görünümü: sıcak siyah zemin, kâğıt tonlu yazı, ince çizgiler. Gölge, gradyan, cam efekti yok.
- Tek vurgu rengi **kırmızı** (`--kirmizi`): gece görüşünü bozmayan renk.
- Varsayılan tema **gece**. Üst çubuktaki yarım daire düğmesiyle **kâğıt (gündüz) temasına** geçilir; seçim hatırlanır.
- Yazı tipleri: başlıklar *Fraunces*, metin *IBM Plex Sans*, veriler *IBM Plex Mono*.

## Sıradaki adımlar

- [x] Uluslararası Uzay İstasyonu ve Tiangong geçişleri (CelesTrak yörünge verisi + satellite.js)
- [x] Andromeda Galaksisi ve Avcı Bulutsusu
- [ ] Sınıf tahmin oyunu (öğretmen cisim seçer, öğrenciler tahmin eder)
- [ ] Takımyıldız çizgileri (Büyük Ayı, Avcı, Kuğu…)
- [ ] Telefonda gerçek gökyüzünde pusula doğruluğunu test etmek
