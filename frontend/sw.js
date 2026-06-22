const CACHE_NAME = "studypy-cache-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/css/main.css",
    "/js/script.js",
    "/js/search.js",
    "/js/links.js",
    "/assets/favicon/favicon.ico",
    "/assets/favicon/site.webmanifest"
];


self.addEventListener("install", (event) => {
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
        })
    )
})

self.addEventListener("fetch", (event) => {
    if(event.request.method !== "GET") return;
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).catch(() => {
                if(event.request.headers.get("accept").includes("text/html")){
                    return caches.match("/index.html");
                }
            });
        })
    );
});





