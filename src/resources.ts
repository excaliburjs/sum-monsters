import { ImageSource, Loader, Sound } from "excalibur";

import swordPng from './images/template-sample-image-sword.png';
import grassTilePng from './images/isometric-tiles.png';
import projectileMp3 from './sounds/template-sample-sound-projectile.mp3';

export const Resources = {
    Sword: new ImageSource(swordPng),
    GrassTile: new ImageSource(grassTilePng),
    ProjectileSound: new Sound(projectileMp3)
} as const;

export const loader = new Loader();

for (let res of Object.values(Resources)) {
    loader.addResource(res);
}


