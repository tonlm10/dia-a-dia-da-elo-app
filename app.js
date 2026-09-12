const CHANNEL_URL='https://www.youtube.com/@diaadiadaelo';
const SUBSCRIBE_URL='https://www.youtube.com/@diaadiadaelo?sub_confirmation=1';
const INSTAGRAM_URL='https://www.instagram.com/elo_verissimo';
const MEMBER_URL='https://www.youtube.com/channel/UCBPBaYweoBPjr8XlfOz1dwQ/join';
const PLAYLISTS=[
 {id:'PLhOZycBHbEs6cNunzaW8lPEsXR46fBmq4',title:'Escolinha da Elo | Aprenda Brincando',icon:'📚'},
 {id:'PLhOZycBHbEs48-Z1X_bN6lvUpw4Rosz2I',title:'Ache o Personagem Escondido',icon:'🔎'},
 {id:'PLhOZycBHbEs5VT6AAr2Xiv_teqn03Lwsg',title:'Maratona da Elo | Todos os Vídeos',icon:'🎬'},
 {id:'PLhOZycBHbEs6C_t7GSPeVEEl5aO7dd8gH',title:'Shows, Eventos e Personagens da Elo',icon:'🎭'},
 {id:'PLhOZycBHbEs5D4-Wqa3RNgAZYxDRZqP4i',title:'Momentos que Marcaram a História da Elo',icon:'🎉'},
 {id:'PLhOZycBHbEs4EQl6kh96zvbpq9N_Ybxbm',title:'Momentos na Escola e Apresentações da Elo',icon:'🍎'},
 {id:'PLhOZycBHbEs7Zo4Flf2SmadR9MsC4yOYO',title:'Aventuras e Passeios da Elo',icon:'🌎'},
 {id:'PLhOZycBHbEs4LjNfBDJCjhe1E_M7K1oSq',title:'Peixes da Elo',icon:'🐠'},
 {id:'PLhOZycBHbEs64afG13roQP2ZnzPx5fXd-',title:'Natal da Elo',icon:'🎄'},
 {id:'PLhOZycBHbEs5vV3X_PACKBO-irNlLhWIF',title:'Escolinha, Brincadeiras e Desafios da Elo',icon:'🎮'},
 {id:'PLhOZycBHbEs7JROD9ymRS9LreZ4MBz0wV',title:'Lives e Bate-papo',icon:'🔴'},
 {id:'PLhOZycBHbEs5yoHE1PgIDLfn08_7rd86u',title:'Shorts Divertidos da Elo',icon:'⚡'},
 {id:'PLhOZycBHbEs6Afo_8He5MhGlLcd9vXjRh',title:'Cozinha da Elo | Receitas e Diversão',icon:'🍳'}
];
const STORIES=[
 {id:'story1',title:'A Mochila Desaparecida',summary:'Organização e responsabilidade.',moral:'Guardar cada coisa no seu lugar.',pages:10},
 {id:'story2',title:'O Guarda-Chuva Rosa',summary:'Gentileza que transforma o dia.',moral:'Gentileza também é uma aventura.',pages:10},
 {id:'story3',title:'A Sementinha Misteriosa',summary:'Paciência, cuidado e descobertas.',moral:'Com amor e paciência, pequenas sementes viram grandes belezas.',pages:10},
 {id:'story4',title:'Elo e o Passarinho Perdido',summary:'Empatia e respeito aos animais.',moral:'Ajudar também é saber dar espaço.',pages:10}
];

let stars=Number(localStorage.getItem('eloStars')||0),currentStory=0,currentPage=0;
let favorites=JSON.parse(localStorage.getItem('eloFavStories')||'[]');
let readStories=JSON.parse(localStorage.getItem('eloReadStories')||'[]');
const starCount=document.getElementById('starCount');

function renderStars(){starCount.textContent=stars;renderBadges()}
function addStars(n=1,msg='Você ganhou uma estrelinha! ⭐'){stars+=n;localStorage.setItem('eloStars',stars);renderStars();toast(msg)}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1900)}
function openPanel(id,nav){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.nav===nav));window.scrollTo({top:0,behavior:'smooth'});if(id==='storiesPanel')renderLibrary();if(id==='parentsPanel'||id==='achievementsPanel')renderBadges();if(id==='playPanel'){clearInterval(findTimer);clearTimeout(tapTimer)}if(id==='createPanel'){renderColoringGallery();renderPalette()}}
let parentPendingAction=null,parentPinBuffer='',parentPinMode='verify',parentPinFirst='';
function launchExternal(url){const w=window.open(url,'_blank','noopener,noreferrer');if(!w)location.href=url}
function hasParentPin(){return /^\d{4}$/.test(localStorage.getItem('eloParentPin')||'')}
function parentUnlocked(){return sessionStorage.getItem('eloParentUnlocked')==='1'}
function updatePinDots(){document.querySelectorAll('#pinDots .pinDot').forEach((d,i)=>d.classList.toggle('on',i<parentPinBuffer.length))}
function showParentPin(message,mode='verify',action=null){parentPendingAction=action;parentPinMode=mode;parentPinBuffer='';parentPinFirst='';const modal=document.getElementById('parentPinModal');document.getElementById('pinTitle').textContent=mode.startsWith('setup')?'Criar PIN dos responsáveis':'Área dos responsáveis';document.getElementById('pinMessage').textContent=message;updatePinDots();modal.classList.remove('hidden');document.body.style.overflow='hidden'}
function closeParentPin(){document.getElementById('parentPinModal').classList.add('hidden');document.body.style.overflow='';parentPinBuffer='';parentPendingAction=null;updatePinDots()}
function finishParentAccess(){sessionStorage.setItem('eloParentUnlocked','1');const cb=parentPendingAction;document.getElementById('parentPinModal').classList.add('hidden');document.body.style.overflow='';parentPendingAction=null;parentPinBuffer='';updatePinDots();if(cb)cb()}
function requestParentAccess(action,message='Digite o PIN de 4 dígitos dos responsáveis para continuar.'){if(parentUnlocked())return action();if(!hasParentPin())return showParentPin('Crie um PIN de 4 dígitos. Ele ficará salvo somente neste aparelho.','setup1',action);showParentPin(message,'verify',action)}
function pinKey(n){if(parentPinBuffer.length>=4)return;parentPinBuffer+=n;updatePinDots();if(parentPinBuffer.length===4)processParentPin()}
function pinBackspace(){parentPinBuffer=parentPinBuffer.slice(0,-1);updatePinDots()}
function processParentPin(){if(parentPinBuffer.length!==4)return;const entered=parentPinBuffer;if(parentPinMode==='setup1'){parentPinFirst=entered;parentPinBuffer='';parentPinMode='setup2';document.getElementById('pinMessage').textContent='Repita o novo PIN para confirmar.';updatePinDots();return}if(parentPinMode==='setup2'){if(entered!==parentPinFirst){parentPinBuffer='';parentPinMode='setup1';parentPinFirst='';document.getElementById('pinMessage').textContent='Os PINs não coincidiram. Crie novamente um PIN de 4 dígitos.';updatePinDots();return}localStorage.setItem('eloParentPin',entered);finishParentAccess();toast('PIN dos responsáveis criado 🔐');return}if(parentPinMode==='change1'){parentPinFirst=entered;parentPinBuffer='';parentPinMode='change2';document.getElementById('pinMessage').textContent='Repita o novo PIN para confirmar.';updatePinDots();return}if(parentPinMode==='change2'){if(entered!==parentPinFirst){parentPinBuffer='';parentPinMode='change1';parentPinFirst='';document.getElementById('pinMessage').textContent='Os PINs não coincidiram. Tente novamente.';updatePinDots();return}localStorage.setItem('eloParentPin',entered);document.getElementById('parentPinModal').classList.add('hidden');document.body.style.overflow='';parentPinBuffer='';updatePinDots();toast('PIN alterado com sucesso 🔐');return}if(entered===localStorage.getItem('eloParentPin'))finishParentAccess();else{parentPinBuffer='';document.getElementById('pinMessage').textContent='PIN incorreto. Tente novamente.';updatePinDots()}}
function changeParentPin(){parentPinBuffer='';parentPinFirst='';parentPinMode='change1';parentPendingAction=null;document.getElementById('pinTitle').textContent='Alterar PIN';document.getElementById('pinMessage').textContent='Digite um novo PIN de 4 dígitos.';updatePinDots();document.getElementById('parentPinModal').classList.remove('hidden');document.body.style.overflow='hidden'}
function openExternal(url){requestParentAccess(()=>launchExternal(url),'Digite o PIN dos responsáveis para abrir este link externo.')}
function openParents(){requestParentAccess(()=>openPanel('parentsPanel','parents'))}
function openMemberWithGate(){openExternal(MEMBER_URL)}
function openSubscribe(){openExternal(SUBSCRIBE_URL)}
function openInstagram(){openExternal(INSTAGRAM_URL)}
function openGame(id,title){clearInterval(findTimer);clearTimeout(tapTimer);document.getElementById('gameModalTitle').textContent=title;document.querySelectorAll('.gameSection').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');document.getElementById('gameModal').classList.remove('hidden');document.body.style.overflow='hidden';if(id==='findGame')resetFind(true);if(id==='mazeGame')startMaze();if(id==='memoryGame')startMemory();if(id==='puzzleGame')startPuzzle(false);if(id==='tapGameSection')startTapGame()}
function closeGame(){clearInterval(findTimer);clearTimeout(tapTimer);document.getElementById('gameModal').classList.add('hidden');document.body.style.overflow=''}
function openColoring(i){chooseColoring(i,true)}
function closeColoring(){document.getElementById('coloringModal').classList.add('hidden');document.body.style.overflow=''}

const daily=[['Missão da Elo','Dê 5 pulinhos e faça uma pose engraçada!'],['Missão das cores','Ache 3 coisas cor-de-rosa perto de você.'],['Missão do sorriso','Faça alguém da família dar risada.'],['Missão movimento','Imite um sapinho por 10 segundos.'],['Missão desenho','Pinte um desenho da Elo e mostre para alguém.'],['Missão gentil','Faça uma gentileza para alguém da família.']];
const d=daily[new Date().getDate()%daily.length];
document.getElementById('dailyText').textContent=d[1];
const dailyKey='eloDaily'+new Date().toDateString();
if(localStorage.getItem(dailyKey))document.getElementById('dailyProgress').style.width='100%';
function completeDaily(){if(localStorage.getItem(dailyKey))return toast('A missão de hoje já foi concluída 💗');localStorage.setItem(dailyKey,'1');document.getElementById('dailyProgress').style.width='100%';addStars(2,'Missão concluída! +2 ⭐')}

function renderStoryStrip(){const box=document.getElementById('storyStrip');if(!box)return;box.innerHTML=STORIES.map((s,i)=>`<button class="storyCard" onclick="openStory(${i})"><div class="storyThumb" style="background-image:url('assets/stories/${s.id}-cover.webp')"><span class="numBadge">${i+1}</span><span class="heartBadge">${favorites.includes(s.id)?'♥':'♡'}</span></div><div class="storyInfo"><b>${s.title}</b><small>${s.summary}</small></div></button>`).join('')}
function renderLibrary(){const box=document.getElementById('libraryGrid');box.innerHTML=STORIES.map((s,i)=>`<article class="libCard"><div class="libCover" style="background-image:url('assets/stories/${s.id}-cover.webp')"><span class="numBadge">${i+1}</span><button class="fav ${favorites.includes(s.id)?'on':''}" onclick="toggleFav('${s.id}',event)">${favorites.includes(s.id)?'♥':'♡'}</button></div><div class="libBody"><h3>${s.title}</h3><p>${s.summary}</p><div class="libMeta"><small>📖 ${s.pages} páginas ${readStories.includes(s.id)?'• ✅ lida':''}</small><button class="btn" onclick="openStory(${i})">Ler</button></div></div></article>`).join('')}
function toggleFav(id,e){e.stopPropagation();favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('eloFavStories',JSON.stringify(favorites));renderLibrary();renderStoryStrip();toast(favorites.includes(id)?'Adicionada aos favoritos 💗':'Removida dos favoritos')}
function openStory(i){currentStory=i;currentPage=0;openPanel('readerPanel','stories');renderReader()}
function renderReader(){const s=STORIES[currentStory],page=document.getElementById('storyPage');document.getElementById('readerTitle').textContent=s.title;page.style.backgroundImage=`url('assets/stories/${s.id}.webp')`;page.style.backgroundRepeat='no-repeat';page.style.backgroundSize=`100% ${s.pages*100}%`;page.style.backgroundPosition=`center ${currentPage*(100/(s.pages-1))}%`;document.getElementById('pageCounter').textContent=`Página ${currentPage+1} de ${s.pages}`;document.getElementById('readerMoral').textContent=currentPage===s.pages-1?'✨ '+s.moral:'';document.getElementById('readerDots').innerHTML=Array.from({length:s.pages},(_,i)=>`<i class="dot ${i===currentPage?'on':''}"></i>`).join('');if(currentPage===s.pages-1&&!readStories.includes(s.id)){readStories.push(s.id);localStorage.setItem('eloReadStories',JSON.stringify(readStories));addStars(3,'História concluída! +3 ⭐');renderLibrary()}}
function nextPage(){const s=STORIES[currentStory];if(currentPage<s.pages-1){currentPage++;renderReader()}else toast('Fim da história 💗')}
function prevPage(){if(currentPage>0){currentPage--;renderReader()}else toast('Você está na primeira página')}
let touchX=0;
document.getElementById('storyPage').addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
document.getElementById('storyPage').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(dx<-45)nextPage();if(dx>45)prevPage()},{passive:true});

function renderPlaylists(){document.getElementById('playlistGrid').innerHTML=PLAYLISTS.map(p=>`<button class="playlistCard" onclick="openExternal('https://youtube.com/playlist?list=${p.id}')"><div class="picon">${p.icon}</div><b>${p.title}</b><span>Abrir playlist no YouTube →</span></button>`).join('')}

// Find the star
let findLevel='easy',findTimer=null,findLeft=20,findRounds=0;
const FIND={easy:{size:13,time:20,reward:1,count:46},medium:{size:10,time:14,reward:2,count:62},hard:{size:8,time:9,reward:3,count:78}};
const FIND_SCENES=[
 {bg:'linear-gradient(180deg,#7ed6ff 0 48%,#8fe38e 48% 75%,#f6c56b 75%)',objects:['☁️','🌷','🌳','🏠','🦋','🌼','🌻','🍄','🌿','🍎','🐞','🐝','🪁','🎈'],sparkles:['✦','✨','✧','💛','🌟','☀️']},
 {bg:'linear-gradient(180deg,#a7dcff 0 44%,#ffe0ef 44% 65%,#8ed27d 65%)',objects:['☁️','🎈','🪁','🌈','🐥','🌼','🧸','🍭','🍓','🦄','🌸','🧁','🍬','🎀'],sparkles:['✦','✨','✧','💛','🌟','☀️']},
 {bg:'linear-gradient(180deg,#6953a8 0 42%,#8f7bd5 42% 62%,#3f7b67 62%)',objects:['🌙','☁️','🦄','🎀','🍬','🍩','💜','🌸','🎠','🧁','🌳','🏰','🦋'],sparkles:['✦','✨','✧','💛','🌟','⭐']}
];
const findStage=document.getElementById('findStage');
function rand(min,max){return Math.random()*(max-min)+min}
function setFindLevel(level,btn){findLevel=level;document.querySelectorAll('[data-find]').forEach(x=>x.classList.remove('on'));btn.classList.add('on');resetFind(true)}
function buildFindScene(cfg){const scene=FIND_SCENES[Math.floor(Math.random()*FIND_SCENES.length)];findStage.innerHTML='';findStage.style.background=scene.bg;for(let i=0;i<cfg.count;i++){const el=document.createElement('div');el.className='obj';el.textContent=scene.objects[Math.floor(Math.random()*scene.objects.length)];el.style.left=rand(0,94)+'%';el.style.top=rand(1,91)+'%';el.style.fontSize=rand(15,34)+'px';el.style.opacity=String(rand(.72,1));el.style.transform=`rotate(${rand(-24,24)}deg)`;findStage.appendChild(el)}for(let i=0;i<Math.floor(cfg.count*.7);i++){const el=document.createElement('div');el.className='fake';el.textContent=scene.sparkles[Math.floor(Math.random()*scene.sparkles.length)];el.style.left=rand(1,95)+'%';el.style.top=rand(2,92)+'%';el.style.fontSize=rand(Math.max(7,cfg.size-2),cfg.size+7)+'px';findStage.appendChild(el)}const t=document.createElement('button');t.id='target';t.className='target';t.setAttribute('aria-label','estrela escondida');t.innerHTML='<span>⭐</span>';t.style.left=rand(2,94)+'%';t.style.top=rand(2,91)+'%';t.style.setProperty('--star-size',cfg.size+'px');t.style.transform=`rotate(${rand(-30,30)}deg)`;t.dataset.found='0';t.onclick=()=>{if(t.dataset.found==='1')return;t.dataset.found='1';clearInterval(findTimer);findRounds++;document.getElementById('findStatus').textContent='Achou! 🎉';addStars(FIND[findLevel].reward,`Achou! +${FIND[findLevel].reward} ⭐`);setTimeout(()=>resetFind(),850)};findStage.appendChild(t)}
function resetFind(manual=false){clearInterval(findTimer);const cfg=FIND[findLevel];buildFindScene(cfg);findLeft=cfg.time;document.getElementById('findTime').textContent=findLeft+'s';document.getElementById('findStatus').textContent=manual?'Nova estrela escondida!':'Ache a estrela!';findTimer=setInterval(()=>{findLeft--;document.getElementById('findTime').textContent=findLeft+'s';if(findLeft<=0){clearInterval(findTimer);document.getElementById('findStatus').textContent='O tempo acabou!';setTimeout(()=>resetFind(),900)}},1000)}

// Maze game — randomized 13x13 perfect maze
const MAZE_SIZE=13;
let mazeMap=[],mazePlayer={x:1,y:1},mazeGoal={x:MAZE_SIZE-2,y:MAZE_SIZE-2},mazeMoves=0,mazeWon=false,mazeRewarded=false;
function makeMaze(size=MAZE_SIZE){const grid=Array.from({length:size},()=>Array(size).fill('#'));const dirs=[[2,0],[-2,0],[0,2],[0,-2]];function dig(x,y){grid[y][x]='.';const order=shuffle(dirs);for(const [dx,dy] of order){const nx=x+dx,ny=y+dy;if(nx<=0||ny<=0||nx>=size-1||ny>=size-1||grid[ny][nx]!== '#')continue;grid[y+dy/2][x+dx/2]='.';dig(nx,ny)}}dig(1,1);grid[1][1]='S';grid[size-2][size-2]='G';return grid}
function startMaze(){mazeMap=makeMaze();mazeMoves=0;mazeWon=false;mazeRewarded=false;for(let y=0;y<mazeMap.length;y++){for(let x=0;x<mazeMap[y].length;x++){if(mazeMap[y][x]==='S'){mazePlayer={x,y};mazeMap[y][x]='.'}if(mazeMap[y][x]==='G'){mazeGoal={x,y};mazeMap[y][x]='.'}}}document.getElementById('mazeBoard').style.gridTemplateColumns=`repeat(${MAZE_SIZE},1fr)`;document.getElementById('mazeMoves').textContent='Movimentos: 0';document.getElementById('mazeStatus').textContent='Encontre o unicórnio!';renderMaze()}
function renderMaze(){const board=document.getElementById('mazeBoard');board.innerHTML='';mazeMap.forEach((row,y)=>row.forEach((cell,x)=>{const d=document.createElement('div');const isPlayer=mazePlayer.x===x&&mazePlayer.y===y,isGoal=mazeGoal.x===x&&mazeGoal.y===y;d.className='mazeCell '+(cell==='#'?'wall':'path')+(isPlayer?' player':'')+(isGoal?' goal':'');if(isPlayer)d.textContent='👧';else if(isGoal)d.textContent='🦄';else if(cell==='#'&&(x+y)%7===0)d.textContent='🌿';board.appendChild(d)}))}
function moveMaze(dx,dy){if(!mazeMap.length||mazeWon)return;const nx=mazePlayer.x+dx,ny=mazePlayer.y+dy;if(ny<0||ny>=mazeMap.length||nx<0||nx>=mazeMap[0].length)return;if(mazeMap[ny][nx]==='#'){toast('Parede! Tente outro caminho 😊');return}mazePlayer={x:nx,y:ny};mazeMoves++;document.getElementById('mazeMoves').textContent='Movimentos: '+mazeMoves;renderMaze();if(nx===mazeGoal.x&&ny===mazeGoal.y){mazeWon=true;document.getElementById('mazeStatus').textContent='Elo chegou ao unicórnio! 🦄✨';if(!mazeRewarded){mazeRewarded=true;localStorage.setItem('eloMazeWon','1');addStars(3,'Labirinto difícil concluído! +3 ⭐')}}else document.getElementById('mazeStatus').textContent='Continue procurando o caminho.'}
let mazeTouchStart=null;
const mazeBoard=document.getElementById('mazeBoard');
mazeBoard.addEventListener('touchstart',e=>{const t=e.changedTouches[0];mazeTouchStart={x:t.clientX,y:t.clientY}},{passive:true});
mazeBoard.addEventListener('touchend',e=>{if(!mazeTouchStart)return;const t=e.changedTouches[0],dx=t.clientX-mazeTouchStart.x,dy=t.clientY-mazeTouchStart.y;mazeTouchStart=null;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;if(Math.abs(dx)>Math.abs(dy))moveMaze(dx>0?1:-1,0);else moveMaze(0,dy>0?1:-1)},{passive:true});
window.addEventListener('keydown',e=>{if(!document.getElementById('gameModal').classList.contains('hidden')&&document.getElementById('mazeGame').classList.contains('active')){if(e.key==='ArrowUp')moveMaze(0,-1);if(e.key==='ArrowDown')moveMaze(0,1);if(e.key==='ArrowLeft')moveMaze(-1,0);if(e.key==='ArrowRight')moveMaze(1,0)}});

// Memory game — 8 / 16 / 32 cards with illustrated Elo themes
const MEMORY_IMAGES=[
 {src:'assets/memory-cards/card-01.webp',label:'Vídeos'},
 {src:'assets/memory-cards/card-02.webp',label:'Shorts'},
 {src:'assets/memory-cards/card-03.webp',label:'Brincadeiras'},
 {src:'assets/memory-cards/card-04.webp',label:'Culinária'},
 {src:'assets/memory-cards/card-05.webp',label:'Escolinha'},
 {src:'assets/memory-cards/card-06.webp',label:'Médica'},
 {src:'assets/memory-cards/card-07.webp',label:'Viagem'},
 {src:'assets/memory-cards/card-08.webp',label:'Shows'},
 {src:'assets/memory-cards/card-09.webp',label:'Personagens'},
 {src:'assets/memory-cards/card-10.webp',label:'Animais'},
 {src:'assets/memory-cards/card-11.webp',label:'Esportes'},
 {src:'assets/memory-cards/card-12.webp',label:'Diversão'},
 {src:'assets/memory-cards/card-13.webp',label:'Pintura'},
 {src:'assets/memory-cards/card-14.webp',label:'Leitura'},
 {src:'assets/memory-cards/card-15.webp',label:'Música'},
 {src:'assets/memory-cards/card-16.webp',label:'Aventuras'}
];
const MEMORY_LEVELS={easy:4,medium:8,hard:16};
let memoryLevel='easy',memoryOpen=[],memoryLock=false,matched=0,memoryMoves=0,memoryTotal=8;
function setMemoryLevel(level,btn){memoryLevel=level;document.querySelectorAll('[data-memory]').forEach(x=>x.classList.remove('on'));btn.classList.add('on');startMemory()}
function startMemory(){const pairs=MEMORY_LEVELS[memoryLevel];const chosen=shuffle(MEMORY_IMAGES).slice(0,pairs).map((x,i)=>({...x,key:'elo'+i}));const cards=shuffle(chosen.flatMap(x=>[x,x]));memoryTotal=cards.length;memoryOpen=[];memoryLock=false;matched=0;memoryMoves=0;const box=document.getElementById('memory');box.className='memory '+memoryLevel;box.style.gridTemplateColumns='repeat(4,1fr)';box.innerHTML='';document.getElementById('memoryStatus').textContent='Encontre os pares!';document.getElementById('memoryMoves').textContent='Jogadas: 0';cards.forEach(card=>{const b=document.createElement('button');b.className='mem';b.dataset.key=card.key;b.dataset.src=card.src;b.setAttribute('aria-label','Carta de memória fechada');b.onclick=()=>flip(b);box.appendChild(b)})}
function showMemImage(b){const d=document.createElement('div');d.className='memPic';d.style.backgroundImage=`url('${b.dataset.src}')`;b.innerHTML='';b.appendChild(d)}
function hideMemImage(b){b.innerHTML=''}
function flip(b){if(memoryLock||b.classList.contains('done')||b.classList.contains('open'))return;b.classList.add('open');showMemImage(b);memoryOpen.push(b);if(memoryOpen.length===2){memoryLock=true;memoryMoves++;document.getElementById('memoryMoves').textContent='Jogadas: '+memoryMoves;setTimeout(()=>{const[a,c]=memoryOpen;if(a.dataset.key===c.dataset.key){a.classList.add('done');c.classList.add('done');matched+=2;if(matched===memoryTotal){document.getElementById('memoryStatus').textContent='Você encontrou todos! 🎉';if(memoryLevel==='hard')localStorage.setItem('eloMemoryHardWon','1');addStars(memoryLevel==='hard'?5:memoryLevel==='medium'?3:2,'Memória completa! ⭐');renderBadges()}}else{a.classList.remove('open');c.classList.remove('open');hideMemImage(a);hideMemImage(c)}memoryOpen=[];memoryLock=false},650)}}

// Puzzle game — tap two pieces to swap them
const PUZZLE_LEVELS={easy:3,medium:4,hard:5};
const PUZZLE_IMAGES=Array.from({length:8},(_,i)=>`assets/memory/mem-${String(i+1).padStart(2,'0')}.webp`);
let puzzleLevel='easy',puzzleImageIndex=0,puzzleOrder=[],puzzleSelected=-1,puzzleMoves=0,puzzleRewarded=false,puzzleComplete=false;
function setPuzzleLevel(level,btn){puzzleLevel=level;document.querySelectorAll('[data-puzzle]').forEach(x=>x.classList.remove('on'));btn.classList.add('on');startPuzzle(false)}
function renderPuzzleChoices(){const box=document.getElementById('puzzleChoices');if(!box)return;box.innerHTML=PUZZLE_IMAGES.slice(0,6).map((src,i)=>`<button class="puzzleChoice ${i===puzzleImageIndex?'on':''}" onclick="choosePuzzleImage(${i})"><img src="${src}" alt="Foto ${i+1} da Elo"></button>`).join('')}
function choosePuzzleImage(i){puzzleImageIndex=i;startPuzzle(false)}
function makePuzzleOrder(total){let a=Array.from({length:total},(_,i)=>i);do{a=shuffle(a)}while(a.every((v,i)=>v===i));return a}
function startPuzzle(randomPhoto=false){const n=PUZZLE_LEVELS[puzzleLevel];if(randomPhoto)puzzleImageIndex=(puzzleImageIndex+1+Math.floor(Math.random()*(PUZZLE_IMAGES.length-1)))%PUZZLE_IMAGES.length;puzzleOrder=makePuzzleOrder(n*n);puzzleSelected=-1;puzzleMoves=0;puzzleRewarded=false;puzzleComplete=false;const prev=document.getElementById('puzzlePreview');if(prev)prev.src=PUZZLE_IMAGES[puzzleImageIndex];document.getElementById('puzzleStatus').textContent='Monte a foto!';document.getElementById('puzzleMoves').textContent='Jogadas: 0';document.getElementById('puzzleCompleteNote').classList.add('hidden');renderPuzzleChoices();renderPuzzle()}
function piecePosition(piece,n){const row=Math.floor(piece/n),col=piece%n;const x=n===1?0:(col/(n-1))*100,y=n===1?0:(row/(n-1))*100;return `${x}% ${y}%`}
function renderPuzzle(){const n=PUZZLE_LEVELS[puzzleLevel],board=document.getElementById('puzzleBoard');if(!board)return;board.style.gridTemplateColumns=`repeat(${n},1fr)`;board.classList.toggle('completed',puzzleComplete);board.innerHTML='';puzzleOrder.forEach((piece,pos)=>{const b=document.createElement('button');b.className='puzzlePiece'+(puzzleSelected===pos?' selected':'')+(piece===pos?' correct':'');b.style.backgroundImage=`url('${PUZZLE_IMAGES[puzzleImageIndex]}')`;b.style.backgroundSize=`${n*100}% ${n*100}%`;b.style.backgroundPosition=piecePosition(piece,n);b.setAttribute('aria-label',`Peça ${pos+1}`);b.disabled=puzzleComplete;b.onclick=()=>tapPuzzlePiece(pos);board.appendChild(b)})}
function tapPuzzlePiece(pos){if(puzzleComplete)return;if(puzzleSelected<0){puzzleSelected=pos;document.getElementById('puzzleStatus').textContent='Agora escolha onde colocar essa peça.';renderPuzzle();return}if(puzzleSelected===pos){puzzleSelected=-1;document.getElementById('puzzleStatus').textContent='Escolha uma peça.';renderPuzzle();return}const a=puzzleSelected;[puzzleOrder[a],puzzleOrder[pos]]=[puzzleOrder[pos],puzzleOrder[a]];puzzleSelected=-1;puzzleMoves++;document.getElementById('puzzleMoves').textContent='Jogadas: '+puzzleMoves;const solved=puzzleOrder.every((v,i)=>v===i);if(solved){puzzleComplete=true;renderPuzzle();document.getElementById('puzzleStatus').textContent='Quebra-cabeça completo! 🎉';document.getElementById('puzzleCompleteNote').classList.remove('hidden');if(!puzzleRewarded){puzzleRewarded=true;localStorage.setItem('eloPuzzleWon','1');addStars(puzzleLevel==='hard'?5:puzzleLevel==='medium'?3:2,'Quebra-cabeça completo! ⭐');renderBadges()}}else{renderPuzzle();document.getElementById('puzzleStatus').textContent='Muito bem! Continue montando.'}}

// Tap the number
let tapTarget=1,tapScore=0,tapTimer=null,tapRound=0,tapDelay=2500;
function buildTapRound(){clearTimeout(tapTimer);tapRound++;tapTarget=Math.floor(Math.random()*9)+1;document.getElementById('tapPrompt').textContent=`Toque no número ${tapTarget} antes que ele mude!`;const nums=Array.from({length:9},(_,i)=>i+1).sort(()=>Math.random()-.5);document.getElementById('tapGame').innerHTML=nums.map(n=>`<button class="tapNum" onclick="tapAnswer(${n})">${n}</button>`).join('');tapDelay=Math.max(900,2500-tapScore*80);document.getElementById('tapTimeText').textContent=(tapDelay/1000).toFixed(1).replace('.',',')+'s';const bar=document.getElementById('tapTimerBar');bar.style.transition='none';bar.style.transform='scaleX(1)';requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.transition=`transform ${tapDelay}ms linear`;bar.style.transform='scaleX(0)'}));tapTimer=setTimeout(()=>{toast('Mudou! Seja mais rápido 😄');buildTapRound()},tapDelay)}
function startTapGame(){tapScore=0;tapRound=0;document.getElementById('tapScore').textContent='Acertos: 0';buildTapRound()}
function tapAnswer(n){if(n===tapTarget){tapScore++;document.getElementById('tapScore').textContent='Acertos: '+tapScore;if(tapScore%3===0)addStars(1,'Boa sequência! +1 ⭐');else toast('Acertou! 🎯');buildTapRound()}else toast('Ops! Esse não era o número 😊')}

// Quiz
const QUESTIONS={
 easy:[
  ['Qual animal faz “miau”?',['Cachorro','Gato','Pato'],1,'Animais'],['Qual cor aparece no céu em um dia sem nuvens?',['Azul','Marrom','Preto'],0,'Cores'],['Quanto é 2 + 2?',['3','4','5'],1,'Números'],['Qual destes vive na água?',['Peixe','Leão','Galinha'],0,'Animais'],['Qual letra começa a palavra ELO?',['A','E','O'],1,'Letras'],['Quantos dedos temos em uma mão?',['3','5','8'],1,'Corpo'],['Qual fruta costuma ser amarela?',['Banana','Morango','Uva'],0,'Frutas'],['Qual destes é uma forma redonda?',['Círculo','Triângulo','Quadrado'],0,'Formas'],['Qual número vem depois do 6?',['5','7','9'],1,'Números'],['Qual animal late?',['Gato','Cachorro','Peixe'],1,'Animais'],['Misturando azul e amarelo, qual cor aparece?',['Verde','Vermelho','Preto'],0,'Cores'],['Quantas rodas tem uma bicicleta comum?',['1','2','4'],1,'Conhecimentos'],['Qual é o contrário de grande?',['Pequeno','Alto','Largo'],0,'Palavras'],['Qual destes é usado para escrever?',['Lápis','Prato','Sapato'],0,'Objetos'],['Qual estação costuma ser mais fria?',['Verão','Inverno','Primavera'],1,'Natureza'],['Qual número é maior?',['3','8','5'],1,'Números'],['Qual dessas atitudes é gentil?',['Ajudar alguém','Empurrar alguém','Gritar com alguém'],0,'Boas atitudes'],['Qual parte do corpo usamos para ouvir?',['Olhos','Ouvidos','Nariz'],1,'Corpo'],['Qual destes cresce em uma árvore?',['Maçã','Bola','Colher'],0,'Natureza'],['Qual letra vem depois do B?',['C','A','D'],0,'Letras']
 ],
 medium:[
  ['Quanto é 7 + 5?',['10','12','13'],1,'Matemática'],['Qual palavra está escrita corretamente?',['Caza','Casa','Cassa'],1,'Português'],['Se você tem 10 balas e dá 3, quantas sobram?',['7','6','8'],0,'Matemática'],['Qual destes animais é mamífero?',['Golfinho','Tubarão','Polvo'],0,'Animais'],['Qual planeta onde vivemos?',['Marte','Terra','Júpiter'],1,'Natureza'],['Qual é a metade de 10?',['2','5','8'],1,'Matemática'],['Qual palavra rima com “gato”?',['Pato','Bola','Flor'],0,'Português'],['Quantos lados tem um triângulo?',['3','4','5'],0,'Formas'],['O que uma planta precisa para crescer?',['Água e luz','Só brinquedos','Escuridão total'],0,'Natureza'],['Qual é o dobro de 4?',['6','8','10'],1,'Matemática'],['Qual palavra começa com o mesmo som de “bola”?',['Boca','Casa','Dado'],0,'Português'],['Qual destes é um inseto?',['Borboleta','Gato','Sapo'],0,'Animais'],['Que número falta: 2, 4, 6, __?',['7','8','10'],1,'Lógica'],['Se hoje é segunda-feira, amanhã será?',['Domingo','Terça-feira','Sábado'],1,'Tempo'],['Qual objeto mede a temperatura?',['Termômetro','Régua','Relógio'],0,'Conhecimentos'],['Qual atitude protege a natureza?',['Jogar lixo no chão','Reciclar','Desperdiçar água'],1,'Boas atitudes'],['Quanto é 15 - 6?',['9','8','10'],0,'Matemática'],['Qual palavra tem 3 sílabas?',['Sol','Boneca','Pão'],1,'Português'],['Qual destes não é fruta?',['Maçã','Cenoura','Pera'],1,'Alimentos'],['Qual sequência está em ordem crescente?',['5,4,3','2,4,6','9,7,8'],1,'Lógica']
 ],
 hard:[
  ['Quanto é 8 × 3?',['18','24','32'],1,'Matemática'],['Qual é o resultado de 36 ÷ 6?',['5','6','7'],1,'Matemática'],['Qual palavra é sinônimo de “feliz”?',['Alegre','Bravo','Cansado'],0,'Português'],['Qual número completa: 3, 6, 9, 12, __?',['14','15','16'],1,'Lógica'],['Uma dúzia corresponde a quantas unidades?',['10','12','20'],1,'Matemática'],['Qual destes animais é anfíbio?',['Sapo','Águia','Cavalo'],0,'Animais'],['Qual é a capital do Brasil?',['Brasília','Rio de Janeiro','São Paulo'],0,'Conhecimentos'],['Quantos minutos existem em uma hora?',['30','60','100'],1,'Tempo'],['Qual palavra é o oposto de “rápido”?',['Lento','Forte','Claro'],0,'Português'],['Se um livro tem 20 páginas e você leu 12, faltam quantas?',['8','10','12'],0,'Matemática'],['Qual é o próximo número: 1, 4, 7, 10, __?',['12','13','14'],1,'Lógica'],['Qual destes órgãos bombeia sangue pelo corpo?',['Coração','Pulmão','Estômago'],0,'Corpo'],['Qual é 25 + 17?',['40','42','43'],1,'Matemática'],['Qual palavra está no plural?',['Menina','Meninas','Menino'],1,'Português'],['Se três crianças dividem 12 figurinhas igualmente, cada uma recebe?',['3','4','6'],1,'Matemática'],['O que acontece com a água quando congela?',['Vira gelo','Vira fumaça','Desaparece'],0,'Natureza'],['Qual número é primo?',['9','11','15'],1,'Matemática'],['Qual frase demonstra empatia?',['Não me importo','Posso ajudar você?','Saia daqui'],1,'Boas atitudes'],['Quantos centímetros formam um metro?',['10','100','1000'],1,'Medidas'],['Qual destas palavras é um verbo?',['Correr','Azul','Casa'],0,'Português']
 ]
};
let quizLevel='easy',quizDeck=[],quizPos=0,quizCorrect=0;
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function startQuiz(level='easy'){quizLevel=level;document.querySelectorAll('.levelBtn').forEach(b=>b.classList.toggle('on',b.dataset.level===level));quizDeck=shuffle(QUESTIONS[level]).slice(0,10);quizPos=0;quizCorrect=0;renderQuiz()}
function renderQuiz(){const box=document.getElementById('quiz');if(quizPos>=quizDeck.length){const reward=Math.max(1,Math.floor(quizCorrect/3));box.innerHTML=`<div class="quizEnd"><strong>${quizCorrect}/10 acertos 🎉</strong><p class="muted">Rodada concluída sem repetir perguntas.</p><button class="btn" onclick="startQuiz('${quizLevel}')">Nova rodada</button></div>`;addStars(reward,`Escolinha concluída! +${reward} ⭐`);return}const q=quizDeck[quizPos];box.innerHTML=`<div class="quizTop"><span class="quizProgress">Pergunta ${quizPos+1}/10 • ${q[3]}</span><span class="quizProgress">Acertos: ${quizCorrect}</span></div><div class="quiz-q">${q[0]}</div><div class="answers">${q[1].map((x,i)=>`<button class="ans" onclick="answerQuiz(${i})">${x}</button>`).join('')}</div>`}
function answerQuiz(i){const q=quizDeck[quizPos];if(i===q[2]){quizCorrect++;toast('Acertou! ⭐');quizPos++;setTimeout(renderQuiz,250)}else toast('Quase! Tente outra resposta 😊')}

// Coloring
const COLORING=Array.from({length:10},(_,i)=>`assets/coloring/color-${i+1}.webp`);
const PALETTE=['#ff6fae','#ff4f8b','#ff8aa8','#ffd866','#ffbf3f','#f28b4b','#ff6b6b','#a756f5','#7756d8','#5f7bff','#61c9ef','#00bcd4','#67c98e','#00b894','#5cc08a','#8d5a3b','#c97f53','#9ea7ad','#404040','#000000','#ffffff','#d4a5ff','#a3d8ff','#f7b2d9','#b8f2e6','#ffe8a3','#f1c0a8','#caffbf','#ffc6ff','#bde0fe'];
let colorIndex=0,color='#ff6fae',baseTemplate=null,colorHistory=[];
const COLOR_HISTORY_LIMIT=6;
const canvas=document.getElementById('draw');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
function renderColoringGallery(){const g=document.getElementById('coloringGallery');g.innerHTML=COLORING.map((src,i)=>`<button class="templateBtn ${i===colorIndex?'on':''}" onclick="openColoring(${i})"><img src="${src}" alt="Desenho ${i+1}"></button>`).join('');const c=document.getElementById('coloringCountText');if(c)c.textContent=`${COLORING.length} desenhos novos da Elo. Toque em um para abrir em tela cheia.`}
function renderPalette(){const p=document.getElementById('palette');p.innerHTML=PALETTE.map(c=>`<button class="color ${color===c?'on':''}" style="background:${c}" onclick="setColor('${c}')" aria-label="cor"></button>`).join('')}
function setColor(c){color=c;renderPalette();toast('Cor escolhida! Agora toque no desenho 🎨')}
function fitImage(img){const ratio=Math.min(canvas.width/img.width,canvas.height/img.height);const w=img.width*ratio,h=img.height*ratio,x=(canvas.width-w)/2,y=(canvas.height-h)/2;ctx.drawImage(img,x,y,w,h)}
function normalizeTemplate(){const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data;for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/3;if(lum<215){d[i]=d[i+1]=d[i+2]=0;d[i+3]=255}else{d[i]=d[i+1]=d[i+2]=255;d[i+3]=255}}ctx.putImageData(image,0,0)}
function drawBase(){ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);if(baseTemplate)fitImage(baseTemplate);normalizeTemplate();colorHistory=[]}
function chooseColoring(i,showModal=false){colorIndex=i;const img=new Image();img.onload=()=>{baseTemplate=img;drawBase();renderColoringGallery();renderPalette();if(showModal){document.getElementById('coloringModal').classList.remove('hidden');document.body.style.overflow='hidden'}toast('Desenho pronto! Escolha uma cor e toque para pintar. 🖍️')};img.src=COLORING[i]}
function getPointerPos(e){const r=canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-r.left)*(canvas.width/r.width)),y:Math.floor((e.clientY-r.top)*(canvas.height/r.height))}}
function hexToRgb(hex){const c=hex.replace('#','');const n=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function colorMatch(d,i,target,tol=18){return Math.abs(d[i]-target[0])<=tol&&Math.abs(d[i+1]-target[1])<=tol&&Math.abs(d[i+2]-target[2])<=tol&&d[i+3]===target[3]}
function fillAt(x,y){const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data,w=image.width,h=image.height;const start=(y*w+x)*4;const target=[d[start],d[start+1],d[start+2],d[start+3]];if(target[0]<30&&target[1]<30&&target[2]<30)return;const fill=hexToRgb(color);if(Math.abs(target[0]-fill[0])<4&&Math.abs(target[1]-fill[1])<4&&Math.abs(target[2]-fill[2])<4)return;colorHistory.push(ctx.getImageData(0,0,w,h));if(colorHistory.length>COLOR_HISTORY_LIMIT)colorHistory.shift();const matches=(px,py)=>{if(px<0||py<0||px>=w||py>=h)return false;return colorMatch(d,(py*w+px)*4,target)};const paint=(px,py)=>{const i=(py*w+px)*4;d[i]=fill[0];d[i+1]=fill[1];d[i+2]=fill[2];d[i+3]=255};const stack=[[x,y]];while(stack.length){const [sx,sy]=stack.pop();if(!matches(sx,sy))continue;let lx=sx;while(lx>=0&&matches(lx,sy))lx--;lx++;let spanUp=false,spanDown=false;for(let px=lx;px<w&&matches(px,sy);px++){paint(px,sy);if(sy>0){if(matches(px,sy-1)){if(!spanUp){stack.push([px,sy-1]);spanUp=true}}else spanUp=false}if(sy<h-1){if(matches(px,sy+1)){if(!spanDown){stack.push([px,sy+1]);spanDown=true}}else spanDown=false}}}ctx.putImageData(image,0,0)}
canvas.addEventListener('pointerdown',e=>{const p=getPointerPos(e);fillAt(p.x,p.y);e.preventDefault()});
function undoColoring(){if(!colorHistory.length)return toast('Nada para desfazer 😊');ctx.putImageData(colorHistory.pop(),0,0)}
function clearCanvas(){if(baseTemplate)drawBase();else{ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height)}toast('Desenho limpo!')}
function rewardArt(){const key='artReward'+new Date().toDateString();if(localStorage.getItem(key))return toast('Você já ganhou a estrela da pintura hoje 💗');localStorage.setItem(key,'1');addStars(1,'Pintura concluída! ⭐')}
function saveColoring(){const a=document.createElement('a');a.download='colorindo-com-a-elo.png';a.href=canvas.toDataURL('image/png');a.click();toast('Imagem pronta para salvar 💗')}

const ACH=[
 {icon:'⭐',name:'Primeira estrela',ok:()=>stars>=1},
 {icon:'🌈',name:'Exploradora',ok:()=>stars>=10},
 {icon:'👑',name:'Super Elo',ok:()=>stars>=25},
 {icon:'📚',name:'Leitora de Aventuras',ok:()=>readStories.length>=1},
 {icon:'🏆',name:'Mestre das Aventuras',ok:()=>readStories.length>=4},
 {icon:'🎨',name:'Artista do dia',ok:()=>!!localStorage.getItem('artReward'+new Date().toDateString())},
 {icon:'🧠',name:'Craque da Escolinha',ok:()=>stars>=40},
 {icon:'🧩',name:'Mestre do Quebra-cabeça',ok:()=>!!localStorage.getItem('eloPuzzleWon')},
 {icon:'🃏',name:'Mestra da Memória',ok:()=>!!localStorage.getItem('eloMemoryHardWon')},
 {icon:'🦄',name:'Exploradora do Labirinto',ok:()=>!!localStorage.getItem('eloMazeWon')},
 {icon:'🎯',name:'Olho de águia',ok:()=>findRounds>=3},
 {icon:'💗',name:'Missão do dia',ok:()=>!!localStorage.getItem(dailyKey)}
];
function renderBadges(){const unlocked=ACH.filter(x=>x.ok()).length;const html=ACH.map(x=>`<div class="badge ${x.ok()?'on':''}"><span>${x.icon}</span><strong>${x.name}</strong><small>${x.ok()?'Conquistada!':'Continue brincando'}</small></div>`).join('');const all=document.getElementById('allBadges');if(all)all.innerHTML=html;const home=document.getElementById('achievementCountHome');if(home)home.textContent=unlocked;const u=document.getElementById('achievementUnlocked');if(u)u.textContent=unlocked;const t=document.getElementById('achievementTotal');if(t)t.textContent=ACH.length}

renderStars();
renderStoryStrip();
renderLibrary();
renderPlaylists();
startQuiz('easy');
startMemory();
renderPalette();
renderColoringGallery();
chooseColoring(0);
renderBadges();
window.addEventListener('load',()=>setTimeout(()=>{const s=document.getElementById('splash');s.style.opacity='0';setTimeout(()=>s.remove(),450)},700));
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!sessionStorage.getItem('elo-v90-reloaded')){
      sessionStorage.setItem('elo-v90-reloaded','1');
      location.reload();
    }
  });
  navigator.serviceWorker.register('./sw.js?v=9.0',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
}
