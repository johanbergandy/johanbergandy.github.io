// Fin de mois : fonctionnement sans réseau. Version 4.1.
const CACHE = "fin-de-mois-v4.1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/apple-touch-icon.png"];
const HOME = new URL("./", self.registration.scope).href;
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // La page : réseau d'abord pour recevoir les mises à jour, cache si hors connexion
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(HOME, c)); return r; }).catch(() => caches.match(HOME)));
    return;
  }
  // Le reste (icônes, polices) : cache d'abord
  if (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; })));
  }
});
