'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { BASE, OVERLAY, existsApp } = require('./helpers.cjs');
test('URLs locais em CSS apontam para arquivos existentes', () => {
  const files = new Set();
  function walk(dir, prefix='') {
    for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) { if (rel !== 'tests') walk(path.join(dir,e.name),rel); }
      else if (e.name.endsWith('.css')) files.add(rel);
    }
  }
  walk(BASE); if (fs.existsSync(OVERLAY)) walk(OVERLAY);
  let refs = 0;
  for (const rel of files) {
    const file = fs.existsSync(path.join(OVERLAY,rel)) ? path.join(OVERLAY,rel) : path.join(BASE,rel);
    const css = fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
    for (const m of css.matchAll(/url\((?:['"])?([^'"\)]+)(?:['"])?\)/gi)) {
      const raw = m[1].trim();
      if (/^(?:data:|https?:|#|\/\/)/i.test(raw)) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), raw.split(/[?#]/)[0]));
      refs++;
      assert.ok(existsApp(target), `${rel}: arquivo referenciado não encontrado (${raw})`);
    }
  }
  assert.ok(refs > 0, 'Nenhuma referência local de CSS foi verificada.');
});
