// Service Worker for The Profit Platform - Enhanced caching (root scope)
const CACHE_NAME = 'profit-platform-v3';
const STATIC_CACHE = 'profit-platform-static-v3';
const DYNAMIC_CACHE = 'profit-platform-dynamic-v2';

const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/homepage.css',
    '/css/critical.css',
    '/js/main.js',
    '/assets/manifest.json',
    // External styles still in use
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
];

const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://theprofitplatform.com.au'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(cache) {
                console.log('Service Worker: Caching static files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(err => {
                console.log('Service Worker: Cache failed', err);
            })
    );
});

// Fetch event - enhanced caching strategy
self.addEventListener('fetch', function(event) {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Handle different request types with different strategies
    if (request.url.includes('googleapis.com') || request.url.includes('cdnjs.cloudflare.com')) {
        // Cache first for external resources
        event.respondWith(cacheFirst(request));
    } else if (request.url.includes('.css') || request.url.includes('.js') || request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.webp')) {
        // Cache first for static assets
        event.respondWith(cacheFirst(request));
    } else {
        // Network first for HTML pages
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Cache first failed', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline - Content not available', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// Background sync for form submissions (offline support)
self.addEventListener('sync', function(event) {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        // Handle offline form submissions when connection is restored
        console.log('Service Worker: Syncing contact form data');
        // Implementation would depend on your form handling logic
        // This is a placeholder for offline form submission handling
        return Promise.resolve();
    } catch (error) {
        console.log('Service Worker: Form sync failed', error);
        return Promise.reject(error);
    }
}

// Push notification support (for future use)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon-32x32.png',
            badge: '/favicon-16x16.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'The Profit Platform', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
