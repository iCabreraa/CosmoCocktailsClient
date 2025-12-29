/* Minimal service worker that unregisters itself.
   We previously had SW caching issues; this ensures cleanup in production. */

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      } catch {
        // ignore cache cleanup errors
      }

      await self.clients.claim();

      try {
        const clientList = await self.clients.matchAll({ type: "window" });
        await Promise.all(clientList.map(client => client.navigate(client.url)));
      } catch {
        // ignore client refresh errors
      }

      try {
        await self.registration.unregister();
      } catch {
        // ignore unregister errors
      }
    })()
  );
});

// No fetch handler to avoid interfering with Next.js routing/SSR.
