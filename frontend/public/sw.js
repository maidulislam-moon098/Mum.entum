self.addEventListener('push', function(event) {
  console.log('Push notification received', event);

  let data = {
    title: '🌸 Mum.entum',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: '/dashboard'
    }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push notification data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data,
    tag: data.tag || 'mumentum-notification',
    requireInteraction: data.requireInteraction || false,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/dashboard';
  const promptId = event.notification.data?.promptId;
  const question = event.notification.data?.question;

  // Build URL with query params if we have a question
  let fullUrl = urlToOpen;
  if (question && promptId) {
    const params = new URLSearchParams({
      promptId,
      question
    });
    fullUrl = `${urlToOpen}?${params.toString()}`;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(client => {
            // Navigate to the notification URL
            return client.navigate(fullUrl);
          });
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed', event);
});
