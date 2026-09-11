const CHANNEL_URL = 'https://www.youtube.com/@diaadiadaelo';
// Troque/adicione aqui os IDs dos vídeos do canal. Ex.: https://youtu.be/ABC123 -> id: 'ABC123'
const VIDEOS = [
  // { title: 'Aventura da Elo', id: 'COLOQUE_O_ID_AQUI' },
];

let stars = Number(localStorage.getItem('eloStars') || 0);
const starCount = document.getElementById('starCount');
function renderStars(){ starCount.textContent = stars; }
function addStars(n=1,msg='Você ganhou uma estrelinha! ⭐'){ stars += n; localStorage.setItem('eloStars',stars); renderStars(); toast(msg); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); }

function openPanel(id, nav){ document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); document.querySelectorAll('.navbtn').forEach(b=>b.classList.toggle('active',b.dataset.nav===nav)); scrollTo({top:0,behavior:'smooth'}); }

function parentGate(){
  const a = Math.floor(Math.random()*5)+3, b = Math.floor(Math.random()*4)+2;
  const r = prompt(`Área dos responsáveis 🔒\nQuanto é ${a} + ${b}?`);
  if(Number(r)===a+b) window.open(CHANNEL_URL,'_blank','noopener'); else if(r!==null) toast('Resposta incorreta. Peça ajuda a um adulto.');
}

function renderVideos(){
  const el=document.getElementById('videoList');
  if(!VIDEOS.length){ el.innerHTML='<div class="video"><div><div style="font-size:40px">▶️</div><small>Os vídeos do canal serão adicionados aqui.</small></div></div>'; return; }
  el.innerHTML=VIDEOS.map(v=>`<div style="margin:12px 0"><b>${v.title}</b><iframe title="${v.title}" style="width:100%;aspect-ratio:16/9;border:0;border-radius:18px;margin-top:8px" src="https://www.youtube-nocookie.com/embed/${v.id}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`).join('');
}

const daily = [
  ['Missão da Elo','Dê 5 pulinhos e faça uma pose engraçada!'],
  ['Missão das cores','Ache 3 coisas cor-de-rosa perto de você.'],
  ['Missão do sorriso','Faça alguém da família dar risada.'],
  ['Missão movimento','Imite um sapinho por 10 segundos.'],
  ['Missão desenho','Desenhe um coração e mostre para alguém.']
];
const d=daily[new Date().getDate()%daily.length]; document.getElementById('dailyTitle').textContent=d[0]; document.getElementById('dailyText').textContent=d[1];
function completeDaily(){ const key='eloDaily'+new Date().toDateString(); if(localStorage.getItem(key)) return toast('A missão de hoje já foi concluída 💗'); localStorage.setItem(key,'1'); addStars(2,'Missão concluída! +2 ⭐'); }

function resetFind(){ const t=document.getElementById('target'); t.style.left=(8+Math.random()*78)+'%'; t.style.top=(12+Math.random()*70)+'%'; t.dataset.found='0'; t.style.opacity='.58'; }
document.getElementById('target').onclick=()=>{ const t=document.getElementById('target'); if(t.dataset.found==='1') return; t.dataset.found='1'; t.style.opacity='1'; addStars(2,'Achou! +2 ⭐'); };

const emojis=['🐰','🦄','🌈','🍓','🐰','🦄','🌈','🍓']; let memoryOpen=[],memoryLock=false,matched=0;
function startMemory(){ const cards=[...emojis].sort(()=>Math.random()-.5); const box=document.getElementById('memory'); box.innerHTML=''; memoryOpen=[];matched=0; cards.forEach((e,i)=>{const b=document.createElement('button'); b.className='mem'; b.textContent='❓'; b.dataset.e=e;b.dataset.i=i;b.onclick=()=>flip(b);box.appendChild(b)}); }
function flip(b){ if(memoryLock||b.classList.contains('done')||b.classList.contains('open')) return; b.classList.add('open');b.textContent=b.dataset.e;memoryOpen.push(b); if(memoryOpen.length===2){memoryLock=true;setTimeout(()=>{const[a,c]=memoryOpen;if(a.dataset.e===c.dataset.e){a.classList.add('done');c.classList.add('done');matched+=2;if(matched===emojis.length)addStars(3,'Memória completa! +3 ⭐')}else{a.classList.remove('open');c.classList.remove('open');a.textContent='❓';c.textContent='❓'}memoryOpen=[];memoryLock=false},650)}}

const questions=[
  {q:'Qual animal faz “miau”?',a:['Cachorro','Gato','Pato'],c:1},
  {q:'Qual é a cor do sol nos desenhos?',a:['Amarelo','Roxo','Preto'],c:0},
  {q:'Quanto é 2 + 2?',a:['3','4','5'],c:1},
  {q:'Qual destes vive na água?',a:['Peixe','Leão','Galinha'],c:0}
]; let qi=0;
function renderQuiz(){ const q=questions[qi%questions.length]; document.getElementById('quiz').innerHTML=`<div class="quiz-q">${q.q}</div><div class="answers">${q.a.map((x,i)=>`<button class="ans" onclick="answerQuiz(${i})">${x}</button>`).join('')}</div>`; }
function answerQuiz(i){ const q=questions[qi%questions.length]; if(i===q.c){addStars(1,'Acertou! ⭐');qi++;renderQuiz()}else toast('Quase! Tente outra resposta 😊'); }
function miniAnswer(n){ if(n===5)addStars(1,'Isso! Depois do 4 vem o 5 ⭐'); else toast('Tente novamente 😊'); }

const canvas=document.getElementById('draw'),ctx=canvas.getContext('2d'); let drawing=false,color='#ff6fae';ctx.lineWidth=12;ctx.lineCap='round';ctx.lineJoin='round';
function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*(canvas.width/r.width),y:(p.clientY-r.top)*(canvas.height/r.height)}}
function down(e){drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}
function move(e){if(!drawing)return;const p=pos(e);ctx.strokeStyle=color;ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()} function up(){drawing=false}
canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',up);canvas.addEventListener('touchstart',down,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',up);
document.querySelectorAll('.color').forEach(b=>b.onclick=()=>{color=b.dataset.c;toast('Cor escolhida!')}); function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height)}
function rewardArt(){const key='artReward'+new Date().toDateString();if(localStorage.getItem(key))return toast('Você já ganhou a estrela do desenho hoje 💗');localStorage.setItem(key,'1');addStars(1,'Arte concluída! ⭐')}

renderStars();renderVideos();renderQuiz();startMemory();resetFind();
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
