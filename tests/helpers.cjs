'use strict';
const fs = require('node:fs');
const path = require('node:path');
const BASE = process.env.ELO_BASE_DIR || path.resolve(__dirname, '..');
const OVERLAY = process.env.ELO_OVERLAY_DIR || BASE;
function readApp(rel) {
  const safe = rel.replace(/\\/g, '/').replace(/^\/+/, '');
  const patched = path.join(OVERLAY, safe);
  const original = path.join(BASE, safe);
  return fs.readFileSync(fs.existsSync(patched) ? patched : original, 'utf8');
}
function existsApp(rel) { return fs.existsSync(path.join(OVERLAY, rel)) || fs.existsSync(path.join(BASE, rel)); }
function appFiles(dir) {
  const out = [];
  function walk(root, prefix) {
    for (const e of fs.readdirSync(root, { withFileTypes: true })) {
      const r = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(root, e.name), r); else out.push(r);
    }
  }
  walk(BASE, '');
  const map = new Map(out.map(x => [x, true]));
  function walkOverlay(root, prefix) {
    for (const e of fs.readdirSync(root, { withFileTypes: true })) {
      const r = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walkOverlay(path.join(root, e.name), r); else map.set(r, true);
    }
  }
  if (fs.existsSync(OVERLAY)) walkOverlay(OVERLAY, '');
  return [...map.keys()].filter(x => !x.startsWith('tests/'));
}
module.exports = { BASE, OVERLAY, readApp, existsApp, appFiles };
