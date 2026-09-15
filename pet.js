/* Dia a Dia da Elo — Bichinho da Elo v2 • integrado à v3.1.2 */
(function(){
'use strict';
const PET_KEY='eloVirtualPetV2';
const LEGACY_KEY='eloVirtualPetV1';
const EGG_CARE_GOAL=6;
const EGG_COOLDOWN_MS=2*60*1000;
const ACTION_COOLDOWN_MS=15*1000;
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
const ACTIONS=['feed','bath','hygiene','play','love','sleep','study'];
function defaultPet(){return{stage:'egg',species:null,name:'Ovinho misterioso',eggCare:0,lastEggCareAt:0,careCount:0,hunger:86,energy:86,clean:86,fun:86,love:90,study:85,sleeping:false,sleepStartedAt:0,accessory:'none',lastSeen:Date.now(),lastActions:{},rewards:{hatch:false,care10:false,care20:false}}}
function clamp(n){return Math.max(0,Math.min(100,Number(n)||0))}
function migratePet(v){const p=Object.assign(defaultPet(),v||{});p.lastActions=Object.assign({},p.lastActions||{});p.rewards=Object.assign(defaultPet().rewards,p.rewards||{});if(p.study==null)p.study=85;if(p.sleeping==null)p.sleeping=false;return p}
function rawLoad(){try{let raw=pget(PET_KEY);if(!raw){const old=pget(LEGACY_KEY);if(old){const migrated=migratePet(JSON.parse(old));pset(PET_KEY,JSON.stringify(migrated));return migrated}}return migratePet(JSON.parse(raw||'{}'))}catch(_){return defaultPet()}}
function savePet(p,stamp=true){if(stamp)p.lastSeen=Date.now();pset(PET_KEY,JSON.stringify(p));return p}
function applyTimeChanges(p){if(p.stage==='egg')return p;const now=Date.now(),last=Number(p.lastSeen||now),hours=Math.max(0,(now-last)/3600000);if(hours<0.02)return p;
 const hungerLoss=hours*2.7, cleanLoss=hours*1.7, funLoss=hours*1.45, loveLoss=hours*.75, studyLoss=hours*.55;
 p.hunger=clamp(p.hunger-hungerLoss);p.clean=clamp(p.clean-cleanLoss);p.fun=clamp(p.fun-funLoss);p.love=clamp(p.love-loveLoss);p.study=clamp(p.study-studyLoss);
 if(p.sleeping){p.energy=clamp(p.energy+hours*8.5)}else p.energy=clamp(p.energy-hours*1.25);
 return savePet(p,true)
}
function loadPet(){return applyTimeChanges(rawLoad())}
function stageInfo(p){if(p.stage==='egg')return{key:'egg',label:'Ovinho',next:EGG_CARE_GOAL,pct:Math.min(100,p.eggCare/EGG_CARE_GOAL*100)};if(p.careCount<8)return{key:'baby',label:'Filhote',next:8,pct:p.careCount/8*100};if(p.careCount<20)return{key:'young',label:'Jovem',next:20,pct:(p.careCount-8)/12*100};return{key:'friend',label:'Companheiro',next:20,pct:100}}
function gradeText(p){return (Math.max(0,Math.min(10,p.study/10))).toFixed(1).replace('.',',')}
function moodText(p){if(p.sleeping)return `${p.name} está dormindo. Toque em Acordar para acender a luz. 🌙`;if(p.clean<35)return `${p.name} está sujinho e precisa de banho. 🫧`;if(p.energy<35)return `${p.name} está cansado e com sono. 🌙`;if(p.hunger<35)return `${p.name} está com fome. Que tal dar comida? 🥣`;if(p.study<45)return `${p.name} precisa estudar um pouquinho. A nota está ${gradeText(p)}. 📚`;const avg=(p.hunger+p.energy+p.clean+p.fun+p.love+p.study)/6;if(avg>84)return `${p.name} está radiante! ✨`;if(avg>68)return `${p.name} está muito bem e quer brincar.`;if(avg>52)return `${p.name} está tranquilo. Que tal um carinho?`;return `${p.name} quer um pouco de atenção. Escolha um cuidado abaixo 💗`}
function speciesPick(){const seed=(Date.now()+String(activeProfileId||'elo').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%4;return Object.keys(SPECIES)[seed]}
function rewardCareMilestones(p){if(p.careCount>=10&&!p.rewards.care10){p.rewards.care10=true;if(typeof addStars==='function')addStars(1,'Seu bichinho cresceu com seus cuidados! +1 ⭐')}if(p.careCount>=20&&!p.rewards.care20){p.rewards.care20=true;if(typeof addStars==='function')addStars(2,'Virou um grande companheiro! +2 ⭐')}}
function visualAccessory(id){return id==='bow'?'🎀':id==='star'?'⭐':id==='crown'?'👑':''}
function statItem(name,value,extra=''){return `<div class="petStat"><div class="petStatTop"><b>${name}</b><strong>${Math.round(value)}%</strong></div>${extra?`<small>${extra}</small>`:''}<div class="petMeter"><i style="width:${clamp(value)}%"></i></div></div>`}
function renderStats(p){const box=document.getElementById('petStats');if(!box)return;box.classList.toggle('hidden',p.stage==='egg');if(p.stage==='egg'){box.innerHTML='';return}box.innerHTML=`<div class="petStatColumn left">${statItem('Fome',p.hunger)}${statItem('Energia',p.energy)}${statItem('Higiene',p.clean)}</div><div class="petStatColumn right">${statItem('Diversão',p.fun)}${statItem('Carinho',p.love)}${statItem('Estudo',p.study,'Nota '+gradeText(p))}</div>`}
function renderAccessories(p){const box=document.getElementById('petAccessoryGrid');if(!box)return;box.innerHTML=ACCESSORIES.map(a=>{const ok=p.careCount>=a.need,on=p.accessory===a.id;return `<button class="petAccessoryBtn ${on?'on':''} ${ok?'':'locked'}" onclick="choosePetAccessory('${a.id}')"><span>${ok?a.icon:'🔒'}</span><b>${a.name}</b>${ok?'':`<small>${a.need} cuidados</small>`}</button>`}).join('')}
function remainingText(ms){const s=Math.max(0,Math.ceil(ms/1000));if(s>=60)return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;return `${s}s`}
function updateActionButtons(p){const now=Date.now();document.querySelectorAll('[data-pet-action]').forEach(btn=>{const a=btn.dataset.petAction;const small=btn.querySelector('small');const b=btn.querySelector('b');const span=btn.querySelector('span');if(a==='sleep'){if(p.sleeping){if(b)b.textContent='Acordar';if(span)span.textContent='☀️';if(small)small.textContent='Acender luz';btn.disabled=false;btn.classList.add('wake')}else{if(b)b.textContent='Dormir';if(span)span.textContent='🌙';if(small)small.textContent='Apagar luz';btn.disabled=false;btn.classList.remove('wake')}return}if(p.sleeping){btn.disabled=true;if(small)small.textContent='Dormindo';return}const last=Number((p.lastActions||{})[a]||0),left=ACTION_COOLDOWN_MS-(now-last);btn.disabled=left>0;if(small)small.textContent=left>0?remainingText(left):'Pronto'})}
function updateEggCooldown(p){const el=document.getElementById('eggCooldownText'),btn=document.querySelector('#petEggControls .petAction.primary');if(!el||!btn)return;const left=EGG_COOLDOWN_MS-(Date.now()-Number(p.lastEggCareAt||0));if(p.eggCare===0||left<=0){el.textContent='Pode cuidar agora 💗';btn.disabled=false}else{el.textContent=`Próximo cuidado em ${remainingText(left)}`;btn.disabled=true}}
function setVisualState(p,creature,screen){if(!creature||!screen)return;screen.classList.toggle('sleeping',!!p.sleeping);creature.classList.toggle('dirty',p.clean<35);creature.classList.toggle('tired',!p.sleeping&&p.energy<35);creature.classList.toggle('asleep',!!p.sleeping)}
function renderPet(){const p=loadPet(),st=stageInfo(p),egg=document.getElementById('petEgg'),creature=document.getElementById('petCreature'),eggBox=document.getElementById('petEggControls'),care=document.getElementById('petCareArea'),bubble=document.getElementById('petBubble'),stage=document.getElementById('petStageLabel'),name=document.getElementById('petNameLabel'),rename=document.getElementById('petRenameBtn'),screen=document.getElementById('petScreen');if(!egg||!creature)return;
 stage.textContent=st.label;name.textContent=p.name;rename.style.visibility=p.stage==='egg'?'hidden':'visible';
 if(p.stage==='egg'){egg.classList.remove('hidden');creature.className='petCreature hidden';eggBox.classList.remove('hidden');care.classList.add('hidden');if(screen)screen.classList.remove('sleeping');document.getElementById('eggCareText').textContent=`${p.eggCare}/${EGG_CARE_GOAL} cuidados`;document.getElementById('eggCareBar').style.width=`${st.pct}%`;bubble.textContent=p.eggCare===0?'Cuide do ovo para descobrir quem vai nascer! 💗':p.eggCare<3?'O ovinho mexeu um pouquinho! ✨':p.eggCare<EGG_CARE_GOAL-1?'Ele está crescendo. Continue cuidando com calma 💗':'Está quase na hora de nascer! ✨';renderStats(p);updateEggCooldown(p);return}
 egg.classList.add('hidden');eggBox.classList.add('hidden');care.classList.remove('hidden');creature.className=`petCreature species-${p.species} stage-${st.key}`;setVisualState(p,creature,screen);document.getElementById('petAccessory').textContent=visualAccessory(p.accessory);bubble.textContent=moodText(p);renderStats(p);renderAccessories(p);updateActionButtons(p);document.getElementById('petGrowthText').textContent=st.key==='friend'?'Companheiro completo ✨':`Crescimento • ${st.label}`;document.getElementById('petGrowthSub').textContent=st.key==='friend'?`${p.careCount} cuidados e muitas brincadeiras.`:`${p.careCount}/${st.next} cuidados para a próxima fase.`;document.getElementById('petGrowthBar').style.width=`${st.pct}%`}
window.renderPet=renderPet;
window.openPet=function(){openPanel('petPanel','home');renderPet()};
window.careForEgg=function(){const p=rawLoad();if(p.stage!=='egg')return renderPet();const now=Date.now(),left=EGG_COOLDOWN_MS-(now-Number(p.lastEggCareAt||0));if(p.eggCare>0&&left>0){toast(`Espere ${remainingText(left)} para cuidar do ovo novamente 💗`);updateEggCooldown(p);return}p.eggCare=Math.min(EGG_CARE_GOAL,Number(p.eggCare||0)+1);p.lastEggCareAt=now;if(p.eggCare>=EGG_CARE_GOAL){p.stage='baby';p.species=speciesPick();p.name=SPECIES[p.species].defaultName;p.hunger=p.energy=p.clean=p.fun=p.love=p.study=92;p.sleeping=false;if(!p.rewards.hatch){p.rewards.hatch=true;if(typeof addStars==='function')addStars(2,'Seu bichinho nasceu! +2 ⭐')}savePet(p);renderPet();const label=SPECIES[p.species].label;toast(`Nasceu um ${label}! 💗`);if(typeof speakText==='function')setTimeout(()=>speakText(`Que surpresa! Nasceu ${p.name}, seu novo ${label}.`),180);return}savePet(p);renderPet();toast('O ovinho adorou o carinho. Agora espere um pouquinho 💗')};
function react(cls){const el=document.getElementById('petCreature');if(!el)return;el.classList.remove('react','cleanSparkle','loveBurst');void el.offsetWidth;el.classList.add(cls||'react');setTimeout(()=>el.classList.remove('react','cleanSparkle','loveBurst'),700)}
window.petAction=function(action){if(!ACTIONS.includes(action))return;const p=loadPet();if(p.stage==='egg')return careForEgg();const now=Date.now();p.lastActions=p.lastActions||{};
 if(action==='sleep'){if(!p.sleeping){p.sleeping=true;p.sleepStartedAt=now;savePet(p);renderPet();toast('Boa noite! A luz foi apagada 🌙');return}else{const mins=Math.max(0,(now-Number(p.sleepStartedAt||now))/60000);p.sleeping=false;p.sleepStartedAt=0;p.energy=clamp(p.energy+Math.max(8,Math.min(30,mins*.7)));p.lastActions.sleep=now;savePet(p);renderPet();toast('Bom dia! A luz foi acesa ☀️');return}}
 if(p.sleeping)return toast(`${p.name} está dormindo. Toque em Acordar primeiro 🌙`);
 const left=ACTION_COOLDOWN_MS-(now-Number(p.lastActions[action]||0));if(left>0)return toast(`Espere ${remainingText(left)} para repetir essa ação 💗`);
 let msg='';if(action==='feed'){p.hunger=clamp(p.hunger+24);p.energy=clamp(p.energy+3);msg='Que delícia! 🥣';react('react')}else if(action==='bath'){p.clean=clamp(p.clean+30);p.love=clamp(p.love+4);msg='Banho tomado! Tudo limpinho ✨';react('cleanSparkle')}else if(action==='hygiene'){p.clean=clamp(p.clean+18);p.love=clamp(p.love+2);msg='Higiene em dia! 🪥✨';react('cleanSparkle')}else if(action==='play'){p.fun=clamp(p.fun+25);p.love=clamp(p.love+5);p.energy=clamp(p.energy-7);p.hunger=clamp(p.hunger-4);msg='Que brincadeira divertida! 🎾';react('react')}else if(action==='love'){p.love=clamp(p.love+24);p.fun=clamp(p.fun+4);msg='Carinho recebido! 💗';react('loveBurst')}else if(action==='study'){p.study=clamp(p.study+16);p.fun=clamp(p.fun-2);msg=`Estudou direitinho! Nota ${gradeText(p)} 📚`;react('react')}
 p.lastActions[action]=now;p.careCount=Number(p.careCount||0)+1;rewardCareMilestones(p);savePet(p);renderPet();const bubble=document.getElementById('petBubble');if(bubble)bubble.textContent=msg;toast(msg)};
window.renamePet=function(){const p=loadPet();if(p.stage==='egg')return;const val=(prompt('Qual será o nome do seu bichinho?',p.name)||'').trim().slice(0,16);if(!val)return;p.name=val;savePet(p);renderPet();toast(`Agora ele se chama ${val} 💗`)};
window.choosePetAccessory=function(id){const p=loadPet(),a=ACCESSORIES.find(x=>x.id===id);if(!a)return;if(p.careCount<a.need)return toast(`Libera com ${a.need} cuidados 💗`);p.accessory=id;savePet(p);renderPet();toast(`${a.name} escolhido! ✨`)};
window.petSpeakStatus=function(){const p=loadPet();if(typeof speakText!=='function')return;if(p.stage==='egg')speakText(`Este é um ovinho misterioso. Cuide dele ${EGG_CARE_GOAL} vezes, respeitando o tempo entre os cuidados, para descobrir quem vai nascer.`);else speakText(`${p.name} é seu bichinho virtual. ${moodText(p)}`)};
let lastLiveRefresh=0;function tick(){const panel=document.getElementById('petPanel');if(!panel||!panel.classList.contains('active'))return;const p=rawLoad();if(p.stage==='egg'){updateEggCooldown(p);return}updateActionButtons(p);const now=Date.now();if(now-lastLiveRefresh>30000){lastLiveRefresh=now;renderPet()}}
setInterval(tick,1000);
const oldOpenPanelPet=window.openPanel;window.openPanel=function(id,nav,fromHistory=false){oldOpenPanelPet(id,nav,fromHistory);if(id==='petPanel')renderPet()};
window.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet()});
})();
