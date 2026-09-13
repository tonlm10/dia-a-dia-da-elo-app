const CACHE='elo-official-v2-1-1-20260913';
const CORE=[
  './','./index.html','./app.js?v=2.1.1','./manifest.webmanifest','./privacy.html','./terms.html','./rpg.html?v=2.0',
  './assets/logo-oficial.webp','./assets/rpg-cover-v1-5.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png','./assets/icons/icon-maskable-512.png','./assets/icons/apple-touch-icon.png'
];
const OPTIONAL=[
  './assets/channel-banner-v5.webp','./assets/member-promo.webp','./assets/aventuras-icon.webp',
  './assets/stories/story1-cover.webp','./assets/stories/story2-cover.webp','./assets/stories/story3-cover.webp','./assets/stories/story4-cover.webp',
  './assets/stories/story1.webp','./assets/stories/story2.webp','./assets/stories/story3.webp','./assets/stories/story4.webp',
  ...Array.from({length:16},(_,i)=>`./assets/memory-cards/card-${String(i+1).padStart(2,'0')}.webp`),
  ...Array.from({length:16},(_,i)=>`./assets/puzzle/puzzle-${String(i+1).padStart(2,'0')}.webp`),
  ...Array.from({length:10},(_,i)=>`./assets/coloring/color-${i+1}.webp`)
];
async function cacheIndividually(cache,urls){
  await Promise.allSettled(urls.map(async url=>{
    try{const res=await fetch(url,{cache:'reload'});if(res.ok)await cache.put(url,res.clone())}catch(_){/* one asset never blocks the whole app */}
  }));
}
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cacheIndividually(cache,CORE);await cacheIndividually(cache,OPTIONAL);await self.skipWaiting()})());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const networkFirst=event.request.mode==='navigate'||/\/(index\.html|app\.js|rpg\.html|manifest\.webmanifest|privacy\.html|terms\.html)$/.test(url.pathname);
  if(networkFirst){
    event.respondWith((async()=>{
      try{const res=await fetch(event.request,{cache:'no-store'});if(res.ok){const cache=await caches.open(CACHE);cache.put(event.request,res.clone())}return res}
      catch(_){const hit=await caches.match(event.request);if(hit)return hit;if(url.pathname.endsWith('/rpg.html')||url.pathname.endsWith('rpg.html')){const r=await caches.match('./rpg.html?v=2.0')||await caches.match('./rpg.html');if(r)return r}if(event.request.mode==='navigate')return caches.match('./index.html');return new Response('',{status:504,statusText:'Offline'})}
    })());
    return;
  }
  event.respondWith((async()=>{
    const hit=await caches.match(event.request);if(hit)return hit;
    try{const res=await fetch(event.request);if(res.ok){const cache=await caches.open(CACHE);cache.put(event.request,res.clone())}return res}
    catch(_){return new Response('',{status:504,statusText:'Offline'})}
  })());
});
