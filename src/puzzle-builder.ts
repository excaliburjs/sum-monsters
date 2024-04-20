import { vec } from "excalibur";
import { PuzzleGrid, ValueHintSprite } from "./puzzle-grid";
import { Unit, UnitConfig, UnitsConfig, UnitType, UnitNumberToUnitType } from "./unit";
import Config from "./config";
import { Inventory, InventoryConfig } from "./inventory";
import { Level } from "./levels/main-level";


function canonicalValue(val: string | number) {
    return typeof val === 'string' ? 0 : val;
}

function calculatePuzzleGoals(puzzleIndex: number) {
    const puzzleArray = (Config.puzzles as any)[puzzleIndex].grid;
    
    const solutionRows: number[] = puzzleArray.map((row: number[]) => row.reduce((a, b) => canonicalValue(a) + canonicalValue(b)));
    const solutionColumns: number[] = puzzleArray.reduce((a: number[], b: number[]) => a.map((x, i) => canonicalValue(x) + canonicalValue(b[i])));
    
    return {
        columns: solutionColumns,
        rows: solutionRows,
    }
}
export function hasPuzzle(puzzleIndex: number): boolean {
    return !!(Config.puzzles as any)[puzzleIndex];
}

function populatePuzzle(puzzleIndex: number, puzzleGrid: PuzzleGrid) {
    const puzzleArray = (Config.puzzles as any)[puzzleIndex].grid;
    console.log({puzzleArray});
    
    for(let i=0; i < puzzleArray.length; i++) {
        let row = puzzleArray[i];
        for(let j=0; j < row.length; j++) {
            const cellValue = row[j];
            // add enemies
            if (cellValue < 0) {
                const unitType = UnitNumberToUnitType.get(cellValue);
                if (unitType) {
                    const unit = new Unit({type: unitType})
                    puzzleGrid.addUnit(unit, j, i)
                    const valueHint = puzzleGrid.getValueHint(j,i)
                    if (valueHint) {
                        valueHint.graphics.use(ValueHintSprite[unitType]);
                        unit?.actions.fade(Config.units.opacityAfterPlacement, Config.units.enemies.fadeSpeedMs).callMethod(() => {
                            valueHint.graphics.visible = true;
                            valueHint.graphics.opacity = Config.valueHint.opacity;
                        });
                    }
                } else {
                    console.error(`No unit type matches the number ${cellValue}`);
                }
            } else if (cellValue === 0 || typeof cellValue === 'string') {
                // add immovable terrain
                switch(cellValue) {
                    case 'w': {
                        puzzleGrid.addUnit(new Unit({type: 'wall'}), j, i);
                        break;
                    }
                    case 'p': {
                        puzzleGrid.addUnit(new Unit({type: 'pit'}), j, i);
                        break;
                    }
                    case 'r': {
                        puzzleGrid.addUnit(new Unit({type: 'rubble'}), j, i);
                        break;
                    }
                }
            }
        }
    }
}

export function calculateInventory(puzzleIndex: number, level: Level): InventoryConfig {
    const puzzleArray = (Config.puzzles as any)[puzzleIndex].grid;
    
    let reverseMap: {[id:number]: UnitType} = {};
    for(let r of Object.keys(UnitsConfig)) {
        let unit = ((UnitsConfig as any)[r] as UnitConfig);
        reverseMap[unit.value] = r as UnitType;
    }
    let counts: Record<string, number> = {
        dragon: 0,
        orc: 0,
        goblin: 0,
        rat: 0
    };
    
    for(let i = 0; i < puzzleArray.length; i++){
        for(let j = 0; j < puzzleArray[i].length; j++) {
            counts[
                reverseMap[puzzleArray[j][i]]
            ] ++;
        }
    }
    return counts as InventoryConfig;
}

export function buildPuzzle(puzzleIndex: number, level: Level): PuzzleGrid {
    console.log({puzzleIndex});
    const puzzleGoals = calculatePuzzleGoals(puzzleIndex);
    
    const puzzleGrid = new PuzzleGrid(level, {
        pos: vec(400, 100),
        dimension: puzzleGoals.columns.length,
        goals: {
            // the tilemap is in column-major order, but the config puzzle data structure is in row-major order, so we flip them here to make them line up in the game correctly
            columns: puzzleGoals.rows, 
            rows: puzzleGoals.columns
        }
    });
    puzzleGrid.puzzleTitle.text = `Level ${puzzleIndex + 1}`
    
    populatePuzzle(puzzleIndex, puzzleGrid)
    
    return puzzleGrid;
}
