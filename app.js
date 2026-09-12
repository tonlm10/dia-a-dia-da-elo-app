const CHANNEL_URL='https://www.youtube.com/@diaadiadaelo';
const MEMBER_URL='https://www.youtube.com/channel/UCBPBaYweoBPjr8XlfOz1dwQ/join';
const PLAYLISTS=[
 {id:'PLhOZycBHbEs6cNunzaW8lPEsXR46fBmq4',title:'Escolinha da Elo | Aprenda Brincando',icon:'📚'},
 {id:'PLhOZycBHbEs48-Z1X_bN6lvUpw4Rosz2I',title:'Ache o Personagem Escondido',icon:'🔎'},
 {id:'PLhOZycBHbEs5VT6AAr2Xiv_teqn03Lwsg',title:'Maratona da Elo | Todos os Vídeos',icon:'🎬'},
 {id:'PLhOZycBHbEs6C_t7GSPeVEEl5aO7dd8gH',title:'Shows, Eventos e Personagens da Elo',icon:'🎉'},
 {id:'PLhOZycBHbEs5D4-Wqa3RNgAZYxDRZqP4i',title:'Momentos que Marcaram a História da Elo',icon:'💗'},
 {id:'PLhOZycBHbEs4EQl6kh96zvbpq9N_Ybxbm',title:'Momentos na Escola e Apresentações da Elo',icon:'🏫'},
 {id:'PLhOZycBHbEs7Zo4Flf2SmadR9MsC4yOYO',title:'Aventuras e Passeios da Elo',icon:'🎡'},
 {id:'PLhOZycBHbEs4LjNfBDJCjhe1E_M7K1oSq',title:'Natal da Elo',icon:'🎄'},
 {id:'PLhOZycBHbEs64afG13roQP2ZnzPx5fXd-',title:'Escolinha, Brincadeiras e Desafios da Elo',icon:'🧩'},
 {id:'PLhOZycBHbEs5vV3X_PACKBO-irNlLhWIF',title:'Lives e Bate-papo',icon:'🎤'},
 {id:'PLhOZycBHbEs7JROD9ymRS9LreZ4MBz0wV',title:'Shorts Divertidos da Elo',icon:'⚡'},
 {id:'PLhOZycBHbEs5yoHE1PgIDLfn08_7rd86u',title:'Cozinha da Elo | Receitas e Diversão',icon:'🍕'},
 {id:'PLhOZycBHbEs6Afo_8He5MhGlLcd9vXjRh',title:'Playlist Especial da Elo',icon:'✨'}
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
function openPanel(id,nav){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.nav===nav));window.scrollTo({top:0,behavior:'smooth'});if(id==='storiesPanel')renderLibrary();if(id==='parentsPanel')renderBadges();if(id==='playPanel'){resetFind(true);startTapGame();startMaze()}if(id==='createPanel'){renderColoringGallery();renderPalette()}}
function openExternal(url){window.open(url,'_blank','noopener')}
function adultGate(cb){const a=Math.floor(Math.random()*6)+4,b=Math.floor(Math.random()*5)+3;const r=prompt(`Área dos responsáveis 🔒
Quanto é ${a} + ${b}?`);if(Number(r)===a+b)cb();else if(r!==null)toast('Resposta incorreta. Peça ajuda a um adulto.')}
function openParents(){adultGate(()=>openPanel('parentsPanel','parents'))}
function openMemberWithGate(){adultGate(()=>openExternal(MEMBER_URL))}

const daily=[['Missão da Elo','Dê 5 pulinhos e faça uma pose engraçada!'],['Missão das cores','Ache 3 coisas cor-de-rosa perto de você.'],['Missão do sorriso','Faça alguém da família dar risada.'],['Missão movimento','Imite um sapinho por 10 segundos.'],['Missão desenho','Pinte um desenho da Elo e mostre para alguém.'],['Missão gentil','Faça uma gentileza para alguém da família.']];
const d=daily[new Date().getDate()%daily.length];
document.getElementById('dailyText').textContent=d[1];
const dailyKey='eloDaily'+new Date().toDateString();
if(localStorage.getItem(dailyKey))document.getElementById('dailyProgress').style.width='100%';
function completeDaily(){if(localStorage.getItem(dailyKey))return toast('A missão de hoje já foi concluída 💗');localStorage.setItem(dailyKey,'1');document.getElementById('dailyProgress').style.width='100%';addStars(2,'Missão concluída! +2 ⭐')}

function renderStoryStrip(){const box=document.getElementById('storyStrip');box.innerHTML=STORIES.map((s,i)=>`<button class="storyCard" onclick="openStory(${i})"><div class="storyThumb" style="background-image:url('assets/stories/${s.id}-cover.webp')"><span class="numBadge">${i+1}</span><span class="heartBadge">${favorites.includes(s.id)?'♥':'♡'}</span></div><div class="storyInfo"><b>${s.title}</b><small>${s.summary}</small></div></button>`).join('')}
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
const FIND={easy:{size:16,time:20,reward:1},medium:{size:12,time:15,reward:2},hard:{size:10,time:10,reward:3}};
const FIND_SCENES=[
 {bg:'linear-gradient(#caecff 0 58%,#bff0b7 58%)',objects:['☁️','🌷','🌳','🏠','🦋','🌼','🌻','🍄','🌿'],sparkles:['⭐','✦','✨','✧']},
 {bg:'linear-gradient(#ccefff 0 55%,#fde6a9 55%)',objects:['☁️','🎈','🪁','🌈','🐥','🌼','🧸','🍭','🍓'],sparkles:['⭐','✦','✨','✧']},
 {bg:'linear-gradient(#d8d1ff 0 58%,#ffdff2 58%)',objects:['☁️','🦄','🎀','🍬','🍩','💜','🌸','🎠','🧁'],sparkles:['⭐','✦','✨','✧']}
];
const findStage=document.getElementById('findStage');
function rand(min,max){return Math.random()*(max-min)+min}
function setFindLevel(level,btn){findLevel=level;document.querySelectorAll('[data-find]').forEach(x=>x.classList.remove('on'));btn.classList.add('on');resetFind(true)}
function buildFindScene(cfg){const scene=FIND_SCENES[Math.floor(Math.random()*FIND_SCENES.length)];findStage.innerHTML='';findStage.style.background=scene.bg;for(let i=0;i<24;i++){const el=document.createElement('div');el.className='obj';el.textContent=scene.objects[Math.floor(Math.random()*scene.objects.length)];el.style.left=rand(2,89)+'%';el.style.top=rand(4,82)+'%';el.style.fontSize=rand(18,36)+'px';el.style.opacity=String(rand(.82,1));findStage.appendChild(el)}for(let i=0;i<20;i++){const el=document.createElement('div');el.className='fake';el.textContent=scene.sparkles[Math.floor(Math.random()*scene.sparkles.length)];el.style.left=rand(2,92)+'%';el.style.top=rand(4,86)+'%';el.style.fontSize=rand(cfg.size-2,cfg.size+5)+'px';findStage.appendChild(el)}const t=document.createElement('button');t.id='target';t.className='target';t.setAttribute('aria-label','estrela escondida');t.innerHTML='<span>⭐</span>';t.style.left=rand(4,90)+'%';t.style.top=rand(6,84)+'%';t.style.setProperty('--star-size',cfg.size+'px');t.dataset.found='0';t.onclick=()=>{if(t.dataset.found==='1')return;t.dataset.found='1';clearInterval(findTimer);findRounds++;document.getElementById('findStatus').textContent='Achou! 🎉';addStars(FIND[findLevel].reward,`Achou! +${FIND[findLevel].reward} ⭐`);setTimeout(()=>resetFind(),850)};findStage.appendChild(t)}
function resetFind(manual=false){clearInterval(findTimer);const cfg=FIND[findLevel];buildFindScene(cfg);findLeft=cfg.time;document.getElementById('findTime').textContent=findLeft+'s';document.getElementById('findStatus').textContent=manual?'Nova estrela escondida!':'Ache a estrela!';findTimer=setInterval(()=>{findLeft--;document.getElementById('findTime').textContent=findLeft+'s';if(findLeft<=0){clearInterval(findTimer);document.getElementById('findStatus').textContent='O tempo acabou!';setTimeout(()=>resetFind(),900)}},1000)}

// Maze game
const MAZES=[
 ['########','#S.....#','#.###..#','#...#..#','###.#.##','#...#..#','#.#...G#','########'],
 ['########','#S#....#','#.#.##.#','#.#....#','#.####.#','#......#','#.####G#','########'],
 ['########','#S.....#','###.##.#','#...##.#','#.####.#','#....#.#','#.##..G#','########'],
 ['########','#S..#..#','#.#.#.##','#.#....#','#.####.#','#......#','##.###G#','########']
];
let mazeMap=[],mazePlayer={x:1,y:1},mazeGoal={x:6,y:6},mazeMoves=0,mazeWon=false,mazeRewarded=false;
function startMaze(){const raw=MAZES[Math.floor(Math.random()*MAZES.length)];mazeMap=raw.map(r=>r.split(''));mazeMoves=0;mazeWon=false;mazeRewarded=false;for(let y=0;y<mazeMap.length;y++){for(let x=0;x<mazeMap[y].length;x++){if(mazeMap[y][x]==='S'){mazePlayer={x,y};mazeMap[y][x]='.'}if(mazeMap[y][x]==='G'){mazeGoal={x,y};mazeMap[y][x]='.'}}}document.getElementById('mazeMoves').textContent='Movimentos: 0';document.getElementById('mazeStatus').textContent='Encontre o caminho encantado!';renderMaze()}
function renderMaze(){const board=document.getElementById('mazeBoard');board.innerHTML='';const openDecor=['⭐','✨','🌸',''];mazeMap.forEach((row,y)=>row.forEach((cell,x)=>{const d=document.createElement('div');const isPlayer=mazePlayer.x===x&&mazePlayer.y===y;const isGoal=mazeGoal.x===x&&mazeGoal.y===y;d.className='mazeCell '+(cell==='#'?'wall':'path')+(isPlayer?' player':'')+(isGoal?' goal':'');if(isPlayer)d.textContent='👧';else if(isGoal)d.textContent='🦄';else if(cell!== '#'){const deco=openDecor[(x*3+y*5)%openDecor.length];d.textContent=deco;if(deco)d.classList.add('sparkle')}board.appendChild(d)}))}
function moveMaze(dx,dy){if(!mazeMap.length||mazeWon)return;const nx=mazePlayer.x+dx,ny=mazePlayer.y+dy;if(ny<0||ny>=mazeMap.length||nx<0||nx>=mazeMap[0].length)return;if(mazeMap[ny][nx]==='#'){toast('Ops! Por aqui tem uma parede 😊');return}mazePlayer={x:nx,y:ny};mazeMoves++;document.getElementById('mazeMoves').textContent='Movimentos: '+mazeMoves;renderMaze();if(nx===mazeGoal.x&&ny===mazeGoal.y){mazeWon=true;document.getElementById('mazeStatus').textContent='Elo chegou ao unicórnio! 🦄✨';if(!mazeRewarded){mazeRewarded=true;addStars(2,'Labirinto concluído! +2 ⭐')}}else{document.getElementById('mazeStatus').textContent='Continue! Você está chegando perto.'}}
let mazeTouchStart=null;
const mazeBoard=document.getElementById('mazeBoard');
mazeBoard.addEventListener('touchstart',e=>{const t=e.changedTouches[0];mazeTouchStart={x:t.clientX,y:t.clientY}},{passive:true});
mazeBoard.addEventListener('touchend',e=>{if(!mazeTouchStart)return;const t=e.changedTouches[0],dx=t.clientX-mazeTouchStart.x,dy=t.clientY-mazeTouchStart.y;mazeTouchStart=null;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;if(Math.abs(dx)>Math.abs(dy)){moveMaze(dx>0?1:-1,0)}else{moveMaze(0,dy>0?1:-1)}},{passive:true});
window.addEventListener('keydown',e=>{if(document.getElementById('playPanel').classList.contains('active')){if(e.key==='ArrowUp')moveMaze(0,-1);if(e.key==='ArrowDown')moveMaze(0,1);if(e.key==='ArrowLeft')moveMaze(-1,0);if(e.key==='ArrowRight')moveMaze(1,0)}});

// Memory game
const emojis=['🐰','🦄','🌈','🍓','🐰','🦄','🌈','🍓','⭐','🎨','⭐','🎨'];
let memoryOpen=[],memoryLock=false,matched=0;
function startMemory(){const cards=[...emojis].sort(()=>Math.random()-.5),box=document.getElementById('memory');box.innerHTML='';memoryOpen=[];matched=0;cards.forEach((e,i)=>{const b=document.createElement('button');b.className='mem';b.textContent='❓';b.dataset.e=e;b.dataset.i=i;b.onclick=()=>flip(b);box.appendChild(b)})}
function flip(b){if(memoryLock||b.classList.contains('done')||b.classList.contains('open'))return;b.classList.add('open');b.textContent=b.dataset.e;memoryOpen.push(b);if(memoryOpen.length===2){memoryLock=true;setTimeout(()=>{const[a,c]=memoryOpen;if(a.dataset.e===c.dataset.e){a.classList.add('done');c.classList.add('done');matched+=2;if(matched===emojis.length)addStars(3,'Memória completa! +3 ⭐')}else{a.classList.remove('open');c.classList.remove('open');a.textContent='❓';c.textContent='❓'}memoryOpen=[];memoryLock=false},600)}}

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
const COLORING=Array.from({length:20},(_,i)=>`assets/coloring/color-${i+1}.webp`);
const PALETTE=['#ff6fae','#ff4f8b','#ff8aa8','#ffd866','#ffbf3f','#f28b4b','#ff6b6b','#a756f5','#7756d8','#5f7bff','#61c9ef','#00bcd4','#67c98e','#00b894','#5cc08a','#8d5a3b','#c97f53','#9ea7ad','#404040','#000000','#ffffff','#d4a5ff','#a3d8ff','#f7b2d9','#b8f2e6','#ffe8a3','#f1c0a8','#caffbf','#ffc6ff','#bde0fe'];
let colorIndex=0,color='#ff6fae',baseTemplate=null,colorHistory=[];
const canvas=document.getElementById('draw');
const ctx=canvas.getContext('2d',{willReadFrequently:true});
function renderColoringGallery(){const g=document.getElementById('coloringGallery');g.innerHTML=COLORING.map((src,i)=>`<button class="templateBtn ${i===colorIndex?'on':''}" onclick="chooseColoring(${i})"><img src="${src}" alt="Desenho ${i+1}"></button>`).join('');const c=document.getElementById('coloringCountText');if(c)c.textContent=`Agora são ${COLORING.length} desenhos em preto e branco. Escolha um e toque na área que você quer colorir.`}
function renderPalette(){const p=document.getElementById('palette');p.innerHTML=PALETTE.map(c=>`<button class="color ${color===c?'on':''}" style="background:${c}" onclick="setColor('${c}')" aria-label="cor"></button>`).join('')}
function setColor(c){color=c;renderPalette();toast('Cor escolhida! Agora toque no desenho 🎨')}
function fitImage(img){const ratio=Math.min(canvas.width/img.width,canvas.height/img.height);const w=img.width*ratio,h=img.height*ratio,x=(canvas.width-w)/2,y=(canvas.height-h)/2;ctx.drawImage(img,x,y,w,h)}
function normalizeTemplate(){const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data;for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/3;if(lum<215){d[i]=d[i+1]=d[i+2]=0;d[i+3]=255}else{d[i]=d[i+1]=d[i+2]=255;d[i+3]=255}}ctx.putImageData(image,0,0)}
function drawBase(){ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);if(baseTemplate)fitImage(baseTemplate);normalizeTemplate();colorHistory=[]}
function chooseColoring(i){colorIndex=i;const img=new Image();img.onload=()=>{baseTemplate=img;drawBase();renderColoringGallery();toast('Novo desenho escolhido! Toque em uma área para colorir. 🖍️')};img.src=COLORING[i]}
function getPointerPos(e){const r=canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-r.left)*(canvas.width/r.width)),y:Math.floor((e.clientY-r.top)*(canvas.height/r.height))}}
function hexToRgb(hex){const c=hex.replace('#','');const n=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function colorMatch(d,i,target,tol=18){return Math.abs(d[i]-target[0])<=tol&&Math.abs(d[i+1]-target[1])<=tol&&Math.abs(d[i+2]-target[2])<=tol&&d[i+3]===target[3]}
function fillAt(x,y){const image=ctx.getImageData(0,0,canvas.width,canvas.height),d=image.data,w=image.width,h=image.height;const start=(y*w+x)*4;const target=[d[start],d[start+1],d[start+2],d[start+3]];if(target[0]<30&&target[1]<30&&target[2]<30)return;const fill=hexToRgb(color);if(Math.abs(target[0]-fill[0])<4&&Math.abs(target[1]-fill[1])<4&&Math.abs(target[2]-fill[2])<4)return;colorHistory.push(ctx.getImageData(0,0,canvas.width,canvas.height));const stack=[[x,y]];while(stack.length){const [cx,cy]=stack.pop();if(cx<0||cy<0||cx>=w||cy>=h)continue;const idx=(cy*w+cx)*4;if(!colorMatch(d,idx,target))continue;d[idx]=fill[0];d[idx+1]=fill[1];d[idx+2]=fill[2];d[idx+3]=255;stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1])}ctx.putImageData(image,0,0)}
canvas.addEventListener('pointerdown',e=>{const p=getPointerPos(e);fillAt(p.x,p.y);e.preventDefault()});
function undoColoring(){if(!colorHistory.length)return toast('Nada para desfazer 😊');ctx.putImageData(colorHistory.pop(),0,0)}
function clearCanvas(){if(baseTemplate)drawBase();else{ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height)}toast('Desenho limpo!')}
function rewardArt(){const key='artReward'+new Date().toDateString();if(localStorage.getItem(key))return toast('Você já ganhou a estrela da pintura hoje 💗');localStorage.setItem(key,'1');addStars(1,'Pintura concluída! ⭐')}
function saveColoring(){const a=document.createElement('a');a.download='colorindo-com-a-elo.png';a.href=canvas.toDataURL('image/png');a.click();toast('Imagem pronta para salvar 💗')}

const ACH=[
 {icon:'⭐',name:'Primeira estrela',ok:()=>stars>=1},
 {icon:'🌈',name:'Explorador',ok:()=>stars>=10},
 {icon:'👑',name:'Super Elo',ok:()=>stars>=25},
 {icon:'📚',name:'Leitor de Aventuras',ok:()=>readStories.length>=1},
 {icon:'🏆',name:'Mestre das Aventuras',ok:()=>readStories.length>=4},
 {icon:'🎨',name:'Artista do dia',ok:()=>!!localStorage.getItem('artReward'+new Date().toDateString())},
 {icon:'🧠',name:'Craque da Escolinha',ok:()=>stars>=40},
 {icon:'🎯',name:'Olho de águia',ok:()=>findRounds>=3}
];
function renderBadges(){const html=ACH.map(x=>`<div class="badge ${x.ok()?'on':''}"><span>${x.icon}</span><strong>${x.name}</strong><small>${x.ok()?'Conquistada!':'Continue brincando'}</small></div>`).join('');document.getElementById('badgePreview').innerHTML=html;document.getElementById('allBadges').innerHTML=html}

renderStars();
renderStoryStrip();
renderLibrary();
renderPlaylists();
startQuiz('easy');
startMemory();
resetFind();
startTapGame();
startMaze();
renderPalette();
renderColoringGallery();
chooseColoring(0);
renderBadges();
window.addEventListener('load',()=>setTimeout(()=>{const s=document.getElementById('splash');s.style.opacity='0';setTimeout(()=>s.remove(),450)},700));
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!sessionStorage.getItem('elo-v61-reloaded')){
      sessionStorage.setItem('elo-v61-reloaded','1');
      location.reload();
    }
  });
  navigator.serviceWorker.register('./sw.js?v=6.1',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
}
