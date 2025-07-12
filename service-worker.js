// service-worker.js

// Nome della cache e versione
const CACHE_NAME = 'tank-configurator-cache-v1';

// Risorse da mettere in cache all'installazione
const urlsToCache = [
  './', // La root della tua applicazione (index.html)
  './index.html',
  './style.css', // Se hai un file CSS esterno, altrimenti è già inline
  // Aggiungi qui i percorsi delle tue immagini se sono esterne e non inline
  'https://i.ibb.co/gF6sfJ5n/serbatoio.png', // L'immagine del serbatoio
  // Aggiungi qui i percorsi di tutti i file necessari per l'offline
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap' // Il font Inter
];

// Evento di installazione del Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installazione...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aperta, aggiungo le risorse.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forza l'attivazione del nuovo service worker
      .catch((error) => {
        console.error('[Service Worker] Errore durante il caching:', error);
      })
  );
});

// Evento di attivazione del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Attivazione...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminazione cache vecchia:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prende il controllo delle pagine esistenti
  );
});

// Evento di fetch (intercetta le richieste di rete)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se la risorsa è nella cache, la restituisce
        if (response) {
          console.log('[Service Worker] Servendo dalla cache:', event.request.url);
          return response;
        }
        // Altrimenti, va alla rete
        console.log('[Service Worker] Richiesta dalla rete:', event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('[Service Worker] Errore durante il fetch:', error);
        // Puoi aggiungere una pagina offline qui se lo desideri
        // return caches.match('/offline.html');
      })
  );
});
