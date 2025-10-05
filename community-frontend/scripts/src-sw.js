// scripts/src-sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Note: API caching is handled by IndexedDB through the offline storage layer
// Service worker only handles static assets (JS, CSS, HTML, images)
// This prevents conflicts and allows the offline API layer to control caching logic

const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
const navigationRoute = new workbox.routing.NavigationRoute(handler);
workbox.routing.registerRoute(navigationRoute);
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    console.log('Service Worker activated.');
    event.waitUntil(self.clients.claim());
});