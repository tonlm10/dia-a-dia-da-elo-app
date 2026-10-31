/* Dia a Dia da Elo — Bichinho da Elo v4 • integrado à v3.1.3 */
(function(){
'use strict';
const PET_KEY='eloVirtualPetV1';
const EGG_CARE_GOAL=5;
const EGG_COOLDOWN_MS=5*60*1000;
const SPECIES={
 unicorn:{label:'Unicórnio',defaultName:'Luma',icon:'🦄',color:'#ff70c4'},
 cat:{label:'Gatinho',defaultName:'Pipoca',icon:'🐱',color:'#f5a65b'},
 dog:{label:'Cachorrinho',defaultName:'Pingo',icon:'🐶',color:'#b08050'},
 bunny:{label:'Coelhinho',defaultName:'Nuvem',icon:'🐰',color:'#e8dbff'},
 dragon:{label:'Dragãozinho',defaultName:'Faísca',icon:'🐲',color:'#5cdbb5'},
 pony:{label:'Pônei Estelar',defaultName:'Jujuba',icon:'🐴',color:'#a38df7'}
};
const ACCESSORIES=[
 {id:'none',icon:'✨',name:'Sem acessório',need:0},
 {id:'bow',icon:'🎀',name:'Laço',need:5},
 {id:'star',icon:'⭐',name:'Estrela',need:12},
 {id:'crown',icon:'👑',name:'Coroa',need:24}
];
const ACTION_TARGET={feed:'hunger',sleep:'energy',bath:'clean',hygiene:'clean',play:'fun',love:'love',study:'study'};
const ACTION_LABEL={feed:'Fome',sleep:'Energia',bath:'Higiene',hygiene:'Higiene',play:'Diversão',love:'Carinho',study:'Estudo'};
const EVOLUTION_STAGES=[
 {key:'baby',label:'Bebê',minAgeMs:0,minCare:0,nextAgeMs:12*60*60*1000,nextCare:10,nextLabel:'Criança'},
 {key:'child',label:'Criança',minAgeMs:12*60*60*1000,minCare:10,nextAgeMs:2*24*60*60*1000,nextCare:24,nextLabel:'Adolescente'},
 {key:'teen',label:'Adolescente',minAgeMs:2*24*60*60*1000,minCare:24,nextAgeMs:4*24*60*60*1000,nextCare:42,nextLabel:'Adulto'},
 {key:'adult',label:'Adulto',minAgeMs:4*24*60*60*1000,minCare:42,nextAgeMs:7*24*60*60*1000,nextCare:65,nextLabel:'Idoso'},
 {key:'elder',label:'Idoso',minAgeMs:7*24*60*60*1000,minCare:65,nextAgeMs:10*24*60*60*1000,nextCare:80,nextLabel:'Jornada das Estrelas'}
];
function defaultPet(){return{
 stage:'egg',species:null,name:'Ovinho misterioso',eggCare:0,careCount:0,bornAt:0,
 hunger:86,energy:86,clean:86,fun:86,love:90,study:80,
 accessory:'none',lastSeen:Date.now(),lastEggCareAt:0,
 lightsOff:false,sleepUntil:0,sleepStartedAt:0,
 rewards:{hatch:false,care10:false,care20:false}
}}
function clamp(n){return Math.max(0,Math.min(100,Math.round(Number(n)||0)))}
function pnow(){return Date.now()}
function rawLoad(){
 try{
   const saved=JSON.parse(pget(PET_KEY)||'{}');
   const p=Object.assign(defaultPet(),saved);
   if(!Object.prototype.hasOwnProperty.call(saved,'lightsOff') && Number(saved.sleepUntil||0)>pnow())p.lightsOff=true;
   if(p.stage!=='egg' && !p.bornAt)p.bornAt=Number(saved.lastSeen||saved.lastCareAt||pnow());
   p.hunger=clamp(p.hunger);p.energy=clamp(p.energy);p.clean=clamp(p.clean);p.fun=clamp(p.fun);p.love=clamp(p.love);p.study=clamp(p.study);
   return p;
 }catch(_){return defaultPet()}
}
function savePet(p,stamp=true){if(stamp)p.lastSeen=pnow();pset(PET_KEY,JSON.stringify(p));return p}
function isSleeping(p,now=pnow()){return p.lightsOff===true || Number(p.sleepUntil||0)>now}
function getPetAgeMs(p,now=pnow()){return p.stage==='egg'?0:Math.max(0, now-Number(p.bornAt||now))}
function formatDuration(ms){
 const min=Math.max(0,Math.ceil(ms/60000));
 if(min<60)return `${min} min`;
 const h=Math.floor(min/60),m=min%60;
 if(h<48)return `${h}h${m?` ${m}min`:''}`;
 const d=Math.floor(h/24),hr=h%24;
 return `${d} dia${d>1?'s':''}${hr?` e ${hr}h`:''}`;
}
function applyGentleDecay(p){
 if(p.stage==='egg')return p;
 const now=pnow(),last=Number(p.lastSeen||now),mins=Math.max(0,(now-last)/60000);
 if(mins<1)return p;
 // Se o bichinho ficou sem cuidados por mais de 48h ou com carinho/fome zerados por muito tempo, ele foge carinhosamente
 if((mins >= 48*60) || (mins >= 24*60 && p.hunger <= 5 && p.love <= 5)){
   p.ranAway = true;
   return savePet(p);
 }
 const capped=Math.min(mins,72*60);
 if(isSleeping(p,now)){
   p.energy=clamp(p.energy+capped*.72);
   p.hunger=clamp(p.hunger-capped*.025);
   p.clean=clamp(p.clean-capped*.012);
   p.fun=clamp(p.fun-capped*.008);
   p.love=clamp(p.love-capped*.004);
   p.study=clamp(p.study-capped*.006);
 }else{
   if(Number(p.sleepUntil||0)>0 && Number(p.sleepUntil)<=now){p.sleepUntil=0;p.sleepStartedAt=0;}
   p.hunger=clamp(p.hunger-capped*.050);
   p.energy=clamp(p.energy-capped*.034);
   p.clean=clamp(p.clean-capped*.030);
   p.fun=clamp(p.fun-capped*.024);
   p.love=clamp(p.love-capped*.012);
   p.study=clamp(p.study-capped*.025);
 }
 return savePet(p);
}
function loadPet(){return applyGentleDecay(rawLoad())}
function stageInfo(p){
 if(p.stage==='egg')return{key:'egg',label:'Ovinho',pct:Math.min(100,p.eggCare/EGG_CARE_GOAL*100),egg:true};
 const ageMs=getPetAgeMs(p);
 let current=EVOLUTION_STAGES[0];
 for(const st of EVOLUTION_STAGES){
   if(ageMs>=st.minAgeMs && Number(p.careCount||0)>=st.minCare)current=st;
 }
 if(!current.nextLabel)return {key:current.key,label:current.label,pct:100,nextLabel:null,remainingCare:0,remainingAgeMs:0};
 const careStart=current.minCare, careEnd=current.nextCare;
 const ageStart=current.minAgeMs, ageEnd=current.nextAgeMs;
 const carePct=((Number(p.careCount||0)-careStart)/Math.max(1,careEnd-careStart))*100;
 const agePct=((ageMs-ageStart)/Math.max(1,ageEnd-ageStart))*100;
 return {
   key:current.key,
   label:current.label,
   pct:Math.max(0,Math.min(100,Math.round((carePct+agePct)/2))),
   nextLabel:current.nextLabel,
   remainingCare:Math.max(0, careEnd-Number(p.careCount||0)),
   remainingAgeMs:Math.max(0, ageEnd-ageMs),
   currentAgeMs:ageMs
 };
}
function petGrade(p){return Math.max(0,Math.min(10,(Number(p.study||0)/10))).toFixed(1).replace('.',',')}
function moodText(p){
 if(isSleeping(p))return `${p.name} está dormindo com a luz apagada. Shhh... 🌙`;
 if(p.hunger<35)return `${p.name} está com fome e quer comer 🥣`;
 if(p.clean<35)return `${p.name} está sujinho e precisa de banho 🫧`;
 if(p.energy<35)return `${p.name} está cansado. Que tal apagar a luz? 🌙`;
 if(p.study<40)return `${p.name} está com saudade dos livros e quer estudar 📚`;
 if(p.fun<35||p.love<35)return `${p.name} está tristinho. Brincar e dar carinho vai ajudar 💗`;
 const avg=(p.hunger+p.energy+p.clean+p.fun+p.love+p.study)/6;
 if(avg>90)return `${p.name} está radiante! ✨`;
 if(avg>76)return `${p.name} está muito bem e feliz!`;
 if(avg>58)return `${p.name} está tranquilo. Escolha um cuidado quando precisar.`;
 return `${p.name} quer um pouco de atenção 💗`;
}
function speciesPick(){const keys=Object.keys(SPECIES);return keys[Math.floor(Math.random()*keys.length)];}
function rewardCareMilestones(p){
 if(p.careCount>=10&&!p.rewards.care10){p.rewards.care10=true;if(typeof addStars==='function')addStars(1,'Seu bichinho cresceu com seus cuidados! +1 ⭐')}
 if(p.careCount>=20&&!p.rewards.care20){p.rewards.care20=true;if(typeof addStars==='function')addStars(2,'Virou um grande companheiro! +2 ⭐')}
}
function visualAccessory(id){return id==='bow'?'🎀':id==='star'?'⭐':id==='crown'?'👑':''}
function eggWait(p){return Math.max(0,EGG_COOLDOWN_MS-(pnow()-Number(p.lastEggCareAt||0)))}
function isActionFull(p,action){const key=ACTION_TARGET[action];return !!key && clamp(p[key])>=100}
function renderStats(p){
 const box=document.getElementById('petStats');if(!box)return;
 const arr=[['🥣','Fome',p.hunger],['🎾','Diversão',p.fun],['⚡','Energia',p.energy],['💗','Carinho',p.love],['🫧','Higiene',p.clean],['📚','Estudo',p.study]];
 box.innerHTML=arr.map(([ic,n,v])=>`<div class="petStat"><div class="petStatHead"><span>${ic}</span><b>${n}</b><em>${clamp(v)}%</em></div><div class="petMeter"><i style="width:${clamp(v)}%"></i></div></div>`).join('');
 const grade=document.getElementById('petGrade');if(grade)grade.textContent=`📚 Nota: ${petGrade(p)} • ${p.study>=80?'Muito inteligente!':p.study>=60?'Indo bem':p.study>=40?'Hora de praticar':'Vamos estudar um pouquinho'}`;
}
function renderAccessories(p){const box=document.getElementById('petAccessoryGrid');if(!box)return;box.innerHTML=ACCESSORIES.map(a=>{const ok=p.careCount>=a.need,on=p.accessory===a.id;return `<button class="petAccessoryBtn ${on?'on':''} ${ok?'':'locked'}" onclick="choosePetAccessory('${a.id}')"><span>${ok?a.icon:'🔒'}</span><b>${a.name}</b>${ok?'':`<small>${a.need} cuidados</small>`}</button>`}).join('')}
function renderEggCooldown(p){
 const btn=document.getElementById('eggCareButton'),txt=document.getElementById('eggCooldownText');if(!btn||!txt)return;
 const wait=eggWait(p),can=wait<=0; btn.disabled=!can;btn.classList.toggle('cooling',!can);
 txt.textContent=can?'Aquecer e fazer carinho':`Próximo cuidado em ${formatDuration(wait)}`;
}
function renderCareStatus(p,st){
 const el=document.getElementById('petCareCooldown');if(!el)return;
 if(isSleeping(p)){el.textContent='🌙 Luz apagada • dormindo';return}
 if(st.nextLabel){
   const care=st.remainingCare>0?`${st.remainingCare} cuidado${st.remainingCare>1?'s':''}`:'cuidados completos';
   const time=st.remainingAgeMs>0?formatDuration(st.remainingAgeMs):'tempo completo';
   el.textContent=`Próxima fase: ${st.nextLabel} • faltam ${care} e ${time}`;
 }else{
   el.textContent='Fase final: Idoso 💗 Continue cuidando com carinho.';
 }
}
function renderCareButtons(p){
 const sleeping=isSleeping(p);
 document.querySelectorAll('[data-pet-action]').forEach(btn=>{
   const action=btn.dataset.petAction;
   const b=btn.querySelector('b'),sm=btn.querySelector('small'),icon=btn.querySelector('span');
   btn.classList.remove('petFull');
   if(action==='sleep'){
     if(sleeping){
       if(b)b.textContent='Acender luz';if(sm)sm.textContent='Acordar';if(icon)icon.textContent='💡';btn.disabled=false;return;
     }
     if(b)b.textContent='Apagar luz';if(sm)sm.textContent='Dormir';if(icon)icon.textContent='🌙';btn.disabled=false;
   }
   const full=isActionFull(p,action);
   btn.disabled=(sleeping&&action!=='sleep')||(!sleeping&&full);
   if(full&&!sleeping){btn.classList.add('petFull');btn.title=`${ACTION_LABEL[action]} já está em 100%`;}else btn.removeAttribute('title');
 });
}
function applyVisualState(p,creature,screen){
 const sleeping=isSleeping(p),avg=(p.hunger+p.energy+p.clean+p.fun+p.love+p.study)/6;
 ['dirty','tired','sleeping','hungry','sad','studyLow','radiant'].forEach(c=>creature.classList.remove(c));
 if(!sleeping){
   creature.classList.toggle('hungry',p.hunger<35);
   creature.classList.toggle('dirty',p.clean<40);
   creature.classList.toggle('tired',p.energy<35);
   creature.classList.toggle('studyLow',p.study<40);
   creature.classList.toggle('sad',p.fun<35||p.love<35);
   creature.classList.toggle('radiant',avg>=90&&Math.min(p.hunger,p.energy,p.clean,p.fun,p.love,p.study)>=70);
 }
 creature.classList.toggle('sleeping',sleeping);
 screen?.classList.toggle('petNight',sleeping);
}
function clearActionFx(){
 const screen=document.querySelector('#petPanel .petScreen'),fx=document.getElementById('petActionFx'),creature=document.getElementById('petCreature');
 if(screen)Array.from(screen.classList).filter(c=>c.startsWith('petAct-')).forEach(c=>screen.classList.remove(c));
 if(fx){fx.className='petActionFx';fx.innerHTML='';}
 if(creature)Array.from(creature.classList).filter(c=>c.startsWith('acting-')).forEach(c=>creature.classList.remove(c));
}
let actionFxTimer=0;
function startPetAnimation(action){
 clearTimeout(actionFxTimer);clearActionFx();
 const screen=document.querySelector('#petPanel .petScreen'),fx=document.getElementById('petActionFx'),creature=document.getElementById('petCreature');
 if(!screen||!fx||!creature)return;
 screen.classList.add(`petAct-${action}`);creature.classList.add(`acting-${action}`);fx.classList.add(`fx-${action}`);
 const labels={feed:'Comendo...',bath:'Banho!',hygiene:'Escovando...',play:'Brincando!',love:'Carinho!',study:'Estudando...'};
 if(labels[action])fx.innerHTML=`<i></i><b>${labels[action]}</b>`;
 actionFxTimer=setTimeout(clearActionFx,1550);
}
function renderPet(){
 const p=loadPet(),st=stageInfo(p),egg=document.getElementById('petEgg'),creature=document.getElementById('petCreature'),eggBox=document.getElementById('petEggControls'),care=document.getElementById('petCareArea'),bubble=document.getElementById('petBubble'),stage=document.getElementById('petStageLabel'),name=document.getElementById('petNameLabel'),rename=document.getElementById('petRenameBtn'),screen=document.querySelector('#petPanel .petScreen'),stats=document.getElementById('petStats');if(!egg||!creature)return;
 stage.textContent=st.label;name.textContent=p.name;rename.style.visibility=p.stage==='egg'?'hidden':'visible';
 const reset=document.getElementById('petResetBtn');if(reset)reset.style.visibility=p.stage==='egg'?'hidden':'visible';
 
 if(p.ranAway){
   screen?.classList.remove('petNight');
   egg.classList.add('hidden');
   creature.className = 'petCreature hidden';
   eggBox.classList.add('hidden');
   care.classList.add('hidden');
   stats?.classList.add('hidden');
   bubble.textContent = 'O seu bichinho deixou uma cartinha para você... 💌';
   let runEl = document.getElementById('petRunawayOverlay');
   if(!runEl){
     runEl = document.createElement('div');
     runEl.id = 'petRunawayOverlay';
     runEl.className = 'petRunawayBox';
     screen.appendChild(runEl);
   }
   runEl.innerHTML = `<div class="runawayCard">
     <div style="font-size:38px;margin-bottom:8px">💌</div>
     <h3 style="margin:0 0 8px;font-size:17px;color:#d84376">Uma cartinha com carinho...</h3>
     <p style="font-size:12px;line-height:1.45;color:#4f3d54;margin:0 0 14px">"Querida Elo, como fiquei com muita fominha e senti falta de brincar, fui passear pelos campos floridos do Reino das Estrelas em busca de um abraço quentinho... 🌸<br><br>Mas deixei um novo ovinho especial para você recomeçar com todo o seu amor!"</p>
     <button class="btn" style="width:100%" onclick="resetPetAfterRunaway()">Cuidar do novo ovinho 🐣💗</button>
   </div>`;
   runEl.classList.remove('hidden');
   return;
 } else {
   const runEl = document.getElementById('petRunawayOverlay');
   if(runEl) runEl.classList.add('hidden');
 }

 if(p.stage==='egg'){
   screen?.classList.remove('petNight');egg.classList.remove('hidden');creature.className='petCreature hidden';eggBox.classList.remove('hidden');care.classList.add('hidden');stats?.classList.add('hidden');clearActionFx();
   document.getElementById('eggCareText').textContent=`${p.eggCare}/${EGG_CARE_GOAL} cuidados`;
   document.getElementById('eggCareBar').style.width=`${st.pct}%`;
   bubble.textContent=p.eggCare===0?'Cuide do ovo para descobrir quem vai nascer! 💗':p.eggCare<3?'O ovinho mexeu um pouquinho! ✨':p.eggCare<EGG_CARE_GOAL-1?'Seu ovinho está se desenvolvendo! 💗':'Está quase na hora de nascer! ✨';
   renderEggCooldown(p);return;
 }
 egg.classList.add('hidden');eggBox.classList.add('hidden');care.classList.remove('hidden');stats?.classList.remove('hidden');creature.className=`petCreature species-${p.species} stage-${st.key}`;
 document.getElementById('petAccessory').textContent=visualAccessory(p.accessory);
 applyVisualState(p,creature,screen);bubble.textContent=moodText(p);renderStats(p);renderAccessories(p);renderCareButtons(p);renderCareStatus(p,st);
 document.getElementById('petGrowthText').textContent=`Crescimento • ${st.label}`;
 if(st.nextLabel){
   const careTxt=st.remainingCare>0?`${st.remainingCare} cuidado${st.remainingCare>1?'s':''}`:'cuidados completos';
   const timeTxt=st.remainingAgeMs>0?formatDuration(st.remainingAgeMs):'tempo completo';
   document.getElementById('petGrowthSub').textContent=`Próxima fase: ${st.nextLabel}. Faltam ${careTxt} e ${timeTxt}.`;
 }else{
   document.getElementById('petGrowthSub').textContent=`Seu companheiro chegou à fase Idoso com ${p.careCount} cuidados e muito carinho.`;
 }
 document.getElementById('petGrowthBar').style.width=`${st.pct}%`;
 // Botão de Jornada das Estrelas caso tenha concluído a fase Idoso
 const ascBtn = document.getElementById('petAscensionBtn');
 if(ascBtn){
   if(st.key === 'elder' && Number(p.careCount||0) >= 80){
     ascBtn.classList.remove('hidden');
   } else {
     ascBtn.classList.add('hidden');
   }
 }
 checkPetNotifications(p);
}
window.renderPet=renderPet;

// Notificações locais do Bichinho da Elo
function checkPetNotifications(p){
 if(!p || p.stage==='egg' || p.ranAway) return;
 if(!('Notification' in window)) return;
 if(Notification.permission === 'granted'){
   const now = pnow();
   const lastNotif = Number(localStorage.getItem('eloPetLastNotif')||0);
   if(now - lastNotif > 4 * 60 * 60 * 1000){
     if(p.hunger < 35){
       try{ new Notification('Dia a Dia da Elo 🐾', { body: `${p.name} está com fominha! Venha dar uma comidinha deliciosa 🍓`, icon: 'assets/icons/icon-192.png' }); }catch(_){}
       localStorage.setItem('eloPetLastNotif', String(now));
     } else if(p.energy < 30 && !isSleeping(p)){
       try{ new Notification('Dia a Dia da Elo 🐾', { body: `${p.name} está com sono e bocejando! Venha colocar para dormir 💤`, icon: 'assets/icons/icon-192.png' }); }catch(_){}
       localStorage.setItem('eloPetLastNotif', String(now));
     } else if(p.love < 35){
       try{ new Notification('Dia a Dia da Elo 🐾', { body: `${p.name} está com saudades! Venha dar um carinho 💗`, icon: 'assets/icons/icon-192.png' }); }catch(_){}
       localStorage.setItem('eloPetLastNotif', String(now));
     }
   }
 }
}

window.requestPetNotifications = function(){
 if('Notification' in window && Notification.permission === 'default'){
   Notification.requestPermission();
 }
};

window.resetPetAfterRunaway = function(){
 const p = defaultPet();
 p.lastSeen = pnow();
 savePet(p);
 renderPet();
 toast('Um novo ovinho brilhante apareceu! Cuide com muito amor 🐣💗');
};

window.startPetAscension = function(){
 const p = loadPet();
 if(p.stage === 'egg') return;
 if(confirm(`Parabéns! ${p.name} viveu plenamente com você! Deseja que ele realize a grande Jornada das Estrelas e ganhe asas celestes? (+25 ⭐ de presente!)`)){
   if(typeof addStars === 'function') addStars(25, `${p.name} voou para a Constelação das Estrelas! +25 ⭐`);
   toast(`✨ ${p.name} agora brilha no céu e deixou um novo ovinho para você! ✨`);
   const newP = defaultPet();
   newP.lastSeen = pnow();
   savePet(newP);
   renderPet();
 }
};

window.openPet=function(){openPanel('petPanel','home');if('Notification' in window && Notification.permission==='default')setTimeout(requestPetNotifications,1200);renderPet()};
window.careForEgg=function(){
 const p=rawLoad();if(p.stage!=='egg')return renderPet();
 const wait=eggWait(p);if(wait>0){toast(`Espere ${formatDuration(wait)} para cuidar do ovo novamente 💗`);return}
 p.lastEggCareAt=pnow();p.eggCare=Math.min(EGG_CARE_GOAL,Number(p.eggCare||0)+1);
 if(p.eggCare>=EGG_CARE_GOAL){
   p.stage='baby';p.species=speciesPick();p.name=SPECIES[p.species].defaultName;p.hunger=p.energy=p.clean=p.fun=p.love=92;p.study=80;p.lightsOff=false;p.sleepUntil=0;p.bornAt=pnow();
   if(!p.rewards.hatch){p.rewards.hatch=true;if(typeof addStars==='function')addStars(2,'Seu bichinho nasceu! +2 ⭐')}
   savePet(p);renderPet();const label=SPECIES[p.species].label;toast(`Nasceu um ${label}! 💗`);if(typeof speakText==='function')setTimeout(()=>speakText(`Que surpresa! Nasceu ${p.name}, seu novo ${label}.`),180);return;
 }
 savePet(p);renderPet();toast('O ovinho adorou o carinho 💗');
};
window.petAction=function(action){
 const p=loadPet();if(p.stage==='egg')return careForEgg();
 const now=pnow(),sleeping=isSleeping(p,now);
 if(action==='sleep'&&sleeping){
   p.lightsOff=false;p.sleepUntil=0;p.sleepStartedAt=0;savePet(p);clearActionFx();renderPet();toast(`${p.name} acordou! A luz foi acesa ☀️`);return;
 }
 if(sleeping)return toast(`${p.name} está dormindo. Acenda a luz para acordar 🌙`);
 if(isActionFull(p,action))return toast(`${ACTION_LABEL[action]} já está em 100% ✨`);
 let msg='',anim='';
 if(action==='feed'){p.hunger=clamp(p.hunger+24);p.energy=clamp(p.energy+3);msg='Que delícia! 🥣';anim='feed'}
 else if(action==='bath'){p.clean=clamp(p.clean+32);p.love=clamp(p.love+4);msg='Banho tomado! Tudo limpinho ✨';anim='bath'}
 else if(action==='hygiene'){p.clean=clamp(p.clean+16);p.love=clamp(p.love+2);msg='Dentinhos escovados! 🪥✨';anim='hygiene'}
 else if(action==='play'){p.fun=clamp(p.fun+24);p.love=clamp(p.love+5);p.energy=clamp(p.energy-7);p.hunger=clamp(p.hunger-4);msg='Que brincadeira divertida! 🎾';anim='play'}
 else if(action==='sleep'){p.lightsOff=true;p.sleepStartedAt=now;p.sleepUntil=0;p.energy=clamp(p.energy+4);p.hunger=clamp(p.hunger-1);msg='Boa noite! A luz foi apagada 🌙'}
 else if(action==='study'){p.study=clamp(p.study+20);p.energy=clamp(p.energy-5);p.fun=clamp(p.fun-2);msg=`Estudo concluído! Nota ${petGrade(p)} 📚`;anim='study'}
 else {p.love=clamp(p.love+24);p.fun=clamp(p.fun+5);msg='Carinho recebido! 💗';anim='love'}
 p.careCount=Number(p.careCount||0)+1;rewardCareMilestones(p);savePet(p);renderPet();if(anim)startPetAnimation(anim);const bubble=document.getElementById('petBubble');if(bubble)bubble.textContent=msg;toast(msg);
};
window.resetPetProgress=function(){if(!confirm('Deseja reiniciar o bichinho e voltar para o ovo?'))return;savePet(defaultPet());clearActionFx();renderPet();toast('Tudo pronto! O bichinho voltou para o ovo 🥚')};
window.renamePet=function(){const p=loadPet();if(p.stage==='egg')return;const val=(prompt('Qual será o nome do seu bichinho?',p.name)||'').trim().slice(0,16);if(!val)return;p.name=val;savePet(p);renderPet();toast(`Agora ele se chama ${val} 💗`)};
window.choosePetAccessory=function(id){const p=loadPet(),a=ACCESSORIES.find(x=>x.id===id);if(!a)return;if(p.careCount<a.need)return toast(`Libera com ${a.need} cuidados 💗`);p.accessory=id;savePet(p);renderPet();toast(`${a.name} escolhido! ✨`)};
window.petSpeakStatus=function(){
 const p=loadPet();if(typeof speakText!=='function')return;
 if(p.stage==='egg')return speakText('Este é um ovinho misterioso. Cuide dele cinco vezes, respeitando o tempo entre os cuidados, para descobrir quem vai nascer.');
 const st=stageInfo(p);
 let evo='';
 if(st.nextLabel)evo=`Ele está na fase ${st.label} e a próxima fase será ${st.nextLabel}.`;
 else evo=`Ele já chegou à fase idoso.`;
 speakText(`${p.name} é seu bichinho virtual. ${moodText(p)} ${evo} A nota dele é ${petGrade(p)}.`);
};
const oldOpenPanelPet=window.openPanel;
window.openPanel=function(id,nav,fromHistory=false){oldOpenPanelPet(id,nav,fromHistory);if(id==='petPanel')renderPet()};
let petTicker=null;
window.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet();petTicker=setInterval(()=>{const active=document.getElementById('petPanel')?.classList.contains('active'),fx=document.getElementById('petActionFx');if(active&&!fx?.className.includes('fx-'))renderPet()},1000)});
window.loadPet = loadPet;
window.rawLoad = rawLoad;
window.savePet = savePet;
window.defaultPet = defaultPet;
window.getPetData = loadPet;
})();
