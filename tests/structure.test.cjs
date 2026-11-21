'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp, existsApp } = require('./helpers.cjs');
test('estrutura essencial e arquivos locais referenciados no HTML', async t => {
  for (const f of ['index.html','app.js','v3.js','models3d.js','home.js','sw.js','version.js','manifest.webmanifest','styles.css','pet.js','rpg.html']) {
    await t.test(`${f} existe`, () => assert.ok(existsApp(f), `Arquivo ausente: ${f}`));
  }
  const html = readApp('index.html');
  assert.match(html, /<meta[^>]+name=["']viewport/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
  const refs = [...html.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/gi)].map(m => m[1]);
  const local = refs.filter(x => !/^(?:[a-z]+:|\/\/|#|data:|javascript:)/i.test(x));
  assert.ok(local.length > 15, 'A página principal deve referenciar recursos locais suficientes.');
  for (const ref of local) {
    const rel = decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\.\//, '');
    if (!rel) continue;
    assert.ok(existsApp(rel), `Referência local sem arquivo correspondente: ${ref}`);
  }
});
