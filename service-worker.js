// Glengala Fresh - Service Worker for PWA
// Provides offline support and live price updates

const CACHE_NAME = 'glengala-v5';
const API_CACHE = 'glengala-api-v5';

// Files to cache for offline use - critical assets only
const STATIC_ASSETS = [
  '/shop.html',
  '/admin.html',
  '/shop-styles.css',
  '/checkout-styles.css',
  '/admin.css',
  '/admin-styles.css',
  '/products-data.js',
  '/shop-functions-enhanced.js',
  '/checkout-system.js',
  '/live-pricing.js',
  '/admin.js',
  '/translations.js',
  '/manifest.json',
  '/onboarding.js',
  '/onboarding-styles.css',
  '/rewards-system.js',
  '/gamification.js',
  '/gamification-styles.css',
  '/in-app-notifications.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-first strategy for API, cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache GET requests
          if (request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            // Return offline response
            return new Response(JSON.stringify({
              error: 'Offline',
              message: 'You are currently offline. Prices may not be up to date.'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fallback to network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Return cached version and update in background
        fetch(request).then(response => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response);
          });
        }).catch(() => {});
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request).then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for price updates
self.addEventListener('sync', event => {
  if (event.tag === 'sync-prices') {
    event.waitUntil(syncPrices());
  }
});

async function syncPrices() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    
    // Broadcast to all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'PRICES_UPDATED',
        data: data
      });
    });
  } catch (error) {
    console.error('Price sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Check out today\'s fresh specials!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/shop.html',
    actions: [
      { action: 'view', title: 'View Specials' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Glengala Fresh', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Periodic background sync for price updates (requires permission)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-prices') {
    event.waitUntil(syncPrices());
  }
});
