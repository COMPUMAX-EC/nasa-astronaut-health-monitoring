// Service worker: la app debe funcionar sin conexión (en Marte no hay internet).
// Estrategia: guarda en caché todo lo que se pide del mismo origen y lo sirve
// desde la caché si la red no responde.
// La versión y la lista de archivos las rellena vite.config.js en cada compilación.
const CACHE = "laica-__VERSION__";
const BASE = ["./", "./manifest.webmanifest", "./icon.svg", ...__ARCHIVOS__];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === "navigate") return cache.match("./index.html");
        throw new Error("Sin conexión y sin copia en caché: " + req.url);
      }
    })
  );
});
