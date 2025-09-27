// scripts/src-sw.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://api.sugiramwana.rw',
    new workbox.strategies.CacheFirst()
);
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