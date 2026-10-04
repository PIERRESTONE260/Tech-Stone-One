const CACHE_NAME = 'ts1-v5';
const RUNTIME_CACHE = 'ts1-runtime-v5';

const ICON_ASSETS = [
    './logo.svg',
    './Tech-StoneOne.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './icons/apple-touch-icon.png'
];

const CORE_ASSETS = [
    './',
    './index.html',
    './membre.html',
    './admin.html',
    './ts1-core.js',
    './ts1-ui.css',
    './manifest.json'
];

const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

const NETWORK_FIRST = /\.(js|css)$/;

function cacheOne(cache, url) {
    return fetch(url, { cache: 'reload' })
        .then(res => {
            if (res && (res.ok || res.type === 'opaque')) return cache.put(url, res);
        })
        .catch(() => {});
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(
                [...ICON_ASSETS, ...CORE_ASSETS, ...EXTERNAL_ASSETS].map(url => cacheOne(cache, url))
            ))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

function networkFirst(request, cacheName) {
    return fetch(request)
        .then(res => {
            if (res && res.ok) {
                const copy = res.clone();
                caches.open(cacheName).then(cache => cache.put(request, copy));
            }
            return res;
        })
        .catch(() => caches.match(request));
}

function staleWhileRevalidate(request, cacheName) {
    return caches.open(cacheName).then(cache =>
        cache.match(request).then(cached => {
            const network = fetch(request)
                .then(res => {
                    if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
                    return res;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin === self.location.origin && url.searchParams.has('_')) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() =>
                    caches.match(request)
                        .then(cached => cached || caches.match('./index.html'))
                )
        );
        return;
    }

    if (url.origin === self.location.origin) {
        if (NETWORK_FIRST.test(url.pathname)) {
            event.respondWith(networkFirst(request, RUNTIME_CACHE));
            return;
        }
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
        return;
    }

    if (
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com' ||
        url.hostname === 'cdnjs.cloudflare.com'
    ) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    }
});