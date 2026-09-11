const CACHE='elo-v2-20260911';
const FILES=['./','./index.html','./app.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/logo-oficial.png','./assets/elo-hero.jpg','./assets/elo-card.jpg','./assets/elo-full.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
