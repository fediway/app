// Minimal service worker for Web Push notifications.
// Mastodon sends encrypted payloads per RFC 8291; the browser decrypts
// them before firing the push event.

globalThis.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    globalThis.registration.showNotification(data.title ?? 'Fediway', {
      body: data.body ?? '',
      icon: data.icon ?? '/favicon/web-app-manifest-192x192.png',
      badge: '/favicon/web-app-manifest-192x192.png',
      tag: `fediway-${data.notification_type ?? 'notification'}-${data.notification_id ?? ''}`,
      data: { notificationId: data.notification_id },
    }),
  );
});

globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    globalThis.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(globalThis.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'notification-click', notificationId: event.notification.data?.notificationId });
          return client.focus();
        }
      }
      return globalThis.clients.openWindow('/notifications');
    }),
  );
});
