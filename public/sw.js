const CACHE_NAME = 'moodsync-cache-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to pre-cache some assets during SW install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event listener with intelligent offline caching
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  const url = new URL(event.request.url);

  // Skip caching Supabase API, DB queries, and auth endpoints
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth/')
  ) {
    return;
  }

  // 1. Cache-first strategy for immutable static assets (Next.js bundles, icons, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Network-first with cache fallback for page navigation and documents
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to any page offline, fall back to cached root application shell
        if (event.request.mode === 'navigate') {
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
        }
        return new Response('Network error occurred while offline.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        });
      })
  );
});

// Web Push event listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'মুডসিঙ্ক ❤️',
    body: 'তোমার সঙ্গীর মুড আপডেট হয়েছে।',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'mood-update',
    url: '/',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (err) {
    console.error('Push payload parse error:', err);
  }

  const isChat = Boolean(
    (data.url && data.url.includes('ghost-message')) ||
    data.title?.includes('কথা বলি') ||
    data.title?.includes('👻') ||
    data.body?.includes('ঘোস্ট মেসেজ')
  );

  const defaultRoomUrl =
    'https://ghost-message-13rh.onrender.com/room/17cdveb7qndie4eq#BhIhu3h3Zy489uDfkuiCyYEbXKeFDBBiDupYhrLxKQI';
  const roomUrl = data.url && data.url.startsWith('http') ? data.url : defaultRoomUrl;

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || (isChat ? `chat-${Date.now()}` : 'mood-update'),
    renotify: true,
    vibrate: isChat ? [300, 100, 300, 100, 300] : [200, 100, 200],
    timestamp: Date.now(),
    data: {
      url: data.url || '/',
      isChat,
      roomUrl,
    },
    actions: isChat ? [{ action: 'join_chat', title: 'চ্যাটে জয়েন করো 🚀' }] : [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const isChat = Boolean(notificationData.isChat);
  const defaultRoomUrl =
    'https://ghost-message-13rh.onrender.com/room/17cdveb7qndie4eq#BhIhu3h3Zy489uDfkuiCyYEbXKeFDBBiDupYhrLxKQI';
  const roomUrl = notificationData.roomUrl || defaultRoomUrl;
  const targetAppUrl = isChat ? '/?openChat=1' : (notificationData.url?.startsWith('/') ? notificationData.url : '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (isChat) {
            client.postMessage({ type: 'OPEN_GHOST_CHAT', roomUrl });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetAppUrl);
      }
    })
  );
});
