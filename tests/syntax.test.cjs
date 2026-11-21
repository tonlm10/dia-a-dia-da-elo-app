'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { BASE, OVERLAY } = require('./helpers.cjs');
const fs = require('node:fs');
const path = require('node:path');
test('arquivos JavaScript do app passam na verificação de sintaxe', t => {
  const files = [];
  function walk(dir, prefix='') {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) { if (rel !== 'tests' && rel !== '.github') walk(path.join(dir,e.name),rel); }
      else if (e.name.endsWith('.js')) files.push(rel);
    }
  }
  walk(BASE);
  if (fs.existsSync(OVERLAY)) walk(OVERLAY);
  const unique = [...new Set(files)];
  assert.ok(unique.length >= 10, 'Poucos arquivos JavaScript para uma validação completa.');
  for (const rel of unique) {
    const full = fs.existsSync(path.join(OVERLAY,rel)) ? path.join(OVERLAY,rel) : path.join(BASE,rel);
    const r = spawnSync(process.execPath, ['--check', full], { encoding:'utf8' });
    assert.equal(r.status, 0, `${rel}: ${r.stderr || r.stdout}`);
  }
});
