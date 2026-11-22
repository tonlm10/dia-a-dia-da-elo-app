/* Complementos do Dia a Dia da Elo 4.3.24: bem-estar, acessibilidade e uso offline. */
(function () {
  'use strict';
  const VIDEO_PLAYLIST = 'UUBPBaYweoBPjr8XlfOz1dwQ';
  const ACTIVE_KEY = 'eloActiveMinutes';
  let lastInteractionAt = 0;
  const LABELS = { games: 'Jogos', game: 'Jogos', rpg: 'Reino das Estrelas', stories: 'Histórias', english: 'Inglês', school: 'Escolinha', coloring: 'Ateliê', art: 'Ateliê', pet: 'Bichinho', family: 'Festa da Família' };
  const today = () => {
    try { if (typeof window.getBrasiliaDateStr === 'function') return window.getBrasiliaDateStr(); } catch (_) {}
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const profileKey = () => {
    try { const p = typeof window.getActiveProfile === 'function' ? window.getActiveProfile() : null; return String(p && p.id || 'default').replace(/[^\w-]/g, '_'); } catch (_) { return 'default'; }
  };
  const logKey = (date, name) => `eloWeekly.${profileKey()}.${date}.${name}`;
  const showToast = text => { try { if (typeof window.toast === 'function') window.toast(text); } catch (_) {} };
  const loadStyle = () => {
    if (document.querySelector('link[data-elo-completion-style]')) return;
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = './completion.css?v=4.3.26'; link.dataset.eloCompletionStyle = '1';
    document.head.appendChild(link);
  };

  function rewardMission() {
    const key = `eloDiscoveryMission.${profileKey()}.${today()}`;
    if (localStorage.getItem(key) === '1') return;
    localStorage.setItem(key, '1');
    if (typeof window.addStars === 'function') window.addStars(3, 'Missão de descoberta concluída! +3 ⭐');
    showToast('Boa brincadeira! Você ganhou +3 estrelas pela atividade.');
  }

  function installSessionTracking() {
    const keyFor = date => `${ACTIVE_KEY}.${profileKey()}.${date}`;
    const read = date => { try { return Math.max(0, Number(localStorage.getItem(keyFor(date))) || 0); } catch (_) { return 0; } };
    const write = (date, value) => { try { localStorage.setItem(keyFor(date), String(value)); } catch (_) {} };
    window.getTodayUsage = () => read(today());
    window.getLast7Usage = function () {
      let total = 0;
      for (let ago = 0; ago < 7; ago++) { const d = new Date(); d.setDate(d.getDate() - ago); const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; total += read(date); }
      return total;
    };
    const mark = () => { lastInteractionAt = Date.now(); };
    ['pointerdown','keydown','touchstart'].forEach(type => document.addEventListener(type, mark, {passive:true}));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') mark(); });
    setInterval(() => {
      if (document.visibilityState !== 'visible' || !lastInteractionAt || Date.now() - lastInteractionAt > 5 * 60000) return;
      const date = today(); write(date, read(date) + 1);
      const usage = document.getElementById('usageToday'); if (usage) usage.textContent = `${read(date)} min`;
      renderWeeklyReport();
    }, 60000);
    const usage = document.getElementById('usageToday'); if (usage) usage.textContent = `${read(today())} min`;
  }

  function installActivityTracking() {
    if (typeof window.trackActivity !== 'function' || window.trackActivity.__eloWrapped) return;
    const original = window.trackActivity;
    const wrapped = function (name) {
      const result = original.apply(this, arguments);
      const activity = String(name || 'activity').slice(0, 30);
      const key = logKey(today(), activity);
      try { localStorage.setItem(key, String((Number(localStorage.getItem(key)) || 0) + 1)); } catch (_) {}
      rewardMission();
      return result;
    };
    wrapped.__eloWrapped = true;
    window.trackActivity = wrapped;
  }

  function addParentReport() {
    const panel = document.getElementById('parentsPanel');
    if (!panel || document.getElementById('eloWeeklyReport')) return;
    const progressCard = document.getElementById('parentProgressDashboard')?.closest('.card');
    const report = document.createElement('div');
    report.id = 'eloWeeklyReport'; report.className = 'card eloWeeklyReport'; report.dataset.parentTab = 'summary';
    report.innerHTML = '<h3>Resumo da semana 📈</h3><p class="muted">Resumo privado, calculado neste aparelho. O registro começa nesta versão.</p><div id="eloWeeklySummary" aria-live="polite"></div><button id="eloWeeklyRefresh" class="btn secondary" type="button">Atualizar resumo</button>';
    if (progressCard?.parentNode) progressCard.after(report); else panel.appendChild(report);
    document.getElementById('eloWeeklyRefresh')?.addEventListener('click', renderWeeklyReport);
    renderWeeklyReport();
  }

  function renderWeeklyReport() {
    const box = document.getElementById('eloWeeklySummary'); if (!box) return;
    const counts = {};
    for (let ago = 0; ago < 7; ago++) {
      const d = new Date(); d.setDate(d.getDate() - ago);
      const keyDate = ago === 0 ? today() : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) || '';
          const prefix = `eloWeekly.${profileKey()}.${keyDate}.`;
          if (!key.startsWith(prefix)) continue;
          const activity = key.slice(prefix.length);
          counts[activity] = (counts[activity] || 0) + (Number(localStorage.getItem(key)) || 0);
        }
      } catch (_) {}
    }
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const usage = typeof window.getLast7Usage === 'function' ? Number(window.getLast7Usage()) || 0 : 0;
    const items = top.map(([name, count]) => `<li><span>${LABELS[name] || name}</span><b>${count}</b></li>`).join('');
    box.innerHTML = `<div class="eloReportStats"><div><b>${total}</b><small>atividades concluídas</small></div><div><b>${usage} min</b><small>uso registrado no app</small></div></div>${items ? `<ul class="eloReportList">${items}</ul>` : '<p class="muted">Ainda não há atividades registradas nesta versão. O resumo será preenchido conforme a criança brinca.</p>'}`;
  }

  function addOfflineControls() {
    const panel = document.getElementById('parentsPanel');
    if (!panel || document.getElementById('eloOfflineCard')) return;
    const card = document.createElement('div'); card.id = 'eloOfflineCard'; card.className = 'card'; card.dataset.parentTab = 'security';
    card.innerHTML = '<h3>Preparar para jogar offline 📥</h3><p class="muted">Baixe os recursos do app neste aparelho. Os vídeos do YouTube continuam dependendo de internet.</p><button id="eloOfflineDownload" class="btn" type="button">Baixar tudo para jogar offline</button><p id="eloOfflineStatus" class="eloOfflineStatus" role="status" aria-live="polite"></p>';
    panel.appendChild(card);
    document.getElementById('eloOfflineDownload')?.addEventListener('click', startOfflineDownload);
  }

  async function startOfflineDownload() {
    const status = document.getElementById('eloOfflineStatus');
    const btn = document.getElementById('eloOfflineDownload');
    if (!('serviceWorker' in navigator)) { if (status) status.textContent = 'Este navegador não oferece instalação offline do app.'; return; }
    if (btn) btn.disabled = true;
    if (status) status.textContent = 'Preparando os arquivos do app…';
    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = navigator.serviceWorker.controller || registration.active || registration.waiting;
      if (!worker) throw new Error('service worker indisponível');
      worker.postMessage({ type: 'ELO_PREPARE_OFFLINE' });
    } catch (_) {
      if (status) status.textContent = 'Não foi possível iniciar o download. Conecte-se à internet e tente novamente.';
      if (btn) btn.disabled = false;
    }
  }

  function handleWorkerMessage(event) {
    const data = event.data || {};
    if (data.type !== 'ELO_OFFLINE_PROGRESS' && data.type !== 'ELO_OFFLINE_DONE') return;
    const status = document.getElementById('eloOfflineStatus');
    const btn = document.getElementById('eloOfflineDownload');
    if (data.type === 'ELO_OFFLINE_PROGRESS') {
      if (status) status.textContent = `Baixando recursos: ${data.done} de ${data.total}${data.failed ? ` • ${data.failed} indisponível(is)` : ''}`;
      return;
    }
    if (status) status.textContent = data.failed ? `Concluído parcialmente: ${data.saved} baixado(s), ${data.failed} não disponível(is).` : `Pronto para jogar offline: ${data.saved} recursos salvos neste aparelho.`;
    if (btn) btn.disabled = false;
  }

  function replaceParentPack() {
    const oldButton = document.getElementById('buyParentPackBtn');
    const card = oldButton?.closest('.starShopCard');
    if (!card || card.dataset.eloReplaced === '1') return;
    card.dataset.eloReplaced = '1';
    card.innerHTML = '<div class="cardIcon">✨</div><div class="cardBody"><b>Missão de Descoberta</b><small>Complete uma atividade no app e ganhe +3 estrelas, uma vez por dia. Sem obrigação de voltar todos os dias.</small></div><button id="eloChooseMission" type="button">Escolher brincadeira</button>';
    document.getElementById('eloChooseMission')?.addEventListener('click', () => {
      if (typeof window.closeStarShop === 'function') window.closeStarShop();
      if (typeof window.openPanel === 'function') window.openPanel('playPanel', 'home');
    });
  }

  function configureVideoCard() {
    const button = document.getElementById('watchRewardVideoBtn');
    const card = button?.closest('.starShopCard');
    if (card) {
      const title = card.querySelector('.cardBody b');
      const note = card.querySelector('.cardBody small');
      if (title) title.textContent = 'Vídeos da Elo no app';
      if (note) note.textContent = 'Assista ao vídeo mais recente no Cinema, dentro do app. Assistir é opcional e não dá estrelas.';
      button.textContent = 'Assistir no Cinema';
      button.onclick = () => window.watchRewardedAd();
    }
    window.watchRewardedAd = function () {
      if (typeof window.closeStarShop === 'function') window.closeStarShop();
      if (typeof window.openPanel === 'function') window.openPanel('watchPanel', 'watch');
      window.setTimeout(() => {
        if (typeof window.openCinemaPlaylist === 'function') window.openCinemaPlaylist(VIDEO_PLAYLIST, false);
        else showToast('Abra o Cinema da Elo para assistir aos vídeos dentro do app.');
      }, 120);
      window.setTimeout(() => { const frame = document.querySelector('#cinemaPlayerHost iframe'); if (frame) frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation'); }, 150);
    };
    window.grantVideoReward = function () { showToast('Vídeos são para assistir por diversão; estrelas são conquistadas nas brincadeiras do app.'); };
    window.claimDailyBonus = function () { showToast('As estrelas são conquistadas brincando, sem obrigação de voltar todo dia.'); };
    window.cancelRewardedAd = function () { document.getElementById('rewardVideoOverlay')?.classList.add('hidden'); document.getElementById('rewardVideoHost')?.replaceChildren(); };
    window.closeRewardedAd = window.cancelRewardedAd;
  }

  function installTabs(panelId, groups, getGroup) {
    const panel = document.getElementById(panelId); if (!panel || panel.querySelector('.eloSectionTabs')) return;
    const tabs = document.createElement('div'); tabs.className = 'eloSectionTabs'; tabs.setAttribute('role', 'tablist');
    const buttons = groups.map((group, index) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'eloSectionTab'; b.textContent = group.label;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      b.addEventListener('click', () => {
        for (const child of panel.querySelectorAll(':scope > .card[data-elo-tab]')) child.hidden = child.dataset.eloTab !== group.id;
        for (const other of buttons) { other.classList.toggle('active', other === b); other.setAttribute('aria-selected', other === b ? 'true' : 'false'); }
      });
      return b;
    });
    buttons.forEach(b => tabs.appendChild(b));
    const title = panel.querySelector('.topTitle'); if (title) title.after(tabs); else panel.prepend(tabs);
    const cards = [...panel.querySelectorAll(':scope > .card')];
    cards.forEach((card, index) => {
      const group = getGroup(card, index);
      if (!group) return;
      card.dataset.eloTab = group;
      card.hidden = group !== groups[0].id;
    });
  }

  function migrateRunawayPets() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (!key.endsWith(':eloVirtualPetV1') && key !== 'eloVirtualPetV1') continue;
        const pet = JSON.parse(localStorage.getItem(key) || '{}');
        if (!pet.ranAway) continue;
        pet.ranAway = false; pet.lastSeen = Date.now(); pet.lightsOff = false; pet.sleepUntil = 0; pet.sleepStartedAt = 0;
        ['hunger','energy','clean','fun','love','study'].forEach(k => { pet[k] = Math.max(55, Math.min(100, Number(pet[k]) || 0)); });
        pet.diary = Array.isArray(pet.diary) ? pet.diary : [];
        pet.diary.unshift({ t: Date.now(), tx: 'O bichinho voltou para casa: agora ele fica por perto mesmo quando você faz outras coisas 💗' });
        try { pet.diary = pet.diary.slice(0,30); } catch (_) {}
        localStorage.setItem(key, JSON.stringify(pet));
      }
    } catch (_) {}
  }

  function installLearningFeedback() {
    if (typeof window.answerKidSchool !== 'function' || window.answerKidSchool.__eloKindFeedback) return;
    const original = window.answerKidSchool;
    const wrapped = function (button) {
      const box = document.getElementById('quiz');
      if (box && String(button?.dataset?.value) !== String(box.dataset.correct)) {
        button?.classList.add('bad');
        if (typeof window.speakText === 'function') window.speakText('Quase! Pense mais um pouquinho e tente de novo. Você consegue!');
        setTimeout(() => button?.classList.remove('bad'), 600);
        return;
      }
      return original.apply(this, arguments);
    };
    wrapped.__eloKindFeedback = true; window.answerKidSchool = wrapped;
  }

  function restrictVideoNavigation() {
    const apply = () => {
      const frame = document.querySelector('#cinemaPlayerHost iframe');
      if (frame) frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    };
    const originalVideo = window.openCinemaVideo;
    if (typeof originalVideo === 'function' && !originalVideo.__eloSandboxed) {
      const wrapped = function () { const result = originalVideo.apply(this, arguments); apply(); return result; };
      wrapped.__eloSandboxed = true; window.openCinemaVideo = wrapped;
    }
    const originalPlaylist = window.openCinemaPlaylist;
    if (typeof originalPlaylist === 'function' && !originalPlaylist.__eloSandboxed) {
      const wrapped = function () { const result = originalPlaylist.apply(this, arguments); apply(); setTimeout(apply, 0); return result; };
      wrapped.__eloSandboxed = true; window.openCinemaPlaylist = wrapped;
    }
    apply();
  }

  function installPortraitDestinations() {
    const scene = document.getElementById('hmScene'); if (!scene || scene.querySelector('.eloPortraitDestinations')) return;
    const stops = [...scene.querySelectorAll(':scope > .hmStop')]; if (!stops.length) return;
    const grid = document.createElement('div'); grid.className = 'eloPortraitDestinations'; grid.setAttribute('aria-label', 'Lugares do Mundo da Elo');
    stops.forEach(stop => grid.appendChild(stop)); scene.appendChild(grid);
  }

  function installPanelTabs() {
    installTabs('parentsPanel', [
      { id: 'summary', label: 'Resumo' }, { id: 'profiles', label: 'Perfis' }, { id: 'wellbeing', label: 'Bem-estar' }, { id: 'security', label: 'Segurança e dados' }
    ], card => {
      const h = (card.querySelector('h3')?.textContent || '').toLowerCase();
      if (h.includes('controle') || h.includes('progresso') || h.includes('semana')) return 'summary';
      if (h.includes('perfil')) return 'profiles';
      if (h.includes('tempo') || h.includes('acessibilidade') || card.classList.contains('youngVoiceInfo')) return 'wellbeing';
      return 'security';
    });
    installTabs('achievementsPanel', [
      { id: 'badges', label: 'Conquistas' }, { id: 'games', label: 'Jogos' }, { id: 'english', label: 'Inglês' }, { id: 'rpg', label: 'RPG' }
    ], (card, index) => ['badges', 'games', 'english', 'rpg'][index] || null);
  }

  function tuneVersion() {
    document.querySelectorAll('[data-app-version]').forEach(node => { node.textContent = '4.3.26'; });
  }

  function loadGameExperience() {
    if (!document.querySelector('link[data-elo-game-experience-style]')) {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = './game-experience.css?v=4.3.26'; link.dataset.eloGameExperienceStyle = '1';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-elo-game-experience]')) {
      const script = document.createElement('script'); script.src = './game-experience.js?v=4.3.26'; script.dataset.eloGameExperience = '1';
      document.body.appendChild(script);
    }
  }

  function loadGameRework() {
    if (!document.querySelector('link[data-elo-game-rework-style]')) {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = './game-rework.css?v=4.3.26'; link.dataset.eloGameReworkStyle = '1';
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-elo-game-rework]')) {
      const script = document.createElement('script'); script.src = './game-rework.js?v=4.3.26'; script.dataset.eloGameRework = '1';
      document.body.appendChild(script);
    }
  }

  function init() {
    loadStyle(); tuneVersion(); migrateRunawayPets(); installSessionTracking(); installActivityTracking(); installLearningFeedback(); addParentReport(); addOfflineControls(); installPortraitDestinations(); installPanelTabs(); configureVideoCard(); restrictVideoNavigation(); replaceParentPack(); loadGameExperience(); loadGameRework();
    const shop = document.getElementById('starShopModal');
    if (shop) new MutationObserver(() => { configureVideoCard(); replaceParentPack(); }).observe(shop, { attributes: true, attributeFilter: ['class'] });
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', handleWorkerMessage);
    if (typeof window.renderParentV2 === 'function' && !window.renderParentV2.__eloReportWrapped) {
      const original = window.renderParentV2;
      const wrapped = function () { const result = original.apply(this, arguments); addParentReport(); renderWeeklyReport(); installPanelTabs(); return result; };
      wrapped.__eloReportWrapped = true; window.renderParentV2 = wrapped;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
