const CACHE="sheipados-v22";
const ASSETS=["./","./index.html","./styles.css","./app.js","./data.js","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./favicon.ico","./icons/apple-touch-icon.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request).then(r=>{const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});return r}).catch(()=>caches.match(e.request)))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.openWindow("./index.html#train"))});
