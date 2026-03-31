const CACHE_NAME = 'aau-elearning-v10';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

// Network first — always get fresh content, fallback to cache only for images
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin (API calls)
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // For JS/CSS/HTML — always network first, no cache
  if (url.pathname.match(/\.(js|css|html)$/)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For images — cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) =>
          cached || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
        )
      )
    );
    return;
  }

  // For everything else — network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
