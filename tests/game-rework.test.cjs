'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {readApp}=require('./helpers.cjs');
test('care, activities and expanded content are active',()=>{const j=readApp('game-rework.js'),v=readApp('VERSAO-ATUAL.txt');for(const x of ['eloCareTabs','Montar outra lancheira','Curativo de faz de conta','n<=150','QUESTIONS[level].push','song.notes='])assert.ok(j.includes(x),x);assert.match(v,/150 figurinhas/) });
