'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readApp}=require('./helpers.cjs');
test('4.3.28 loads the previously prepared game work and fixed-screen layer',()=>{
 const html=readApp('index.html');
 for(const f of ['game-experience.css','game-rework.css','elo-layout-v4.3.28.css']) assert.ok(html.includes(f),`missing stylesheet ${f}`);
 for(const f of ['game-experience.js','game-rework.js','elo-layout-v4.3.28.js']) assert.ok(html.includes(f),`missing script ${f}`);
 assert.match(readApp('version.js'),/4\.3\.28/);assert.match(readApp('sw.js'),/elo-official-4\.3\.28-r67/);
});
test('family card, memory sizing, touch painting and trail avatar fixes are present',()=>{
 const js=readApp('elo-layout-v4.3.28.js');
 for(const p of ['data-family-launch','--memory-columns','startTapGame','painted','drawPlayerElo']) assert.ok(js.includes(p),`missing fix ${p}`);
 const css=readApp('elo-layout-v4.3.28.css');
 for(const p of ['#wardrobePanel .wardrobeLayoutLandscape','#roomPanel .roomLayoutLandscape','#schoolMusicCard .pianoKeysRow','#mazeGame .mazeBoard','#unicornChaseGame .chaseBoard','#memoryGame #memory.hard','#tapGameSection #tapGame','#puzzleGame #puzzleBoard','#trailGame .trailCanvasWrap','#watchPanel.active','#createPanel.active','#familyPanel.active']) assert.ok(css.includes(p),`missing layout ${p}`);
});
