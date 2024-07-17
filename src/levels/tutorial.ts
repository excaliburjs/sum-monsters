import { ActionSequence, Actor, Color, EasingFunctions, Engine, FadeInOut, Font, FontUnit, Future, IsometricTile, Label, ParallelActions, RotationType, Scene, SceneActivationContext, TextAlign, Vector, clamp, coroutine, vec } from "excalibur";
import { Resources, SfxrSounds } from "../resources";
import { PuzzleGrid } from "../puzzle-grid";
import { Inventory } from "../inventory";
import { Level, setWorldPixelConversion } from "./main-level";
import { UnitType } from "../unit";

function repeat(t: number, m: number) {
    return clamp(t - Math.floor(t / m) * m, 0, m);
}

function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
}

function lerpAngle(a: number, b: number, t: number) {
    const dt = repeat(b - a, Math.PI * 2);
    return lerp(a, a + (dt > Math.PI ? dt - Math.PI * 2 : dt), t);
}


// How to make it clear to sum the rows and columns
// 

export class Tutorial extends Level {

    finger: Actor;
    equation!: Label;
    inventory!: Inventory;
    font!: Font;
    tutorialText!: Label;

    placements: IsometricTile[] = [];
    selections: string[] = [];

    constructor() {
        super();
        this.puzzleGrid.dispose();
        this.puzzleGrid = new PuzzleGrid(this, {
            dimension: 2,
            pos: vec(400, 100),
            goals: {
                columns: [4, 2],
                rows: [3, 3]
            }
        });
        this.puzzleGrid.events.on('placement', tile => {
            this.placements.push(tile);
        })

        this.finger = new Actor({
            pos: vec(-400, 0),
            z: Infinity,
            anchor: vec(23 / 64, 1)
        })
        this.add(this.finger);
        this.backgroundColor = Color.Black;

        this.camera.zoom = 2;
        const dimension = this.puzzleGrid.dimension;
        const tile = this.puzzleGrid.iso.getTile(Math.floor(dimension / 2), Math.floor(dimension / 2));
        if (tile) {
            this.camera.pos = tile.pos;
            if (dimension > 3) {
                this.camera.pos = this.camera.pos.add(vec(32, -16));
            }
        }
    }

    onInitialize(engine: Engine<any>): void {
        super.onInitialize(engine);
        const height =  600 * (10/16);
        this.inventory.addEventListener('selection', ({ detail }: any) => {
            this.selections.push(detail)
        });

        const glove = Resources.Glove.getSpriteSheet()?.getSprite(0, 0);
        if (glove) {
            this.finger.graphics.use(glove)
        }
        this.font = Resources.Font.toFont({
            size: 24,
            family: "PressStart2P",
            unit: FontUnit.Px,
            color: Color.White,
            textAlign: TextAlign.Center,
            quality: 8
        });

        const otherFont = Resources.Font.toFont({
            size: 16,
            family: "PressStart2P",
            unit: FontUnit.Px,
            color: Color.White,
            textAlign: TextAlign.Center,
            quality: 8
        });

        this.tutorialText = new Label({
            text: 'The math is all wrong!\n Let\'s sum some monsters!',
            font: otherFont,
            z: Infinity,
            pos: vec(400, height/2)
        });
        this.add(this.tutorialText)

        this.equation = new Label({
            text: '? + ? = 4',
            font: this.font,
            z: Infinity,
            pos: vec(400, height/2 - 32)
        });
        this.add(this.equation);
    }

    moveFinger = (pos: Vector, duration = 1500) => {
        return this.finger.actions.easeTo(pos, duration, EasingFunctions.EaseInOutCubic).toPromise();
    }

    moveFingerAndRotate = (pos: Vector, angle: number, duration = 1500) => {
        const targetAngle = angle - Math.PI / 2;
        const easeTo = new ActionSequence(this.finger, ctx => {
            ctx.easeTo(pos, duration, EasingFunctions.EaseInOutCubic)
        });

        const rotateTo = new ActionSequence(this.finger, ctx => {
            ctx.rotateTo(targetAngle, 2 * Math.abs(targetAngle - this.finger.rotation) / (duration / 1000), RotationType.ShortestPath)
        })

        const parallel = new ParallelActions([
            easeTo,
            rotateTo
        ])
        return this.finger.actions.runAction(parallel).toPromise();
    }

    moveFingerToTile = (x: number, y: number, duration = 1500) => {
        const tile = this.puzzleGrid.iso.getTile(x, y);
        if (tile) {
            return this.moveFinger(tile.pos.add(vec(0, -16)), duration);
        }
    }

    moveFingerAndRotateToTile = (x: number, y: number, angle: number, duration = 1500) => {
        const tile = this.puzzleGrid.iso.getTile(x, y);
        if (tile) {
            return this.moveFingerAndRotate(tile.pos.add(vec(0, -32)), angle, duration);
        }
    }

    onActivate(context: SceneActivationContext<unknown>) {
        this.placements = [];
        this.inventory.setLevel(this);
        this.inventory.setInventoryConfig({
            rat: 2,
            goblin: 2
        } as any);
        setWorldPixelConversion(this.engine);
        this.engine.clock.schedule(() => {
            setWorldPixelConversion(this.engine);
        });
        this.inventory.toggleVisible(true);
        this.animateTutorial();
    }

    waitForSelection = (selection: UnitType) => {
        this.inventory.setPulse(selection, true);
        const future = new Future<void>();
        const removeSelections = (selection: UnitType) => {
            const index = this.selections.indexOf(selection);
            this.selections.splice(index, 1);
            if (index > -1) {
                this.inventory.setPulse(selection, false);
                future.resolve();
            }
        }
        console.log(this.selections);
        if (this.selections.length > 0) {
            removeSelections(selection);
        } else {
            this.inventory.addEventListener('selection', ({ detail }: any) => {
                if (selection === detail) {
                    removeSelections(detail);
                }
            }, {once: true});
        }
        return future.promise;
    }


    waitForPlacement = (x: number, y: number) => {
        const future = new Future<void>();
        if (this.placements.filter(tile => {
            if (tile.x === x && tile.y === y) {
                future.resolve();
            }
        }))
        this.puzzleGrid.events.on('placement', (tile) => {
            if (tile.x === x && tile.y === y) {
                future.resolve();
            }
        });
        return future.promise;
    }

    highlightInventory = () => {
        // TODO add way to highlight inventory item
    }

    animateTutorial() {
        const finger = this.finger;
        const moveFinger = this.moveFinger;
        const moveFingerToTile = this.moveFingerToTile;
        const moveFingerAndRotateToTile = this.moveFingerAndRotateToTile;
        const moveFingerAndRotate = this.moveFingerAndRotate;
        const waitForSelection = this.waitForSelection;
        const waitForPlacement = this.waitForPlacement;
        const puzzleGrid = this.puzzleGrid;
        const equation = this.equation;
        const inventory = this.inventory;
        coroutine(function* () {
            const xPos = 508;
            const goblinYPos = 90;
            const ratYPos = 73;
            yield 500;
            yield moveFingerAndRotate(vec(xPos, goblinYPos), 0);
            yield waitForSelection('goblin');

            yield moveFingerAndRotateToTile(0, 0, Math.PI / 2);
            puzzleGrid.showHighlight(finger.pos);
            yield waitForPlacement(0, 0);
            equation.text = '2 + ? = 4';

            yield moveFingerAndRotate(vec(xPos, goblinYPos), 0);
            yield waitForSelection('goblin');

            yield moveFingerAndRotateToTile(1, 0, Math.PI / 2);
            puzzleGrid.showHighlight(finger.pos);
            yield waitForPlacement(1, 0);
            equation.text = '2 + 2 = 4';

            yield moveFingerAndRotate(vec(xPos, ratYPos), 0);
            yield waitForSelection('rat');
            equation.text = '2 + ? = 3';

            yield moveFingerAndRotateToTile(1, 1, Math.PI / 2);
            puzzleGrid.showHighlight(finger.pos);
            yield waitForPlacement(1, 1);
            equation.text = '2 + 1 = 3';


            yield moveFingerAndRotate(vec(xPos, ratYPos), 0);
            yield waitForSelection('rat');
            equation.text = '2 + ? = 3';

            yield moveFingerAndRotateToTile(0, 1, Math.PI / 2);
            puzzleGrid.showHighlight(finger.pos);
            yield waitForPlacement(0, 1);
            equation.text = '2 + 1 = 3';
        });
    }

    checkSolution() {
        if (this.puzzleGrid.checkSolved()) {
            localStorage.setItem('tutorial', 'solved');
            SfxrSounds.clearPuzzle.play();
            const sceneKey = `level 0`;
            if (!this.engine.director.getSceneInstance(sceneKey)) {
                this.engine.addScene(sceneKey, new Level(0));
            }
            this.engine.goToScene(sceneKey, {
                destinationIn: new FadeInOut({ direction: "in", duration: 2000 }),
                sourceOut: new FadeInOut({ direction: "out", duration: 2000 }),
            });
        }
    }
}