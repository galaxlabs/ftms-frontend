self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {})

self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch {}
  const title = payload.title || 'New ride request'
  const options = {
    body: payload.body || payload.message || 'Open FTMS to offer your fare.',
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    tag: payload.reference_name || 'new-ride',
    requireInteraction: true,
    data: { url: '/driver' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/driver'
  event.waitUntil(self.clients.openWindow(url))
})
