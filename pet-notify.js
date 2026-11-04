/* pet-notify.js — lembretes do bichinho (lado da página).
   - guarda um "espelho" do estado do bichinho em IndexedDB para o service worker ler com o app fechado;
   - pede permissão (só chamado depois do PIN dos pais), registra Periodic Background Sync e, se configurado, Web Push;
   - agenda notificação por horário quando o navegador suporta (Notification Triggers). */
(function () {
  'use strict';
  var CFG_KEY = 'eloPetNotifyCfg', DB = 'elo-pet-sync';
  var DEF = { enabled: false, quietFrom: 20 * 60 + 30, quietTo: 8 * 60, minGapMin: 240, maxPerDay: 3 };
  var PC = window.ELO_PUSH_CONFIG || { serverUrl: '', vapidPublicKey: '' };
  var Core = window.EloPetCore;
  var syncTimer = null, lastServerDue = 0;

  function getCfg() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(CFG_KEY) || '{}')); } catch (_) { return Object.assign({}, DEF); } }
  function setCfg(patch) { var c = Object.assign(getCfg(), patch || {}); try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (_) {} return c; }

  function idb() { return new Promise(function (res, rej) { var r = indexedDB.open(DB, 1); r.onupgradeneeded = function () { r.result.createObjectStore('kv'); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function idbSet(k, v) { return idb().then(function (db) { return new Promise(function (res, rej) { var tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = res; tx.onerror = function () { rej(tx.error); }; }); }).catch(function () {}); }
  function idbGet(k) { return idb().then(function (db) { return new Promise(function (res, rej) { var q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }); }).catch(function () { return undefined; }); }

  function snapshot(p) {
    return { stage: p.stage, name: p.name, species: p.species, hunger: p.hunger, energy: p.energy, clean: p.clean, fun: p.fun, love: p.love, study: p.study,
      lastSeen: p.lastSeen, lightsOff: !!p.lightsOff, sleepUntil: p.sleepUntil || 0, sleepStartedAt: p.sleepStartedAt || 0, ranAway: !!p.ranAway,
      eggCare: p.eggCare || 0, lastEggCareAt: p.lastEggCareAt || 0, eggCooldownMs: 120000 };
  }
  function b64uToU8(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); var pad = '='.repeat((4 - s.length % 4) % 4), raw = atob(s + pad), a = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i); return a; }
  function swReady() { return ('serviceWorker' in navigator) ? navigator.serviceWorker.ready : Promise.reject(new Error('sem service worker')); }

  async function scheduleTrigger(due) {
    try {
      if (!('showTrigger' in Notification.prototype) || typeof TimestampTrigger === 'undefined') return;
      var reg = await swReady();
      var old = await reg.getNotifications({ tag: 'pet-scheduled', includeTriggered: true });
      old.forEach(function (n) { n.close(); });
      if (!due) return;
      await reg.showNotification(Core.TITLE, { tag: 'pet-scheduled', body: '💗 Seu bichinho quer um pouquinho de atenção!', icon: './assets/icons/icon-192.png', badge: './assets/icons/icon-192.png', data: { url: './?open=pet' }, showTrigger: new TimestampTrigger(due) });
    } catch (_) {}
  }
  async function pushServer(path, body) {
    if (!PC.serverUrl) return;
    try { await fetch(PC.serverUrl.replace(/\/$/, '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }); } catch (_) {}
  }
  async function schedulePush(due) {
    if (!PC.serverUrl || !PC.vapidPublicKey) return;
    try {
      var reg = await swReady(), sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      if (due && Math.abs(due - lastServerDue) < 10 * 60000) return;
      lastServerDue = due || 0;
      await pushServer('/subscribe', { subscription: sub.toJSON(), dueAt: due || null });
    } catch (_) {}
  }

  async function doSync(p) {
    var cfg = getCfg();
    await idbSet('settings', cfg);
    await idbSet('state', snapshot(p));
    var last = (await idbGet('last')) || {};
    if (Number(p.lastSeen) > Number(last.at || 0) && last.kind) { last = Object.assign({}, last, { kind: null }); await idbSet('last', last); }
    if (!cfg.enabled || !Core) return;
    var due = Core.nextDueAt(snapshot(p), cfg, Date.now(), last);
    scheduleTrigger(due); schedulePush(due);
  }
  function sync(p) { if (!p) return; clearTimeout(syncTimer); syncTimer = setTimeout(function () { doSync(p).catch(function () {}); }, 500); }

  async function enable() {
    if (!('Notification' in window)) return { ok: false, reason: 'unsupported' };
    var perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') return { ok: false, reason: 'denied' };
    setCfg({ enabled: true });
    var info = { ok: true, periodic: false, push: false };
    try {
      var reg = await swReady();
      if ('periodicSync' in reg) { try { await reg.periodicSync.register('elo-pet-care', { minInterval: 6 * 3600e3 }); info.periodic = true; } catch (_) {} }
      if (PC.serverUrl && PC.vapidPublicKey && 'pushManager' in reg) {
        try { var sub = await reg.pushManager.getSubscription(); if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToU8(PC.vapidPublicKey) }); info.push = !!sub; } catch (_) {}
      }
    } catch (_) {}
    await idbSet('settings', getCfg());
    return info;
  }
  async function disable() {
    setCfg({ enabled: false });
    await idbSet('settings', getCfg());
    try {
      var reg = await swReady();
      if ('periodicSync' in reg) { try { await reg.periodicSync.unregister('elo-pet-care'); } catch (_) {} }
      var sub = await reg.pushManager.getSubscription();
      if (sub) { await pushServer('/unsubscribe', { endpoint: sub.endpoint }); await sub.unsubscribe(); }
      var old = await reg.getNotifications({ tag: 'pet-scheduled', includeTriggered: true }); old.forEach(function (n) { n.close(); });
    } catch (_) {}
  }
  async function status() {
    var s = { supported: 'Notification' in window && 'serviceWorker' in navigator, permission: ('Notification' in window) ? Notification.permission : 'unsupported', enabled: getCfg().enabled,
      periodic: false, push: false, pushConfigured: !!(PC.serverUrl && PC.vapidPublicKey),
      standalone: (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true,
      ios: /iphone|ipad|ipod/i.test(navigator.userAgent) };
    try {
      var reg = await swReady();
      if ('periodicSync' in reg) { var tags = await reg.periodicSync.getTags(); s.periodic = tags.indexOf('elo-pet-care') >= 0; }
      var sub = await reg.pushManager.getSubscription(); s.push = !!sub;
    } catch (_) {}
    return s;
  }
  async function test() {
    var reg = await swReady();
    await reg.showNotification(Core ? Core.TITLE : 'Dia a Dia da Elo 🐾', { body: '🎉 Teste: os lembretes do bichinho estão funcionando!', icon: './assets/icons/icon-192.png', badge: './assets/icons/icon-192.png', tag: 'pet-test', data: { url: './?open=pet' } });
  }

  window.EloPetNotify = { getCfg: getCfg, setCfg: setCfg, enable: enable, disable: disable, status: status, test: test, sync: sync, snapshot: snapshot,
    presets: { normal: { quietFrom: 20 * 60 + 30, quietTo: 8 * 60 }, early: { quietFrom: 19 * 60, quietTo: 7 * 60 }, none: { quietFrom: 0, quietTo: 0 } } };
})();
