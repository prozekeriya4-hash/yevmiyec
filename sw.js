// Yevmiye Defterim - Service Worker v1.0
const CACHE_NAME = 'yevmiye-v1';
const urlsToCache = [
  '/yevmiyec/',
  '/yevmiyec/index.html'
];

// Kurulum
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Aktivasyon - eski cache temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - cache first, network fallback
self.addEventListener('fetch', event => {
  // Firebase ve dış istekleri cache'leme
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/yevmiyec/index.html');
      });
    })
  );
});

// ── FCM PUSH BİLDİRİM ──
self.addEventListener('push', event => {
  let data = { title: '📋 Yevmiye Defterim', body: 'Bugün yevmiye yazdın mı?' };
  try {
    data = event.data.json();
  } catch(e) {
    try { data.body = event.data.text(); } catch(e2) {}
  }

  const options = {
    body: data.body || 'Bugün yevmiye yazdın mı?',
    icon: '/yevmiyec/icon-192.png',
    badge: '/yevmiyec/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'yevmiye-daily',
    renotify: true,
    requireInteraction: false,
    data: { url: '/yevmiyec/' },
    actions: [
      { action: 'open', title: '✅ Aç' },
      { action: 'dismiss', title: 'Kapat' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '📋 Yevmiye Defterim', options)
  );
});

// Bildirime tıklanınca uygulamayı aç
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/yevmiyec/') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/yevmiyec/');
    })
  );
});

// Background sync - bildirim zamanı geldi mi kontrol
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
