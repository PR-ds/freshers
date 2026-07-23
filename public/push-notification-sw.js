/*
  Freshman Portal Firebase Cloud Messaging (FCM) push notification simulation service worker.
  This handler processes incoming push events and triggers browser desktop notifications.
*/

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push event received.');

  let data = { title: 'Freshman Portal Update', body: 'New notification available.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Freshman Portal Update', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Open Portal', icon: '/favicon.ico' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();

  if (event.action !== 'close') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
