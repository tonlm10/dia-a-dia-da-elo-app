'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readApp } = require('./helpers.cjs');
function loadModels() {
  let reads = 0;
  const window = { addEventListener(){} };
  const sandbox = {
    window,
    document: { getElementById(){return null;}, querySelectorAll(){return [];} },
    requestAnimationFrame(){return 1;}, cancelAnimationFrame(){},
    __ELO_TEST__: true,
    FileReader: class { readAsText(file){ reads++; this.onload({target:{result:file.contents}}); } }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(readApp('models3d.js'), sandbox, {filename:'models3d.js'});
  return {sandbox,window,getReads:()=>reads};
}
test('importação 3D valida formatos, limites e exige autorização parental', async t => {
  const {sandbox,window,getReads} = loadModels();
  const api = sandbox.__ELO_MODEL_TEST_API__;
  assert.ok(api, 'API de teste isolada não foi habilitada.');
  await t.test('OBJ simples importado e normalizado', () => {
    const m=api.parseObjModel('v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3','triangulo.obj');
    assert.equal(m.vertices.length,3); assert.equal(m.faces.length,1); assert.equal(m.name,'custom');
  });
  await t.test('índices OBJ negativos e coordenadas com textura', () => {
    const m=api.parseObjModel('v 0 0 0\nv 2 0 0\nv 0 2 0\nf -3/1/1 -2/2/2 -1/3/3','neg.obj');
    assert.deepEqual(Array.from(m.faces[0].indices),[0,1,2]);
  });
  await t.test('OBJ rejeita coordenada inválida', () => assert.throws(()=>api.parseObjModel('v NaN 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3','x.obj')));
  await t.test('OBJ rejeita arquivo sem face válida', () => assert.throws(()=>api.parseObjModel('v 0 0 0\nv 1 0 0\nv 0 1 0','x.obj')));
  await t.test('JSON válido mantém geometria e título', () => {
    const m=api.parseJsonModel(JSON.stringify({title:'Triângulo',vertices:[[0,0,0],[1,0,0],[0,1,0]],faces:[[0,1,2]]}));
    assert.equal(m.title,'Triângulo'); assert.equal(m.faces.length,1);
  });
  await t.test('JSON malformado é rejeitado', () => assert.throws(()=>api.parseJsonModel('{')));
  await t.test('JSON com vértice não finito é rejeitado', () => assert.throws(()=>api.parseJsonModel(JSON.stringify({vertices:[[0,0,0],[1,0,0],[0,'x',0]],faces:[[0,1,2]]}))));
  await t.test('cores inválidas são substituídas por cor segura', () => {
    const m=api.parseJsonModel(JSON.stringify({vertices:[[0,0,0],[1,0,0],[0,1,0]],faces:[{indices:[0,1,2],color:'url(javascript:alert(1))'}]}));
    assert.equal(m.faces[0].color,'#f472b6');
  });
  await t.test('arquivo maior que 8 MB não é lido', () => {
    let message=''; sandbox.toast=x=>message=x; sandbox.requestParentAccess=cb=>cb();
    const input={files:[{name:'grande.obj',size:8*1024*1024+1}],value:'x'};
    window.importCustomModelFile(input); assert.equal(input.value,''); assert.match(message,/8 MB/); assert.equal(getReads(),0);
  });
  await t.test('sem PIN parental não há leitura do arquivo', () => {
    const input={files:[{name:'triangulo.obj',size:20,contents:'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3'}],value:'selecionado'};
    sandbox.requestParentAccess=(cb,msg)=>{sandbox.pending=cb;sandbox.pinMessage=msg;};
    window.importCustomModelFile(input); assert.equal(getReads(),0); assert.match(sandbox.pinMessage,/PIN/);
    sandbox.pending(); assert.equal(getReads(),1); assert.equal(input.value,'');
  });
  await t.test('sem mecanismo parental, falha fechada', () => {
    delete sandbox.requestParentAccess;
    let message=''; sandbox.toast=x=>message=x;
    const input={files:[{name:'x.obj',size:10,contents:''}],value:'x'};
    window.importCustomModelFile(input); assert.equal(getReads(),1); assert.equal(input.value,''); assert.match(message,/PIN|responsáveis/i);
  });
});
