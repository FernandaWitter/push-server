// Service Worker

// Listen to push Notifications
self.addEventListener('push', (e) => {
  self.registration.showNotification(e.data.text())
})
