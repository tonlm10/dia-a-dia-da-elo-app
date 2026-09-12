const CACHE='elo-v8-0-20260911-puzzle';
const SHELL=[
  './', './index.html', './app.js?v=8.0', './manifest.webmanifest',
  './assets/icon-192.png','./assets/icon-512.png','./assets/logo-oficial.png',
  './assets/channel-banner-v5.webp','./assets/member-promo.webp','./assets/aventuras-icon.webp',
  './assets/stories/story1-cover.webp','./assets/stories/story2-cover.webp','./assets/stories/story3-cover.webp','./assets/stories/story4-cover.webp',
  './assets/memory/mem-01.webp','./assets/memory/mem-02.webp','./assets/memory/mem-03.webp','./assets/memory/mem-04.webp','./assets/memory/mem-05.webp','./assets/memory/mem-06.webp','./assets/memory/mem-07.webp','./assets/memory/mem-08.webp','./assets/memory/mem-09.webp','./assets/memory/mem-10.webp','./assets/memory/mem-11.webp','./assets/memory/mem-12.webp','./assets/memory/mem-13.webp','./assets/memory/mem-14.webp','./assets/memory/mem-15.webp','./assets/memory/mem-16.webp',
  './assets/coloring/color-1.webp','./assets/coloring/color-2.webp','./assets/coloring/color-3.webp','./assets/coloring/color-4.webp','./assets/coloring/color-5.webp','./assets/coloring/color-6.webp','./assets/coloring/color-7.webp','./assets/coloring/color-8.webp','./assets/coloring/color-9.webp','./assets/coloring/color-10.webp'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin) return;
  const isFresh=e.request.mode==='navigate' || /\/(index\.html|app\.js|manifest\.webmanifest)$/.test(u.pathname);
  if(isFresh){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
  }else{
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;
    })));
  }
});
