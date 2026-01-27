const CACHE_NAME = 'aau-elearning-v4';
const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v4';

const STATIC_FILES = [
  '/',
  '/login',
  '/register',
  '/courses',
  '/about',
  '/contact',
  '/student-dashboard',
  '/instructor-dashboard',
  '/assets/images/aaulogo.png',
  '/assets/images/hero1.jpeg',
  '/assets/images/cbe.png',
  '/assets/images/telebirrlogo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_FILES.map(url => new Request(url, {cache: 'reload'})));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes('v4')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/');
            });
        })
    );
    return;
  }

  // Handle API requests with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline data for common endpoints
              if (url.pathname.includes('/courses')) {
                return new Response(JSON.stringify({
                  success: true,
                  courses: [],
                  message: 'Offline - No cached courses available'
                }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              if (url.pathname.includes('/profile')) {
                return new Response(JSON.stringify({
                  success: true,
                  user: { name: 'Offline User', email: 'offline@example.com' },
                  message: 'Offline mode'
                }), {
                  headers: { 'Content-Type': 'application/json' }
                });
              }
              return new Response(JSON.stringify({
                success: false,
                message: 'You are offline. Please check your connection.'
              }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Handle all other requests (CSS, JS, images)
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return a fallback for images
            if (request.destination === 'image') {
              return caches.match('/assets/images/aaulogo.png');
            }
          });
      })
  );
});