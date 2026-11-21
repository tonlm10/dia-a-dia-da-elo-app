'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../touch-assist.js');
function button(left,top,width,height,extra={}) {
  return {left,top,width,height,right:left+width,bottom:top+height,...extra,
    matches(sel){return sel.includes('button') || sel.includes('[role="button"]');},
    getAttribute(name){return this[name] ?? null;}, getBoundingClientRect(){return this;},
    click(){this.clicks=(this.clicks||0)+1;}, closest(){return null;}};
}
function docFor(items){return {items,querySelectorAll(){return items;},listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}};}
test('alvos próximos podem ser ativados dentro da área acessível de 44 px', () => {
  const b=button(50,50,20,20), doc=docFor([b]);
  assert.equal(api.findNearestInteractive(doc,39,60),b);
  assert.equal(api.findNearestInteractive(doc,39,39),b);
  assert.equal(api.findNearestInteractive(doc,25,60),null);
});
test('alvo mais próximo vence e controles inativos são ignorados', () => {
  const a=button(40,40,20,20), b=button(72,40,20,20), disabled=button(40,40,20,20,{disabled:true});
  assert.equal(api.findNearestInteractive(docFor([a,b,disabled]),75,50),b);
  const hidden=button(40,40,20,20,{hidden:true});
  assert.equal(api.findNearestInteractive(docFor([hidden]),50,50),null);
});
test('toque simples fora do botão aciona uma vez; arrasto não aciona', () => {
  const b=button(50,50,20,20), doc=docFor([b]); api.install(doc);
  const event=(x,y)=>({isPrimary:true,pointerType:'touch',pointerId:1,clientX:x,clientY:y,target:{closest(){return null;}}});
  doc.listeners.pointerdown(event(40,60)); doc.listeners.pointerup(event(40,60)); assert.equal(b.clicks,1);
  doc.listeners.pointerdown(event(40,60)); doc.listeners.pointerup(event(70,60)); assert.equal(b.clicks,1);
});
test('toque iniciado em outro controle não é redirecionado e install é idempotente', () => {
  const b=button(50,50,20,20), doc=docFor([b]);
  assert.equal(api.install(doc),true); assert.equal(api.install(doc),false);
  const nested={closest(){return b;}};
  const e={isPrimary:true,pointerType:'touch',pointerId:1,clientX:55,clientY:55,target:nested};
  doc.listeners.pointerdown(e); doc.listeners.pointerup(e); assert.equal(b.clicks||0,0);
});
