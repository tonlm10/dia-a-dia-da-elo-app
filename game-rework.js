/* Dia a Dia da Elo 4.3.28 — revisão de jogabilidade, acessibilidade e conteúdo. */
(function () {
  'use strict';
  if (window.__eloGameReworkInstalled) return;
  window.__eloGameReworkInstalled = true;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const toast = text => { try { window.toast?.(text); } catch (_) {} };
  const profileId = () => { try { return window.getActiveProfile?.().id || 'default'; } catch (_) { return 'default'; } };
  const rewardOnce = (id, amount, message) => {
    const key = `eloGameReward.4.3.28.${profileId()}.${id}.${new Date().toLocaleDateString('en-CA')}`;
    if (localStorage.getItem(key) === '1') { toast('Muito bem! Essa atividade já rendeu estrelas hoje.'); return; }
    localStorage.setItem(key, '1'); window.addStars?.(amount, message);
  };

  // Cuidados: três brincadeiras claras, com interação completa e sem nota automática.
  const carePanel = $('#carePanel');
  if (carePanel) {
    const oldHero = $('.careHero', carePanel), oldTabs = $('.careTabsRow', carePanel);
    const oldStages = $$('.careStageWrap', carePanel);
    oldHero?.remove(); oldTabs?.remove(); oldStages.forEach(node => node.remove());
    const root = document.createElement('section'); root.id = 'eloCareGames'; root.className = 'eloCareGames';
    root.innerHTML = `
      <header class="eloCareIntro"><span>💗 HÁBITOS E BRINCADEIRAS</span><h3>Vamos cuidar com carinho</h3><p>Escolha uma atividade. Cada etapa só termina quando você participa.</p></header>
      <nav class="eloCareTabs" role="tablist" aria-label="Atividades de cuidado">
        <button type="button" class="active" data-care-tab="teeth" role="tab" aria-selected="true">🪥 Dentinhos</button>
        <button type="button" data-care-tab="bandage" role="tab" aria-selected="false">🩹 Curativo de faz de conta</button>
        <button type="button" data-care-tab="lunch" role="tab" aria-selected="false">🍱 Lancheira</button>
      </nav><div id="eloCareActivity" class="eloCareActivity" role="tabpanel"></div>`;
    ($('.cantinhoTopSwitcher', carePanel) || carePanel).after(root);
    const state = { teeth: new Set(), spots: new Set(), activeSpot: null, style: '🦄', lunch: {}, completed: false };
    const toothNames = ['incisivo esquerdo','dente da frente','canino esquerdo','molar esquerdo','molar direito','canino direito','dente da frente direito','incisivo direito'];
    const foods = {
      fruit: [['🍎','Maçã'],['🍌','Banana'],['🍓','Morango'],['🍐','Pera'],['🍊','Laranja']],
      snack: [['🥪','Sanduíche'],['🥐','Pãozinho'],['🥞','Panqueca'],['🌽','Milho']],
      drink: [['💧','Água'],['🥛','Leite'],['🧃','Suco']],
      extra: [['🧀','Queijinho'],['🥕','Cenourinhas'],['🥚','Ovo cozido'],['🥣','Iogurte']]
    };
    const labels = {fruit:'Fruta',snack:'Lanchinho',drink:'Bebida',extra:'Mais um alimento'};
    function renderTabs(tab) { $$('.eloCareTabs button', root).forEach(b => { const on = b.dataset.careTab === tab; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); }); }
    function showTeeth() {
      state.teeth.clear(); state.completed = false;
      $('#eloCareActivity', root).innerHTML = `<div class="eloCareCard teethCare"><div class="eloCareCopy"><h4>Escove cada dentinho</h4><p>Toque nos dentes para passar a escovinha. Depois confira o sorriso.</p><div class="eloCareMeter" id="eloTeethCount">0 de 8 dentinhos escovados</div><div class="eloCareStatus" id="eloTeethStatus" aria-live="polite">Comece por qualquer dentinho.</div><button class="eloCarePrimary" id="eloTeethCheck" type="button" disabled>Conferir meu sorriso</button><button class="eloCareSecondary" id="eloTeethAgain" type="button">Começar de novo</button></div><div class="eloMouth" aria-label="Boca sorridente com oito dentes para escovar"><div class="eloGum"><div class="eloTeethRow">${toothNames.slice(0,4).map((n,i)=>`<button class="eloTooth" type="button" data-tooth="${i}" aria-label="Escovar ${n}">🦷</button>`).join('')}</div><div class="eloTeethRow lower">${toothNames.slice(4).map((n,i)=>`<button class="eloTooth" type="button" data-tooth="${i+4}" aria-label="Escovar ${n}">🦷</button>`).join('')}</div></div><div class="eloSmile">😁 Um sorriso feito por você!</div></div></div>`;
      $$('.eloTooth', root).forEach(button => button.addEventListener('click', () => {
        const n = Number(button.dataset.tooth); if (state.teeth.has(n)) return;
        state.teeth.add(n); button.classList.add('cleaned'); button.innerHTML = '<span>✨</span>'; button.setAttribute('aria-label', `Dente escovado: ${toothNames[n]}`);
        $('#eloTeethCount').textContent = `${state.teeth.size} de 8 dentinhos escovados`;
        $('#eloTeethStatus').textContent = state.teeth.size === 8 ? 'Todos os dentes receberam sua escovação!' : 'Boa! Escolha outro dentinho.';
        $('#eloTeethCheck').disabled = state.teeth.size !== 8;
      }));
      $('#eloTeethCheck').addEventListener('click', () => { if (state.teeth.size < 8) return; state.completed = true; $('#eloTeethStatus').textContent = 'Sorriso brilhante! Você escovou todos os dentinhos. ✨'; rewardOnce('teeth',2,'Sorriso escovado com cuidado! +2 ⭐'); $('#eloTeethCheck').textContent = 'Sorriso conferido!'; $('#eloTeethCheck').disabled = true; });
      $('#eloTeethAgain').addEventListener('click', showTeeth);
    }
    const careSpots = [{id:'arm',label:'Braço',emoji:'💪'},{id:'knee',label:'Joelho',emoji:'🦵'},{id:'hand',label:'Mão',emoji:'🤚'}];
    function showBandage() {
      state.spots.clear(); state.activeSpot = null; state.style = '🦄';
      $('#eloCareActivity', root).innerHTML = `<div class="eloCareCard bandageCare"><div class="eloCareCopy"><h4>Clínica dos bonecos</h4><p>Escolha um pontinho de cuidado, depois selecione um curativo decorado. É só uma brincadeira de faz de conta.</p><div class="eloCareMeter" id="eloBandageCount">0 de 3 cuidados feitos</div><div class="eloCareStatus" id="eloBandageStatus" aria-live="polite">Toque em um dos três pontinhos.</div><div class="eloSpotChoices">${careSpots.map(x=>`<button type="button" data-spot="${x.id}">${x.emoji} ${x.label}</button>`).join('')}</div><div class="eloBandageChoices" aria-label="Escolha a estampa do curativo">${['🦄','⭐','💖','🌈','🐱'].map((x,i)=>`<button type="button" data-bandage="${x}" aria-label="Curativo ${i+1}">${x}</button>`).join('')}</div><button class="eloCarePrimary" id="eloBandageApply" type="button" disabled>Colocar curativo</button><button class="eloCareSecondary" id="eloBandageAgain" type="button">Recomeçar</button></div><div class="eloCareDoll" aria-label="Boneco de pano para cuidar"><div class="dollHead">🙂</div><div class="dollBody">💗</div><div class="dollArms">╱　╲</div><div class="dollLegs">╱　╲</div><span class="eloWound arm" data-doll-spot="arm">•</span><span class="eloWound knee" data-doll-spot="knee">•</span><span class="eloWound hand" data-doll-spot="hand">•</span></div></div>`;
      $$('.eloSpotChoices button',root).forEach(b=>b.addEventListener('click',()=>{state.activeSpot=b.dataset.spot;$$('.eloSpotChoices button',root).forEach(x=>x.classList.toggle('selected',x===b));$('#eloBandageStatus').textContent=`Pontinho no ${b.textContent.trim().toLowerCase()} escolhido. Agora escolha uma estampa.`;$('#eloBandageApply').disabled=state.spots.has(state.activeSpot);}));
      $$('.eloBandageChoices button',root).forEach(b=>b.addEventListener('click',()=>{state.style=b.dataset.bandage;$$('.eloBandageChoices button',root).forEach(x=>x.classList.toggle('selected',x===b));}));
      $('#eloBandageApply').addEventListener('click',()=>{if(!state.activeSpot||state.spots.has(state.activeSpot))return;state.spots.add(state.activeSpot);const wound=$(`[data-doll-spot="${state.activeSpot}"]`,root);if(wound){wound.textContent=state.style;wound.classList.add('covered');}$('#eloBandageCount').textContent=`${state.spots.size} de 3 cuidados feitos`;$('#eloBandageStatus').textContent=state.spots.size===3?'O boneco está todo cuidado. Muito carinho!':'Curativo colocado. Escolha outro pontinho.';$('#eloBandageApply').disabled=true;if(state.spots.size===3){rewardOnce('bandage',2,'Boneco cuidado com carinho! +2 ⭐');$('#eloBandageApply').textContent='Todos cuidados!';}});
      $('#eloBandageAgain').addEventListener('click',showBandage);
    }
    function showLunch() {
      state.lunch = {}; state.completed = false;
      $('#eloCareActivity',root).innerHTML=`<div class="eloCareCard lunchCare"><div class="eloCareCopy"><h4>Monte a lancheira da Elo</h4><p>Escolha uma opção em cada grupo. A estrela foi trocada por outro alimento.</p><div class="eloLunchSlots">${Object.keys(foods).map(k=>`<div class="eloLunchSlot" data-slot="${k}"><small>${labels[k]}</small><b>＋</b></div>`).join('')}</div><div class="eloCareStatus" id="eloLunchStatus" aria-live="polite">Escolha fruta, lanchinho, bebida e mais um alimento.</div><button class="eloCarePrimary" id="eloLunchFinish" type="button" disabled>Fechar lancheira</button><button class="eloCareSecondary hidden" id="eloLunchAgain" type="button">Montar outra lancheira</button></div><div class="eloFoodPicker">${Object.entries(foods).map(([group,items])=>`<section class="eloFoodGroup"><h5>${labels[group]}</h5><div>${items.map(([emoji,name])=>`<button type="button" data-food-group="${group}" data-emoji="${emoji}" data-food="${name}"><span>${emoji}</span><small>${name}</small></button>`).join('')}</div></section>`).join('')}</div></div>`;
      // The extra slot is a real food group rather than a decorative star.
      $$('.eloFoodGroup button',root).forEach(b=>b.addEventListener('click',()=>{const group=b.dataset.foodGroup;state.lunch[group]={emoji:b.dataset.emoji,label:b.dataset.food};if(typeof lunchboxItems!=='undefined') lunchboxItems.extra = state.lunch.extra || lunchboxItems.extra;const slot=$(`[data-slot="${group}"]`,root);if(slot){slot.innerHTML=`<small>${labels[group]}</small><b>${b.dataset.emoji}</b><span>${b.dataset.food}</span>`;slot.classList.add('filled');}$$(`[data-food-group="${group}"]`,root).forEach(x=>x.classList.toggle('selected',x===b));const ready=Object.keys(foods).every(k=>state.lunch[k]);$('#eloLunchFinish').disabled=!ready;$('#eloLunchStatus').textContent=ready?'Tudo escolhido! Confira a lancheira quando quiser.':`Boa escolha! Agora escolha ${labels[Object.keys(foods).find(k=>!state.lunch[k])]}.`;}));
      $('#eloLunchFinish').addEventListener('click',()=>{if(!Object.keys(foods).every(k=>state.lunch[k]))return;state.completed=true;const summary=Object.values(state.lunch).map(x=>x.label).join(', ');$('#eloLunchStatus').textContent=`Lancheira montada: ${summary}. Você escolheu quatro alimentos!`;rewardOnce('lunch',2,'Lancheira montada com participação! +2 ⭐');$('#eloLunchFinish').classList.add('hidden');$('#eloLunchAgain').classList.remove('hidden');});
      $('#eloLunchAgain').addEventListener('click',showLunch);
    }
    function switchCare(tab) { renderTabs(tab); if(tab==='teeth')showTeeth();else if(tab==='bandage')showBandage();else showLunch(); }
    $$('.eloCareTabs button',root).forEach(b=>b.addEventListener('click',()=>switchCare(b.dataset.careTab)));
    window.switchCareTab = (tab,button) => { switchCare(tab); if(button) button.focus?.(); };
    window.finishBrushingTeeth = () => { if(state.teeth.size<8){toast('Escove os oito dentinhos antes de conferir.');return;} $('#eloTeethCheck')?.click(); };
    window.treatScrape = () => toast('Escolha um pontinho no boneco e uma estampa de curativo.');
    window.finishBandages = () => toast(state.spots.size===3?'O boneco já está todo cuidado!':'Escolha e cuide dos três pontinhos do boneco.');
    window.setLunchItem = (slot,emoji,label) => { const btn=$(`[data-food-group="${slot}"][data-emoji="${emoji}"]`,root); btn?.click(); };
    window.finishLunchbox = () => $('#eloLunchFinish')?.click();
    const room=$('.csRoom[data-room="care"]'); if(room){const name=$('.csInfo strong',room),desc=$('.csInfo small',room);if(name)name.textContent='Cantinho dos Cuidados';if(desc)desc.textContent='Dentes, faz de conta e lancheira';room.setAttribute('aria-label','Cantinho dos Cuidados: dentes, curativos de faz de conta e lancheira');$$('.csProps b',room).forEach((icon,i)=>icon.textContent=['🪥','🥪','💗'][i]||'💗');}
    const careTitle=$('#carePanel .topTitle h2')||$('#carePanel h2');if(careTitle)careTitle.textContent='Cantinho dos Cuidados 💗';
    switchCare('teeth');
  }

  // Content: extend learning banks without replacing existing progress or IDs.
  try {
    Object.assign(SCHOOL_KID_SETS, {
      letters:{name:'Letras',icon:'🔤',items:[['A','🐝'],['B','⚽'],['C','🏠'],['D','🎲'],['E','⭐'],['F','🌸'],['G','🐱'],['L','🌙'],['M','🐵'],['P','🦆'],['S','☀️'],['U','🦄']]},
      words:{name:'Palavrinhas',icon:'📖',items:[['sol','☀️'],['lua','🌙'],['flor','🌸'],['gato','🐱'],['bola','⚽'],['casa','🏠'],['pato','🦆'],['uva','🍇']]}
    });
    SCHOOL_KID_SETS.animals.items.push(['abelha','🐝'],['tartaruga','🐢'],['girafa','🦒'],['pinguim','🐧'],['borboleta','🦋']);
    SCHOOL_KID_SETS.shapes.items.push(['losango','◆'],['retângulo','▰'],['oval','⬭']);
  } catch (_) {}
  const schoolExtra = {
    letters:[
      ['Qual letra começa a palavra BORBOLETA?',['B','D','P'],0,'Letras'],['Qual letra termina a palavra SOL?',['L','O','S'],0,'Letras'],['Qual palavra rima com PATO?',['GATO','CASA','FLOR'],0,'Palavras'],['Quantas sílabas tem a palavra BONECA?',['2','3','4'],1,'Palavras'],['Qual palavra começa com o mesmo som de FADA?',['FITA','BOLA','CASA'],0,'Letras'],['Qual é a primeira letra de JANELA?',['J','G','I'],0,'Letras'],['Qual palavra rima com MÃO?',['PÃO','GATO','LUZ'],0,'Palavras'],['Qual letra vem depois do M?',['N','L','O'],0,'Letras'],['Qual palavra tem duas sílabas?',['CASA','SOL','BORBOLETA'],0,'Palavras'],['Qual letra começa a palavra CHUVA?',['X','C','H'],2,'Letras']
    ],
    numbers:[
      ['Quanto é 9 + 6?',['14','15','16'],1,'Matemática'],['Quanto é 18 - 7?',['10','11','12'],1,'Matemática'],['Quanto é 6 × 4?',['20','24','28'],1,'Matemática'],['Qual é a metade de 20?',['10','12','15'],0,'Matemática'],['Que número completa 5, 10, 15, __?',['18','20','25'],1,'Padrões'],['Quanto é 36 ÷ 4?',['8','9','10'],1,'Matemática'],['Qual fração representa uma de duas partes iguais?',['1/2','1/3','2/3'],0,'Frações'],['Quanto é 125 + 25?',['140','150','160'],1,'Matemática'],['Qual é o perímetro de um quadrado com lados de 3 cm?',['9 cm','12 cm','6 cm'],1,'Medidas'],['Se são 14h, que horas serão daqui a 2 horas?',['15h','16h','17h'],1,'Tempo']
    ],
    curious:[
      ['Qual planeta é conhecido como planeta vermelho?',['Marte','Vênus','Saturno'],0,'Espaço'],['Qual animal transforma-se de lagarta em adulto?',['Borboleta','Gato','Tartaruga'],0,'Bichos'],['O que as raízes ajudam a planta a fazer?',['Absorver água','Voar','Produzir pedras'],0,'Mundo natural'],['Qual destes é um mamífero que vive no mar?',['Golfinho','Tubarão','Polvo'],0,'Bichos'],['Em qual continente fica o Brasil?',['América do Sul','Europa','Ásia'],0,'Mundo'],['Qual parte da planta costuma receber a luz do sol?',['Folhas','Raízes','Sementes'],0,'Mundo natural'],['O que precisamos usar para atravessar a rua com segurança?',['Faixa e atenção de um adulto','Fone de ouvido','Correndo sem olhar'],0,'Segurança'],['Qual animal é um anfíbio?',['Sapo','Cavalo','Arara'],0,'Bichos'],['Como chamamos a água em forma de vapor?',['Estado gasoso','Gelo','Areia'],0,'Ciências'],['Qual estrela ilumina a Terra durante o dia?',['Sol','Lua','Vênus'],0,'Espaço']
    ]
  };
  try {
    for (const [track, items] of Object.entries(schoolExtra)) SCHOOL_TRACK_DATA[track].push(...items.map(([prompt,options,answer,topic])=>({prompt,options,answer,visual:topic==='Bichos'?'🐾':topic==='Matemática'?'🔢':'🌎'})));
  } catch (_) {}
  const extraQuestions = {
    easy:[
      ['Qual letra começa ABELHA?',['A','B','P'],0,'Letras'],['Quanto é 5 + 2?',['6','7','8'],1,'Matemática'],['Qual animal tem penas e bico?',['Pássaro','Peixe','Gato'],0,'Bichos'],['Que forma tem quatro lados iguais?',['Quadrado','Círculo','Triângulo'],0,'Formas'],['Qual cor aparece ao misturar azul e amarelo?',['Verde','Roxo','Vermelho'],0,'Cores'],['Quanto é 9 - 3?',['5','6','7'],1,'Matemática'],['Qual animal é um inseto?',['Abelha','Coelho','Cavalo'],0,'Bichos'],['O que uma semente pode virar?',['Planta','Nuvem','Pedra'],0,'Mundo']
    ],
    medium:[
      ['Quanto é 24 + 18?',['40','42','44'],1,'Matemática'],['Qual palavra tem o som “ch”?',['Chave','Casa','Bola'],0,'Português'],['Qual planeta é chamado de planeta vermelho?',['Marte','Terra','Júpiter'],0,'Espaço'],['Qual é a metade de 18?',['8','9','10'],1,'Matemática'],['Qual destes é herbívoro?',['Vaca','Leão','Águia'],0,'Bichos'],['Quanto é 3 × 4?',['7','12','14'],1,'Matemática'],['Qual palavra significa quase o mesmo que “enorme”?',['Gigante','Pequeno','Leve'],0,'Vocabulário'],['O que ajuda a água líquida a evaporar?',['Calor','Escuridão','Gelo'],0,'Ciências']
    ],
    hard:[
      ['Quanto é 125 + 76?',['191','201','211'],1,'Matemática'],['Quanto é 7 × 8?',['54','56','64'],1,'Matemática'],['Quanto é 3/5 de 25?',['10','15','20'],1,'Frações'],['Qual astro está no centro do Sistema Solar?',['Sol','Terra','Lua'],0,'Espaço'],['Quantos minutos há em 2 horas e meia?',['120','150','180'],1,'Medidas'],['Qual forma tem um ângulo menor que 90°?',['Ângulo agudo','Ângulo reto','Ângulo raso'],0,'Geometria'],['Qual animal nasce de ovo?',['Galinha','Cachorro','Vaca'],0,'Bichos'],['Na frase “Quero mais água”, “mais” indica:',['Quantidade','O contrário de porém','Um lugar'],0,'Português']
    ]
  };
  try { for (const level of ['easy','medium','hard']) QUESTIONS[level].push(...extraQuestions[level]); } catch (_) {}

  // English: add vocabulary to each existing theme without replacing the learner's progress.
  const englishExtra = {
    colors:[{id:'teal',en:'teal',pt:'verde-azulado',emoji:'🟦',sentence:'The ocean can look ___.'},{id:'brown',en:'brown',pt:'marrom',emoji:'🟤',sentence:'The bear is ___.'},{id:'gray',en:'gray',pt:'cinza',emoji:'🩶',sentence:'The elephant is ___.'}],
    numbers:[{id:'zero',en:'zero',pt:'zero',emoji:'0️⃣',sentence:'I have ___ pencils.'},{id:'eleven',en:'eleven',pt:'onze',emoji:'🔢',sentence:'I can count to ___.'},{id:'twelve',en:'twelve',pt:'doze',emoji:'🔢',sentence:'There are ___ months in a year.'},{id:'thirteen',en:'thirteen',pt:'treze',emoji:'🔢',sentence:'I see ___ stars.'},{id:'twenty',en:'twenty',pt:'vinte',emoji:'🔢',sentence:'I can count to ___.'}],
    fruits:[{id:'mango',en:'mango',pt:'manga',emoji:'🥭',sentence:'This is a ___.'},{id:'cherry',en:'cherry',pt:'cereja',emoji:'🍒',sentence:'The ___ is red.'},{id:'lemon',en:'lemon',pt:'limão',emoji:'🍋',sentence:'The ___ is yellow.'},{id:'coconut',en:'coconut',pt:'coco',emoji:'🥥',sentence:'A ___ has a hard shell.'},{id:'peach',en:'peach',pt:'pêssego',emoji:'🍑',sentence:'This is a ___.'}],
    animals:[{id:'horse',en:'horse',pt:'cavalo',emoji:'🐴',sentence:'The ___ can run.'},{id:'elephant',en:'elephant',pt:'elefante',emoji:'🐘',sentence:'The ___ has a trunk.'},{id:'bee',en:'bee',pt:'abelha',emoji:'🐝',sentence:'The ___ visits flowers.'},{id:'butterfly',en:'butterfly',pt:'borboleta',emoji:'🦋',sentence:'The ___ has colorful wings.'},{id:'panda',en:'panda',pt:'panda',emoji:'🐼',sentence:'The ___ eats bamboo.'},{id:'frog',en:'frog',pt:'sapo',emoji:'🐸',sentence:'The ___ can jump.'}],
    greetings:[{id:'good-afternoon',en:'good afternoon',pt:'boa tarde',emoji:'🌤️',sentence:'Say ___ after midday.'},{id:'good-evening',en:'good evening',pt:'boa noite (ao chegar)',emoji:'🌆',sentence:'Say ___ when you arrive in the evening.'},{id:'sorry',en:'sorry',pt:'desculpe',emoji:'💛',sentence:'Say ___ when you make a mistake.'},{id:'youre-welcome',en:"you're welcome",pt:'de nada',emoji:'😊',sentence:'Say ___ after “thank you”.'},{id:'see-you-soon',en:'see you soon',pt:'até logo',emoji:'👋',sentence:'Say ___ to a friend.'}]
  };
  try { for (const [world, items] of Object.entries(englishExtra)) ENGLISH_WORLDS[world].items.push(...items); } catch (_) {}
  try { Object.assign(ENGLISH_NUMBER_VALUE,{zero:0,eleven:11,twelve:12,thirteen:13,twenty:20}); Object.assign(ENGLISH_COLOR_HEX,{teal:'#14b8a6',brown:'#8b5e3c',gray:'#9ca3af'}); } catch (_) {}

  // Guided birthday melody: all four musical phrases, using the existing C-major keys.
  try {
    const song=PIANO_SONGS.happy;
    song.notes=['sol','sol','la','sol','do2','si','sol','sol','la','sol','re2','do2','sol','sol','sol','mi2','do2','si','la','fa','fa','mi2','do2','re2','do2'];
    song.labels=['Sol','Sol','Lá','Sol','Dó²','Si','Sol','Sol','Lá','Sol','Ré²','Dó²','Sol','Sol','Sol','Mi²','Dó²','Si','Lá','Fá','Fá','Mi²','Dó²','Ré²','Dó²'];
    if(!PIANO_KEYS_DATA.some(x=>x.note==='re2'))PIANO_KEYS_DATA.push({note:'re2',label:'Ré²',freq:587.33,color:'#a855f7',emoji:'🟣'});
    if(!PIANO_KEYS_DATA.some(x=>x.note==='mi2'))PIANO_KEYS_DATA.push({note:'mi2',label:'Mi²',freq:659.25,color:'#db2777',emoji:'💗'});
    window.renderPianoKeys?.(); window.updatePianoGuideDisplay?.();
  } catch (_) {}

  // Reliable audible drum sounds; the context is resumed directly from the user's touch.
  window.playDJPad = async function(type) {
    try {
      const Ctx=window.AudioContext||window.webkitAudioContext;
      const ctx=window.getAudioContext?.() || new Ctx();
      if(ctx.state==='suspended') await ctx.resume();
      const now=ctx.currentTime, gain=ctx.createGain(); gain.connect(ctx.destination);
      const noise=(duration,frequency,typeFilter='highpass')=>{
        const length=Math.max(1,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
        const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();source.buffer=buffer;filter.type=typeFilter;filter.frequency.value=frequency;source.connect(filter);filter.connect(amp);amp.connect(ctx.destination);amp.gain.setValueAtTime(.65,now);amp.gain.exponentialRampToValueAtTime(.001,now+duration);source.start(now);source.stop(now+duration);
      };
      if(type==='kick') { const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(150,now);osc.frequency.exponentialRampToValueAtTime(48,now+.22);amp.gain.setValueAtTime(.9,now);amp.gain.exponentialRampToValueAtTime(.001,now+.24);osc.connect(amp);amp.connect(ctx.destination);osc.start(now);osc.stop(now+.25); }
      else if(type==='snare') { noise(.19,1100); const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(190,now);amp.gain.setValueAtTime(.3,now);amp.gain.exponentialRampToValueAtTime(.001,now+.13);osc.connect(amp);amp.connect(ctx.destination);osc.start(now);osc.stop(now+.14); }
      else if(type==='hat'||type==='hihat') noise(.12,6500);
      else if(type==='clap') { noise(.16,1500); setTimeout(()=>noise(.12,1800),35); }
      else if(type==='synth1'||type==='synth2') { const osc=ctx.createOscillator();osc.type=type==='synth1'?'sine':'sawtooth';osc.frequency.value=type==='synth1'?523.25:659.25;gain.gain.value=.2;osc.connect(gain);osc.start(now);osc.stop(now+.3);setTimeout(()=>gain.disconnect(),400); }
      else if(type==='cheer') noise(.22,900);
      $$('.djPadBtn').forEach(b=>{if((b.getAttribute('onpointerdown')||'').includes(`'${type}'`)){b.classList.add('eloPadHit');setTimeout(()=>b.classList.remove('eloPadHit'),160);}});
    } catch (_) { toast('O som não ficou disponível neste aparelho. Confira se o áudio está ativado.'); }
  };

  // Larger local palette, scrollable on one fixed screen; remove nonworking stamps.
  const artColors=['#ff6b6b','#ff8fab','#e75480','#f72585','#ff4d6d','#fb5607','#ff8500','#ffbe0b','#ffd166','#f4d35e','#d9ed92','#a7c957','#6a994e','#2dc653','#00b894','#00b4d8','#48cae4','#4ea8de','#4361ee','#3a0ca3','#7209b7','#9d4edd','#c77dff','#e0aaff','#ffffff','#f8f9fa','#d9d9d9','#9b9b9b','#4a4e69','#22223b','#7f5539','#bc6c25','#e9c46a','#f4a261','#ffc8dd','#cdb4db','#bde0fe','#a2d2ff','#caffbf','#fdffb6','#f1faee','#ffadad','#a8dadc','#457b9d','#6d597a','#355070','#b56576','#e56b6f'];
  try { for(const c of artColors) if(!PALETTE.includes(c))PALETTE.push(c); window.renderPalette?.(); } catch (_) {}
  const freeColorHost=$('.colorPick')?.parentElement;
  if(freeColorHost){
    freeColorHost.classList.add('eloColorRail');
    freeColorHost.replaceChildren(...artColors.map((color,i)=>{const b=document.createElement('button');b.type='button';b.className='colorPick'+(i===0?' on':'');b.style.background=color;b.setAttribute('aria-label',`Tinta ${i+1}`);b.title=`Cor ${i+1}`;b.addEventListener('click',()=>window.setDrawColor?.(color,b));return b;}));
  }
  const stampRow=$('.stampPickerRow'); stampRow?.remove(); $('.toolBrushes .toolBtn[title="Carimbos"]')?.remove();
  const palette=$('#palette'); if(palette)palette.setAttribute('aria-label','Paleta de cores. Deslize para escolher.');

  // Album: preserve original IDs and progress, grow to exactly 150 collectible designs.
  try {
    const stickerEmojis=['🌟','🌙','☀️','🌈','☁️','🌸','🌼','🌻','🌷','🌹','🍀','🌱','🌳','🍄','🌺','🪻','🦋','🐝','🐞','🐢','🐬','🐳','🐙','🦀','🐠','🐧','🦉','🦊','🐼','🐨','🐯','🦓','🦒','🐘','🦁','🐸','🐰','🐹','🐿️','🦔','🦜','🦚','🐴','🐮','🐑','🐥','🪿','🦕','🦖','🐲','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥝','🥑','🥕','🌽','🥨','🧀','🍞','🥞','🧁','🍰','🍪','🍩','🍭','🍬','🍿','🍯','🧋','🥛','🎂','🎨','🖍️','📚','✏️','🎹','🎵','🎤','🎧','🥁','🎸','🎺','🎻','⚽','🏀','🎾','🏓','🪁','🎠','🎡','🚀','🛸','🪐','🌍','🌎','🌏','🛰️','💎','🔮','🪄','👑','💖','💛','💚','💙','💜','🧸','🎀','👜','👗','👒','👟','🧦','🎁','🛏️','🏡','🏰','🛶','🏖️','🌋','⛄','❄️','🔥','💧','🍃','🪺','🪸','🪷'];
    for(let n=17;n<=150;n++){
      const emoji=stickerEmojis[(n-17)%stickerEmojis.length],group=Math.floor((n-17)/stickerEmojis.length)+1;
      const stickerNouns=['Tesouro','Amizade','Aventura','Brilho','Sonho','Sorriso','Magia','Alegria','Fofura','Descoberta','Coragem','Dança','Piquenique','História'];
      const stickerThemes=['do Jardim','do Espaço','do Oceano','da Música','dos Bichos','das Cores','da Floresta','da Praia','da Festa','da Escola'];
      const name=`${stickerNouns[(n-17)%stickerNouns.length]} ${stickerThemes[Math.floor((n-17)/stickerNouns.length)%stickerThemes.length]}`;
      STICKER_COLLECTION_DATA.push({id:`s${n}`,name,emoji,rarity:n%17===0?'gold':n%5===0?'rare':'common',desc:`Figurinha da coleção mágica ${group}`});
    }
    const albumTitle=$('#stickersAlbumGrid')?.parentElement?.querySelector('h3');if(albumTitle)albumTitle.textContent='Meu álbum: 150 figurinhas';
    const booster=$('#boosterPackBtn small');if(booster)booster.textContent='1 figurinha surpresa por dia';
  } catch (_) {}

  // The 3D studio is an exploratory tool: rotate, compare forms, and learn spatial terms.
  const modelDesc=$('#modelStudioDesc');
  if(modelDesc)modelDesc.textContent='Explore personagens e objetos em 3D: arraste para girar, aproxime com pinça ou roda e observe frente, lado, volume e formas. Os modelos são brincadeiras visuais, não precisam ser baixados nem enviados.';
  const modelTitle=$('#modelStudioTitle');if(modelTitle)modelTitle.textContent='Explorador 3D da Elo';

  // Cinema: keep every shelf reachable and make horizontal rails easy to operate.
  const cinema=$('#cinemaShelves');
  if(cinema&&!$('#eloCinemaHint')){const hint=document.createElement('p');hint.id='eloCinemaHint';hint.className='eloCinemaHint';hint.textContent='Deslize para baixo para ver todas as prateleiras; arraste cada prateleira para os lados para ver mais vídeos.';cinema.before(hint);}
  $$('.cinemaRail').forEach(rail=>rail.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){rail.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false}));

  // Stabilize the piano screen while preserving horizontal swipes over song/color rails.
  const music=$('#schoolMusicCard');
  const syncPianoLock=()=>document.body.classList.toggle('eloPianoLock',!!music&&!music.classList.contains('hidden'));
  if(music){syncPianoLock();new MutationObserver(syncPianoLock).observe(music,{attributes:true,attributeFilter:['class']});}
  document.addEventListener('touchmove',e=>{if(e.target.closest('.pianoKey3D,.djPadBtn'))e.preventDefault();},{passive:false,capture:true});

  // Stabilize game modal and recover a blank star round when it is opened.
  const modal=$('#gameModal');
  if(modal){
    const recover=()=>{
      if(modal.classList.contains('hidden'))return;
      if($('#findGame')?.classList.contains('active')&&$('#findStage')&&!$('#findStage .obj,#findStage .target')){try{window.resetFind?.(true);}catch(_){}}
      if($('#mazeGame')?.classList.contains('active')&&$('#mazeBoard')&&!$('#mazeBoard').children.length){try{window.startMaze?.();}catch(_){}}
      if($('#unicornChaseGame')?.classList.contains('active')&&$('#chaseBoard')&&!$('#chaseBoard').children.length){try{window.startChase?.();}catch(_){}}
    };
    new MutationObserver(recover).observe(modal,{attributes:true,attributeFilter:['class']});
    $$('.gameLaunch').forEach(card=>card.addEventListener('click',()=>setTimeout(recover,60)));
  }

  // Put the game's controls ahead of the board so the hard-memory board never covers them.
  function moveMemoryControls(){
    const section=$('#memoryGame'), row=$('.gamePlayRowLandscape',section), board=$('#memory',section), controls=$('.gameControlsColLandscape',section);
    if(!section||!row||!board||!controls||$('#eloMemoryToolbar'))return;
    const toolbar=document.createElement('div');toolbar.id='eloMemoryToolbar';toolbar.className='eloGameToolbar';
    for(const node of [...controls.children])toolbar.appendChild(node);
    row.before(toolbar);row.appendChild(board);row.classList.add('eloMemoryRow');
  }
  moveMemoryControls();
  function movePuzzleControls(){
    const section=$('#puzzleGame'),row=$('.gamePlayRowLandscape',section),stage=$('.gameStageColLandscape',section),controls=$('.gameControlsColLandscape',section);
    if(!section||!row||!stage||!controls||$('#eloPuzzleToolbar'))return;
    const toolbar=document.createElement('div');toolbar.id='eloPuzzleToolbar';toolbar.className='eloGameToolbar';
    for(const node of [...controls.children])toolbar.appendChild(node);
    row.before(toolbar);row.appendChild(stage);stage.style.width='100%';row.classList.add('eloPuzzleRow');
  }
  movePuzzleControls();
  function moveTapControls(){
    const section=$('#tapGameSection'),row=$('.gamePlayRowLandscape',section),brief=$('.gameStageColLandscape',section),controls=$('.gameControlsColLandscape',section);
    if(!section||!row||!brief||!controls||brief.classList.contains('eloTapBrief'))return;
    brief.classList.add('eloTapBrief');row.before(brief);row.appendChild(controls);row.classList.add('eloTapRow');
  }
  moveTapControls();

  // Keep cards for RPG and Trail visually equal to the rest of the game grid.
  $$('.gameLaunch.full').forEach(card=>card.classList.add('eloCompactGameCard'));

  // Correct narrow collision reports: damage must coincide with actual drawn hitboxes.
  if(typeof window.trailDamage==='function'&&!window.trailDamage.__eloPhysicalContact){
    const original=window.trailDamage;
    const guarded=function(amount,message){
      try{
        const hit=trailState?.entities?.find(e=>e.kind==='obstacle'&&e.hit&&!e.cleared);
        if(hit&&!trailState.isFlying){const p=trailState.player;const overlap=p&&p.x < hit.x+hit.w&&p.x+p.w > hit.x&&p.y < hit.y+hit.h&&p.y+p.h > hit.y;if(!overlap){hit.hit=false;return;}}
      }catch(_){}
      return original.apply(this,arguments);
    };
    guarded.__eloPhysicalContact=true;window.trailDamage=guarded;
  }

  // Accessible live announcements and direct controls remain usable without page scrolling.
  for(const id of ['findStatus','findTime','mazeStatus','chaseStatus','memoryStatus','puzzleStatus','tapPrompt','trailStatus','pianoSongGuide']){const node=$(`#${id}`);if(node){node.setAttribute('role','status');node.setAttribute('aria-live','polite');}}
  window.EloGameRework={version:'4.3.28',stickerCount:()=>STICKER_COLLECTION_DATA.length,questionCounts:()=>Object.fromEntries(Object.entries(QUESTIONS).map(([k,v])=>[k,v.length])),careTabs:['teeth','bandage','lunch']};
})();
