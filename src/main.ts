import { Color, DisplayMode, Engine, FadeInOut, Vector, vec } from "excalibur";
import { Resources, loader } from "./resources";
import { SoundManager } from "./sound-manager";
import { loadPreferences } from "./preferences";
import { Level, setWorldPixelConversion } from "./levels/main-level";
import { StartScreen } from "./levels/start-screen";
import Config from "./config";

import "./inventory"; // lit component
import "./level-select";
import "./puzzle-select";

import { EndScreen } from "./levels/end-screen";
import { Tutorial } from "./levels/tutorial";
import { UnitsConfig } from "./unit";
import { LevelSelect } from "./levels/level-select";

loadPreferences();
SoundManager.init();

const game = new Engine({
  width: 800,
  height: 600 * (10/16),
  canvasElementId: "game",
  displayMode: DisplayMode.FitScreen,
  pixelArt: true,
  pixelRatio: 4,
  physics: false,
  scenes: {
    startScreen: StartScreen,
    levelSelect: LevelSelect,
    tutorial: Tutorial,
    introLevel: new Level(Config.startingPuzzle),
    endScreen: EndScreen
  },
});

game.screen.events.on('resize', () => setWorldPixelConversion(game));
game.start("startScreen", {
  inTransition: new FadeInOut({ direction: "in", color: Color.fromHex('#420020'), duration: 1000 }),
  loader,
  
}).then(() => {
    // game.screen.goFullScreen('content');
    game.screen.pixelRatioOverride = 4;
    game.screen.applyResolutionAndViewport();
    UnitsConfig['dragon'].graphic = Resources.DragonIdle.getAnimation('idle')!
    UnitsConfig['orc'].graphic = Resources.OrcIdle.getAnimation('idle')!
    UnitsConfig['goblin'].graphic = Resources.GoblinIdle.getAnimation('idle')!
    UnitsConfig['rat'].graphic = Resources.RatIdle.getAnimation('idle')!
    UnitsConfig['knight'].graphic = Resources.KnightIdle.getAnimation('idle')!
    UnitsConfig['archer'].graphic = Resources.ArcherIdle.getAnimation('idle')!
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    new URL('service-worker.ts', import.meta.url),
    {type: 'module'}
  );
}