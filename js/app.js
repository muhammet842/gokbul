import { t, L, upper, getLang, setLang, locale } from './i18n.js';
import { byId, TYPE_LABEL } from './objects.js';
import * as sky from './sky.js';
import { getLocation, startOrientation, toAzAlt } from './sensors.js';

const $view = document.getElementById('view');
const state = {
  loc: null, obs: null,
  sensor: 'off',            // off | live | drag
  vec: null,                // yumuşatılmış yön vektörü
  dir: { az: 247, alt: 18 },
  sky: [], skyAt: 0,
  quiz: { step: 'move', answers: [], hint: false, result: null },
};

// ---------- Yardımcılar ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hhmm = d => d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
const DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
const dirName = az => t('dir.' + DIRS[Math.round(az / 45) % 8]);
const DIRS_EN = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const dirShort = az => (getLang() === 'tr' ? DIRS : DIRS_EN)[Math.round(az / 45) % 8];
const fists = alt => Math.max(0, Math.round(alt / 10));
const whereText = (az, alt) => `${dirName(az)}, ${alt > 75 ? t('gece.overhead') : (fists(alt) <= 1 ? t('gece.above1') : t('gece.above', { n: fists(alt) }))}`;
const cap = s => s.charAt(0).toLocaleUpperCase(locale()) + s.slice(1);
const fmtMag = m => (m < 0 ? '−' : '') + Math.abs(m).toFixed(1);

async function ensureLocation() {
  if (state.loc) return;
  state.loc = await getLocation();
  state.obs = sky.makeObserver(state.loc);
}

function refreshSky(force) {
  const now = Date.now();
  if (!force && now - state.skyAt < 20e3) return;
  state.sky = sky.visibleNow(new Date(), state.obs);
  state.skyAt = now;
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
let raf = 0, lastCardKey = '';

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
  lastCardKey = '';
  if (state.sensor === 'off') {
    document.getElementById('card').innerHTML = `
      <button class="start" id="startBtn" type="button"><span>${t('bak.start')}</span><span>→</span></button>
      <p class="pad t-veri soluk" style="margin-top:12px">${t('bak.startHint')}</p>`;
    document.getElementById('startBtn').onclick = startLooking;
  }
  enableDrag();
  loop();
}

async function startLooking() {
  // iOS: izin isteği bir dokunuşun içinden yapılmalı, bu yüzden önce yön sensörünü başlatıyoruz
  const live = await startOrientation(v => {
    const s = state.vec, k = 0.15; // basit yumuşatma
    state.vec = s ? { east: s.east + (v.east - s.east) * k, north: s.north + (v.north - s.north) * k, up: s.up + (v.up - s.up) * k } : v;
    state.dir = toAzAlt(state.vec);
  });
  await ensureLocation();
  refreshSky(true);
  state.sensor = live ? 'live' : 'drag';
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
  if (state.obs) refreshSky();
  const { az, alt } = state.dir;
  drawRuler(az);
  drawVizor(az, alt);
  if (state.sensor !== 'off') drawCard(az, alt);
  raf = requestAnimationFrame(loop);
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

function drawVizor(az, alt) {
  const g = document.getElementById('stars');
  if (!g) return;
  const best = state.sensor !== 'off' ? sky.identify(az, alt, state.sky)[0] : null;
  let html = '';
  for (const p of state.sky) {
    const daz = ((p.az - az + 540) % 360) - 180;
    const x = 195 + daz * Math.cos(p.alt * Math.PI / 180) * PX;
    const y = 150 - (p.alt - alt) * PX;
    if (x < -20 || x > 410 || y < -20 || y > 320) continue;
    const r = Math.max(1.2, (2.5 - p.mag) * 0.9);
    const isBest = best && best.obj === p.obj;
    html += `<circle cx="${x}" cy="${y}" r="${r}" fill="var(${isBest ? '--murekkep' : '--murekkep-2'})"/>`;
    if (isBest) html += `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="none" stroke="var(--kirmizi)" stroke-dasharray="3 3"/>`;
    else html += `<text x="${x + r + 5}" y="${y + 4}" font-family="IBM Plex Mono" font-size="10" fill="var(--murekkep-3)">${esc(L(p.obj.name))}</text>`;
  }
  g.innerHTML = html;
  const hy = 150 + alt * PX;
  const h = document.getElementById('horizon');
  h.setAttribute('y1', hy); h.setAttribute('y2', hy);
  document.getElementById('altText').textContent = alt < 0 ? t('bak.below') : `${t('bak.altitude')} ${Math.round(alt)}°`;
}

function drawCard(az, alt) {
  const hits = sky.identify(az, alt, state.sky);
  const [best, second] = hits;
  const key = (best?.obj.id ?? '-') + (second?.obj.id ?? '-') + getLang() + (best && best.sep < 8);
  if (key === lastCardKey) return;
  lastCardKey = key;
  const card = document.getElementById('card');
  if (!best) {
    card.innerHTML = `<div class="cevap"><span class="t-etiket">${upper(t('bak.nothing'))}</span><p class="t-not">${t(state.sensor === 'drag' ? 'bak.nosensor' : 'bak.nothingHint')}</p></div>`;
    return;
  }
  const o = best.obj;
  const steady = o.body ? (getLang() === 'tr' ? 'titreşmez' : 'steady') : (getLang() === 'tr' ? 'titreşir' : 'twinkles');
  card.innerHTML = `
    <div class="cevap">
      <div class="row"><span class="t-etiket kirmizi">${upper(best.sep < 8 ? t('bak.likely') : t('bak.maybe'))}</span><span class="t-etiket">${fmtMag(best.mag)} ${t('cisim.magUnit')}</span></div>
      <h1 class="t-dev">${esc(L(o.name))}</h1>
      <p class="t-veri">${L(TYPE_LABEL[o.type])} · ${steady}</p>
      <p class="t-not">${esc(L(o.note))}</p>
      <div class="row" style="padding-top:6px">
        <a class="link" href="#cisim/${o.id}">${t('bak.why')}</a>
        ${second ? `<span class="t-veri soluk" style="font-size:10px">${t('bak.other')}: ${esc(L(second.obj.name))}</span>` : ''}
      </div>
    </div>`;
}

// ---------- 02 · Bu gece ----------
async function viewGece() {
  $view.innerHTML = `<div class="gece-head"><span class="t-etiket">${t('gece.locating')}</span></div>`;
  await ensureLocation();
  refreshSky(true);
  const now = new Date();
  const { win, items } = sky.tonight(now, state.obs);
  const date = upper(now.toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }));
  const sunLine = win ? (now > win.sunset ? t('gece.sunsetPast', { t: hhmm(win.sunset) }) : t('gece.sunset', { t: hhmm(win.sunset) })) : '';
  const place = state.loc.fallback ? t('gece.defaultLoc') : `${state.loc.lat.toFixed(1)}°, ${state.loc.lon.toFixed(1)}°`;
  $view.innerHTML = `
    <div class="gece-head">
      <span class="t-etiket">${date}</span>
      <h1 class="t-buyuk">${t('gece.title')}</h1>
      <p class="t-veri">${place} · ${sunLine} · ${t('gece.moon', { p: sky.moonPercent(now) })}</p>
    </div>
    ${items.length ? `<ul class="kayitlar">${items.map(kayit).join('')}</ul>` : `<p class="bos t-not">${t('gece.empty')}</p>`}
    <p class="ipucu"><b>${t('gece.fist')}</b><span>${t('gece.hint')}</span></p>`;
}

function kayit(i) {
  const n = Math.min(4, Math.max(1, fists(i.alt)));
  const note = i.obj.body ? (i.sets ? t('gece.sets', { t: hhmm(i.sets) }) : cap(L(i.obj.alias))) : L(i.obj.note);
  return `
    <li><a class="kayit" href="#cisim/${i.obj.id}">
      <span class="saat${i.isNow ? ' simdi' : ''}">${i.isNow ? t('gece.now') : hhmm(i.time)}</span>
      <span>
        <span class="ad">${esc(L(i.obj.name))}</span><br>
        <span class="yon">${whereText(i.az, i.alt)}</span><br>
        <span class="not">${esc(note)}</span>
      </span>
      <span class="ufuk" aria-hidden="true"><span class="cetvel"></span><span class="nokta" style="top:${45 - n * 10}px"></span><span class="ymr">${n} ${t('gece.fist')}</span></span>
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
    const now = new Date();
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
  $view.innerHTML = `
    <div class="cevap">
      <span class="t-etiket kirmizi">${upper(r.none ? t('bak.nothing') : t('bak.likely'))}</span>
      <h1 class="t-buyuk">${t(name)}</h1>
      <p class="t-not">${t(note)}</p>
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
  const now = new Date();
  const p = sky.position(o, now, state.obs);
  const night = sky.tonight(now, state.obs, 99).items.find(i => i.obj === o);
  const tonightText = night ? `${night.isNow ? t('gece.now') : hhmm(night.time)}${night.sets ? ' – ' + hhmm(night.sets) : ''}` : t('cisim.notUp');
  const where = p.alt > 0 ? whereText(p.az, p.alt) : night ? whereText(night.az, night.alt) : '—';
  const dist = p.distKm == null ? null
    : p.distKm < 1e6 ? `${Math.round(p.distKm).toLocaleString(locale())} km`
    : t('cisim.km', { n: Math.round(p.distKm / 1e6).toLocaleString(locale()) });
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
      <div><span class="t-etiket">${t('cisim.tonight')}</span><span>${tonightText}</span></div>
      <div><span class="t-etiket">${t('cisim.where')}</span><span>${where}</span></div>
      ${dist ? `<div><span class="t-etiket">${t('cisim.dist')}</span><span>${dist}</span></div>` : ''}
      <div><span class="t-etiket">${t('cisim.mag')}</span><span>${fmtMag(p.mag)} ${t('cisim.magUnit')}</span></div>
    </div>
    <div class="uc-sey">
      ${o.facts ? `<h2 class="t-orta">${t('cisim.three')}</h2><ol>${L(o.facts).map(f => `<li>${esc(f)}</li>`).join('')}</ol>` : `<p class="t-not">${esc(L(o.note))}</p>`}
    </div>`;
  if (from === 'sor') state.quiz = { step: 'move', answers: [], hint: false, result: null };
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
ensureLocation().then(() => refreshSky(true));
route();

// Geliştirirken (localhost) önbellek eski dosyaları göstermesin diye servis çalışanı kapalı
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
