const V='rs-v3';
const CORE=['./','manifest.json','icon-192.png','icon-512.png'];
const LIBS=[
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap'
];
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    await c.addAll(CORE).catch(()=>{});
    await Promise.allSettled(LIBS.map(u=>{const r=new Request(u,{mode:'no-cors'});return fetch(r).then(x=>c.put(r,x))}));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const rq=e.request;
  if(rq.method!=='GET'||!/^https?:/.test(rq.url))return;
  e.respondWith(caches.match(rq).then(hit=>{
    const net=fetch(rq).then(r=>{
      if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(V).then(x=>x.put(rq,c))}
      return r;
    }).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return net.then(r=>r||caches.match('./'));
  }));
});
