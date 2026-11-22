'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp, existsApp } = require('./helpers.cjs');
test('recursos essenciais estão incluídos no cache offline', () => {
  const sw = readApp('sw.js');
  const m = sw.match(/const CORE=\[([\s\S]*?)\];/);
  assert.ok(m, 'Lista CORE ausente no service worker.');
  const files = [...m[1].matchAll(/[\'"]\.\/([^\'"]+)[\'"]/g)].map(x => x[1]);
  assert.ok(files.length >= 25, 'Cache inicial inesperadamente pequeno.');
  for (const file of files) assert.ok(existsApp(file), `Recurso do cache offline ausente: ${file}`);
  assert.match(sw, /elo-official-4\.3\.27-r66/);
  assert.match(sw, /\.\/game-rework\.js/);
  assert.match(sw, /\.\/game-rework\.css/);
  assert.match(sw, /filter\(k\s*=>\s*k\s*!==\s*CACHE\)/);
  assert.match(sw, /ignoreSearch\s*:\s*true/);
  assert.match(sw, /touch-assist\.js/);
  assert.match(sw, /completion\.js/);
});
