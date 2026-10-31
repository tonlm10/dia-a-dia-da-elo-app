/* Dia a Dia da Elo — models3d.js • Engine e Modelos 3D v4.2.0 */
(function(){
'use strict';

// ==========================================================
// 1. ESTRUTURAS BÁSICAS E MOTOR 3D CANVAS 2D
// ==========================================================

let canvas = null;
let ctx = null;
let animFrameId = null;
let isModalOpen = false;

// Estado da Câmera e Renderizador
const camera = {
  rotX: -0.28,
  rotY: 0.55,
  zoom: 1.0,
  targetZoom: 1.0,
  baseDist: 400,
  autoRotate: true,
  autoRotateSpeed: 0.012,
  wireframe: false,
  lightDir: { x: 0.52, y: 0.75, z: 0.40 } // Luz direcional de cima/frente
};

// Normalizar vetor de luz
(function(){
  const len = Math.hypot(camera.lightDir.x, camera.lightDir.y, camera.lightDir.z) || 1;
  camera.lightDir.x /= len;
  camera.lightDir.y /= len;
  camera.lightDir.z /= len;
})();

let currentModelKey = 'unicorn';
let currentMesh = null;
let customMesh = null;

// ==========================================================
// 2. CONSTRUÇÃO MATEMÁTICA DOS 5 MODELOS 3D
// ==========================================================

function createMesh(){
  return {
    name: '',
    title: '',
    stats: '',
    desc: '',
    vertices: [], // {x, y, z}
    faces: [],    // {indices: [i0, i1, i2...], color: '#hex', wireColor: '#hex'}
  };
}

// Helper para adicionar cuboides / caixas 3D
function addBox(mesh, x, y, z, w, h, d, color, wireColor){
  const base = mesh.vertices.length;
  const hw = w / 2, hh = h / 2, hd = d / 2;
  mesh.vertices.push(
    { x: x - hw, y: y - hh, z: z - hd }, // 0: trás inferior esq
    { x: x + hw, y: y - hh, z: z - hd }, // 1: trás inferior dir
    { x: x + hw, y: y + hh, z: z - hd }, // 2: trás superior dir
    { x: x - hw, y: y + hh, z: z - hd }, // 3: trás superior esq
    { x: x - hw, y: y - hh, z: z + hd }, // 4: frente inferior esq
    { x: x + hw, y: y - hh, z: z + hd }, // 5: frente inferior dir
    { x: x + hw, y: y + hh, z: z + hd }, // 6: frente superior dir
    { x: x - hw, y: y + hh, z: z + hd }  // 7: frente superior esq
  );
  const wc = wireColor || color;
  mesh.faces.push(
    { indices: [base + 4, base + 5, base + 6, base + 7], color, wireColor: wc }, // Frente
    { indices: [base + 1, base + 0, base + 3, base + 2], color, wireColor: wc }, // Trás
    { indices: [base + 3, base + 2, base + 6, base + 7], color, wireColor: wc }, // Topo
    { indices: [base + 0, base + 1, base + 5, base + 4], color, wireColor: wc }, // Base
    { indices: [base + 0, base + 4, base + 7, base + 3], color, wireColor: wc }, // Esquerda
    { indices: [base + 5, base + 1, base + 2, base + 6], color, wireColor: wc }  // Direita
  );
}

// Helper para prismas / cilindros com n lados
function addCylinder(mesh, x, y, z, rTop, rBot, height, segments, color, wireColor){
  const base = mesh.vertices.length;
  const hh = height / 2;
  const wc = wireColor || color;
  for(let i = 0; i < segments; i++){
    const ang = (i / segments) * Math.PI * 2;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    mesh.vertices.push({ x: x + cos * rBot, y: y - hh, z: z + sin * rBot });
    mesh.vertices.push({ x: x + cos * rTop, y: y + hh, z: z + sin * rTop });
  }
  for(let i = 0; i < segments; i++){
    const next = (i + 1) % segments;
    const b0 = base + i * 2;
    const t0 = base + i * 2 + 1;
    const b1 = base + next * 2;
    const t1 = base + next * 2 + 1;
    mesh.faces.push({ indices: [b0, b1, t1, t0], color, wireColor: wc });
  }
  // Tampas
  const topIndices = [];
  const botIndices = [];
  for(let i = 0; i < segments; i++){
    topIndices.push(base + i * 2 + 1);
    botIndices.unshift(base + i * 2);
  }
  if(rTop > 0) mesh.faces.push({ indices: topIndices, color, wireColor: wc });
  if(rBot > 0) mesh.faces.push({ indices: botIndices, color, wireColor: wc });
}

// Helper para pirâmides / cones pontiagudos
function addCone(mesh, x, y, z, radius, height, segments, color, wireColor){
  const base = mesh.vertices.length;
  const hh = height / 2;
  const wc = wireColor || color;
  mesh.vertices.push({ x: x, y: y + hh, z: z }); // Ponta superior = 0
  for(let i = 0; i < segments; i++){
    const ang = (i / segments) * Math.PI * 2;
    mesh.vertices.push({ x: x + Math.cos(ang) * radius, y: y - hh, z: z + Math.sin(ang) * radius });
  }
  for(let i = 0; i < segments; i++){
    const curr = base + 1 + i;
    const next = base + 1 + ((i + 1) % segments);
    mesh.faces.push({ indices: [base, next, curr], color, wireColor: wc });
  }
  const baseIndices = [];
  for(let i = 0; i < segments; i++){
    baseIndices.unshift(base + 1 + i);
  }
  mesh.faces.push({ indices: baseIndices, color, wireColor: wc });
}

// 1. MODELO: UNICÓRNIA ALADA (Mágica, crina arco-íris, asas, chifre dourado)
function buildUnicornModel(){
  const m = createMesh();
  m.name = 'unicorn';
  m.title = 'Unicórnia Alada 🦄';
  m.desc = 'A fiel companheira alada da Elo com chifre dourado e crina arco-íris.';
  // Corpo
  addBox(m, 0, 0, 0, 55, 42, 90, '#ffffff', '#e2e8f0');
  // Barriga fofa
  addBox(m, 0, -8, 0, 48, 18, 80, '#fdf2f8', '#fbcfe8');
  // Pescoço inclinado
  addBox(m, 0, 32, 42, 28, 44, 30, '#ffffff', '#e2e8f0');
  // Cabeça
  addBox(m, 0, 52, 58, 30, 28, 42, '#ffffff', '#fdf2f8');
  // Focinho
  addBox(m, 0, 46, 78, 24, 18, 20, '#ffd8ea', '#f472b6');
  // Chifre dourado reluzente
  addCone(m, 0, 78, 65, 8, 38, 7, '#facc15', '#ca8a04');
  // Orelhas
  addCone(m, -11, 68, 48, 5, 18, 4, '#ffffff', '#f472b6');
  addCone(m, 11, 68, 48, 5, 18, 4, '#ffffff', '#f472b6');
  // Olhinhos expressivos
  addBox(m, -16, 54, 64, 2, 7, 7, '#475569');
  addBox(m, 16, 54, 64, 2, 7, 7, '#475569');
  // 4 Pernas com cascos dourados
  const legPositions = [
    { x: -18, z: 28 }, { x: 18, z: 28 },
    { x: -18, z: -28 }, { x: 18, z: -28 }
  ];
  legPositions.forEach(p => {
    addCylinder(m, p.x, -30, p.z, 7, 6, 42, 6, '#ffffff', '#e2e8f0');
    addCylinder(m, p.x, -52, p.z, 7, 8, 12, 6, '#facc15', '#ca8a04'); // Casco ouro
  });
  // Crina Arco-Íris em camadas
  addBox(m, 0, 46, 32, 12, 28, 16, '#f43f5e', '#fda4af'); // Rosa
  addBox(m, 0, 36, 20, 12, 26, 16, '#fb923c', '#fed7aa'); // Laranja
  addBox(m, 0, 24, 8, 12, 24, 16, '#facc15', '#fef08a');  // Amarelo
  addBox(m, 0, 14, -4, 12, 22, 16, '#22c55e', '#86efac'); // Verde
  addBox(m, 0, 4, -14, 12, 20, 16, '#38bdf8', '#7dd3fc'); // Azul
  // Cauda Arco-Íris majestosa
  addBox(m, 0, -4, -55, 14, 28, 24, '#a855f7', '#d8b4fe'); // Roxo
  addBox(m, 0, -22, -65, 12, 24, 20, '#ec4899', '#f472b6'); // Rosa
  // Asas grandes abertas
  // Asa Esquerda
  addBox(m, -38, 16, 8, 52, 6, 28, '#fdf4ff', '#e879f9');
  addBox(m, -56, 24, 14, 40, 5, 24, '#f0abfc', '#c084fc');
  // Asa Direita
  addBox(m, 38, 16, 8, 52, 6, 28, '#fdf4ff', '#e879f9');
  addBox(m, 56, 24, 14, 40, 5, 24, '#f0abfc', '#c084fc');

  m.stats = `${m.vertices.length} vértices • ${m.faces.length} polígonos`;
  return m;
}

// 2. MODELO: ELO 3D ALADA (Laço rosa, vestido com estrela e asinhas de fada)
function buildEloModel(){
  const m = createMesh();
  m.name = 'elo';
  m.title = 'Elo 3D Alada 👧✨';
  m.desc = 'A Elo em 3D com seu clássico laço rosa, vestidinho estelar e asas mágicas.';
  // Cabeça
  addBox(m, 0, 46, 0, 44, 40, 38, '#f1b884', '#e2a46c');
  // Rosto bochechas
  addBox(m, -14, 42, 19, 9, 6, 2, '#f472b6');
  addBox(m, 14, 42, 19, 9, 6, 2, '#f472b6');
  // Olhinhos
  addBox(m, -11, 48, 19, 6, 8, 2, '#312e81');
  addBox(m, 11, 48, 19, 6, 8, 2, '#312e81');
  // Cabelo volumoso castanho
  addBox(m, 0, 56, -6, 50, 24, 42, '#5c351f', '#3e2213');
  addBox(m, 0, 42, -18, 48, 42, 24, '#5c351f', '#3e2213');
  // Grande Laço Rosa da Elo
  addBox(m, 0, 68, 6, 16, 14, 12, '#ec4899', '#db2777');
  addBox(m, -18, 71, 6, 22, 18, 10, '#f472b6', '#ec4899'); // Asa esq do laço
  addBox(m, 18, 71, 6, 22, 18, 10, '#f472b6', '#ec4899');  // Asa dir do laço
  // Tronco / Vestido Rosa
  addBox(m, 0, 16, 0, 34, 30, 26, '#ff69b4', '#db2777');
  // Saia rodada
  addCylinder(m, 0, -4, 0, 18, 28, 20, 8, '#ec4899', '#be185d');
  // Estrelinha dourada no vestido
  addCone(m, 0, 18, 14, 7, 4, 5, '#fde047', '#ca8a04');
  // Braços
  addCylinder(m, -22, 14, 0, 5, 5, 26, 5, '#f1b884', '#e2a46c');
  addCylinder(m, 22, 14, 0, 5, 5, 26, 5, '#f1b884', '#e2a46c');
  // Pernas
  addCylinder(m, -10, -26, 0, 6, 6, 26, 5, '#f1b884', '#e2a46c');
  addCylinder(m, 10, -26, 0, 6, 6, 26, 5, '#f1b884', '#e2a46c');
  // Sapatinhos rosas
  addBox(m, -10, -41, 4, 13, 8, 18, '#db2777', '#9d174d');
  addBox(m, 10, -41, 4, 13, 8, 18, '#db2777', '#9d174d');
  // Asas de Fada luminosas nas costas
  addBox(m, -24, 22, -18, 32, 28, 3, '#bae6fd', '#38bdf8');
  addBox(m, 24, 22, -18, 32, 28, 3, '#bae6fd', '#38bdf8');

  m.stats = `${m.vertices.length} vértices • ${m.faces.length} polígonos`;
  return m;
}

// 3. MODELO: ELO MONTADA NA UNICÓRNIA (Composição 3D completa de voo)
function buildEloRidingModel(){
  const m = createMesh();
  m.name = 'elo_riding';
  m.title = 'Elo Montada na Unicórnia 🦄👧';
  m.desc = 'A grande cena 3D: Elo montada em sua amiga unicórnia voando pelas nuvens!';

  // --- UNICÓRNIA ---
  // Corpo
  addBox(m, 0, -18, 0, 52, 38, 86, '#ffffff', '#e2e8f0');
  // Sela rosa mágica onde a Elo senta
  addBox(m, 0, 4, 4, 46, 8, 36, '#ec4899', '#be185d');
  // Pescoço e Cabeça
  addBox(m, 0, 12, 40, 26, 40, 26, '#ffffff', '#e2e8f0');
  addBox(m, 0, 32, 54, 28, 26, 38, '#ffffff', '#fdf2f8');
  addBox(m, 0, 26, 72, 22, 16, 18, '#ffd8ea', '#f472b6'); // Focinho
  addCone(m, 0, 54, 60, 7, 34, 7, '#facc15', '#ca8a04');   // Chifre ouro
  // Orelhas
  addCone(m, -10, 46, 44, 4, 16, 4, '#ffffff', '#f472b6');
  addCone(m, 10, 46, 44, 4, 16, 4, '#ffffff', '#f472b6');
  // 4 Pernas da unicórnia flexionadas em voo
  addBox(m, -18, -42, 28, 12, 24, 16, '#ffffff', '#e2e8f0');
  addBox(m, 18, -42, 28, 12, 24, 16, '#ffffff', '#e2e8f0');
  addBox(m, -18, -42, -26, 12, 24, 16, '#ffffff', '#e2e8f0');
  addBox(m, 18, -42, -26, 12, 24, 16, '#ffffff', '#e2e8f0');
  // Cascos dourados
  addBox(m, -18, -56, 32, 13, 8, 16, '#facc15', '#ca8a04');
  addBox(m, 18, -56, 32, 13, 8, 16, '#facc15', '#ca8a04');
  addBox(m, -18, -56, -30, 13, 8, 16, '#facc15', '#ca8a04');
  addBox(m, 18, -56, -30, 13, 8, 16, '#facc15', '#ca8a04');
  // Asas grandes da unicórnia abertas
  addBox(m, -44, 6, 8, 56, 6, 32, '#fdf4ff', '#c084fc');
  addBox(m, 44, 6, 8, 56, 6, 32, '#fdf4ff', '#c084fc');
  // Crina e Cauda arco-íris
  addBox(m, 0, 22, 24, 10, 24, 14, '#f43f5e', '#fda4af');
  addBox(m, 0, -22, -54, 12, 34, 22, '#a855f7', '#ec4899');

  // --- ELO MONTADA NA SELA ---
  // Tronco da Elo
  addBox(m, 0, 24, 4, 28, 26, 22, '#ff69b4', '#db2777');
  // Cabeça da Elo
  addBox(m, 0, 52, 4, 34, 32, 30, '#f1b884', '#e2a46c');
  // Cabelo e Laço da Elo
  addBox(m, 0, 60, -2, 38, 22, 32, '#5c351f', '#3e2213');
  addBox(m, 0, 70, 8, 14, 12, 10, '#ec4899', '#db2777'); // Nó laço
  addBox(m, -14, 72, 8, 18, 14, 8, '#f472b6', '#ec4899'); // Asa laço esq
  addBox(m, 14, 72, 8, 18, 14, 8, '#f472b6', '#ec4899');  // Asa laço dir
  // Braços da Elo segurando a crina
  addBox(m, -18, 22, 18, 8, 8, 24, '#f1b884', '#e2a46c');
  addBox(m, 18, 22, 18, 8, 8, 24, '#f1b884', '#e2a46c');
  // Pernas da Elo abraçando a sela nas laterais
  addBox(m, -22, 4, 6, 12, 22, 16, '#3b82f6', '#1d4ed8'); // Shorts jeans
  addBox(m, 22, 4, 6, 12, 22, 16, '#3b82f6', '#1d4ed8');
  // Sapatinhos rosas
  addBox(m, -24, -10, 10, 10, 8, 16, '#ec4899', '#db2777');
  addBox(m, 24, -10, 10, 10, 8, 16, '#ec4899', '#db2777');

  m.stats = `${m.vertices.length} vértices • ${m.faces.length} polígonos`;
  return m;
}

// 4. MODELO: CASTELO DAS ESTRELAS (Fortaleza mágica 3D)
function buildCastleModel(){
  const m = createMesh();
  m.name = 'castle';
  m.title = 'Castelo das Estrelas 🏰✨';
  m.desc = 'A fortaleza encantada do Reino das Estrelas com 4 torres e cúpula mágica.';
  // Base e muralhas principais
  addBox(m, 0, -18, 0, 96, 44, 96, '#e0e7ff', '#c7d2fe');
  // Portão central de madeira dourada
  addBox(m, 0, -22, 49, 28, 34, 4, '#ca8a04', '#a16207');
  // Keep central (torreão mais alto)
  addBox(m, 0, 20, 0, 54, 44, 54, '#f5f3ff', '#ddd6fe');
  // Cúpula central
  addCone(m, 0, 56, 0, 34, 38, 8, '#ec4899', '#be185d');
  // Estrela dourada no topo da cúpula
  addCone(m, 0, 82, 0, 7, 16, 5, '#fde047', '#ca8a04');
  // 4 Torres laterais nas quinas
  const towerOffsets = [
    { x: -48, z: -48 }, { x: 48, z: -48 },
    { x: -48, z: 48 },  { x: 48, z: 48 }
  ];
  towerOffsets.forEach(p => {
    addCylinder(m, p.x, 0, p.z, 16, 18, 84, 7, '#e0e7ff', '#a5b4fc');
    // Telhado cônico da torre
    addCone(m, p.x, 54, p.z, 20, 30, 7, '#8b5cf6', '#6d28d9');
    // Bandeirola no topo
    addBox(m, p.x, 72, p.z, 3, 14, 10, '#f43f5e', '#be123c');
  });

  m.stats = `${m.vertices.length} vértices • ${m.faces.length} polígonos`;
  return m;
}

// 5. MODELO: ESTRELA DE CRISTAL 3D (Joia facetada com partículas orbitando)
function buildStarModel(){
  const m = createMesh();
  m.name = 'star';
  m.title = 'Estrela de Cristal 3D ⭐💎';
  m.desc = 'Joia estelar multifacetada com cristais luminosos orbitando em 3D.';
  const rOuter = 65, rInner = 28, depth = 26;
  const numPoints = 5;
  // Centro frente e centro trás
  m.vertices.push({ x: 0, y: 0, z: depth });  // 0: frente
  m.vertices.push({ x: 0, y: 0, z: -depth }); // 1: trás
  // Vértices do contorno estelar
  for(let i = 0; i < numPoints * 2; i++){
    const ang = (i / (numPoints * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = (i % 2 === 0) ? rOuter : rInner;
    meshAddVertex(m, Math.cos(ang) * r, Math.sin(ang) * r, 0);
  }
  function meshAddVertex(mesh, x, y, z){
    mesh.vertices.push({ x, y, z });
  }
  // Faces triangulares frontais e traseiras
  const total = numPoints * 2;
  for(let i = 0; i < total; i++){
    const vCurr = 2 + i;
    const vNext = 2 + ((i + 1) % total);
    // Face frontal
    m.faces.push({ indices: [0, vCurr, vNext], color: (i % 2 === 0) ? '#fde047' : '#facc15', wireColor: '#ca8a04' });
    // Face traseira
    m.faces.push({ indices: [1, vNext, vCurr], color: (i % 2 === 0) ? '#eab308' : '#ca8a04', wireColor: '#a16207' });
  }
  // Cristais orbitando ao redor da estrela
  const shards = [
    { x: -80, y: 45, z: 20 },
    { x: 80, y: 40, z: -20 },
    { x: -75, y: -50, z: -25 },
    { x: 75, y: -45, z: 25 },
    { x: 0, y: 90, z: 0 }
  ];
  shards.forEach(sh => {
    addCone(m, sh.x, sh.y, sh.z, 10, 22, 5, '#ec4899', '#f472b6');
  });

  m.stats = `${m.vertices.length} vértices • ${m.faces.length} polígonos`;
  return m;
}

// Carregador de Modelo Atual
function getModelMesh(key){
  if(key === 'custom' && customMesh) return customMesh;
  if(key === 'unicorn') return buildUnicornModel();
  if(key === 'elo') return buildEloModel();
  if(key === 'elo_riding') return buildEloRidingModel();
  if(key === 'castle') return buildCastleModel();
  if(key === 'star') return buildStarModel();
  return buildUnicornModel();
}

// ==========================================================
// 3. RENDERIZADOR 3D MATEMÁTICO (PIPELINE COMPLETO)
// ==========================================================

function renderScene(){
  if(!canvas || !ctx || !isModalOpen) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Fundo com degradê estelar suave
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.65);
  bgGrad.addColorStop(0, '#2d1b4e');
  bgGrad.addColorStop(0.55, '#1e1136');
  bgGrad.addColorStop(1, '#110920');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Grid de solo com grade suave de perspectiva
  drawGridFloor(ctx, w, h);

  if(!currentMesh) return;

  // Atualizar auto-rotação
  if(camera.autoRotate){
    camera.rotY += camera.autoRotateSpeed;
  }

  // Interpolação suave de zoom
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.12;

  // Matrizes de Rotação (Euler Y * X)
  const cosY = Math.cos(camera.rotY), sinY = Math.sin(camera.rotY);
  const cosX = Math.cos(camera.rotX), sinX = Math.sin(camera.rotX);

  // 1. Transformar e Projetar Vértices
  const projectedVertices = [];
  const fov = 480 * camera.zoom;
  const cx = w / 2, cy = h / 2 + 10;
  const dist = camera.baseDist;

  for(let i = 0; i < currentMesh.vertices.length; i++){
    const v = currentMesh.vertices[i];
    // Rotação Y
    const x1 = v.x * cosY + v.z * sinY;
    const y1 = v.y;
    const z1 = -v.x * sinY + v.z * cosY;
    // Rotação X
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX + dist;

    // Projeção em perspectiva
    const scale = fov / Math.max(1, z2);
    projectedVertices.push({
      px: cx + x2 * scale,
      py: cy - y2 * scale, // Canvas Y invertido
      pz: z2,
      worldX: x2,
      worldY: y2,
      worldZ: z2
    });
  }

  // 2. Ordenação de Polígonos por Profundidade (Painter's Algorithm)
  const sortedFaces = [];
  for(let i = 0; i < currentMesh.faces.length; i++){
    const face = currentMesh.faces[i];
    const idxs = face.indices;
    if(idxs.length < 3) continue;

    // Calcular Normal da Face no Espaço da Câmera para Backface Culling e Iluminação
    const v0 = projectedVertices[idxs[0]];
    const v1 = projectedVertices[idxs[1]];
    const v2 = projectedVertices[idxs[2]];

    // Vetores aresta no espaço 3D transformado
    const ax = v1.worldX - v0.worldX, ay = v1.worldY - v0.worldY, az = v1.worldZ - v0.worldZ;
    const bx = v2.worldX - v0.worldX, by = v2.worldY - v0.worldY, bz = v2.worldZ - v0.worldZ;

    // Produto vetorial (Normal)
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const nLen = Math.hypot(nx, ny, nz) || 1;
    nx /= nLen; ny /= nLen; nz /= nLen;

    // Média de profundidade (Z)
    let sumZ = 0;
    for(let j = 0; j < idxs.length; j++){
      sumZ += projectedVertices[idxs[j]].pz;
    }
    const avgZ = sumZ / idxs.length;

    // Backface Culling (na tela): se o produto vetorial 2D for menor que zero, face oculta
    const cross2D = (v1.px - v0.px) * (v2.py - v0.py) - (v1.py - v0.py) * (v2.px - v0.px);
    const isFrontFacing = cross2D < 0; // Dependendo da ordem de cordenadas

    // Iluminação Lambertiana: Dot product com lightDir
    const dot = Math.max(0, nx * camera.lightDir.x + ny * camera.lightDir.y + nz * camera.lightDir.z);
    const lightFactor = 0.38 + dot * 0.62; // Ambient 0.38 + Diffuse 0.62

    sortedFaces.push({
      face,
      avgZ,
      lightFactor,
      isFrontFacing
    });
  }

  // Ordenar do mais distante para o mais próximo
  sortedFaces.sort((a, b) => b.avgZ - a.avgZ);

  // 3. Desenhar Polígonos
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for(let i = 0; i < sortedFaces.length; i++){
    const item = sortedFaces[i];
    const face = item.face;
    const idxs = face.indices;

    ctx.beginPath();
    const first = projectedVertices[idxs[0]];
    ctx.moveTo(first.px, first.py);
    for(let j = 1; j < idxs.length; j++){
      const pt = projectedVertices[idxs[j]];
      ctx.lineTo(pt.px, pt.py);
    }
    ctx.closePath();

    if(!camera.wireframe){
      // Cor com iluminação sombreada
      ctx.fillStyle = shadeColor(face.color, item.lightFactor);
      ctx.fill();
      // Contorno suave para evitar fendas de rasterização
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 0.75;
      ctx.stroke();
    } else {
      // Modo Arames (Wireframe) Estelar
      ctx.strokeStyle = face.wireColor || '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  // 4. Partículas flutuantes de brilho estelar em volta do modelo
  drawStarSparkles(ctx, w, h);
}

// Chão em perspectiva 3D
function drawGridFloor(ctx, w, h){
  ctx.save();
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.18)';
  ctx.lineWidth = 1;
  const cy = h * 0.78;
  // Círculo base de solo
  ctx.beginPath();
  ctx.ellipse(w / 2, cy, w * 0.38, 38, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
  ctx.beginPath();
  ctx.ellipse(w / 2, cy, w * 0.24, 24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// Partículas de brilho mágicas
let sparkleTick = 0;
function drawStarSparkles(ctx, w, h){
  sparkleTick += 0.03;
  ctx.save();
  const sparks = [
    { x: 0.22, y: 0.28, r: 2.5, speed: 1.1 },
    { x: 0.78, y: 0.32, r: 3.0, speed: 0.9 },
    { x: 0.82, y: 0.68, r: 2.2, speed: 1.3 },
    { x: 0.18, y: 0.72, r: 2.8, speed: 1.0 },
    { x: 0.50, y: 0.15, r: 3.5, speed: 0.8 }
  ];
  for(let i = 0; i < sparks.length; i++){
    const s = sparks[i];
    const alpha = 0.35 + Math.sin(sparkleTick * s.speed + i) * 0.35;
    ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
    ctx.beginPath();
    ctx.arc(w * s.x, h * s.y + Math.sin(sparkleTick + i) * 6, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Aplicar fator de luz em cor hexadecimal
function shadeColor(hexColor, factor){
  if(!hexColor || hexColor.charAt(0) !== '#') return hexColor;
  let hex = hexColor.slice(1);
  if(hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));

  return `rgb(${r},${g},${b})`;
}

// Loop de Animação
function modelLoop(){
  if(!isModalOpen) return;
  renderScene();
  animFrameId = requestAnimationFrame(modelLoop);
}

// ==========================================================
// 4. INTERATIVIDADE: TOQUE, ARRASTO 360° E PINÇA/ZOOM
// ==========================================================

let isPointerDown = false;
let lastPointerX = 0;
let lastPointerY = 0;
let pinchDistStart = 0;

function setupInteraction(){
  if(!canvas) return;

  canvas.addEventListener('pointerdown', e => {
    isPointerDown = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  }, { passive: true });

  window.addEventListener('pointermove', e => {
    if(!isPointerDown || !isModalOpen) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    // Rotação da Câmera (sensibilidade suave)
    camera.rotY += dx * 0.009;
    camera.rotX = Math.max(-1.45, Math.min(1.45, camera.rotX + dy * 0.009));

    // Se o usuário interagir, pausa a auto-rotação temporariamente
    camera.autoRotate = false;
    updateAutoRotateBtnUI();
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  }, { passive: true });

  // Zoom via Roda do Mouse
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    camera.targetZoom = Math.max(0.45, Math.min(2.8, camera.targetZoom + zoomDelta));
  }, { passive: false });

  // Pinça multitouch para celulares
  canvas.addEventListener('touchstart', e => {
    if(e.touches.length === 2){
      pinchDistStart = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if(e.touches.length === 2 && pinchDistStart > 0){
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / pinchDistStart;
      camera.targetZoom = Math.max(0.45, Math.min(2.8, camera.targetZoom * (factor > 1 ? 1.04 : 0.96)));
      pinchDistStart = dist;
    }
  }, { passive: true });
}

function updateAutoRotateBtnUI(){
  const btn = document.getElementById('autoRotateToggleBtn');
  if(btn){
    btn.classList.toggle('active', camera.autoRotate);
    btn.textContent = camera.autoRotate ? '🔄 Girando' : '⏸️ Parado';
  }
}

// ==========================================================
// 5. EXPORTADOR E IMPORTADOR UNIVERSAL WAVEFRONT (.OBJ / .JSON)
// ==========================================================

// Exportar Modelo Atual como Arquivo Wavefront .OBJ
window.exportCurrentModelObj = function(){
  if(!currentMesh) return;
  const lines = [
    `# Dia a Dia da Elo — Modelo 3D: ${currentMesh.title}`,
    `# Exportado em formato padrão Wavefront (.OBJ) para uso em Blender, Unity, 3ds Max e impressão 3D`,
    `o ${currentMesh.name || 'elo_model'}`
  ];

  // Vértices
  for(let i = 0; i < currentMesh.vertices.length; i++){
    const v = currentMesh.vertices[i];
    // OBJ Y é para cima, invertemos Y para manter a orientação padrão
    lines.push(`v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}`);
  }

  // Faces (índices 1-based no padrão OBJ)
  for(let i = 0; i < currentMesh.faces.length; i++){
    const f = currentMesh.faces[i];
    const idxs = f.indices.map(idx => idx + 1);
    lines.push(`f ${idxs.join(' ')}`);
  }

  const objText = lines.join('\n');
  const blob = new Blob([objText], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `elo-3d-${currentMesh.name || 'modelo'}.obj`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1200);

  if(typeof playCuteSfx === 'function') playCuteSfx('win');
  if(typeof addStars === 'function') addStars(2, 'Modelo 3D exportado com sucesso! +2 ⭐');
  if(typeof toast === 'function') toast(`Arquivo ${a.download} pronto para usar em softwares 3D! 💎`);
};

// Importar Arquivo Externo (.OBJ ou .JSON)
window.importCustomModelFile = function(input){
  const file = input?.files?.[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const text = e.target.result;
      let mesh = null;
      if(file.name.toLowerCase().endsWith('.json')){
        mesh = parseJsonModel(text);
      } else {
        mesh = parseObjModel(text, file.name);
      }
      if(mesh && mesh.vertices.length > 0){
        customMesh = mesh;
        selectModelPreset('custom');
        if(typeof playCuteSfx === 'function') playCuteSfx('win');
        if(typeof toast === 'function') toast(`Modelo 3D "${file.name}" importado com sucesso! 🎉`);
      } else {
        throw new Error('Sem vértices válidos');
      }
    } catch(err) {
      if(typeof toast === 'function') toast('Não foi possível ler o arquivo 3D. Verifique se é um .OBJ ou .JSON válido.');
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
};

function parseObjModel(objText, fileName){
  const mesh = createMesh();
  mesh.name = 'custom';
  mesh.title = `Modelo: ${fileName.replace(/\.obj$/i, '')}`;
  mesh.desc = 'Modelo 3D importado pelo usuário.';

  const lines = objText.split('\n');
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;

  for(let i = 0; i < lines.length; i++){
    const line = lines[i].trim();
    if(line.startsWith('v ')){
      const parts = line.split(/\s+/).slice(1).map(Number);
      if(parts.length >= 3){
        const v = { x: parts[0], y: parts[1], z: parts[2] };
        mesh.vertices.push(v);
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
      }
    } else if(line.startsWith('f ')){
      const parts = line.split(/\s+/).slice(1);
      const indices = [];
      for(let j = 0; j < parts.length; j++){
        const slashIdx = parts[j].indexOf('/');
        const vertStr = slashIdx > -1 ? parts[j].slice(0, slashIdx) : parts[j];
        const idx = parseInt(vertStr, 10);
        if(!isNaN(idx)){
          // Tratar índices negativos do padrão OBJ
          indices.push(idx > 0 ? idx - 1 : mesh.vertices.length + idx);
        }
      }
      if(indices.length >= 3){
        mesh.faces.push({ indices, color: '#f472b6', wireColor: '#ec4899' });
      }
    }
  }

  // Centralizar e normalizar escala para caber perfeitamente no viewport (tamanho alvo ~100)
  if(mesh.vertices.length > 0){
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;
    const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    const scaleFactor = 110 / maxDim;

    for(let i = 0; i < mesh.vertices.length; i++){
      const v = mesh.vertices[i];
      v.x = (v.x - cx) * scaleFactor;
      v.y = (v.y - cy) * scaleFactor;
      v.z = (v.z - cz) * scaleFactor;
    }
  }

  mesh.stats = `${mesh.vertices.length} vértices • ${mesh.faces.length} polígonos`;
  return mesh;
}

function parseJsonModel(jsonText){
  const data = JSON.parse(jsonText);
  const mesh = createMesh();
  mesh.name = 'custom';
  mesh.title = data.title || 'Modelo JSON';
  mesh.desc = data.desc || 'Modelo importado em formato JSON.';
  mesh.vertices = data.vertices || [];
  mesh.faces = data.faces || [];
  mesh.stats = `${mesh.vertices.length} vértices • ${mesh.faces.length} polígonos`;
  return mesh;
}

// ==========================================================
// 6. CONTROLADORES DA UI E MODAL
// ==========================================================

window.openModelStudio = function(presetKey){
  const modal = document.getElementById('modelStudioModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  isModalOpen = true;

  canvas = document.getElementById('modelStudioCanvas');
  if(canvas) ctx = canvas.getContext('2d');

  setupInteraction();
  selectModelPreset(presetKey || currentModelKey);

  if(!animFrameId){
    animFrameId = requestAnimationFrame(modelLoop);
  }

  if(typeof playCuteSfx === 'function') playCuteSfx('pop');
  if(typeof eloGuideSay === 'function'){
    eloGuideSay('Bem-vinda ao meu Estúdio 3D! Você pode girar os modelos em 360°, dar zoom e até baixar para o seu computador!');
  }
};

window.closeModelStudio = function(){
  const modal = document.getElementById('modelStudioModal');
  if(modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  isModalOpen = false;
  if(animFrameId){
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
};

function selectModelPreset(key, btn){
  currentModelKey = key;
  currentMesh = getModelMesh(key);

  // Atualizar Botões de Seleção
  document.querySelectorAll('.modelPresetBtn').forEach(b => {
    b.classList.toggle('active', b.dataset.model === key);
  });
  if(btn) btn.classList.add('active');

  // Atualizar Textos e Estatísticas
  const titleEl = document.getElementById('modelStudioTitle');
  const statsEl = document.getElementById('modelStudioStats');
  const descEl = document.getElementById('modelStudioDesc');
  if(titleEl && currentMesh) titleEl.textContent = currentMesh.title || 'Estúdio 3D da Elo';
  if(statsEl && currentMesh) statsEl.textContent = currentMesh.stats || '';
  if(descEl && currentMesh) descEl.textContent = currentMesh.desc || '';

  resetModelCamera(false);
  if(typeof playCuteSfx === 'function') playCuteSfx('pop');
}
window.selectModelPreset = selectModelPreset;

window.toggleModelAutoRotate = function(){
  camera.autoRotate = !camera.autoRotate;
  updateAutoRotateBtnUI();
  if(typeof playCuteSfx === 'function') playCuteSfx('pop');
};

window.toggleModelWireframe = function(){
  camera.wireframe = !camera.wireframe;
  const btn = document.getElementById('wireframeToggleBtn');
  if(btn){
    btn.classList.toggle('active', camera.wireframe);
  }
  if(typeof playCuteSfx === 'function') playCuteSfx('pop');
};

function resetModelCamera(showToast = true){
  camera.rotX = -0.28;
  camera.rotY = 0.55;
  camera.zoom = 1.0;
  camera.targetZoom = 1.0;
  if(showToast && typeof toast === 'function') toast('Câmera 3D centralizada 🎯');
}
window.resetModelCamera = resetModelCamera;

// Auto-inicialização quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('modelStudioCanvas');
  if(canvas) ctx = canvas.getContext('2d');
});

})();
