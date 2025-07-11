// sw.js - Service Worker for TENET Tech PWA

const CACHE_NAME = 'tenet-tech-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-144.png',
  // Add app subpages if needed, e.g., '/apps/shed-layout-designer/index.html'
];

// Install event: Cache files on first load
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => console.error('Caching failed:', error))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Take control of pages immediately
});

// Fetch event: Serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(() => {
            return new Response('You are offline. Please check your connection.', {
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Push notifications (optional, customize as needed)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'New Notification', body: 'You have a new message.' };
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-144.png'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event (optional, customize as needed)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// Background sync (optional, customize as needed)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tenet-tech') {
    event.waitUntil(console.log('Background sync triggered for TENET Tech'));
  }
});

// Periodic sync (optional, customize as needed)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-sync-tenet-tech') {
    event.waitUntil(console.log('Periodic sync triggered for TENET Tech'));
  }
});

// Handle messages from clients (optional, customize as needed)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // Activate new service worker immediately
  }
});

// Logging for debugging (optional, remove in production)
self.addEventListener('install', () => console.log('Service Worker installed'));
self.addEventListener('activate', () => console.log('Service Worker activated'));
self.addEventListener('fetch', event => console.log(`Fetch request for: ${event.request.url}`));
self.addEventListener('push', event => console.log('Push notification received:', event));
self.addEventListener('notificationclick', event => console.log('Notification clicked:', event.notification));
self.addEventListener('sync', event => console.log('Background sync event:', event.tag));
self.addEventListener('periodicsync', event => console.log('Periodic sync event:', event.tag));
self.addEventListener('message', event => console.log('Message received from client:', event.data));
self.addEventListener('error', event => console.error('Service Worker error:', event));
self.addEventListener('updatefound', () => console.log('Service Worker update found'));
self.addEventListener('statechange', event => console.log(`Service Worker state changed to: ${event.target.state}`));
// End of sw.js
// This service worker caches essential files, handles offline scenarios, and supports push notifications and background sync for TENET Tech's PWA.
// Customize the caching strategy, URLs, and features as needed. Update CACHE_NAME when cached files change.
// For production, consider advanced caching, error handling, and performance optimizations.
// Always test the service worker thoroughly in different scenarios to confirm its functionality.
//
// Useful documentation:
// - Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
// - Service worker lifecycle & registration: https://web.dev/service-worker-lifecycle/ , https://web.dev/using-service-worker-registration/
// - Caching strategies: https://web.dev/service-worker-caching-strategies/
// - Push notifications: https://web.dev/push-notifications-overview/ , https://web.dev/service-worker-push-notifications/ , https://web.dev/service-worker-notifications/
// - Background sync: https://web.dev/background-sync-overview/ , https://web.dev/service-worker-background-sync/ , https://web.dev/service-worker-periodic-sync/