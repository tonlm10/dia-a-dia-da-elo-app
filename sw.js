importScripts('./version.js');
const APP_VERSION=self.ELO_APP_VERSION||'4.3.13';
const CACHE=`elo-official-4.3.13-r51`;
const CORE=['./','./index.html','./version.js','./styles.css','./v3.css','./polish.css','./games-v350.css','./landscape.css','./models3d.js','./app.js','./v3.js','./pet.js','./manifest.webmanifest','./privacy.html','./terms.html','./rpg.html','./assets/rpg-cover-v1-5.png','./assets/logo-oficial.webp','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/icon-maskable-192.png','./assets/icons/icon-maskable-512.png','./assets/icons/apple-touch-icon.png','./assets/audio/elo-intro.m4a','./assets/game-ui/unicorn.svg','./assets/game-ui/ghost.svg'];
async function addSafe(cache,urls){await Promise.allSettled(urls.map(async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok)await cache.put(u,r.clone())}catch(_){}}))}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await addSafe(c,CORE);await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===self.location.origin&&(u.pathname.endsWith('/index.html')||u.pathname===self.location.pathname||u.pathname.endsWith('/'))){
    e.respondWith((async()=>{
      try{
        const nr=await fetch(e.request,{cache:'reload'});
        if(nr.ok){const c=await caches.open(CACHE);await c.put(e.request,nr.clone());return nr;}
      }catch(_){}
      const cr=await caches.match(e.request);
      return cr||fetch(e.request);
    })());
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{if(res.ok&&e.request.url.startsWith('http')&&!e.request.url.includes('youtube.com')&&!e.request.url.includes('ytimg.com')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>cached)));
});
