
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire213c"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire213c"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("aKzDW", function(module, exports) {

$parcel$export(module.exports, "register", () => $7d39d93f9098a310$export$6503ec6e8aabbaf, (v) => $7d39d93f9098a310$export$6503ec6e8aabbaf = v);
$parcel$export(module.exports, "resolve", () => $7d39d93f9098a310$export$f7ad0328861e2f03, (v) => $7d39d93f9098a310$export$f7ad0328861e2f03 = v);
var $7d39d93f9098a310$export$6503ec6e8aabbaf;
var $7d39d93f9098a310$export$f7ad0328861e2f03;
"use strict";
var $7d39d93f9098a310$var$mapping = new Map();
function $7d39d93f9098a310$var$register(baseUrl, manifest) {
    for(var i = 0; i < manifest.length - 1; i += 2)$7d39d93f9098a310$var$mapping.set(manifest[i], {
        baseUrl: baseUrl,
        path: manifest[i + 1]
    });
}
function $7d39d93f9098a310$var$resolve(id) {
    var resolved = $7d39d93f9098a310$var$mapping.get(id);
    if (resolved == null) throw new Error("Could not resolve bundle with id " + id);
    return new URL(resolved.path, resolved.baseUrl).toString();
}
$7d39d93f9098a310$export$6503ec6e8aabbaf = $7d39d93f9098a310$var$register;
$7d39d93f9098a310$export$f7ad0328861e2f03 = $7d39d93f9098a310$var$resolve;

});

var $674f6feb2b6a696a$exports = {};

(parcelRequire("aKzDW")).register(new URL("", import.meta.url).toString(), JSON.parse('["h1FzW","index.1f1ded4d.js","bITeV","PressStart2P-Regular.492382e8.ttf","40ttT","template-sample-image-sword.0b40f6ad.png","jnqyY","isometric-tiles.fc7eabf4.png","3iLZg","monsters.80988451.png","iuE19","large-summon-circle.f9e008f8.png","7FaRE","sum-logo.f507e92e.png","2O3uP","playnow.e0c7f2eb.png","jLdS9","BackgroundTileAnimated.94957d82.aseprite","gnHK1","SummonerSpriteAnimations_v2_1.749a3dd5.aseprite","jQPy6","RatSpriteAnimated.ce7e46a4.aseprite","dccEa","GoblinSpriteWithSpearAnimated.32bcf775.aseprite","8vJrD","OrcSpriteAnimated.788060c1.aseprite","douRm","DragonSpriteAnimated.37aa9b58.aseprite","dNRJK","HelmetKnightSpriteAnimated.7266246d.aseprite","hPO7G","ArcherPlusBowSpriteAnimated.5673c5c4.aseprite","3brwQ","glove.b28fd241.aseprite","1vGfH","template-sample-sound-projectile.45e33c37.mp3","gSRYe","background_1_loopable.9feed55e.mp3","aJ8MQ","sfxr.db2e5fc2.js"]'));


//# sourceMappingURL=index.runtime.c473aa45.js.map
