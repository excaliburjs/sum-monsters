import { Actor, Font, FontUnit, IsometricEntityComponent, IsometricMap, Label, Scene, Sprite, Vector, vec } from "excalibur";
import { Resources, TilesSpriteSheet } from "./resources";
import { Unit } from "./unit";


export interface PuzzleGridOptions {
    pos: Vector; 
    dimension: number;
    goals: {
        rows: number[]; // length dimension
        columns: number[];
    }
}

export class PuzzleGrid {

    private grassTile: Sprite;
    private highlightSprite: Sprite;
    public iso: IsometricMap;

    public goals: {
        rows: number[]; // length dimension
        columns: number[];
    };

    public grid: (Unit | null)[];
    public dimension: number;

    public goalFont = new Font({
        family: 'sans-serif',
        size: 24,
        unit: FontUnit.Px
    });

    public highlight: Actor;

    constructor(private scene: Scene, options: PuzzleGridOptions) {
        const {dimension, pos, goals} = options;
        this.iso = new IsometricMap({
            rows: dimension,
            columns: dimension,
            pos,
            tileWidth: 64,
            tileHeight: 64 / 2 
        });

        this.grassTile = TilesSpriteSheet.getSprite(0, 0);
        this.highlightSprite = TilesSpriteSheet.getSprite(1, 0);
        this.highlight = new Actor({
            width: 64,
            height: 64,
            anchor: vec(0.5, 1)
        });
        this.highlight.addComponent(new IsometricEntityComponent(this.iso));
        this.highlight.graphics.use(this.highlightSprite);
        this.highlight.graphics.visible = false;
        scene.add(this.highlight);

        if (goals.columns.length !== dimension) {
            throw new Error(`Goals for columns length [${goals.columns.length}] need to match dimension [${dimension}]`);
        }
        if (goals.rows.length !== dimension) {
            throw new Error(`Goals for rows length [${goals.columns.length}] need to match dimension [${dimension}]`);
        }

        this.goals = goals;

        this.dimension = dimension;
        this.grid = new Array(dimension * dimension).fill(null);

        

        for (let tile of this.iso.tiles) {
            tile.addGraphic(this.grassTile);
        }

        scene.add(this.iso);

        for (let [index, columnGoal] of this.goals.columns.entries()) {
            
            const rightMostTile = this.iso.getTile(dimension - 1, index);
            if (rightMostTile) {
                const label = new Label({
                    text: columnGoal.toString(),
                    font: this.goalFont
                });
                label.pos = rightMostTile.pos.add(vec(32, 32));
                scene.add(label);
            }
        }

        for (let [index, rowGoal] of this.goals.rows.entries()) {
            
            const bottomMostTile = this.iso.getTile(index, dimension - 1);
            if (bottomMostTile) {
                const label = new Label({
                    text: rowGoal.toString(),
                    font: this.goalFont
                });
                label.pos = bottomMostTile.pos.add(vec(-32, 32));
                scene.add(label);
            }
        }
    }

    showHighlight(pos: Vector) {
        const tile = this.iso.getTileByPoint(pos.add(vec(0, 32)));
        if (tile) {
            this.highlight.graphics.visible = true;
            this.highlight.pos = tile.pos.add(vec(0, 32));
        } else {
            this.hideHighlight();
        }
    }

    hideHighlight() {
        this.highlight.graphics.visible = false;
    }


    addUnit(unit: Unit, x: number, y: number) {
        const tile = this.iso.getTile(x, y);
        if (tile) {
            unit.pos = tile.pos;
            unit.addComponent(new IsometricEntityComponent(this.iso));
            this.scene.add(unit);
            this.grid[x + y * this.dimension] = unit;
        }
    }

    checkSolved(): boolean {
        for (let x = 0; x < this.dimension; x++) {
            let colSum = 0;
            for (let y = 0; y < this.dimension; y++) {
                colSum += this.grid[x + y * this.dimension]?.config.value ?? 0
            }
           if (colSum != this.goals.columns[x]) return false;
        }
        for (let y = 0; y < this.dimension; y++) {
            let rowSum = 0;
            for (let x = 0; x < this.dimension; x++) {
                rowSum += this.grid[x + y * this.dimension]?.config.value ?? 0
            }
            if (rowSum != this.goals.rows[y]) return false;
        }
        return true;
    }

}