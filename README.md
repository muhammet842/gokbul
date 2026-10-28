# GökBul

Gökyüzündeki parlak nokta ne? Telefonu tut, GökBul söylesin.
Okulda ve günlük hayatta kullanmak için, sadece çıplak gözle görülen gök cisimlerini anlatan Türkçe/İngilizce bir web uygulaması (PWA).

Tasarım taslağı (Figma): https://www.figma.com/design/0SRMOugamIOCJKef3KDSc9

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

> Telefonun pusulası ve konumu sadece **https** üzerinden çalışır. Telefonda denemek için projeyi
> GitHub Pages veya Vercel'e yükle (ikisi de ücretsiz).

## Dosyalar

```
index.html            Sayfa iskeleti, üst çubuk ve alt menü
css/style.css         Tasarım: renkler (Figma değişkenleriyle aynı), yazı tipleri, ekranlar
js/app.js             Ekranlar ve yönlendirme (#bak, #gece, #sor, #cisim/venus)
js/sky.js             Gökyüzü hesapları (astronomy-engine kütüphanesi ile)
js/sensors.js         Konum ve telefon yönü (pusula + jiroskop)
js/objects.js         Gök cisimleri ve bilgileri (TR/EN)
js/i18n.js            Arayüz metinleri (TR/EN)
sw.js                 Çevrimdışı çalışma (dosya eklersen SHELL listesine ekle, VERSION'ı artır)
```

## Tasarım kuralları

- **Gözlem defteri** görünümü: sıcak siyah zemin, kâğıt tonlu yazı, ince çizgiler. Gölge, gradyan, cam efekti yok.
- Tek vurgu rengi **kırmızı** (`--kirmizi`): gece görüşünü bozmayan renk.
- Varsayılan tema **gece**. Üst çubuktaki yarım daire düğmesiyle **kâğıt (gündüz) temasına** geçilir; seçim hatırlanır.
- Yazı tipleri: başlıklar *Fraunces*, metin *IBM Plex Sans*, veriler *IBM Plex Mono*.

## Sıradaki adımlar

- [ ] Uluslararası Uzay İstasyonu geçişleri (CelesTrak yörünge verisi + satellite.js)
- [ ] Sınıf tahmin oyunu (öğretmen cisim seçer, öğrenciler tahmin eder)
- [ ] Takımyıldız çizgileri (Büyük Ayı, Avcı, Kuğu…)
- [ ] Telefonda gerçek gökyüzünde pusula doğruluğunu test etmek
