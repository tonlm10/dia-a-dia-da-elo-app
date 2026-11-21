/* Experiência de jogos da Elo v4.3.24 — variedade, dicas opcionais e controles gentis. */
(function () {
  'use strict';
  if (window.__eloGameExperienceInstalled) return;
  window.__eloGameExperienceInstalled = true;

  const EXTRA_MEMORY_IMAGES = [
    ['assets/puzzle/puzzle-01.webp', 'Festa das estrelas'],
    ['assets/puzzle/puzzle-02.webp', 'A Elo no jardim'],
    ['assets/puzzle/puzzle-03.webp', 'Brincadeira colorida'],
    ['assets/puzzle/puzzle-04.webp', 'Mistério mágico'],
    ['assets/puzzle/puzzle-05.webp', 'Aventura da Elo'],
    ['assets/puzzle/puzzle-07.webp', 'Dia de diversão'],
    ['assets/puzzle/puzzle-09.webp', 'Descoberta brilhante'],
    ['assets/puzzle/puzzle-10.webp', 'Uma nova aventura'],
    ['assets/puzzle/puzzle-11.webp', 'Mundo encantado'],
    ['assets/puzzle/puzzle-12.webp', 'Amigas da Elo'],
    ['assets/puzzle/puzzle-13.webp', 'Hora de explorar'],
    ['assets/puzzle/puzzle-15.webp', 'Passeio mágico'],
    ['assets/puzzle/puzzle-16.webp', 'Sonho colorido']
  ];
  try {
    for (const [src, label] of EXTRA_MEMORY_IMAGES) {
      if (!MEMORY_IMAGES.some(item => item.src === src)) MEMORY_IMAGES.push({ src, label });
    }
  } catch (_) {}

  try {
    if (!window.__eloFindScenesAdded) {
      window.__eloFindScenesAdded = true;
      FIND_SCENES.push(
        { bg: 'linear-gradient(180deg,#9be7ff 0 48%,#ffe7bc 48% 68%,#77c987 68%)', objects: ['🐠','🐚','🪸','🦀','🐬','🫧','🌊','⭐','🪼','🐢','🦋','🌺'], sparkles: ['✦','✨','✧','💛','🫧'] },
        { bg: 'linear-gradient(180deg,#201a56 0 60%,#584090 60% 100%)', objects: ['🌙','🪐','🚀','☄️','👽','🛸','🌟','🦄','💫','⭐','🛰️','🌎'], sparkles: ['✦','✨','✧','💛','🌟'] },
        { bg: 'linear-gradient(180deg,#b8eaff 0 43%,#fff0c9 43% 58%,#82d49a 58%)', objects: ['🌳','🌷','🐝','🐞','🦋','🐿️','🍄','🌼','🐰','🍓','🌈','🪺'], sparkles: ['✦','✨','✧','🌼','🌟'] }
      );
    }
  } catch (_) {}

  const byId = id => document.getElementById(id);
  function addAssist(sectionId, buttonId, label, help, onClick) {
    const section = byId(sectionId);
    const controls = section?.querySelector('.gameControlsColLandscape');
    if (!controls || byId(buttonId)) return null;
    const wrap = document.createElement('div');
    wrap.className = 'gxAssist';
    const button = document.createElement('button');
    button.type = 'button'; button.id = buttonId; button.className = 'gxAssistButton'; button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    const note = document.createElement('small'); note.className = 'gxAssistNote'; note.textContent = help;
    button.addEventListener('click', () => onClick(button));
    wrap.append(button, note); controls.appendChild(wrap);
    return button;
  }

  function shortestPath(grid, start, goal) {
    if (!Array.isArray(grid) || !grid.length || !start || !goal) return [];
    const key = p => `${p.x},${p.y}`;
    const queue = [{ x: start.x, y: start.y }], parent = new Map(), seen = new Set([key(start)]);
    const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    let found = false;
    for (let i = 0; i < queue.length && !found; i++) {
      const p = queue[i];
      for (const [dx,dy] of dirs) {
        const n = { x: p.x + dx, y: p.y + dy }, k = key(n);
        if (n.y < 0 || n.y >= grid.length || n.x < 0 || n.x >= grid[n.y].length || grid[n.y][n.x] === '#' || seen.has(k)) continue;
        seen.add(k); parent.set(k, p); queue.push(n);
        if (n.x === goal.x && n.y === goal.y) { found = true; break; }
      }
    }
    if (start.x === goal.x && start.y === goal.y) return [{x:start.x,y:start.y}];
    if (!found) return [];
    const path = [{ x: goal.x, y: goal.y }]; let cur = path[0];
    while (cur.x !== start.x || cur.y !== start.y) {
      const prev = parent.get(key(cur)); if (!prev) return [];
      path.push({ x: prev.x, y: prev.y }); cur = prev;
    }
    return path.reverse();
  }

  function paintRoute(board, route, cols, firstOnly = false) {
    if (!board) return;
    board.querySelectorAll('.gxHintPath').forEach(cell => cell.classList.remove('gxHintPath'));
    const visible = firstOnly ? route.slice(1, 7) : route.slice(1, -1);
    for (const p of visible) board.children[p.y * cols + p.x]?.classList.add('gxHintPath');
  }

  let mazeHintOn = false;
  const mazeHint = addAssist('mazeGame', 'gxMazeHint', '✨ Mostrar caminho', 'Uma trilha luminosa opcional ajuda a encontrar o unicórnio.', button => {
    mazeHintOn = !mazeHintOn; button.setAttribute('aria-pressed', String(mazeHintOn));
    button.textContent = mazeHintOn ? '🙈 Esconder caminho' : '✨ Mostrar caminho';
    refreshMazeRoute();
  });
  function refreshMazeRoute() {
    const board = byId('mazeBoard');
    if (!board) return;
    if (!mazeHintOn) return paintRoute(board, [], 0);
    paintRoute(board, shortestPath(mazeMap, mazePlayer, mazeGoal), mazeCols);
  }
  if (byId('mazeBoard')) new MutationObserver(refreshMazeRoute).observe(byId('mazeBoard'), { childList: true });

  let chaseHintOn = false;
  const chaseHint = addAssist('unicornChaseGame', 'gxChaseHint', '🧭 Encontrar unicórnio', 'Mostra alguns passos seguros até o unicórnio mais próximo.', button => {
    chaseHintOn = !chaseHintOn; button.setAttribute('aria-pressed', String(chaseHintOn));
    button.textContent = chaseHintOn ? '🙈 Esconder rota' : '🧭 Encontrar unicórnio';
    refreshChaseRoute();
  });
  function refreshChaseRoute() {
    const board = byId('chaseBoard');
    if (!board) return;
    if (!chaseHintOn || !chaseUnicorns.length) return paintRoute(board, [], chaseSize);
    const routes = chaseUnicorns.map(goal => shortestPath(chaseMap, chasePlayer, goal)).filter(route => route.length);
    routes.sort((a,b) => a.length - b.length);
    paintRoute(board, routes[0] || [], chaseSize, true);
  }
  if (byId('chaseBoard')) new MutationObserver(refreshChaseRoute).observe(byId('chaseBoard'), { childList: true });

  const findStage = byId('findStage');
  if (findStage) {
    const bar = document.createElement('div'); bar.className = 'gxFindProgress'; bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i></i>'; findStage.after(bar);
    const status = byId('findTime');
    const updateTimer = () => {
      try {
        const total = FIND[findLevel].time, left = Math.max(0, Number(findLeft) || 0);
        bar.firstElementChild.style.transform = `scaleX(${Math.min(1, left / total)})`;
        bar.classList.toggle('low', left <= Math.max(5, Math.ceil(total * .25)));
      } catch (_) {}
    };
    if (status) new MutationObserver(updateTimer).observe(status, { childList: true, characterData: true, subtree: true });
    new MutationObserver(() => { if (!findStage.contains(bar)) findStage.appendChild(bar); updateTimer(); }).observe(findStage, { childList: true });
    const findButton = addAssist('findGame', 'gxFindHint', '🌟 Dica gentil', 'A estrela pisca por um instante; você continua no controle.', button => {
      const target = byId('target'); if (!target || button.disabled) return;
      target.classList.add('gxHintReveal'); button.disabled = true;
      window.setTimeout(() => target.classList.remove('gxHintReveal'), 1300);
      window.setTimeout(() => { button.disabled = false; }, 5000);
    });
  }

  const memory = byId('memory');
  const memoryStats = byId('memoryMoves')?.parentElement;
  if (memory && memoryStats) {
    const progress = document.createElement('div'); progress.className = 'gxPairProgress'; progress.setAttribute('role', 'status'); progress.setAttribute('aria-live', 'polite');
    progress.innerHTML = '<span>0 de 4 pares</span><i><b></b></i>'; memoryStats.after(progress);
    const updatePairs = () => {
      try {
        const total = Math.max(1, Number(memoryTotal) / 2), found = Math.min(total, Number(matched) / 2);
        progress.querySelector('span').textContent = `${found} de ${total} pares encontrados`;
        progress.querySelector('b').style.transform = `scaleX(${found / total})`;
      } catch (_) {}
    };
    new MutationObserver(updatePairs).observe(memory, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  const puzzleTop = document.querySelector('#puzzleGame .puzzleTop');
  if (puzzleTop) {
    const ref = document.createElement('button'); ref.type = 'button'; ref.className = 'gxReferenceButton'; ref.textContent = '🔎 Ver imagem maior';
    ref.setAttribute('aria-expanded','false'); puzzleTop.after(ref);
    ref.addEventListener('click', () => {
      const open = puzzleTop.classList.toggle('gxReferenceOpen');
      ref.setAttribute('aria-expanded', String(open)); ref.textContent = open ? '↩️ Voltar ao jogo' : '🔎 Ver imagem maior';
    });
  }
  const puzzleIntro = document.querySelector('#puzzleGame .gamebox > p.muted');
  if (puzzleIntro) puzzleIntro.textContent = 'Escolha entre 13 imagens da Elo e monte o quebra-cabeça. Toque em duas peças para trocar de lugar; a referência pode ser ampliada quando quiser.';

  const trailWrap = document.querySelector('#trailGame .trailCanvasWrap');
  const trailControls = document.querySelector('#trailGame .trailControls');
  let trailPaused = false;
  if (trailControls && !byId('gxTrailPause')) {
    const pause = document.createElement('button'); pause.type = 'button'; pause.id = 'gxTrailPause'; pause.className = 'trailBtn gxTrailPause'; pause.textContent = '⏸️ Pausar'; pause.setAttribute('aria-pressed','false');
    trailControls.prepend(pause);
    pause.addEventListener('click', () => {
      if (trailRunning) {
        trailPaused = true; trailStop(); pause.textContent = '▶️ Continuar'; pause.setAttribute('aria-pressed','true');
        if (trailUI?.status) trailUI.status.textContent = 'Pausado. Continue quando estiver pronta.';
      } else if (trailPaused && !trailState?.gameOver) {
        trailPaused = false; window.startTrailGame();
      }
    });
  }
  if (trailWrap && !byId('gxTrailEnd')) {
    const end = document.createElement('div'); end.id = 'gxTrailEnd'; end.className = 'gxTrailEnd hidden'; end.setAttribute('role','dialog'); end.setAttribute('aria-modal','true'); end.setAttribute('aria-labelledby','gxTrailEndTitle');
    end.innerHTML = '<div class="gxTrailEndCard"><span>🌈✨</span><h3 id="gxTrailEndTitle" tabindex="-1">Fim desta rodada</h3><p>A aventura continua quando você quiser. Vamos tentar de novo ou escolher outra brincadeira?</p><div><button type="button" class="gxTrailAgain">🔁 Recomeçar</button><button type="button" class="gxTrailLeave">‹ Voltar aos jogos</button></div></div>';
    trailWrap.appendChild(end);
    end.querySelector('.gxTrailAgain').addEventListener('click', () => { end.classList.add('hidden'); trailPaused = false; if (byId('gxTrailPause')) { byId('gxTrailPause').textContent='⏸️ Pausar'; byId('gxTrailPause').setAttribute('aria-pressed','false'); } window.restartTrailRun(); window.startTrailGame(); });
    end.querySelector('.gxTrailLeave').addEventListener('click', () => window.closeGame());
  }
  const originalStartTrail = window.startTrailGame;
  if (typeof originalStartTrail === 'function' && !originalStartTrail.__eloEnhanced) {
    const enhancedStart = function () {
      trailPaused = false; byId('gxTrailEnd')?.classList.add('hidden');
      const button = byId('gxTrailPause'); if (button) { button.textContent='⏸️ Pausar'; button.setAttribute('aria-pressed','false'); button.removeAttribute('disabled'); }
      return originalStartTrail.apply(this, arguments);
    };
    enhancedStart.__eloEnhanced = true; window.startTrailGame = enhancedStart;
  }
  const originalDamage = window.trailDamage;
  if (typeof originalDamage === 'function' && !originalDamage.__eloGentleEnd) {
    const gentleDamage = function (amount, message) {
      const state = trailState;
      if (state && !state.gameOver && !state.player?.inv && !state.hasShield && state.lives <= amount) {
        state.lives = 0; state.gameOver = true; trailPaused = false; trailStop(); syncTrailHud();
        if (trailUI?.status) trailUI.status.textContent = 'Rodada encerrada. Você pode recomeçar quando quiser.';
        byId('gxTrailPause')?.setAttribute('aria-pressed','false');
        byId('gxTrailPause')?.setAttribute('disabled','');
        byId('gxTrailEnd')?.classList.remove('hidden');
        byId('gxTrailEndTitle')?.focus?.();
        return;
      }
      return originalDamage.apply(this, arguments);
    };
    gentleDamage.__eloGentleEnd = true; window.trailDamage = gentleDamage;
  }
  const gameModal = byId('gameModal');
  if (gameModal) new MutationObserver(() => {
    if (gameModal.classList.contains('hidden')) {
      trailPaused = false;
      const button = byId('gxTrailPause'); if (button) { button.textContent='⏸️ Pausar'; button.setAttribute('aria-pressed','false'); button.removeAttribute('disabled'); }
      byId('gxTrailEnd')?.classList.add('hidden');
    }
  }).observe(gameModal, { attributes: true, attributeFilter: ['class'] });

  for (const id of ['findStatus','mazeStatus','chaseStatus','memoryStatus','puzzleStatus','tapPrompt','trailStatus']) {
    const node = byId(id); if (node) { node.setAttribute('role','status'); node.setAttribute('aria-live','polite'); }
  }
  let memoryThemeCount = 16 + EXTRA_MEMORY_IMAGES.length;
  try { memoryThemeCount = MEMORY_IMAGES.length; } catch (_) {}
  window.EloGameExperience = { shortestPath, extraMemoryImages: EXTRA_MEMORY_IMAGES.length, memoryThemeCount, findScenesAdded: 3 };
})();
