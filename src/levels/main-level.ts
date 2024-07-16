import {
    Engine,
    IsometricEntityComponent,
    Scene,
    vec,
    PointerEvent,
    KeyEvent,
    Keys,
    clamp,
    FadeInOut,
    Transition,
    SceneActivationContext,
    Color,
    Actor,
    CoordPlane,
    Vector,
    Material,
    coroutine,
    Animation,
    Future,
    AnimationStrategy,
    Sprite,
    ImageWrapping,
    Subscription,
} from "excalibur";
import { PuzzleGrid, ValueHintSprite } from "../puzzle-grid";
import { Unit } from "../unit";
import { Inventory } from "../inventory";
import { buildPuzzle, calculateInventory, hasPuzzle } from "../puzzle-builder";
import { SoundManager } from "../sound-manager";
import { Resources, SfxrSounds } from "../resources";
import Config from "../config";
import { createRainbowOutlineMaterial } from "../rainbowOutline";
import { LevelSelectElement } from "../level-select";
import { PuzzleSelect } from "../puzzle-select";

export const setWorldPixelConversion = (game: Engine) => {
    const pageOrigin = game.screen.worldToPageCoordinates(Vector.Zero);
    const pageDistance = game.screen.worldToPageCoordinates(vec(1, 0)).sub(pageOrigin);
    const pixelConversion = pageDistance.x;
    document.documentElement.style.setProperty('--pixel-conversion', pixelConversion.toString());

    const pos = game.screen.screenToPageCoordinates(vec(800 - 5, 5));
    const inventory = document.getElementsByTagName(
        "app-inventory"
    )[0]! as Inventory;
    inventory.setInventoryPositionTopRight(pos);

    const levelSelect = document.getElementsByTagName(
        'level-select')[0]! as LevelSelectElement;
    levelSelect.setLevelSelectTopLeft(game.screen.screenToPageCoordinates(vec(50, 120)));

    const puzzleSelectButton = document.getElementsByTagName(
        'puzzle-select')[0]! as PuzzleSelect;
    puzzleSelectButton.setPuzzleSelectBottomRight(game.screen.screenToPageCoordinates(vec(800-5, 600 * (10/16) - 5)));
}

export const goToPuzzle = (game: Engine, puzzleNumber: number) => {
    if (hasPuzzle(puzzleNumber)) {
        const sceneKey = `level ${puzzleNumber}`;
        if (!game.director.getSceneInstance(sceneKey)) {
            game.addScene(sceneKey, new Level(puzzleNumber));
        }
        game.goToScene(sceneKey, {
            destinationIn: new FadeInOut({ direction: "in", duration: 2000 }),
            sourceOut: new FadeInOut({ direction: "out", duration: 2000 }),
        });
    } else {
        game.goToScene('endScreen', {
            destinationIn: new FadeInOut({ direction: "in", duration: 2000 }),
            sourceOut: new FadeInOut({ direction: "out", duration: 2000 }),
        });
    }
}

export class Level extends Scene {
    puzzleGrid: PuzzleGrid;
    currentSelection: Unit | null = null;
    inventory!: Inventory;
    puzzleSelectButton!: PuzzleSelect;
    currentSelectedCoordinate: { x: number; y: number } = { x: 0, y: 0 };
    summoner!: Actor;
    rainbowMaterial!: Material;

    summonerIdleAnim!: Animation;
    summonerSummonStaffAnim!: Animation;
    summonerStaffIdleAnim!: Animation;
    summonerSummonUnitAnim!: Animation;

    background!: Actor;
    backgroundAnim!: Animation;
    summonerSummonStaffAnimReverse!: Animation;
    summonerSummonUnitAnimReverse!: Animation;

    constructor(private level: number = 0) {
        super();
        this.puzzleGrid = buildPuzzle(level, this);

        this.camera.zoom = 2;
        const dimension = this.puzzleGrid.dimension;
        const tile = this.puzzleGrid.iso.getTile(Math.floor(dimension / 2), Math.floor(dimension / 2));
        if (tile) {
            this.camera.pos =  tile.pos;
            if (dimension >= 3) {
                this.camera.pos = this.camera.pos.add(vec(32 + 8, -8));
            }
            if (dimension >= 6) {
                this.camera.zoom = 1.5;
            }
        }

    }

    onInitialize(engine: Engine<any>): void {
        SoundManager.startBackgroundMusic();
        this.backgroundColor = Color.Black;
        this.inventory = document.getElementsByTagName(
            "app-inventory"
        )[0]! as Inventory;
        this.puzzleSelectButton = document.getElementsByTagName(
            'puzzle-select'
        )[0]! as PuzzleSelect;
        this.summoner = new Actor({
            pos: vec(720, 232),
            scale: vec(2, 2),
            coordPlane: CoordPlane.Screen
        });
        this.summoner.graphics.use(Resources.Summoner.getAnimation('Idle')!);
        this.rainbowMaterial = createRainbowOutlineMaterial(engine);
        this.add(this.summoner);

        this.input.pointers.on("move", this.moveSelection);
        this.input.pointers.on("down", this.placeUnitWithPointer);
        this.input.keyboard.on("press", this.keyboardDown);

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


        this.summonerIdleAnim = Resources.Summoner.getAnimation('Idle')!
        this.summonerSummonStaffAnim = Resources.Summoner.getAnimation('SummonStaff')!
        this.summonerStaffIdleAnim = Resources.Summoner.getAnimation('StaffIdle')!
        this.summonerSummonUnitAnim = Resources.Summoner.getAnimation('SummonUnit')!
        this.summonerSummonStaffAnimReverse = this.summonerSummonStaffAnim.clone();
        this.summonerSummonStaffAnimReverse.reverse();
        this.summonerSummonUnitAnimReverse = this.summonerSummonUnitAnim.clone();
        this.summonerSummonUnitAnimReverse.reverse();

    }

    onActivate(context: SceneActivationContext<unknown>): void {
        this.inventory.setLevel(this);
        let inventory = calculateInventory(this.level, this);
        this.inventory.setInventoryConfig(inventory);
        this.puzzleSelectButton.setEngine(this.engine);
        setWorldPixelConversion(this.engine);
        this.engine.clock.schedule(() => {
            setWorldPixelConversion(this.engine);
        });
        this.inventory.toggleVisible(true);
        this.puzzleSelectButton.toggleVisible(true);
    }

    onDeactivate(context: SceneActivationContext<undefined>): void {
        this.inventory.toggleVisible(false);
        this.puzzleSelectButton.toggleVisible(false);
        this.clearAllPlacedUnits();
        this.puzzleGrid.flagAllUnsolved();
    }

    moveSelection = (evt: PointerEvent) => {
        if (this.currentSelection) {
            this.currentSelection.pos = evt.worldPos;
        }
        this.puzzleGrid.showHighlight(evt.worldPos);
        const tile = this.puzzleGrid.getTileCoord(evt.worldPos);
        if (tile) {
            this.currentSelectedCoordinate = { x: tile.x, y: tile.y };
        }
    };

    playAnim = (animation: Animation, strategy: AnimationStrategy) => {
        const future = new Future<void>();
        animation.reset();
        animation.strategy = strategy;
        animation.events.on('end', () => future.resolve());
        animation.events.on('loop', () => future.resolve());
        this.summoner.graphics.use(animation);
        return future.promise;
    }

    playSelectedUnitAnimation() {
        const playAnim = this.playAnim;
        const summoner = this.summoner;
        const rainbowMaterial = this.rainbowMaterial;
        const summonerSummonStaffAnim = this.summonerSummonStaffAnim;
        const summonerStaffIdleAnim = this.summonerStaffIdleAnim;
        coroutine(function * () {
            summoner.graphics.material = rainbowMaterial;
            yield playAnim(summonerSummonStaffAnim, AnimationStrategy.Freeze);
            yield playAnim(summonerStaffIdleAnim, AnimationStrategy.Loop);
        });
    }

    playPlacedUnitAnimation() {
        const playAnim = this.playAnim;
        const summoner = this.summoner;
        const summonerIdleAnim = this.summonerIdleAnim;
        const summonerSummonStaffAnimReverse = this.summonerSummonStaffAnimReverse;
        const summonerStaffIdleAnim = this.summonerStaffIdleAnim;
        const summonerSummonUnitAnim = this.summonerSummonUnitAnim;
        const summonerSummonUnitAnimReverse = this.summonerSummonUnitAnimReverse;
        coroutine(function * () {
            yield playAnim(summonerSummonUnitAnim, AnimationStrategy.Freeze);
            yield playAnim(summonerSummonUnitAnimReverse, AnimationStrategy.Freeze);
            summoner.graphics.material = null;
            yield playAnim(summonerStaffIdleAnim, AnimationStrategy.Freeze);
            yield playAnim(summonerSummonStaffAnimReverse, AnimationStrategy.Freeze);
            yield playAnim(summonerIdleAnim, AnimationStrategy.Loop);
        });
    }

    placeSelectionOnTile = (x: number, y: number): boolean => {
        if (this.currentSelection) {
            const unitType = this.currentSelection.config.type;
            const success = this.puzzleGrid.addUnit(this.currentSelection, x, y);
            if (success) {
                this.playPlacedUnitAnimation();
                this.currentSelection = null;
                this.checkSolution();
                const unit = this.puzzleGrid.getUnit(x, y);
                // TODO play the summoning animation (separate from, but added to each of the creatures?)
                const valueHint = this.puzzleGrid.getValueHint(x, y)
                if (valueHint) {
                    valueHint.graphics.use(ValueHintSprite[unitType]);
                    unit?.actions.fade(Config.units.opacityAfterPlacement, Config.units.monsters.fadeSpeedMs).callMethod(() => {
                        if (this.puzzleGrid.getUnit(x, y)) {
                            valueHint.graphics.visible = true;
                        } else {
                            valueHint.graphics.visible = false;
                        }
                    });
                }

                SfxrSounds.place.play();
            }
            return success;
        }
        return false;
    }

    placeUnitWithPointer = (evt: PointerEvent, cancelInvalid = true) => {
        if (this.puzzleGrid.validTile(evt.worldPos)) {
            const tileCoord = this.puzzleGrid.getTileCoord(evt.worldPos);
            if (tileCoord) {
                const previousUnit = this.puzzleGrid.getUnit(tileCoord.x, tileCoord.y);
                if (!!previousUnit && !previousUnit.config.fixed) {
                    this.puzzleGrid.clearCell(tileCoord.x, tileCoord.y);
                    SfxrSounds.remove.play();
                }

                this.placeSelectionOnTile(tileCoord.x, tileCoord.y);
                if (!!previousUnit && !previousUnit.config.fixed) {
                    this.selectUnit(previousUnit);
                }
            }
        } else {
            if (!cancelInvalid) return;
            if(!!this.currentSelection) {
                this.checkSolution() // yes this isn't very efficient since we know this can't be a solution, but it's the fastest way to update the goal labels
                SfxrSounds.remove.play() 
            }
            this.cancelSelection();
        }
    };

    placeUnitWithKeyboard = () => {
        if (!this.currentSelection) return;
        const previousUnit = this.puzzleGrid.getUnit(this.currentSelectedCoordinate.x, this.currentSelectedCoordinate.y);
        if (!!previousUnit && !previousUnit.config.fixed) {
            this.puzzleGrid.clearCell(this.currentSelectedCoordinate.x, this.currentSelectedCoordinate.y);
            SfxrSounds.remove.play();
        }
        this.placeSelectionOnTile(this.currentSelectedCoordinate.x, this.currentSelectedCoordinate.y)
        if (!!previousUnit && !previousUnit.config.fixed) this.inventory.addToInventory(previousUnit?.config.type);
    };

    clearCellWithKeyboard = () => {
        let tileX = this.currentSelectedCoordinate.x;
        let tileY = this.currentSelectedCoordinate.y;
        const previousUnit = this.puzzleGrid.getUnit(tileX, tileY);
        if (!!previousUnit) {
            if (previousUnit.config.fixed) { return; }
            this.puzzleGrid.clearCell(tileX, tileY);
            SfxrSounds.remove.play();
            this.inventory.addToInventory(previousUnit.config.type);
        }
        // yes this isn't very efficient since we know this can't be a solution, but it's the fastest way to update the goal labels
        this.checkSolution();
    };

    clearAllPlacedUnits() {
        for (let i = 0; i < this.puzzleGrid.grid.length; i++) {
            if(!this.puzzleGrid.grid[i]?.config.fixed) {
                this.puzzleGrid.clearCell(i % this.puzzleGrid.dimension, Math.floor(i / this.puzzleGrid.dimension));
            }
        }
    }

    checkSolution() {
        if (this.puzzleGrid.checkSolved()) {
            localStorage.setItem(`${this.level}`, 'solved');
            const nextLevel = this.level + 1;
            SfxrSounds.clearPuzzle.play();
            goToPuzzle(this.engine, nextLevel);
        }
    }

    keyboardDown = (evt: KeyEvent) => {
        // Move cursor
        switch (evt.key) {
            case Keys.A:
            case Keys.ArrowLeft: {
                this.currentSelectedCoordinate.x = clamp(
                    this.currentSelectedCoordinate.x - 1,
                    0,
                    this.puzzleGrid.dimension - 1
                );
                break;
            }
            case Keys.D:
            case Keys.ArrowRight: {
                this.currentSelectedCoordinate.x = clamp(
                    this.currentSelectedCoordinate.x + 1,
                    0,
                    this.puzzleGrid.dimension - 1
                );
                break;
            }
            case Keys.W:
            case Keys.ArrowUp: {
                this.currentSelectedCoordinate.y = clamp(
                    this.currentSelectedCoordinate.y - 1,
                    0,
                    this.puzzleGrid.dimension - 1
                );
                break;
            }
            case Keys.S:
            case Keys.ArrowDown: {
                this.currentSelectedCoordinate.y = clamp(
                    this.currentSelectedCoordinate.y + 1,
                    0,
                    this.puzzleGrid.dimension - 1
                );
                break;
            }
        }
        this.puzzleGrid.showHighlightByCoordinate(
            this.currentSelectedCoordinate.x,
            this.currentSelectedCoordinate.y
        );

        switch (evt.key) {
            case Keys.Digit1:
            case Keys.Numpad1: {
                this.inventory.onSelection("rat")();
                this.placeUnitWithKeyboard();
                break;
            }
            case Keys.Digit2:
            case Keys.Numpad2: {
                this.inventory.onSelection("goblin")();
                this.placeUnitWithKeyboard();
                break;
            }
            case Keys.Digit3:
            case Keys.Numpad3: {
                this.inventory.onSelection("orc")();
                this.placeUnitWithKeyboard();
                break;
            }
            case Keys.Digit5:
            case Keys.Numpad5: {
                this.inventory.onSelection("dragon")();
                this.placeUnitWithKeyboard();
                break;
            }
            case Keys.Delete:
            case Keys.Backspace: {
                this.clearCellWithKeyboard();
                break;
            }
            case Keys.Esc: {
                this.cancelSelection();
                break;
            }
        }
    };

    inventoryUpSubscription: Subscription | null = null;

    selectUnit(unit: Unit, fromInventory = false) {
        if (this.currentSelection) {
            this.remove(this.currentSelection);
            this.currentSelection = null;
        }
        unit.addComponent(new IsometricEntityComponent(this.puzzleGrid.iso));
        unit.get(IsometricEntityComponent).elevation = 3;
        this.currentSelection = unit;
        this.add(unit);
        this.playSelectedUnitAnimation();
        if (fromInventory) {
            this.inventoryUpSubscription?.close();
            this.inventoryUpSubscription = this.input.pointers.once("up", (ev) => {
                if (this.currentSelection) {
                    this.placeUnitWithPointer(ev, false);
                }
            });
        }
    }

    cancelSelection() {
        if (this.currentSelection) {
            this.remove(this.currentSelection);
            const type = this.currentSelection.config.type;
            const counts = this.inventory.getInventoryConfig();
            counts[type]++;
            this.inventory.setInventoryConfig(counts);
            this.currentSelection = null;
            this.summoner.graphics.material = null;
        }
    }
}
