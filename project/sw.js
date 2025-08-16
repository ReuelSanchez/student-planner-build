const CACHE_NAME = 'student-planner-cache-v1';
// A list of essential files to pre-cache
const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "index.css",
  "manifest.json",
  "types.js",
  "contexts/ThemeContext.js",
  "constants.js",
  "services/geminiService.js",
  "services/notificationService.js",
  "components/common/Spinner.js",
  "components/common/Modal.js",
  "components/DayDetailModal.js",
  "components/MonthlyCalendar.js",
  "components/AddAssignmentModal.js",
  "components/AddCourseModal.js",
  "components/CourseDetailModal.js",
  "components/ShareReceiverScreen.js",
  "components/DashboardScreen.js",
  "components/ScheduleScreen.js",
  "components/GradesScreen.js",
  "components/ScannerScreen.js",
  "components/SolverScreen.js",
  "components/SettingsScreen.js",
  "components/AuthScreen.js",
  "App.js",
  "index.js",
  "icon-192.png",
  "icon-512.png",
  "maskable-icon-512.png",
  "icons/shortcut-schedule-96.png",
  "icons/shortcut-grades-96.png",
  "icons/shortcut-scanner-96.png"
];

// On install, pre-cache the essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and pre-caching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .catch(err => console.error("Pre-caching failed:", err))
    );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


const handleShare = async (event) => {
    try {
        const formData = await event.request.formData();
        const file = formData.get('file');
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';

        let fileDataUrl = null;
        if (file) {
            fileDataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (clients.length > 0) {
            // Find the first visible client
            const client = clients.find(c => c.visibilityState === 'visible') || clients[0];
            client.postMessage({
                type: 'share-data',
                payload: {
                    title,
                    text,
                    fileDataUrl,
                }
            });
             // Focus the client window
            if ('focus' in client) {
              await client.focus();
            }
        }
    } catch (e) {
        console.error("Share handling failed:", e);
    }
}


// On fetch, use a cache-then-network strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept share target POST requests
    if (event.request.method === 'POST' && url.pathname.endsWith('/share-receiver')) {
        event.respondWith(Response.redirect('./?shared=true', 303));
        event.waitUntil(handleShare(event));
        return;
    }

    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For navigation requests, use network first to get the latest version, falling back to cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('index.html'))
        );
        return;
    }

    // For other requests, serve from cache and fall back to network, then update cache
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponsePromise = fetch(event.request).then((networkResponse) => {
                    // Don't cache chrome-extension:// requests or other non-http/https schemes
                    if(event.request.url.startsWith('http')) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    console.warn("Fetch failed, possibly offline:", err);
                    // If fetch fails and there's no cached response, the request will fail.
                    // This is expected for resources not in cache when offline.
                });

                return cachedResponse || fetchedResponsePromise;
            });
        })
    );
});