const CACHE_NAME = "kickin-off-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Let all requests pass through to the network
  // Only provide offline fallback if network fails
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Kickin' Off — Offline</title>
            <style>
              body { background: #0D0D0D; color: #e5e2e1; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
              .container { text-align: center; }
              h1 { color: #00e676; font-size: 2rem; margin-bottom: 0.5rem; }
              p { color: #d4c0d7; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>YOU'RE OFFLINE</h1>
              <p>Check your connection and try again.</p>
            </div>
          </body>
          </html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      })
    );
  }
});
