'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp } = require('./helpers.cjs');
test('versão exibida, cache e recursos estão sincronizados', () => {
  const version = readApp('version.js');
  const sw = readApp('sw.js');
  const html = readApp('index.html');
  const completion = readApp('completion.js');
  assert.match(version, /ELO_APP_VERSION\s*=\s*['"]4.3.28['"]/);
  assert.match(sw, /elo-official-4.3.28-r67/);
  assert.match(completion, /game-experience\.js\?v=4.3.28/);
  assert.match(completion, /game-experience\.css\?v=4.3.28/);
  assert.match(completion, /game-rework\.js\?v=4.3.28/);
  assert.match(completion, /game-rework\.css\?v=4.3.28/);
  assert.doesNotMatch(html, /\?v=4\.3\.20/);
  assert.match(html, /data-app-version/);
  assert.match(sw, /touch-assist\.js/);
});
