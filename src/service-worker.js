(() => {
var $30798be6a8ea7d7c$exports = {};
let $4550420cc206d4d6$export$e538f94cc8cf4db8 = [];
let $4550420cc206d4d6$export$83d89fbfd8236492 = "";
function $4550420cc206d4d6$export$c208e1278d7beb2(m, v) {
    $4550420cc206d4d6$export$e538f94cc8cf4db8 = m;
    $4550420cc206d4d6$export$83d89fbfd8236492 = v;
}


const $30798be6a8ea7d7c$var$manifest = [
    "/sum-monsters/index.html",
    "/sum-monsters/sum-monsters-social.jpg",
    "/sum-monsters/manifest.webmanifest",
    "/sum-monsters/icon.7afd20ef.png",
    "/sum-monsters/icon114x114.852f8217.png",
    "/sum-monsters/icon144x144.a5954a73.png",
    "/sum-monsters/screenshot.7137ba99.png",
    "/sum-monsters/favicon.b782c05d.ico",
    "/sum-monsters/credits.html",
    "/sum-monsters/index.c6dc2e50.css",
    "/sum-monsters/index.6b7846a2.css",
    "/sum-monsters/forkawesome-webfont.13d99ab6.eot",
    "/sum-monsters/forkawesome-webfont.13d99ab6.eot",
    "/sum-monsters/forkawesome-webfont.79d33ab0.woff2",
    "/sum-monsters/forkawesome-webfont.84e8427a.woff",
    "/sum-monsters/forkawesome-webfont.09dacb4b.ttf",
    "/sum-monsters/forkawesome-webfont.bdadb576.svg",
    "/sum-monsters/index.1a1f300c.js",
    "/sum-monsters/index.1cb0b6a6.js",
    "/sum-monsters/PressStart2P-Regular.492382e8.ttf",
    "/sum-monsters/template-sample-image-sword.0b40f6ad.png",
    "/sum-monsters/isometric-tiles.fc7eabf4.png",
    "/sum-monsters/monsters.80988451.png",
    "/sum-monsters/large-summon-circle.f9e008f8.png",
    "/sum-monsters/sum-logo.f507e92e.png",
    "/sum-monsters/playnow.e0c7f2eb.png",
    "/sum-monsters/BackgroundTileAnimated.94957d82.aseprite",
    "/sum-monsters/SummonerSpriteAnimations_v2_1.0e396faf.aseprite",
    "/sum-monsters/RatSpriteAnimated.ce7e46a4.aseprite",
    "/sum-monsters/GoblinSpriteWithSpearAnimated.32bcf775.aseprite",
    "/sum-monsters/OrcSpriteAnimated.788060c1.aseprite",
    "/sum-monsters/DragonSpriteAnimated.37aa9b58.aseprite",
    "/sum-monsters/HelmetKnightSpriteAnimated.7266246d.aseprite",
    "/sum-monsters/ArcherPlusBowSpriteAnimated.5673c5c4.aseprite",
    "/sum-monsters/glove.b28fd241.aseprite",
    "/sum-monsters/template-sample-sound-projectile.45e33c37.mp3",
    "/sum-monsters/background_1_loopable.9feed55e.mp3",
    "/sum-monsters/sfxr.33f6e664.js"
];
const $30798be6a8ea7d7c$var$version = "5b5b546b";
(0, $4550420cc206d4d6$export$c208e1278d7beb2)($30798be6a8ea7d7c$var$manifest, $30798be6a8ea7d7c$var$version);

var $bde5ff4dd298e998$exports = {};

// This is the "Offline page" service worker
async function $bde5ff4dd298e998$var$install() {
    const cache = await caches.open((0, $4550420cc206d4d6$export$83d89fbfd8236492));
    await cache.addAll((0, $4550420cc206d4d6$export$e538f94cc8cf4db8));
}
addEventListener("install", (e)=>e.waitUntil($bde5ff4dd298e998$var$install()));
async function $bde5ff4dd298e998$var$activate() {
    const keys = await caches.keys();
    await Promise.all(keys.map((key)=>key !== (0, $4550420cc206d4d6$export$83d89fbfd8236492) && caches.delete(key)));
}
addEventListener("activate", (e)=>e.waitUntil($bde5ff4dd298e998$var$activate()));
const $bde5ff4dd298e998$var$CACHE = "pwabuilder-page";
// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const $bde5ff4dd298e998$var$offlineFallbackPage = "ToDo-replace-this-name.html";
self.addEventListener("message", (event)=>{
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("install", async (event)=>{
    event.waitUntil(caches.open($bde5ff4dd298e998$var$CACHE).then((cache)=>cache.add($bde5ff4dd298e998$var$offlineFallbackPage)));
});
self.addEventListener("fetch", (event)=>{
    if (event.request.mode === "navigate") event.respondWith((async ()=>{
        try {
            const preloadResp = await event.preloadResponse;
            if (preloadResp) return preloadResp;
            const networkResp = await fetch(event.request);
            return networkResp;
        } catch (error) {
            const cache = await caches.open($bde5ff4dd298e998$var$CACHE);
            const cachedResp = await cache.match($bde5ff4dd298e998$var$offlineFallbackPage);
            return cachedResp;
        }
    })());
});

})();
//# sourceMappingURL=service-worker.js.map
