(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#world'),ctx=canvas.getContext('2d'),battleCanvas=$('#battleArt'),bctx=battleCanvas.getContext('2d');
const TILE=48,SAVE_KEY='eloRpgSaveV1',MEDAL_KEY='eloRpgMedals';
const input={up:false,down:false,left:false,right:false};
let raf=0,last=0,toastTimer=0,dialogCb=null,battle=null,currentShop='';

const RPG_MEDALS=[
 {id:'first-step',icon:'👣',name:'Primeiro Passo',desc:'Comece a aventura.'},
 {id:'home-explorer',icon:'🏠',name:'Casa Doce Casa',desc:'Explore os cantinhos da casa.'},
 {id:'tv-fan',icon:'📺',name:'Fã da Elo',desc:'Ligue a TV da casa.'},
 {id:'good-meal',icon:'🍎',name:'Bom Apetite',desc:'Coma na cozinha.'},
 {id:'rested',icon:'🌙',name:'Soninho Restaurador',desc:'Durma e recupere as energias.'},
 {id:'first-chat',icon:'💬',name:'Primeira Conversa',desc:'Converse com um personagem.'},
 {id:'social',icon:'🤝',name:'Amiga da Cidade',desc:'Converse com 5 personagens diferentes.'},
 {id:'quest',icon:'📜',name:'Primeira Missão',desc:'Receba sua primeira missão.'},
 {id:'first-win',icon:'✨',name:'Primeira Vitória',desc:'Vença sua primeira batalha mágica.'},
 {id:'level2',icon:'🌟',name:'Ficando Mais Forte',desc:'Chegue ao nível 2.'},
 {id:'level5',icon:'👑',name:'Heroína Experiente',desc:'Chegue ao nível 5.'},
 {id:'shopper',icon:'🛍️',name:'Primeira Compra',desc:'Compre um item.'},
 {id:'stylish',icon:'👗',name:'Elo Estilosa',desc:'Equipe uma roupa especial.'},
 {id:'explorer',icon:'🗺️',name:'Exploradora',desc:'Descubra 4 lugares.'},
 {id:'fighter10',icon:'👾',name:'Protetora do Reino',desc:'Vença 10 inimigos.'},
 {id:'rich',icon:'🪙',name:'Cofrinho Cheio',desc:'Tenha 100 moedas.'},
 {id:'potion',icon:'🧪',name:'Preparada',desc:'Use uma poção.'},
 {id:'chapter1',icon:'🏆',name:'Guardiã da Primeira Estrela',desc:'Conclua o Capítulo 1.'}
];

const OUTFITS={
 starter:{name:'Look da Elo',icon:'🎀',price:0,desc:'Roupa inicial.',atk:0,def:0,mag:0,spd:0,color:'#ff7fb4',owned:true},
 courage:{name:'Jaqueta Coragem',icon:'🧥',price:45,desc:'+3 Defesa',atk:0,def:3,mag:0,spd:0,color:'#77cfe7'},
 magic:{name:'Vestido Estelar',icon:'👗',price:55,desc:'+3 Magia',atk:0,def:0,mag:3,spd:0,color:'#a875e6'},
 rainbow:{name:'Tênis Arco-Íris',icon:'👟',price:50,desc:'+2 Velocidade',atk:0,def:0,mag:0,spd:2,color:'#ff7fb4'},
 brave:{name:'Conjunto Aventureira',icon:'🧢',price:70,desc:'+2 Ataque e +1 Defesa',atk:2,def:1,mag:0,spd:0,color:'#f39b5f'}
};
const ITEMS={
 potion:{name:'Poção Rosa',icon:'🧪',price:10,desc:'Recupera 20 de energia.',heal:20},
 tea:{name:'Chá Mágico',icon:'☕',price:12,desc:'Recupera 8 de magia.',mp:8},
 apple:{name:'Maçã Dourada',icon:'🍎',price:20,desc:'Recupera toda a energia.',full:true}
};
const ENEMIES={
 slime:{name:'Gelatina Brilhante',hp:18,atk:4,def:1,xp:12,coins:7,color:'#7ee1cf'},
 ghost:{name:'Fantasminha Travesso',hp:24,atk:5,def:2,xp:16,coins:9,color:'#c4a7f7'},
 puff:{name:'Nuvem Sapeca',hp:30,atk:6,def:2,xp:22,coins:12,color:'#a98ddf'},
 boss:{name:'Sombra Nublada',hp:95,atk:9,def:3,xp:90,coins:55,color:'#6e58a8',boss:true}
};

const state={
 started:false,map:'home',x:8*TILE,y:8*TILE,dir:'down',level:1,xp:0,nextXp:30,hp:30,maxHp:30,mp:12,maxMp:12,atk:6,def:2,mag:5,spd:4,coins:15,
 outfit:'starter',ownedOutfits:['starter'],inventory:{potion:1,tea:0,apple:0},quest:0,starCrystals:0,defeated:0,chapterComplete:false,discovered:['home'],talked:[],flags:{},medals:[],removedEnemies:{},lastSave:0
};

const maps={
 home:{name:'Casa da Elo',w:18,h:12,bg:'#f7d8e7',floor:'#f7eadf',walls:[],objects:[],npcs:[],enemies:[]},
 city:{name:'Vila das Estrelas',w:40,h:27,bg:'#8ed47b',floor:'#d7bd89',walls:[],objects:[],npcs:[],enemies:[]},
 meadow:{name:'Campina Encantada',w:46,h:30,bg:'#87d77e',floor:'#97de89',walls:[],objects:[],npcs:[],enemies:[]},
 cave:{name:'Caverna do Brilho',w:30,h:22,bg:'#5f5278',floor:'#756a8a',walls:[],objects:[],npcs:[],enemies:[]}
};

function rect(x,y,w,h){return{x,y,w,h}}
function addObj(map,type,x,y,w,h,extra={}){maps[map].objects.push({type,x,y,w,h,...extra})}
function addNpc(map,id,name,x,y,emoji,lines){maps[map].npcs.push({id,name,x,y,w:34,h:44,emoji,lines})}
function addEnemy(map,id,type,x,y){maps[map].enemies.push({id,type,x,y,w:38,h:38,homeX:x,homeY:y,t:Math.random()*10})}

function buildWorld(){
 const h=maps.home;
 h.walls=[rect(0,0,h.w*TILE,30),rect(0,0,30,h.h*TILE),rect(h.w*TILE-30,0,30,h.h*TILE),rect(0,h.h*TILE-30,7*TILE,30),rect(10*TILE,h.h*TILE-30,8*TILE,30)];
 addObj('home','bed',1.3*TILE,1.5*TILE,2.3*TILE,1.6*TILE,{label:'Quarto da Elo'});
 addObj('home','tv',11.8*TILE,1.2*TILE,1.6*TILE,.65*TILE,{label:'TV'});addObj('home','sofa',10.4*TILE,2.5*TILE,3.4*TILE,1*TILE);
 addObj('home','table',4.9*TILE,2.2*TILE,2.4*TILE,1.5*TILE);addObj('home','fridge',14.7*TILE,5.7*TILE,.9*TILE,1.4*TILE,{label:'Cozinha'});addObj('home','stove',13.4*TILE,6.1*TILE,1*TILE,.9*TILE,{label:'Cozinha'});
 addObj('home','closet',2.1*TILE,6*TILE,1.5*TILE,1.4*TILE,{label:'Guarda-roupa'});addObj('home','door',7*TILE,10.75*TILE,3*TILE,.6*TILE,{to:'city',spawn:{x:6.5*TILE,y:19.5*TILE}});
 addObj('home','rug',6*TILE,5*TILE,4*TILE,2.4*TILE);

 const c=maps.city;
 // outer water/tree boundaries
 for(let i=0;i<c.w;i++){addObj('city','tree',i*TILE,0,TILE,TILE);addObj('city','tree',i*TILE,(c.h-1)*TILE,TILE,TILE)}
 for(let j=1;j<c.h-1;j++){addObj('city','tree',0,j*TILE,TILE,TILE);addObj('city','tree',(c.w-1)*TILE,j*TILE,TILE,TILE)}
 // buildings
 addBuilding('city','Casa da Elo',4,14,6,6,'houseDoor',{to:'home',spawn:{x:8*TILE,y:9*TILE}},'#ffd4e5');
 addBuilding('city','Pousada Lua',14,4,7,6,'innDoor',{shop:'inn'},'#cbb9ff');
 addBuilding('city','Loja Estrelinha',25,4,7,6,'itemDoor',{shop:'items'},'#a7e8d1');
 addBuilding('city','Boutique Arco-Íris',26,15,8,6,'clothesDoor',{shop:'clothes'},'#ffd5a6');
 addBuilding('city','Casa da Cidade',14,15,8,7,'hallDoor',{npcDoor:'guardian'},'#f9e7a8');
 addObj('city','fountain',9*TILE,7*TILE,3*TILE,3*TILE,{label:'Fonte das Estrelas'});
 addObj('city','sign',18.6*TILE,23.2*TILE,.7*TILE,.7*TILE,{label:'Saída para a Campina'});
 addObj('city','transition',16*TILE,25*TILE,7*TILE,TILE,{to:'meadow',spawn:{x:21*TILE,y:2.2*TILE}});
 addNpc('city','sofia','Sofia',8*TILE,12*TILE,'👧',['Oi, Elo! A cidade está tão quieta sem o brilho das estrelas.','Dizem que algumas luzes caíram na Campina Encantada.']);
 addNpc('city','lume','Sr. Lume',28*TILE,11.7*TILE,'🧑‍🔧',['Bem-vinda, Elo! Sempre tenha uma poção na bolsa antes de explorar.']);
 addNpc('city','lia','Lia',32*TILE,22*TILE,'👩‍🎨',['As roupas mágicas não são só bonitas: cada uma deixa você melhor em uma habilidade!']);
 addNpc('city','nina','Nina',4.8*TILE,8*TILE,'👧',['Eu vi um clarão vindo da caverna ontem à noite!']);
 addNpc('city','guardian','Guardião Sol',18*TILE,13.3*TILE,'🧙',['Elo, ainda bem que você veio! Precisamos da sua ajuda.']);

 const m=maps.meadow;
 for(let i=0;i<m.w;i++){addObj('meadow','tree',i*TILE,0,TILE,TILE);addObj('meadow','tree',i*TILE,(m.h-1)*TILE,TILE,TILE)}
 for(let j=1;j<m.h-1;j++){addObj('meadow','tree',0,j*TILE,TILE,TILE);addObj('meadow','tree',(m.w-1)*TILE,j*TILE,TILE,TILE)}
 addObj('meadow','transition',18*TILE,1*TILE,7*TILE,TILE,{to:'city',spawn:{x:19*TILE,y:23.4*TILE}});
 addObj('meadow','pond',5*TILE,8*TILE,6*TILE,5*TILE);addObj('meadow','pond',29*TILE,14*TILE,7*TILE,4*TILE);
 for(let i=0;i<18;i++){const x=(3+(i*7)%39)*TILE,y=(3+(i*11)%24)*TILE; if(!nearObj('meadow',x,y,80))addObj('meadow','tree',x,y,TILE,TILE)}
 addObj('meadow','caveEntrance',39*TILE,5*TILE,3*TILE,2*TILE,{label:'Caverna do Brilho'});
 addNpc('meadow','pipo','Pipo',14*TILE,6*TILE,'🧚',['Os Cristais de Estrela aparecem quando uma criatura mágica volta a ficar calma.','Você consegue, Elo!']);
 addEnemy('meadow','m1','slime',12*TILE,17*TILE);addEnemy('meadow','m2','slime',18*TILE,9*TILE);addEnemy('meadow','m3','ghost',26*TILE,19*TILE);addEnemy('meadow','m4','slime',33*TILE,8*TILE);addEnemy('meadow','m5','puff',36*TILE,23*TILE);addEnemy('meadow','m6','ghost',8*TILE,22*TILE);

 const v=maps.cave;
 v.walls=[rect(0,0,v.w*TILE,40),rect(0,0,40,v.h*TILE),rect(v.w*TILE-40,0,40,v.h*TILE),rect(0,v.h*TILE-40,v.w*TILE,40)];
 addObj('cave','transition',2*TILE,(v.h-2)*TILE,4*TILE,TILE,{to:'meadow',spawn:{x:38*TILE,y:7*TILE}});
 for(let i=0;i<24;i++){const x=(2+(i*5)%25)*TILE,y=(2+(i*9)%17)*TILE;if(!(x<8*TILE&&y>15*TILE))addObj('cave','rock',x,y,TILE,TILE)}
 addObj('cave','crystal',8*TILE,4*TILE,TILE,TILE);addObj('cave','crystal',20*TILE,6*TILE,TILE,TILE);addObj('cave','crystal',14*TILE,15*TILE,TILE,TILE);
 addEnemy('cave','c1','ghost',10*TILE,10*TILE);addEnemy('cave','c2','puff',18*TILE,12*TILE);addEnemy('cave','boss1','boss',25*TILE,4*TILE);
}
function addBuilding(map,label,gx,gy,gw,gh,doorType,doorExtra,color){addObj(map,'building',gx*TILE,gy*TILE,gw*TILE,gh*TILE,{label,color});addObj(map,doorType,(gx+gw/2-.65)*TILE,(gy+gh-.6)*TILE,1.3*TILE,.7*TILE,{label,...doorExtra})}
function nearObj(map,x,y,r){return maps[map].objects.some(o=>Math.hypot(o.x-x,o.y-y)<r)}
buildWorld();

function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(s&&typeof s==='object'){Object.assign(state,s);state.flags=state.flags||{};state.inventory=state.inventory||{potion:1,tea:0,apple:0};state.ownedOutfits=state.ownedOutfits||['starter'];state.discovered=state.discovered||['home'];state.talked=state.talked||[];state.medals=loadMedals();state.removedEnemies=state.removedEnemies||{};return true}}catch(e){}state.medals=loadMedals();return false}
function saveGame(silent=false){state.lastSave=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));localStorage.setItem(MEDAL_KEY,JSON.stringify(state.medals));if(!silent)toast('Jogo salvo 💾')}
function loadMedals(){try{return JSON.parse(localStorage.getItem(MEDAL_KEY)||'[]')}catch(e){return[]}}
function medal(id){if(state.medals.includes(id))return;state.medals.push(id);localStorage.setItem(MEDAL_KEY,JSON.stringify(state.medals));const m=RPG_MEDALS.find(x=>x.id===id);toast(`🏅 Medalha: ${m?.name||id}`);parent.postMessage({type:'rpg-medal',id},'*')}
function discover(map){if(!state.discovered.includes(map)){state.discovered.push(map);if(state.discovered.length>=4)medal('explorer')}}

function stats(){const o=OUTFITS[state.outfit]||OUTFITS.starter;return{atk:state.atk+o.atk,def:state.def+o.def,mag:state.mag+o.mag,spd:state.spd+o.spd}}
function xpGain(n){state.xp+=n;while(state.xp>=state.nextXp){state.xp-=state.nextXp;state.level++;state.nextXp=Math.floor(state.nextXp*1.35);state.maxHp+=6;state.maxMp+=2;state.atk+=2;state.def+=1;state.mag+=1;state.spd+=.3;state.hp=state.maxHp;state.mp=state.maxMp;toast(`Nível ${state.level}! Elo ficou mais forte 🌟`);if(state.level>=2)medal('level2');if(state.level>=5)medal('level5')}updateHud()}
function addCoins(n){state.coins+=n;if(state.coins>=100)medal('rich');updateHud()}
function heal(n){state.hp=Math.min(state.maxHp,state.hp+n);updateHud()}
function restoreAll(){state.hp=state.maxHp;state.mp=state.maxMp;updateHud()}

function currentObjective(){
 if(state.chapterComplete)return'Capítulo 1 concluído! Explore, fique mais forte e prepare-se para a próxima aventura.';
 if(state.quest===0)return'Saia de casa e fale com o Guardião Sol na Vila das Estrelas.';
 if(state.quest===1)return`Colete 3 Cristais de Estrela na Campina Encantada (${state.starCrystals}/3).`;
 if(state.quest===2)return'Leve os 3 Cristais de Estrela ao Guardião Sol.';
 if(state.quest===3)return'Entre na Caverna do Brilho e encontre a Sombra Nublada.';
 if(state.quest===4)return'Volte à Vila das Estrelas e fale com o Guardião Sol.';
 return'Explore o Reino das Estrelas.';
}
function updateHud(){
 $('#hudLevel').textContent=state.level;$('#hpText').textContent=`${Math.max(0,state.hp)}/${state.maxHp}`;$('#hpBar').style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`;$('#xpText').textContent=`${state.xp}/${state.nextXp}`;$('#xpBar').style.width=`${state.xp/state.nextXp*100}%`;$('#coinText').textContent=state.coins;$('#objectiveText').textContent=currentObjective();
}

function changeMap(map,x,y){state.map=map;state.x=x;state.y=y;discover(map);$('#locationTag').textContent=maps[map].name;$('#locationTag').style.opacity='1';setTimeout(()=>$('#locationTag').style.opacity='.25',1800);medal('first-step');saveGame(true);updateHud()}

function playerRect(nx=state.x,ny=state.y){return{x:nx+8,y:ny+11,w:30,h:35}}
function solidObject(o){return['tree','building','fountain','pond','rock','crystal','bed','tv','sofa','table','fridge','stove','closet'].includes(o.type)}
function blocked(nx,ny){const map=maps[state.map],p=playerRect(nx,ny);if(nx<32||ny<32||nx>map.w*TILE-70||ny>map.h*TILE-78)return true;for(const w of map.walls){if(hit(p,w))return true}for(const o of map.objects){if(solidObject(o)&&hit(p,o))return true}return false}
function hit(a,b,p=0){return a.x+p<b.x+b.w&&a.x+a.w-p>b.x&&a.y+p<b.y+b.h&&a.y+a.h-p>b.y}
function distTo(o){const px=state.x+24,py=state.y+28,ox=o.x+o.w/2,oy=o.y+o.h/2;return Math.hypot(px-ox,py-oy)}

function update(dt){if(!state.started||battle||!$('#dialogOverlay').classList.contains('hidden')||!$('#menuOverlay').classList.contains('hidden')||!$('#shopOverlay').classList.contains('hidden')||!$('#tvOverlay').classList.contains('hidden'))return;
 const st=stats(),speed=(125+st.spd*5)*dt;let dx=0,dy=0;if(input.up){dy-=speed;state.dir='up'}if(input.down){dy+=speed;state.dir='down'}if(input.left){dx-=speed;state.dir='left'}if(input.right){dx+=speed;state.dir='right'}if(dx&&dy){dx*=.707;dy*=.707}if(dx&&!blocked(state.x+dx,state.y))state.x+=dx;if(dy&&!blocked(state.x,state.y+dy))state.y+=dy;
 handleTransitions();updateEnemies(dt);if(Date.now()-state.lastSave>10000)saveGame(true);
}
function handleTransitions(){const map=maps[state.map],p=playerRect();for(const o of map.objects){if((o.type==='transition'||o.type.endsWith('Door'))&&hit(p,o,0)){if(o.type==='caveEntrance')continue;if(o.to){changeMap(o.to,o.spawn.x,o.spawn.y);return}}}
 if(state.map==='meadow'){const cave=map.objects.find(o=>o.type==='caveEntrance');if(cave&&distTo(cave)<55&&state.quest>=3&&state.x>cave.x-20){changeMap('cave',4*TILE,17*TILE)}}
}
function enemyGone(e){const when=state.removedEnemies[e.id];if(!when)return false;if(e.type==='boss')return true;if(Date.now()-when>60000){delete state.removedEnemies[e.id];return false}return true}
function updateEnemies(dt){const map=maps[state.map];for(const e of map.enemies){if(enemyGone(e))continue;e.t+=dt;const player=playerRect();const d=Math.hypot((state.x+24)-(e.x+19),(state.y+28)-(e.y+19));if(d<230&&!ENEMIES[e.type].boss){const vx=((state.x-e.x)/Math.max(1,d))*22*dt,vy=((state.y-e.y)/Math.max(1,d))*22*dt;e.x+=vx;e.y+=vy}else{e.x=e.homeX+Math.sin(e.t*.8)*16;e.y=e.homeY+Math.cos(e.t*.55)*12}if(hit(player,e,3)){startBattle(e);return}}
}

function action(){if(!state.started||battle)return;const map=maps[state.map];let candidates=[];for(const o of map.objects){if(distTo(o)<88)candidates.push({kind:'object',o,d:distTo(o)})}for(const n of map.npcs){const d=Math.hypot(state.x+24-(n.x+17),state.y+28-(n.y+22));if(d<90)candidates.push({kind:'npc',o:n,d})}candidates.sort((a,b)=>a.d-b.d);if(!candidates.length){toast('Não há nada para interagir aqui.');return}const c=candidates[0];if(c.kind==='npc')talkNpc(c.o);else interactObject(c.o)}
function interactObject(o){
 if(o.to){changeMap(o.to,o.spawn.x,o.spawn.y);return}
 if(o.type==='tv'){medal('tv-fan');state.flags.tv=true;checkHomeExplorer();$('#tvOverlay').classList.remove('hidden');return}
 if(o.type==='fridge'||o.type==='stove'){heal(10);medal('good-meal');state.flags.kitchen=true;checkHomeExplorer();dialog('Elo','Hummm! Uma refeição gostosa recuperou um pouco da energia. 🍎');return}
 if(o.type==='bed'){restoreAll();medal('rested');state.flags.bed=true;checkHomeExplorer();dialog('Elo','Depois de um bom descanso, a energia e a magia estão novinhas! 🌙');return}
 if(o.type==='closet'){state.flags.closet=true;checkHomeExplorer();openMenu('clothes');return}
 if(o.shop==='inn'){openInn();return}if(o.shop==='items'){openShop('items');return}if(o.shop==='clothes'){openShop('clothes');return}
 if(o.npcDoor==='guardian'){const n=maps.city.npcs.find(x=>x.id==='guardian');talkNpc(n);return}
 if(o.type==='caveEntrance'){if(state.quest<3)dialog('Elo','A entrada parece protegida por uma luz. Talvez eu precise falar com o Guardião Sol primeiro.');else changeMap('cave',4*TILE,17*TILE);return}
 if(o.label)toast(o.label);
}
function checkHomeExplorer(){if(state.flags.tv&&state.flags.kitchen&&state.flags.bed&&state.flags.closet)medal('home-explorer')}

function talkNpc(n){if(!n)return;if(!state.talked.includes(n.id)){state.talked.push(n.id);medal('first-chat');if(state.talked.length>=5)medal('social')}
 if(n.id==='guardian'){guardianDialog();return}
 const lines=n.lines||['Olá, Elo!'];dialog(n.name,lines[Math.floor(Math.random()*lines.length)],n.emoji)}
function guardianDialog(){
 if(state.quest===0){dialog('Guardião Sol','Elo! Três Cristais de Estrela caíram na Campina Encantada. Sem eles, a luz do Reino está desaparecendo. Você pode recuperá-los?','🧙',[{label:'Sim! Eu vou ajudar',fn:()=>{state.quest=1;medal('quest');saveGame(true);updateHud();dialog('Guardião Sol','Sabia que podia contar com você! As criaturas mágicas da Campina podem estar carregando os cristais.','🧙')}},{label:'Vou me preparar',fn:()=>{}}]);return}
 if(state.quest===1){dialog('Guardião Sol',`Você encontrou ${state.starCrystals}/3 Cristais de Estrela. Continue procurando na Campina!`,'🧙');return}
 if(state.quest===2){state.quest=3;saveGame(true);updateHud();dialog('Guardião Sol','Você conseguiu! Mas os cristais apontam para a Caverna do Brilho. Vá até lá e descubra quem está escondendo a luz do Reino.','🧙');return}
 if(state.quest===3){dialog('Guardião Sol','A Caverna do Brilho fica a leste da Campina. Tome cuidado e leve poções.','🧙');return}
 if(state.quest===4){state.quest=5;state.chapterComplete=true;medal('chapter1');addCoins(40);saveGame(true);updateHud();dialog('Guardião Sol','Você trouxe a primeira estrela de volta! A Vila das Estrelas voltou a brilhar graças a você. Esta aventura está só começando...','🧙');return}
 dialog('Guardião Sol','O Reino ainda guarda muitos caminhos. Continue treinando e explorando, Elo!','🧙')
}

function dialog(name,line,portrait='👧',choices=[]){$('#dialogName').textContent=name;$('#dialogLine').textContent=line;$('#dialogPortrait').textContent=portrait;const box=$('#dialogChoices');box.innerHTML='';if(choices.length){for(const c of choices){const b=document.createElement('button');b.textContent=c.label;b.onclick=()=>{closeDialog();c.fn?.()};box.appendChild(b)}}else{const b=document.createElement('button');b.textContent='Continuar';b.onclick=closeDialog;box.appendChild(b)}$('#dialogOverlay').classList.remove('hidden')}
function closeDialog(){$('#dialogOverlay').classList.add('hidden');saveGame(true)}

function openInn(){currentShop='inn';$('#shopTitle').textContent='🌙 Pousada Lua';$('#shopSubtitle').textContent='Descanse por 8 moedas e recupere energia e magia.';$('#shopItems').innerHTML=`<div class="shopItem"><div class="shopIcon">🛏️</div><h3>Uma noite tranquila</h3><p>Recupera toda a energia e a magia.</p><button id="innBuy">Dormir • 8 🪙</button></div>`;$('#shopOverlay').classList.remove('hidden');$('#innBuy').onclick=()=>{if(state.coins<8)return toast('Você não tem moedas suficientes.');state.coins-=8;restoreAll();medal('rested');toast('Boa noite! Energia recuperada 🌙');closeOverlay('shopOverlay')}}
function openShop(type){currentShop=type;$('#shopTitle').textContent=type==='items'?'⭐ Loja Estrelinha':'🌈 Boutique Arco-Íris';$('#shopSubtitle').textContent=type==='items'?'Itens úteis para suas aventuras.':'Roupas bonitas que também melhoram os atributos da Elo.';renderShop();$('#shopOverlay').classList.remove('hidden')}
function renderShop(){const box=$('#shopItems');box.innerHTML='';if(currentShop==='items'){Object.entries(ITEMS).forEach(([id,it])=>{const d=document.createElement('div');d.className='shopItem';d.innerHTML=`<div class="shopIcon">${it.icon}</div><h3>${it.name}</h3><p>${it.desc}</p><button>Comprar • ${it.price} 🪙</button>`;d.querySelector('button').onclick=()=>buyItem(id);box.appendChild(d)})}else{Object.entries(OUTFITS).filter(([id])=>id!=='starter').forEach(([id,it])=>{const owned=state.ownedOutfits.includes(id);const d=document.createElement('div');d.className='shopItem';d.innerHTML=`<div class="shopIcon">${it.icon}</div><h3>${it.name}</h3><p>${it.desc}</p><button>${owned?(state.outfit===id?'Equipada':'Equipar'):`Comprar • ${it.price} 🪙`}</button>`;d.querySelector('button').onclick=()=>owned?equipOutfit(id):buyOutfit(id);box.appendChild(d)})}}
function buyItem(id){const it=ITEMS[id];if(state.coins<it.price)return toast('Moedas insuficientes.');state.coins-=it.price;state.inventory[id]=(state.inventory[id]||0)+1;medal('shopper');updateHud();renderShop();saveGame(true);toast(`${it.name} comprado!`)}
function buyOutfit(id){const it=OUTFITS[id];if(state.coins<it.price)return toast('Moedas insuficientes.');state.coins-=it.price;state.ownedOutfits.push(id);medal('shopper');equipOutfit(id);renderShop();updateHud();saveGame(true)}
function equipOutfit(id){if(!state.ownedOutfits.includes(id))return;state.outfit=id;medal('stylish');toast(`${OUTFITS[id].name} equipada!`);renderShop();saveGame(true)}

function startBattle(enemyRef){if(battle||state.hp<=0)return;const template=ENEMIES[enemyRef.type];battle={ref:enemyRef,type:enemyRef.type,name:template.name,hp:template.hp,maxHp:template.hp,atk:template.atk,def:template.def,xp:template.xp,coins:template.coins,boss:!!template.boss,defending:false,turnLocked:false};$('#enemyName').textContent=battle.name;$('#battleText').textContent=`${battle.name} apareceu!`;$('#battleOverlay').classList.remove('hidden');updateBattleUI();drawBattle()}
function updateBattleUI(){$('#enemyHpText').textContent=`${Math.max(0,battle.hp)}/${battle.maxHp}`;$('#enemyHpBar').style.width=`${Math.max(0,battle.hp/battle.maxHp*100)}%`;updateHud();drawBattle()}
function battleAction(type){if(!battle||battle.turnLocked)return;battle.turnLocked=true;const st=stats();if(type==='attack'){const dmg=Math.max(2,Math.floor(st.atk+Math.random()*4-battle.def));battle.hp-=dmg;$('#battleText').textContent=`Elo lançou um brilho e causou ${dmg} de dano!`;afterPlayerTurn()}else if(type==='magic'){if(state.mp<3){battle.turnLocked=false;$('#battleText').textContent='Magia insuficiente. Use Chá Mágico ou escolha outra ação.';return}state.mp-=3;const dmg=Math.max(4,Math.floor(st.mag*1.7+Math.random()*5-battle.def));battle.hp-=dmg;$('#battleText').textContent=`Poder do Coração! ${dmg} de dano mágico 💖`;afterPlayerTurn()}else if(type==='defend'){battle.defending=true;$('#battleText').textContent='Elo se protegeu para reduzir o próximo dano.';setTimeout(enemyTurn,550)}else if(type==='item'){const inv=Object.entries(state.inventory).find(([id,n])=>n>0&&id==='potion');if(!inv){battle.turnLocked=false;$('#battleText').textContent='Você não tem Poção Rosa na bolsa.';return}useItem('potion',true);$('#battleText').textContent='Elo usou uma Poção Rosa e recuperou energia.';setTimeout(enemyTurn,500)}}
function afterPlayerTurn(){updateBattleUI();if(battle.hp<=0)return setTimeout(winBattle,650);setTimeout(enemyTurn,650)}
function enemyTurn(){if(!battle)return;const st=stats();let dmg=Math.max(1,Math.floor(battle.atk+Math.random()*3-st.def));if(battle.defending){dmg=Math.max(1,Math.floor(dmg/2));battle.defending=false}state.hp-=dmg;$('#battleText').textContent=`${battle.name} usou uma magia travessa. Elo perdeu ${dmg} de energia.`;updateBattleUI();if(state.hp<=0)return setTimeout(loseBattle,700);battle.turnLocked=false}
function winBattle(){const b=battle;if(!b)return;state.defeated++;medal('first-win');if(state.defeated>=10)medal('fighter10');addCoins(b.coins);xpGain(b.xp);state.removedEnemies[b.ref.id]=Date.now();if(state.quest===1&&!b.boss&&state.starCrystals<3){state.starCrystals++;toast('Você encontrou um Cristal de Estrela! ⭐');if(state.starCrystals>=3)state.quest=2}if(b.boss){state.quest=4;state.flags.bossDefeated=true;toast('A Sombra Nublada voltou a ser uma nuvem brilhante! ✨')}$('#battleText').textContent=`Vitória! +${b.xp} XP e +${b.coins} moedas.`;updateHud();saveGame(true);setTimeout(()=>{battle=null;$('#battleOverlay').classList.add('hidden')},1000)}
function loseBattle(){battle=null;$('#battleOverlay').classList.add('hidden');state.hp=Math.max(1,Math.floor(state.maxHp*.4));state.mp=Math.floor(state.maxMp*.5);changeMap('home',8*TILE,8*TILE);dialog('Elo','Ufa! Voltei para casa para descansar. Vou me preparar melhor e tentar de novo.','👧')}
function useItem(id,inBattle=false){const it=ITEMS[id];if(!it||!(state.inventory[id]>0))return false;state.inventory[id]--;if(it.full)state.hp=state.maxHp;else if(it.heal)heal(it.heal);if(it.mp)state.mp=Math.min(state.maxMp,state.mp+it.mp);medal('potion');updateHud();if(!inBattle)toast(`${it.name} usado!`);saveGame(true);return true}

function openMenu(tab='missions'){$('#menuOverlay').classList.remove('hidden');renderMenu(tab)}
function renderMenu(tab){$$('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===tab));const st=stats();$('#statsGrid').innerHTML=`<div><b>NÍVEL</b><span>${state.level}</span></div><div><b>ATAQUE</b><span>${st.atk}</span></div><div><b>DEFESA</b><span>${st.def}</span></div><div><b>MAGIA</b><span>${st.mag}</span></div><div><b>VELOCIDADE</b><span>${st.spd.toFixed(1)}</span></div><div><b>ENERGIA</b><span>${state.hp}/${state.maxHp}</span></div><div><b>MAGIA</b><span>${state.mp}/${state.maxMp}</span></div><div><b>MOEDAS</b><span>${state.coins}</span></div>`;const c=$('#menuContent');if(tab==='missions'){c.innerHTML=`<div class="listCard"><div class="ico">📜</div><div class="grow"><b>Missão principal</b><small>${currentObjective()}</small></div></div><div class="listCard"><div class="ico">⭐</div><div class="grow"><b>Cristais encontrados</b><small>${state.starCrystals}/3 no Capítulo 1</small></div></div>`}else if(tab==='bag'){c.innerHTML=Object.entries(ITEMS).map(([id,it])=>`<div class="listCard"><div class="ico">${it.icon}</div><div class="grow"><b>${it.name}</b><small>${it.desc} • Você tem ${state.inventory[id]||0}</small></div><button class="softBtn" ${state.inventory[id]?`onclick="window.__useItem('${id}')"`:'disabled'}>Usar</button></div>`).join('')}else if(tab==='clothes'){c.innerHTML=Object.entries(OUTFITS).filter(([id])=>state.ownedOutfits.includes(id)).map(([id,it])=>`<div class="listCard"><div class="ico">${it.icon}</div><div class="grow"><b>${it.name}</b><small>${it.desc}</small></div><button class="softBtn" onclick="window.__equip('${id}')">${state.outfit===id?'Equipada':'Equipar'}</button></div>`).join('')}else if(tab==='medals'){c.innerHTML=`<div class="medalGrid">${RPG_MEDALS.map(m=>`<div class="medal ${state.medals.includes(m.id)?'on':''}"><span>${m.icon}</span><b>${m.name}</b><small>${state.medals.includes(m.id)?'Conquistada!':m.desc}</small></div>`).join('')}</div>`}else if(tab==='map'){const names={home:'🏠 Casa da Elo',city:'🏘️ Vila das Estrelas',meadow:'🌿 Campina Encantada',cave:'💎 Caverna do Brilho'};c.innerHTML=Object.keys(names).map(k=>`<div class="listCard"><div class="ico">${state.discovered.includes(k)?names[k].split(' ')[0]:'❓'}</div><div class="grow"><b>${state.discovered.includes(k)?names[k].slice(2):'Lugar ainda não descoberto'}</b><small>${k===state.map?'Você está aqui':''}</small></div></div>`).join('')}}
window.__useItem=id=>{if(useItem(id))renderMenu('bag')};window.__equip=id=>{equipOutfit(id);renderMenu('clothes')};

function closeOverlay(id){$('#'+id).classList.add('hidden')}
function toast(msg){const t=$('#toastRpg');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}

function camera(){const map=maps[state.map],vw=canvas.width,vh=canvas.height;return{x:Math.max(0,Math.min(map.w*TILE-vw,state.x+24-vw/2)),y:Math.max(0,Math.min(map.h*TILE-vh,state.y+28-vh/2))}}
function draw(){const map=maps[state.map],cam=camera();ctx.clearRect(0,0,canvas.width,canvas.height);drawTiles(map,cam);for(const o of map.objects)drawObject(o,cam);for(const n of map.npcs)drawNpc(n,cam);for(const e of map.enemies)if(!enemyGone(e))drawEnemyWorld(e,cam);drawPlayer(cam);drawMiniLabel(cam)}
function drawTiles(map,cam){const sx=Math.floor(cam.x/TILE),sy=Math.floor(cam.y/TILE),ex=Math.ceil((cam.x+canvas.width)/TILE),ey=Math.ceil((cam.y+canvas.height)/TILE);for(let y=sy;y<=ey;y++)for(let x=sx;x<=ex;x++){const px=x*TILE-cam.x,py=y*TILE-cam.y;if(state.map==='home'){ctx.fillStyle=(x+y)%2?'#f9efe6':'#f5e7dd';ctx.fillRect(px,py,TILE,TILE);ctx.strokeStyle='rgba(173,134,120,.12)';ctx.strokeRect(px,py,TILE,TILE)}else if(state.map==='cave'){ctx.fillStyle=(x+y)%2?'#6f6483':'#74698a';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(px+8,py+10,4,3)}else{ctx.fillStyle=(x+y)%2?'#8edb80':'#86d278';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(px+9+(x*13+y*7)%22,py+8+(x*9+y*11)%25,3,7);if(state.map==='city'&&((x>6&&x<34&&y>11&&y<14)||(x>17&&x<21&&y>2&&y<26))){ctx.fillStyle='#d9bf8e';ctx.fillRect(px,py,TILE,TILE);ctx.fillStyle='#caa979';ctx.fillRect(px+4,py+22,TILE-8,3)}}}}
function drawObject(o,cam){const x=o.x-cam.x,y=o.y-cam.y;if(x>canvas.width+100||y>canvas.height+100||x+o.w<-100||y+o.h<-100)return;ctx.save();if(o.type==='tree'){drawTree(x,y,o.w,o.h)}else if(o.type==='building'){drawBuilding(o,x,y)}else if(o.type==='fountain'){drawFountain(x,y,o.w,o.h)}else if(o.type==='pond'){drawPond(x,y,o.w,o.h)}else if(o.type==='bed'){drawFurniture('bed',x,y,o.w,o.h)}else if(o.type==='tv'){drawFurniture('tv',x,y,o.w,o.h)}else if(o.type==='sofa'){drawFurniture('sofa',x,y,o.w,o.h)}else if(o.type==='table'){drawFurniture('table',x,y,o.w,o.h)}else if(o.type==='fridge'){drawFurniture('fridge',x,y,o.w,o.h)}else if(o.type==='stove'){drawFurniture('stove',x,y,o.w,o.h)}else if(o.type==='closet'){drawFurniture('closet',x,y,o.w,o.h)}else if(o.type==='rug'){ctx.fillStyle='#ffb5d0';roundRect(ctx,x,y,o.w,o.h,18);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(x+25+i*28,y+o.h/2+Math.sin(i)*15,5,0,Math.PI*2);ctx.fill()}}else if(o.type==='sign'){ctx.fillStyle='#8a5d3a';ctx.fillRect(x+12,y+18,8,24);ctx.fillStyle='#f6d88f';ctx.fillRect(x,y,34,22)}else if(o.type==='caveEntrance'){ctx.fillStyle='#51425f';ctx.beginPath();ctx.arc(x+o.w/2,y+o.h,70,Math.PI,0);ctx.lineTo(x+o.w,y+o.h);ctx.lineTo(x,y+o.h);ctx.closePath();ctx.fill();ctx.fillStyle='#2f263b';ctx.beginPath();ctx.arc(x+o.w/2,y+o.h,40,Math.PI,0);ctx.lineTo(x+o.w/2+40,y+o.h);ctx.lineTo(x+o.w/2-40,y+o.h);ctx.closePath();ctx.fill();ctx.fillStyle='#c38bff';ctx.font='28px sans-serif';ctx.fillText('✨',x+o.w/2-14,y+o.h-18)}else if(o.type==='rock'){ctx.fillStyle='#50465f';roundRect(ctx,x+4,y+8,o.w-8,o.h-10,12);ctx.fill();ctx.fillStyle='#756b85';ctx.fillRect(x+14,y+14,14,5)}else if(o.type==='crystal'){ctx.fillStyle='#b47dff';ctx.beginPath();ctx.moveTo(x+o.w/2,y);ctx.lineTo(x+o.w,y+o.h*.45);ctx.lineTo(x+o.w*.68,y+o.h);ctx.lineTo(x+o.w*.32,y+o.h);ctx.lineTo(x,y+o.h*.45);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(x+o.w*.45,y+8,5,o.h-14)}else if(o.type.endsWith('Door')){ctx.fillStyle='#6a4a3a';roundRect(ctx,x,y,o.w,o.h,7);ctx.fill()}ctx.restore()}
function drawTree(x,y,w,h){ctx.fillStyle='#6b4c36';ctx.fillRect(x+w*.42,y+h*.55,w*.16,h*.45);ctx.fillStyle='#4fa36e';ctx.beginPath();ctx.arc(x+w*.35,y+h*.42,w*.32,0,Math.PI*2);ctx.arc(x+w*.64,y+h*.38,w*.35,0,Math.PI*2);ctx.arc(x+w*.5,y+h*.2,w*.32,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8edb87';ctx.beginPath();ctx.arc(x+w*.42,y+h*.25,w*.12,0,Math.PI*2);ctx.fill()}
function drawBuilding(o,x,y){ctx.fillStyle=o.color||'#ffd8e8';roundRect(ctx,x+4,y+18,o.w-8,o.h-18,18);ctx.fill();ctx.fillStyle='#8d6e9e';ctx.beginPath();ctx.moveTo(x-8,y+44);ctx.lineTo(x+o.w/2,y-10);ctx.lineTo(x+o.w+8,y+44);ctx.closePath();ctx.fill();ctx.fillStyle='#fff8d5';for(let i=0;i<2;i++){ctx.fillRect(x+30+i*(o.w-100),y+o.h*.48,34,30)}ctx.fillStyle='#64405b';ctx.font='900 15px system-ui';ctx.textAlign='center';ctx.fillText(o.label,x+o.w/2,y+72);ctx.textAlign='left'}
function drawFountain(x,y,w,h){ctx.fillStyle='#cbbce7';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.73,w*.45,h*.18,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#70cfe8';ctx.beginPath();ctx.ellipse(x+w/2,y+h*.68,w*.36,h*.12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#efe7ff';ctx.fillRect(x+w*.45,y+h*.18,w*.1,h*.52);ctx.fillStyle='#80d7f2';ctx.font='36px sans-serif';ctx.fillText('✨',x+w/2-18,y+h*.32)}
function drawPond(x,y,w,h){ctx.fillStyle='#66c8e4';roundRect(ctx,x,y,w,h,28);ctx.fill();ctx.strokeStyle='#a8ecdc';ctx.lineWidth=7;roundRect(ctx,x+4,y+4,w-8,h-8,24);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(x+30+i*55,y+30+(i%2)*35,4,0,Math.PI*2);ctx.fill()}}
function drawFurniture(type,x,y,w,h){if(type==='bed'){ctx.fillStyle='#fff';roundRect(ctx,x,y,w,h,12);ctx.fill();ctx.fillStyle='#ffbad2';ctx.fillRect(x+8,y+20,w-16,h-28);ctx.fillStyle='#f7eaff';ctx.fillRect(x+12,y+8,w*.4,24)}else if(type==='tv'){ctx.fillStyle='#302842';roundRect(ctx,x,y,w,h,8);ctx.fill();ctx.fillStyle='#8edbf2';ctx.fillRect(x+7,y+6,w-14,h-12);ctx.fillStyle='#ff6fae';ctx.font='18px sans-serif';ctx.fillText('ELO',x+w*.32,y+h*.66)}else if(type==='sofa'){ctx.fillStyle='#c798df';roundRect(ctx,x,y,w,h,16);ctx.fill();ctx.fillStyle='#dfb9ef';ctx.fillRect(x+12,y+10,w-24,h*.42)}else if(type==='table'){ctx.fillStyle='#d09c6c';roundRect(ctx,x,y,w,h*.45,10);ctx.fill();ctx.fillRect(x+16,y+h*.4,10,h*.6);ctx.fillRect(x+w-26,y+h*.4,10,h*.6)}else if(type==='fridge'){ctx.fillStyle='#d9f4f7';roundRect(ctx,x,y,w,h,8);ctx.fill();ctx.strokeStyle='#9cc8cf';ctx.strokeRect(x+8,y+h*.45,w-16,2);ctx.fillStyle='#8baeb3';ctx.fillRect(x+w-13,y+14,3,18)}else if(type==='stove'){ctx.fillStyle='#f1e4d8';roundRect(ctx,x,y,w,h,7);ctx.fill();ctx.fillStyle='#5b5963';for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(x+16+i*22,y+18,7,0,Math.PI*2);ctx.fill()}}else if(type==='closet'){ctx.fillStyle='#f2c69e';roundRect(ctx,x,y,w,h,8);ctx.fill();ctx.strokeStyle='#c58b63';ctx.strokeRect(x+w/2,y+5,1,h-10);ctx.fillStyle='#9c6b4d';ctx.beginPath();ctx.arc(x+w*.45,y+h*.55,3,0,Math.PI*2);ctx.arc(x+w*.55,y+h*.55,3,0,Math.PI*2);ctx.fill()}}
function drawNpc(n,cam){const x=n.x-cam.x,y=n.y-cam.y;ctx.save();ctx.font='35px sans-serif';ctx.fillText(n.emoji,x,y+34);ctx.fillStyle='rgba(48,37,70,.72)';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.fillText(n.name,x+17,y+49);ctx.textAlign='left';ctx.restore()}
function drawEnemyWorld(e,cam){const x=e.x-cam.x,y=e.y-cam.y,meta=ENEMIES[e.type];ctx.save();ctx.translate(x+19,y+19);const bob=Math.sin(e.t*2)*3;ctx.translate(0,bob);if(e.type==='slime'){ctx.fillStyle=meta.color;ctx.beginPath();ctx.arc(0,5,18,Math.PI,0);ctx.lineTo(18,15);ctx.quadraticCurveTo(8,22,0,15);ctx.quadraticCurveTo(-8,22,-18,15);ctx.closePath();ctx.fill()}else if(e.type==='boss'){ctx.scale(1.7,1.7);drawGhostShape(ctx,meta.color)}else drawGhostShape(ctx,meta.color);ctx.restore()}
function drawGhostShape(g,color){g.fillStyle=color;g.beginPath();g.arc(0,-4,15,Math.PI,0);g.lineTo(15,13);g.quadraticCurveTo(9,19,4,13);g.quadraticCurveTo(0,19,-5,13);g.quadraticCurveTo(-10,19,-15,13);g.closePath();g.fill();g.fillStyle='#443454';g.beginPath();g.arc(-5,-3,2,0,Math.PI*2);g.arc(5,-3,2,0,Math.PI*2);g.fill()}
function drawPlayer(cam){const x=state.x-cam.x,y=state.y-cam.y,o=OUTFITS[state.outfit]||OUTFITS.starter;ctx.save();ctx.translate(x,y);ctx.fillStyle='#6d412d';ctx.beginPath();ctx.arc(23,13,14,0,Math.PI*2);ctx.arc(12,15,10,0,Math.PI*2);ctx.arc(34,15,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#efbd9b';ctx.beginPath();ctx.arc(23,22,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#35263c';ctx.beginPath();ctx.arc(18,21,2,0,Math.PI*2);ctx.arc(28,21,2,0,Math.PI*2);ctx.fill();ctx.fillStyle=o.color;roundRect(ctx,10,36,26,29,8);ctx.fill();ctx.fillStyle='#efbd9b';ctx.fillRect(7,39,6,20);ctx.fillRect(34,39,6,20);ctx.fillRect(14,63,7,18);ctx.fillRect(27,63,7,18);ctx.fillStyle='#fff';ctx.fillRect(11,79,11,5);ctx.fillRect(26,79,11,5);ctx.fillStyle='#ffb4d0';ctx.beginPath();ctx.moveTo(17,4);ctx.lineTo(23,10);ctx.lineTo(30,4);ctx.lineTo(30,13);ctx.lineTo(17,13);ctx.closePath();ctx.fill();ctx.restore()}
function drawMiniLabel(cam){const nearest=[...maps[state.map].objects.filter(o=>o.label),...maps[state.map].npcs].map(o=>({o,d:distTo(o)})).sort((a,b)=>a.d-b.d)[0];if(nearest&&nearest.d<110){const text=nearest.o.name||nearest.o.label;ctx.save();ctx.fillStyle='rgba(48,37,70,.82)';roundRect(ctx,canvas.width/2-110,canvas.height-42,220,28,14);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText(`A • ${text}`,canvas.width/2,canvas.height-23);ctx.restore()}}
function roundRect(g,x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}

function drawBattle(){if(!battle)return;const w=battleCanvas.width,h=battleCanvas.height;bctx.clearRect(0,0,w,h);const grad=bctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#b9e6ff');grad.addColorStop(1,'#ffe6f2');bctx.fillStyle=grad;bctx.fillRect(0,0,w,h);bctx.fillStyle='#8bd67e';bctx.fillRect(0,h-58,w,58);drawBattleElo(105,110);drawBattleEnemy(485,110,battle.type)}
function drawBattleElo(x,y){bctx.save();bctx.translate(x,y);bctx.scale(1.5,1.5);bctx.fillStyle='#6d412d';bctx.beginPath();bctx.arc(0,-28,22,0,Math.PI*2);bctx.fill();bctx.fillStyle='#efbd9b';bctx.beginPath();bctx.arc(0,-20,16,0,Math.PI*2);bctx.fill();bctx.fillStyle=OUTFITS[state.outfit].color;bctx.fillRect(-15,0,30,38);bctx.fillStyle='#ffb4d0';bctx.fillRect(-20,-46,40,8);bctx.restore()}
function drawBattleEnemy(x,y,type){const m=ENEMIES[type];bctx.save();bctx.translate(x,y);const scale=type==='boss'?2.6:2;bctx.scale(scale,scale);if(type==='slime'){bctx.fillStyle=m.color;bctx.beginPath();bctx.arc(0,0,22,Math.PI,0);bctx.lineTo(22,17);bctx.quadraticCurveTo(8,25,0,17);bctx.quadraticCurveTo(-8,25,-22,17);bctx.closePath();bctx.fill();bctx.fillStyle='#40344e';bctx.beginPath();bctx.arc(-7,1,2.5,0,Math.PI*2);bctx.arc(7,1,2.5,0,Math.PI*2);bctx.fill()}else drawGhostShape(bctx,m.color);bctx.restore()}

function loop(ts){const dt=Math.min(.035,(ts-last)/1000||.016);last=ts;update(dt);draw();raf=requestAnimationFrame(loop)}

function bind(){
 $$('.dpad button').forEach(b=>{const d=b.dataset.dir;const on=e=>{e.preventDefault();input[d]=true},off=e=>{e.preventDefault();input[d]=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});
 $('#actionBtn').onclick=action;$('#quickBtn').onclick=()=>openMenu('bag');$('#menuBtn').onclick=()=>openMenu('missions');$('#closeRpg').onclick=()=>{saveGame(true);parent.postMessage({type:'rpg-close'},'*')};
 $('#watchChannelBtn').onclick=()=>parent.postMessage({type:'rpg-open-youtube'},'*');
 $$('.miniClose,[data-close]').forEach(b=>b.onclick=()=>closeOverlay(b.dataset.close||b.closest('.overlay').id));
 $$('.tab').forEach(b=>b.onclick=()=>renderMenu(b.dataset.tab));$('#saveBtn').onclick=()=>saveGame();$('#resetSaveBtn').onclick=()=>{if(confirm('Quer mesmo recomeçar o RPG desde o início?')){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(MEDAL_KEY);location.reload()}};
 $$('[data-battle]').forEach(b=>b.onclick=()=>battleAction(b.dataset.battle));$('#battleEscape').onclick=()=>{if(battle?.boss){toast('Não dá para fugir do chefão!');return}battle=null;$('#battleOverlay').classList.add('hidden');state.x-=40;state.y+=40};
 window.addEventListener('keydown',e=>{const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];if(k){input[k]=true;e.preventDefault()}if(e.key==='Enter'||e.key===' '){action();e.preventDefault()}if(e.key==='Escape')openMenu('missions')});
 window.addEventListener('keyup',e=>{const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'}[e.key];if(k)input[k]=false});
 $('#startStoryBtn').onclick=()=>{state.started=true;state.map='home';state.x=8*TILE;state.y=8*TILE;medal('first-step');$('#introOverlay').classList.add('hidden');saveGame(true);updateHud()};
 $('#continueStoryBtn').onclick=()=>{state.started=true;$('#introOverlay').classList.add('hidden');updateHud()};
}

const hadSave=loadSave();bind();updateHud();$('#locationTag').textContent=maps[state.map].name;if(hadSave){$('#continueStoryBtn').classList.remove('hidden');$('#startStoryBtn').classList.add('hidden')}
state.started=hadSave?true:false;if(hadSave)$('#introOverlay').classList.remove('hidden');
raf=requestAnimationFrame(loop);
})();
