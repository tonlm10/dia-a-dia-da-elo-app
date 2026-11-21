'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readApp } = require('./helpers.cjs');
test('configuração preserva a operação local e sem rastreadores', () => {
  const html = readApp('index.html');
  const sw = readApp('sw.js');
  const legal = readApp('legal-config.js');
  assert.doesNotMatch(html, /googletagmanager|google-analytics|cloudflareinsights|static\.cloudflareinsights/i);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/i);
  assert.match(html, /Content-Security-Policy/i);
  assert.match(html, /localStorage/);
  assert.match(legal, /ELO_LEGAL/);
  assert.doesNotMatch(sw, /youtube\.com[^\n]*showNotification/i);
});
