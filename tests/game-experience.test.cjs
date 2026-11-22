'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp, existsApp } = require('./helpers.cjs');

test('novas cartas de memória usam ilustrações locais existentes', () => {
  const js = readApp('game-experience.js');
  const block = js.match(/const EXTRA_MEMORY_IMAGES = \[([\s\S]*?)\n  \];/);
  assert.ok(block, 'Lista de novas cartas ausente.');
  const assets = [...block[1].matchAll(/\['([^']+\.webp)'/g)].map(m => m[1]);
  assert.equal(assets.length, 13);
  for (const asset of assets) assert.ok(existsApp(asset), `Ilustração de memória ausente: ${asset}`);
});

test('controles de dica e pausa estão ligados ao app e ao modo offline', () => {
  const completion = readApp('completion.js'), sw = readApp('sw.js'), offline = readApp('offline-manifest.js'), js = readApp('game-experience.js');
  assert.match(completion, /game-experience\.css\?v=4\.3\.26/);
  assert.match(completion, /game-experience\.js\?v=4\.3\.26/);
  assert.match(completion, /game-rework\.css\?v=4\.3\.26/);
  assert.match(completion, /game-rework\.js\?v=4\.3\.26/);
  assert.match(sw, /\.\/game-experience\.css/);
  assert.match(sw, /\.\/game-experience\.js/);
  assert.match(offline, /game-experience\.css/);
  assert.match(offline, /game-experience\.js/);
  for (const hook of ['gxMazeHint','gxChaseHint','gxFindHint','gxTrailPause','gxTrailEnd','shortestPath']) assert.ok(js.includes(hook), `Melhoria ausente: ${hook}`);
});

test('estilos dos jogos incluem responsividade, foco e animação reduzida', () => {
  const css = readApp('game-experience.css');
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.gxHintPath/);
});
