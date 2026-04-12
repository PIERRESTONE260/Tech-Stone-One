const CACHE_NAME = 'ts1-v1';
const namespace = 'Tech-Stone-One';
const description = 'Tech-Stone One est une entreprise innovante spécialisée dans la technologie et la diversité, offrant des solutions créatives pour un avenir meilleur.';
const version = '1.0.0';
const self = this;
const urlsToCache = [
    './', 
    './index.html',
    './logo.svg',
    './Tech-StoneOne.png'
];

const assets = [
    './', 
    './index.html', 
    './logo.svg',
    './Tech-StoneOne.png',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});