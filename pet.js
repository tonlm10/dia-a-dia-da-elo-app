/* Dia a Dia da Elo — Bichinho da Elo v1.2 • integrado à v3.1.2 */
(function(){
'use strict';
const PET_KEY='eloVirtualPetV1';
const EGG_CARE_GOAL=5;
const EGG_COOLDOWN_MS=5*60*1000;
const ACTION_COOLDOWN_MS=45*1000;
const SLEEP_DURATION_MS=10*60*1000;
const DECAY_PER_HOUR={hunger:4.4,energy:2.2,clean:2.6,fun:2.5,love:1.2,study:1.8};
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
const ACTION_LABELS={feed:'Comida',sleep:'Dormir',bath:'Banho',hygiene:'Higiene',play:'Brincar',love:'Carinho',study:'Estudar'};
function defaultPet(){return{stage:'egg',species:null,name:'Ovinho misterioso',eggCare:0,eggLastCare:0,careCount:0,hunger:86,energy:86,clean:86,fun:86,love:90,study:78,accessory:'none',lastSeen:Date.now(),lastDecay:Date.now(),lastActions:{},sleepUntil:0,rewards:{hatch:false,care10:false,care20:false}}}
function clamp(n){return Math.max(10,Math.min(100,Number(n)||0))}
function normalizePet(raw){const d=defaultPet(),p=Object.assign({},d,raw||{});p.rewards=Object.assign({},d.rewards,(raw&&raw.rewards)||{});p.lastActions=Object.assign({},d.lastActions,(raw&&raw.lastActions)||{});if(p.study==null)p.study=78;if(!p.lastDecay)p.lastDecay=p.lastSeen||Date.now();if(!p.eggLastCare)p.eggLastCare=0;if(!p.sleepUntil)p.sleepUntil=0;return p}
function rawLoad(){try{return normalizePet(JSON.parse(pget(PET_KEY)||'{}'))}catch(_){return defaultPet()}}
function rawSave(p){p.lastSeen=Date.now();pset(PET_KEY,JSON.stringify(p));return p}
function applyTimedDecay(p){if(p.stage==='egg')return p;const now=Date.now(),last=Number(p.lastDecay||p.lastSeen||now),hours=Math.max(0,(now-last)/3600000);if(hours<=0)return p;for(const [key,rate] of Object.entries(DECAY_PER_HOUR)){p[key]=clamp(Number(p[key]||0)-rate*hours)}p.lastDecay=now;return rawSave(p)}
function loadPet(){return applyTimedDecay(rawLoad())}
function stageInfo(p){if(p.stage==='egg')return{key:'egg',label:'Ovinho',next:EGG_CARE_GOAL,pct:Math.min(100,p.eggCare/EGG_CARE_GOAL*100)};if(p.careCount<8)return{key:'baby',label:'Filhote',next:8,pct:p.careCount/8*100};if(p.careCount<20)return{key:'young',label:'Jovem',next:20,pct:(p.careCount-8)/12*100};return{key:'friend',label:'Companheiro',next:20,pct:100}}
function grade(p){return Math.max(0,Math.min(10,p.study/10))}
function formatGrade(p){return grade(p).toFixed(1).replace('.',',')}
function isSleeping(p){return Number(p.sleepUntil||0)>Date.now()}
function moodText(p){if(isSleeping(p))return `${p.name} está dormindo. Zzz... 🌙`;if(p.clean<38)return `${p.name} está precisando de banho. 🫧`;if(p.energy<38)return `${p.name} está cansado e quer dormir. 😴`;if(p.hunger<38)return `${p.name} está com fome. 🥣`;if(p.study<42)return `${p.name} precisa estudar um pouco. 📚`;const avg=(p.hunger+p.energy+p.clean+p.fun+p.love+p.study)/6;if(avg>84)return `${p.name} está radiante! ✨`;if(avg>68)return `${p.name} está muito bem e quer brincar.`;if(avg>52)return `${p.name} está tranquilo. Que tal um carinho?`;return `${p.name} quer um pouco de atenção. Escolha um cuidado abaixo 💗`}
function speciesPick(){const seed=(Date.now()+String(activeProfileId||'elo').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%4;return Object.keys(SPECIES)[seed]}
function rewardCareMilestones(p){if(p.careCount>=10&&!p.rewards.care10){p.rewards.care10=true;if(typeof addStars==='function')addStars(1,'Seu bichinho cresceu com seus cuidados! +1 ⭐')}if(p.careCount>=20&&!p.rewards.care20){p.rewards.care20=true;if(typeof addStars==='function')addStars(2,'Virou um grande companheiro! +2 ⭐')}}
function visualAccessory(id){return id==='bow'?'🎀':id==='star'?'⭐':id==='crown'?'👑':''}
function msLabel(ms){if(ms<=0)return 'Pronto';const sec=Math.ceil(ms/1000);if(sec<60)return `${sec}s`;const min=Math.floor(sec/60),s=sec%60;return `${min}:${String(s).padStart(2,'0')}`}
function eggCooldownLeft(p){return Math.max(0,EGG_COOLDOWN_MS-(Date.now()-Number(p.eggLastCare||0)))}
function actionCooldownLeft(p,action){return Math.max(0,ACTION_COOLDOWN_MS-(Date.now()-Number((p.lastActions||{})[action]||0)))}
function renderStats(p){const box=document.getElementById('petStats');if(!box)return;const arr=[['🥣','Fome',p.hunger,''],['⚡','Energia',p.energy,''],['🫧','Higiene',p.clean,''],['🎾','Diversão',p.fun,''],['💗','Carinho',p.love,''],['📚','Estudo',p.study,`Nota ${formatGrade(p)}`]];box.innerHTML=arr.map(([ic,n,v,sub])=>`<div class="petStat"><span>${ic}</span><b>${n}</b>${sub?`<small>${sub}</small>`:''}<div class="petMeter"><i style="width:${Math.round(v)}%"></i></div></div>`).join('')}
function renderAccessories(p){const box=document.getElementById('petAccessoryGrid');if(!box)return;box.innerHTML=ACCESSORIES.map(a=>{const ok=p.careCount>=a.need,on=p.accessory===a.id;return `<button class="petAccessoryBtn ${on?'on':''} ${ok?'':'locked'}" onclick="choosePetAccessory('${a.id}')"><span>${ok?a.icon:'🔒'}</span><b>${a.name}</b>${ok?'':`<small>${a.need} cuidados</small>`}</button>`}).join('')}
function renderActionButtons(p){document.querySelectorAll('[data-pet-action]').forEach(btn=>{const action=btn.dataset.petAction,left=actionCooldownLeft(p,action),small=btn.querySelector('small');btn.disabled=left>0;btn.classList.toggle('cooling',left>0);if(small)small.textContent=left>0?msLabel(left):'Pronto'})}
function renderPet(){const p=loadPet(),st=stageInfo(p),egg=document.getElementById('petEgg'),creature=document.getElementById('petCreature'),eggBox=document.getElementById('petEggControls'),care=document.getElementById('petCareArea'),bubble=document.getElementById('petBubble'),stage=document.getElementById('petStageLabel'),name=document.getElementById('petNameLabel'),rename=document.getElementById('petRenameBtn'),screen=document.getElementById('petScreen');if(!egg||!creature)return;
 stage.textContent=st.label;name.textContent=p.name;rename.style.visibility=p.stage==='egg'?'hidden':'visible';
 if(screen)screen.classList.toggle('is-sleeping',isSleeping(p));
 if(p.stage==='egg'){
   egg.classList.remove('hidden');creature.className='petCreature hidden';eggBox.classList.remove('hidden');care.classList.add('hidden');
   const left=eggCooldownLeft(p),btn=document.getElementById('eggCareBtn'),cd=document.getElementById('eggCooldownText');
   document.getElementById('eggCareText').textContent=`${p.eggCare}/${EGG_CARE_GOAL} cuidados`;document.getElementById('eggCareBar').style.width=`${st.pct}%`;
   if(btn){btn.disabled=left>0;btn.classList.toggle('cooling',left>0);const small=btn.querySelector('small');if(small)small.textContent=left>0?`Espere ${msLabel(left)}`:'Aquecer e fazer carinho'}
   if(cd)cd.textContent=left>0?`Próximo cuidado em ${msLabel(left)}`:'Já pode cuidar novamente 💗';
   bubble.textContent=p.eggCare===0?'Cuide do ovo para descobrir quem vai nascer! 💗':p.eggCare<EGG_CARE_GOAL-1?'O ovinho está se desenvolvendo! ✨':'Está quase na hora de nascer! 💗';return;
 }
 egg.classList.add('hidden');eggBox.classList.add('hidden');care.classList.remove('hidden');
 creature.className=`petCreature species-${p.species} stage-${st.key}`;
 if(p.clean<45)creature.classList.add('is-dirty');if(p.energy<42)creature.classList.add('is-tired');if(isSleeping(p))creature.classList.add('is-sleeping');
 const acc=document.getElementById('petAccessory');acc.textContent=visualAccessory(p.accessory);acc.className=`petAccessory acc-${p.accessory}`;
 bubble.textContent=moodText(p);renderStats(p);renderAccessories(p);renderActionButtons(p);
 document.getElementById('petGrowthText').textContent=st.key==='friend'?'Companheiro completo ✨':`Crescimento • ${st.label}`;
 document.getElementById('petGrowthSub').textContent=st.key==='friend'?`${p.careCount} cuidados • Nota ${formatGrade(p)}`:`${p.careCount}/${st.next} cuidados • Nota ${formatGrade(p)}`;
 document.getElementById('petGrowthBar').style.width=`${st.pct}%`;
}
window.renderPet=renderPet;
window.openPet=function(){openPanel('petPanel','home');renderPet()};
window.careForEgg=function(){const p=rawLoad();if(p.stage!=='egg')return renderPet();const left=eggCooldownLeft(p);if(left>0){toast(`Espere ${msLabel(left)} para cuidar do ovo novamente 💗`);return}p.eggCare=Math.min(EGG_CARE_GOAL,Number(p.eggCare||0)+1);p.eggLastCare=Date.now();if(p.eggCare>=EGG_CARE_GOAL){p.stage='baby';p.species=speciesPick();p.name=SPECIES[p.species].defaultName;p.hunger=p.energy=p.clean=p.fun=p.love=92;p.study=78;p.lastDecay=Date.now();if(!p.rewards.hatch){p.rewards.hatch=true;if(typeof addStars==='function')addStars(2,'Seu bichinho nasceu! +2 ⭐')}rawSave(p);renderPet();const label=SPECIES[p.species].label;toast(`Nasceu um ${label}! 💗`);if(typeof speakText==='function')setTimeout(()=>speakText(`Que surpresa! Nasceu ${p.name}, seu novo ${label}.`),180);return}rawSave(p);renderPet();toast('O ovinho adorou o carinho 💗')};
function react(cls){const el=document.getElementById('petCreature');if(!el)return;el.classList.remove('react','cleanSparkle','loveBurst','studySparkle');void el.offsetWidth;el.classList.add(cls||'react');setTimeout(()=>el.classList.remove('react','cleanSparkle','loveBurst','studySparkle'),800)}
window.petAction=function(action){const p=loadPet();if(p.stage==='egg')return careForEgg();const left=actionCooldownLeft(p,action);if(left>0){toast(`${ACTION_LABELS[action]||'Ação'} disponível em ${msLabel(left)}.`);return}if(isSleeping(p)&&action!=='sleep')p.sleepUntil=0;let msg='';
 if(action==='feed'){p.hunger=clamp(p.hunger+24);p.energy=clamp(p.energy+3);msg='Que delícia! 🥣';react('react')}
 else if(action==='sleep'){p.energy=clamp(p.energy+34);p.hunger=clamp(p.hunger-2);p.sleepUntil=Date.now()+SLEEP_DURATION_MS;msg='Boa noite! A luz foi apagada 🌙'}
 else if(action==='bath'){p.clean=clamp(p.clean+34);p.love=clamp(p.love+4);msg='Banho tomado! Tudo limpinho ✨';react('cleanSparkle')}
 else if(action==='hygiene'){p.clean=clamp(p.clean+18);p.love=clamp(p.love+2);msg='Higiene feita! Tudo em ordem 🪥';react('cleanSparkle')}
 else if(action==='play'){p.fun=clamp(p.fun+25);p.love=clamp(p.love+5);p.energy=clamp(p.energy-7);p.hunger=clamp(p.hunger-4);msg='Que brincadeira divertida! 🎾';react('react')}
 else if(action==='study'){p.study=clamp(p.study+20);p.energy=clamp(p.energy-5);p.fun=clamp(p.fun-2);msg=`Estudou bastante! Nota ${formatGrade(p)} 📚`;react('studySparkle')}
 else{p.love=clamp(p.love+24);p.fun=clamp(p.fun+5);msg='Carinho recebido! 💗';react('loveBurst')}
 p.lastActions=p.lastActions||{};p.lastActions[action]=Date.now();p.careCount=Number(p.careCount||0)+1;rewardCareMilestones(p);rawSave(p);renderPet();const bubble=document.getElementById('petBubble');if(bubble)bubble.textContent=msg;toast(msg)};
window.renamePet=function(){const p=loadPet();if(p.stage==='egg')return;const val=(prompt('Qual será o nome do seu bichinho?',p.name)||'').trim().slice(0,16);if(!val)return;p.name=val;rawSave(p);renderPet();toast(`Agora ele se chama ${val} 💗`)};
window.choosePetAccessory=function(id){const p=loadPet(),a=ACCESSORIES.find(x=>x.id===id);if(!a)return;if(p.careCount<a.need)return toast(`Libera com ${a.need} cuidados 💗`);p.accessory=id;rawSave(p);renderPet();toast(`${a.name} escolhido! ✨`)};
window.petSpeakStatus=function(){const p=loadPet();if(typeof speakText!=='function')return;if(p.stage==='egg')speakText(`Este é um ovinho misterioso. Cuide dele ${EGG_CARE_GOAL} vezes, respeitando o tempo entre os cuidados, para descobrir quem vai nascer.`);else speakText(`${p.name} é seu bichinho virtual. ${moodText(p)} A nota de estudo dele é ${formatGrade(p)}.`)};
const oldOpenPanelPet=window.openPanel;window.openPanel=function(id,nav,fromHistory=false){oldOpenPanelPet(id,nav,fromHistory);if(id==='petPanel')renderPet()};
let petTimer=null;function startPetTimer(){if(petTimer)clearInterval(petTimer);petTimer=setInterval(()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet()},1000)}
window.addEventListener('DOMContentLoaded',()=>{startPetTimer();if(document.getElementById('petPanel')?.classList.contains('active'))renderPet()});
})();
