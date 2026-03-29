/* Study Buddy — minimal service worker for system notifications */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const d = event.data;
  if (d?.type === "SHOW_NOTIFICATION" && d.title) {
    event.waitUntil(
      self.registration.showNotification(d.title, {
        body: d.body || "",
        tag: d.tag || "study-buddy",
        renotify: true,
        silent: false,
      })
    );
  }
});
