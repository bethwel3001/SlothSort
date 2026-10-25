// Unregisters any zombie service workers from previous projects on localhost:3000
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients ? self.clients.claim() : Promise.resolve();
    })
  );
});
