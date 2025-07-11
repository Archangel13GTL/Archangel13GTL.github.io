// Service Worker for TeNeT X
const CACHE='tenet-x-v1.1.0';
self.addEventListener('install',evt=>{evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/assets/css/main.css','/assets/js/main.js'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',evt=>{evt.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE&&caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',evt=>{evt.respondWith(caches.match(evt.request).then(r=>r||fetch(evt.request)));});
self.addEventListener('message',evt=>{ if(evt.data==='UPDATE'){ self.skipWaiting(); }} );
