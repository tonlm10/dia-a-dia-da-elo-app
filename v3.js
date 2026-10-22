/* Dia a Dia da Elo — v3.5.3: RPG expandido, personagem unificada e refinamentos gerais */
(function(){
'use strict';
const V3_KEY='eloV3WorldState';
const V3_COLLECTIONS={
  stars:{icon:'⭐',name:'Estrelas',goal:12},bows:{icon:'🎀',name:'Laços',goal:6},unicorns:{icon:'🦄',name:'Unicórnios',goal:5},rainbows:{icon:'🌈',name:'Arco-íris',goal:5},stickers:{icon:'✨',name:'Adesivos',goal:12}
};
const ROOM_DECOR=[
 {id:'wallPink',kind:'wall',icon:'🩷',name:'Parede Rosa',need:0,className:''},
 {id:'wallMint',kind:'wall',icon:'🌿',name:'Parede Menta',need:8,className:'wall-mint'},
 {id:'wallBlue',kind:'wall',icon:'🩵',name:'Parede Céu',need:10,className:'wall-blue'},
 {id:'wallLavender',kind:'wall',icon:'🪻',name:'Parede Lilás',need:16,className:'wall-lavender'},
 {id:'wallPeach',kind:'wall',icon:'🍑',name:'Parede Pêssego',need:18,className:'wall-peach'},
 {id:'wallStars',kind:'wall',icon:'🌌',name:'Parede Estrelas',need:25,className:'wall-stars'},
 {id:'noneArt',kind:'art',icon:'🚫',name:'Sem quadro',need:0},
 {id:'rainbow',kind:'art',icon:'🌈',name:'Quadro Arco-íris',need:0},
 {id:'butterflies',kind:'art',icon:'🦋',name:'Quadro Borboletas',need:10},
 {id:'flowers',kind:'art',icon:'🌸',name:'Quadro Flores',need:16},
 {id:'stars',kind:'art',icon:'⭐',name:'Quadro Estrelas',need:18},
 {id:'castle',kind:'art',icon:'🏰',name:'Quadro Castelo',need:24},
 {id:'clouds',kind:'art',icon:'☁️',name:'Quadro Nuvens',need:28},
 {id:'heart',kind:'art',icon:'💗',name:'Quadro Coração',need:35},
 {id:'bedPink',kind:'bed',icon:'🛏️',name:'Cama Rosa',need:0},
 {id:'bedMint',kind:'bed',icon:'🌿',name:'Cama Menta',need:12},
 {id:'bedBlue',kind:'bed',icon:'🩵',name:'Cama Céu',need:20},
 {id:'bedPeach',kind:'bed',icon:'🍑',name:'Cama Pêssego',need:26},
 {id:'bedLilac',kind:'bed',icon:'💜',name:'Cama Lilás',need:30},
 {id:'bedStar',kind:'bed',icon:'⭐',name:'Cama Estrela',need:45},
 {id:'noneRug',kind:'rug',icon:'🚫',name:'Sem tapete',need:0},
 {id:'rugHeart',kind:'rug',icon:'💗',name:'Tapete Coração',need:0},
 {id:'rugFlower',kind:'rug',icon:'🌸',name:'Tapete Flor',need:10},
 {id:'rugRainbow',kind:'rug',icon:'🌈',name:'Tapete Arco-íris',need:14},
 {id:'rugStar',kind:'rug',icon:'⭐',name:'Tapete Estrela',need:24},
 {id:'rugCloud',kind:'rug',icon:'☁️',name:'Tapete Nuvem',need:32},
 {id:'noneToy',kind:'toy',icon:'🚫',name:'Sem brinquedo',need:0,shape:'none'},
 {id:'unicorn',kind:'toy',icon:'🦄',name:'Unicórnio de pelúcia',need:0,shape:'unicorn'},
 {id:'bunny',kind:'toy',icon:'🐰',name:'Coelhinho',need:8,shape:'bunny'},
 {id:'drum',kind:'toy',icon:'🥁',name:'Tambor',need:12,shape:'drum'},
 {id:'teddy',kind:'toy',icon:'🧸',name:'Ursinho',need:15,shape:'teddy'},
 {id:'ball',kind:'toy',icon:'⚽',name:'Bola colorida',need:18,shape:'ball'},
 {id:'kite',kind:'toy',icon:'🪁',name:'Pipa',need:22,shape:'kite'},
 {id:'cat',kind:'toy',icon:'🐱',name:'Gatinho',need:30,shape:'cat'},
 {id:'blocks',kind:'toy',icon:'🧱',name:'Blocos',need:36,shape:'blocks'},
 {id:'rocket',kind:'toy',icon:'🚀',name:'Foguete',need:42,shape:'rocket'},
 {id:'wallGalaxy',kind:'wall',icon:'🌌',name:'Parede Galáxia',need:30,className:'wall-galaxy'},
 {id:'wallCandy',kind:'wall',icon:'🍭',name:'Parede Confeitos',need:22,className:'wall-candy'},
 {id:'wallCastle',kind:'wall',icon:'🏰',name:'Parede Castelo',need:35,className:'wall-castle'},
 {id:'artUnicorn',kind:'art',icon:'🦄',name:'Quadro Unicórnio',need:20},
 {id:'artFriends',kind:'art',icon:'👭',name:'Quadro Amigas',need:15},
 {id:'artSpace',kind:'art',icon:'🚀',name:'Quadro Espacial',need:25},
 {id:'bedCloud',kind:'bed',icon:'☁️',name:'Cama Nuvem',need:28},
 {id:'bedCastle',kind:'bed',icon:'🏰',name:'Cama Castelo',need:40},
 {id:'bedRainbow',kind:'bed',icon:'🌈',name:'Cama Arco-Íris',need:35},
 {id:'rugComet',kind:'rug',icon:'☄️',name:'Tapete Cometa',need:20},
 {id:'rugPaw',kind:'rug',icon:'🐾',name:'Tapete Patinha',need:12},
 {id:'rugButterfly',kind:'rug',icon:'🦋',name:'Tapete Borboleta',need:18},
 {id:'robotToy',kind:'toy',icon:'🤖',name:'Robô Amigo',need:20,shape:'robot'},
 {id:'dragonToy',kind:'toy',icon:'🐲',name:'Dragãozinho',need:28,shape:'dragon'},
 {id:'dollhouseToy',kind:'toy',icon:'🏡',name:'Casinha Mágica',need:32,shape:'dollhouse'}

];
const WARDROBE_CATEGORIES=[
 {id:'skin',name:'Tom de Pele',icon:'🎨'},
 {id:'eyes',name:'Olhos',icon:'👀'},
 {id:'hairstyle',name:'Cabelos',icon:'💇‍♀️'},
 {id:'top',name:'Camisetas',icon:'👚'},
 {id:'bottom',name:'Shorts e saias',icon:'🩳'},
 {id:'dress',name:'Vestidos',icon:'👗'},
 {id:'shoes',name:'Sapatos',icon:'👟'},
 {id:'hair',name:'Laços e tiaras',icon:'🎀'},
 {id:'earrings',name:'Brincos',icon:'💎'},
 {id:'ring',name:'Anéis',icon:'💍'},
 {id:'bracelet',name:'Pulseiras',icon:'⌚'},
 {id:'necklace',name:'Colares',icon:'📿'},
 {id:'makeup',name:'Maquiagem',icon:'💄'}
];
const WARDROBE_ITEMS=[
 {id:'skinFair',cat:'skin',name:'Pele Clara',need:0,cls:'skin-fair',color:'#fde0cb',thumb:'skin fair'},
 {id:'skinWarm',cat:'skin',name:'Pele Pêssego',need:0,cls:'skin-warm',color:'#f1b884',thumb:'skin warm'},
 {id:'skinTan',cat:'skin',name:'Pele Morena',need:0,cls:'skin-tan',color:'#d99a63',thumb:'skin tan'},
 {id:'skinDark',cat:'skin',name:'Pele Negra',need:0,cls:'skin-dark',color:'#8f5835',thumb:'skin dark'},
 {id:'eyeBrown',cat:'eyes',name:'Castanhos',need:0,cls:'eye-brown',color:'#503222',thumb:'eye brown'},
 {id:'eyeGreen',cat:'eyes',name:'Verdes',need:0,cls:'eye-green',color:'#2f7a4c',thumb:'eye green'},
 {id:'eyeBlue',cat:'eyes',name:'Azuis',need:0,cls:'eye-blue',color:'#2f69a8',thumb:'eye blue'},
 {id:'eyeViolet',cat:'eyes',name:'Violeta',need:10,cls:'eye-violet',color:'#7a46b6',thumb:'eye violet'},
 {id:'eyeHoney',cat:'eyes',name:'Olhos Mel',need:15,cls:'eye-honey',color:'#b87c28',thumb:'eye honey'},
 {id:'hairCurly',cat:'hairstyle',name:'Cacheado com rabo',need:0,cls:'style-curly',thumb:'hairstyle curly'},{id:'hairLowPony',cat:'hairstyle',name:'Rabo baixo',need:6,cls:'style-lowpony',thumb:'hairstyle lowpony'},{id:'hairLoose',cat:'hairstyle',name:'Cacheado solto',need:12,cls:'style-loose',thumb:'hairstyle loose'},{id:'hairSidePony',cat:'hairstyle',name:'Rabo lateral',need:14,cls:'style-sidepony',thumb:'hairstyle sidepony'},{id:'hairBun',cat:'hairstyle',name:'Coque',need:20,cls:'style-bun',thumb:'hairstyle bun'},{id:'hairHalfBun',cat:'hairstyle',name:'Meio coque',need:26,cls:'style-halfbun',thumb:'hairstyle halfbun'},{id:'hairTwins',cat:'hairstyle',name:'Maria-chiquinha',need:28,cls:'style-twins',thumb:'hairstyle twins'},{id:'hairBraid',cat:'hairstyle',name:'Trança longa',need:40,cls:'style-braid',thumb:'hairstyle braid'},
 {id:'teePink',cat:'top',name:'Camiseta Rosa',need:0,cls:'top-pink',thumb:'shirt pink'},{id:'teeMint',cat:'top',name:'Camiseta Menta',need:6,cls:'top-mint',thumb:'shirt mint'},{id:'teeLilac',cat:'top',name:'Camiseta Lilás',need:8,cls:'top-lilac',thumb:'shirt lilac'},{id:'teeHeart',cat:'top',name:'Camiseta Coração',need:12,cls:'top-heart',thumb:'shirt heart'},{id:'teeSun',cat:'top',name:'Camiseta Sol',need:18,cls:'top-sun',thumb:'shirt sun'},{id:'teeRainbow',cat:'top',name:'Camiseta Arco-íris',need:22,cls:'top-rainbow',thumb:'shirt rainbow'},{id:'teeStarry',cat:'top',name:'Camiseta Estrelas',need:26,cls:'top-starry',thumb:'shirt starry'},{id:'teeGame',cat:'top',name:'Camiseta Gamer',need:32,cls:'top-game',thumb:'shirt game'},{id:'teeSport',cat:'top',name:'Camiseta Esporte',need:38,cls:'top-sport',thumb:'shirt sport'},{id:'teePop',cat:'top',name:'Guerreira Pop',need:55,cls:'top-pop',thumb:'shirt pop'},
 {id:'shortDenim',cat:'bottom',name:'Shorts Jeans',need:0,cls:'bottom-shorts',thumb:'short denim'},{id:'shortPink',cat:'bottom',name:'Shorts Rosa',need:8,cls:'bottom-shorts-pink',thumb:'short pink'},{id:'skirtPink',cat:'bottom',name:'Saia Rosa',need:10,cls:'bottom-skirt',thumb:'skirt rose'},{id:'skirtBlue',cat:'bottom',name:'Saia Azul',need:14,cls:'bottom-skirt-blue',thumb:'skirt blue'},{id:'skirtLilac',cat:'bottom',name:'Saia Lilás',need:16,cls:'bottom-skirt-lilac',thumb:'skirt lilac'},{id:'leggingsPink',cat:'bottom',name:'Legging Rosa',need:22,cls:'bottom-leggings-pink',thumb:'pants pink'},{id:'pantsBlue',cat:'bottom',name:'Calça Azul',need:24,cls:'bottom-pants',thumb:'pants blue'},{id:'pantsBlack',cat:'bottom',name:'Calça Preta',need:42,cls:'bottom-pants-black',thumb:'pants black'},{id:'pantsCargo',cat:'bottom',name:'Calça Cargo Lilás',need:50,cls:'bottom-pants-cargo',thumb:'pants cargo'},{id:'skirtPop',cat:'bottom',name:'Saia Guerreira Pop',need:60,cls:'bottom-pop',thumb:'skirt pop'},
 {id:'noneDress',cat:'dress',name:'Sem vestido',need:0,cls:'dress-none',thumb:'none'},{id:'dressPink',cat:'dress',name:'Vestido Rosa',need:16,cls:'dress-pink',thumb:'dress pink'},{id:'dressRainbow',cat:'dress',name:'Vestido Arco-íris',need:24,cls:'dress-rainbow',thumb:'dress rainbow'},{id:'dressStar',cat:'dress',name:'Vestido Estrelas',need:36,cls:'dress-star',thumb:'dress star'},{id:'dressGarden',cat:'dress',name:'Vestido Jardim',need:44,cls:'dress-garden',thumb:'dress garden'},{id:'dressPrincess',cat:'dress',name:'Vestido Princesa',need:48,cls:'dress-princess',thumb:'dress princess'},{id:'dressUnicorn',cat:'dress',name:'Vestido Unicórnio',need:58,cls:'dress-unicorn',thumb:'dress unicorn'},{id:'dressPop',cat:'dress',name:'Vestido Pop Lunar',need:72,cls:'dress-pop',thumb:'dress pop'},
 {id:'shoePink',cat:'shoes',name:'Tênis Rosa',need:0,cls:'shoes-pink',thumb:'shoes pink'},{id:'shoeWhite',cat:'shoes',name:'Tênis Branco',need:12,cls:'shoes-white',thumb:'shoes white'},{id:'shoeLilac',cat:'shoes',name:'Tênis Lilás',need:18,cls:'shoes-lilac',thumb:'shoes lilac'},{id:'sandalGold',cat:'shoes',name:'Sandália Dourada',need:28,cls:'shoes-sandal-gold',thumb:'shoes gold'},{id:'shoeBoot',cat:'shoes',name:'Botinha Lilás',need:30,cls:'shoes-boot',thumb:'shoes purple'},{id:'shoeCyan',cat:'shoes',name:'Tênis Azul',need:36,cls:'shoes-cyan',thumb:'shoes cyan'},{id:'shoeBlack',cat:'shoes',name:'Bota Preta',need:48,cls:'shoes-black',thumb:'shoes black'},
 {id:'bowPink',cat:'hair',name:'Laço Rosa',need:0,cls:'hair-bow-pink',thumb:'bow pink'},{id:'bowBlue',cat:'hair',name:'Laço Azul',need:8,cls:'hair-bow-blue',thumb:'bow blue'},{id:'bowLilac',cat:'hair',name:'Laço Lilás',need:12,cls:'hair-bow-lilac',thumb:'bow lilac'},{id:'tiaraFlower',cat:'hair',name:'Tiara Flor',need:24,cls:'hair-tiara-flower',thumb:'tiara flower'},{id:'tiaraStar',cat:'hair',name:'Tiara Estrela',need:35,cls:'hair-tiara-star',thumb:'tiara star'},{id:'tiaraPearl',cat:'hair',name:'Tiara Pérola',need:46,cls:'hair-tiara-pearl',thumb:'tiara pearl'},{id:'headPop',cat:'hair',name:'Presilha Pop',need:62,cls:'hair-pop',thumb:'tiara pop'},
 {id:'noneEarring',cat:'earrings',name:'Sem brinco',need:0,cls:'ear-none',thumb:'none'},{id:'earHeart',cat:'earrings',name:'Brinco Coração',need:14,cls:'ear-heart',thumb:'ear heart'},{id:'earFlower',cat:'earrings',name:'Brinco Flor',need:20,cls:'ear-flower',thumb:'ear flower'},{id:'earStar',cat:'earrings',name:'Brinco Estrela',need:30,cls:'ear-star',thumb:'ear star'},{id:'earMoon',cat:'earrings',name:'Brinco Lua',need:44,cls:'ear-moon',thumb:'ear moon'},
 {id:'noneRing',cat:'ring',name:'Sem anel',need:0,cls:'ring-none',thumb:'none'},{id:'ringPink',cat:'ring',name:'Anel Rosa',need:18,cls:'ring-pink',thumb:'ring pink'},{id:'ringHeart',cat:'ring',name:'Anel Coração',need:22,cls:'ring-heart',thumb:'ring heart'},{id:'ringStar',cat:'ring',name:'Anel Estrela',need:38,cls:'ring-star',thumb:'ring star'},{id:'ringMoon',cat:'ring',name:'Anel Lua',need:50,cls:'ring-moon',thumb:'ring moon'},
 {id:'noneBracelet',cat:'bracelet',name:'Sem pulseira',need:0,cls:'bracelet-none',thumb:'none'},{id:'braceletPink',cat:'bracelet',name:'Pulseira Rosa',need:10,cls:'bracelet-pink',thumb:'bracelet pink'},{id:'braceletPearl',cat:'bracelet',name:'Pulseira Pérola',need:18,cls:'bracelet-pearl',thumb:'bracelet pearl'},{id:'braceletRainbow',cat:'bracelet',name:'Pulseira Arco-íris',need:28,cls:'bracelet-rainbow',thumb:'bracelet rainbow'},{id:'braceletPop',cat:'bracelet',name:'Pulseira Neon',need:52,cls:'bracelet-pop',thumb:'bracelet pop'},
 {id:'noneNecklace',cat:'necklace',name:'Sem colar',need:0,cls:'necklace-none',thumb:'none'},{id:'neckHeart',cat:'necklace',name:'Colar Coração',need:16,cls:'neck-heart',thumb:'necklace heart'},{id:'neckRainbow',cat:'necklace',name:'Colar Arco-íris',need:22,cls:'neck-rainbow',thumb:'necklace rainbow'},{id:'neckStar',cat:'necklace',name:'Colar Estrela',need:34,cls:'neck-star',thumb:'necklace star'},{id:'neckMoon',cat:'necklace',name:'Colar Lua',need:54,cls:'neck-moon',thumb:'necklace moon'},
 {id:'makeupSoft',cat:'makeup',name:'Natural',need:0,cls:'makeup-soft',thumb:'makeup soft'},{id:'makeupPeach',cat:'makeup',name:'Pêssego',need:12,cls:'makeup-peach',thumb:'makeup peach'},{id:'makeupPink',cat:'makeup',name:'Rosa Suave',need:20,cls:'makeup-pink',thumb:'makeup pink'},{id:'makeupParty',cat:'makeup',name:'Brilho de Festa',need:42,cls:'makeup-party',thumb:'makeup party'},{id:'makeupPop',cat:'makeup',name:'Palco Pop',need:64,cls:'makeup-pop',thumb:'makeup pop'},
 {id:'hairAfro',cat:'hairstyle',name:'Black Power Estrelar',need:10,cls:'style-afro',thumb:'hairstyle afro'},
 {id:'hairShort',cat:'hairstyle',name:'Curto Moderno',need:8,cls:'style-short',thumb:'hairstyle short'},
 {id:'hairBoxBraids',cat:'hairstyle',name:'Tranças com Miçangas',need:18,cls:'style-boxbraids',thumb:'hairstyle boxbraids'},
 {id:'hairPastel',cat:'hairstyle',name:'Ondulado com Mechas',need:22,cls:'style-pastel',thumb:'hairstyle pastel'},
 {id:'dressFairy',cat:'dress',name:'Fada Borboleta',need:25,cls:'dress-fairy',thumb:'dress fairy'},
 {id:'dressSpace',cat:'dress',name:'Astronauta Estelar',need:35,cls:'dress-space',thumb:'dress space'},
 {id:'dressMermaid',cat:'dress',name:'Sereia Encantada',need:45,cls:'dress-mermaid',thumb:'dress mermaid'},
 {id:'teeArtist',cat:'top',name:'Camiseta Artista',need:10,cls:'top-artist',thumb:'shirt artist'},
 {id:'teeFairy',cat:'top',name:'Top Brilho Encantado',need:15,cls:'top-fairy',thumb:'shirt fairy'},
 {id:'wingsFairy',cat:'hair',name:'Asinhas Luminosas',need:20,cls:'hair-wings',thumb:'hair wings'},
 {id:'headCat',cat:'hair',name:'Fone Gatinho Gamer',need:25,cls:'hair-headcat',thumb:'hair cat'},
 {id:'glassesHeart',cat:'hair',name:'Óculos Coração Glitter',need:15,cls:'hair-glasses',thumb:'hair glasses'}

];
const WARDROBE_PRESETS=[
 {id:'original',name:'Original',icon:'💗',need:0,set:{hairstyle:'hairCurly',top:'teePink',bottom:'shortDenim',dress:'noneDress',shoes:'shoePink',hair:'bowPink',earrings:'noneEarring',ring:'noneRing',bracelet:'noneBracelet',necklace:'noneNecklace',makeup:'makeupSoft'}},
 {id:'fresh',name:'Menta',icon:'🌿',need:18,set:{hairstyle:'hairSidePony',top:'teeMint',bottom:'skirtBlue',dress:'noneDress',shoes:'shoeWhite',hair:'bowBlue',earrings:'earFlower',ring:'noneRing',bracelet:'braceletPearl',necklace:'neckRainbow',makeup:'makeupPeach'}},
 {id:'rainbow',name:'Arco-íris',icon:'🌈',need:28,set:{hairstyle:'hairLoose',top:'teeRainbow',bottom:'skirtLilac',dress:'noneDress',shoes:'shoeWhite',hair:'bowLilac',earrings:'earStar',ring:'noneRing',bracelet:'braceletRainbow',necklace:'neckStar',makeup:'makeupPink'}},
 {id:'garden',name:'Jardim',icon:'🌸',need:44,set:{hairstyle:'hairHalfBun',top:'teeMint',bottom:'skirtPink',dress:'dressGarden',shoes:'shoeLilac',hair:'tiaraFlower',earrings:'earFlower',ring:'ringHeart',bracelet:'braceletPearl',necklace:'neckHeart',makeup:'makeupPeach'}},
 {id:'princess',name:'Princesa',icon:'👑',need:48,set:{hairstyle:'hairBun',top:'teePink',bottom:'skirtPink',dress:'dressPrincess',shoes:'shoeWhite',hair:'tiaraPearl',earrings:'earHeart',ring:'ringPink',bracelet:'braceletPink',necklace:'neckHeart',makeup:'makeupPink'}},
 {id:'unicorn',name:'Unicórnio',icon:'🦄',need:58,set:{hairstyle:'hairTwins',top:'teeRainbow',bottom:'skirtLilac',dress:'dressUnicorn',shoes:'shoeCyan',hair:'tiaraStar',earrings:'earStar',ring:'ringStar',bracelet:'braceletRainbow',necklace:'neckStar',makeup:'makeupParty'}},
 {id:'pop',name:'Guerreira Pop',icon:'🎤',need:72,set:{hairstyle:'hairBraid',top:'teePop',bottom:'skirtPop',dress:'noneDress',shoes:'shoeBlack',hair:'headPop',earrings:'earMoon',ring:'ringMoon',bracelet:'braceletPop',necklace:'neckMoon',makeup:'makeupPop'}}
];
let wardrobeCategory='top';
function defaultV3(){return{collections:{stars:0,bows:0,unicorns:0,rainbows:0,stickers:0},secrets:[],room:{wall:'wallPink',art:'rainbow',bed:'bedPink',rug:'rugHeart',toy:'unicorn'},outfit:'pink',wardrobe:{skin:'skinWarm',eyes:'eyeBrown',hairstyle:'hairCurly',top:'teePink',bottom:'shortDenim',dress:'noneDress',shoes:'shoePink',hair:'bowPink',earrings:'noneEarring',ring:'noneRing',bracelet:'noneBracelet',necklace:'noneNecklace',makeup:'makeupSoft'},weekly:{key:'',opened:false},creativeDone:[],interactiveDone:[],familyRounds:0,schoolProgress:{colors:0,numbers:0,shapes:0,animals:0}}}
function v3Load(){try{return Object.assign(defaultV3(),JSON.parse(pget(V3_KEY)||'{}'))}catch(_){return defaultV3()}}
function v3Save(v){pset(V3_KEY,JSON.stringify(v));renderV3Counters()}
function v3Total(v=v3Load()){return Object.values(v.collections||{}).reduce((a,b)=>a+Number(b||0),0)}
function addCollectible(type,n=1,message){const v=v3Load();if(!(type in V3_COLLECTIONS))return;v.collections[type]=Math.min(V3_COLLECTIONS[type].goal,Number(v.collections[type]||0)+n);v3Save(v);if(message)toast(message);renderCollection();renderRoom();renderWardrobe();initWorldMapElo();}
const WORLD_META={
  room:{title:'Quarto 3D da Elo',sub:'Decore móveis e divirta-se'},
  wardrobe:{title:'Guarda-roupa da Elo',sub:'Monte looks e estilos lindos'},
  pet:{title:'Bichinho Virtual',sub:'Alimente e brinque com seu pet'},
  studio3d:{title:'Estúdio 3D & Voo',sub:'Modelos 3D e voo na Unicórnia'},
  school:{title:'Escolinha Mágica',sub:'Letras, números e piano colorido'},
  creative:{title:'Ateliê Criativo',sub:'Pinte, desenhe e faça receitas'},
  play:{title:'Mundo dos Jogos',sub:'Minijogos da Trilha, Labirinto e Memória'},
  rpg:{title:'Reino das Estrelas',sub:'Grande aventura RPG da Elo'},
  cinema:{title:'Cinema da Elo',sub:'Vídeos oficiais e historinhas'},
  family:{title:'Festa da Família',sub:'Mímica, duelos e brincadeiras em grupo'},
  library:{title:'Biblioteca de Histórias',sub:'Livros ilustrados e narrados'},
  club:{title:'Clubinho da Elo',sub:'Área oficial para membros e novidades'}
};
function renderHomeContinue(){const id=pget('v3LastPlace')||'',m=WORLD_META[id],t=document.getElementById('continueTitle'),s=document.getElementById('continueSub');if(t)t.textContent=m?.title||'Escolha uma aventura';if(s)s.textContent=m?.sub||'O app lembra seu último lugar.'}
function renderV3Counters(){const v=v3Load(),el=document.getElementById('collectionHomeCount');if(el)el.textContent=`${v3Total(v)} itens`;const wk=document.getElementById('weeklySurpriseStatus');if(wk)wk.textContent=v.weekly?.opened&&v.weekly.key===weekKey()?'Já descoberta ✓':'Toque para abrir';renderHomeContinue();}
window.renderV3Counters=renderV3Counters;
window.openContinueSpot=function(){const p=pget('v3LastPlace');if(p&&WORLD_META[p])openWorldPlace(p);else eloGuideSay('Escolha um lugar no mapa e eu vou lembrar para você continuar depois!')};

window.playEloVoice=function(clip){const map={intro:'assets/audio/elo-intro.m4a'};const src=map[clip];if(!src)return false;try{let a=window.__eloVoiceAudio;if(!a){a=new Audio();a.preload='auto';window.__eloVoiceAudio=a}a.pause();a.currentTime=0;a.src=`${src}?v=${(self.ELO_APP_VERSION||'3.5.3')}`;a.play().catch(()=>{});return true}catch(_){return false}};
window.eloGuideSay=function(text,clip=''){const b=document.getElementById('eloGuideText');if(b)b.textContent=text;const played=clip?window.playEloVoice(clip):false;if(!played&&typeof speakText==='function')speakText(text)};
window.worldPlaceSpeak=function(text){if(getActiveProfile().ageRange==='3-5'&&typeof speakText==='function')speakText(text)};
// ==========================================================
// SISTEMA DE CAMINHADA DA ELO PELA ESTRADA DO MUNDO
// ==========================================================
const WORLD_ROAD_NODES = {
  room:     { x: 10.0, y: 40.0 },
  U_west:   { x: 24.0, y: 38.0 }, // perto do Pet
  U_mid1:   { x: 36.0, y: 52.0 }, // curva da estrada superior
  U_center: { x: 50.0, y: 32.0 }, // perto da Escolinha
  U_mid2:   { x: 63.0, y: 54.0 }, // curva da estrada superior
  U_east:   { x: 74.0, y: 34.0 }, // perto dos Jogos
  cinema:   { x: 91.0, y: 33.0 }, // perto do Cinema

  wardrobe: { x: 11.0, y: 72.0 }, // perto do Guarda-roupa
  L_west:   { x: 26.0, y: 76.0 }, // perto do Estúdio 3D
  L_mid1:   { x: 36.0, y: 75.0 }, // curva da estrada inferior
  creative: { x: 44.0, y: 71.0 }, // perto do Ateliê
  family:   { x: 63.0, y: 76.0 }, // perto da Festa Família
  rpg:      { x: 81.0, y: 70.0 }, // perto do RPG
  library:  { x: 93.0, y: 62.0 }, // perto da Biblioteca

  // Conexões transversais
  T_west:   { x: 25.0, y: 57.0 },
  T_center: { x: 47.0, y: 52.0 },
  T_east:   { x: 78.0, y: 52.0 }
};

const WORLD_ROAD_EDGES = [
  // Estrada Superior
  ['room', 'U_west'],
  ['U_west', 'U_mid1'],
  ['U_mid1', 'U_center'],
  ['U_center', 'U_mid2'],
  ['U_mid2', 'U_east'],
  ['U_east', 'cinema'],

  // Estrada Inferior
  ['wardrobe', 'L_west'],
  ['L_west', 'L_mid1'],
  ['L_mid1', 'creative'],
  ['creative', 'family'],
  ['family', 'rpg'],
  ['rpg', 'library'],

  // Transversal Oeste
  ['U_west', 'T_west'],
  ['T_west', 'L_west'],

  // Transversal Central
  ['U_center', 'T_center'],
  ['T_center', 'creative'],

  // Transversal Leste
  ['U_east', 'T_east'],
  ['T_east', 'rpg']
];

const BUILDING_TO_ROAD_NODE = {
  room: 'room',
  wardrobe: 'wardrobe',
  pet: 'U_west',
  studio3d: 'L_west',
  school: 'U_center',
  creative: 'creative',
  family: 'family',
  play: 'U_east',
  rpg: 'rpg',
  cinema: 'cinema',
  library: 'library',
  club: 'U_center'
};

function getRoadNeighbors(nodeId) {
  const neighbors = [];
  for(const [u, v] of WORLD_ROAD_EDGES) {
    if(u === nodeId) neighbors.push(v);
    else if(v === nodeId) neighbors.push(u);
  }
  return neighbors;
}

function findShortestRoadPath(startId, goalId) {
  if(!WORLD_ROAD_NODES[startId] || !WORLD_ROAD_NODES[goalId]) return [goalId || 'U_center'];
  if(startId === goalId) return [startId];
  
  const dist = {};
  const prev = {};
  const unvisited = new Set(Object.keys(WORLD_ROAD_NODES));
  
  for(const id of unvisited) dist[id] = Infinity;
  dist[startId] = 0;
  
  while(unvisited.size > 0) {
    let closest = null;
    let minD = Infinity;
    for(const id of unvisited) {
      if(dist[id] < minD) {
        minD = dist[id];
        closest = id;
      }
    }
    if(!closest || minD === Infinity) break;
    if(closest === goalId) break;
    unvisited.delete(closest);
    
    const p1 = WORLD_ROAD_NODES[closest];
    for(const nxt of getRoadNeighbors(closest)) {
      if(!unvisited.has(nxt)) continue;
      const p2 = WORLD_ROAD_NODES[nxt];
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const alt = dist[closest] + d;
      if(alt < dist[nxt]) {
        dist[nxt] = alt;
        prev[nxt] = closest;
      }
    }
  }
  
  const path = [];
  let curr = goalId;
  while(curr) {
    path.unshift(curr);
    curr = prev[curr];
  }
  return path.length > 0 && path[0] === startId ? path : [startId, goalId];
}

let isEloWalkingOnRoad = false;
let eloWalkTimeoutChain = [];

function clearEloWalkAnimation() {
  eloWalkTimeoutChain.forEach(t => clearTimeout(t));
  eloWalkTimeoutChain = [];
  const eloWalker = document.getElementById('worldEloWalker');
  if(eloWalker) {
    eloWalker.classList.remove('isWalking', 'hasArrived');
  }
  isEloWalkingOnRoad = false;
}

function syncWorldMapElo(v) {
  const mount = document.getElementById('worldMapEloMount');
  const source = document.getElementById('wardrobeElo');
  if(!mount) return;
  if(!v) v = v3Load();
  let doll = mount.querySelector('.worldMapEloClone');
  if(!doll && source) {
    doll = source.cloneNode(true);
    doll.removeAttribute('id');
    doll.classList.add('worldMapEloClone');
    doll.setAttribute('aria-hidden', 'true');
    mount.replaceChildren(doll);
  }
  if(doll && typeof applyWardrobeToDoll === 'function') {
    applyWardrobeToDoll(doll, v);
  }
}

function initWorldMapElo() {
  const eloWalker = document.getElementById('worldEloWalker');
  if(!eloWalker) return;
  syncWorldMapElo();
  let currentNodeId = pget('v3EloCurrentNode');
  if(!currentNodeId || !WORLD_ROAD_NODES[currentNodeId]) {
    currentNodeId = 'U_center';
    pset('v3EloCurrentNode', currentNodeId);
  }
  const pos = WORLD_ROAD_NODES[currentNodeId];
  if(pos) {
    eloWalker.style.transition = 'none';
    eloWalker.style.left = pos.x + '%';
    eloWalker.style.top = pos.y + '%';
  }
}

function walkEloAlongRoad(targetPlace, onArrival) {
  const eloWalker = document.getElementById('worldEloWalker');
  const speech = document.getElementById('walkerSpeechBubble');
  if(!eloWalker) {
    if(onArrival) onArrival();
    return;
  }

  const targetNodeId = BUILDING_TO_ROAD_NODE[targetPlace] || 'U_center';
  let currentNodeId = pget('v3EloCurrentNode') || 'U_center';
  if(!WORLD_ROAD_NODES[currentNodeId]) currentNodeId = 'U_center';

  // Se já está na mesma casa/nó da estrada
  if(currentNodeId === targetNodeId) {
    eloWalker.classList.remove('isWalking');
    eloWalker.classList.add('hasArrived');
    if(speech) speech.textContent = 'Já estamos aqui! 💗';
    if(typeof playCuteSfx === 'function') playCuteSfx('coin');
    setTimeout(() => {
      eloWalker.classList.remove('hasArrived');
      if(onArrival) onArrival();
    }, 280);
    return;
  }

  // Cancela caminhada anterior se houver
  clearEloWalkAnimation();
  isEloWalkingOnRoad = true;

  const pathNodeIds = findShortestRoadPath(currentNodeId, targetNodeId);
  eloWalker.classList.add('isWalking');
  eloWalker.classList.remove('hasArrived');
  if(speech) speech.textContent = 'Passeando pela estrada... 🎶';

  const waypoints = pathNodeIds.map(id => ({ id, ...WORLD_ROAD_NODES[id] }));
  let stepIdx = 1;

  function runNextStep() {
    if(stepIdx >= waypoints.length) {
      // Chegou no destino!
      pset('v3EloCurrentNode', targetNodeId);
      isEloWalkingOnRoad = false;
      eloWalker.classList.remove('isWalking');
      eloWalker.classList.add('hasArrived');
      if(speech) speech.textContent = 'Chegamos! ✨';
      if(typeof playCuteSfx === 'function') playCuteSfx('win');
      if(typeof triggerStarConfetti === 'function') triggerStarConfetti();

      const finishTimer = setTimeout(() => {
        eloWalker.classList.remove('hasArrived');
        if(speech) speech.textContent = 'Onde vamos parar? 💗';
        if(onArrival) onArrival();
      }, 300);
      eloWalkTimeoutChain.push(finishTimer);
      return;
    }

    const prevPt = waypoints[stepIdx - 1];
    const nextPt = waypoints[stepIdx];

    // Orientação do olhar/caminhada (virar para a esquerda ou direita)
    const dx = nextPt.x - prevPt.x;
    if(dx > 0.5) {
      eloWalker.classList.remove('facingLeft');
      eloWalker.classList.add('facingRight');
    } else if(dx < -0.5) {
      eloWalker.classList.remove('facingRight');
      eloWalker.classList.add('facingLeft');
    }

    const dist = Math.hypot(nextPt.x - prevPt.x, nextPt.y - prevPt.y);
    const stepDuration = Math.max(220, Math.min(360, Math.round(dist * 18)));

    eloWalker.style.transition = 'left ' + stepDuration + 'ms linear, top ' + stepDuration + 'ms linear';
    eloWalker.style.left = nextPt.x + '%';
    eloWalker.style.top = nextPt.y + '%';

    if(typeof playCuteSfx === 'function') {
      playCuteSfx('pop');
    }

    stepIdx++;
    const stepTimer = setTimeout(runNextStep, stepDuration);
    eloWalkTimeoutChain.push(stepTimer);
  }

  runNextStep();
}

window.openWorldPlace=function(place){
  const map={
    room:['roomPanel','home','Vamos para o meu Quarto 3D! Você pode decorar tudo e trocar meus looks!'],
    wardrobe:['wardrobePanel','home','Vamos para o Guarda-roupa escolher um look bem lindo!'],
    pet:['petPanel','home','Vamos visitar e cuidar do meu Bichinho Virtual fofinho!'],
    studio3d:['modelStudio',null,'Bem-vinda ao Estúdio 3D! Vamos girar modelos e voar com a Unicórnia!'],
    school:['learnPanel','learn','Hora de aprender e tocar piano na Escolinha Mágica!'],
    creative:['createPanel','create','Vamos pintar, desenhar e inventar receitas no Ateliê!'],
    play:['playPanel','play','Bem-vinda à Ilha dos Jogos! Escolha seu minijogo favorito!'],
    rpg:['rpg',null,'O portal do Reino das Estrelas está aberto! Vamos para a aventura!'],
    cinema:['watchPanel','watch','Pegue a pipoca! O Cinema e os episódios da Elo vão começar!'],
    family:['familyPanel','home','Festa da Família! Vamos jogar mímica e duelos juntos!'],
    library:['storiesPanel','stories','Na biblioteca, cada livrinho é uma linda aventura!'],
    club:['clubPanel','club','Bem-vinda ao Clubinho especial da Elo!']
  };
  const a = map[place];
  if(!a) return;
  pset('v3LastPlace', place);
  if(typeof renderHomeContinue === 'function') renderHomeContinue();
  if(typeof eloGuideSay === 'function') eloGuideSay(a[2]);
  if(place === 'library') {
    document.body.classList.add('reading-portrait-allowed');
    try {
      if(screen.orientation && typeof screen.orientation.unlock === 'function') {
        screen.orientation.unlock();
      }
    } catch(_) {}
  }

  walkEloAlongRoad(place, () => {
    if(a[0] === 'rpg') {
      openRpg();
    } else if(a[0] === 'modelStudio' || place === 'studio3d') {
      if(typeof openModelStudio === 'function') openModelStudio();
    } else if(place === 'pet') {
      if(typeof openPet === 'function') openPet();
      else openPanel('petPanel', 'home');
    } else {
      openPanel(a[0], a[1]);
    }
  });
};
window.findWorldSecret=function(id){const typeMap={star:'stars',unicorn:'unicorns',bow:'bows'},v=v3Load();if(v.secrets.includes(id))return toast('Você já encontrou este segredo 💗');v.secrets.push(id);v3Save(v);addCollectible(typeMap[id],1,`Segredo encontrado! ${V3_COLLECTIONS[typeMap[id]].icon}`);addStars(1,'Você encontrou um segredo! +1 ⭐')};

function renderCollection(){const root=document.getElementById('collectionGrid');if(!root)return;const v=v3Load();root.innerHTML=Object.entries(V3_COLLECTIONS).map(([id,c])=>{const n=Number(v.collections[id]||0),pct=Math.round(n/c.goal*100);return `<div class="collectionCard"><span>${c.icon}</span><b>${c.name}</b><small>${n}/${c.goal}</small><div class="collectionMeter"><i style="width:${pct}%"></i></div></div>`}).join('')}
window.renderCollection=renderCollection;

let roomDecorCategory='wall';
function roomUnlocked(item){return true}
window.selectRoomCategory=function(kind){roomDecorCategory=kind;renderRoom()};
function getRoomPetDataSafe(){
  if(typeof window.loadPet === 'function') return window.loadPet();
  if(typeof window.rawLoad === 'function') return window.rawLoad();
  if(typeof loadPet === 'function') return loadPet();
  if(typeof rawLoad === 'function') return rawLoad();
  try{
    const raw = (typeof pget === 'function') ? pget('eloVirtualPetV1') : localStorage.getItem('eloProfile:elo:eloVirtualPetV1');
    if(raw) return JSON.parse(raw);
  }catch(_){}
  return { stage:'egg', name:'Ovinho misterioso', eggCare:0 };
}

function syncRoomPet(){
  const mount = document.getElementById('roomPetMount');
  const bubble = document.querySelector('.roomPetBubble');
  if(!mount) return;
  const p = getRoomPetDataSafe();
  if(!p) return;
  if(bubble) {
    bubble.textContent = p.stage === 'egg' ? '🥚 Cuidar' : `🐾 ${p.name || 'Bichinho'}`;
  }
  if(p.stage === 'egg'){
    mount.innerHTML = '<div class="petEgg roomPetEgg" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(0.65);cursor:pointer;"><span></span></div>';
  } else {
    const species = p.species || 'unicorn';
    const acc = p.accessory === 'bow' ? '🎀' : p.accessory === 'star' ? '⭐' : p.accessory === 'crown' ? '👑' : '';
    mount.innerHTML = `<div class="petCreature species-${species} stage-${p.stage || 'baby'} roomPetCreature" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(0.55);cursor:pointer;">
      <span class="petEar earL"></span><span class="petEar earR"></span><span class="petHorn"></span><span class="petTail"></span>
      <span class="petBody"></span><span class="petHead"><i class="petEye e1"></i><i class="petEye e2"></i><i class="petMouth"></i><i class="petCheek c1"></i><i class="petCheek c2"></i></span>
      <span class="petAccessory" style="top:2px;left:50%;font-size:24px;">${acc}</span>
    </div>`;
  }
}
window.syncRoomPet = syncRoomPet;

function syncRoomElo(v){
 const mount=document.getElementById('roomEloMount'),source=document.getElementById('wardrobeElo');
 if(!mount||!source)return;
 let doll=mount.querySelector('.roomEloClone');
 if(!doll){
   doll=source.cloneNode(true);
   doll.removeAttribute('id');
   doll.classList.add('roomEloClone');
   doll.setAttribute('aria-hidden','true');
   mount.replaceChildren(doll);
 }
 applyWardrobeToDoll(doll,v);
}

window.roomInteract=function(kind){
 const room=document.getElementById('eloRoom');if(!room)return;
 const pulse=(selector,cls)=>{const el=room.querySelector(selector);if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),900)};
 if(kind==='window'){
   const night=room.classList.toggle('room-night');eloGuideSay(night?'Olha! Ficou de noite. As estrelas apareceram na minha janela!':'Bom dia! O sol voltou para o meu quarto.');
 }else if(kind==='bed'){pulse('.roomBed','roomBedPlay');eloGuideSay('Minha cama é bem confortável. Hora de descansar um pouquinho!');
 }else if(kind==='toy'){pulse('.roomToy','roomToyPlay');eloGuideSay('Vamos brincar! Eu adoro meus brinquedos.');
 }else if(kind==='art'){pulse('.roomWallArt','roomArtPlay');eloGuideSay('Eu gosto muito desse quadro. Ele deixa meu quarto mais alegre!');
 }else if(kind==='shelf'){pulse('.roomShelf','roomShelfPlay');eloGuideSay('Aqui eu guardo meus livrinhos e coisas especiais.');
 }else if(kind==='wardrobe'){eloGuideSay('Vamos escolher meu look!');setTimeout(()=>openPanel('wardrobePanel','home'),220)}
};
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.classList?.contains('roomInteractive')){e.preventDefault();e.target.click()}});
function renderRoom(){
 const room=document.getElementById('eloRoom'),grid=document.getElementById('roomDecorGrid');if(!room||!grid)return;
 const v=v3Load();v.room=v.room||{};v.room.wall=v.room.wall||'wallPink';v.room.art=v.room.art||'rainbow';v.room.bed=v.room.bed||'bedPink';v.room.rug=v.room.rug||'rugHeart';v.room.toy=v.room.toy||'unicorn';
 const wallClasses=ROOM_DECOR.filter(x=>x.kind==='wall').map(x=>x.className).filter(Boolean);room.classList.remove(...wallClasses);const wall=ROOM_DECOR.find(x=>x.id===v.room.wall);if(wall?.className)room.classList.add(wall.className);
 const art=ROOM_DECOR.find(x=>x.id===v.room.art),toy=ROOM_DECOR.find(x=>x.id===v.room.toy),bed=ROOM_DECOR.find(x=>x.id===v.room.bed),rug=ROOM_DECOR.find(x=>x.id===v.room.rug);
 const artEl=room.querySelector('.roomWallArt'),toyEl=room.querySelector('.roomToy'),bedEl=room.querySelector('.roomBed'),rugEl=room.querySelector('.roomRug');
 const artMap={rainbow:'art-rainbow',butterflies:'art-butterflies',flowers:'art-flowers',stars:'art-stars',castle:'art-castle',clouds:'art-clouds',heart:'art-heart',artUnicorn:'art-unicorn',artFriends:'art-friends',artSpace:'art-space',artDragon:'art-dragon'};
 if(artEl)artEl.className=`roomWallArt roomInteractive ${!art||art.id==='noneArt'?'hidden':''} ${artMap[art?.id]||'art-rainbow'}`.trim();
 if(toyEl){const shape=toy?.shape||'unicorn';toyEl.className=`roomToy roomInteractive ${shape==='none'?'hidden':''} toy-${shape}`.trim();toyEl.textContent='';}
 if(bedEl){const bedClass={bedPink:'bed-pink',bedBlue:'bed-blue',bedLilac:'bed-lilac',bedStar:'bed-star',bedMint:'bed-mint',bedPeach:'bed-peach',bedCloud:'bed-cloud',bedCastle:'bed-castle',bedRainbow:'bed-rainbow',bedRocket:'bed-rocket'}[bed?.id]||'bed-pink';bedEl.className=`roomBed roomInteractive ${bedClass}`;}
 if(rugEl){const rugClass={rugHeart:'rug-heart',rugRainbow:'rug-rainbow',rugCloud:'rug-cloud',rugFlower:'rug-flower',rugStar:'rug-star',rugComet:'rug-comet',rugPaw:'rug-paw',rugButterfly:'rug-butterfly',rugWatermelon:'rug-watermelon'}[rug?.id]||'rug-heart';rugEl.className=`roomRug ${!rug||rug.id==='noneRug'?'hidden':''} ${rugClass}`.trim();}
 syncRoomElo(v);syncWorldMapElo(v);syncRoomPet();
 const tabs=document.getElementById('roomDecorTabs');if(tabs){const kinds=[['wall','🎨','Parede'],['art','🖼️','Quadros'],['bed','🛏️','Camas'],['rug','🧶','Tapetes'],['toy','🧸','Brinquedos']];tabs.innerHTML=kinds.map(([id,ic,name])=>`<button class="roomDecorTab ${roomDecorCategory===id?'on':''}" onclick="selectRoomCategory('${id}')"><span>${ic}</span>${name}</button>`).join('')}grid.innerHTML=ROOM_DECOR.filter(it=>it.kind===roomDecorCategory).map(it=>{const on=v.room[it.kind]===it.id,unlock=roomUnlocked(it);return `<button class="decorItem ${on?'on':''} ${unlock?'':'locked'}" onclick="selectRoomDecor('${it.id}')">${unlock?roomDecorThumb(it):'<span>🔒</span>'}<b>${it.name}</b><small>${unlock?(on?'Usando':'Usar'):`${it.need} ⭐`}</small></button>`}).join('');
}window.renderRoom=renderRoom;
window.selectRoomDecor=function(id){const it=ROOM_DECOR.find(x=>x.id===id);if(!it)return;if(!roomUnlocked(it))return toast(`Este item libera com ${it.need} estrelas ⭐`);const v=v3Load();v.room[it.kind]=it.id;v3Save(v);renderRoom();if(typeof playCuteSfx==='function')playCuteSfx('pop');toast(it.name+' colocado no quarto! ✨');if(typeof speakText==='function'&&getActiveProfile().ageRange==='3-5')speakText(it.name)};

function wardrobeItem(id){return WARDROBE_ITEMS.find(x=>x.id===id)}
function roomDecorThumb(it){
 if(!it) return '';
 if(it.id==='noneArt'||it.id==='noneRug'||it.id==='noneToy') return '<span class="decorThumbNone">🚫</span>';
 if(it.kind==='wall') return `<span class="roomWallThumb thumb-${it.id}"><i>${it.icon}</i></span>`;
 if(it.kind==='art'){
   const artCls={rainbow:'art-rainbow',butterflies:'art-butterflies',flowers:'art-flowers',stars:'art-stars',castle:'art-castle',clouds:'art-clouds',heart:'art-heart',artUnicorn:'art-unicorn',artFriends:'art-friends',artSpace:'art-space',artDragon:'art-dragon'}[it.id]||'art-rainbow';
   return `<span class="roomArtThumb ${artCls}"></span>`;
 }
 if(it.kind==='bed'){
   const bedCls={bedPink:'bed-pink',bedBlue:'bed-blue',bedLilac:'bed-lilac',bedStar:'bed-star',bedMint:'bed-mint',bedPeach:'bed-peach',bedCloud:'bed-cloud',bedCastle:'bed-castle',bedRainbow:'bed-rainbow',bedRocket:'bed-rocket'}[it.id]||'bed-pink';
   return `<span class="roomBedThumb ${bedCls}"><i class="tHead"></i><i class="tBlanket"></i><i class="tPillow"></i></span>`;
 }
 if(it.kind==='rug'){
   const rugCls={rugHeart:'rug-heart',rugRainbow:'rug-rainbow',rugCloud:'rug-cloud',rugFlower:'rug-flower',rugStar:'rug-star',rugComet:'rug-comet',rugPaw:'rug-paw',rugButterfly:'rug-butterfly',rugWatermelon:'rug-watermelon'}[it.id]||'rug-heart';
   return `<span class="roomRugThumb ${rugCls}"></span>`;
 }
 const shape=it.shape||'none';
 if(shape==='none') return '<span class="decorThumbNone">🚫</span>';
 return `<span class="roomToyThumb toy-${shape}" aria-hidden="true"></span>`;
}
function wardrobeDefaults(){return defaultV3().wardrobe}
function normalizeWardrobe(v){v.wardrobe=Object.assign({},wardrobeDefaults(),v.wardrobe||{});return v.wardrobe}
function applyWardrobeToDoll(doll,v){if(!doll)return;const w=normalizeWardrobe(v);const all=WARDROBE_ITEMS.map(x=>x.cls).filter(Boolean);doll.classList.remove(...all);for(const id of Object.values(w)){const it=wardrobeItem(id);if(it?.cls)doll.classList.add(it.cls)};if(w.dress&&w.dress!=='noneDress')doll.classList.add('wearing-dress');else doll.classList.remove('wearing-dress')}
function garmentThumb(it){
 if(!it||it.thumb==='none')return '<span class="garmentThumb none"><i></i></span>';
 if(it.cat==='skin')return `<span class="garmentThumb skinThumb" style="background:${it.color||'#f1b884'};border-radius:50%;width:34px;height:34px;display:inline-block;box-shadow:0 3px 8px rgba(0,0,0,.15);border:2px solid #fff"></span>`;
 if(it.cat==='eyes')return `<span class="garmentThumb eyeThumb" style="background:#fff;border-radius:50%;width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,.15);border:2px solid #e0dbed"><i style="width:16px;height:16px;border-radius:50%;background:${it.color||'#503222'};display:block"></i></span>`;
 const parts=it.thumb.split(' '),shape=parts[0],tone=parts.slice(1).join('-');
 return `<span class="garmentThumb ${shape} ${tone}"><i></i><b></b></span>`;
}
function renderWardrobePresets(){const box=document.getElementById('wardrobePresets');if(!box)return;box.innerHTML=WARDROBE_PRESETS.map(p=>`<button class="lookPreset " onclick="applyWardrobePreset('${p.id}')"><span>${p.icon}</span><b>${p.name}</b><small>'Vestir'</small></button>`).join('')}
window.applyWardrobePreset=function(id){const p=WARDROBE_PRESETS.find(x=>x.id===id);if(!p)return;const v=v3Load();v.wardrobe=Object.assign({},normalizeWardrobe(v),p.set);v3Save(v);renderWardrobe();initWorldMapElo();toast(`${p.name} escolhido! ✨`)};
window.selectWardrobeCategory=function(cat){if(!WARDROBE_CATEGORIES.some(x=>x.id===cat))return;wardrobeCategory=cat;renderWardrobe()};
function renderWardrobe(){const grid=document.getElementById('wardrobeGrid'),tabs=document.getElementById('wardrobeTabs');if(!grid||!tabs)return;const v=v3Load(),w=normalizeWardrobe(v);const doll=document.getElementById('wardrobeElo'),n=document.getElementById('wardrobeName');applyWardrobeToDoll(doll,v);syncRoomElo(v);syncWorldMapElo(v);syncRoomPet();if(n){const top=wardrobeItem(w.top)?.name||'',bottom=wardrobeItem(w.bottom)?.name||'',dress=w.dress&&w.dress!=='noneDress'?wardrobeItem(w.dress)?.name:'';n.textContent=dress||[top,bottom].filter(Boolean).join(' + ')||'Look da Elo'}tabs.innerHTML=WARDROBE_CATEGORIES.map(c=>`<button class="wardrobeTab ${wardrobeCategory===c.id?'on':''}" onclick="selectWardrobeCategory('${c.id}')"><span>${c.icon}</span>${c.name}</button>`).join('');grid.innerHTML=WARDROBE_ITEMS.filter(it=>it.cat===wardrobeCategory).map(it=>{const unlocked=true,on=w[it.cat]===it.id;return `<button class="wardrobeItem wardrobeItem302 ${on?'on':''} ${unlocked?'':'locked'}" onclick="equipWardrobeItem('${it.id}')">${unlocked?garmentThumb(it):'<span class="garmentLock">🔒</span>'}<b>${it.name}</b><small>${unlocked?(on?'Usando':'Usar'):`${it.need} ⭐`}</small></button>`}).join('');renderWardrobePresets()}
window.renderWardrobe=renderWardrobe;
window.equipWardrobeItem=function(id){const it=wardrobeItem(id);if(!it)return;const v=v3Load(),w=normalizeWardrobe(v);w[it.cat]=it.id;if(it.cat==='dress'&&id!=='noneDress'){}else if((it.cat==='top'||it.cat==='bottom')&&w.dress!=='noneDress')w.dress='noneDress';v3Save(v);renderWardrobe();initWorldMapElo();
 const doll=document.getElementById('wardrobeElo');
 if(doll){doll.classList.remove('dollCelebration');void doll.offsetWidth;doll.classList.add('dollCelebration');}
 toast(`${it.name} escolhido! ✨`)};
window.resetV3Wardrobe=function(){const v=v3Load();v.wardrobe=wardrobeDefaults();v3Save(v);renderWardrobe();initWorldMapElo();toast('Look original restaurado 💗')};
// Compatibilidade com botões/estado antigos
window.equipV3Outfit=function(){openPanel('wardrobePanel','home')};

const CREATIVE={pizza:{title:'Monte sua pizza',main:'🍕',choices:['🍅','🧀','🌽','🫒','🍄','🥦']},cake:{title:'Decore o bolo',main:'🎂',choices:['🍓','⭐','🌈','💗','🍒','🍫']},toy:{title:'Monte um brinquedo maluco',main:'🤖',choices:['⚙️','🛞','🚀','🎀','⭐','🧲']},pet:{title:'Cuide do bichinho',main:'🐶',choices:['🥣','🦴','🫧','🎾','💗','🎀']}};
let creativeType='pizza',creativeItems=[];
window.selectCreative=function(type){if(!CREATIVE[type])return;creativeType=type;creativeItems=[];renderCreative()};
function renderCreative(){const root=document.getElementById('creativeWorkspace');if(!root)return;const c=CREATIVE[creativeType];root.innerHTML=`<h3 style="text-align:center;margin:2px 0 10px">${c.title}</h3><div class="creativeCanvas"><div class="creativeMain">${c.main}</div>${creativeItems.map((x,i)=>`<span class="creativeAdded" style="left:${15+(i*17)%70}%;top:${18+(i*23)%62}%">${x}</span>`).join('')}</div><div class="creativeChoices">${c.choices.map(x=>`<button onclick="addCreativeItem('${x}')">${x}</button>`).join('')}</div><div class="creativeDone"><button class="btn" onclick="finishCreative()">Terminei ✨</button> <button class="btn secondary" onclick="selectCreative('${creativeType}')">Limpar</button></div>`}
window.renderCreative=renderCreative;
window.addCreativeItem=function(x){if(creativeItems.length>=8)return toast('Já ficou cheio de detalhes! ✨');creativeItems.push(x);renderCreative()};
window.finishCreative=function(){if(creativeItems.length<2)return toast('Coloque pelo menos dois detalhes 😊');const v=v3Load(),first=!v.creativeDone.includes(creativeType);if(first)v.creativeDone.push(creativeType);v3Save(v);if(first){addCollectible('stickers',1,'Novo adesivo para a coleção! ✨');addStars(1,'Criação concluída! +1 ⭐')}else toast('Ficou lindo! 💗')};

const FAMILY={
 guess:['Imite um animal sem falar. A outra pessoa tenta adivinhar!','Pense em uma fruta e dê três pistas.','Faça um som de um objeto da casa. Quem adivinha?','Descreva uma cor sem dizer o nome dela.'],
 coop:['Encontrem juntos 3 coisas redondas perto de vocês.','Façam uma torre com 5 objetos seguros.','Inventem juntos um cumprimento engraçado.','Escolham uma música e façam uma dança de 20 segundos.'],
 draw:['Uma pessoa desenha uma cabeça e passa para a outra completar o corpo.','Um escolhe um animal e o outro acrescenta um cenário.','Façam juntos um desenho usando apenas círculos e linhas.','Cada pessoa acrescenta 3 detalhes ao mesmo desenho.']
};
const MIME_CATEGORIES={
 mix:{name:'Misturado',icon:'🎭'},animals:{name:'Animais',icon:'🐾'},actions:{name:'Ações',icon:'🏃'},jobs:{name:'Profissões',icon:'🧑‍🚒'},objects:{name:'Objetos',icon:'🧸'},food:{name:'Comidas',icon:'🍕'},sports:{name:'Esportes',icon:'⚽'},characters:{name:'Personagens',icon:'🦄'}
};
const MIME_PROMPTS=[
 ['animals','Elefante'],['animals','Gato'],['animals','Macaco'],['animals','Pinguim'],['animals','Cachorro'],['animals','Coelho'],
 ['actions','Escovar os dentes'],['actions','Tomar banho'],['actions','Dormir'],['actions','Dançar'],['actions','Cozinhar'],['actions','Andar de bicicleta'],
 ['jobs','Bombeiro'],['jobs','Professor'],['jobs','Médico'],['jobs','Cozinheiro'],['jobs','Fotógrafo'],['jobs','Cantor'],
 ['objects','Avião'],['objects','Guarda-chuva'],['objects','Relógio'],['objects','Telefone'],['objects','Vassoura'],['objects','Violão'],
 ['food','Pizza'],['food','Sorvete'],['food','Banana'],['food','Macarrão'],['food','Bolo'],['food','Pipoca'],
 ['sports','Futebol'],['sports','Natação'],['sports','Basquete'],['sports','Vôlei'],['sports','Corrida'],['sports','Ginástica'],
 ['characters','Princesa'],['characters','Unicórnio'],['characters','Robô'],['characters','Super-herói'],['characters','Pirata'],['characters','Mago']
];
let familyType='',familyTurn=1,mimeCategory='mix',mimeRevealed=false;
window.startFamilyGame=function(type){familyType=type;familyTurn=1;mimeRevealed=false;renderFamilyPrompt()};
window.setMimeCategory=function(cat){if(!MIME_CATEGORIES[cat])return;mimeCategory=cat;mimeRevealed=false;renderFamilyPrompt()};
function randomMime(){const pool=MIME_PROMPTS.filter(x=>mimeCategory==='mix'||x[0]===mimeCategory);return pool[Math.floor(Math.random()*pool.length)]||MIME_PROMPTS[0]}
window.revealMimePrompt=function(){mimeRevealed=true;renderFamilyPrompt(true)};
function renderFamilyPrompt(keep=false){const box=document.getElementById('familyGameBox');if(!box)return;if(familyType==='mime'){let saved=box.dataset.mimePrompt;if(!keep||!saved){const p=randomMime();saved=p[1];box.dataset.mimePrompt=saved}const cats=Object.entries(MIME_CATEGORIES).map(([id,c])=>`<button class="mimeCat ${mimeCategory===id?'on':''}" onclick="setMimeCategory('${id}')"><span>${c.icon}</span>${c.name}</button>`).join('');box.innerHTML=`<div class="mimeHeader"><span class="familyTurn">VEZ ${familyTurn}</span><b>🎭 Mímica</b></div><div class="mimeCats">${cats}</div>${mimeRevealed?`<div class="mimePrompt"><small>SEM FALAR, FAÇA:</small><strong>${saved}</strong><span>Agora esconda a tela de quem vai adivinhar 😉</span></div><div class="mimeActions"><button class="btn" onclick="nextFamilyPrompt()">Conseguiu! ⭐</button><button class="btn secondary" onclick="newMimePrompt()">Outra mímica</button></div>`:`<div class="mimeHidden"><span>🙈</span><b>Só quem vai fazer a mímica olha agora.</b><button class="btn" onclick="revealMimePrompt()">Mostrar mímica</button></div>`}`;return}if(!FAMILY[familyType]){box.innerHTML='<p class="muted">Escolha uma brincadeira acima.</p>';return}const arr=FAMILY[familyType],prompt=arr[Math.floor(Math.random()*arr.length)];box.innerHTML=`<span class="familyTurn">${familyType==='coop'?'JUNTOS':`VEZ ${familyTurn}`}</span><div class="familyPrompt">${prompt}</div><button class="btn" onclick="nextFamilyPrompt()">Conseguimos! ⭐</button>`}
window.newMimePrompt=function(){mimeRevealed=false;const box=document.getElementById('familyGameBox');if(box)box.dataset.mimePrompt='';renderFamilyPrompt()};
window.nextFamilyPrompt=function(){const v=v3Load();v.familyRounds=Number(v.familyRounds||0)+1;v3Save(v);familyTurn=familyTurn===1?2:1;if(v.familyRounds===3){addCollectible('rainbows',1,'Família unida! Novo arco-íris 🌈');addStars(1,'Brincadeira em família! +1 ⭐')}mimeRevealed=false;const box=document.getElementById('familyGameBox');if(box)box.dataset.mimePrompt='';renderFamilyPrompt()};

const INTERACTIVE=[
 {id:'forest',icon:'🌳🦄',title:'O Caminho do Unicórnio',start:'Elo encontra duas trilhas perto da floresta. Qual caminho ela escolhe?',choices:[['🌸 Trilha das flores','flowers'],['🌙 Trilha brilhante','moon']],nodes:{flowers:{text:'As flores começam a mexer. Elo encontra um passarinho que precisa de ajuda.',choices:[['🐦 Ajudar o passarinho','kind'],['🔎 Procurar o unicórnio','search']]},moon:{text:'Pequenas estrelas iluminam o caminho até uma ponte mágica.',choices:[['🌉 Atravessar a ponte','brave'],['🎵 Chamar com uma música','song']]},kind:{end:'Elo ajuda o passarinho e ele mostra um atalho. No fim, ela encontra o unicórnio! 💗'},search:{end:'Elo segue pegadas brilhantes e encontra o unicórnio escondido entre as árvores! 🦄'},brave:{end:'Do outro lado da ponte, o unicórnio esperava por uma amiga corajosa. ✨'},song:{end:'O unicórnio reconhece a música e aparece dançando. 🎵🦄'}}},
 {id:'castle',icon:'🏰⭐',title:'O Castelo das Estrelas',start:'Uma porta do castelo está fechada. Elo encontra dois objetos. Qual usa primeiro?',choices:[['🗝️ Chave dourada','key'],['🔮 Cristal rosa','crystal']],nodes:{key:{text:'A chave abre uma sala cheia de quadros.',choices:[['🖼️ Olhar os quadros','art'],['🚪 Seguir pela porta','door']]},crystal:{text:'O cristal revela pegadas invisíveis no chão.',choices:[['👣 Seguir pegadas','steps'],['✨ Fazer o cristal brilhar','shine']]},art:{end:'Um quadro secreto se abre e revela uma estrela guardada há muitos anos! ⭐'},door:{end:'Elo encontra uma biblioteca e descobre um livro mágico sobre amizade. 📚'},steps:{end:'As pegadas levam até um jardim secreto no alto do castelo. 🌷'},shine:{end:'A luz do cristal acende todas as estrelas do castelo. 🌟'}}},
 {id:'garden',icon:'🌱🌈',title:'O Jardim Surpresa',start:'Elo encontra uma sementinha. Onde ela deve plantar?',choices:[['☀️ Perto do sol','sun'],['💧 Perto da fonte','water']],nodes:{sun:{text:'A terra está quentinha. O que Elo faz agora?',choices:[['💦 Regar','grow'],['🎶 Cantar','sing']]},water:{text:'A fonte faz a semente brilhar.',choices:[['🌱 Esperar','wait'],['🪴 Levar para um vaso','pot']]},grow:{end:'Nasce uma flor enorme com as cores do arco-íris! 🌈'},sing:{end:'A música faz brotar pequenas flores que dançam com a Elo. 🌸'},wait:{end:'Com paciência, nasce uma árvore cheia de estrelinhas. ⭐'},pot:{end:'No quarto da Elo, a plantinha cresce e vira uma amiga verde. 🪴'}}}
];
let storyState=null;
function renderInteractiveList(){const list=document.getElementById('interactiveStoryList'),play=document.getElementById('interactiveStoryPlay');if(!list||!play)return;play.classList.add('hidden');list.classList.remove('hidden');list.innerHTML=INTERACTIVE.map(s=>`<button class="interactiveStoryCard" onclick="startInteractiveStory('${s.id}')"><span>${s.icon}</span><div><b>${s.title}</b><small>Escolha o caminho e descubra finais diferentes.</small></div><i>›</i></button>`).join('')}
window.renderInteractiveList=renderInteractiveList;
window.startInteractiveStory=function(id){const story=INTERACTIVE.find(x=>x.id===id);if(!story)return;storyState={story,node:null};document.getElementById('interactiveStoryList')?.classList.add('hidden');document.getElementById('interactiveStoryPlay')?.classList.remove('hidden');renderInteractiveNode()};
function renderInteractiveNode(){const box=document.getElementById('interactiveStoryPlay');if(!box||!storyState)return;const {story,node}=storyState,content=node?story.nodes[node]:null;if(content?.end){box.innerHTML=`<div class="interactivePlayCard"><div class="interactiveScene">${story.icon}</div><h3>${story.title}</h3><p class="storyResult">${content.end}</p><button class="btn" onclick="finishInteractiveStory()">Finalizar ⭐</button></div>`;if(typeof speakText==='function'&&getActiveProfile().ageRange==='3-5')setTimeout(()=>speakText(content.end),180);return}const text=content?.text||story.start,choices=content?.choices||story.choices;box.innerHTML=`<div class="interactivePlayCard"><button class="smallBtn" onclick="renderInteractiveList()">‹ Histórias</button><div class="interactiveScene">${story.icon}</div><h3>${story.title}</h3><p class="storyResult">${text}</p><div class="interactiveChoices">${choices.map(c=>`<button onclick="chooseInteractive('${c[1]}')">${c[0]}</button>`).join('')}</div></div>`;if(typeof speakText==='function'&&getActiveProfile().ageRange==='3-5')setTimeout(()=>speakText(text),180)}
window.chooseInteractive=function(node){if(!storyState)return;storyState.node=node;renderInteractiveNode()};
window.finishInteractiveStory=function(){if(!storyState)return;const v=v3Load(),id=storyState.story.id,first=!v.interactiveDone.includes(id);if(first)v.interactiveDone.push(id);v3Save(v);if(first){addCollectible('rainbows',1,'Você ganhou um arco-íris da história! 🌈');addStars(2,'História interativa concluída! +2 ⭐')}storyState=null;renderInteractiveList()};

function weekKey(){const d=new Date(),jan1=new Date(d.getFullYear(),0,1),week=Math.ceil((((d-jan1)/86400000)+jan1.getDay()+1)/7);return `${d.getFullYear()}-W${week}`}
function ensureWeeklyOverlay(){let ov=document.getElementById('weeklyOverlay');if(ov)return ov;ov=document.createElement('div');ov.id='weeklyOverlay';ov.className='weeklyOverlay hidden';ov.innerHTML='<div class="weeklyCard"><div class="weeklyGift">🎁</div><h2>Surpresa da semana</h2><p id="weeklyText">Uma pequena surpresa para brincar e explorar.</p><button id="weeklyOpenBtn" class="btn" onclick="claimWeeklySurprise()">Abrir presente</button><button class="btn secondary" style="margin-top:8px" onclick="closeWeeklySurprise()">Fechar</button></div>';document.body.appendChild(ov);return ov}
window.openWeeklySurprise=function(){const ov=ensureWeeklyOverlay(),v=v3Load(),opened=v.weekly?.opened&&v.weekly.key===weekKey(),txt=document.getElementById('weeklyText'),btn=document.getElementById('weeklyOpenBtn');if(txt)txt.textContent=opened?'A surpresa desta semana já foi descoberta. Volte quando houver uma nova!':'Tem uma descoberta esperando por você!';if(btn){btn.disabled=opened;btn.textContent=opened?'Já aberta ✓':'Abrir presente'}ov.classList.remove('hidden')};
window.closeWeeklySurprise=function(){document.getElementById('weeklyOverlay')?.classList.add('hidden')};
window.claimWeeklySurprise=function(){const v=v3Load(),key=weekKey();if(v.weekly?.opened&&v.weekly.key===key)return;const types=['bows','unicorns','rainbows','stickers'],sum=[...key].reduce((a,c)=>a+c.charCodeAt(0),0),type=types[sum%types.length];v.weekly={key,opened:true};v3Save(v);addCollectible(type,1,`Surpresa: ${V3_COLLECTIONS[type].icon} ${V3_COLLECTIONS[type].name}!`);addStars(1,'Surpresa da semana! +1 ⭐');const txt=document.getElementById('weeklyText');if(txt)txt.textContent=`Você encontrou ${V3_COLLECTIONS[type].icon} para sua coleção!`;const btn=document.getElementById('weeklyOpenBtn');if(btn){btn.disabled=true;btn.textContent='Aberta ✓'}};

// Atividades curtas e dificuldade automática.
let v3QuizFirstTry=true,v3QuizHadMistake=false,v3KidHadMistake=false;
function adaptiveSchoolLevel(){const age=getSchoolAge(),skill=Number(pget('v3SchoolSkill')||0);if(age==='9-11')return skill>=1?'hard':'medium';return skill>=1?'medium':'easy'}
window.renderSchoolChallenges=function(){const controls=document.getElementById('schoolControls'),info=document.getElementById('schoolAgeInfo');if(!controls||!info)return;const age=getSchoolAge();info.innerHTML=`<div class="schoolAgeBadge">🎂 ${age.replace('-', '–')} anos</div>`;if(age==='3-5'){controls.innerHTML=`<p class="muted">A Elo fala. A criança olha e toca, sem precisar ler.</p><div class="kidSchoolCats">${Object.entries(SCHOOL_KID_SETS).map(([id,s])=>`<button class="chip ${schoolKidCategory===id?'on':''}" onclick="startKidSchool('${id}')" onpointerdown="speakText('${escapeHtml(s.name)}')"><span style="font-size:24px">${s.icon}</span></button>`).join('')}</div>`;startKidSchool(schoolKidCategory,true)}else{const level=adaptiveSchoolLevel();controls.innerHTML=`<p class="muted">Rodadas curtas de 5 desafios. A dificuldade muda sozinha conforme o desempenho.</p><div class="schoolAdaptivePill">✨ Dificuldade automática • ${level==='hard'?'Desafio':level==='medium'?'Intermediária':'Inicial'}</div>`;startQuiz(level)}};
window.startKidSchool=function(category='colors',silent=false){schoolKidCategory=category;schoolKidRound=0;schoolKidScore=0;schoolKidLocked=false;v3KidHadMistake=false;document.querySelectorAll('.kidSchoolCats .chip').forEach((b,i)=>b.classList.toggle('on',Object.keys(SCHOOL_KID_SETS)[i]===category));renderKidSchoolQuestion(silent)};
window.renderKidSchoolQuestion=function(silent=false){const box=document.getElementById('quiz'),set=SCHOOL_KID_SETS[schoolKidCategory];if(!box||!set)return;if(schoolKidRound>=5){const v=v3Load();v.schoolProgress=v.schoolProgress||{};v.schoolProgress[schoolKidCategory]=Math.round(schoolKidScore/5*100);v3Save(v);box.innerHTML=`<div class="kidSchoolEnd"><div>🏅⭐</div><b>Terminou!</b><button class="btn" onclick="startKidSchool('${schoolKidCategory}')">🔁</button></div>`;addStars(1,'Escolinha concluída! ⭐');trackActivity('school');return}schoolKidLocked=false;v3KidHadMistake=false;const correct=set.items[Math.floor(Math.random()*set.items.length)],others=shuffle(set.items.filter(x=>x[0]!==correct[0])).slice(0,2),opts=shuffle([correct,...others]);box.dataset.correct=correct[0];box.innerHTML=`<div class="kidSchoolActivity"><div class="kidListenPulse">👂</div><div class="kidSchoolOptions">${opts.map(o=>`<button class="kidSchoolChoice" data-value="${escapeHtml(o[0])}" onclick="answerKidSchool(this)">${kidOptionVisual(schoolKidCategory,o)}</button>`).join('')}</div><div class="kidSchoolDots">${schoolKidRound+1}/5</div></div>`;if(!silent)setTimeout(()=>speakText(`Toque em ${correct[0]}`),250)};
window.answerKidSchool=function(btn){if(schoolKidLocked)return;const box=document.getElementById('quiz'),correct=box.dataset.correct,val=btn.dataset.value;speakText(val);if(val!==correct){v3KidHadMistake=true;btn.classList.add('bad');setTimeout(()=>{btn.classList.remove('bad');speakText(`Toque em ${correct}`)},500);return}schoolKidLocked=true;if(!v3KidHadMistake)schoolKidScore++;btn.classList.add('good');setTimeout(()=>speakText(`Muito bem! ${correct}`),120);schoolKidRound++;setTimeout(()=>renderKidSchoolQuestion(false),850)};
window.startQuiz=function(level=adaptiveSchoolLevel()){quizLevel=level;quizDeck=shuffle(QUESTIONS[level]).slice(0,5);quizPos=0;quizCorrect=0;v3QuizHadMistake=false;renderQuiz()};
window.renderQuiz=function(){const box=document.getElementById('quiz');if(!box)return;if(quizPos>=quizDeck.length){const age=getSchoolAge(),ratio=quizCorrect/5;let skill=Number(pget('v3SchoolSkill')||0);if(ratio>=.8)skill=Math.min(2,skill+1);else if(ratio<=.4)skill=Math.max(0,skill-1);pset('v3SchoolSkill',skill);const reward=Math.max(1,Math.floor(quizCorrect/2));box.innerHTML=`<div class="quizEnd"><strong>${quizCorrect}/5 de primeira 🎉</strong><p class="muted">A próxima rodada será ajustada automaticamente.</p><button class="btn" onclick="renderSchoolChallenges()">Nova rodada</button></div>`;addStars(reward,`Escolinha concluída! +${reward} ⭐`);trackActivity('school');return}const q=quizDeck[quizPos];v3QuizHadMistake=false;box.innerHTML=`<div class="quizTop"><span class="quizProgress">Desafio ${quizPos+1}/5 • ${q[3]}</span><span class="quizProgress">De primeira: ${quizCorrect}</span></div><div class="quiz-q">${q[0]}</div><div class="answers">${q[1].map((x,i)=>`<button class="ans" onclick="answerQuiz(${i})">${x}</button>`).join('')}</div>`};
window.answerQuiz=function(i){const q=quizDeck[quizPos];if(i===q[2]){if(!v3QuizHadMistake)quizCorrect++;toast('Acertou! ⭐');quizPos++;setTimeout(renderQuiz,250)}else{v3QuizHadMistake=true;toast('Quase! Tente outra resposta 😊')}};

// Inglês: sessões menores + tipos adaptados ao domínio atual.
window.startEnglishPractice=function(id,review=false){englishWorldId=id;englishMode='practice';englishCorrect=0;englishPos=0;englishAnswered=false;const w=ENGLISH_WORLDS[id];let items=review?englishWeakItems(id):shuffle(w.items),limit=englishAge==='3-5'?5:6;items=items.slice(0,Math.min(limit,items.length));let types;if(englishAge==='3-5')types=['listen'];else{const avg=items.reduce((s,it)=>s+englishMastery(id,it.id),0)/Math.max(1,items.length);if(englishAge==='6-8')types=avg<1?['listen','choose']:avg<2?['choose','listen','write']:['write','scramble','listen'];else types=avg<1?['listen','choose','write']:avg<2?['write','scramble','sentence']:['sentence','translate','write','scramble']}englishSession=items.map((it,i)=>({item:it,type:types[i%types.length]}));englishSession=shuffle(englishSession);renderEnglishActivity()};

function renderParentV3(){const root=document.getElementById('v3ParentProgress');if(!root)return;const v=v3Load(),sp=v.schoolProgress||{},age=getActiveProfile().ageRange||'6-8';let mastered=0;try{mastered=ENGLISH_WORLD_ORDER.reduce((sum,id)=>sum+ENGLISH_WORLDS[id].items.filter(it=>englishMastery(id,it.id,age)>=3).length,0)}catch(_){}root.innerHTML=`<div class="v3ParentMiniGrid"><span><b>${sp.colors||0}%</b>Cores</span><span><b>${sp.numbers||0}%</b>Números</span><span><b>${mastered}</b>Palavras dominadas</span><span><b>${v3Total(v)}</b>Colecionáveis</span></div><p style="margin:9px 0 0"><b>Universo v3:</b> ${v.creativeDone.length}/4 criações • ${v.interactiveDone.length}/${INTERACTIVE.length} histórias interativas • ${v.familyRounds||0} rodadas em família.</p>`}

// Hook seguro de navegação sem alterar o RPG restaurado.
const oldOpenPanel=window.openPanel;
window.openPanel=function(id,nav,fromHistory=false){oldOpenPanel(id,nav,fromHistory);if(id==='collectionPanel')renderCollection();if(id==='roomPanel')renderRoom();if(id==='wardrobePanel')renderWardrobe();initWorldMapElo();if(id==='creativePanel')renderCreative();if(id==='familyPanel'&&!familyType){const fg=document.getElementById('familyGameBox');if(fg)fg.innerHTML='<p class="muted">Escolha uma brincadeira acima.</p>'}if(id==='interactiveStoriesPanel')renderInteractiveList();if(id==='parentsPanel')renderParentV3();};

// Coleções por marcos reais, sem recompensas a cada clique.
const oldAddStars=window.addStars;
window.addStars=function(n=1,msg){const before=stars;oldAddStars(n,msg);const after=stars;const milestones=[[10,'bows'],[25,'rainbows'],[45,'unicorns'],[70,'stickers']];for(const [m,t] of milestones){if(before<m&&after>=m)addCollectible(t,1,`Nova descoberta na coleção! ${V3_COLLECTIONS[t].icon}`)}renderV3Counters();renderWardrobe();initWorldMapElo();renderRoom()};

// Amplia o painel dos pais já existente sem regressão.
const oldRenderParentV2=window.renderParentV2;
window.renderParentV2=function(){oldRenderParentV2();renderParentV3()};

function initV3(){renderV3Counters();renderCollection();renderRoom();renderWardrobe();initWorldMapElo();renderCreative();renderInteractiveList();ensureWeeklyOverlay();document.querySelectorAll('[data-app-version]').forEach(el=>el.textContent=APP_VERSION);renderHomeContinue();if(!pget('tutorial-v304'))setTimeout(()=>showTutorialOnce('v304','A casa da Elo ficou mais organizada! ✨',['O menu inicial voltou a ficar mais direto, com botões grandes para entrar em cada área.','O quarto ganhou ainda mais opções de decoração, com novas paredes, quadros, camas, tapetes e brinquedos.','O guarda-roupa também recebeu várias peças novas: cabelos, roupas, acessórios e maquiagem.','Os brinquedos do quarto ficaram desenhados em estilo próprio, sem depender de emoji.']),950)}
window.addEventListener('DOMContentLoaded',initV3);
})();


// ==========================================================
// LOJA DAS ESTRELAS & MONETIZAÇÃO ÉTICA
// ==========================================================

// Horário oficial de Brasília (UTC-3)
function getBrasiliaDateStr() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brasiliaTime = new Date(utc - (3 * 3600000));
  const year = brasiliaTime.getFullYear();
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
window.getBrasiliaDateStr = getBrasiliaDateStr;

window.openStarShop = function(){
 const m = document.getElementById('starShopModal');
 if(!m) return;
 m.classList.remove('hidden');
 document.body.style.overflow = 'hidden';
 renderStarShop();
};

window.closeStarShop = function(){
 const m = document.getElementById('starShopModal');
 if(m) m.classList.add('hidden');
 document.body.style.overflow = '';
};

function renderStarShop(){
 const todayKey = 'eloStarDaily_' + getBrasiliaDateStr();
 const claimed = pget(todayKey) === '1';
 const dailyBtn = document.getElementById('claimDailyBonusBtn');
 if(dailyBtn){
   dailyBtn.disabled = claimed;
   dailyBtn.textContent = claimed ? 'Coletado hoje ✓ (Volta às 00h)' : 'Resgatar +10 ⭐';
   dailyBtn.style.opacity = claimed ? '0.6' : '1';
 }
 const videoKey = 'eloRewardVideoDate_' + getBrasiliaDateStr();
 const videoWatched = pget(videoKey) === '1';
 const videoBtn = document.getElementById('watchRewardVideoBtn');
 if(videoBtn){
   videoBtn.disabled = videoWatched;
   videoBtn.textContent = videoWatched ? 'Assistido hoje ✓ (Volta às 00h)' : 'Assistir Vídeo (+10 ⭐)';
   videoBtn.style.opacity = videoWatched ? '0.6' : '1';
 }
 const countEl = document.getElementById('shopStarBalance');
 if(countEl) countEl.textContent = typeof stars !== 'undefined' ? stars : '0';
}

window.claimDailyBonus = function(){
 const todayKey = 'eloStarDaily_' + getBrasiliaDateStr();
 if(pget(todayKey) === '1') return toast('Você já pegou suas estrelas de hoje! O baú abre novamente amanhã às 00h (horário de Brasília) 💗');
 pset(todayKey, '1');
 if(typeof addStars === 'function') addStars(10, 'Oba! +10 estrelas da visita diária! ⭐');
 renderStarShop();
};

let rewardVideoPlayer = null;
let rewardVideoInterval = null;
let rewardVideoSecondsWatched = 0;
let rewardVideoDuration = 0;
let rewardVideoFinished = false;

window.watchRewardedAd = function(){
 const todayKey = 'eloRewardVideoDate_' + getBrasiliaDateStr();
 if(pget(todayKey) === '1') return toast('Você já assistiu ao vídeo premiado de hoje! Ele volta amanhã às 00h (horário de Brasília) 💗');
 
 const overlay = document.getElementById('rewardVideoOverlay');
 if(!overlay) return;
 overlay.classList.remove('hidden');
 rewardVideoFinished = false;
 rewardVideoSecondsWatched = 0;
 
 const host = document.getElementById('rewardVideoHost');
 const statusEl = document.getElementById('rewardVideoStatus');
 if(statusEl) statusEl.textContent = 'Carregando vídeo oficial da Elo... 🎬';
 
 if(host) {
   // Embed the latest video or channel playlist with YouTube Iframe API
   host.innerHTML = '<iframe id="rewardVideoIframe" style="width:100%;height:100%;border:0;" src="https://www.youtube-nocookie.com/embed/videoseries?list=UUBPBaYweoBPjr8XlfOz1dwQ&autoplay=1&enablejsapi=1&rel=0&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
 }
 
 if(rewardVideoInterval) clearInterval(rewardVideoInterval);
 
 // Track elapsed watch time
 rewardVideoInterval = setInterval(() => {
   rewardVideoSecondsWatched++;
   if(statusEl && !rewardVideoFinished) {
     statusEl.textContent = `▶ Assistindo vídeo oficial da Elo (${rewardVideoSecondsWatched}s)... Não feche antes de acabar! ⭐`;
   }
   // O vídeo premiado roda até o final para liberar as estrelas
   if(rewardVideoSecondsWatched >= 240 && !rewardVideoFinished) {
     // Apenas salvaguarda de tempo máximo
   }
 }, 1000);
};

window.grantVideoReward = function() {
 if(rewardVideoFinished) return;
 rewardVideoFinished = true;
 if(rewardVideoInterval) { clearInterval(rewardVideoInterval); rewardVideoInterval = null; }
 const todayKey = 'eloRewardVideoDate_' + getBrasiliaDateStr();
 pset(todayKey, '1');
 if(typeof addStars === 'function') addStars(10, '🎉 Vídeo assistido até o final! +10 estrelas ganhas! ⭐');
 if(typeof triggerStarConfetti === 'function') triggerStarConfetti();
 toast('✨ Parabéns! Recompensa diária de vídeo concluída (+10 ⭐)!');
 const statusEl = document.getElementById('rewardVideoStatus');
 if(statusEl) statusEl.textContent = '🏆 Parabéns! Você assistiu e ganhou +10 ⭐!';
 setTimeout(() => {
   closeRewardedAd();
   renderStarShop();
 }, 1500);
};

window.cancelRewardedAd = function(){
 if(rewardVideoInterval) { clearInterval(rewardVideoInterval); rewardVideoInterval = null; }
 const overlay = document.getElementById('rewardVideoOverlay');
 const host = document.getElementById('rewardVideoHost');
 if(overlay) overlay.classList.add('hidden');
 if(host) host.innerHTML = '';
 if(!rewardVideoFinished) {
   toast('Você fechou antes de assistir o vídeo completo! Nenhuma estrela ganha 😊');
 }
};

window.closeRewardedAd = function(){
 if(rewardVideoInterval) { clearInterval(rewardVideoInterval); rewardVideoInterval = null; }
 const overlay = document.getElementById('rewardVideoOverlay');
 const host = document.getElementById('rewardVideoHost');
 if(overlay) overlay.classList.add('hidden');
 if(host) host.innerHTML = '';
};

window.buyParentPack = function(packId){
  if(typeof closeStarShop === 'function') closeStarShop();
  const todayKey = 'eloParentPackClaimed_' + getBrasiliaDateStr();
  if(pget(todayKey) === '1'){
    toast('Você já resgatou o pacote dos responsáveis de hoje! Ele volta amanhã às 00h (horário de Brasília) 💗');
    return;
  }
  requestParentAccess(()=>{
    pset(todayKey, '1');
    const amount = 50;
    if(typeof addStars === 'function') addStars(amount, 'Parabéns! Pacote de Responsáveis ativado com +50 ⭐!');
    if(typeof triggerStarConfetti === 'function') triggerStarConfetti();
    toast('Pacote dos responsáveis ativado com sucesso! +50 ⭐ (Bloqueado até amanhã às 00h)');
    renderStarShop();
  }, 'Digite o PIN dos responsáveis para autorizar o pacote diário de 50 ⭐.');
};

window.addEventListener('message', function(e){
  try {
    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if(data && (data.event === 'onStateChange' || data.info === 0)){
      if(data.info === 0 || data.data === 0){
        if(typeof grantVideoReward === 'function') grantVideoReward();
      }
    }
  } catch(_) {}
});
