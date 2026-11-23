import { t, L, upper, getLang, setLang, locale } from './i18n.js';
import { byId, TYPE_LABEL, SATS } from './objects.js';
import * as sky from './sky.js';
import * as sats from './satellites.js';
import { getLocation, startOrientation, toAzAlt, CITIES, setManualLocation } from './sensors.js';

const $view = document.getElementById('view');
const state = {
  loc: null, obs: null,
  sensor: 'off',            // off | live | drag
  vec: null,                // yumuşatılmış yön vektörü
  dir: { az: 247, alt: 18 },
  sky: [], skyAt: 0,
  sats: [], satsAt: 0,      // şu an görünen uzay istasyonları (hızlı hareket ettikleri için sık tazelenir)
  pick: null,               // halkada birden çok cisim varken kullanıcının seçtiği
  quiz: { step: 'move', answers: [], hint: false, result: null },
};

// ---------- Yardımcılar ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hhmm = d => d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
const DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
const dirName = az => t('dir.' + DIRS[Math.round(az / 45) % 8]);
const DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const dirShort = az => (getLang() === 'tr' ? DIRS : DIRS_EN)[Math.round(az / 45) % 8];
// Bir yumruk ≈ 10°. Listede ve göstergede aynı sayı görünsün diye tek yerden hesaplanır (1…9).
const OVERHEAD = 75;
const fists = alt => Math.min(9, Math.max(1, Math.round(alt / 10)));
const whereText = (az, alt) => `${dirName(az)}, ${alt > OVERHEAD ? t('gece.overhead') : (fists(alt) === 1 ? t('gece.above1') : t('gece.above', { n: fists(alt) }))}`;
// İstasyon geçişinin yönü: "Batı → Kuzeydoğu"; başı ve sonu aynı yöndeyse tek yön
const passDir = (a, b) => (dirName(a) === dirName(b) ? dirName(a) : `${dirName(a)} → ${dirName(b)}`);
const cap = s => s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1);
const fmtNum = (n, d = 1) => n.toLocaleString(locale(), { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtMag = m => (m < 0 ? '−' : '') + fmtNum(Math.abs(m));

async function ensureLocation() {
  if (state.loc) return;
  useLocation(await getLocation());
}

function useLocation(loc) {
  state.loc = loc;
  state.obs = sky.makeObserver(loc);
  state.skyAt = 0;
  lastCardKey = '';
}

function refreshSky(force) {
  const now = Date.now();
  if (!force && now - state.skyAt < 20e3) return;
  state.sky = sky.visibleNow(skyNow(), state.obs);
  state.skyAt = now;
}

// İstasyonlar saniyede ~1° yol alır: yerlerini yarım saniyede bir yeniden hesapla
function refreshSats(force) {
  const now = Date.now();
  if (!force && now - state.satsAt < 500) return;
  state.sats = sats.visibleSats(skyNow(), state.loc, state.obs);
  state.satsAt = now;
}
const skyList = () => (state.sats.length ? [...state.sky, ...state.sats] : state.sky);

// ---------- Zaman makinesi ----------
// Gökyüzü hesaplarındaki "şimdi". offset 0 ise gerçek saat; değilse ileri/geri alınmış saat akmaya devam eder.
const clock = { offset: 0 }; // zaman makinesi ekranın altında hep açık
const skyNow = () => new Date(Date.now() + clock.offset);
const RANGE_MIN = 12 * 60; // şerit: bu akşam 18:00 → sabah 06:00

// Bu akşamın 18:00'i (sabah 06'dan önceysek dün akşamın 18:00'i)
function eveningBase() {
  const b = new Date();
  if (b.getHours() < 6) b.setDate(b.getDate() - 1);
  b.setHours(18, 0, 0, 0);
  return b;
}

function setSkyTime(date) {
  clock.offset = date ? date.getTime() - Date.now() : 0;
  state.skyAt = 0; state.satsAt = 0;
  lastCardKey = '';
}

function sliderValue() {
  const m = Math.round((skyNow() - eveningBase()) / 60e3);
  return Math.max(0, Math.min(RANGE_MIN, m));
}

// Saatin yanındaki açıklama: gerçek saatteyse "Şimdi", değilse akşam / gece yarısından sonra
const dayLabel = d => t(!clock.offset ? 'gece.now' : d.getHours() >= 12 ? 'tm.evening' : 'tm.late');

function renderClock() {
  const box = document.getElementById('zaman');
  const now = skyNow();
  box.innerHTML = `
    <div class="zaman-row"><span class="t-etiket kirmizi">${upper(t('tm.title'))}</span><button class="t-etiket" id="tmNow" type="button"${clock.offset ? '' : ' hidden'}>${upper(t('tm.now'))}</button></div>
    <div class="zaman-row"><span class="t-orta" id="tmTime">${hhmm(now)}</span><span class="t-veri" id="tmDay">${dayLabel(now)}</span></div>
    <input type="range" id="tmRange" min="0" max="${RANGE_MIN}" step="15" value="${sliderValue()}" aria-label="${t('tm.title')}">
    <div class="zaman-olcek"><span>18:00</span><span>21:00</span><span>00:00</span><span>03:00</span><span>06:00</span></div>`;
  document.getElementById('tmNow').onclick = () => { setSkyTime(null); renderClock(); rerender(); };
  document.getElementById('tmRange').oninput = e => {
    setSkyTime(new Date(eveningBase().getTime() + e.target.value * 60e3));
    const d = skyNow();
    document.getElementById('tmTime').textContent = hhmm(d);
    document.getElementById('tmDay').textContent = dayLabel(d);
    document.getElementById('tmNow').hidden = false;
    rerender();
  };
}

// Saat değişince açık ekranı yeniden çiz (kaydırırken çok sık olmasın). Bak ekranı zaten her karede çizilir.
let rerenderTimer = 0;
function rerender() {
  clearTimeout(rerenderTimer);
  rerenderTimer = setTimeout(() => {
    const [name, arg] = (location.hash.replace('#', '') || 'bak').split('/');
    if (name === 'gece') viewGece();
    else if (name === 'cisim') viewCisim(arg);
  }, 120);
}

// ?saat=21:00 ile açılırsa o saatin gökyüzü (şenlik ve ders sunumu için)
function clockFromUrl() {
  const q = new URLSearchParams(location.search);
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(q.get('saat') ?? q.get('time') ?? '');
  if (!m || +m[1] > 23) return;
  const d = eveningBase();
  if (+m[1] < 12) d.setDate(d.getDate() + 1);
  d.setHours(+m[1], +(m[2] ?? 0), 0, 0);
  setSkyTime(d);
}

// ---------- Tema (varsayılan gece, elle değiştirilir ve hatırlanır) ----------
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name=theme-color]').content = theme === 'gunduz' ? '#F3EEE4' : '#14110E';
  document.getElementById('theme').setAttribute('aria-label', t(theme === 'gunduz' ? 'theme.toNight' : 'theme.toDay'));
  try { localStorage.setItem('gokbul.theme', theme); } catch {}
}
const savedTheme = () => { try { return localStorage.getItem('gokbul.theme'); } catch { return null; } };

// ---------- 01 · Bak ----------
let raf = 0, lastCardKey = '', lastDrawKey = '', lastDrawAt = 0;
const FRAME_MS = 33; // en fazla ~30 kare/sn: gece uzun süre açık kalınca pil bitmesin

function viewBak() {
  $view.innerHTML = `
    <div class="ruler" aria-hidden="true"><div class="ruler-track" id="ticks"></div><span class="mark"></span><span class="heading" id="heading"></span></div>
    <div class="vizor" id="vizor">
      <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g id="stars"></g>
        <line id="horizon" x1="0" x2="390" stroke="var(--murekkep-3)" stroke-width="1"/>
        <circle cx="195" cy="150" r="100" fill="none" stroke="var(--murekkep-3)"/>
        <g stroke="var(--murekkep-2)"><path d="M195 30v26M195 244v26M75 150h26M289 150h26"/></g>
      </svg>
      <div class="alt-row"><span class="t-etiket">${t('bak.horizon')}</span><span class="t-etiket" id="altText"></span></div>
    </div>
    <section id="card"></section>`;
  lastCardKey = ''; lastDrawKey = '';
  // Halkadaki cisimlerden birine dokununca hedef o olsun
  document.getElementById('card').onclick = e => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    state.pick = b.dataset.pick;
    lastCardKey = ''; lastDrawKey = '';
  };
  if (state.sensor === 'off') {
    if (state.needsTap) showStartButton();
    else {
      document.getElementById('card').innerHTML = `<div class="cevap"><span class="t-etiket">${upper(t('bak.starting'))}</span></div>`;
      startLooking(true);
    }
  }
  enableDrag();
  loop();
}

// Sadece iOS'ta gerekir: Apple yön sensörü iznini ancak bir dokunuşla istemeye izin veriyor
function showStartButton() {
  const card = document.getElementById('card');
  if (!card) return;
  card.innerHTML = `
    <button class="start" id="startBtn" type="button"><span>${t('bak.start')}</span><span>→</span></button>
    <p class="pad t-veri soluk" style="margin-top:12px">${t('bak.startHint')}</p>`;
  document.getElementById('startBtn').onclick = () => startLooking(false);
}

// auto: açılışta dokunuşsuz deneme. İzin dokunuş gerektirirse butona düşer.
async function startLooking(auto) {
  if (state.starting) return;
  state.starting = true;
  // Önce yön sensörü: iOS'ta izin isteği dokunuşun hemen içinde yapılmalı
  const res = await startOrientation(v => {
    const s = state.vec, k = 0.15; // basit yumuşatma
    state.vec = s ? { east: s.east + (v.east - s.east) * k, north: s.north + (v.north - s.north) * k, up: s.up + (v.up - s.up) * k } : v;
    state.dir = toAzAlt(state.vec);
  });
  if (auto && res === 'denied') {
    state.starting = false;
    state.needsTap = true;
    if (location.hash.replace('#', '') === 'bak' || location.hash === '') showStartButton();
    return;
  }
  await ensureLocation();
  refreshSky(true);
  state.sensor = res === 'live' ? 'live' : 'drag';
  state.starting = false;
  lastCardKey = '';
}

function enableDrag() {
  const el = document.getElementById('vizor');
  let start = null;
  el.onpointerdown = e => { if (state.sensor !== 'drag') return; start = { x: e.clientX, y: e.clientY, ...state.dir }; el.setPointerCapture(e.pointerId); };
  el.onpointermove = e => {
    if (!start) return;
    const k = 390 / el.clientWidth / 6; // ekran pikseli → derece
    state.dir = { az: (start.az - (e.clientX - start.x) * k + 360) % 360, alt: Math.max(-10, Math.min(89, start.alt + (e.clientY - start.y) * k)) };
  };
  el.onpointerup = el.onpointercancel = () => { start = null; };
}

const PX = 6; // derece başına piksel (vizör ve cetvel aynı ölçek)

function loop() {
  cancelAnimationFrame(raf);
  if (location.hash.replace('#', '') !== 'bak' && location.hash !== '') return;
  raf = requestAnimationFrame(loop);
  const t0 = performance.now();
  if (t0 - lastDrawAt < FRAME_MS) return;
  if (state.obs) { refreshSky(); refreshSats(); }
  const { az, alt } = state.dir;
  // Yön 0,1°'den az değiştiyse ve gökyüzü aynıysa yeniden çizmeye gerek yok
  const key = [Math.round(az * 10), Math.round(alt * 10), state.skyAt, state.sats.length ? state.satsAt : 0, state.sensor, state.pick].join('|');
  if (key === lastDrawKey) return;
  lastDrawKey = key; lastDrawAt = t0;
  const hits = state.sensor !== 'off' ? ringHits(az, alt) : [];
  drawRuler(az);
  drawVizor(az, alt, hits);
  if (state.sensor !== 'off') drawCard(hits);
}

function drawRuler(az) {
  const ticks = document.getElementById('ticks');
  if (!ticks) return;
  let html = '';
  for (let d = Math.ceil((az - 35) / 5) * 5; d <= az + 35; d += 5) {
    const deg = (d + 360) % 360, major = deg % 15 === 0;
    html += `<span class="tick${major ? ' major' : ''}" style="left:calc(50% + ${(d - az) * PX}px)">${major ? `<b>${deg}</b>` : ''}</span>`;
  }
  ticks.innerHTML = html;
  document.getElementById('heading').textContent = `${dirShort(az)} ${Math.round(az)}°`;
}

// Halkadaki cisimler, hedef başta. Kullanıcı birini seçtiyse o halkada kaldıkça hedef odur.
function ringHits(az, alt) {
  const hits = sky.identify(az, alt, skyList());
  if (state.pick) {
    const i = hits.findIndex(h => h.obj.id === state.pick);
    if (i < 0) state.pick = null;               // halkadan çıktı: seçimi unut
    else if (i > 0) hits.unshift(...hits.splice(i, 1));
  }
  return hits;
}

// Etiketler üst üste binmesin: çakışırsa aşağı/yukarı kaydır. y metnin taban çizgisi.
function placeLabel(boxes, x, y, w, h) {
  for (const dy of [0, 13, -13, 26, -26, 39]) {
    const b = { x, y: y + dy - h, w, h };
    if (!boxes.some(o => b.x < o.x + o.w && o.x < b.x + b.w && b.y < o.y + o.h && o.y < b.y + b.h)) { boxes.push(b); return y + dy; }
  }
  return null; // yer yok: bu etiketi çizme
}

function drawVizor(az, alt, hits) {
  const g = document.getElementById('stars');
  if (!g) return;
  const best = hits[0]?.obj;
  const inRing = new Set(hits.map(h => h.obj));
  // Önce hedef, sonra halkadakiler, sonra parlaklığa göre: etiket yerini önemli olan alsın
  const rank = p => (p.obj === best ? -100 : inRing.has(p.obj) ? -50 : 0) + p.mag;
  const pts = skyList().map(p => {
    const daz = ((p.az - az + 540) % 360) - 180;
    return { p, x: 195 + daz * Math.cos(p.alt * Math.PI / 180) * PX, y: 150 - (p.alt - alt) * PX, r: Math.max(1.2, (2.5 - p.mag) * 0.9) };
  }).filter(d => d.x >= -20 && d.x <= 410 && d.y >= -20 && d.y <= 320)
    .sort((a, b) => rank(a.p) - rank(b.p));
  const boxes = pts.map(d => ({ x: d.x - d.r, y: d.y - d.r, w: 2 * d.r, h: 2 * d.r })); // noktaların üstüne yazma
  let dots = '', labels = '';
  for (const { p, x, y, r } of pts) {
    const isBest = p.obj === best, ring = inRing.has(p.obj);
    dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="var(${isBest || ring ? '--murekkep' : '--murekkep-2'})"/>`;
    if (isBest) dots += `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="none" stroke="var(--kirmizi)" stroke-dasharray="3 3"/>`;
    const size = isBest ? 13 : ring ? 11 : 10;
    const name = L(p.obj.name);
    const lx = x + r + (isBest ? 13 : 5); // hedefin etiketi kesik çemberin dışında başlasın
    const ly = placeLabel(boxes, lx, y + size / 3, name.length * size * 0.6, size);
    if (ly == null) continue;
    const fill = isBest ? '--kirmizi' : ring ? '--murekkep-2' : '--murekkep-3';
    labels += `<text x="${lx}" y="${ly}" font-family="IBM Plex Mono" font-size="${size}"${isBest ? ' font-weight="500"' : ''} fill="var(${fill})">${esc(name)}</text>`;
  }
  g.innerHTML = dots + labels;
  const hy = 150 + alt * PX;
  const h = document.getElementById('horizon');
  h.setAttribute('y1', hy); h.setAttribute('y2', hy);
  document.getElementById('altText').textContent = alt < 0 ? t('bak.below') : `${t('bak.altitude')} ${Math.round(alt)}°`;
}

function drawCard(hits) {
  const best = hits[0];
  const key = [hits.slice(0, 4).map(h => h.obj.id + Math.round(h.sep)).join(','), getLang(), best && Math.round(best.sep * 2)].join('|');
  if (key === lastCardKey) return;
  lastCardKey = key;
  const card = document.getElementById('card');
  if (!best) { card.innerHTML = ''; return; } // halkada cisim yoksa kart boş kalır
  const o = best.obj;
  const steady = t(o.sat ? 'bak.moving' : o.body ? 'bak.steady' : ['kume', 'galaksi', 'bulutsu'].includes(o.type) ? 'bak.fuzzy' : 'bak.twinkles');
  card.innerHTML = `
    <div class="cevap">
      <h1 class="t-dev">${esc(L(o.name))}</h1>
      <p class="t-veri">${L(TYPE_LABEL[o.type])} · ${fmtMag(best.mag)} ${t('cisim.magUnit')} · ${steady}</p>
      <p class="t-not">${esc(L(o.note))}</p>
      <div class="row" style="padding-top:6px"><a class="link" href="#cisim/${o.id}">${t('bak.why')}</a></div>
      ${hits.length > 1 ? `
      <div class="secim">
        <span class="t-etiket">${upper(t('bak.ring', { n: Math.min(hits.length, 4) }))}</span>
        <div>${hits.slice(0, 4).map((h, i) => `<button type="button" data-pick="${h.obj.id}" aria-pressed="${i === 0}"${i === 0 ? ' class="on"' : ''}>${esc(L(h.obj.name))} <small>${fmtNum(h.sep, 0)}°</small></button>`).join('')}</div>
      </div>` : ''}
    </div>`;
}

// ---------- 02 · Bu gece ----------
async function viewGece() {
  $view.innerHTML = `<div class="gece-head"><span class="t-etiket">${t('gece.locating')}</span></div>`;
  await ensureLocation();
  refreshSky(true);
  const now = skyNow();
  const { win, items } = sky.tonight(now, state.obs);
  const passList = win && win.start < win.end
    ? SATS.flatMap(s => sats.passes(s, win.start, win.end, state.loc, state.obs).slice(0, 3)) : [];
  const rows = [...items, ...passList.map(p => ({ pass: p, time: p.start }))].sort((a, b) => a.time - b.time);
  const date = upper(now.toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }));
  const city = state.loc.manual && CITIES.find(c => c.id === state.loc.city);
  const near = !state.loc.manual && !state.loc.fallback && nearestCity(state.loc);
  const placeName = city ? city.name
    : state.loc.fallback ? t('yer.default')
    : near ? t('yer.near', { c: near.name }) : t('yer.here');
  const placeSub = state.loc.fallback ? t('yer.noGps') : coords(state.loc);
  $view.innerHTML = `
    <div class="gece-head">
      <span class="t-etiket">${date}</span>
      <h1 class="t-buyuk">${t('gece.title')}</h1>
    </div>
    <label class="konum">
      <span class="konum-metin">
        <span class="t-etiket">${t('yer.label')}</span>
        <span class="konum-ad">${esc(placeName)}</span>
        <span class="t-veri">${esc(placeSub)}</span>
      </span>
      <span class="t-etiket kirmizi">${upper(t('yer.change'))} ▾</span>
      <select id="yer" aria-label="${t('yer.label')}">
        <option value="gps"${city ? '' : ' selected'}>${t('yer.gps')}</option>
        ${CITIES.map(c => `<option value="${c.id}"${city === c ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
    </label>
    <div class="ozet">
      <div><span class="t-etiket">${t('gece.sunsetLbl')}</span><span>${win ? hhmm(win.sunset) : '—'}</span></div>
      <div><span class="t-etiket">${t('gece.sunriseLbl')}</span><span>${win ? hhmm(win.sunrise) : '—'}</span></div>
      <div><span class="t-etiket">${t('gece.moonLbl')}</span><span>${t('gece.moonPct', { p: sky.moonPercent(now) })}</span></div>
    </div>
    ${rows.length ? `<ul class="kayitlar">${rows.map(r => (r.pass ? kayitPass(r.pass) : kayit(r))).join('')}</ul>` : `<p class="bos t-not">${t('gece.empty')}</p>`}
    <p class="ipucu"><b>${t('gece.fist')}</b><span>${t('gece.hint')}</span></p>`;
  document.getElementById('yer').onchange = e => changePlace(e.target.value);
}

const coords = loc => `${fmtNum(Math.abs(loc.lat))}° ${t(loc.lat >= 0 ? 'yer.N' : 'yer.S')} · ${fmtNum(Math.abs(loc.lon))}° ${t(loc.lon >= 0 ? 'yer.E' : 'yer.W')}`;

// GPS konumuna 60 km'den yakın listedeki şehir (koordinat yerine "İstanbul yakını" demek için)
function nearestCity(loc) {
  const km = c => 111 * Math.hypot(c.lat - loc.lat, (c.lon - loc.lon) * Math.cos(loc.lat * Math.PI / 180));
  const best = CITIES.reduce((a, c) => (km(c) < km(a) ? c : a));
  return km(best) < 60 ? best : null;
}

async function changePlace(id) {
  const city = CITIES.find(c => c.id === id);
  if (city) useLocation(setManualLocation(city));
  else { setManualLocation(null); state.loc = null; await ensureLocation(); }
  refreshSky(true);
  viewGece();
}

// Sağdaki küçük gösterge: ufuktan tepeye 9 çentik, her biri bir yumruk
function gauge(alt) {
  const n = fists(alt), overhead = alt > OVERHEAD;
  return `<span class="ufuk" aria-hidden="true"><span class="cetvel"></span><span class="nokta" style="top:${overhead ? 0 : 45 - n * 5}px"></span><span class="ymr">${overhead ? upper(t('gece.top')) : upper(t(n === 1 ? 'gece.fist1' : 'gece.fistN', { n }))}</span></span>`;
}

// İstasyon geçişi: ne zaman, hangi yönden hangi yöne, ne kadar sürer, en yüksek nokta
function kayitPass(p) {
  const now = skyNow();
  const live = now >= p.start && now <= p.end;
  const mins = Math.max(1, Math.round((p.end - p.start) / 60e3));
  return `
    <li><a class="kayit" href="#cisim/${p.obj.id}">
      <span class="saat"><b>${hhmm(p.start)}</b><small${live ? ' class="kirmizi"' : ''}>${upper(t(live ? 'gece.now' : 'gece.pass'))}</small></span>
      <span>
        <span class="ad">${esc(L(p.obj.name))}</span><br>
        <span class="yon">${passDir(p.startAz, p.endAz)}</span><br>
        <span class="not">${esc(t('gece.passNote', { m: mins, mag: fmtMag(p.mag) }))}</span>
      </span>
      ${gauge(p.maxAlt)}
    </a></li>`;
}

function kayit(i) {
  const note = i.obj.body ? (i.sets ? t('gece.sets', { t: hhmm(i.sets) }) : cap(L(i.obj.alias))) : L(i.obj.note);
  // Şimdi görünür / hava kararınca görünür / gece içinde yükselir
  const tag = i.isNow ? `<small class="kirmizi">${upper(t('gece.now'))}</small>`
    : `<small>${upper(t(i.atStart ? 'gece.atDusk' : 'gece.rises'))}</small>`;
  return `
    <li><a class="kayit" href="#cisim/${i.obj.id}">
      <span class="saat"><b>${hhmm(i.time)}</b>${tag}</span>
      <span>
        <span class="ad">${esc(L(i.obj.name))}</span><br>
        <span class="yon">${whereText(i.az, i.alt)}</span><br>
        <span class="not">${esc(note)}</span>
      </span>
      ${gauge(i.alt)}
    </a></li>`;
}

// ---------- 03 · Sor ----------
const TREE = {
  move:    { q: 'sor.move', hint: 'sor.moveHint', a: [['sor.moveYes', 'blink'], ['sor.moveNo', 'twinkle']] },
  blink:   { q: 'sor.blink', hint: 'sor.blinkHint', a: [['sor.blinkYes', '=plane'], ['sor.blinkNo', '=sat']] },
  twinkle: { q: 'sor.twinkle', hint: 'sor.twinkleHint', a: [['sor.twinkleYes', 'dir:star'], ['sor.twinkleNo', 'dir:planet']] },
  dir:     { q: 'sor.dir', hint: 'sor.dirHint', a: [['dir.K', 0], ['dir.D', 90], ['dir.G', 180], ['dir.B', 270]] },
};

function viewSor() {
  const qz = state.quiz;
  if (qz.result) return sorResult();
  const node = TREE[qz.step.split(':')[0]];
  const total = qz.answers[0]?.next === 'blink' ? 2 : 3;
  const n = qz.answers.length + 1;
  $view.innerHTML = `
    <div class="ilerleme">
      <div class="row"><span class="t-etiket kirmizi">${upper(t('sor.q', { n, m: total }))}</span><button class="t-etiket" id="restart">${upper(t('sor.restart'))}</button></div>
      <div class="cubuklar">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
    </div>
    <div class="onceki">${qz.answers.map((a, i) => `<p>${String(i + 1).padStart(2, '0')}  ${t(a.q)} — ${t(a.a)}</p>`).join('')}</div>
    <div class="soru">
      <span class="t-veri kirmizi">${String(n).padStart(2, '0')}</span>
      <h1 class="t-buyuk">${t(node.q)}</h1>
      <p class="t-not">${t(qz.hint ? 'sor.hint.' + qz.step.split(':')[0] : node.hint)}</p>
    </div>
    <div class="cevaplar">${node.a.map(([label], i) => `
      <button class="secenek" data-i="${i}"><span class="harf">${'ABCD'[i]}</span><span class="metin">${t(label)}</span><span class="ok">→</span></button>`).join('')}
    </div>
    <p class="pad" style="padding-top:18px"><button class="link soluk" id="unsure">${t('sor.unsure')}</button></p>
    <p class="alt-not t-etiket">${upper(t('sor.footer'))}</p>`;
  document.getElementById('restart').onclick = resetQuiz;
  document.getElementById('unsure').onclick = () => { qz.hint = true; viewSor(); };
  $view.querySelectorAll('.secenek').forEach(b => b.onclick = () => answer(node, node.a[+b.dataset.i]));
}

async function answer(node, [label, next]) {
  const qz = state.quiz;
  qz.answers.push({ q: node.q, a: label, next });
  qz.hint = false;
  if (typeof next === 'number') {                      // yön seçildi → gökyüzüne bak
    await ensureLocation();
    const kind = qz.step.split(':')[1];
    const now = skyNow();
    const hit = sky.brightestToward(next, kind, now, state.obs) ?? sky.brightestToward(next, kind === 'planet' ? 'star' : 'planet', now, state.obs);
    qz.result = hit ? { id: hit.obj.id } : { none: true };
  } else if (next.startsWith('=')) {
    qz.result = { kind: next.slice(1) };
  } else {
    qz.step = next;
  }
  if (qz.result?.id) { location.hash = `cisim/${qz.result.id}`; return; }
  viewSor();
}

function sorResult() {
  const r = state.quiz.result;
  const [name, note] = r.none ? ['sor.none', 'sor.noneNote'] : r.kind === 'plane' ? ['sor.plane', 'sor.planeNote'] : ['sor.sat', 'sor.satNote'];
  const live = r.kind === 'sat' && state.loc ? sats.visibleSats(skyNow(), state.loc, state.obs)[0] : null;
  $view.innerHTML = `
    <div class="cevap">
      <span class="t-etiket kirmizi">${upper(t(r.none ? 'sor.noMatch' : 'sor.result'))}</span>
      <h1 class="t-buyuk">${t(name)}</h1>
      <p class="t-not">${t(note)}</p>
      ${live ? `<p class="t-veri kirmizi">${esc(t('sor.satLive', { n: L(live.obj.name), w: whereText(live.az, live.alt) }))}</p>
      <a class="link" href="#cisim/${live.obj.id}">${t('bak.why')}</a>` : ''}
    </div>
    <div class="cevaplar" style="margin-top:32px"><button class="secenek" id="again"><span class="harf">↺</span><span class="metin">${t('sor.again')}</span><span class="ok">→</span></button></div>`;
  document.getElementById('again').onclick = resetQuiz;
}

function resetQuiz() { state.quiz = { step: 'move', answers: [], hint: false, result: null }; viewSor(); }

// ---------- 04 · Cisim sayfası ----------
async function viewCisim(id) {
  const o = byId(id);
  if (!o) { location.hash = 'bak'; return; }
  await ensureLocation();
  const now = skyNow();
  const rows = o.sat ? satRows(o, now) : objRows(o, now);
  const from = state.quiz.result?.id === id ? 'sor' : 'bak';
  const otherLang = getLang() === 'tr' ? 'en' : 'tr';
  $view.innerHTML = `
    <a class="geri t-etiket" href="#${from}">${upper(t('cisim.back'))}</a>
    <div class="cisim-head">
      <div>
        <span class="t-etiket kirmizi">${upper(L(TYPE_LABEL[o.type]))}</span>
        <h1 class="t-dev">${esc(L(o.name))}</h1>
        <p class="t-not">${esc(o.name[otherLang])}${o.alias ? ' · ' + esc(L(o.alias)) : ''}</p>
      </div>
      ${glyph(o, now)}
    </div>
    <div class="veriler">
      ${rows.filter(([, v]) => v != null).map(([k, v]) => `<div><span class="t-etiket">${t(k)}</span><span>${v}</span></div>`).join('')}
    </div>
    <div class="uc-sey">
      ${o.facts ? `<h2 class="t-orta">${t('cisim.three')}</h2><ol>${L(o.facts).map(f => `<li>${esc(f)}</li>`).join('')}</ol>` : `<p class="t-not">${esc(L(o.note))}</p>`}
    </div>`;
  if (from === 'sor') state.quiz = { step: 'move', answers: [], hint: false, result: null };
}

// Ay, gezegen, yıldız: bu akşam ne zaman, nereye bak, uzaklık, parlaklık
function objRows(o, now) {
  const p = sky.position(o, now, state.obs);
  const night = sky.tonight(now, state.obs, 99).items.find(i => i.obj === o);
  const tonightText = night ? `${night.isNow && !clock.offset ? t('gece.now') : hhmm(night.time)}${night.sets ? ' – ' + hhmm(night.sets) : ''}` : t('cisim.notUp');
  const where = p.alt > 0 ? whereText(p.az, p.alt) : night ? whereText(night.az, night.alt) : '—';
  const dist = p.distKm == null ? null
    : p.distKm < 1e6 ? `${Math.round(p.distKm).toLocaleString(locale())} km`
    : t('cisim.km', { n: Math.round(p.distKm / 1e6).toLocaleString(locale()) });
  return [['cisim.tonight', tonightText], ['cisim.where', where], ['cisim.dist', dist], ['cisim.mag', `${fmtMag(p.mag)} ${t('cisim.magUnit')}`]];
}

// Uzay istasyonu: şu an geçiyor mu, yoksa bu geceki ilk görünür geçiş
function satRows(o, now) {
  if (!sats.hasData(o)) return [['cisim.tonight', t('sat.noData')]];
  const p = sats.satPosition(o, now, state.loc);
  const live = sats.visibleSats(now, state.loc, state.obs).find(v => v.obj === o);
  const win = sky.nightWindow(now, state.obs);
  const next = !live && win && win.start < win.end ? sats.passes(o, win.start, win.end, state.loc, state.obs)[0] : null;
  const tonightText = live ? t('gece.now') : next ? `${hhmm(next.start)} – ${hhmm(next.end)}` : t('sat.noPass');
  const where = live ? whereText(live.az, live.alt) : next ? passDir(next.startAz, next.endAz) : '—';
  const mag = live ? live.mag : next?.mag;
  return [
    ['cisim.tonight', tonightText], ['cisim.where', where],
    ['sat.height', p ? `${Math.round(p.heightKm).toLocaleString(locale())} km` : null],
    ['cisim.mag', mag != null ? `${fmtMag(mag)} ${t('cisim.magUnit')}` : null],
  ];
}

// Ay/Venüs/Merkür için evre, diğer gezegenler için dolu disk, yıldızlar için ışın
function glyph(o, date) {
  const ph = sky.phaseOf(o, date);
  const c = 36, r = 30;
  if (ph) {
    const rx = Math.abs(2 * ph.k - 1) * r;
    const s1 = ph.litRight ? 1 : 0;
    const s2 = (ph.k > 0.5) === ph.litRight ? 1 : 0;
    return `<svg class="evre" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--murekkep-3)"/>
      <path d="M${c} ${c - r}A${r} ${r} 0 0 ${s1} ${c} ${c + r}A${rx} ${r} 0 0 ${s2} ${c} ${c - r}Z" fill="var(--murekkep-2)"/></svg>`;
  }
  if (o.body) return `<svg class="evre" viewBox="0 0 72 72" aria-hidden="true"><circle cx="${c}" cy="${c}" r="${r - 6}" fill="var(--murekkep-2)"/><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--murekkep-3)"/></svg>`;
  if (o.sat) return '';
  if (o.type === 'galaksi' || o.type === 'bulutsu') return `<svg class="evre" viewBox="0 0 72 72" aria-hidden="true"><ellipse cx="${c}" cy="${c}" rx="${o.type === 'galaksi' ? 30 : 22}" ry="${o.type === 'galaksi' ? 10 : 16}" transform="rotate(-30 ${c} ${c})" fill="none" stroke="var(--murekkep-3)"/><ellipse cx="${c}" cy="${c}" rx="${o.type === 'galaksi' ? 12 : 9}" ry="${o.type === 'galaksi' ? 4 : 7}" transform="rotate(-30 ${c} ${c})" fill="var(--murekkep-2)"/></svg>`;
  return `<svg class="evre" viewBox="0 0 72 72" aria-hidden="true" stroke="var(--murekkep-2)"><path d="M36 14v44M14 36h44M22 22l28 28M50 22L22 50" stroke-width="1"/><circle cx="36" cy="36" r="4" fill="var(--murekkep)" stroke="none"/></svg>`;
}

// ---------- Yönlendirme ----------
function route() {
  const [name, arg] = (location.hash.replace('#', '') || 'bak').split('/');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('.lang [data-lang]').forEach(el => el.classList.toggle('on', el.dataset.lang === getLang()));
  const tab = name === 'cisim' ? (state.quiz.result?.id === arg ? 'sor' : 'bak') : name;
  document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  cancelAnimationFrame(raf);
  window.scrollTo(0, 0);
  renderClock();
  if (name === 'gece') viewGece();
  else if (name === 'sor') viewSor();
  else if (name === 'cisim') viewCisim(arg);
  else viewBak();
}

document.getElementById('theme').onclick = () => applyTheme(document.documentElement.dataset.theme === 'gunduz' ? 'gece' : 'gunduz');
document.getElementById('lang').onclick = () => { setLang(getLang() === 'tr' ? 'en' : 'tr'); route(); };
window.addEventListener('hashchange', route);
setLang(getLang());
applyTheme(savedTheme() === 'gunduz' ? 'gunduz' : 'gece');
clockFromUrl();
ensureLocation().then(() => refreshSky(true));
route();
// İstasyonların yörünge verisi: gerekirse arka planda tazele, gelince açık ekranı yenile
sats.refreshTLE().then(changed => { if (changed) { state.satsAt = 0; rerender(); } });

// Geliştirirken (localhost) önbellek eski dosyaları göstermesin diye servis çalışanı kapalı
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
