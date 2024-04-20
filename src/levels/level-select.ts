import { Actor, Color, CoordPlane, Engine, Font, FontUnit, ImageWrapping, Label, Scene, SceneActivationContext, Sprite, TextAlign, vec } from "excalibur";
import { Resources } from "../resources";
import { LevelSelectElement } from "../level-select";
import { setWorldPixelConversion } from "./main-level";


export class LevelSelect extends Scene {
    endLabel: Label;
    font: Font;
    backgroundAnim: any;
    background: any;
    levelSelect!: LevelSelectElement;

    constructor() {
        super();
        this.font = new Font({
            family: 'PressStart2P',
            color: Color.White,
            textAlign: TextAlign.Center,
            size: 40,
            unit: FontUnit.Px
        });
        
        const height =  600 * (10/16);
        this.endLabel = new Label({
            text: 'Puzzle Select',
            pos: vec(400, height/6),
            font: this.font
        });
        this.add(this.endLabel);
    }

    onInitialize(engine: Engine<any>): void {
        this.backgroundColor = Color.Black;
        this.levelSelect = document.getElementsByTagName(
            "level-select"
        )[0]! as LevelSelectElement;
        this.levelSelect.setEngine(engine);

        this.backgroundAnim = Resources.Background.getAnimation('default')!;
        // Terrible terrible to enable animation tiling
        for (let frame of this.backgroundAnim.frames) {
            const sprite = (frame.graphic as Sprite);
            sprite.image.wrapping = { x: ImageWrapping.Repeat, y: ImageWrapping.Repeat };
            sprite.image.image.setAttribute('wrapping-x', ImageWrapping.Repeat);
            sprite.image.image.setAttribute('wrapping-y', ImageWrapping.Repeat);
            sprite.image.image.setAttribute('forceUpload', 'true');
            sprite.sourceView.width *= 5;
            sprite.sourceView.height *= 5;
            sprite.destSize.width *= 5;
            sprite.destSize.height *= 5;
        }
        this.background = new Actor({
            name: 'background',
            pos: vec(0, 0),
            anchor: vec(0, 0),
            coordPlane: CoordPlane.Screen,
            width: 800,
            height: 600,
            scale: vec(2, 2),
            z: -Infinity
        });
        this.background.graphics.opacity = .4;
        this.background.graphics.use(this.backgroundAnim);
        this.add(this.background);
    }
    
    onActivate(context: SceneActivationContext<unknown>): void {
        setWorldPixelConversion(this.engine);
        this.levelSelect.toggleVisible(true);
    }

    onDeactivate(context: SceneActivationContext<undefined>): void {
        this.levelSelect.toggleVisible(false);
    }
}