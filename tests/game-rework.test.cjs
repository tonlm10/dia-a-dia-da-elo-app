'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp } = require('./helpers.cjs');

test('cuidados foram reformulados e a lancheira tem fluxo de reinício', () => {
  const js = readApp('game-rework.js');
  assert.match(js, /Conferir meu sorriso/);
  assert.match(js, /eloTooth/);
  assert.match(js, /Curativo de faz de conta/);
  assert.match(js, /eloLunchFinish/);
  assert.match(js, /Montar outra lancheira/);
  assert.match(js, /lunchboxItems\.extra/);
  assert.match(js, /Cantinho dos Cuidados/);
  assert.match(js, /careTitle\.textContent='Cantinho dos Cuidados/);
  assert.match(readApp('home.js'), /Cantinho dos Cuidados/);
  assert.doesNotMatch(readApp('home.js'), /Consultório da Elo/);
  assert.match(js, /extra:\s*\[\['🧀','Queijinho'\]/);
});

test('os jogos, controles e cinema usam uma tela fixa e prateleiras acessíveis', () => {
  const css = readApp('game-rework.css');
  assert.match(css, /#gameModal\s*\{[^}]*overflow:hidden/s);
  assert.match(css, /#gameModal \.gameSection\.active\s*\{[^}]*overflow:hidden/s);
  assert.match(css, /#watchPanel\{[^}]*overflow-y:auto/s);
  assert.match(css, /touch-action:pan-x/);
  assert.match(css, /#memoryGame/);
  assert.match(css, /#trailGame/);
  assert.match(css, /#unicornChaseGame/);
});

test('perguntas, inglês, sons, músicas, paletas e figurinhas foram ampliados', () => {
  const js = readApp('game-rework.js');
  assert.match(js, /SCHOOL_KID_SETS,\s*\{/);
  assert.match(js, /SCHOOL_TRACK_DATA\[track\]\.push/);
  assert.match(js, /QUESTIONS\[level\]\.push/);
  assert.match(js, /ENGLISH_WORLDS\[world\]\.items\.push/);
  assert.match(js, /STICKER_COLLECTION_DATA\.push/);
  assert.match(js, /n<=150/);
  assert.match(js, /playDJPad = async function/);
  assert.match(js, /song\.notes=\[/);
  assert.match(js, /eloPianoLock/);
});

test('recursos atualizados estão incluídos no cache e no uso offline', () => {
  assert.match(readApp('version.js'), /4\.3\.27/);
  assert.match(readApp('sw.js'), /elo-official-4\.3\.27-r66/);
  assert.match(readApp('offline-manifest.js'), /\.\/game-rework\.js/);
  assert.match(readApp('VERSAO-ATUAL.txt'), /150 figurinhas/);
});
