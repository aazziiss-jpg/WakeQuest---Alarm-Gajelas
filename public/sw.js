const CACHE_NAME = "wakequest-app-v1"
const AI_CACHE_NAME = "wakequest-ai-models-v1"

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/default-ringtone.mp3"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== AI_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (url.hostname === "storage.googleapis.com" && url.pathname.includes("tfjs-models")) {
    event.respondWith(
      caches.open(AI_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request)
        if (cachedResponse) return cachedResponse

        try {
          const networkResponse = await fetch(event.request)
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone())
          }
          return networkResponse
        } catch (error) {
          throw error
        }
      })
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).catch(() => caches.match("/"))
    })
  )
})