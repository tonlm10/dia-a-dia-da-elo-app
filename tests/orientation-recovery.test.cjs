'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('versão, service worker e cache usam um único identificador', () => {
  assert.ok(read('version.js').includes('4.3.28'));
  assert.ok(read('sw.js').includes('elo-official-4.3.28-r67'));
  assert.ok(read('index.html').includes('elo_client_repaired_4.3.28-r67'));
  assert.ok(read('completion.js').includes('game-rework.js?v=4.3.28'));
});

test('o app não aparece em retrato, nem nas exceções de histórias', () => {
  const css = read('completion.css');
  assert.equal(JSON.parse(read('manifest.webmanifest')).orientation, 'landscape');
  assert.ok(css.includes('orientation:portrait'));
  assert.ok(css.includes('#mandatoryLandscapeBlocker { display:flex !important'));
  assert.ok(css.includes('#appContainer { display:none !important'));
  assert.ok(css.includes('body.reading-portrait-allowed #appContainer'));
});

test('a recuperação do cache espera a limpeza e não apaga dados locais', () => {
  const html = read('index.html');
  assert.ok(html.includes('Promise.allSettled(jobs)'));
  assert.ok(html.includes("key.indexOf('elo-official-') === 0"));
  assert.ok(html.includes('navigator.onLine'));
  assert.ok(!html.includes('localStorage.clear('));
});

test('a moldura usa a barra inferior correta e dá altura útil aos painéis', () => {
  const home = read('home.js');
  assert.ok(home.includes("document.querySelector('#appContainer > nav')"));
  assert.ok(home.includes('r.height > 0 && r.top > 0'));
  assert.ok(home.includes('const fallback = Math.min(64'));
  assert.ok(home.includes('function mainNavTop()'));
});
