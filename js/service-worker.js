"use strict";
const VERSION = "0.1";
const CACHE_NAME = `teller-${VERSION}`;
const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/manifest.json",
    "/all.min.css",
    "/service-worker.js",
    "/css/index.css",
    "/lib/morphdom-umd.js",
    "/lib/fastclick.js",
    "/lib/broadcast-channel.js",
    "/teller-180x180.png",
    "/js/index.js",
    "/css/_reset.css",
    "/css/preloaders.css",
    "/css/editor.css",
    "/lib/toastify.min.js",
    "/lib/toastify.min.css",
    "/js/core/app.js",
    "/js/core/router.js",
    "/js/game/main.js",
    "/js/editor/main.js",
    "/js/game/webgl-runner.js",
    "/js/core/misc.js",
    "/js/core/rootMan.js",
    "/js/game/story/menu.js",
    "/js/game/story/story.js",
    "/js/editor/editor.js",
    "/js/game/story/game-ui.js",
    "/js/game/story/game-loop.js",
    "/js/game/game-user.js",
    "/js/game/igame-data.js",
    "/js/game/game-data.js",
    "/js/game/game-helper.js",
    "/js/utils.js",
    "/js/game/iui.js",
    "/js/game/igame.js",
];
self.addEventListener("install", (event) => {
    console.log("install");
    const preCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(APP_STATIC_RESOURCES);
    };
    event.waitUntil(preCache());
});
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
self.addEventListener("fetch", (event) => {
    console.log("fetch", event.request.url);
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("/"));
        return;
    }
    const cached = async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);
        return cachedResponse !== null && cachedResponse !== void 0 ? cachedResponse : new Response(null, { status: 404 });
    };
    event.respondWith(cached());
});
