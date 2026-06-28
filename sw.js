const CACHE="sheipados-v10";
const ASSETS=["./","./index.html","./styles.css","./app.js","./data.js","./manifest.webmanifest","./apple-touch-icon.png","./icons/apple-touch-icon.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./favicon.ico"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.openWindow("./index.html#train"))});
