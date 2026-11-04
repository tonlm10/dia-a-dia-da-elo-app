/* Dia a Dia da Elo — Bichinho da Elo v5 (tela fixa, brincadeiras interativas, álbum, lembretes) */
(function () {
'use strict';
const PET_KEY = 'eloVirtualPetV1', ALBUM_KEY = 'eloPetAlbumV1', SFX_KEY = 'eloPetSfx';
const EGG_CARE_GOAL = 5, EGG_COOLDOWN_MS = 2 * 60 * 1000;
const Core = window.EloPetCore;
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------------- dados ---------------- */
const SPECIES = {
  unicorn: { label: 'Unicórnio', defaultName: 'Luma', icon: '🦄', fav: 'strawberry' },
  cat: { label: 'Gatinho', defaultName: 'Pipoca', icon: '🐱', fav: 'milk' },
  dog: { label: 'Cachorrinho', defaultName: 'Pingo', icon: '🐶', fav: 'meat' },
  bunny: { label: 'Coelhinho', defaultName: 'Nuvem', icon: '🐰', fav: 'carrot' },
  dragon: { label: 'Dragãozinho', defaultName: 'Faísca', icon: '🐲', fav: 'cake' },
  pony: { label: 'Pônei Estelar', defaultName: 'Jujuba', icon: '🐴', fav: 'apple' }
};
const FOODS = [
  { id: 'apple', icon: '🍎', name: 'Maçã', h: 22, e: 2 }, { id: 'strawberry', icon: '🍓', name: 'Morango', h: 22, e: 2 },
  { id: 'carrot', icon: '🥕', name: 'Cenoura', h: 22, e: 2 }, { id: 'cake', icon: '🍰', name: 'Bolo', h: 16, f: 8 },
  { id: 'milk', icon: '🥛', name: 'Leite', h: 18, e: 4 }, { id: 'meat', icon: '🍗', name: 'Frango', h: 26, e: 1 }
];
const ACCESSORIES = [
  { id: 'none', icon: '✨', name: 'Sem acessório', need: 0, cost: 0 }, { id: 'bow', icon: '🎀', name: 'Laço', need: 5, cost: 2 },
  { id: 'flower', icon: '🌸', name: 'Florzinha', need: 8, cost: 3 }, { id: 'star', icon: '⭐', name: 'Estrela', need: 12, cost: 4 },
  { id: 'glasses', icon: '🕶️', name: 'Óculos', need: 16, cost: 5 }, { id: 'hat', icon: '🎩', name: 'Cartola', need: 20, cost: 6 },
  { id: 'crown', icon: '👑', name: 'Coroa', need: 24, cost: 8 }
];
const SCENES = [
  { id: 'meadow', icon: '🌳', name: 'Campinho', cost: 0 }, { id: 'beach', icon: '🏖️', name: 'Praia', cost: 5 },
  { id: 'castle', icon: '🏰', name: 'Castelo', cost: 8 }, { id: 'space', icon: '🪐', name: 'Espaço', cost: 10 }
];
const ACTION_TARGET = { feed: 'hunger', sleep: 'energy', bath: 'clean', hygiene: 'clean', play: 'fun', love: 'love', study: 'study' };
const ACTION_LABEL = { feed: 'Fome', sleep: 'Energia', bath: 'Higiene', hygiene: 'Higiene', play: 'Diversão', love: 'Carinho', study: 'Estudo' };
const STAT_DEFS = [['hunger', '🥣', 'Fome'], ['fun', '🎾', 'Diversão'], ['energy', '⚡', 'Energia'], ['love', '💗', 'Carinho'], ['clean', '🫧', 'Higiene'], ['study', '📚', 'Estudo']];
const SUGGEST = { hunger: 'feed', clean: 'bath', energy: 'sleep', fun: 'play', love: 'love', study: 'study' };
const H = 3600e3, D = 24 * H;
const EVOLUTION_STAGES = [
  { key: 'baby', label: 'Bebê', minAgeMs: 0, minCare: 0, nextAgeMs: 12 * H, nextCare: 10, nextLabel: 'Criança' },
  { key: 'child', label: 'Criança', minAgeMs: 12 * H, minCare: 10, nextAgeMs: 2 * D, nextCare: 24, nextLabel: 'Adolescente' },
  { key: 'teen', label: 'Adolescente', minAgeMs: 2 * D, minCare: 24, nextAgeMs: 4 * D, nextCare: 42, nextLabel: 'Adulto' },
  { key: 'adult', label: 'Adulto', minAgeMs: 4 * D, minCare: 42, nextAgeMs: 7 * D, nextCare: 65, nextLabel: 'Idoso' },
  { key: 'elder', label: 'Idoso', minAgeMs: 7 * D, minCare: 65, nextAgeMs: 10 * D, nextCare: 80, nextLabel: 'Jornada das Estrelas' }
];
const TIPS = ['Toque no seu bichinho para fazer cócegas!', 'A comidinha favorita dá mais carinho!', 'Estoure balões para brincar!', 'Esfregue o bichinho na hora do banho!',
  'Veja o Álbum 📖 com os bichinhos que você já criou', 'Ligue os lembretes 🔔 para não esquecer dele'];

/* ---------------- estado ---------------- */
function defaultPet() {
  return { stage: 'egg', species: null, name: 'Ovinho misterioso', eggCare: 0, careCount: 0, bornAt: 0,
    hunger: 86, energy: 86, clean: 86, fun: 86, love: 90, study: 80, accessory: 'none', ownedAcc: ['none'], scene: 'meadow', ownedScenes: ['meadow'],
    lastSeen: Date.now(), lastEggCareAt: 0, lightsOff: false, sleepUntil: 0, sleepStartedAt: 0, lastSleepCareAt: 0, lastTapAt: 0,
    stageSeen: '', albumed: false, diary: [], rewards: { hatch: false, care10: false, care20: false, evolve: {} } };
}
function clamp(n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); }
function pnow() { return Date.now(); }
function rawLoad() {
  try {
    const saved = JSON.parse(pget(PET_KEY) || '{}');
    const p = Object.assign(defaultPet(), saved);
    if (!Object.prototype.hasOwnProperty.call(saved, 'lightsOff') && Number(saved.sleepUntil || 0) > pnow()) p.lightsOff = true;
    if (p.stage !== 'egg' && !p.bornAt) p.bornAt = Number(saved.lastSeen || saved.lastCareAt || pnow());
    ['hunger', 'energy', 'clean', 'fun', 'love', 'study'].forEach(k => { p[k] = clamp(p[k]); });
    p.rewards = Object.assign({ hatch: false, care10: false, care20: false, evolve: {} }, p.rewards || {});
    if (!p.rewards.evolve || typeof p.rewards.evolve !== 'object') p.rewards.evolve = {};
    if (!Array.isArray(p.ownedAcc)) p.ownedAcc = ['none'];
    if (!Array.isArray(p.ownedScenes) || !p.ownedScenes.length) p.ownedScenes = ['meadow'];
    if (!SCENES.some(s => s.id === p.scene)) p.scene = 'meadow';
    if (!Array.isArray(p.diary)) p.diary = [];
    ACCESSORIES.forEach(a => { if (p.careCount >= a.need && p.ownedAcc.indexOf(a.id) < 0) p.ownedAcc.push(a.id); });
    return p;
  } catch (_) { return defaultPet(); }
}
function savePet(p, stamp = true) {
  if (stamp) p.lastSeen = pnow();
  pset(PET_KEY, JSON.stringify(p));
  if (window.EloPetNotify) window.EloPetNotify.sync(p);
  return p;
}
function isSleeping(p, now = pnow()) { return p.lightsOff === true || Number(p.sleepUntil || 0) > now; }
function getPetAgeMs(p, now = pnow()) { return p.stage === 'egg' ? 0 : Math.max(0, now - Number(p.bornAt || now)); }
function formatDuration(ms) {
  const min = Math.max(0, Math.ceil(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  if (h < 48) return `${h}h${m ? ` ${m}min` : ''}`;
  const d = Math.floor(h / 24), hr = h % 24;
  return `${d} dia${d > 1 ? 's' : ''}${hr ? ` e ${hr}h` : ''}`;
}
function applyGentleDecay(p) {
  if (p.stage === 'egg' || p.ranAway) return p;
  const now = pnow(), last = Number(p.lastSeen || now), mins = Math.max(0, (now - last) / 60000);
  if (mins < 1) return p;
  if (now - last >= Core.AWAY_MS) { p.ranAway = true; diaryAdd(p, `${p.name} foi passear nas estrelas e deixou uma cartinha 💌`); albumAdd(p, 'away'); return savePet(p); }
  if (Number(p.sleepUntil || 0) > 0 && Number(p.sleepUntil) <= now) { p.sleepUntil = 0; p.sleepStartedAt = 0; }
  const e = Core.estimate(p, now);
  ['hunger', 'energy', 'clean', 'fun', 'love', 'study'].forEach(k => { p[k] = e[k]; });
  return savePet(p);
}
function loadPet() { return applyGentleDecay(rawLoad()); }
function diaryAdd(p, tx) { p.diary = p.diary || []; p.diary.unshift({ t: pnow(), tx }); p.diary = p.diary.slice(0, 30); }
function stageInfo(p) {
  if (p.stage === 'egg') return { key: 'egg', label: 'Ovinho', pct: Math.min(100, p.eggCare / EGG_CARE_GOAL * 100), egg: true };
  const ageMs = getPetAgeMs(p); let cur = EVOLUTION_STAGES[0];
  for (const st of EVOLUTION_STAGES) if (ageMs >= st.minAgeMs && Number(p.careCount || 0) >= st.minCare) cur = st;
  if (!cur.nextLabel) return { key: cur.key, label: cur.label, pct: 100, nextLabel: null, remainingCare: 0, remainingAgeMs: 0 };
  const carePct = ((Number(p.careCount || 0) - cur.minCare) / Math.max(1, cur.nextCare - cur.minCare)) * 100;
  const agePct = ((ageMs - cur.minAgeMs) / Math.max(1, cur.nextAgeMs - cur.minAgeMs)) * 100;
  return { key: cur.key, label: cur.label, pct: Math.max(0, Math.min(100, Math.round((carePct + agePct) / 2))), nextLabel: cur.nextLabel,
    remainingCare: Math.max(0, cur.nextCare - Number(p.careCount || 0)), remainingAgeMs: Math.max(0, cur.nextAgeMs - ageMs), currentAgeMs: ageMs };
}
function petGrade(p) { return Math.max(0, Math.min(10, Number(p.study || 0) / 10)).toFixed(1).replace('.', ','); }
function moodText(p) {
  if (isSleeping(p)) return `${p.name} está dormindo. Shhh... 🌙`;
  if (p.hunger < 35) return `${p.name} está com fome e quer comer 🥣`;
  if (p.clean < 35) return `${p.name} está sujinho e precisa de banho 🫧`;
  if (p.energy < 35) return `${p.name} está cansado. Que tal apagar a luz? 🌙`;
  if (p.study < 40) return `${p.name} quer estudar um pouquinho 📚`;
  if (p.fun < 35 || p.love < 35) return `${p.name} está tristinho. Brinque e faça carinho 💗`;
  const avg = (p.hunger + p.energy + p.clean + p.fun + p.love + p.study) / 6;
  if (avg > 90) return `${p.name} está radiante! ✨`;
  if (avg > 76) return `${p.name} está muito bem e feliz!`;
  if (avg > 58) return `${p.name} está tranquilo. Escolha um cuidado 💗`;
  return `${p.name} quer um pouco de atenção 💗`;
}
function visualAccessory(id) { const a = ACCESSORIES.find(x => x.id === id); return a && id !== 'none' ? a.icon : ''; }
function eggWait(p) { return Math.max(0, EGG_COOLDOWN_MS - (pnow() - Number(p.lastEggCareAt || 0))); }
function isActionFull(p, action) { const k = ACTION_TARGET[action]; return !!k && clamp(p[k]) >= 100; }

/* ---------------- álbum ---------------- */
function albumLoad() { try { const a = JSON.parse(pget(ALBUM_KEY) || '{}'); return { pets: Array.isArray(a.pets) ? a.pets : [], seen: a.seen && typeof a.seen === 'object' ? a.seen : {} }; } catch (_) { return { pets: [], seen: {} }; } }
function albumSave(a) { pset(ALBUM_KEY, JSON.stringify(a)); }
function albumSeen(sp) { const a = albumLoad(); a.seen[sp] = (a.seen[sp] || 0) + 1; albumSave(a); }
function albumAdd(p, reason) {
  if (p.stage === 'egg' || p.albumed || !p.species) return;
  p.albumed = true;
  const a = albumLoad();
  a.pets.unshift({ species: p.species, name: p.name, stage: stageInfo(p).key, care: p.careCount || 0, days: Math.max(0, Math.floor(getPetAgeMs(p) / D)), reason, at: pnow() });
  a.pets = a.pets.slice(0, 30); albumSave(a);
}
function legacyBonus(p) { return (p.careCount || 0) >= 20 ? 2 : (p.careCount || 0) >= 8 ? 1 : 0; }
function freshEggFrom(p, bonus) {
  const n = defaultPet();
  n.ownedAcc = (p.ownedAcc || ['none']).slice(); n.ownedScenes = (p.ownedScenes || ['meadow']).slice(); n.scene = p.scene || 'meadow';
  n.eggCare = Math.min(EGG_CARE_GOAL - 1, bonus || 0); n.lastSeen = pnow();
  diaryAdd(n, bonus ? 'Um ovinho especial apareceu, com um pouquinho de carinho já guardado 💫' : 'Um novo ovinho apareceu! 🥚');
  return n;
}

/* ---------------- sons (Web Audio, sem arquivos) ---------------- */
let AC = null;
function sfxOn() { try { return localStorage.getItem(SFX_KEY) !== '0'; } catch (_) { return true; } }
function ac() {
  if (!sfxOn()) return null;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; } catch (_) { return null; }
}
function tone(f, d, type, v, delay, slide) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(60, f + slide), t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .14, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .03);
}
function noise(d, v, delay, freq) {
  const c = ac(); if (!c) return;
  const n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), da = b.getChannelData(0);
  for (let i = 0; i < n; i++) da[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + (delay || 0);
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq || 1800; g.gain.setValueAtTime(v || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
const SFX = {
  tap() { tone(520, .14, 'triangle', .14, 0, 380); }, eat() { [0, .13, .26].forEach((d, i) => tone(300 + i * 45, .09, 'square', .06, d)); },
  pop() { noise(.07, .1, 0, 2600); tone(760, .07, 'sine', .1, 0, -420); }, bath() { noise(.28, .06, 0, 2200); }, love() { tone(660, .22, 'triangle', .13); tone(880, .3, 'triangle', .12, .12); },
  right() { tone(880, .14, 'sine', .14); tone(1175, .22, 'sine', .14, .12); }, wrong() { tone(330, .22, 'triangle', .1, 0, -70); },
  study() { tone(784, .12, 'sine', .13); tone(988, .12, 'sine', .13, .12); tone(1319, .26, 'sine', .13, .24); }, sleep() { [523, 440, 349].forEach((f, i) => tone(f, .4, 'sine', .1, i * .32)); },
  wake() { [349, 440, 523].forEach((f, i) => tone(f, .16, 'triangle', .1, i * .12)); }, buy() { tone(988, .09, 'square', .07); tone(1319, .22, 'square', .07, .09); },
  low() { tone(440, .3, 'sine', .08, 0, -120); }, play() { [0, .1, .2, .3].forEach((d, i) => tone(520 + i * 90, .09, 'triangle', .09, d)); },
  hatch() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .24, 'triangle', .13, i * .11)); },
  evolve() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .26, 'triangle', .13, i * .12)); tone(1319, .5, 'sine', .12, .62); }
};
function sfx(n) { try { if (SFX[n]) SFX[n](); } catch (_) {} }
function syncSfxBtn() { const b = $('pzSfxBtn'); if (b) { b.textContent = sfxOn() ? '🔊' : '🔇'; b.setAttribute('aria-pressed', sfxOn() ? 'true' : 'false'); } }
window.petToggleSfx = function () { try { localStorage.setItem(SFX_KEY, sfxOn() ? '0' : '1'); } catch (_) {} syncSfxBtn(); if (sfxOn()) sfx('tap'); toast(sfxOn() ? 'Sons ligados 🔊' : 'Sons desligados 🔇'); };

/* ---------------- efeitos visuais e fala ---------------- */
let tempBubble = null, mode = 'home', celebQueue = [];
function say(text, ms) { tempBubble = { text, until: pnow() + (ms || 2600) }; const b = $('petBubble'); if (b) b.textContent = text; }
function spawnFx(list, count, at) {
  const fx = $('pzFx'), sc = $('pzScreen'); if (!fx || !sc) return;
  const cr = (!$('petCreature').classList.contains('hidden') ? $('petCreature') : $('pzEgg')).getBoundingClientRect(), sr = sc.getBoundingClientRect();
  const cx = (at ? at.x : cr.left + cr.width / 2) - sr.left, cy = (at ? at.y : cr.top + cr.height * .3) - sr.top;
  for (let i = 0; i < (count || 6); i++) {
    const el = document.createElement('i'); el.textContent = rnd(list);
    el.style.left = (cx + (Math.random() - .5) * 60) + 'px'; el.style.top = (cy + (Math.random() - .5) * 20) + 'px';
    el.style.fontSize = (14 + Math.random() * 12) + 'px'; el.style.setProperty('--dx', ((Math.random() - .5) * 90) + 'px'); el.style.setProperty('--dy', (-40 - Math.random() * 60) + 'px');
    el.style.animationDelay = (i * 60) + 'ms'; fx.appendChild(el); setTimeout(() => el.remove(), 1800);
  }
}
function animate(cls, ms) { const c = $('petCreature'); if (!c) return; c.classList.add('acting-' + cls); setTimeout(() => c.classList.remove('acting-' + cls), ms || 1500); }
function react() { const c = $('petCreature'); if (!c) return; c.classList.remove('react'); void c.offsetWidth; c.classList.add('react'); setTimeout(() => c.classList.remove('react'), 520); }

/* ---------------- dialogs e sheets ---------------- */
function openOverlay(html) { const o = $('pzOverlay'), s = $('pzSheet'); if (!o || !s) return null; s.innerHTML = html; o.classList.remove('hidden'); fit(); return s; }
function closeSheet() { const o = $('pzOverlay'); if (o) o.classList.add('hidden'); const s = $('pzSheet'); if (s) s.innerHTML = ''; showNextCelebration(); }
function sheetOpen() { const o = $('pzOverlay'); return !!o && !o.classList.contains('hidden'); }
function petDialog(opt) {
  const s = openOverlay(`<h3>${opt.title}<button class="x" aria-label="Fechar" data-x>✕</button></h3>${opt.body ? `<p>${opt.body}</p>` : ''}${opt.input ? `<input class="pzInput" id="pzDlgInput" maxlength="${opt.input.max || 14}" value="${esc(opt.input.value || '')}" autocomplete="off">` : ''}
    <div class="pzRow"><button class="pzBtnS" data-cancel>${opt.cancel || 'Agora não'}</button><button class="pzBtnP" data-ok ${opt.okDisabled ? 'disabled' : ''}>${opt.ok || 'OK'}</button></div>`);
  if (!s) return;
  s.querySelector('[data-x]').onclick = s.querySelector('[data-cancel]').onclick = () => closeSheet();
  s.querySelector('[data-ok]').onclick = () => { const v = opt.input ? ($('pzDlgInput').value || '') : null; closeSheet(); if (opt.onOk) opt.onOk(v); };
  if (opt.input) setTimeout(() => { const i = $('pzDlgInput'); if (i) { i.focus(); i.select(); } }, 60);
}
function spendStars(n) {
  if (typeof stars === 'undefined' || stars < n) return false;
  stars -= n; pset('eloStars', stars); if (typeof renderStars === 'function') renderStars(); sfx('buy'); return true;
}
function starsNow() { return typeof stars === 'undefined' ? 0 : stars; }

window.petOpenSheet = function (kind) {
  if (kind === 'album') return sheetAlbum('col');
  if (kind === 'style') return sheetStyle('acc');
  if (kind === 'notify') return sheetNotify();
  if (kind === 'more') return sheetMore();
};
function sheetAlbum(tab) {
  const p = rawLoad(), a = albumLoad();
  let body;
  if (tab === 'col') {
    const cards = Object.keys(SPECIES).map(k => { const n = a.seen[k] || 0, sp = SPECIES[k]; return `<div class="pzCard ${n ? '' : 'unk'}"><span class="big">${n ? sp.icon : '❓'}</span><span>${n ? sp.label : '???'}</span><small>${n ? `criado ${n}x` : 'ainda não nasceu'}</small></div>`; }).join('');
    const total = Object.keys(a.seen).length;
    const last = a.pets.slice(0, 2).map(x => { const sp = SPECIES[x.species] || { icon: '🐾' }; return `<div><span>${sp.icon}</span><span>${esc(x.name)} — ${x.days} dia(s), ${x.care} cuidados ${x.reason === 'away' ? '(foi passear)' : x.reason === 'stars' ? '(voou para as estrelas ✨)' : ''}</span></div>`; }).join('') || '<div><span>🌱</span><span>Seus bichinhos aparecem aqui quando se despedem.</span></div>';
    body = `<p>Você descobriu <b>${total} de ${Object.keys(SPECIES).length}</b> bichinhos! Cada ovo choca um diferente.</p><div class="pzGrid c3">${cards}</div><div class="pzList">${last}</div>`;
  } else {
    const items = (p.diary || []).slice(0, 5).map(d => `<div><small>${new Date(d.t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</small><span>${esc(d.tx)}</span></div>`).join('') || '<div><span>📝</span><span>O diário vai contando o que acontece com o seu bichinho.</span></div>';
    body = `<div class="pzList">${items}</div>`;
  }
  const s = openOverlay(`<h3>📖 Álbum do bichinho<button class="x" aria-label="Fechar" data-x>✕</button></h3><div class="pzTabsS"><button data-t="col" class="${tab === 'col' ? 'on' : ''}">🐾 Coleção</button><button data-t="diary" class="${tab === 'diary' ? 'on' : ''}">📝 Diário</button></div>${body}`);
  s.querySelector('[data-x]').onclick = closeSheet; s.querySelectorAll('[data-t]').forEach(b => { b.onclick = () => sheetAlbum(b.dataset.t); });
}
function sheetStyle(tab) {
  const p = loadPet(); const have = starsNow();
  let grid;
  if (tab === 'acc') {
    grid = `<div class="pzGrid c4">${ACCESSORIES.map(a => { const owned = a.id === 'none' || p.careCount >= a.need || p.ownedAcc.indexOf(a.id) >= 0, on = p.accessory === a.id;
      return `<button class="pzCard ${on ? 'on' : ''} ${owned ? '' : 'isLocked'}" data-a="${a.id}"><span class="big">${owned ? a.icon : '🔒'}</span><span>${a.name}</span><small>${owned ? (on ? 'usando' : 'usar') : `${a.need} cuidados ou ${a.cost}⭐`}</small></button>`; }).join('')}</div>`;
  } else {
    grid = `<div class="pzGrid c4">${SCENES.map(c => { const owned = p.ownedScenes.indexOf(c.id) >= 0, on = p.scene === c.id;
      return `<button class="pzCard ${on ? 'on' : ''} ${owned ? '' : 'isLocked'}" data-c="${c.id}"><span class="big">${owned ? c.icon : '🔒'}</span><span>${c.name}</span><small>${owned ? (on ? 'usando' : 'usar') : `${c.cost}⭐`}</small></button>`; }).join('')}</div>`;
  }
  const s = openOverlay(`<h3>🎀 Estilo <span style="font-size:11px;color:#8a73a6;font-weight:800">você tem ${have} ⭐</span><button class="x" aria-label="Fechar" data-x>✕</button></h3><div class="pzTabsS"><button data-t="acc" class="${tab === 'acc' ? 'on' : ''}">🎩 Acessórios</button><button data-t="sc" class="${tab === 'sc' ? 'on' : ''}">🏞️ Cenários</button></div>${grid}`);
  s.querySelector('[data-x]').onclick = closeSheet; s.querySelectorAll('[data-t]').forEach(b => { b.onclick = () => sheetStyle(b.dataset.t); });
  s.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => chooseAccessory(b.dataset.a); });
  s.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => chooseScene(b.dataset.c); });
}
function chooseAccessory(id) {
  const p = loadPet(), a = ACCESSORIES.find(x => x.id === id); if (!a) return;
  const owned = id === 'none' || p.careCount >= a.need || p.ownedAcc.indexOf(id) >= 0;
  if (owned) { p.accessory = id; savePet(p); sfx('tap'); renderPet(); return sheetStyle('acc'); }
  const falta = Math.max(0, a.cost - starsNow());
  petDialog({ title: `${a.icon} ${a.name}`, body: `Desbloqueie cuidando mais ${Math.max(0, a.need - p.careCount)} vez(es) ou compre por <b>${a.cost} ⭐</b>. Você tem ${starsNow()} ⭐.`,
    ok: falta ? `Faltam ${falta} ⭐` : `Comprar por ${a.cost} ⭐`, okDisabled: !!falta, cancel: 'Voltar', onOk: () => {
      if (!spendStars(a.cost)) return toast('Estrelas insuficientes ⭐');
      const q = loadPet(); q.ownedAcc.push(id); q.accessory = id; diaryAdd(q, `${q.name} ganhou ${a.icon} ${a.name}!`); savePet(q); renderPet(); toast(`${a.icon} ${a.name} é seu!`); spawnFx([a.icon, '✨'], 6); } });
}
function chooseScene(id) {
  const p = loadPet(), c = SCENES.find(x => x.id === id); if (!c) return;
  if (p.ownedScenes.indexOf(id) >= 0) { p.scene = id; savePet(p); sfx('tap'); renderPet(); return sheetStyle('sc'); }
  const falta = Math.max(0, c.cost - starsNow());
  petDialog({ title: `${c.icon} ${c.name}`, body: `Compre este cenário por <b>${c.cost} ⭐</b>. Você tem ${starsNow()} ⭐.`, ok: falta ? `Faltam ${falta} ⭐` : `Comprar por ${c.cost} ⭐`, okDisabled: !!falta, cancel: 'Voltar', onOk: () => {
    if (!spendStars(c.cost)) return toast('Estrelas insuficientes ⭐');
    const q = loadPet(); q.ownedScenes.push(id); q.scene = id; diaryAdd(q, `${q.name} ganhou um cenário novo: ${c.name}`); savePet(q); renderPet(); toast(`${c.icon} ${c.name} é seu!`); } });
}
function sheetMore() {
  const s = openOverlay(`<h3>⚙️ Mais<button class="x" aria-label="Fechar" data-x>✕</button></h3><div class="pzRow"><button class="pzBtnS" data-speak>🗣️ Contar como ele está</button><button class="pzBtnS" data-reset>🥚 Recomeçar do ovo (pede PIN)</button></div><p>Recomeçar apaga o bichinho atual, mas ele fica guardado no Álbum.</p>`);
  s.querySelector('[data-x]').onclick = closeSheet;
  s.querySelector('[data-speak]').onclick = () => { closeSheet(); petSpeakStatus(); };
  s.querySelector('[data-reset]').onclick = () => { closeSheet(); resetPetProgress(); };
}
async function sheetNotify() {
  const N = window.EloPetNotify;
  if (!N) return toast('Lembretes indisponíveis neste aparelho.');
  const st = await N.status(), cfg = N.getCfg();
  const on = cfg.enabled && st.permission === 'granted';
  let line, cls = 'pzStatus';
  if (!st.supported) { line = '⚠️ Este aparelho ou navegador não permite lembretes.'; cls += ' warn'; }
  else if (st.permission === 'denied') { line = '🚫 As notificações estão bloqueadas. Libere nas configurações do navegador/app.'; cls += ' warn'; }
  else if (on) { line = '✅ Lembretes ligados neste aparelho'; cls += ' ok'; }
  else line = '🔕 Lembretes desligados';
  let how = '';
  if (on) {
    if (st.push) how = 'Os avisos chegam por um servidor de lembretes, mesmo com o app fechado.';
    else if (st.periodic) how = 'O aparelho confere de tempos em tempos e avisa se o bichinho precisar de você.';
    else if (st.ios && !st.standalone) how = 'No iPhone/iPad: toque em Compartilhar → “Adicionar à Tela de Início”, depois ligue de novo.';
    else if (!st.standalone) how = 'Para avisar com o app fechado, instale o app na tela inicial (menu ⋮ → Instalar app).';
    else how = 'O aviso depende do sistema; o Android pode atrasar para poupar bateria.';
  }
  const q = cfg.quietFrom === 0 && cfg.quietTo === 0 ? 'none' : (cfg.quietFrom === 19 * 60 ? 'early' : 'normal');
  const s = openOverlay(`<h3>🔔 Lembretes do bichinho<button class="x" aria-label="Fechar" data-x>✕</button></h3>
    <div class="${cls}">${line}</div>${how ? `<p>${how}</p>` : ''}
    <p>Avisamos quando o bichinho precisar de cuidados (fome, banho, sono, saudade…). No máximo ${cfg.maxPerDay} avisos por dia.</p>
    <div class="pzTabsS"><button data-q="normal" class="${q === 'normal' ? 'on' : ''}">🌙 Silêncio 20:30–8h</button><button data-q="early" class="${q === 'early' ? 'on' : ''}">🌙 19h–7h</button><button data-q="none" class="${q === 'none' ? 'on' : ''}">Sem silêncio</button></div>
    <div class="pzRow">${on ? '<button class="pzBtnS" data-off>Desligar</button><button class="pzBtnP" data-test>Enviar teste</button>' : '<button class="pzBtnP" data-on>🔐 Ligar lembretes (pede PIN)</button>'}</div>`);
  s.querySelector('[data-x]').onclick = closeSheet;
  s.querySelectorAll('[data-q]').forEach(b => { b.onclick = () => { N.setCfg(N.presets[b.dataset.q]); N.sync(rawLoad()); sheetNotify(); }; });
  const bon = s.querySelector('[data-on]'), boff = s.querySelector('[data-off]'), bt = s.querySelector('[data-test]');
  if (bon) bon.onclick = () => {
    const go = async () => { const r = await N.enable(); if (r.ok) { N.sync(rawLoad()); toast('Lembretes ligados! 🔔'); sfx('right'); } else toast(r.reason === 'denied' ? 'Notificações bloqueadas neste aparelho.' : 'Lembretes indisponíveis aqui.'); sheetNotify(); };
    if (typeof requestParentAccess === 'function') requestParentAccess(() => { go(); }, 'Peça a um responsável: digite o PIN para ligar os lembretes.'); else go();
  };
  if (boff) boff.onclick = async () => { await N.disable(); toast('Lembretes desligados'); sheetNotify(); };
  if (bt) bt.onclick = async () => { try { await N.test(); toast('Teste enviado! 🔔'); } catch (_) { toast('Não foi possível enviar o teste.'); } };
}

/* ---------------- cuidados, recompensas e evolução ---------------- */
function rewardCareMilestones(p) {
  if (p.careCount >= 10 && !p.rewards.care10) { p.rewards.care10 = true; if (typeof addStars === 'function') addStars(1, 'Seu bichinho cresceu com seus cuidados! +1 ⭐'); }
  if (p.careCount >= 20 && !p.rewards.care20) { p.rewards.care20 = true; if (typeof addStars === 'function') addStars(2, 'Virou um grande companheiro! +2 ⭐'); }
}
function checkEvolution(p) {
  if (p.stage === 'egg') return;
  const info = stageInfo(p);
  if (!p.stageSeen) { p.stageSeen = info.key; return; }
  if (p.stageSeen === info.key) return;
  const order = ['baby', 'child', 'teen', 'adult', 'elder'], advanced = order.indexOf(info.key) > order.indexOf(p.stageSeen);
  p.stageSeen = info.key;
  if (!advanced) return;                       // só comemora quando a fase realmente avança
  let bonus = 0;
  if (!p.rewards.evolve[info.key]) { p.rewards.evolve[info.key] = true; bonus = { child: 1, teen: 2, adult: 3, elder: 4 }[info.key] || 0; }
  diaryAdd(p, `${p.name} cresceu e agora é ${info.label}! 🎉`);
  celebQueue.push({ kind: 'evolve', name: p.name, label: info.label, key: info.key, bonus, species: p.species });
}
function addCare(p) {
  const before = p.careCount || 0;
  p.careCount = before + 1;
  ACCESSORIES.forEach(a => { if (a.need > 0 && before < a.need && p.careCount >= a.need && p.ownedAcc.indexOf(a.id) < 0) { p.ownedAcc.push(a.id); diaryAdd(p, `Novo acessório liberado: ${a.icon} ${a.name}`); toast(`Novo acessório: ${a.icon} ${a.name}!`); } });
  rewardCareMilestones(p); checkEvolution(p);
}
function commit(p, o) {
  if (o.care !== false) addCare(p);
  savePet(p);
  if (o.sfx) sfx(o.sfx);
  if (o.anim) animate(o.anim, 1600);
  if (o.fx) spawnFx(o.fx, 7);
  if (o.msg) say(o.msg, 3000);
  renderPet();
  showNextCelebration();
}
function showNextCelebration() {
  if (sheetOpen() || !celebQueue.length) return;
  const c = celebQueue.shift();
  if (c.kind === 'evolve') {
    if (c.bonus && typeof addStars === 'function') addStars(c.bonus, `${c.name} cresceu! +${c.bonus} ⭐`);
    sfx('evolve');
    const s = openOverlay(`<div class="pzCeleb" style="display:flex;flex-direction:column;gap:6px"><div class="big">🎉</div><h3>${esc(c.name)} cresceu!</h3><p>Agora ele é <b>${c.label}</b>${c.bonus ? ` e você ganhou <b>+${c.bonus} ⭐</b>` : ''}!</p><button class="pzBtnP" data-ok>Oba! 🥳</button></div>`);
    s.querySelector('[data-ok]').onclick = closeSheet; spawnFx(['🎉', '✨', '⭐', '💖'], 12);
  } else if (c.kind === 'hatch') {
    sfx('hatch');
    const sp = SPECIES[c.species], fav = FOODS.find(f => f.id === sp.fav);
    const s = openOverlay(`<div class="pzCeleb" style="display:flex;flex-direction:column;gap:6px"><div class="big">${sp.icon}</div><h3>Nasceu um ${sp.label}!</h3><p>O nome dele é <b>${esc(c.name)}</b>. Ele adora ${fav ? fav.icon + ' ' + fav.name : 'carinho'}! 💗</p><div class="pzRow"><button class="pzBtnS" data-rn>✏️ Mudar o nome</button><button class="pzBtnP" data-ok>Que fofo! 💖</button></div></div>`);
    s.querySelector('[data-ok]').onclick = closeSheet; s.querySelector('[data-rn]').onclick = () => { closeSheet(); renamePet(); };
    spawnFx(['🐣', '✨', '💖', '⭐'], 12);
  }
}

/* ---------------- ações ---------------- */
function lowestSuggest(p) {
  let best = null;
  Object.keys(SUGGEST).forEach(k => { const v = p[k]; if (v < 45 && (!best || v < best.v)) best = { k, v }; });
  return best ? SUGGEST[best.k] : null;
}
window.petAction = function (action) {
  const p = loadPet();
  if (p.stage === 'egg') return window.careForEgg();
  if (p.ranAway) return;
  if (action === 'style') return petOpenSheet('style');
  const now = pnow(), sleeping = isSleeping(p, now);
  if (action === 'sleep') {
    if (sleeping) { p.lightsOff = false; p.sleepUntil = 0; p.sleepStartedAt = 0; savePet(p); sfx('wake'); say(`${p.name} acordou! Bom dia ☀️`, 3000); toast(`${p.name} acordou! A luz foi acesa ☀️`); renderPet(); return; }
    if (mode !== 'home') window.petSetMode('home');
    p.lightsOff = true; p.sleepStartedAt = now; p.sleepUntil = 0; p.energy = clamp(p.energy + 4); p.hunger = clamp(p.hunger - 1);
    const counts = p.energy < 80 && now - Number(p.lastSleepCareAt || 0) > 10 * 60000;
    if (counts) p.lastSleepCareAt = now;
    return commit(p, { msg: 'Boa noite! A luz foi apagada 🌙', sfx: 'sleep', care: counts });
  }
  if (sleeping) { say(`${p.name} está dormindo. Acenda a luz 🌙`, 2600); return toast(`${p.name} está dormindo. Acenda a luz para acordar 🌙`); }
  if (isActionFull(p, action)) { say(action === 'feed' ? 'Barriguinha cheia! 😋' : `${ACTION_LABEL[action]} já está em 100% ✨`, 2400); return toast(`${ACTION_LABEL[action]} já está em 100% ✨`); }
  if (action === 'feed') return window.petSetMode('feed');
  if (action === 'play') return startPlay();
  if (action === 'bath') return startBath();
  if (action === 'study') return startStudy();
  if (action === 'hygiene') { p.clean = clamp(p.clean + 16); p.love = clamp(p.love + 2); return commit(p, { msg: 'Dentinhos escovados! 🪥✨', anim: 'hygiene', fx: ['✨', '🪥', '🫧'], sfx: 'bath' }); }
  p.love = clamp(p.love + 24); p.fun = clamp(p.fun + 5);
  commit(p, { msg: 'Carinho recebido! 💗', anim: 'love', fx: ['💗', '💖', '💕'], sfx: 'love' });
};
window.petTap = function () {
  const p = rawLoad(); if (p.stage === 'egg' || p.ranAway) return;
  if (mode === 'play' || mode === 'bath') return;
  if (isSleeping(p)) { say('Shhh... está dormindo 🌙', 2000); return; }
  react(); sfx('tap'); spawnFx(['💗', '✨'], 4);
  say(rnd(['Hihi, cócegas! 🤭', 'Eu gosto de você! 💗', 'Vamos brincar? 🎾', 'Oba! 🥰', 'Mais um pouquinho! ✨']), 2200);
  const now = pnow();
  if (now - Number(p.lastTapAt || 0) > 6000) { const q = loadPet(); q.lastTapAt = now; q.love = clamp(q.love + 2); savePet(q); renderPet(); }
};
window.petTapEgg = function () { const e = $('pzEgg'); if (!e) return; sfx('tap'); say(rnd(['O ovinho mexeu um pouquinho! ✨', 'Tem alguém aí dentro... 💗', 'Toc toc! 🥚']), 2200); spawnFx(['✨', '💗'], 3); };

/* comida: arrastar até a boquinha ou tocar */
function buildFoods() {
  const box = $('pzFoods'); if (!box) return;
  const p = rawLoad(), fav = SPECIES[p.species] ? SPECIES[p.species].fav : null;
  box.innerHTML = FOODS.map(f => `<button type="button" class="pzFood ${f.id === fav ? 'pzFav' : ''}" data-f="${f.id}" aria-label="${f.name}"><span>${f.icon}</span><b>${f.name}</b></button>`).join('');
  const hint = $('pzFeedHint'); if (hint) hint.textContent = fav ? `Arraste até a boquinha — ou toque! Ele adora ${FOODS.find(f => f.id === fav).icon}` : 'Arraste até a boquinha — ou toque!';
  box.querySelectorAll('.pzFood').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      const food = FOODS.find(f => f.id === btn.dataset.f), sx = e.clientX, sy = e.clientY; let moved = false;
      const ghost = document.createElement('div'); ghost.className = 'pzDrag'; ghost.textContent = food.icon; ghost.style.display = 'none'; ghost.style.left = sx + 'px'; ghost.style.top = sy + 'px'; document.body.appendChild(ghost);
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      const move = ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { moved = true; ghost.style.display = 'block'; } ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; };
      const up = ev => {
        btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up);
        try { btn.releasePointerCapture(ev.pointerId); } catch (_) {}
        const r = $('petCreature').getBoundingClientRect();
        const over = ev.clientX > r.left - 14 && ev.clientX < r.right + 14 && ev.clientY > r.top - 14 && ev.clientY < r.bottom + 14;
        ghost.remove();
        if (ev.type === 'pointercancel') return;
        if (!moved || over) doFeed(food); else say('Leve até a boquinha dele! 😋', 2200);
      };
      btn.addEventListener('pointermove', move); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
    });
  });
}
function doFeed(food) {
  const p = loadPet(); if (isSleeping(p) || p.ranAway) return;
  if (p.hunger >= 100) { say('Barriguinha cheia! Já comi muito 😋', 2400); return; }
  const fav = SPECIES[p.species] && SPECIES[p.species].fav === food.id;
  p.hunger = clamp(p.hunger + food.h + (fav ? 4 : 0)); p.energy = clamp(p.energy + (food.e || 0)); p.fun = clamp(p.fun + (food.f || 0)); if (fav) p.love = clamp(p.love + 6);
  mode = 'home';
  commit(p, { msg: fav ? `${p.name} adorou ${food.name}! 💗` : `Que delícia! ${food.icon}`, anim: 'feed', fx: [food.icon, fav ? '💗' : '😋'], sfx: 'eat' });
}

/* brincar: estourar balões */
let play = null;
function startPlay() {
  const p = rawLoad(); if (!p.species) return;
  play = { popped: 0, total: 8, spawned: 0, timers: [], iv: null };
  window.petSetMode('play'); updatePlayUi(); sfx('play');
  for (let i = 0; i < play.total; i++) play.timers.push(setTimeout(spawnBalloon, 350 + i * 640));
  play.iv = setInterval(() => { if (play && play.spawned >= play.total && !$('pzScreen').querySelector('.pzBalloon:not(.pop)')) window.petEndPlay(false); }, 400);
}
function spawnBalloon() {
  const sc = $('pzScreen'); if (!sc || !play) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pzBalloon'; b.setAttribute('aria-label', 'Balão');
  b.style.background = rnd(['#ff6fae', '#7fd3ff', '#ffd36a', '#9be08a', '#c4a3ff']); b.style.left = (8 + Math.random() * Math.max(10, sc.clientWidth - 56)) + 'px';
  b.style.setProperty('--h', (sc.clientHeight + 70) + 'px'); b.style.setProperty('--dur', (3.8 + Math.random() * 1.6).toFixed(2) + 's');
  b.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); if (b.classList.contains('pop') || !play) return; b.classList.add('pop'); play.popped++; sfx('pop'); const r = b.getBoundingClientRect(); spawnFx(['✨', '⭐'], 3, { x: r.left + r.width / 2, y: r.top }); updatePlayUi(); });
  b.addEventListener('animationend', () => b.remove());
  sc.appendChild(b); play.spawned++;
}
function updatePlayUi() { if (!play) return; const bar = $('pzPlayBar'), sc = $('pzPlayScore'); if (bar) bar.style.width = Math.round(play.popped / play.total * 100) + '%'; if (sc) sc.textContent = `🎈 ${play.popped} de ${play.total} estourados`; }
window.petEndPlay = function () {
  if (!play) return;
  const g = play; play = null; g.timers.forEach(clearTimeout); clearInterval(g.iv);
  document.querySelectorAll('#pzScreen .pzBalloon').forEach(b => b.remove());
  mode = 'home'; setViews();
  if (!g.popped) { renderPet(); return; }
  const p = loadPet(); if (isSleeping(p)) { renderPet(); return; }
  p.fun = clamp(p.fun + 6 + g.popped * 3); p.love = clamp(p.love + 4); p.energy = clamp(p.energy - 6); p.hunger = clamp(p.hunger - 3);
  commit(p, { msg: `Que festa! ${g.popped} balões estourados 🎈`, anim: 'play', fx: ['🎈', '🎉', '✨'], sfx: g.popped >= 6 ? 'hatch' : 'right' });
};

/* banho: esfregar */
let bath = null;
function startBath() {
  const sc = $('pzScreen'); if (!sc) return;
  window.petSetMode('bath');
  bath = { prog: 0, down: false, lx: 0, ly: 0, acc: 0 }; sc.classList.add('scrub'); updateBathUi();
  bath.on = {
    down: e => { bath.down = true; bath.lx = e.clientX; bath.ly = e.clientY; scrub(e, 18); },
    move: e => { if (!bath || !bath.down) return; const d = Math.hypot(e.clientX - bath.lx, e.clientY - bath.ly); bath.lx = e.clientX; bath.ly = e.clientY; scrub(e, d); },
    up: () => { if (bath) bath.down = false; }
  };
  sc.addEventListener('pointerdown', bath.on.down); sc.addEventListener('pointermove', bath.on.move); window.addEventListener('pointerup', bath.on.up); window.addEventListener('pointercancel', bath.on.up);
}
function scrub(e, dist) {
  if (!bath) return;
  const r = $('petCreature').getBoundingClientRect();
  if (!(e.clientX > r.left - 6 && e.clientX < r.right + 6 && e.clientY > r.top - 6 && e.clientY < r.bottom + 6)) return;
  bath.prog = Math.min(1, bath.prog + dist / 1100); bath.acc += dist;
  if (bath.acc > 26) { bath.acc = 0; spawnFx(['🫧', '🫧', '✨'], 2, { x: e.clientX, y: e.clientY }); sfx('bath'); }
  updateBathUi();
  if (bath.prog >= 1) finishBath();
}
function updateBathUi() { const b = $('pzBathBar'); if (b && bath) b.style.width = Math.round(bath.prog * 100) + '%'; }
function endBathListeners() {
  const sc = $('pzScreen');
  if (bath && bath.on && sc) { sc.removeEventListener('pointerdown', bath.on.down); sc.removeEventListener('pointermove', bath.on.move); window.removeEventListener('pointerup', bath.on.up); window.removeEventListener('pointercancel', bath.on.up); }
  if (sc) sc.classList.remove('scrub'); bath = null;
}
function finishBath() {
  endBathListeners(); mode = 'home'; setViews();
  const p = loadPet(); if (isSleeping(p)) return renderPet();
  p.clean = clamp(p.clean + 34); p.love = clamp(p.love + 4);
  commit(p, { msg: 'Banho tomado! Tudo limpinho ✨', anim: 'bath', fx: ['🫧', '✨', '💦'], sfx: 'right' });
}

/* estudar: 3 perguntinhas */
const WORDS = [['🍎', 'MAÇÃ', 'M'], ['🐘', 'ELEFANTE', 'E'], ['🐟', 'PEIXE', 'P'], ['🌞', 'SOL', 'S'], ['🌙', 'LUA', 'L'], ['🐱', 'GATO', 'G'], ['🎈', 'BALÃO', 'B'],
  ['🍌', 'BANANA', 'B'], ['🦄', 'UNICÓRNIO', 'U'], ['🚗', 'CARRO', 'C'], ['🏠', 'CASA', 'C'], ['⭐', 'ESTRELA', 'E'], ['🍇', 'UVA', 'U'], ['🐶', 'CACHORRO', 'C']];
const COLORS = [['🍌', 'amarelo', '#ffd54a'], ['🍓', 'vermelho', '#ff5b6e'], ['🌳', 'verde', '#52c26a'], ['🌊', 'azul', '#4aa8ff'], ['🍊', 'laranja', '#ff9f3d'], ['🍇', 'roxo', '#a070e6']];
let quiz = null;
function makeQuestion() {
  const t = Math.floor(Math.random() * 3);
  if (t === 0) {
    const w = rnd(WORDS), pool = 'ABCDEFGILMNOPRSTUV'.split('').filter(x => x !== w[2]), opts = shuffle([w[2]].concat(shuffle(pool).slice(0, 2)));
    return { e: w[0], q: `${w[1]} começa com qual letra?`, opts: opts.map(x => ({ k: x, html: x, aria: 'letra ' + x })), ans: w[2] };
  }
  if (t === 1) {
    const n = 1 + Math.floor(Math.random() * 5), em = rnd(['🍓', '⭐', '🐟', '🎈', '🍎', '🦋']);
    const wrong = shuffle([1, 2, 3, 4, 5, 6].filter(x => x !== n)).slice(0, 2);
    return { e: em.repeat(n), q: 'Quantos você vê?', opts: shuffle([n].concat(wrong)).map(x => ({ k: String(x), html: String(x), aria: 'número ' + x })), ans: String(n) };
  }
  const c = rnd(COLORS), others = shuffle(COLORS.filter(x => x !== c)).slice(0, 2);
  return { e: c[0], q: 'Qual é a cor?', opts: shuffle([c].concat(others)).map(x => ({ k: x[1], html: `<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${x[2]};vertical-align:middle"></span>`, aria: x[1] })), ans: c[1] };
}
function startStudy() { quiz = { n: 0, total: 3, score: 0, locked: false }; window.petSetMode('study'); nextQuestion(); }
function nextQuestion() {
  if (!quiz) return;
  if (quiz.n >= quiz.total) return finishStudy();
  quiz.cur = makeQuestion(); quiz.n++; quiz.locked = false;
  $('pzStudyHint').textContent = `Pergunta ${quiz.n} de ${quiz.total}`; $('pzQE').textContent = quiz.cur.e; $('pzQT').textContent = quiz.cur.q;
  const box = $('pzQOpts'); box.innerHTML = quiz.cur.opts.map(o => `<button type="button" class="pzOpt" data-k="${esc(o.k)}" aria-label="${esc(o.aria)}">${o.html}</button>`).join('');
  box.querySelectorAll('.pzOpt').forEach(b => { b.onclick = () => answer(b); });
  fit();
}
function answer(btn) {
  if (!quiz || quiz.locked) return; quiz.locked = true;
  const ok = btn.dataset.k === quiz.cur.ans;
  btn.classList.add(ok ? 'ok' : 'no');
  if (ok) { quiz.score++; sfx('right'); spawnFx(['⭐', '✨'], 4); say('Muito bem! 🌟', 1600); }
  else { sfx('wrong'); say('Quase! Vamos tentar outra 💪', 1800); document.querySelectorAll('#pzQOpts .pzOpt').forEach(b => { if (b.dataset.k === quiz.cur.ans) b.classList.add('ok'); }); }
  setTimeout(nextQuestion, 900);
}
function finishStudy() {
  const g = quiz; quiz = null; mode = 'home'; setViews();
  const p = loadPet(); if (isSleeping(p)) return renderPet();
  p.study = clamp(p.study + 8 * g.score + 3 * (g.total - g.score)); p.energy = clamp(p.energy - 5); p.fun = clamp(p.fun - 2);
  commit(p, { msg: `Acertou ${g.score} de ${g.total}! Nota ${petGrade(p)} 📚`, anim: 'study', fx: ['📚', '⭐', '✨'], sfx: 'study' });
}

/* ---------------- ovo, nascimento, despedida ---------------- */
window.careForEgg = function () {
  const p = rawLoad(); if (p.stage !== 'egg') return renderPet();
  const wait = eggWait(p);
  if (wait > 0) { toast(`Espere ${formatDuration(wait)} para cuidar do ovo novamente 💗`); say('O ovinho está descansando um pouquinho... 💤', 2400); return; }
  p.lastEggCareAt = pnow(); p.eggCare = Math.min(EGG_CARE_GOAL, Number(p.eggCare || 0) + 1);
  sfx('love'); spawnFx(['💗', '✨'], 5); react();
  if (p.eggCare >= EGG_CARE_GOAL) {
    const a = albumLoad(), unseen = Object.keys(SPECIES).filter(k => !a.seen[k]);
    p.stage = 'baby'; p.species = rnd(unseen.length ? unseen : Object.keys(SPECIES)); p.name = SPECIES[p.species].defaultName;
    p.hunger = p.energy = p.clean = p.fun = p.love = 92; p.study = 80; p.lightsOff = false; p.sleepUntil = 0; p.bornAt = pnow(); p.stageSeen = 'baby'; p.albumed = false;
    if (!p.rewards.hatch) { p.rewards.hatch = true; if (typeof addStars === 'function') addStars(2, 'Seu bichinho nasceu! +2 ⭐'); }
    diaryAdd(p, `${p.name} nasceu! Era um ${SPECIES[p.species].label} ${SPECIES[p.species].icon}`);
    albumSeen(p.species); savePet(p); renderPet();
    celebQueue.push({ kind: 'hatch', species: p.species, name: p.name }); showNextCelebration();
    if (typeof speakText === 'function') setTimeout(() => speakText(`Que surpresa! Nasceu um ${SPECIES[p.species].label}! O nome dele é ${p.name}.`), 900);
    return;
  }
  savePet(p); renderPet(); say(`Quentinho! Faltam ${EGG_CARE_GOAL - p.eggCare} cuidados 💗`, 2600); toast(`Carinho no ovinho! ${p.eggCare}/${EGG_CARE_GOAL} 🥚`);
};
window.resetPetAfterRunaway = function () {
  const old = rawLoad(), bonus = legacyBonus(old);
  albumAdd(old, 'away');
  const n = freshEggFrom(old, bonus); savePet(n); sfx('hatch'); renderPet();
  toast(bonus ? 'Um ovinho especial apareceu, já com carinho guardado! 🐣💗' : 'Um novo ovinho brilhante apareceu! Cuide com muito amor 🐣💗');
};
window.startPetAscension = function () {
  const p = loadPet(); if (p.stage === 'egg') return;
  petDialog({ title: '✨ Jornada das Estrelas', body: `Parabéns! ${esc(p.name)} viveu plenamente com você. Quer que ele faça a grande Jornada das Estrelas e ganhe asas celestes? Você ganha <b>+25 ⭐</b>, ele fica guardado no Álbum e um ovinho especial aparece!`, ok: 'Sim, vamos! ✨', cancel: 'Ainda não',
    onOk: () => { const q = loadPet(); if (typeof addStars === 'function') addStars(25, `${q.name} voou para a Constelação das Estrelas! +25 ⭐`); albumAdd(q, 'stars'); const n = freshEggFrom(q, 2); savePet(n); sfx('evolve'); renderPet(); toast(`✨ ${q.name} agora brilha no céu e deixou um novo ovinho para você! ✨`); } });
};
window.resetPetProgress = function () {
  const doIt = () => petDialog({ title: '🥚 Recomeçar do ovo?', body: 'O bichinho atual vai embora (ele fica guardado no Álbum) e um novo ovinho aparece.', ok: 'Recomeçar', cancel: 'Cancelar',
    onOk: () => { const p = loadPet(); albumAdd(p, 'reset'); const n = freshEggFrom(p, 0); savePet(n); renderPet(); toast('Um novo ovinho apareceu! 🥚'); } });
  if (typeof requestParentAccess === 'function') requestParentAccess(doIt, 'Peça a um responsável: digite o PIN para recomeçar o bichinho.'); else doIt();
};
window.renamePet = function () {
  const p = loadPet();
  petDialog({ title: p.stage === 'egg' ? 'Nome do ovinho' : `Nome do ${SPECIES[p.species] ? SPECIES[p.species].label : 'bichinho'}`, body: 'Escolha um nome bem carinhoso (até 14 letras):', input: { value: p.name, max: 14 }, ok: 'Salvar', cancel: 'Cancelar',
    onOk: v => { const name = String(v || '').replace(/\s+/g, ' ').trim().slice(0, 14); if (!name) return; const q = loadPet(); q.name = name; diaryAdd(q, `Agora o nome dele é ${name}`); savePet(q); renderPet(); toast(`Agora ele se chama ${name}! 💖`); } });
};
window.petSpeakStatus = function () { const p = loadPet(); if (typeof speakText === 'function') speakText(`${moodText(p).replace(/[🌙🥣🫧📚💗✨🎾]/gu, '')} A nota dele é ${petGrade(p)}.`); };
window.petStatTap = function (k) { const p = loadPet(), d = STAT_DEFS.find(x => x[0] === k); if (!d) return; const v = clamp(p[k]); sfx('tap'); say(`${d[1]} ${d[2]}: ${v}%${v < 35 ? ' — preciso de atenção 💗' : ''}`, 2400); };

/* ---------------- modos (painel da direita) ---------------- */
window.petSetMode = function (m) {
  if (m === mode) return;
  if (mode === 'play' && play) window.petEndPlay(true);
  if (mode === 'bath') endBathListeners();
  if (mode === 'study') quiz = null;
  mode = m;
  if (m === 'feed') buildFoods();
  setViews(); renderPet();
};
function effectiveView(p) { return p.stage === 'egg' ? 'egg' : mode; }
function setViews(p) {
  p = p || rawLoad();
  const v = effectiveView(p);
  document.querySelectorAll('#pzMode .pzView').forEach(el => el.classList.toggle('hidden', el.dataset.view !== v));
  fit();
}

/* ---------------- renderização ---------------- */
function setText(el, t) { if (el && el.textContent !== t) el.textContent = t; }
function setHTMLIfChanged(el, html) { if (!el) return; if (el.__petHtml === html) return; el.__petHtml = html; el.innerHTML = html; }
function buildLetter(p, host) {
  const sp = SPECIES[p.species] || { icon: '🐾', label: 'bichinho' };
  let kid = 'Elo'; try { const pr = typeof getActiveProfile === 'function' ? getActiveProfile() : null; if (pr && pr.name) kid = pr.name; } catch (_) {}
  const bonus = legacyBonus(p);
  setHTMLIfChanged(host, `<div class="cardL" role="group" aria-label="Carta do bichinho"><div class="art"><div class="l">💌</div><div class="g">🥚</div></div><div class="body"><h3>Uma cartinha com carinho...</h3>
    <p>"Querida ${esc(kid)}, fiquei com saudade e com fominha e fui passear pelos campos floridos do Reino das Estrelas em busca de um abraço quentinho... 🌸 Mas eu nunca vou esquecer de você: estou guardado no seu Álbum 📖 e deixei um ${bonus ? 'ovinho especial, já com carinho guardado,' : 'novo ovinho'} para você recomeçar com todo o seu amor!"<i>Com carinho, ${esc(p.name || sp.label)} ${sp.icon}</i></p>
    <button type="button" class="go" onclick="resetPetAfterRunaway()">🥚 Receber o novo ovinho 💗</button></div></div>`);
}
function renderPet() {
  const panel = $('petPanel'); if (!panel) return;
  const active = panel.classList.contains('active');
  const p = loadPet();
  if (!active) return;
  const scr = $('pzScreen'), creature = $('petCreature'), egg = $('pzEgg'), stats = $('petStats'), bubble = $('petBubble');
  syncSfxBtn();
  const nb = $('pzNotifyBtn'); if (nb && window.EloPetNotify) nb.classList.toggle('on', EloPetNotify.getCfg().enabled);
  panel.classList.toggle('petRunaway', !!p.ranAway);
  $('pzLetter').classList.toggle('hidden', !p.ranAway);
  if (p.ranAway) { buildLetter(p, $('pzLetter')); fit(); return; }
  const sleeping = isSleeping(p), isEgg = p.stage === 'egg', info = stageInfo(p);
  scr.dataset.scene = p.scene || 'meadow';
  scr.classList.toggle('night', sleeping && !isEgg); scr.classList.toggle('hasStats', !isEgg);
  egg.classList.toggle('hidden', !isEgg); creature.classList.toggle('hidden', isEgg); stats.classList.toggle('hidden', isEgg);
  setText($('petStageLabel'), isEgg ? 'Ovinho' : info.label); setText($('petNameLabel'), p.name);
  setViews(p);
  const lowKey = lowestSuggest(p);
  if (isEgg) {
    setText($('eggCareText'), `${p.eggCare || 0}/${EGG_CARE_GOAL} cuidados`); $('eggCareBar').style.width = Math.min(100, (p.eggCare || 0) / EGG_CARE_GOAL * 100) + '%';
    const wait = eggWait(p), btn = $('eggCareButton'); btn.disabled = wait > 0;
    setText($('eggCooldownText'), wait > 0 ? `Descansando... ${formatDuration(wait)}` : 'Aquecer e fazer carinho');
    setText($('petGrowthText'), 'Chocando o ovinho'); setText($('petGrowthSub'), `Faltam ${EGG_CARE_GOAL - (p.eggCare || 0)} cuidados`); $('petGrowthBar').style.width = Math.min(100, (p.eggCare || 0) / EGG_CARE_GOAL * 100) + '%';
    $('petAscensionBtn').classList.add('hidden');
    setText(bubble, tempBubble && tempBubble.until > pnow() ? tempBubble.text : 'Cuide do ovo para descobrir quem vai nascer! 💗');
    fit(); return;
  }
  setHTMLIfChanged(stats, STAT_DEFS.map(([k, ic, n]) => { const v = clamp(p[k]); return `<button type="button" class="pzStat${v < 35 ? ' low' : ''}" aria-label="${n}: ${v}%" onclick="petStatTap('${k}')"><span class="i">${ic}</span><b class="n">${n}</b><em class="v">${v}%</em><span class="m"><i style="width:${v}%"></i></span></button>`; }).join(''));
  const cls = ['petCreature', 'species-' + p.species, 'stage-' + info.key];
  if (sleeping) cls.push('sleeping'); else { if (p.hunger < 35) cls.push('hungry'); if (p.clean < 35) cls.push('dirty'); if (p.energy < 35) cls.push('tired'); if (p.fun < 35 || p.love < 35) cls.push('sad'); if (p.study < 40) cls.push('studyLow'); }
  const keep = [...creature.classList].filter(c => c.indexOf('acting-') === 0 || c === 'react');
  const next = cls.concat(keep).join(' '); if (creature.className !== next) creature.className = next;
  const acc = $('petAccessory'); setText(acc, visualAccessory(p.accessory)); acc.dataset.kind = p.accessory || 'none';
  setText(bubble, tempBubble && tempBubble.until > pnow() ? tempBubble.text : moodText(p));
  if (info.nextLabel) { setText($('petGrowthText'), `${info.label} → ${info.nextLabel}`); setText($('petGrowthSub'), `Faltam ${info.remainingCare} cuidados e ${formatDuration(info.remainingAgeMs)}`); }
  else { setText($('petGrowthText'), `${info.label} ✨`); setText($('petGrowthSub'), 'Pronto para a Jornada das Estrelas!'); }
  $('petGrowthBar').style.width = info.pct + '%';
  $('petAscensionBtn').classList.toggle('hidden', !(info.key === 'elder' && Number(p.careCount || 0) >= 80 && getPetAgeMs(p) >= 10 * D));
  document.querySelectorAll('#pzMode [data-pet-action]').forEach(b => {
    const a = b.dataset.petAction;
    b.classList.toggle('suggest', !sleeping && a === lowKey);
    if (a === 'sleep') { b.classList.toggle('lights', sleeping); setText(b.querySelector('span'), sleeping ? '☀️' : '🌙'); setText(b.querySelector('b'), sleeping ? 'Acender luz' : 'Apagar luz'); b.disabled = false; }
    else if (a !== 'style') b.disabled = sleeping;
  });
  const tip = $('pzTip');
  if (tip && mode === 'home') {
    if (lowKey && !sleeping) { const m = { feed: 'comida 🥣', bath: 'banho 🚿', sleep: 'dormir 🌙', play: 'brincar 🎈', love: 'carinho 💗', study: 'estudar 📚' }; setText(tip, `💡 ${p.name} está precisando de ${m[lowKey]}`); }
    else setText(tip, '💡 ' + TIPS[Math.floor(pnow() / 12000) % TIPS.length]);
  }
  checkEvolution(p); if (celebQueue.length) { savePet(p, false); showNextCelebration(); }
  fit();
}

/* ---------------- ajuste automático de tamanho (sem rolagem) ---------------- */
function fit() {
  const panel = $('petPanel'); if (!panel || !panel.classList.contains('active')) return;
  const nav = document.querySelector('body > nav') || document.querySelector('nav');
  const navTop = nav ? nav.getBoundingClientRect().top : window.innerHeight;
  const Hh = Math.max(200, Math.floor(navTop - 4));
  if (panel.style.getPropertyValue('--pzH') !== Hh + 'px') panel.style.setProperty('--pzH', Hh + 'px');
  const sc = $('pzScreen'); if (!sc) return;
  const h = sc.clientHeight, w = sc.clientWidth, chip = parseFloat(getComputedStyle(sc).getPropertyValue('--pzChip')) || 46;
  const s = Math.max(.42, Math.min(1.25, Math.min(h * .66 / 185, (w - 2 * chip - 10) / 150)));
  const v = s.toFixed(3); if (sc.style.getPropertyValue('--pzS') !== v) sc.style.setProperty('--pzS', v);
  const side = panel.querySelector('.pzSide');
  if (side) { side.style.zoom = ''; const need = side.scrollHeight, have = side.clientHeight; if (need > have + 1) side.style.zoom = Math.max(.55, have / need).toFixed(3); }
}
window.addEventListener('resize', fit); window.addEventListener('orientationchange', () => setTimeout(fit, 250));

/* ---------------- integração com o resto do app ---------------- */
const oldOpenPanel = window.openPanel;
window.openPanel = function (id, nav, fromHistory = false) {
  oldOpenPanel(id, nav, fromHistory);
  document.body.classList.toggle('pz-lock', id === 'petPanel');
  if (id === 'petPanel') { mode = 'home'; setViews(); renderPet(); setTimeout(() => { fit(); renderPet(); }, 80); }
  else { if (play) window.petEndPlay(true); if (bath) endBathListeners(); }
};
window.openPet = function () { window.openPanel('petPanel', 'home'); renderPet(); };
window.requestPetNotifications = function () { petOpenSheet('notify'); };
window.petRoutineBonus = function (kind) {
  try {
    const p = rawLoad(); if (p.stage === 'egg' || p.ranAway || isSleeping(p)) return;
    const key = 'eloPetRoutine:' + kind + ':' + Core.dayKey(pnow()); if (pget(key)) return; pset(key, '1');
    const q = loadPet(); q.love = clamp(q.love + 10); q.fun = clamp(q.fun + 4); diaryAdd(q, `${q.name} ficou orgulhoso de ver você cuidar de si! 💗`); savePet(q);
    toast(`${q.name} adorou ver você se cuidando! +carinho 💗`);
    if ($('petPanel') && $('petPanel').classList.contains('active')) { spawnFx(['💗', '✨'], 6); renderPet(); }
  } catch (_) {}
};
window.addEventListener('DOMContentLoaded', () => {
  ['finishBrushingTeeth', 'finishLunchbox', 'finishBandages'].forEach(n => {
    const f = window[n]; if (typeof f !== 'function' || f.__petWrapped) return;
    const w = function () { const r = f.apply(this, arguments); try { window.petRoutineBonus(n); } catch (_) {} return r; }; w.__petWrapped = true; window[n] = w;
  });
  syncSfxBtn();
  if ($('petPanel') && $('petPanel').classList.contains('active')) { document.body.classList.add('pz-lock'); renderPet(); }
  try { if (new URLSearchParams(location.search).get('open') === 'pet') { setTimeout(() => { window.openPet(); try { history.replaceState(null, '', location.pathname); } catch (_) {} }, 1300); } } catch (_) {}
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'open-pet') window.openPet(); });
  const ov = $('pzOverlay'); if (ov) ov.addEventListener('pointerdown', e => { if (e.target === ov) closeSheet(); });
  if (window.ResizeObserver && $('petPanel')) new ResizeObserver(() => fit()).observe($('petPanel'));
  setInterval(() => {
    const act = $('petPanel') && $('petPanel').classList.contains('active');
    if (act) { if (!play && !bath) renderPet(); } else if (pnow() % 30000 < 1100) { const p = rawLoad(); if (p.stage !== 'egg') loadPet(); }
  }, 1000);
  if (window.EloPetNotify) window.EloPetNotify.sync(rawLoad());
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && $('petPanel') && $('petPanel').classList.contains('active')) renderPet(); });

window.petAccessoryIcon = visualAccessory;
window.petStageKey = function (p) { try { return stageInfo(p).key; } catch (_) { return p.stage; } };
window.loadPet = loadPet; window.rawLoad = rawLoad; window.savePet = savePet; window.defaultPet = defaultPet; window.renderPet = renderPet;
})();
