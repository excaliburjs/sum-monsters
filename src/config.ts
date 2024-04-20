
export default {
    SoundVolume: 0.05,
    BackgroundMusicVolume: 0.25,

    valueHint:{
        opacity: 1,
    },

    showBoardHighlights: true,

    skipTutorial: false,

    units: {
        opacityAfterPlacement: 0.75,
        monsters: {
            fadeSpeedMs: 1250,
        },
        enemies: {
            fadeSpeedMs: 2000,
        }
    },

    // 'r': crystal shards (rubble)
    // 'p': pit
    // 'w': gravestones (wall)

    startingPuzzle: 0,
    puzzles: {
        // 2x2 puzzles
        0: {
            grid: [
                [2, 5],
                [3, 1]
            ],
        },
        1: {
            grid: [
                [3, 1],
                [1, 2]
            ],
        },
        2: {
            grid: [
                [2, 1],
                [3, 5]
            ],
        },

        // 3x3 puzzles
        3: {
            grid: [
                [5, 2, 2],
                [5, 'p', 5],
                [1, 5, 3]
            ],
        },
        4: {
            grid: [
                [2, 'w', 2],
                [5, 2, 1],
                [1, 5, 3]
            ],
        },
        5: {
            grid: [
                [3, 2, -2],
                [1, 5, 1],
                [2, 'r', 2]
            ],
        },

        // 4x4 puzzles
        6: {
            grid: [
                [3, 'r', 1, 2],
                [-5, 2, 1,'w'],
                ['p', -2, 2, 5],
                [2, 5, 2, -2]
            ]
        },
        7: {
            grid: [
                [5, 2, 1, 5],
                [2, -5, 'p', 'r'],
                [1, 'p', -2, 5],
                [2, 3, 2, 1]
            ]
        },
        8: {
            grid: [
                ['r', 5, 3, 'r'],
                [-5, 2, 5, 1],
                [-2, 1, 2, 3],
                ['r', 1, 3, 'r']
            ]
        },

        // 5x5 puzzles
        9: {
            grid: [
                [2, 1, 'w', 2, 'w'],
                [1, 'r', 3, 5, -2],
                [-5, 2, 5, 'p', 'p'],
                [3, 1, 5, 3, 3],
                ['p', -2, -5, 1, 'r']
            ]
        }
    }
};