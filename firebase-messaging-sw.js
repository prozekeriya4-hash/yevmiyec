// Firebase Messaging Service Worker
// Bu dosya /yevmiyec/ klasöründe olmalı
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBAkJyvgsUaTrt-S_3LAFCR5kEcHWavau4",
  authDomain: "yevmiye-defterim-3a8dd.firebaseapp.com",
  projectId: "yevmiye-defterim-3a8dd",
  storageBucket: "yevmiye-defterim-3a8dd.firebasestorage.app",
  messagingSenderId: "94028852185",
  appId: "1:94028852185:web:490e65daf0904aad7f47c8"
});

const messaging = firebase.messaging();

// Arka planda gelen bildirimleri göster
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || '📋 Yevmiye Defterim', {
    body: body || 'Bugün yevmiye yazdın mı?',
    icon: icon || '/yevmiyec/icon-192.png',
    badge: '/yevmiyec/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'yevmiye-daily',
    renotify: true,
    data: { url: '/yevmiyec/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/yevmiyec/') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/yevmiyec/');
    })
  );
});
