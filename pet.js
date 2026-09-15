/* Dia a Dia da Elo — Bichinho da Elo v2 • integrado à v3.1.1 */
(function(){
'use strict';
const PET_KEY='eloVirtualPetV1';
const EGG_CARE_GOAL=5;
const EGG_COOLDOWN_MS=5*60*1000;
const CARE_COOLDOWN_MS=30*1000;
const SLEEP_MS=30*60*1000;
const SPECIES={
 unicorn:{label:'Unicórnio',defaultName:'Luma'},
 cat:{label:'Gatinho',defaultName:'Pipoca'},
 dog:{label:'Cachorrinho',defaultName:'Pingo'},
 bunny:{label:'Coelhinho',defaultName:'Nuvem'}
};
const ACCESSORIES=[
 {id:'none',icon:'✨',name:'Sem acessório',need:0},
 {id:'bow',icon:'🎀',name:'Laço',need:5},
 {id:'star',icon:'⭐',name:'Estrela',need:12},
 {id:'crown',icon:'👑',name:'Coroa',need:24}
];
function defaultPet(){return{
 stage:'egg',species:null,name:'Ovinho misterioso',eggCare:0,careCount:0,
 hunger:86,energy:86,clean:86,fun:86,love:90,study:80,
 accessory:'none',lastSeen:Date.now(),lastEggCareAt:0,lastCareAt:0,
 sleepUntil:0,sleepStartedAt:0,
 rewards:{hatch:false,care10:false,care20:false}
}}
function clamp(n){return Math.max(0,Math.min(100,Math.round(Number(n)||0)))}
function rawLoad(){try{return Object.assign(defaultPet(),JSON.parse(pget(PET_KEY)||'{}'))}catch(_){return defaultPet()}}
function savePet(p,stamp=true){if(stamp)p.lastSeen=Date.now();pset(PET_KEY,JSON.stringify(p));return p}
function isSleeping(p,now=Date.now()){return Number(p.sleepUntil||0)>now}
function applyGentleDecay(p){
 if(p.stage==='egg')return p;
 const now=Date.now(),last=Number(p.lastSeen||now),mins=Math.max(0,(now-last)/60000);
 if(mins<1)return p;
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
 if(p.stage==='egg')return{key:'egg',label:'Ovinho',next:EGG_CARE_GOAL,pct:Math.min(100,p.eggCare/EGG_CARE_GOAL*100)};
 if(p.careCount<8)return{key:'baby',label:'Filhote',next:8,pct:p.careCount/8*100};
 if(p.careCount<20)return{key:'young',label:'Jovem',next:20,pct:(p.careCount-8)/12*100};
 return{key:'friend',label:'Companheiro',next:20,pct:100};
}
function petGrade(p){return Math.max(0,Math.min(10,(Number(p.study||0)/10))).toFixed(1).replace('.',',')}
function moodText(p){
 if(isSleeping(p))return `${p.name} está dormindo. Shhh... 🌙`;
 if(p.clean<35)return `${p.name} precisa de banho e higiene 🫧`;
 if(p.energy<35)return `${p.name} está cansado e precisa dormir 🌙`;
 if(p.study<45)return `${p.name} quer estudar para melhorar a nota 📚`;
 const avg=(p.hunger+p.energy+p.clean+p.fun+p.love+p.study)/6;
 if(avg>84)return `${p.name} está radiante! ✨`;
 if(avg>68)return `${p.name} está muito bem e quer brincar.`;
 if(avg>52)return `${p.name} está tranquilo. Que tal um carinho?`;
 return `${p.name} quer um pouco de atenção. Escolha um cuidado abaixo 💗`;
}
function speciesPick(){const seed=(Date.now()+String(activeProfileId||'elo').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%4;return Object.keys(SPECIES)[seed]}
function rewardCareMilestones(p){
 if(p.careCount>=10&&!p.rewards.care10){p.rewards.care10=true;if(typeof addStars==='function')addStars(1,'Seu bichinho cresceu com seus cuidados! +1 ⭐')}
 if(p.careCount>=20&&!p.rewards.care20){p.rewards.care20=true;if(typeof addStars==='function')addStars(2,'Virou um grande companheiro! +2 ⭐')}
}
function visualAccessory(id){return id==='bow'?'🎀':id==='star'?'⭐':id==='crown'?'👑':''}
function formatWait(ms){const sec=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(sec/60),s=sec%60;return m>0?`${m}:${String(s).padStart(2,'0')}`:`0:${String(s).padStart(2,'0')}`}
function eggWait(p){return Math.max(0,EGG_COOLDOWN_MS-(Date.now()-Number(p.lastEggCareAt||0)))}
function careWait(p){return Math.max(0,CARE_COOLDOWN_MS-(Date.now()-Number(p.lastCareAt||0)))}
function renderStats(p){
 const box=document.getElementById('petStats');if(!box)return;
 const arr=[['🥣','Fome',p.hunger],['⚡','Energia',p.energy],['🫧','Higiene',p.clean],['🎾','Diversão',p.fun],['💗','Carinho',p.love],['📚','Estudo',p.study]];
 box.innerHTML=arr.map(([ic,n,v])=>`<div class="petStat"><span>${ic}</span><b>${n}</b><div class="petMeter"><i style="width:${v}%"></i></div></div>`).join('');
 const grade=document.getElementById('petGrade');if(grade)grade.textContent=`📚 Nota: ${petGrade(p)} • ${p.study>=80?'Muito inteligente!':p.study>=60?'Indo bem':p.study>=40?'Precisa estudar':'Hora de estudar'}`;
}
function renderAccessories(p){const box=document.getElementById('petAccessoryGrid');if(!box)return;box.innerHTML=ACCESSORIES.map(a=>{const ok=p.careCount>=a.need,on=p.accessory===a.id;return `<button class="petAccessoryBtn ${on?'on':''} ${ok?'':'locked'}" onclick="choosePetAccessory('${a.id}')"><span>${ok?a.icon:'🔒'}</span><b>${a.name}</b>${ok?'':`<small>${a.need} cuidados</small>`}</button>`}).join('')}
function renderEggCooldown(p){
 const btn=document.getElementById('eggCareButton'),txt=document.getElementById('eggCooldownText');if(!btn||!txt)return;
 const wait=eggWait(p),can=wait<=0;
 btn.disabled=!can;
 btn.classList.toggle('cooling',!can);
 txt.textContent=can?'Aquecer e fazer carinho':`Próximo cuidado em ${formatWait(wait)}`;
}
function renderCareCooldown(p){
 const el=document.getElementById('petCareCooldown'),wait=careWait(p),sleep=isSleeping(p);if(el)el.textContent=sleep?'🌙 Dormindo com a luz apagada':wait>0?`⏱️ Próximo cuidado em ${formatWait(wait)}`:'Pronto para cuidar 💗';
 document.querySelectorAll('[data-pet-action]').forEach(btn=>{
   const action=btn.dataset.petAction;
   btn.disabled=(sleep&&action!=='sleep')||(!sleep&&wait>0);
   if(action==='sleep'){
     const b=btn.querySelector('b'),sm=btn.querySelector('small');
     if(b)b.textContent=sleep?'Acordar':'Dormir';
     if(sm)sm.textContent=sleep?'Despertar':'Energia';
     btn.disabled=false;
   }
 });
}
function applyVisualState(p,creature,screen){
 const sleeping=isSleeping(p);
 creature.classList.toggle('dirty',p.clean<40&&!sleeping);
 creature.classList.toggle('tired',p.energy<38&&!sleeping);
 creature.classList.toggle('sleeping',sleeping);
 screen?.classList.toggle('petNight',sleeping);
}
function renderPet(){
 const p=loadPet(),st=stageInfo(p),egg=document.getElementById('petEgg'),creature=document.getElementById('petCreature'),eggBox=document.getElementById('petEggControls'),care=document.getElementById('petCareArea'),bubble=document.getElementById('petBubble'),stage=document.getElementById('petStageLabel'),name=document.getElementById('petNameLabel'),rename=document.getElementById('petRenameBtn'),screen=document.querySelector('#petPanel .petScreen');if(!egg||!creature)return;
 stage.textContent=st.label;name.textContent=p.name;rename.style.visibility=p.stage==='egg'?'hidden':'visible';
 if(p.stage==='egg'){
   screen?.classList.remove('petNight');egg.classList.remove('hidden');creature.className='petCreature hidden';eggBox.classList.remove('hidden');care.classList.add('hidden');
   document.getElementById('eggCareText').textContent=`${p.eggCare}/${EGG_CARE_GOAL} cuidados`;
   document.getElementById('eggCareBar').style.width=`${st.pct}%`;
   bubble.textContent=p.eggCare===0?'Cuide do ovo para descobrir quem vai nascer! 💗':p.eggCare<3?'O ovinho mexeu um pouquinho! ✨':p.eggCare<EGG_CARE_GOAL-1?'Seu ovinho está se desenvolvendo! 💗':'Está quase na hora de nascer! ✨';
   renderEggCooldown(p);return;
 }
 egg.classList.add('hidden');eggBox.classList.add('hidden');care.classList.remove('hidden');creature.className=`petCreature species-${p.species} stage-${st.key}`;
 document.getElementById('petAccessory').textContent=visualAccessory(p.accessory);
 applyVisualState(p,creature,screen);bubble.textContent=moodText(p);renderStats(p);renderAccessories(p);renderCareCooldown(p);
 document.getElementById('petGrowthText').textContent=st.key==='friend'?'Companheiro completo ✨':`Crescimento • ${st.label}`;
 document.getElementById('petGrowthSub').textContent=st.key==='friend'?`${p.careCount} cuidados e muitas brincadeiras.`:`${p.careCount}/${st.next} cuidados para a próxima fase.`;
 document.getElementById('petGrowthBar').style.width=`${st.pct}%`;
}
window.renderPet=renderPet;
window.openPet=function(){openPanel('petPanel','home');renderPet()};
window.careForEgg=function(){
 const p=rawLoad();if(p.stage!=='egg')return renderPet();
 const wait=eggWait(p);if(wait>0){toast(`Espere ${formatWait(wait)} para cuidar do ovo novamente 💗`);return}
 p.lastEggCareAt=Date.now();p.eggCare=Math.min(EGG_CARE_GOAL,Number(p.eggCare||0)+1);
 if(p.eggCare>=EGG_CARE_GOAL){
   p.stage='baby';p.species=speciesPick();p.name=SPECIES[p.species].defaultName;p.hunger=p.energy=p.clean=p.fun=p.love=92;p.study=80;p.lastCareAt=0;
   if(!p.rewards.hatch){p.rewards.hatch=true;if(typeof addStars==='function')addStars(2,'Seu bichinho nasceu! +2 ⭐')}
   savePet(p);renderPet();const label=SPECIES[p.species].label;toast(`Nasceu um ${label}! 💗`);if(typeof speakText==='function')setTimeout(()=>speakText(`Que surpresa! Nasceu ${p.name}, seu novo ${label}.`),180);return;
 }
 savePet(p);renderPet();toast('O ovinho adorou o carinho 💗');
};
function react(cls){const el=document.getElementById('petCreature');if(!el)return;el.classList.remove('react','sleepy','cleanSparkle','loveBurst','studySparkle');void el.offsetWidth;el.classList.add(cls||'react');setTimeout(()=>{el.classList.remove('react','cleanSparkle','loveBurst','studySparkle');if(cls==='sleepy')setTimeout(()=>el.classList.remove('sleepy'),650)},700)}
window.petAction=function(action){
 const p=loadPet();if(p.stage==='egg')return careForEgg();
 const now=Date.now(),sleeping=isSleeping(p,now);
 if(action==='sleep'&&sleeping){p.sleepUntil=0;p.sleepStartedAt=0;p.lastCareAt=0;savePet(p);renderPet();toast(`${p.name} acordou! ☀️`);return}
 if(sleeping)return toast(`${p.name} está dormindo agora 🌙`);
 const wait=careWait(p);if(wait>0)return toast(`Espere ${formatWait(wait)} para fazer outro cuidado 💗`);
 let msg='';
 if(action==='feed'){p.hunger=clamp(p.hunger+24);p.energy=clamp(p.energy+3);msg='Que delícia! 🥣';react('react')}
 else if(action==='bath'){p.clean=clamp(p.clean+32);p.love=clamp(p.love+4);msg='Banho tomado! Tudo limpinho ✨';react('cleanSparkle')}
 else if(action==='hygiene'){p.clean=clamp(p.clean+16);p.love=clamp(p.love+2);msg='Higiene em dia! 🪥✨';react('cleanSparkle')}
 else if(action==='play'){p.fun=clamp(p.fun+24);p.love=clamp(p.love+5);p.energy=clamp(p.energy-7);p.hunger=clamp(p.hunger-4);msg='Que brincadeira divertida! 🎾';react('react')}
 else if(action==='sleep'){p.sleepStartedAt=now;p.sleepUntil=now+SLEEP_MS;p.energy=clamp(p.energy+8);p.hunger=clamp(p.hunger-2);msg='Boa noite! A luz foi apagada 🌙';react('sleepy')}
 else if(action==='study'){p.study=clamp(p.study+20);p.energy=clamp(p.energy-5);p.fun=clamp(p.fun-2);msg=`Estudo concluído! Nota ${petGrade(p)} 📚`;react('studySparkle')}
 else {p.love=clamp(p.love+24);p.fun=clamp(p.fun+5);msg='Carinho recebido! 💗';react('loveBurst')}
 p.lastCareAt=now;p.careCount=Number(p.careCount||0)+1;rewardCareMilestones(p);savePet(p);renderPet();const bubble=document.getElementById('petBubble');if(bubble)bubble.textContent=msg;toast(msg);
};
window.renamePet=function(){const p=loadPet();if(p.stage==='egg')return;const val=(prompt('Qual será o nome do seu bichinho?',p.name)||'').trim().slice(0,16);if(!val)return;p.name=val;savePet(p);renderPet();toast(`Agora ele se chama ${val} 💗`)};
window.choosePetAccessory=function(id){const p=loadPet(),a=ACCESSORIES.find(x=>x.id===id);if(!a)return;if(p.careCount<a.need)return toast(`Libera com ${a.need} cuidados 💗`);p.accessory=id;savePet(p);renderPet();toast(`${a.name} escolhido! ✨`)};
window.petSpeakStatus=function(){const p=loadPet();if(typeof speakText!=='function')return;if(p.stage==='egg')speakText(`Este é um ovinho misterioso. Cuide dele cinco vezes, respeitando o tempo entre os cuidados, para descobrir quem vai nascer.`);else speakText(`${p.name} é seu bichinho virtual. ${moodText(p)} A nota dele é ${petGrade(p)}.`)};
const oldOpenPanelPet=window.openPanel;
window.openPanel=function(id,nav,fromHistory=false){oldOpenPanelPet(id,nav,fromHistory);if(id==='petPanel')renderPet()};
let petTicker=null;
window.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet();petTicker=setInterval(()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet()},1000)});
})();
