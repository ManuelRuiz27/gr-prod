// Plataforma GR — Progressive Web App Service Worker
const CACHE_NAME = 'gr-pwa-v1.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// Install: Cache critical App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Silently continue if some assets fail during precache (e.g. in dev)
        console.warn('[PWA SW] Precache warning:', err);
      })
  );
});

// Activate: Clean outdated caches & take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Responsive caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (HTML SPA Shell) -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          // Fallback to the SPA root index.html for client-side routing
          const shellResponse = await caches.match('/index.html');
          if (shellResponse) return shellResponse;
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Google Fonts & Static CDN assets -> Cache First with Network Fallback
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Static App Assets (JS, CSS, Images, Icons) -> Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|json)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. All other GET requests -> Network with fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Support manual skip-waiting on update prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
