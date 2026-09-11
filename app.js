const CHANNEL_URL='https://www.youtube.com/@diaadiadaelo';
const MEMBER_URL='https://www.youtube.com/channel/UCBPBaYweoBPjr8XlfOz1dwQ/join';
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
function openPanel(id,nav){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.nav===nav));window.scrollTo({top:0,behavior:'smooth'});if(id==='storiesPanel')renderLibrary();if(id==='parentsPanel')renderBadges()}
function openExternal(url){window.open(url,'_blank','noopener')}
function adultGate(cb){const a=Math.floor(Math.random()*6)+4,b=Math.floor(Math.random()*5)+3;const r=prompt(`Área dos responsáveis 🔒\nQuanto é ${a} + ${b}?`);if(Number(r)===a+b)cb();else if(r!==null)toast('Resposta incorreta. Peça ajuda a um adulto.')}
function openParents(){adultGate(()=>openPanel('parentsPanel','parents'))}
function openMemberWithGate(){adultGate(()=>openExternal(MEMBER_URL))}

const daily=[['Missão da Elo','Dê 5 pulinhos e faça uma pose engraçada!'],['Missão das cores','Ache 3 coisas cor-de-rosa perto de você.'],['Missão do sorriso','Faça alguém da família dar risada.'],['Missão movimento','Imite um sapinho por 10 segundos.'],['Missão desenho','Desenhe um coração e mostre para alguém.']];
const d=daily[new Date().getDate()%daily.length];document.getElementById('dailyText').textContent=d[1];const dailyKey='eloDaily'+new Date().toDateString();if(localStorage.getItem(dailyKey))document.getElementById('dailyProgress').style.width='100%';
function completeDaily(){if(localStorage.getItem(dailyKey))return toast('A missão de hoje já foi concluída 💗');localStorage.setItem(dailyKey,'1');document.getElementById('dailyProgress').style.width='100%';addStars(2,'Missão concluída! +2 ⭐')}

function renderStoryStrip(){const box=document.getElementById('storyStrip');box.innerHTML=STORIES.map((s,i)=>`<button class="storyCard" onclick="openStory(${i})"><div class="storyThumb" style="background-image:url('assets/stories/${s.id}-cover.webp')"><span class="numBadge">${i+1}</span><span class="heartBadge">${favorites.includes(s.id)?'♥':'♡'}</span></div><div class="storyInfo"><b>${s.title}</b><small>${s.summary}</small></div></button>`).join('')}
function renderLibrary(){const box=document.getElementById('libraryGrid');box.innerHTML=STORIES.map((s,i)=>`<article class="libCard"><div class="libCover" style="background-image:url('assets/stories/${s.id}-cover.webp')"><span class="numBadge">${i+1}</span><button class="fav ${favorites.includes(s.id)?'on':''}" onclick="toggleFav('${s.id}',event)">${favorites.includes(s.id)?'♥':'♡'}</button></div><div class="libBody"><h3>${s.title}</h3><p>${s.summary}</p><div class="libMeta"><small>📖 ${s.pages} páginas ${readStories.includes(s.id)?'• ✅ lida':''}</small><button class="btn" onclick="openStory(${i})">Ler</button></div></div></article>`).join('')}
function toggleFav(id,e){e.stopPropagation();favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem('eloFavStories',JSON.stringify(favorites));renderLibrary();renderStoryStrip();toast(favorites.includes(id)?'Adicionada aos favoritos 💗':'Removida dos favoritos')}
function openStory(i){currentStory=i;currentPage=0;openPanel('readerPanel','stories');renderReader()}
function renderReader(){const s=STORIES[currentStory],page=document.getElementById('storyPage');document.getElementById('readerTitle').textContent=s.title;page.style.backgroundImage=`url('assets/stories/${s.id}.webp')`;page.style.backgroundPosition=`center ${currentPage*(100/(s.pages-1))}%`;document.getElementById('pageCounter').textContent=`Página ${currentPage+1} de ${s.pages}`;document.getElementById('readerMoral').textContent=currentPage===s.pages-1?'✨ '+s.moral:'';document.getElementById('readerDots').innerHTML=Array.from({length:s.pages},(_,i)=>`<i class="dot ${i===currentPage?'on':''}"></i>`).join('');if(currentPage===s.pages-1&&!readStories.includes(s.id)){readStories.push(s.id);localStorage.setItem('eloReadStories',JSON.stringify(readStories));addStars(3,'História concluída! +3 ⭐');renderLibrary()}}
function nextPage(){const s=STORIES[currentStory];if(currentPage<s.pages-1){currentPage++;renderReader()}else toast('Fim da história 💗')}
function prevPage(){if(currentPage>0){currentPage--;renderReader()}else toast('Você está na primeira página')}
let touchX=0;document.getElementById('storyPage').addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});document.getElementById('storyPage').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(dx<-45)nextPage();if(dx>45)prevPage()},{passive:true});

function resetFind(){const t=document.getElementById('target');t.style.left=(8+Math.random()*78)+'%';t.style.top=(12+Math.random()*70)+'%';t.dataset.found='0';t.style.opacity='.58'}
document.getElementById('target').onclick=()=>{const t=document.getElementById('target');if(t.dataset.found==='1')return;t.dataset.found='1';t.style.opacity='1';addStars(2,'Achou! +2 ⭐')};
const emojis=['🐰','🦄','🌈','🍓','🐰','🦄','🌈','🍓','⭐','🎨','⭐','🎨'];let memoryOpen=[],memoryLock=false,matched=0;
function startMemory(){const cards=[...emojis].sort(()=>Math.random()-.5),box=document.getElementById('memory');box.innerHTML='';memoryOpen=[];matched=0;cards.forEach((e,i)=>{const b=document.createElement('button');b.className='mem';b.textContent='❓';b.dataset.e=e;b.dataset.i=i;b.onclick=()=>flip(b);box.appendChild(b)})}
function flip(b){if(memoryLock||b.classList.contains('done')||b.classList.contains('open'))return;b.classList.add('open');b.textContent=b.dataset.e;memoryOpen.push(b);if(memoryOpen.length===2){memoryLock=true;setTimeout(()=>{const[a,c]=memoryOpen;if(a.dataset.e===c.dataset.e){a.classList.add('done');c.classList.add('done');matched+=2;if(matched===emojis.length)addStars(3,'Memória completa! +3 ⭐')}else{a.classList.remove('open');c.classList.remove('open');a.textContent='❓';c.textContent='❓'}memoryOpen=[];memoryLock=false},600)}}
let tapTarget=1;function newTapGame(){tapTarget=Math.floor(Math.random()*9)+1;document.getElementById('tapPrompt').textContent=`Toque no número ${tapTarget}`;const nums=Array.from({length:9},(_,i)=>i+1).sort(()=>Math.random()-.5);document.getElementById('tapGame').innerHTML=nums.map(n=>`<button class="tapNum" onclick="tapAnswer(${n})">${n}</button>`).join('')}
function tapAnswer(n){if(n===tapTarget){addStars(1,'Muito bem! ⭐');newTapGame()}else toast('Ops! Procure o número pedido 😊')}

const questions=[{q:'Qual animal faz “miau”?',a:['Cachorro','Gato','Pato'],c:1},{q:'Qual é a cor do sol nos desenhos?',a:['Amarelo','Roxo','Preto'],c:0},{q:'Quanto é 2 + 2?',a:['3','4','5'],c:1},{q:'Qual destes vive na água?',a:['Peixe','Leão','Galinha'],c:0},{q:'Qual letra começa a palavra ELO?',a:['A','E','O'],c:1},{q:'Quantos dedos temos em uma mão?',a:['3','5','8'],c:1}];let qi=0;
function renderQuiz(){const q=questions[qi%questions.length];document.getElementById('quiz').innerHTML=`<div class="quiz-q">${q.q}</div><div class="answers">${q.a.map((x,i)=>`<button class="ans" onclick="answerQuiz(${i})">${x}</button>`).join('')}</div>`}
function answerQuiz(i){const q=questions[qi%questions.length];if(i===q.c){addStars(1,'Acertou! ⭐');qi++;renderQuiz()}else toast('Quase! Tente outra resposta 😊')}
function miniAnswer(n){if(n===5)addStars(1,'Isso! Depois do 4 vem o 5 ⭐');else toast('Tente novamente 😊')}

const canvas=document.getElementById('draw'),ctx=canvas.getContext('2d');let drawing=false,color='#ff6fae';ctx.lineWidth=12;ctx.lineCap='round';ctx.lineJoin='round';
function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*(canvas.width/r.width),y:(p.clientY-r.top)*(canvas.height/r.height)}}function down(e){drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}function move(e){if(!drawing)return;const p=pos(e);ctx.strokeStyle=color;ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}function up(){drawing=false}
canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',up);canvas.addEventListener('touchstart',down,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',up);document.querySelectorAll('.color').forEach(b=>b.onclick=()=>{color=b.dataset.c;toast('Cor escolhida!')});function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height)}function rewardArt(){const key='artReward'+new Date().toDateString();if(localStorage.getItem(key))return toast('Você já ganhou a estrela do desenho hoje 💗');localStorage.setItem(key,'1');addStars(1,'Arte concluída! ⭐')}

const ACH=[{icon:'⭐',name:'Primeira estrela',ok:()=>stars>=1},{icon:'🌈',name:'Explorador',ok:()=>stars>=10},{icon:'👑',name:'Super Elo',ok:()=>stars>=25},{icon:'📚',name:'Leitor de Aventuras',ok:()=>readStories.length>=1},{icon:'🏆',name:'Mestre das Aventuras',ok:()=>readStories.length>=4},{icon:'🎨',name:'Artista do dia',ok:()=>!!localStorage.getItem('artReward'+new Date().toDateString())}];
function renderBadges(){const html=ACH.map(x=>`<div class="badge ${x.ok()?'on':''}"><span>${x.icon}</span><strong>${x.name}</strong><small>${x.ok()?'Conquistada!':'Continue brincando'}</small></div>`).join('');document.getElementById('badgePreview').innerHTML=html;document.getElementById('allBadges').innerHTML=html}

renderStars();renderStoryStrip();renderLibrary();renderQuiz();startMemory();resetFind();newTapGame();renderBadges();
window.addEventListener('load',()=>setTimeout(()=>{const s=document.getElementById('splash');s.style.opacity='0';setTimeout(()=>s.remove(),450)},900));
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
