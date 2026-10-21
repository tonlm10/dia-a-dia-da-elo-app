/* models3d.js — Motor 3D Nativo & Modelos Poligonais da Elo v4.3.0 */
(function(){
'use strict';

const MODEL_PRESETS = {
  unicorn: {
    name: 'Unicórnia Alada',
    desc: 'Amiga mágica da Elo com asas reluzentes e crina arco-íris.',
    scale: 1.2,
    vertices: [
      [-0.8, -0.2, -0.4], [0.8, -0.2, -0.4], [0.8, 0.4, -0.4], [-0.8, 0.4, -0.4],
      [-0.8, -0.2, 0.4], [0.8, -0.2, 0.4], [0.8, 0.4, 0.4], [-0.8, 0.4, 0.4],
      [0.9, 0.8, -0.25], [1.3, 1.1, -0.2], [1.3, 0.9, -0.2], [0.9, 0.5, -0.25],
      [0.9, 0.8, 0.25], [1.3, 1.1, 0.2], [1.3, 0.9, 0.2], [0.9, 0.5, 0.25],
      [1.6, 0.95, -0.15], [1.6, 1.05, -0.15], [1.6, 1.05, 0.15], [1.6, 0.95, 0.15],
      [1.3, 1.15, 0.0], [1.8, 1.8, 0.0], [1.35, 1.12, -0.05], [1.35, 1.12, 0.05],
      [0.1, 0.45, 0.35], [0.3, 1.2, 1.1], [-0.5, 1.4, 1.3], [-0.4, 0.45, 0.35],
      [0.1, 0.45, -0.35], [0.3, 1.2, -1.1], [-0.5, 1.4, -1.3], [-0.4, 0.45, -0.35],
      [-0.6, -0.2, -0.3], [-0.5, -1.1, -0.3], [-0.7, -1.1, -0.3],
      [0.6, -0.2, -0.3], [0.7, -1.1, -0.3], [0.5, -1.1, -0.3],
      [-0.6, -0.2, 0.3], [-0.5, -1.1, 0.3], [-0.7, -1.1, 0.3],
      [0.6, -0.2, 0.3], [0.7, -1.1, 0.3], [0.5, -1.1, 0.3]
    ],
    faces: [
      { v: [0, 1, 2, 3], c: '#ffffff' }, { v: [5, 4, 7, 6], c: '#ffffff' },
      { v: [4, 0, 3, 7], c: '#f3e8ff' }, { v: [1, 5, 6, 2], c: '#f3e8ff' },
      { v: [3, 2, 6, 7], c: '#ffffff' }, { v: [4, 5, 1, 0], c: '#eae0fa' },
      { v: [8, 9, 13, 12], c: '#ffffff' }, { v: [11, 10, 14, 15], c: '#ffffff' },
      { v: [8, 11, 15, 12], c: '#f8f4ff' }, { v: [9, 10, 14, 13], c: '#ffffff' },
      { v: [9, 17, 18, 13], c: '#ffcce3' }, { v: [10, 16, 19, 14], c: '#ffcce3' },
      { v: [16, 17, 18, 19], c: '#ff9fc7' },
      { v: [20, 21, 22], c: '#ffd700' }, { v: [20, 21, 23], c: '#facc15' }, { v: [22, 21, 23], c: '#fef08a' },
      { v: [24, 25, 26, 27], c: '#e0f2fe' }, { v: [27, 26, 25, 24], c: '#bae6fd' },
      { v: [28, 29, 30, 31], c: '#e0f2fe' }, { v: [31, 30, 29, 28], c: '#bae6fd' },
      { v: [32, 33, 34], c: '#f8fafc' }, { v: [35, 36, 37], c: '#f8fafc' },
      { v: [38, 39, 40], c: '#f8fafc' }, { v: [41, 42, 43], c: '#f8fafc' }
    ]
  },

  elo: {
    name: 'Elo 3D Alada',
    desc: 'A querida Elo modelada em 3D com asinhas e vestido de princesa.',
    scale: 1.3,
    vertices: [
      [-0.3, 0.6, -0.3], [0.3, 0.6, -0.3], [0.3, 1.2, -0.3], [-0.3, 1.2, -0.3],
      [-0.3, 0.6, 0.3], [0.3, 0.6, 0.3], [0.3, 1.2, 0.3], [-0.3, 1.2, 0.3],
      [0.0, 1.25, 0.0], [0.25, 1.45, 0.0], [-0.25, 1.45, 0.0],
      [-0.35, 0.0, -0.3], [0.35, 0.0, -0.3], [0.45, -0.6, -0.4], [-0.45, -0.6, -0.4],
      [-0.35, 0.0, 0.3], [0.35, 0.0, 0.3], [0.45, -0.6, 0.4], [-0.45, -0.6, 0.4],
      [-0.2, -0.6, 0.0], [-0.2, -1.2, 0.0], [0.2, -0.6, 0.0], [0.2, -1.2, 0.0],
      [0.0, 0.1, -0.3], [0.7, 0.6, -0.7], [0.5, -0.2, -0.6],
      [0.0, 0.1, -0.3], [-0.7, 0.6, -0.7], [-0.5, -0.2, -0.6]
    ],
    faces: [
      { v: [0, 1, 2, 3], c: '#f1b884' }, { v: [5, 4, 7, 6], c: '#f1b884' },
      { v: [4, 0, 3, 7], c: '#6e3d27' }, { v: [1, 5, 6, 2], c: '#6e3d27' },
      { v: [3, 2, 6, 7], c: '#6e3d27' }, { v: [4, 5, 1, 0], c: '#f1b884' },
      { v: [8, 9, 10], c: '#ff67a8' }, { v: [10, 9, 8], c: '#ff438a' },
      { v: [11, 12, 13, 14], c: '#ff76b8' }, { v: [16, 15, 18, 17], c: '#ff76b8' },
      { v: [15, 11, 14, 18], c: '#ff5c9f' }, { v: [12, 16, 17, 13], c: '#ff5c9f' },
      { v: [14, 13, 17, 18], c: '#f43f5e' },
      { v: [19, 20, 20], c: '#e9ac7c' }, { v: [21, 22, 22], c: '#e9ac7c' },
      { v: [23, 24, 25], c: '#7dd3fc' }, { v: [25, 24, 23], c: '#bae6fd' },
      { v: [26, 27, 28], c: '#7dd3fc' }, { v: [28, 27, 26], c: '#bae6fd' }
    ]
  },

  elo_riding: {
    name: 'Elo Montada na Unicórnia',
    desc: 'Cena mágica da Elo voando sobre a sela de sua unicórnia alada!',
    scale: 1.1,
    vertices: [
      [-0.7, -0.3, -0.35], [0.7, -0.3, -0.35], [0.7, 0.3, -0.35], [-0.7, 0.3, -0.35],
      [-0.7, -0.3, 0.35], [0.7, -0.3, 0.35], [0.7, 0.3, 0.35], [-0.7, 0.3, 0.35],
      [0.8, 0.7, -0.2], [1.2, 0.95, 0.0], [0.8, 0.4, -0.2],
      [0.8, 0.7, 0.2], [0.8, 0.4, 0.2],
      [1.2, 1.0, 0.0], [1.6, 1.6, 0.0], [1.25, 0.98, 0.05],
      [0.0, 0.35, 0.3], [0.2, 1.1, 1.0], [-0.5, 1.2, 1.1],
      [0.0, 0.35, -0.3], [0.2, 1.1, -1.0], [-0.5, 1.2, -1.1],
      [-0.1, 0.3, -0.2], [0.3, 0.3, -0.2], [0.25, 0.9, -0.2], [-0.05, 0.9, -0.2],
      [-0.1, 0.3, 0.2], [0.3, 0.3, 0.2], [0.25, 0.9, 0.2], [-0.05, 0.9, 0.2],
      [0.0, 0.95, -0.2], [0.25, 0.95, -0.2], [0.25, 1.35, -0.2], [0.0, 1.35, -0.2],
      [0.0, 0.95, 0.2], [0.25, 0.95, 0.2], [0.25, 1.35, 0.2], [0.0, 1.35, 0.2]
    ],
    faces: [
      { v: [0, 1, 2, 3], c: '#ffffff' }, { v: [5, 4, 7, 6], c: '#ffffff' },
      { v: [4, 0, 3, 7], c: '#f3e8ff' }, { v: [1, 5, 6, 2], c: '#f3e8ff' },
      { v: [3, 2, 6, 7], c: '#f8fafc' }, { v: [4, 5, 1, 0], c: '#e2e8f0' },
      { v: [8, 9, 11], c: '#ffffff' }, { v: [10, 9, 12], c: '#ffcce3' },
      { v: [13, 14, 15], c: '#facc15' },
      { v: [16, 17, 18], c: '#7dd3fc' }, { v: [18, 17, 16], c: '#bae6fd' },
      { v: [19, 20, 21], c: '#7dd3fc' }, { v: [21, 20, 19], c: '#bae6fd' },
      { v: [22, 23, 24, 25], c: '#ff67a8' }, { v: [27, 26, 29, 28], c: '#ff67a8' },
      { v: [26, 22, 25, 29], c: '#ff438a' }, { v: [23, 27, 28, 24], c: '#ff438a' },
      { v: [30, 31, 32, 33], c: '#f1b884' }, { v: [35, 34, 37, 36], c: '#f1b884' },
      { v: [34, 30, 33, 37], c: '#6e3d27' }, { v: [31, 35, 36, 32], c: '#6e3d27' },
      { v: [33, 32, 36, 37], c: '#ff67a8' }
    ]
  },

  castle: {
    name: 'Castelo das Estrelas',
    desc: 'Fortaleza mágica das fadas com 4 torres e bandeiras estelares.',
    scale: 1.0,
    vertices: [
      [-0.6, -0.8, -0.6], [0.6, -0.8, -0.6], [0.6, 0.3, -0.6], [-0.6, 0.3, -0.6],
      [-0.6, -0.8, 0.6], [0.6, -0.8, 0.6], [0.6, 0.3, 0.6], [-0.6, 0.3, 0.6],
      [-0.3, 0.3, -0.3], [0.3, 0.3, -0.3], [0.3, 0.9, -0.3], [-0.3, 0.9, -0.3],
      [-0.3, 0.3, 0.3], [0.3, 0.3, 0.3], [0.3, 0.9, 0.3], [-0.3, 0.9, 0.3],
      [0.0, 1.4, 0.0],
      [-0.8, 0.6, -0.8], [0.8, 0.6, -0.8], [-0.8, 0.6, 0.8], [0.8, 0.6, 0.8],
      [-0.8, 1.0, -0.8], [0.8, 1.0, -0.8], [-0.8, 1.0, 0.8], [0.8, 1.0, 0.8]
    ],
    faces: [
      { v: [0, 1, 2, 3], c: '#c4b5fd' }, { v: [5, 4, 7, 6], c: '#c4b5fd' },
      { v: [4, 0, 3, 7], c: '#a78bfa' }, { v: [1, 5, 6, 2], c: '#a78bfa' },
      { v: [3, 2, 6, 7], c: '#8b5cf6' },
      { v: [8, 9, 10, 11], c: '#fbcfe8' }, { v: [13, 12, 15, 14], c: '#fbcfe8' },
      { v: [12, 8, 11, 15], c: '#f472b6' }, { v: [9, 13, 14, 10], c: '#f472b6' },
      { v: [11, 10, 16], c: '#ec4899' }, { v: [10, 14, 16], c: '#f43f5e' },
      { v: [14, 15, 16], c: '#ec4899' }, { v: [15, 11, 16], c: '#f43f5e' },
      { v: [17, 21, 17], c: '#facc15' }, { v: [18, 22, 18], c: '#facc15' },
      { v: [19, 23, 19], c: '#facc15' }, { v: [20, 24, 20], c: '#facc15' }
    ]
  },

  star: {
    name: 'Estrela de Cristal 3D',
    desc: 'Joia estelar multifacetada com cristais orbitando em 3D.',
    scale: 1.4,
    vertices: [
      [0.0, 1.3, 0.0], [0.0, -1.3, 0.0],
      [0.9, 0.0, 0.0], [-0.9, 0.0, 0.0],
      [0.0, 0.0, 0.9], [0.0, 0.0, -0.9],
      [0.55, 0.55, 0.55], [-0.55, 0.55, 0.55], [0.55, 0.55, -0.55], [-0.55, 0.55, -0.55],
      [0.55, -0.55, 0.55], [-0.55, -0.55, 0.55], [0.55, -0.55, -0.55], [-0.55, -0.55, -0.55]
    ],
    faces: [
      { v: [0, 2, 6], c: '#fde047' }, { v: [0, 6, 4], c: '#fef08a' },
      { v: [0, 4, 7], c: '#fde047' }, { v: [0, 7, 3], c: '#fef08a' },
      { v: [0, 3, 9], c: '#fde047' }, { v: [0, 9, 5], c: '#fef08a' },
      { v: [0, 5, 8], c: '#fde047' }, { v: [0, 8, 2], c: '#fef08a' },
      { v: [1, 2, 10], c: '#f59e0b' }, { v: [1, 10, 4], c: '#d97706' },
      { v: [1, 4, 11], c: '#f59e0b' }, { v: [1, 11, 3], c: '#d97706' },
      { v: [1, 3, 13], c: '#f59e0b' }, { v: [1, 13, 5], c: '#d97706' },
      { v: [1, 5, 12], c: '#f59e0b' }, { v: [1, 12, 2], c: '#d97706' }
    ]
  }
};

let currentPresetKey = 'unicorn';
let customModel = null;
let rotX = -0.35;
let rotY = 0.55;
let zoom = 1.0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let autoRotate = true;
let wireframe = false;
let animFrameId = null;

function getCurrentModel() {
  return customModel || MODEL_PRESETS[currentPresetKey] || MODEL_PRESETS.unicorn;
}

window.openModelStudio = function() {
  const modal = document.getElementById('modelStudioModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if(typeof eloGuideSay === 'function') {
    eloGuideSay('Bem-vinda ao Estúdio 3D! Arraste com o dedinho para girar!');
  }
  setTimeout(initModelStudioCanvas, 80);
};

window.closeModelStudio = function() {
  const modal = document.getElementById('modelStudioModal');
  if(modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  if(animFrameId) cancelAnimationFrame(animFrameId);
};

window.selectModelPreset = function(key, btn) {
  if(!MODEL_PRESETS[key]) return;
  currentPresetKey = key;
  customModel = null;
  document.querySelectorAll('.modelPresetBtn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const m = getCurrentModel();
  const title = document.getElementById('modelStudioTitle');
  const desc = document.getElementById('modelStudioDesc');
  const stats = document.getElementById('modelStudioStats');
  if(title) title.textContent = m.name;
  if(desc) desc.textContent = m.desc;
  if(stats) stats.textContent = m.vertices.length + ' vértices • ' + m.faces.length + ' polígonos';
  zoom = 1.0;
  if(typeof playCuteSfx === 'function') playCuteSfx('pop');
};

window.toggleModelAutoRotate = function() {
  autoRotate = !autoRotate;
  const btn = document.getElementById('autoRotateToggleBtn');
  if(btn) btn.classList.toggle('active', autoRotate);
};

window.toggleModelWireframe = function() {
  wireframe = !wireframe;
  const btn = document.getElementById('wireframeToggleBtn');
  if(btn) btn.classList.toggle('active', wireframe);
};

window.resetModelCamera = function() {
  rotX = -0.35;
  rotY = 0.55;
  zoom = 1.0;
};

window.initModelStudioCanvas = function() {
  const canvas = document.getElementById('modelStudioCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if(!canvas.dataset.inited) {
    canvas.dataset.inited = '1';
    
    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    });
    
    window.addEventListener('pointermove', (e) => {
      if(!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.012;
      rotX += dy * 0.012;
      rotX = Math.max(-1.4, Math.min(1.4, rotX));
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    window.addEventListener('pointerup', () => { isDragging = false; });
    window.addEventListener('pointercancel', () => { isDragging = false; });
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom += e.deltaY * -0.0015;
      zoom = Math.max(0.4, Math.min(2.8, zoom));
    }, { passive: false });
  }

  const renderLoop = () => {
    if(autoRotate && !isDragging) {
      rotY += 0.01;
    }
    draw3DScene(canvas, ctx);
    animFrameId = requestAnimationFrame(renderLoop);
  };
  if(animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(renderLoop);
};

function draw3DScene(canvas, ctx) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, w/2);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.7, '#fbf7ff');
  bg.addColorStop(1, '#f1e8fa');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(w/2, h/2 + 130 * zoom, 150 * zoom, 40 * zoom, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(216, 180, 254, 0.35)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.stroke();
  ctx.restore();

  const model = getCurrentModel();
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const scale = 110 * (model.scale || 1.0) * zoom;
  const cx = w / 2;
  const cy = h / 2 - 10;

  const transformed = model.vertices.map(v => {
    let x1 = v[0] * cosY - v[2] * sinY;
    let z1 = v[0] * sinY + v[2] * cosY;
    let y1 = v[1];
    let y2 = y1 * cosX - z1 * sinX;
    let z2 = y1 * sinX + z1 * cosX;
    const pDist = 4.2;
    const fov = pDist / (pDist + z2);
    return {
      x: cx + x1 * scale * fov,
      y: cy - y2 * scale * fov,
      z: z2
    };
  });

  const renderedFaces = [];
  model.faces.forEach(face => {
    const pts = face.v.map(idx => transformed[idx]);
    if(pts.some(p => !p)) return;

    const ax = pts[1].x - pts[0].x, ay = pts[1].y - pts[0].y;
    const bx = pts[2].x - pts[0].x, by = pts[2].y - pts[0].y;
    const crossZ = ax * by - ay * bx;

    const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
    const shade = Math.min(1.0, Math.max(0.35, 0.7 + (pts[0].z * 0.25)));

    renderedFaces.push({
      pts,
      avgZ,
      color: face.c || '#ff67a8',
      crossZ,
      shade
    });
  });

  renderedFaces.sort((a, b) => a.avgZ - b.avgZ);

  renderedFaces.forEach(f => {
    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for(let i=1; i<f.pts.length; i++) {
      ctx.lineTo(f.pts[i].x, f.pts[i].y);
    }
    ctx.closePath();

    if(wireframe) {
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = adjustColorBrightness(f.color, f.shade);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

function adjustColorBrightness(hex, factor) {
  if(!hex.startsWith('#')) return hex;
  let c = hex.slice(1);
  if(c.length === 3) c = c.split('').map(x => x+x).join('');
  const num = parseInt(c, 16);
  let r = Math.min(255, Math.floor(((num >> 16) & 255) * factor));
  let g = Math.min(255, Math.floor(((num >> 8) & 255) * factor));
  let b = Math.min(255, Math.floor((num & 255) * factor));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

window.exportCurrentModelObj = function() {
  const m = getCurrentModel();
  let obj = '# Dia a Dia da Elo 3D Studio - Model: ' + m.name + '\n';
  obj += 'o ' + m.name.replace(/\s+/g, '_') + '\n';
  m.vertices.forEach(v => {
    obj += 'v ' + v[0].toFixed(4) + ' ' + v[1].toFixed(4) + ' ' + v[2].toFixed(4) + '\n';
  });
  m.faces.forEach(f => {
    obj += 'f ' + f.v.map(idx => idx + 1).join(' ') + '\n';
  });

  const blob = new Blob([obj], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = m.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_3d.obj';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  
  if(typeof addStars === 'function') addStars(2, 'Modelo 3D exportado com sucesso! +2 ⭐');
  if(typeof toast === 'function') toast('Arquivo Wavefront .OBJ baixado! 💎');
};

window.importCustomModelFile = function(input) {
  const file = input.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      if(file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        if(!parsed.vertices || !parsed.faces) throw new Error('Formato inválido');
        customModel = {
          name: parsed.name || file.name.replace(/\.[^/.]+$/, ''),
          desc: 'Modelo 3D personalizado importado.',
          scale: parsed.scale || 1.0,
          vertices: parsed.vertices,
          faces: parsed.faces
        };
      } else {
        const lines = text.split('\n');
        const verts = [];
        const faces = [];
        lines.forEach(l => {
          const parts = l.trim().split(/\s+/);
          if(parts[0] === 'v') {
            verts.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
          } else if(parts[0] === 'f') {
            const vIdxs = parts.slice(1).map(p => {
              const vi = parseInt(p.split('/')[0], 10);
              return vi > 0 ? vi - 1 : verts.length + vi;
            });
            faces.push({ v: vIdxs, c: '#ff67a8' });
          }
        });
        if(!verts.length || !faces.length) throw new Error('OBJ sem vértices ou faces');
        customModel = {
          name: file.name.replace(/\.[^/.]+$/, ''),
          desc: 'Modelo OBJ importado pelo usuário.',
          scale: 1.0,
          vertices: verts,
          faces: faces
        };
      }
      const title = document.getElementById('modelStudioTitle');
      const stats = document.getElementById('modelStudioStats');
      if(title) title.textContent = customModel.name;
      if(stats) stats.textContent = customModel.vertices.length + ' vértices • ' + customModel.faces.length + ' polígonos';
      if(typeof toast === 'function') toast('Modelo 3D importado com sucesso! 💎✨');
    } catch(err) {
      alert('Erro ao carregar modelo: verifique se é um arquivo .OBJ ou .JSON válido.');
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
};

})();
