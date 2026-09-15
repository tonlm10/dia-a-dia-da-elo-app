/* Dia a Dia da Elo — Bichinho da Elo v1 • integrado à v3.1.0 */
(function(){
'use strict';
const PET_KEY='eloVirtualPetV1';
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
function defaultPet(){return{stage:'egg',species:null,name:'Ovinho misterioso',eggCare:0,careCount:0,hunger:86,energy:86,clean:86,fun:86,love:90,accessory:'none',lastSeen:Date.now(),rewards:{hatch:false,care10:false,care20:false}}}
function clamp(n){return Math.max(35,Math.min(100,Math.round(Number(n)||0)))}
function rawLoad(){try{return Object.assign(defaultPet(),JSON.parse(pget(PET_KEY)||'{}'))}catch(_){return defaultPet()}}
function savePet(p){p.lastSeen=Date.now();pset(PET_KEY,JSON.stringify(p));return p}
function applyGentleDecay(p){if(p.stage==='egg')return p;const now=Date.now(),hours=Math.max(0,(now-Number(p.lastSeen||now))/3600000);if(hours<1)return p;const loss=Math.min(28,Math.floor(hours*1.15));p.hunger=clamp(p.hunger-loss);p.clean=clamp(p.clean-Math.round(loss*.65));p.fun=clamp(p.fun-Math.round(loss*.55));p.love=clamp(p.love-Math.round(loss*.3));p.energy=clamp(p.energy-Math.round(loss*.35));return savePet(p)}
function loadPet(){return applyGentleDecay(rawLoad())}
function stageInfo(p){if(p.stage==='egg')return{key:'egg',label:'Ovinho',next:3,pct:Math.min(100,p.eggCare/3*100)};if(p.careCount<8)return{key:'baby',label:'Filhote',next:8,pct:p.careCount/8*100};if(p.careCount<20)return{key:'young',label:'Jovem',next:20,pct:(p.careCount-8)/12*100};return{key:'friend',label:'Companheiro',next:20,pct:100}}
function moodText(p){const avg=(p.hunger+p.energy+p.clean+p.fun+p.love)/5;if(avg>84)return `${p.name} está radiante! ✨`;if(avg>68)return `${p.name} está muito bem e quer brincar.`;if(avg>52)return `${p.name} está tranquilo. Que tal um carinho?`;return `${p.name} quer um pouco de atenção. Escolha um cuidado abaixo 💗`}
function speciesPick(){const seed=(Date.now()+String(activeProfileId||'elo').split('').reduce((a,c)=>a+c.charCodeAt(0),0))%4;return Object.keys(SPECIES)[seed]}
function rewardCareMilestones(p){if(p.careCount>=10&&!p.rewards.care10){p.rewards.care10=true;if(typeof addStars==='function')addStars(1,'Seu bichinho cresceu com seus cuidados! +1 ⭐')}
 if(p.careCount>=20&&!p.rewards.care20){p.rewards.care20=true;if(typeof addStars==='function')addStars(2,'Virou um grande companheiro! +2 ⭐')}}
function visualAccessory(id){return id==='bow'?'🎀':id==='star'?'⭐':id==='crown'?'👑':''}
function renderStats(p){const box=document.getElementById('petStats');if(!box)return;const arr=[['🥣','Fome',p.hunger],['⚡','Energia',p.energy],['🫧','Higiene',p.clean],['🎾','Diversão',p.fun],['💗','Carinho',p.love]];box.innerHTML=arr.map(([ic,n,v])=>`<div class="petStat"><span>${ic}</span><b>${n}</b><div class="petMeter"><i style="width:${v}%"></i></div></div>`).join('')}
function renderAccessories(p){const box=document.getElementById('petAccessoryGrid');if(!box)return;box.innerHTML=ACCESSORIES.map(a=>{const ok=p.careCount>=a.need,on=p.accessory===a.id;return `<button class="petAccessoryBtn ${on?'on':''} ${ok?'':'locked'}" onclick="choosePetAccessory('${a.id}')"><span>${ok?a.icon:'🔒'}</span><b>${a.name}</b>${ok?'':`<small>${a.need} cuidados</small>`}</button>`}).join('')}
function renderPet(){const p=loadPet(),st=stageInfo(p),egg=document.getElementById('petEgg'),creature=document.getElementById('petCreature'),eggBox=document.getElementById('petEggControls'),care=document.getElementById('petCareArea'),bubble=document.getElementById('petBubble'),stage=document.getElementById('petStageLabel'),name=document.getElementById('petNameLabel'),rename=document.getElementById('petRenameBtn');if(!egg||!creature)return;
 stage.textContent=st.label;name.textContent=p.name;rename.style.visibility=p.stage==='egg'?'hidden':'visible';
 if(p.stage==='egg'){egg.classList.remove('hidden');creature.className='petCreature hidden';eggBox.classList.remove('hidden');care.classList.add('hidden');document.getElementById('eggCareText').textContent=`${p.eggCare}/3 cuidados`;document.getElementById('eggCareBar').style.width=`${st.pct}%`;bubble.textContent=p.eggCare===0?'Cuide do ovo para descobrir quem vai nascer! 💗':p.eggCare===1?'O ovinho mexeu um pouquinho! ✨':'Está quase na hora de nascer! 💗';return}
 egg.classList.add('hidden');eggBox.classList.add('hidden');care.classList.remove('hidden');creature.className=`petCreature species-${p.species} stage-${st.key}`;document.getElementById('petAccessory').textContent=visualAccessory(p.accessory);bubble.textContent=moodText(p);renderStats(p);renderAccessories(p);document.getElementById('petGrowthText').textContent=st.key==='friend'?'Companheiro completo ✨':`Crescimento • ${st.label}`;document.getElementById('petGrowthSub').textContent=st.key==='friend'?`${p.careCount} cuidados e muitas brincadeiras.`:`${p.careCount}/${st.next} cuidados para a próxima fase.`;document.getElementById('petGrowthBar').style.width=`${st.pct}%`}
window.renderPet=renderPet;
window.openPet=function(){openPanel('petPanel','home');renderPet()};
window.careForEgg=function(){const p=rawLoad();if(p.stage!=='egg')return renderPet();p.eggCare=Math.min(3,Number(p.eggCare||0)+1);if(p.eggCare>=3){p.stage='baby';p.species=speciesPick();p.name=SPECIES[p.species].defaultName;p.hunger=p.energy=p.clean=p.fun=p.love=92;if(!p.rewards.hatch){p.rewards.hatch=true;if(typeof addStars==='function')addStars(2,'Seu bichinho nasceu! +2 ⭐')}savePet(p);renderPet();const label=SPECIES[p.species].label;toast(`Nasceu um ${label}! 💗`);if(typeof speakText==='function')setTimeout(()=>speakText(`Que surpresa! Nasceu ${p.name}, seu novo ${label}.`),180);return}savePet(p);renderPet();toast('O ovinho adorou o carinho 💗')};
function react(cls){const el=document.getElementById('petCreature');if(!el)return;el.classList.remove('react','sleepy','cleanSparkle','loveBurst');void el.offsetWidth;el.classList.add(cls||'react');setTimeout(()=>{el.classList.remove('react','cleanSparkle','loveBurst');if(cls==='sleepy')setTimeout(()=>el.classList.remove('sleepy'),650)},700)}
window.petAction=function(action){const p=loadPet();if(p.stage==='egg')return careForEgg();let msg='';if(action==='feed'){p.hunger=clamp(p.hunger+22);p.energy=clamp(p.energy+3);msg='Que delícia! 🥣';react('react')}else if(action==='bath'){p.clean=clamp(p.clean+28);p.love=clamp(p.love+4);msg='Banho tomado! Tudo limpinho ✨';react('cleanSparkle')}else if(action==='play'){p.fun=clamp(p.fun+24);p.love=clamp(p.love+5);p.energy=clamp(p.energy-7);p.hunger=clamp(p.hunger-4);msg='Que brincadeira divertida! 🎾';react('react')}else if(action==='sleep'){p.energy=clamp(p.energy+30);p.hunger=clamp(p.hunger-3);msg='Um cochilo deixou tudo melhor 🌙';react('sleepy')}else{p.love=clamp(p.love+24);p.fun=clamp(p.fun+5);msg='Carinho recebido! 💗';react('loveBurst')}
 p.careCount=Number(p.careCount||0)+1;rewardCareMilestones(p);savePet(p);renderPet();const bubble=document.getElementById('petBubble');if(bubble)bubble.textContent=msg;toast(msg)};
window.renamePet=function(){const p=loadPet();if(p.stage==='egg')return;const val=(prompt('Qual será o nome do seu bichinho?',p.name)||'').trim().slice(0,16);if(!val)return;p.name=val;savePet(p);renderPet();toast(`Agora ele se chama ${val} 💗`)};
window.choosePetAccessory=function(id){const p=loadPet(),a=ACCESSORIES.find(x=>x.id===id);if(!a)return;if(p.careCount<a.need)return toast(`Libera com ${a.need} cuidados 💗`);p.accessory=id;savePet(p);renderPet();toast(`${a.name} escolhido! ✨`)};
window.petSpeakStatus=function(){const p=loadPet();if(typeof speakText!=='function')return;if(p.stage==='egg')speakText(`Este é um ovinho misterioso. Cuide dele três vezes para descobrir quem vai nascer.`);else speakText(`${p.name} é seu bichinho virtual. ${moodText(p)}`)};

// Atualiza o painel sempre que ele for aberto pela navegação padrão.
const oldOpenPanelPet=window.openPanel;
window.openPanel=function(id,nav,fromHistory=false){oldOpenPanelPet(id,nav,fromHistory);if(id==='petPanel')renderPet()};
window.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('petPanel')?.classList.contains('active'))renderPet()});
})();
