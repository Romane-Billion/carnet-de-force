// Garde l'appli en cache pour qu'elle s'ouvre sans réseau à la salle.
const CACHE = 'carnet-v1';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/data.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', "img/abduc-0.jpg","img/abduc-1.jpg","img/dc-0.jpg","img/dc-1.jpg","img/dips-0.jpg","img/dips-1.jpg","img/ext45-0.jpg","img/ext45-1.jpg","img/fentes-0.jpg","img/fentes-1.jpg","img/kickback-0.jpg","img/kickback-1.jpg","img/negatives-0.jpg","img/negatives-1.jpg","img/presse-0.jpg","img/presse-1.jpg","img/releves-0.jpg","img/releves-1.jpg","img/sdt-0.jpg","img/sdt-1.jpg","img/tirage-0.jpg","img/tirage-1.jpg","img/traction-0.jpg","img/traction-1.jpg"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour recevoir les mises à jour), cache si pas de réseau.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
