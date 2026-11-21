importScripts('./version.js','./pet-core.js','./offline-manifest.js');
const APP_VERSION=self.ELO_APP_VERSION||'4.3.25';
const CACHE='elo-official-4.3.25-r64';
const CORE=['./','./index.html','./version.js','./styles.css','./v3.css','./polish.css','./games-v350.css','./landscape.css','./pet.css','./home.css','./home.js','./touch-assist.js','./completion.js','./completion.css','./game-experience.js','./game-experience.css','./game-rework.js','./game-rework.css','./offline-manifest.js','./assets/fonts/Fredoka-Variable.ttf','./assets/fonts/Quicksand-Variable.ttf','./assets/fonts/Fredoka-OFL.txt','./assets/fonts/Quicksand-OFL.txt','./fonts.css','./safety.js','./legal-config.js','./privacy.html','./terms.html','./models3d.js','./app.js','./v3.js','./pet-core.js','./push-config.js','./pet-notify.js','./pet.js','./manifest.webmanifest','./privacy.html','./terms.html','./rpg.html','./assets/rpg-cover-v1-5.webp','./assets/logo-oficial.webp','./assets/icons/icon-192.png','./assets/icons/icon-maskable-192.png','./assets/icons/apple-touch-icon.png','./assets/audio/elo-intro.m4a','./assets/game-ui/unicorn.svg','./assets/game-ui/ghost.svg'];
async function addSafe(cache,urls){await Promise.allSettled(urls.map(async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok)await cache.put(u,r.clone())}catch(_){}}))}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await addSafe(c,CORE);await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const ks=await caches.keys();await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim()})()));
self.addEventListener('message',e=>{
  if(e.data?.type!=='ELO_PREPARE_OFFLINE')return;
  e.waitUntil((async()=>{
    const cache=await caches.open(CACHE), files=Array.isArray(self.ELO_OFFLINE_FILES)?self.ELO_OFFLINE_FILES:[];
    let done=0,saved=0,failed=0,next=0;
    const source=e.source;
    const report=(type)=>{try{source?.postMessage({type,done,total:files.length,saved,failed})}catch(_){}};
    const worker=async()=>{while(true){const i=next++;if(i>=files.length)return;const url=new URL(files[i],self.registration.scope).href;try{const response=await fetch(url,{cache:'reload'});if(response.ok&&response.type!=='opaque'){await cache.put(url,response.clone());saved++}else failed++}catch(_){failed++}done++;if(done%6===0||done===files.length)report('ELO_OFFLINE_PROGRESS')}};
    await Promise.all(Array.from({length:Math.min(6,files.length)},worker));
    report('ELO_OFFLINE_DONE');
  })());
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===self.location.origin&&(u.pathname.endsWith('/index.html')||u.pathname===self.location.pathname||u.pathname.endsWith('/'))){
    e.respondWith((async()=>{
      try{
        const nr=await fetch(e.request,{cache:'reload'});
        if(nr.ok){const c=await caches.open(CACHE);await c.put(e.request,nr.clone());return nr;}
      }catch(_){}
      const cr=await caches.match(e.request,{ignoreSearch:true});
      return cr||fetch(e.request);
    })());
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(cached=>cached||fetch(e.request).then(res=>{if(res.ok&&e.request.url.startsWith('http')&&!e.request.url.includes('youtube.com')&&!e.request.url.includes('ytimg.com')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>cached)));
});

/* ===== Lembretes do bichinho (funcionam com o app fechado) ===== */
const PET_DB='elo-pet-sync';
function idbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open(PET_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function idbGet(k){try{const db=await idbOpen();return await new Promise((res,rej)=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}catch(_){return undefined}}
async function idbSet(k,v){try{const db=await idbOpen();await new Promise((res,rej)=>{const tx=db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(_){}}
async function appVisible(){const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});return cs.some(c=>c.visibilityState==='visible')}
async function petCheckAndNotify(force){
  const st=await idbGet('state'),cfg=await idbGet('settings'),last=(await idbGet('last'))||{};
  if(!st||!cfg||!cfg.enabled)return false;
  if(!force&&await appVisible())return false;
  const now=Date.now(),Core=self.EloPetCore;
  let r=Core.computeReminder(st,cfg,now,last);
  if(!r&&force)r={kind:'ping',tag:'pet-ping',title:Core.TITLE,body:`💗 ${st.name||'Seu bichinho'} mandou um oi! Venha ver como ele está.`};
  if(!r)return false;
  await self.registration.showNotification(r.title,{body:r.body,icon:'./assets/icons/icon-192.png',badge:'./assets/icons/icon-192.png',tag:r.tag,renotify:false,data:{url:'./?open=pet'},vibrate:[120,60,120]});
  const today=Core.dayKey(now);
  await idbSet('last',{at:now,kind:r.kind,day:today,count:(last.day===today?Number(last.count||0):0)+1});
  return true;
}
self.addEventListener('periodicsync',e=>{if(e.tag==='elo-pet-care')e.waitUntil(petCheckAndNotify(false))});
self.addEventListener('push',e=>e.waitUntil((async()=>{
  const shown=await petCheckAndNotify(true);
  if(!shown)await self.registration.showNotification(self.EloPetCore.TITLE,{body:'💗 Seu bichinho mandou um oi!',icon:'./assets/icons/icon-192.png',tag:'pet-ping',data:{url:'./?open=pet'}});
})()));
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'./?open=pet';
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of cs){try{if('focus' in c)await c.focus()}catch(_){}try{c.postMessage({type:'open-pet'})}catch(_){}return}
    return self.clients.openWindow(url);
  })());
});
