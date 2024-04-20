import { Actor, Color, CoordPlane, Engine, Font, FontUnit, ImageWrapping, Label, Scene, SceneActivationContext, Sprite, TextAlign, vec } from "excalibur";
import { Resources } from "../resources";


export class EndScreen extends Scene {

    endLabel: Label;
    font: Font;
    backgroundAnim: any;
    background: any;

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
            text: 'Thanks for playing!\nPlay Again?',
            pos: vec(400, height/2),
            font: this.font
        });
        this.add(this.endLabel);
    }

    onInitialize(engine: Engine<any>): void {
        this.backgroundColor = Color.Black;

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
        this.input.pointers.once('down', () => this.engine.goToScene('startScreen'));
        this.input.keyboard.once('press', () => this.engine.goToScene('startScreen'));
    }
}