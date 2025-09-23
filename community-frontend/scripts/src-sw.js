// scripts/src-sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

// Precache static assets
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Cache API responses with different strategies
workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/') && url.origin === 'http://localhost:8080',
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        plugins: [
            {
                cacheKeyWillBeUsed: async ({ request }) => {
                    // Create consistent cache keys for API requests
                    return `${request.method}-${request.url}`;
                },
                cacheWillUpdate: async ({ response }) => {
                    // Only cache successful responses
                    return response && response.status === 200;
                },
                requestWillFetch: async ({ request }) => {
                    console.log('SW: Making API request to:', request.url);
                    return request;
                },
                fetchDidFail: async ({ originalRequest }) => {
                    console.log('SW: API request failed:', originalRequest.url);
                }
            }
        ]
    })
);

// Cache images and other assets
workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            {
                cacheKeyWillBeUsed: async ({ request }) => {
                    return request.url;
                }
            }
        ]
    })
);

// Handle navigation requests (SPA routing)
const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
const navigationRoute = new workbox.routing.NavigationRoute(handler, {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
});
workbox.routing.registerRoute(navigationRoute);

// Background sync for offline data
self.addEventListener('sync', event => {
    console.log('SW: Background sync triggered:', event.tag);
    if (event.tag === 'offline-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    try {
        // Notify the main thread to start sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                action: 'START_SYNC'
            });
        });
    } catch (error) {
        console.error('SW: Background sync failed:', error);
    }
}

// Handle messages from main thread
self.addEventListener('message', event => {
    console.log('SW: Received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'REGISTER_SYNC') {
        // Register background sync
        self.registration.sync.register('offline-sync').catch(err => {
            console.error('SW: Failed to register sync:', err);
        });
    }
});

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated.');
    event.waitUntil(self.clients.claim());
});

// Handle fetch events for better offline support
self.addEventListener('fetch', event => {
    // Let Workbox handle the routing
    return;
});