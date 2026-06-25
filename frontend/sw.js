const CACHE_NAME = "studypy-cache-v4";
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
    if(event.request.method !== "GET") return;
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => {
                const acceptHeader = event.request.headers.get("accept");
                if (acceptHeader && acceptHeader.includes("text/html")) {
                    return caches.match("/");
                }
                // Return a fallback response for other assets to avoid ERR_FAILED
                return new Response("Offline", { status: 503, statusText: "Offline" });
            });
        })
    );
});





