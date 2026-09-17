// ============================================================
// service-worker.js
// Cache básico del shell estático (cache-first). Firebase/Google
// y Chart.js (CDN) siempre van a red directa: son SDKs que deben
// estar al día y no tiene sentido cachearlos aquí.
//
// Sube CACHE_VERSION cada vez que cambies archivos base (css/js
// del shell) para forzar la actualización en los teléfonos ya
// instalados.
// ============================================================

const CACHE_VERSION = "medicar-v4";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/landing.css",
  "./css/login.css",
  "./css/app.css",
  "./css/dashboard.css",
  "./css/tables.css",
  "./css/demo-tour.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/router.js",
  "./js/state.js",
  "./js/firebase-config.js",
  "./js/data/firestore-repo.js",
  "./js/data/demo-repo.js",
  "./js/data/demo-data.js",
  "./js/utils/format.js",
  "./js/utils/icons.js",
  "./js/utils/modal.js",
  "./js/utils/toast.js",
  "./js/utils/xlsx-export.js",
  "./js/utils/theme.js",
  "./js/modules/dashboard.js",
  "./js/modules/ingresos.js",
  "./js/modules/egresos.js",
  "./js/modules/demo-tour.js",
  "./assets/logo-mark.png",
  "./assets/code-reset-badge.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  // No cachear Firebase/Google ni Chart.js — siempre red directa.
  if (url.includes("firebase") || url.includes("googleapis") || url.includes("gstatic") || url.includes("jsdelivr")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
