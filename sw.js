
const CACHE = "portal-performance-v1";
const ASSETS = ["./","./index.html","./styles.css","./app.js","./data.js","./manifest.webmanifest","./icons/icon-192.svg","./icons/icon-512.svg"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
