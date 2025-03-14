// This service worker can be customized
// See https://developers.google.com/web/tools/workbox/modules

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('static-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/dashboard',
          '/login',
          '/offline',
          '/manifest.json',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png',
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
      return;
    }
    
    // For HTML requests, try the network first, fall back to cache, then offline page
    if (request.headers.get('Accept').includes('text/html')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache a copy of the response
            const copy = response.clone();
            caches.open('static-v1').then((cache) => {
              cache.put(request, copy);
            });
            return response;
          })
          .catch(() => {
            // If network fails, try to return request from cache
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If cache fails, return the offline page for HTML requests
              if (request.headers.get('Accept').includes('text/html')) {
                return caches.match('/offline');
              }
              return new Response('Network error', { status: 408 });
            });
          })
      );
      return;
    }
    
    // For non-HTML requests, try the cache first, fall back to network
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          // Cache only successful responses
          if (response.ok) {
            const copy = response.clone();
            caches.open('static-v1').then((cache) => {
              cache.put(request, copy);
            });
          }
          return response;
        });
      })
    );
  });
  
  // Handle offline page
  self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['static-v1'];
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });