function seed() {
    return Array.from(arguments);
}

function same([x, y], [j, k]) {
    return x === j && y === k;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
    return this.some(same.bind(this, cell));
}

const printCell = (cell, state) => {
    const alive = '\u25A3';
    const dead = '\u25A2';
    
    return contains.call(state, cell) ? alive : dead;
};

const corners = (state = []) => {
    let topRightX = 0;
    let topRightY = 0;
    let bottomLeftX = 0;
    let bottomLeftY = 0;
    
    if (state.length === 0) {
        return {topRight: [topRightX, topRightY], bottomLeft: [bottomLeftX, bottomLeftY]};
    }
    
    const aliveCells = state.filter(contains.bind(state));
    
    topRightX = Math.max(...aliveCells.map(([x, y]) => x));
    topRightY = Math.max(...aliveCells.map(([x, y]) => y));
    
    bottomLeftX = Math.min(...aliveCells.map(([x, y]) => x));
    bottomLeftY = Math.min(...aliveCells.map(([x, y]) => y));

    return {topRight: [topRightX, topRightY], bottomLeft: [bottomLeftX, bottomLeftY]};
};

const printCells = (state) => {
    const {topRight, bottomLeft} = corners(state);
    const width = topRight[0] - bottomLeft[0] + 1;
    const height = topRight[1] - bottomLeft[1] + 1;
    const cells = Array(height).fill('\u25A2').map(() => Array(width).fill('\u25A2'));
    
    cells.forEach((row, y) => {
       row.forEach((cell, x) => {
           cells[y][x] = printCell([x + bottomLeft[0], y + bottomLeft[1]], state);
       });
    });
    
    return cells.reverse().map(row => row.join(' ')).join('\n');
};

const getNeighborsOf = ([x, y]) => {
    return [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y], [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
    ];
};

const getLivingNeighbors = (cell, state) => {
    const neighbors = getNeighborsOf(cell);
    return neighbors.filter(contains.bind(state));
};

const willBeAlive = (cell, state) => {
    let livingNeighbors = getLivingNeighbors(cell, state);
    let alive = contains.call(state, cell);

    return (alive && livingNeighbors.length === 2) || livingNeighbors.length === 3;
};

const calculateNext = (state) => {
    let currentCorners = corners(state);
    currentCorners.topRight[0]++;
    currentCorners.topRight[1]++;
    currentCorners.bottomLeft[0]--;
    currentCorners.bottomLeft[1]--;

    let nextState = [];
    for (let y = currentCorners.bottomLeft[1]; y <= currentCorners.topRight[1]; y++) {
        for (let x = currentCorners.bottomLeft[0]; x <= currentCorners.topRight[0]; x++) {
            if (willBeAlive([x, y], state)) {
                nextState.push([x, y]);
            }
        }
    }

    return nextState;
};

const iterate = (state, iterations) => {
    let states = [state];
    for (let i = 0; i < iterations; i++) {
        state = calculateNext(state);
        states.push(state);
    }
    return states;
};

const main = (pattern, iterations) => {
    let state = seed(...startPatterns[pattern])
    let states = [state];
    
    for (let i = 0; i < iterations; i++) {
        state = calculateNext(state);
        states.push(state);
    }
    
    states.map(x => console.log(printCells(x)));
};

const startPatterns = {
    rpentomino: [
        [3, 2],
        [2, 3],
        [3, 3],
        [3, 4],
        [4, 4]
    ],
    glider: [
        [-2, -2],
        [-1, -2],
        [-2, -1],
        [-1, -1],
        [1, 1],
        [2, 1],
        [3, 1],
        [3, 2],
        [2, 3]
    ],
    square: [
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2]
    ]
};

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
        main(pattern, parseInt(iterations));
    } else {
        console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;