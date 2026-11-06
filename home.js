/* home.js — Mundo da Elo (início, tela fixa) + Casa da Elo (Quarto, Guarda-roupa, Bichinho e Cuidados) */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const sfx = n => { try { if (typeof playCuteSfx === 'function') playCuteSfx(n); } catch (_) {} };
const dateKey = () => { try { return typeof getBrasiliaDateStr === 'function' ? getBrasiliaDateStr() : new Date().toISOString().slice(0, 10); } catch (_) { return ''; } };

/* ---------------- mapa de lugares ---------------- */
const MAP = {
  casa:      ['casaPanel', 'casa', 'Bem-vinda à Casa da Elo! Quarto, guarda-roupa, bichinho e dentinhos, tudo aqui!'],
  room:      ['roomPanel', 'casa', 'Vamos para o meu Quarto 3D! Você pode decorar tudo e trocar meus looks!'],
  wardrobe:  ['wardrobePanel', 'casa', 'Vamos para o Guarda-roupa escolher um look bem lindo!'],
  pet:       ['petPanel', 'casa', 'Vamos visitar e cuidar do meu Bichinho Virtual fofinho!'],
  care:      ['carePanel', 'casa', 'Hora de cuidar dos dentinhos no Consultório da Elo!'],
  studio3d:  ['modelStudio', null, 'Bem-vinda ao Estúdio 3D! Vamos girar modelos e voar com a Unicórnia!'],
  school:    ['learnPanel', 'learn', 'Hora de aprender e tocar piano na Escolinha Mágica!'],
  creative:  ['createPanel', 'create', 'Vamos pintar, desenhar e inventar receitas no Ateliê!'],
  play:      ['playPanel', 'play', 'Bem-vinda à Ilha dos Jogos! Escolha seu minijogo favorito!'],
  rpg:       ['rpg', null, 'O portal do Reino das Estrelas está aberto! Vamos para a aventura!'],
  cinema:    ['watchPanel', 'watch', 'Pegue a pipoca! O Cinema e os episódios da Elo vão começar!'],
  family:    ['familyPanel', 'play', 'Festa da Família! Vamos jogar mímica e duelos juntos!'],
  library:   ['storiesPanel', 'stories', 'Na biblioteca, cada livrinho é uma linda aventura!'],
  club:      ['clubPanel', 'watch', 'Bem-vinda ao Clubinho especial da Elo!']
};
const PLACE_TO_STOP = { casa: 'casa', room: 'casa', wardrobe: 'casa', pet: 'casa', care: 'casa', school: 'school', play: 'play', family: 'play', cinema: 'cinema', club: 'cinema', creative: 'creative', studio3d: 'creative', library: 'library', rpg: 'rpg' };
const STOP_IN = { casa: 'na Casa da Elo', school: 'na Escolinha', play: 'nos Jogos', cinema: 'no Cinema', creative: 'no Ateliê', library: 'nas Histórias', rpg: 'no Reino das Estrelas' };
const NAV_OF = { casaPanel: 'casa', roomPanel: 'casa', wardrobePanel: 'casa', petPanel: 'casa', carePanel: 'casa', familyPanel: 'play' };

/* ---------------- dia / tarde / noite ---------------- */
function timeOfDay() { const h = new Date().getHours(); return (h >= 19 || h < 6) ? 'night' : (h >= 17 ? 'dusk' : 'day'); }

/* ---------------- estado do bichinho (para avisos) ---------------- */
const NEEDS = [['hunger', 'está com fominha 🥣'], ['clean', 'precisa de banho 🫧'], ['energy', 'está com sono 💤'], ['love', 'quer carinho 💗'], ['fun', 'quer brincar 🎈'], ['study', 'quer estudar 📚']];
function petState() {
  try {
    if (typeof rawLoad !== 'function' || !window.EloPetCore) return null;
    const p = rawLoad(), now = Date.now();
    if (p.ranAway) return { kind: 'letter', name: p.name };
    if (p.stage === 'egg') return { kind: 'egg', name: p.name, ready: now - Number(p.lastEggCareAt || 0) >= 120000 };
    const e = EloPetCore.estimate(p, now);
    if (e.ranAway) return { kind: 'letter', name: p.name };
    if (EloPetCore.isSleeping(p, now)) return { kind: 'sleep', name: p.name };
    let worst = null;
    NEEDS.forEach(n => { const v = e[n[0]]; if (v < 40 && (!worst || v < worst.v)) worst = { v, txt: n[1] }; });
    return worst ? { kind: 'need', name: p.name, txt: worst.txt } : { kind: 'ok', name: p.name, species: p.species, stage: p.stage };
  } catch (_) { return null; }
}
function giftAvailable() { try { return pget('eloStarDaily_' + dateKey()) !== '1'; } catch (_) { return false; } }

/* ---------------- INÍCIO ---------------- */
let lastSayAt = 0, currentSuggestion = null;
const origGuide = window.eloGuideSay;
window.eloGuideSay = function (msg) { lastSayAt = Date.now(); if (typeof origGuide === 'function') return origGuide.apply(this, arguments); const t = $('eloGuideText'); if (t) t.textContent = msg; };
function setGuide(text, btn) {
  const t = $('eloGuideText'); if (t && t.textContent !== text) t.textContent = text;
  const b = $('hmGuideBtn'); if (!b) return;
  if (btn) { b.textContent = btn; b.classList.remove('hidden'); } else b.classList.add('hidden');
}
function suggestion() {
  const s = petState();
  if (s && s.kind === 'letter') return { txt: `💌 ${s.name} deixou uma cartinha! Vamos ver?`, btn: '🏡 Ir para a Casa', go: 'casa' };
  if (s && s.kind === 'need') return { txt: `${s.name} ${s.txt}! Vamos cuidar?`, btn: '🏡 Ir para a Casa', go: 'casa' };
  if (s && s.kind === 'egg' && s.ready) return { txt: 'O ovinho quer um carinho para chocar! 🥚', btn: '🏡 Ir para a Casa', go: 'casa' };
  if (giftAvailable()) return { txt: 'Tem um presente esperando no Baú hoje! 🎁', btn: '🎁 Abrir o Baú', fn: 'chest' };
  let last = null; try { last = pget('v3LastPlace'); } catch (_) {}
  const stop = PLACE_TO_STOP[last];
  if (last && stop && last !== 'casa') return { txt: `Quer continuar ${STOP_IN[stop]}?`, btn: '▶ Continuar', go: last };
  const tips = ['Para onde vamos hoje? Toque num lugar do mapa!', 'Procure os 3 segredos escondidos pelo mapa! 🔎', 'Toque no patinho da lagoa! 🦆', 'Na Casa da Elo tem o seu bichinho! 🐾'];
  return { txt: tips[Math.floor(Date.now() / 15000) % tips.length] };
}
function stopEl(key) { return document.querySelector(`#homePanel .hmStop[data-stop="${key}"]`); }
function stopPos(key) { const e = stopEl(key); return e ? { x: parseFloat(e.style.getPropertyValue('--x')), y: parseFloat(e.style.getPropertyValue('--y')) } : null; }
function setEloAt(key, instant) {
  const el = $('worldEloWalker'); if (!el) return;
  const p = stopPos(key); const x = p ? p.x : 47, y = p ? Math.min(96, p.y + 13) : 58;
  if (instant) { el.style.transition = 'none'; }
  el.style.setProperty('--ex', x); el.style.setProperty('--ey', y);
  if (instant) { void el.offsetWidth; el.style.transition = ''; }
}
function walkTo(place, cb) {
  const key = PLACE_TO_STOP[place], el = $('worldEloWalker'), home = $('homePanel'), p = key ? stopPos(key) : null;
  if (!key || !el || !p || !home || !home.classList.contains('active')) { if (cb) cb(); return; }
  const cx = parseFloat(el.style.getPropertyValue('--ex')) || 47, cy = parseFloat(el.style.getPropertyValue('--ey')) || 58;
  const nx = p.x, ny = Math.min(96, p.y + 13), far = Math.hypot(nx - cx, ny - cy) > 1.5;
  try { pset('hmEloAt', key); } catch (_) {}
  let done = false;
  const finish = () => { if (done) return; done = true; el.classList.remove('walking'); if (!reduceMotion()) { el.classList.add('jump'); setTimeout(() => el.classList.remove('jump'), 650); } sfx('coin'); setTimeout(() => { if (cb) cb(); }, reduceMotion() ? 0 : 260); };
  if (reduceMotion() || !far) { setEloAt(key, true); return finish(); }
  el.classList.toggle('faceLeft', nx < cx - 1); el.classList.add('walking');
  el.style.setProperty('--ex', nx); el.style.setProperty('--ey', ny);
  setTimeout(finish, 900);
}
window.walkEloAlongRoad = walkTo;

window.openWorldPlace = function (place) {
  const a = MAP[place]; if (!a) return;
  try { pset('v3LastPlace', place); } catch (_) {}
  try { if (typeof renderHomeContinue === 'function') renderHomeContinue(); } catch (_) {}
  if (typeof window.eloGuideSay === 'function') window.eloGuideSay(a[2]);
  if (place === 'library') {
    document.body.classList.add('reading-portrait-allowed');
    try { if (screen.orientation && typeof screen.orientation.unlock === 'function') screen.orientation.unlock(); } catch (_) {}
  }
  walkTo(place, () => {
    if (a[0] === 'rpg') { if (typeof openRpg === 'function') openRpg(); }
    else if (a[0] === 'modelStudio' || place === 'studio3d') { if (typeof openModelStudio === 'function') openModelStudio(); }
    else if (place === 'pet') { if (typeof openPet === 'function') openPet(); else window.openPanel('petPanel', 'casa'); }
    else window.openPanel(a[0], a[1]);
  });
};

function renderHome() {
  const sc = $('hmScene'); if (!sc) return;
  const t = timeOfDay(); if (sc.dataset.time !== t) sc.dataset.time = t;
  const sun = $('hmSun'); if (sun) { const em = t === 'night' ? '🌙' : '☀️'; if (sun.textContent !== em) sun.textContent = em; }
  // selo do bichinho na Casa
  const s = petState(), badge = document.querySelector('#homePanel .hmStop[data-stop="casa"] .hmBadge');
  if (badge) {
    const need = s && (s.kind === 'letter' || s.kind === 'need' || (s.kind === 'egg' && s.ready));
    badge.classList.toggle('hidden', !need); badge.textContent = s && s.kind === 'letter' ? '💌' : '!';
  }
  // ponto no Baú
  const dot = document.querySelector('#hmChest .hmDot'); if (dot) dot.classList.toggle('hidden', !giftAvailable());
  // segredos
  try { const v = v3Load(), n = (v.secrets || []).length; const c = $('hmSecretCount'); if (c) c.textContent = n + '/3'; ['star', 'unicorn', 'bow'].forEach(id => { const b = document.querySelector(`#homePanel .hmSecret[data-sec="${id}"]`); if (b) b.classList.toggle('found', (v.secrets || []).indexOf(id) >= 0); }); } catch (_) {}
  // "continuar"
  let last = null; try { last = pget('v3LastPlace'); } catch (_) {}
  const lastStop = PLACE_TO_STOP[last];
  document.querySelectorAll('#homePanel .hmStop').forEach(el => { const n = el.querySelector('.hmNext'); if (n) n.classList.toggle('hidden', !(el.dataset.stop === lastStop)); });
  // sugestão da Elo (não atropela uma fala recente)
  currentSuggestion = suggestion();
  if (Date.now() - lastSayAt > 7000) setGuide(currentSuggestion.txt, currentSuggestion.btn);
}
function hmFit() {
  const hp = $('homePanel'); if (!hp || !hp.classList.contains('active')) return;
  const hd = document.querySelector('header'); const top = hd ? Math.round(hd.getBoundingClientRect().bottom) : 0;
  hp.style.setProperty('--hmTop', Math.max(0, top) + 'px');
  const sc = $('hmScene'); if (sc) sc.style.setProperty('--hmEloS', Math.max(.5, Math.min(.95, sc.clientHeight / 460)).toFixed(3));
}
window.hmGuideGo = function () {
  const s = currentSuggestion; if (!s) return;
  if (s.fn === 'chest') { if (typeof openStarShop === 'function') openStarShop(); return; }
  if (s.go) window.openWorldPlace(s.go);
};
window.hmEloTap = function () {
  const el = $('worldEloWalker'); if (el && !reduceMotion()) { el.classList.add('jump'); setTimeout(() => el.classList.remove('jump'), 650); }
  sfx('tap');
  const s = suggestion(); currentSuggestion = s;
  if (typeof window.eloGuideSay === 'function') window.eloGuideSay(s.txt); setGuide(s.txt, s.btn);
};
let duckTaps = 0;
window.hmDuck = function () {
  const d = $('hmDuck'); if (d) { d.classList.remove('jump'); void d.offsetWidth; d.classList.add('jump'); }
  sfx('tap'); duckTaps++;
  const t = $('eloGuideText'); lastSayAt = Date.now(); if (t) t.textContent = duckTaps >= 5 ? 'O patinho adorou as cócegas! 🦆💗' : 'Quá quá! 🦆';
  if (duckTaps >= 5) { duckTaps = 0; try { const k = 'hmDuckStar_' + dateKey(); if (pget(k) !== '1') { pset(k, '1'); if (typeof addStars === 'function') addStars(1, 'O patinho te deu uma estrelinha! +1 ⭐'); } } catch (_) {} }
};
window.hmFly = function () {
  sfx('tap'); lastSayAt = Date.now(); const t = $('eloGuideText'); if (t) t.textContent = 'Que borboleta linda! 🦋';
  const f = $('hmFly'); if (f) { f.style.fontSize = '30px'; setTimeout(() => { f.style.fontSize = ''; }, 400); }
};

/* ---------------- CASA DA ELO ---------------- */
let petSig = '';
function accIcon(id) { try { return (window.petAccessoryIcon && window.petAccessoryIcon(id)) || ''; } catch (_) { return ''; } }
function stageKey(p) { try { return (window.petStageKey && window.petStageKey(p)) || p.stage; } catch (_) { return p.stage; } }
function creatureHTML(p) {
  const sp = p.species || 'unicorn', st = stageKey(p), acc = accIcon(p.accessory);
  return `<div class="petCreature species-${sp} stage-${st} roomPetCreature"><span class="petWing wL"></span><span class="petWing wR"></span><span class="petEar earL"></span><span class="petEar earR"></span><span class="petHorn"></span><span class="petMane"></span><span class="petTail"></span><span class="petBody"></span><span class="petHead"><i class="petEye e1"></i><i class="petEye e2"></i><i class="petMouth"></i><i class="petCheek c1"></i><i class="petCheek c2"></i></span><span class="petAccessory" data-kind="${p.accessory || 'none'}">${acc}</span></div>`;
}
function renderCasa() {
  const house = $('csHouse'); if (!house) return;
  const t = timeOfDay(); if (house.dataset.time !== t) house.dataset.time = t;
  let p = null; try { p = typeof rawLoad === 'function' ? rawLoad() : null; } catch (_) {}
  const s = petState(), stage = $('csPetStage'), mood = $('csPetMood'), badge = $('csPetBadge');
  if (p && stage) {
    let sig, html;
    if (p.ranAway) { sig = 'letter'; html = '<span class="csLetter">💌</span>'; }
    else if (p.stage === 'egg') { sig = 'egg'; html = '<span class="csEgg">🥚</span>'; }
    else { sig = `${p.species}|${stageKey(p)}|${p.accessory}`; html = creatureHTML(p); }
    if (sig !== petSig) { petSig = sig; stage.innerHTML = html; }
  }
  if (mood && s) {
    let txt = 'Cuidar e brincar 🐾';
    if (s.kind === 'letter') txt = `${s.name} deixou uma cartinha 💌`;
    else if (s.kind === 'egg') txt = s.ready ? 'O ovinho quer carinho 🥚' : 'Chocando o ovinho 🥚';
    else if (s.kind === 'need') txt = `${s.name} ${s.txt}`;
    else if (s.kind === 'sleep') txt = `${s.name} está dormindo 🌙`;
    else txt = `${s.name} está bem 💗`;
    if (mood.textContent !== txt) mood.textContent = txt;
  }
  if (badge) { const need = s && (s.kind === 'letter' || s.kind === 'need' || (s.kind === 'egg' && s.ready)); badge.classList.toggle('hidden', !need); badge.textContent = s && s.kind === 'letter' ? '💌' : '!'; }
}
function csFit() {
  const cp = $('casaPanel'); if (!cp || !cp.classList.contains('active')) return;
  const nav = document.querySelector('nav'); const navTop = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().top : window.innerHeight;
  cp.style.setProperty('--csH', Math.max(200, Math.floor(navTop - 4)) + 'px');
  const room = document.querySelector('#casaPanel .r-pet'); if (room) { const s = Math.max(.3, Math.min(.85, room.clientHeight * .72 / 185)); cp.style.setProperty('--csPS', s.toFixed(3)); }
}
window.casaGo = function (room) {
  const btn = document.querySelector(`#casaPanel .csRoom[data-room="${room}"]`);
  try { pset('v3LastPlace', 'casa'); } catch (_) {}
  if (btn && !reduceMotion()) btn.classList.add('entering'); sfx('coin');
  setTimeout(() => {
    if (btn) btn.classList.remove('entering');
    if (room === 'pet') { if (typeof openPet === 'function') openPet(); else window.openPanel('petPanel', 'casa'); }
    else window.openPanel({ room: 'roomPanel', wardrobe: 'wardrobePanel', care: 'carePanel' }[room], 'casa');
  }, reduceMotion() ? 0 : 280);
};

/* ---------------- moldura fixa (todos os painéis) ---------------- */
function shellFit() {
  const root = document.documentElement, hd = document.querySelector('header'), nav = document.querySelector('nav');
  const hv = hd && getComputedStyle(hd).display !== 'none', nv = nav && getComputedStyle(nav).display !== 'none';
  root.style.setProperty('--shellTop', (hv ? Math.max(0, Math.round(hd.getBoundingClientRect().bottom)) : 0) + 'px');
  root.style.setProperty('--shellBottom', (nv ? Math.max(0, Math.round(window.innerHeight - nav.getBoundingClientRect().top + 2)) : 0) + 'px');
}
document.body.classList.add('shell');

/* ---------------- integração ---------------- */
const prevOpenPanel = window.openPanel;
window.openPanel = function (id, nav, fromHistory) {
  if (NAV_OF[id]) nav = NAV_OF[id];
  const r = prevOpenPanel.call(this, id, nav, fromHistory);
  shellFit(); const _p = $(id); if (_p && !fromHistory) _p.scrollTop = 0;
  if (id === 'homePanel') { hmFit(); renderHome(); setTimeout(() => { hmFit(); renderHome(); }, 120); }
  else if (id === 'casaPanel') { csFit(); renderCasa(); setTimeout(() => { csFit(); renderCasa(); }, 120); }
  return r;
};
window.addEventListener('DOMContentLoaded', () => {
  const at = (() => { try { return pget('hmEloAt'); } catch (_) { return null; } })();
  setEloAt(stopEl(at) ? at : null, true);
  shellFit(); hmFit(); renderHome();
  window.addEventListener('resize', () => { shellFit(); hmFit(); csFit(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { shellFit(); hmFit(); csFit(); }, 250));
  setInterval(() => {
    const h = $('homePanel'), c = $('casaPanel');
    if (h && h.classList.contains('active')) renderHome(); else if (c && c.classList.contains('active')) renderCasa();
  }, 5000);
  if (window.ResizeObserver) { const ro = new ResizeObserver(() => { hmFit(); csFit(); }); if ($('homePanel')) ro.observe($('homePanel')); if ($('casaPanel')) ro.observe($('casaPanel')); }
});
window.renderHomeScene = renderHome; window.renderCasa = renderCasa;
})();
