'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../pet-core.js');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('o bichinho não desaparece nem acumula necessidades durante ausências', () => {
  const now = Date.UTC(2026, 10, 20);
  const pet = { stage: 'baby', lastSeen: now - 30 * 86400000, hunger: 80, energy: 80, clean: 80, fun: 80, love: 80, study: 80 };
  const state = Core.estimate(pet, now);
  assert.notEqual(state.ranAway, true);
  assert.ok(state.hunger >= 77, 'o desgaste ao voltar de uma pausa deve ser suave e limitado');
  assert.equal(pet.hunger, 80, 'a estimativa não pode alterar o estado original');
});

test('o vídeo fica sem recompensa, com navegação externa bloqueada no iframe', () => {
  const completion = read('completion.js');
  assert.ok(completion.includes('grantVideoReward = function () { showToast'));
  assert.match(completion, /allow-scripts allow-same-origin allow-presentation/);
  assert.ok(!completion.includes('grantVideoReward = function () { addStars('));
});

test('o aplicativo só fica disponível em paisagem', () => {
  const css = read('completion.css');
  assert.match(css, /orientation:portrait/);
  assert.match(css, /#mandatoryLandscapeBlocker\s*\{[^}]*display:flex\s*!important/s);
  assert.match(css, /#appContainer\s*\{[^}]*display:none\s*!important/s);
  assert.equal(JSON.parse(read('manifest.webmanifest')).orientation, 'landscape');
  assert.ok(read('completion.js').includes('game-experience.js?v=4.3.27'));
});
