/* Minimal, safe service worker for Next.js app router
   - No runtime caching rules to avoid SSR conflicts
   - Lifecycle handling only; future caching can be added incrementally */

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// No fetch handler for now to avoid interfering with Next.js routing/SSR
