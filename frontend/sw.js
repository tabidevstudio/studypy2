const CACHE_NAME = "studypy-cache-v5";
const ASSETS_TO_CACHE = [
    "/",
    "/css/main.css",
    "/js/script.js",
    "/js/search.js",
    "/js/links.js",
    "/assets/favicon/favicon.ico",
    "/assets/favicon/site.webmanifest"
];


self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
             console.log("Pre-caching offline assets....");
             return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});


self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if(key !== CACHE_NAME){
                        console.log("Removing outdated cache: ", key);
                        return caches.delete(key);
                    }
                })
            )
        }).then(() => self.clients.claim())
    )
})

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);
    const isApiRequest = url.pathname.startsWith('/api') || 
                         url.pathname === '/run' || 
                         url.pathname === '/links' || 
                         url.pathname === '/search';

    if (isApiRequest) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If the response is valid, update the cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If offline or network fails, fall back to cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback for HTML pages
                    const acceptHeader = event.request.headers.get("accept");
                    if (acceptHeader && acceptHeader.includes("text/html")) {
                        return caches.match("/");
                    }
                    return new Response("Offline", { status: 503, statusText: "Offline" });
                });
            })
    );
});





