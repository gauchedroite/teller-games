"use strict";
//
// NOTE: THE SERVICE WORKER "fetch" EVENT WON'T FIRE UNLESS service-worker.js IS AT THE SAME LEVEL AS index.html
//
const VERSION = "0.9";
const CACHE_NAME = `teller-${VERSION}`;
const APP_STATIC_RESOURCES = [
    "/",
    "/teller-games/",
    "/teller-games/index.html",
    "/teller-games/manifest.json",
    "/teller-games/all.min.css",
    "/teller-games/service-worker.js",
    "/teller-games/css/index.css",
    "/teller-games/lib/morphdom-umd.js",
    "/teller-games/lib/fastclick.js",
    "/teller-games/lib/broadcast-channel.js",
    "/teller-games/teller-180x180.png",
    "/teller-games/js/index.js",
    "/teller-games/css/_reset.css",
    "/teller-games/css/preloaders.css",
    "/teller-games/css/editor.css",
    "/teller-games/lib/toastify.min.js",
    "/teller-games/lib/toastify.min.css",
    "/teller-games/js/core/app.js",
    "/teller-games/js/core/router.js",
    "/teller-games/js/game/main.js",
    "/teller-games/js/editor/main.js",
    "/teller-games/js/game/webgl-runner.js",
    "/teller-games/js/core/misc.js",
    "/teller-games/js/core/rootMan.js",
    "/teller-games/js/game/story/menu.js",
    "/teller-games/js/game/story/story.js",
    "/teller-games/js/editor/editor.js",
    "/teller-games/js/game/story/game-ui.js",
    "/teller-games/js/game/story/game-loop.js",
    "/teller-games/js/game/game-user.js",
    "/teller-games/js/game/igame-data.js",
    "/teller-games/js/game/game-data.js",
    "/teller-games/js/game/game-helper.js",
    "/teller-games/js/utils.js",
    "/teller-games/js/game/iui.js",
    "/teller-games/js/game/igame.js",
];
// On install, cache the static resources
self.addEventListener("install", (event) => {
    console.log("install");
    const preCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(APP_STATIC_RESOURCES);
    };
    event.waitUntil(preCache());
});
// On activate, delete old caches
self.addEventListener("activate", (event) => {
    console.log("activate");
    const preCached = async () => {
        const names = await caches.keys();
        await Promise.all(names.map(name => {
            if (name !== CACHE_NAME) {
                return caches.delete(name);
            }
            return;
        }));
        return await clients.claim();
    };
    event.waitUntil(preCached());
});
// On fetch, return the fetched/cached Response from the cache
self.addEventListener("fetch", (event) => {
    console.log("fetch", event.request.url);
    // When seeking an HTML page, return to index.html
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("/teller-games/"));
        return;
    }
    // Return the cached response if it's available.
    // Respond with a HTTP 404 response status otherwise.
    const cached = async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);
        return cachedResponse !== null && cachedResponse !== void 0 ? cachedResponse : new Response(null, { status: 404 });
    };
    // For every other request type
    event.respondWith(cached());
});
