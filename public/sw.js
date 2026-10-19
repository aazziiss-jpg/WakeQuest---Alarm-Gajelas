const CACHE_NAME = "wakequest-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("WakeQuest Offline. Sambungkan ke internet untuk sinkronisasi, alarm lokal tetap berjalan.", {
        status: 503,
        headers: { "Content-Type": "text/plain" }
      })
    })
  )
})