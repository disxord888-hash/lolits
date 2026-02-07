/**
 * lolits - World Guideline Implementation
 */

// --- Constants ---
const COLS = 10;
const ROWS = 26; // Increased from 20 to 26
const BLOCK_SIZE = 28;
const VISIBLE_HEIGHT = 20.3; // 20 full rows + 0.3 of the 21st row
const TOP_OFFSET = 5.7; // Start visible area at index 5.7 (Row 5 is the 21st row)

const PIECE_SETS = {
    3: {
        'I3': [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'L3': [
            [1, 1],
            [1, 0]
        ]
    },
    4: {
        'I': [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        'O': [
            [1, 1],
            [1, 1]
        ],
        'T': [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'S': [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        'Z': [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        'J': [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        'L': [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ]
    },
    5: {
        'F': [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'I5': [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'L5': [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'P': [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'N': [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0]
        ],
        'T5': [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'U': [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'V': [
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0]
        ],
        'W': [
            [0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'X': [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'Y': [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'Z5': [
            [0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0],
            [0, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    },
    6: {
        'H-I': [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
        'H-O': [[0, 0, 0, 0], [1, 1, 1], [1, 1, 1], [0, 0, 0]],
        'H-T': [[0, 1, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
        'H-L': [[0, 1, 0, 0, 0], [0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
        'H-J': [[0, 0, 0, 0, 1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0]],
        'H-S': [[0, 0, 1, 1, 1], [1, 1, 1, 0, 0]],
        'H-Z': [[1, 1, 1, 0, 0], [0, 0, 1, 1, 1]],
        'H-P': [[1, 1, 1], [1, 1, 1]],
        'H-X': [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
        'H-Y': [[0, 0, 1, 0, 0], [1, 1, 1, 1, 1]],
        'H-U': [[1, 0, 1], [1, 1, 1], [0, 1, 0]],
        'H-F': [[0, 1, 1, 0, 0], [1, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
        'H-W': [[1, 1, 0, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 1, 0]],
        'H-V': [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 1, 0]],
        'H-M': [[1, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 1]],
        'H-N': [[0, 1, 1, 1], [1, 1, 1, 0]],
        'H-E': [[1, 1, 1], [1, 0, 0], [1, 1, 0]],
        'H-C': [[1, 1, 1], [1, 0, 1], [1, 0, 0]],
        'H-G': [[1, 1, 1], [0, 1, 1], [0, 0, 1]],
        'H-K': [[1, 0, 0], [1, 1, 1], [0, 1, 1]],
        'H-A': [[0, 1, 0], [1, 1, 1], [1, 1, 0]],
        'H-B': [[0, 1, 0], [1, 1, 1], [0, 1, 1]],
        'H-Q': [[1, 1, 1, 1], [0, 1, 1, 0]],
        'H-R': [[1, 1, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1]],
        'H-1': [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
        'H-2': [[1, 1, 0], [0, 1, 1], [1, 1, 0]],
        'H-3': [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0]],
        'H-4': [[1, 1, 1, 1], [1, 1, 0, 0]],
        'H-5': [[1, 1, 1, 1], [0, 0, 1, 1]],
        'H-6': [[1, 1, 1, 0], [0, 0, 1, 1], [0, 1, 0, 0]],
        'H-7': [[1, 1, 1], [1, 1, 0], [0, 1, 0]],
        'H-8': [[1, 1, 1], [0, 1, 1], [0, 1, 0]],
        'H-9': [[1, 0, 0], [1, 1, 1], [0, 0, 1], [0, 0, 1]],
        'H-10': [[1, 1, 0], [0, 1, 1], [0, 1, 1]],
        'H-11': [[1, 0, 0], [1, 1, 0], [0, 1, 1], [0, 0, 1]]
    }
};

const SHAPES = PIECE_SETS[4]; // Default

const COLORS = {
    'I': '#00f0f0', 'O': '#f0f000', 'T': '#a000f0', 'S': '#00f000', 'Z': '#f00000', 'J': '#0000f0', 'L': '#f0a000',
    'I3': '#00f0f0', 'L3': '#f0a000',
    'F': '#00f000', 'I5': '#00f0f0', 'L5': '#f0a000', 'P': '#f0f000', 'N': '#a000f0', 'T5': '#f00000',
    'U': '#0000f0', 'V': '#ff00ff', 'W': '#00ff00', 'X': '#ffffff', 'Y': '#ffff00', 'Z5': '#ff7f00',
    'H-I': '#00f0f0', 'H-O': '#f0f000', 'H-T': '#a000f0', 'H-S': '#00f000', 'H-Z': '#f00000', 'H-J': '#0000f0', 'H-L': '#f0a000',
    'H-P': '#ff7f00', 'H-X': '#ffffff', 'H-Y': '#ffff00', 'H-U': '#007fff', 'H-F': '#7f7f00', 'H-W': '#007f00', 'H-V': '#7f0000',
    'H-M': '#7f007f', 'H-N': '#007f7f', 'H-E': '#ff007f', 'H-C': '#7fff00', 'H-G': '#00ff7f', 'H-K': '#7f00ff', 'H-A': '#ff7f7f',
    'H-B': '#7f7fff', 'H-Q': '#ffff7f', 'H-R': '#7fffff', 'H-1': '#ff7fff', 'H-2': '#7fff7f', 'H-3': '#ffffff', 'H-4': '#cccccc',
    'H-5': '#999999', 'H-6': '#666666', 'H-7': '#333333', 'H-8': '#ff9900', 'H-9': '#99ff00', 'H-10': '#0099ff', 'H-11': '#ff0099',
    'G': 'rgba(255, 255, 255, 0.15)'
};

// SRS Wall Kick Data
const WALL_KICK_J_L_T_S_Z = [
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 0->1
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],      // 1->0
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],      // 1->2
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 2->1
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],     // 2->3
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],   // 3->2
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],   // 3->0
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]      // 0->3
];

const WALL_KICK_I = [
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],    // 0->1
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],    // 1->0
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],    // 1->2
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],    // 2->1
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],    // 2->3
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],    // 3->2
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],    // 3->0
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]     // 0->3
];

// Mapping rotation transitions to index in kick table
const KICK_TRANSITIONS = {
    '0-1': 0, '1-0': 1,
    '1-2': 2, '2-1': 3,
    '2-3': 4, '3-2': 5,
    '3-0': 6, '0-3': 7
};

let time = 0; // Global variable for lock delay

class Tetrimino {
    constructor(type, shapes) {
        this.type = type;
        const rawMatrix = shapes[type];

        // 1. Collect blocks to find bounding box and normalize
        const blocks = [];
        rawMatrix.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val !== 0) blocks.push({ x, y, val });
            });
        });

        if (blocks.length === 0) {
            this.matrix = [[0]];
        } else {
            const minX = Math.min(...blocks.map(b => b.x));
            const maxX = Math.max(...blocks.map(b => b.x));
            const minY = Math.min(...blocks.map(b => b.y));
            const maxY = Math.max(...blocks.map(b => b.y));

            const width = maxX - minX + 1;
            const height = maxY - minY + 1;

            // Determine square size
            let size = Math.max(width, height);

            // Special handling for standard Tetrominos to match SRS matrices
            if (this.type === 'I') size = 4;
            else if (['T', 'S', 'Z', 'J', 'L'].includes(this.type)) size = 3;
            else if (this.type === 'O') size = 2;

            this.matrix = Array.from({ length: size }, () => Array(size).fill(0));

            // Center the block within the square matrix
            // Use Math.floor for offsets to match SRS conventions where possible
            const offsetX = Math.floor((size - width) / 2);
            const offsetY = Math.floor((size - height) / 2);

            blocks.forEach(b => {
                const targetX = b.x - minX + offsetX;
                const targetY = b.y - minY + offsetY;
                if (targetX >= 0 && targetX < size && targetY >= 0 && targetY < size) {
                    this.matrix[targetY][targetX] = b.val;
                }
            });
        }

        this.resetPosition();
        this.rotation = 0; // 0, 1, 2, 3
        this.visualY = this.y;
        this.isMoving = false; // Whether the block is currently moving or rotating
        this.lockMoveCount = 0; // Number of moves/rotates while on ground (guide-line limit: 15)
    }

    updateVisuals(deltaTime) {
        // Return to instant snapping for perfectly crisp control
        this.visualX = this.x;
        this.visualY = this.y;
    }

    resetPosition() {
        this.x = Math.floor(COLS / 2) - Math.ceil(this.matrix[0].length / 2);

        // Find the lowest row index in the matrix that contains a block
        let lowestLocalY = 0;
        for (let y = 0; y < this.matrix.length; y++) {
            if (this.matrix[y].some(v => v !== 0)) {
                lowestLocalY = y;
            }
        }
        // Set y so that the bottom of the piece is at index 5 (Row 21)
        this.y = 5 - lowestLocalY;
    }

    rotateMatrix(dir) {
        const size = this.matrix.length;
        const result = Array.from({ length: size }, () => Array(size).fill(0));

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (dir > 0) {
                    result[x][size - 1 - y] = this.matrix[y][x];
                } else {
                    result[size - 1 - x][y] = this.matrix[y][x];
                }
            }
        }
        return result;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.canvas.width = COLS * BLOCK_SIZE;
        this.canvas.height = VISIBLE_HEIGHT * BLOCK_SIZE;

        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.lineGoal = 0; // 0: Endless, 40, 80, 120
        this.elapsedTime = 0; // in ms

        this.bag = [];
        this.nextQueue = [];
        this.piece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.combo = -1;
        this.b2b = false;
        this.actionTimeout = null;
        this.particles = [];
        this.shake = 0;
        this.beams = [];
        this.tSpinCount = 0;
        this.lolitsCount = 0;
        this.flashes = [];
        this.lockFlashes = [];
        this.isTSpin = false;
        this.lastMoveWasRotate = false;
        this.attack = 0;
        this.totalAttack = 0;
        this.tSpinType = 0;

        this.currentMode = 4;
        this.shapes = PIECE_SETS[this.currentMode];

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lockDelay = 500; // Standard lock delay (ms)
        this.lastTime = 0;
        this.gravityG = 0.02; // Blocks per frame (Initial: 0.02G)

        this.paused = true;
        this.gameOver = false;
        this.gameStarted = false;

        // DAS/ARR Settings (in ms)
        this.DAS_DELAY = 300; // Guideline: 0.3s (300ms) initial delay
        this.ARR_SPEED = 55;  // Guideline: approx 0.5s for edge-to-edge (500ms/9 blocks)
        this.dasCounter = 0;
        this.arrCounter = 0;
        this.moveDir = 0; // -1: Left, 0: None, 1: Right
        this.softDropActive = false;

        this.placedPieces = 0;
        this.gameStartTime = Date.now();
        this.lastPieceLockTime = Date.now();
        this.currentPPS = 0;

        this.highScore = 0;

        this.init();
    }

    init() {
        this.fillNextQueue();
        this.spawnPiece();
        this.updateStats();
        this.updateVisibility();
        this.draw();

        // Bind events
        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());
        document.getElementById('reset-data-btn').addEventListener('click', () => this.clearData());
        document.getElementById('save-state-btn').addEventListener('click', () => this.saveGameState());
        document.getElementById('load-state-btn').addEventListener('click', () => document.getElementById('load-file-input').click());
        document.getElementById('load-file-input').addEventListener('change', (e) => this.loadGameState(e));
        document.getElementById('surrender-btn').addEventListener('click', () => this.surrender());

        // Mode Switcher Events
        const modeBtn = document.getElementById('mode-btn');
        const modeMenu = document.getElementById('mode-menu');
        modeBtn.addEventListener('click', () => modeMenu.classList.toggle('hidden'));
        document.querySelectorAll('.mode-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const mode = parseInt(opt.dataset.mode);
                this.switchMode(mode);
                modeMenu.classList.add('hidden');
            });
        });

        // Goal Switcher Events
        const goalBtn = document.getElementById('goal-btn');
        const goalMenu = document.getElementById('goal-menu');
        goalBtn.addEventListener('click', () => goalMenu.classList.toggle('hidden'));
        document.querySelectorAll('.goal-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const goal = parseInt(opt.dataset.goal);
                this.switchGoal(goal);
                goalMenu.classList.add('hidden');
            });
        });

        // Close menus on outside click
        document.addEventListener('click', (e) => {
            if (!modeBtn.contains(e.target) && !modeMenu.contains(e.target)) {
                modeMenu.classList.add('hidden');
            }
            if (!goalBtn.contains(e.target) && !goalMenu.contains(e.target)) {
                goalMenu.classList.add('hidden');
            }
        });



        // Show start overlay
        this.showOverlay('lolits', 'Press SPACE to Start');
    }

    createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    fillNextQueue() {
        while (this.nextQueue.length < 6) {
            if (this.bag.length === 0) {
                this.bag = Object.keys(this.shapes);
                // Shuffle bag
                for (let i = this.bag.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
                }
            }
            this.nextQueue.push(this.bag.pop());
        }
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        this.shapes = PIECE_SETS[mode];
        document.getElementById('mode-btn').innerText = `MODE: ${mode}-BLOCK`;
        this.reset();
        this.showActionMessage(`${mode}-BLOCK MODE`, -1, 0);
    }

    spawnPiece(type = null) {
        this.piece = new Tetrimino(type || this.nextQueue.shift(), this.shapes);
        time = 0; // Reset lock delay on spawn
        this.piece.visualX = this.piece.x;
        this.piece.visualY = this.piece.y;
        this.fillNextQueue();
        this.canHold = true;
        this.isTSpin = false; // Reset T-Spin flag on spawn
        this.lastMoveWasRotate = false;

        if (this.collide()) {
            this.gameOver = true;
            this.showOverlay('GAME OVER', 'Press ENTER to Restart');
        }
    }

    hold() {
        if (!this.canHold || this.paused || this.gameOver) return;

        const currentType = this.piece.type;
        if (this.holdPiece === null) {
            this.holdPiece = currentType;
            this.spawnPiece();
        } else {
            const nextType = this.holdPiece;
            this.holdPiece = currentType;
            this.spawnPiece(nextType);
        }

        this.canHold = true; // Allow switching back and forth while falling
        this.drawHold();
    }

    collide(matrix = this.piece.matrix, offset = { x: this.piece.x, y: this.piece.y }) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const nextX = x + offset.x;
                    const nextY = y + offset.y;
                    if (nextX < 0 || nextX >= COLS || nextY >= ROWS || (nextY >= 0 && this.grid[nextY][nextX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    merge() {
        this.piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const gridY = y + this.piece.y;
                    if (gridY >= 0) {
                        this.grid[gridY][x + this.piece.x] = this.piece.type;
                    }
                }
            });
        });
    }

    rotate(dir) {
        if (this.piece.type === 'O') return;

        const startRotation = this.piece.rotation;
        const nextRotation = (startRotation + dir + 4) % 4;
        const matrix = this.piece.rotateMatrix(dir);

        // SRS Wall Kick (Only for Tetrimino 4-block pieces)
        if (this.currentMode === 4) {
            const kickTable = (this.piece.type === 'I') ? WALL_KICK_I : WALL_KICK_J_L_T_S_Z;
            const transitionKey = `${startRotation}-${nextRotation}`;
            const kickIndex = KICK_TRANSITIONS[transitionKey];
            const kicks = kickTable[kickIndex];

            for (let i = 0; i < kicks.length; i++) {
                const [kx, ky] = kicks[i];
                if (!this.collide(matrix, { x: this.piece.x + kx, y: this.piece.y - ky })) {
                    this.applyRotation(matrix, kx, -ky, nextRotation, i);
                    return;
                }
            }
        } else {
            // Basic rotation + simple wall kicks for other modes (3, 5, 6-block)
            // For larger blocks, we try a bit more displacement
            const kicks = [
                [0, 0],   // No kick
                [-1, 0],  // Left
                [1, 0],   // Right
                [0, -1],  // Up
                [-2, 0],  // Left 2
                [2, 0],   // Right 2
                [0, -2],  // Up 2 (Important for long pieces)
                [-1, -1], // Diagonal UP-LEFT
                [1, -1]   // Diagonal UP-RIGHT
            ];

            for (const [kx, ky] of kicks) {
                if (!this.collide(matrix, { x: this.piece.x + kx, y: this.piece.y + ky })) {
                    this.applyRotation(matrix, kx, ky, nextRotation, -1);
                    return;
                }
            }
        }
    }

    applyRotation(matrix, dx, dy, nextRotation, kickIndex) {
        this.piece.matrix = matrix;
        this.piece.x += dx;
        this.piece.y += dy;
        this.piece.rotation = nextRotation;

        // T-Spin detection flag (only for 4-block T piece)
        if (this.piece.type === 'T') {
            this.tSpinType = this.checkTSpin(kickIndex);
        } else {
            this.tSpinType = 0;
        }
        this.lastMoveWasRotate = true;

        // If on ground, increment lock move count and reset delay
        this.piece.y++;
        if (this.collide()) {
            this.piece.lockMoveCount++;
            this.piece.isMoving = true;
        }
        this.piece.y--;
    }

    checkTSpin(kickIndex) {
        // 3-corner rule: T-center is at (x+1, y+1)
        const corners = [
            { x: this.piece.x, y: this.piece.y },     // Top-left
            { x: this.piece.x + 2, y: this.piece.y },     // Top-right
            { x: this.piece.x, y: this.piece.y + 2 }, // Bottom-left
            { x: this.piece.x + 2, y: this.piece.y + 2 }  // Bottom-right
        ];

        let occupied = 0;
        corners.forEach(p => {
            if (p.x < 0 || p.x >= COLS || p.y >= ROWS || (p.y >= 0 && this.grid[p.y][p.x] !== 0)) {
                occupied++;
            }
        });

        if (occupied < 3) return 0;

        // SRS 5th kick (index 4) is always full T-Spin
        if (kickIndex === 4) return 2;

        // Check if it's "Mini"
        // Front corners are the two corners toward the T-head
        // Rotation 0: Front is (0,0) and (2,0)
        let isMini = false;
        const rot = this.piece.rotation;
        const frontOverlap = [
            [0, 1], // Rot 0 (North): Corners 0 and 1 are front
            [1, 3], // Rot 1 (East): Corners 1 and 3 are front
            [2, 3], // Rot 2 (South): Corners 2 and 3 are front
            [0, 2]  // Rot 3 (West): Corners 0 and 2 are front
        ][rot];

        let frontOccupied = 0;
        frontOverlap.forEach(idx => {
            const p = corners[idx];
            if (p.x < 0 || p.x >= COLS || p.y >= ROWS || (p.y >= 0 && this.grid[p.y][p.x] !== 0)) {
                frontOccupied++;
            }
        });

        // If only one front corner is occupied, it's Mini
        if (frontOccupied < 2) return 1;

        return 2; // Full T-Spin
    }

    drop(isManual = false) {
        if (this.paused || this.gameOver) return;
        this.piece.y++;
        if (this.collide()) {
            this.piece.y--;
            // Do not lock immediately here; let the lock delay handle it
        } else {
            this.lastMoveWasRotate = false;
            time = 0; // Reset lock delay on successful move down
            if (isManual) {
                this.score += 2; // Soft drop points
                this.updateStats();
            }
        }
        this.dropCounter = 0;
    }

    hardDrop() {
        if (this.paused || this.gameOver) return;
        const startY = this.piece.y;
        while (!this.collide()) {
            this.piece.y++;
        }
        this.piece.y--;
        const droppedLines = this.piece.y - startY;
        this.score += droppedLines * 2;
        this.shake = 10;
        this.createHardDropBeam(this.piece.x, startY, this.piece.y, this.piece.type);
        this.lock(false);
        this.updateStats();
    }


    lock(isSoftDrop = false) {
        // --- Lock Out Check ---
        // If the piece locks entirely above the visible field (Row 6+), it's a Game Over.
        // In our 26-row grid, rows 0-5 are the buffer/spawn zone.
        const isLockOut = this.piece.matrix.every((row, y) => {
            return row.every((val, x) => {
                const globalY = this.piece.y + y;
                return val === 0 || globalY < 6;
            });
        });

        if (isLockOut) {
            this.gameOver = true;
            this.showOverlay('GAME OVER', 'LOCK OUT\nPress ENTER to Restart');
            return;
        }

        // Create lock flash effect before merging/spawning
        this.piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.lockFlashes.push({
                        x: this.piece.x + x,
                        y: this.piece.y + y,
                        life: 1.0,
                        color: COLORS[this.piece.type]
                    });
                }
            });
        });

        this.merge();
        this.placedPieces++; // Increment pieces placed

        // Calculate Instant PPS (Speed of the last piece)
        const now = Date.now();
        const pieceTime = (now - this.lastPieceLockTime) / 1000;
        if (pieceTime > 0) {
            this.currentPPS = 1 / pieceTime;
        }
        this.lastPieceLockTime = now;

        // Check T-Spin status: must be T-piece and last move was rotate
        const tspinResult = (this.piece.type === 'T' && this.lastMoveWasRotate) ? this.tSpinType : 0;
        this.clearLines(tspinResult, isSoftDrop);
        this.spawnPiece();
        this.updateStats();
        this.lastMoveWasRotate = false;
        this.tSpinType = 0;
    }

    clearLines(tspinResult = 0, isSoftDrop = false) {
        let fullRows = [];
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(v => v !== 0)) {
                fullRows.push(y);
            }
        }

        const linesCleared = fullRows.length;
        const isTSpin = tspinResult > 0;
        const isMini = tspinResult === 1;

        if (linesCleared > 0 || isTSpin) {
            // Determine if it's a "Split" or "One-Two" (Sega Style)
            const isNonContiguous = linesCleared > 1 && (Math.max(...fullRows) - Math.min(...fullRows) + 1) > linesCleared;

            // Remove full rows
            fullRows.sort((a, b) => a - b).forEach(y => {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
            });

            // Trigger effects
            fullRows.forEach(y => {
                this.createLineClearParticles(y, isSoftDrop ? 0.3 : 1.0);
                this.flashes.push({ y, life: isSoftDrop ? 0.4 : 1.0 });
            });
            const baseShake = linesCleared === 4 ? 20 : 10;
            this.shake = isSoftDrop ? baseShake * 0.3 : baseShake;

            // Combo (REN) Calculation
            if (linesCleared > 0) {
                this.combo++; // First clear makes it 0, second makes it 1 (1 REN)
            } else {
                this.combo = -1;
            }

            let actionText = "";
            const isDifficult = linesCleared === 4 || isTSpin;

            if (isTSpin) {
                const prefix = isMini ? "T-SPIN MINI" : "T-SPIN";
                const suffixes = ["", " SINGLE", " DOUBLE", " TRIPLE"];
                actionText = prefix + suffixes[Math.min(linesCleared, 3)];
            } else if (linesCleared === 4) {
                actionText = "LOLITS";
            } else if (isNonContiguous) {
                if (linesCleared === 2) actionText = "SPLIT";
                else if (linesCleared === 3) actionText = "ONE-TWO";
            } else {
                const names = ["", "SINGLE", "DOUBLE", "TRIPLE", "LOLITS"];
                actionText = names[linesCleared];
            }

            if (isDifficult) {
                if (this.b2b) {
                    actionText = "B2B " + actionText;
                }
                this.b2b = true;

                // Increment counters for difficult moves
                if (isTSpin) this.tSpinCount++;
                if (linesCleared === 4) this.lolitsCount++;
            } else if (linesCleared > 0) {
                this.b2b = false;
            }

            // Score points based on guideline approx
            let points = 0;
            const b2bMult = this.b2b ? 1.5 : 1.0;

            if (isTSpin) {
                if (isMini) {
                    const miniPoints = [100, 200, 400];
                    points = miniPoints[linesCleared] || 100;
                } else {
                    const tspinPoints = [400, 800, 1200, 1600];
                    points = tspinPoints[linesCleared];
                }
            } else {
                const normalPoints = [0, 100, 300, 500, 800];
                points = normalPoints[linesCleared];
            }

            const comboBonus = Math.max(0, this.combo) * 50;
            this.score += Math.floor((points * b2bMult + comboBonus) * this.level);

            if (actionText || this.combo > 0) {
                // Calculate Attack based on user provided table
                let currentAttack = 0;
                const isB2B = this.b2b && isDifficult; // Wait, B2B bonus only applies if LAST move was also difficult

                if (isTSpin) {
                    if (isMini) {
                        currentAttack = isB2B ? 1 : 0;
                    } else {
                        const tSpinAttacks = [0, 2, 4, 6];
                        currentAttack = tSpinAttacks[linesCleared] || 0;
                        if (isB2B) currentAttack += 1;
                    }
                } else if (linesCleared === 4) {
                    currentAttack = isB2B ? 5 : 4;
                } else {
                    const normalAttacks = [0, 0, 1, 2];
                    currentAttack = normalAttacks[linesCleared] || 0;
                }

                // Add Combo (REN) Damage (Based on user REN table)
                // In this logic: combo 1 = 1REN, combo 2 = 2REN, etc.
                if (this.combo >= 2) {
                    let comboBonus = 0;
                    if (this.combo === 2 || this.combo === 3) comboBonus = 1;
                    else if (this.combo === 4 || this.combo === 5) comboBonus = 2;
                    else if (this.combo === 6 || this.combo === 7) comboBonus = 3;
                    else if (this.combo >= 8 && this.combo <= 10) comboBonus = 4;
                    else if (this.combo >= 11) comboBonus = 5;
                    currentAttack += comboBonus;
                }

                // Check All Clear (Perfect Clear)
                if (this.checkAllClear()) {
                    currentAttack = 14; // Fixed 14 lines for PC (Tetris 99 style)
                    actionText = "PERFECT CLEAR\n" + actionText;
                }

                this.attack = currentAttack;
                this.totalAttack += currentAttack;

                this.showActionMessage(actionText, this.combo, currentAttack);
            }

            this.lines += linesCleared;

            // Check Line Goal
            if (this.lineGoal > 0 && this.lines >= this.lineGoal) {
                this.gameOver = true;
                const timeTaken = (Date.now() - this.gameStartTime) / 1000;
                const rank = this.getRank(timeTaken, this.lineGoal);
                this.showOverlay('GOAL REACHED!',
                    `Time: ${timeTaken.toFixed(2)}s\nRank: ${rank}\n\nPress ENTER to Restart`);
            }

            this.updateGravity();
            this.updateStats();
        } else {
            this.combo = -1;
            this.attack = 0;
            this.updateStats();
        }
    }

    updateGravity() {
        // NES-style Level progression: every 10 lines
        const oldLevel = this.level;
        this.level = Math.floor(this.lines / 10) + 1;

        if (this.level > oldLevel) {
            this.showActionMessage(`LEVEL ${this.level}`, -1, 0); // Trigger visual for level up
        }

        // NES Gravity Table (Frames per block)
        // Levels 0-9, then groups for 10-12, 13-15, 16-18, 19-28
        const nesFrames = [
            50, 45, 40, 35, 30, 25, 20, 15, 12, 10, // Level 1-10 (More gradual progression)
            9, 8, 8, 7, 7, 6, 6, 5, 5, 4,          // Level 11-20
            4, 3, 3, 2, 2, 2, 1, 1                  // Level 21-28
        ];

        if (this.level < 29) {
            this.gravityG = 1 / nesFrames[this.level - 1];
        } else if (this.level < 235) {
            // Level 29-234: Scaling from 1G (Level 29) towards 20G (Level 235)
            // This represents the "ultra high speed" requested
            this.gravityG = 1.0 + (this.level - 29) * (19.0 / (235 - 29));
        } else {
            // Level 235+: Maximum speed (20G)
            this.gravityG = 20.0;
        }

        // dropInterval calculation (1000ms / (G * 60fps))
        this.dropInterval = 1000 / (this.gravityG * 60);

        // --- Dynamic DAS/ARR update based on level ---
        // Guide-line baseline at level 1, scaling to pro speeds at high levels
        if (this.level < 29) {
            this.DAS_DELAY = Math.max(160, 300 - (this.level - 1) * 5);
            this.ARR_SPEED = Math.max(33, 55 - (this.level - 1) * 0.8);
        } else {
            this.DAS_DELAY = Math.max(120, 160 - (this.level - 29) * 0.2);
            this.ARR_SPEED = Math.max(16, 33 - (this.level - 29) * 0.1);
        }

        // Lockdown (遊び時間) reduction - Shorten lock delay as level increases
        if (this.level >= 29) {
            // Extreme speed: very short lock delay (150ms -> 100ms)
            this.lockDelay = Math.max(100, 200 - (this.level - 29) * 1);
        } else if (this.level > 10) {
            // Gradual reduction from 10 to 29
            this.lockDelay = Math.max(200, 500 - (this.level - 10) * 15);
        } else {
            this.lockDelay = 500;
        }
    }

    checkAllClear() {
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] !== 0) return false;
            }
        }
        return true;
    }

    handleKeyDown(e) {
        if (e.keyCode === 27) { // ESC
            if (this.gameOver) return;
            if (this.paused) this.resume();
            else this.pause();
            e.preventDefault();
            return;
        }

        if (e.keyCode === 13) { // ENTER
            if (this.gameOver) {
                this.reset();
                e.preventDefault();
                return;
            }
        }

        if (e.keyCode === 32) { // SPACE
            if (this.paused && !this.gameOver) {
                this.resume();
            } else if (!this.paused && !this.gameOver) {
                this.hardDrop();
            }
            e.preventDefault();
            return;
        }

        if (this.paused || this.gameOver) return;

        switch (e.keyCode) {
            case 37: // LEFT
            case 65: // A
                if (this.moveDir !== -1) {
                    this.moveSide(-1);
                    this.moveDir = -1;
                    this.dasCounter = 0;
                }
                e.preventDefault();
                break;
            case 39: // RIGHT
            case 68: // D
                if (this.moveDir !== 1) {
                    this.moveSide(1);
                    this.moveDir = 1;
                    this.dasCounter = 0;
                }
                e.preventDefault();
                break;
            case 38: // UP - Rotate CW
            case 87: // W
            case 88: // X
            case 69: // E
                this.rotate(1);
                e.preventDefault();
                break;
            case 40: // DOWN
            case 83: // S
                this.drop(true);
                e.preventDefault();
                break;
            case 90: // Z - Rotate CCW
            case 81: // Q
                if (e.shiftKey && e.keyCode === 81) {
                    this.surrender();
                } else {
                    this.rotate(-1);
                }
                break;
            case 67: // C - Hold
                this.hold();
                break;
            case 80: // P - Pause
                this.pause();
                break;
            default:
                // Handle 1-9 and 0 (KeyCodes 48-57)
                if (e.keyCode >= 48 && e.keyCode <= 57) {
                    const num = e.keyCode === 48 ? 9 : (e.keyCode - 49);
                    this.moveToColumn(num);
                    e.preventDefault();
                }
                break;
        }
    }

    handleKeyUp(e) {
        if ((e.keyCode === 37 || e.keyCode === 65) && this.moveDir === -1) {
            this.moveDir = 0;
        } else if ((e.keyCode === 39 || e.keyCode === 68) && this.moveDir === 1) {
            this.moveDir = 0;
        }
    }

    moveSide(dir) {
        this.piece.x += dir;
        if (this.collide()) {
            this.piece.x -= dir;
            return false;
        }

        // If on ground, increment lock move count and reset delay
        this.piece.y++;
        if (this.collide()) {
            this.piece.lockMoveCount++;
            this.piece.isMoving = true;
        }
        this.piece.y--;

        return true;
    }

    moveToColumn(targetCol) {
        if (!this.piece) return;

        // Find the left-most block column in the piece's matrix
        let firstBlockCol = -1;
        for (let x = 0; x < this.piece.matrix[0].length; x++) {
            for (let y = 0; y < this.piece.matrix.length; y++) {
                if (this.piece.matrix[y][x] !== 0) {
                    firstBlockCol = x;
                    break;
                }
            }
            if (firstBlockCol !== -1) break;
        }

        // Target X for piece matrix so that the first block is at targetCol
        const targetX = targetCol - firstBlockCol;
        const startX = this.piece.x;
        const dir = targetX > startX ? 1 : -1;

        // Move step by step to handle collisions correctly
        let moved = false;
        while (this.piece.x !== targetX) {
            this.piece.x += dir;
            if (this.collide()) {
                this.piece.x -= dir; // Revert
                break;
            }
            moved = true;
        }

        if (moved) {
            this.piece.isMoving = true;
            // Update lock delay if on ground
            this.piece.y++;
            if (this.collide()) {
                this.piece.lockMoveCount++;
            }
            this.piece.y--;
        }
    }

    pause() {
        if (this.gameOver) return;
        this.paused = true;
        this.showOverlay('PAUSED', 'Press SPACE to Resume');
    }

    surrender() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.paused = true;
        this.showOverlay('GAME OVER', 'SURRENDERED\nPress ENTER to Restart');
    }

    resume() {
        if (this.paused && !this.gameOver) {
            this.gameStarted = true;
            this.paused = false;
            this.hideOverlay();
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.update(t));
        }
    }

    getRank(seconds, goal) {
        const mult = goal / 40;
        const s = seconds / mult;

        if (s < 20) return "コンピューター";
        if (s < 30) return "人類到達不可能領域";
        if (s < 31) return "超上級Ｘ級";
        if (s < 32) return "超上級Ｓ級";
        if (s < 33) return "超上級Ａ級";
        if (s < 34) return "超上級Ｂ級";
        if (s < 35) return "超上級Ｃ級";
        if (s < 36) return "上級Ｘ級";
        if (s < 37) return "上級Ｓ級";
        if (s < 38) return "上級Ａ級";
        if (s < 39) return "上級Ｂ級";
        if (s < 40) return "上級Ｃ級";
        if (s < 42) return "ガチ勢準上級クラス";
        if (s < 44) return "一般人から見ればドン引き";
        if (s < 46) return "君は立派なテト勢だ";
        if (s < 48) return "ガチ勢の中ではまだ遅い方";
        if (s < 50) return "積み方によっては十分戦える";
        if (s < 53) return "レート戦の土俵には立てる";
        if (s < 56) return "中級クラス";
        if (s < 60) return "１分の壁は強敵だったな！ 本編開始";
        if (s < 65) return "間も無く１分切り";
        if (s < 70) return "時間の単位「分」とおさらばしたい";
        if (s < 75) return "実はまだレート戦にやるレベルには程遠いんです";
        if (s < 80) return "そろそろ1分切りの世界が見えてくる";
        if (s < 85) return "下級クラス";
        if (s < 90) return "この辺から更新が激減";
        if (s < 100) return "平積みはもう自然に出来る";
        if (s < 110) return "テトリス好きでもなければ十分なライン";
        if (s < 120) return "２分の壁突破 初級レベル";
        if (s < 150) return "２分の壁は簡単に越せます";
        if (s < 180) return "未だにスタート地点";
        if (s < 210) return "初めての人は大体ここ";
        if (s < 240) return "テトリスのルールをあまり把握していない";
        return "むしろよく完走したな";
    }

    switchGoal(goal) {
        this.lineGoal = goal;
        const btnText = goal === 0 ? 'GOAL: ENDLESS' : `GOAL: ${goal} LINES`;
        document.getElementById('goal-btn').innerText = btnText;
        this.updateVisibility();
        this.reset();
        this.showActionMessage(goal === 0 ? "ENDLESS MODE" : `${goal} LINES MODE`, -1, 0);
    }

    updateVisibility() {
        const timerCont = document.getElementById('timer-container');
        const rankCont = document.getElementById('rank-container');
        if (this.lineGoal > 0) {
            timerCont.classList.remove('v-hidden');
            rankCont.classList.remove('v-hidden');
        } else {
            timerCont.classList.add('v-hidden');
            rankCont.classList.add('v-hidden');
        }
    }

    reset() {
        this.hideOverlay();
        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.updateGravity();
        this.bag = [];
        this.nextQueue = [];
        this.holdPiece = null;
        this.gameOver = false;
        this.gameStarted = false;
        this.moveDir = 0;
        this.combo = -1;
        this.b2b = false;
        this.tSpinCount = 0;
        this.lolitsCount = 0;
        this.totalAttack = 0;
        this.fillNextQueue();
        this.spawnPiece();
        this.placedPieces = 0;
        this.gameStartTime = Date.now();
        this.elapsedTime = 0;
        this.lastPieceLockTime = Date.now();
        this.currentPPS = 0;
        this.updateStats();
        this.resume();
        this.drawHold();
    }

    clearData() {
        if (confirm("ハイスコアを含むすべてのゲームデータを消去しますか？\n(This will reset your high score and data)")) {
            this.highScore = 0;
            this.reset();
            this.updateStats();
            this.showActionMessage("DATA CLEARED", -1, 0);
        }
    }

    saveGameState() {
        const state = {
            mode: this.currentMode,
            grid: this.grid,
            score: this.score,
            lines: this.lines,
            level: this.level,
            bag: this.bag,
            nextQueue: this.nextQueue,
            holdPiece: this.holdPiece,
            canHold: this.canHold,
            totalAttack: this.totalAttack,
            elapsedTime: this.elapsedTime,
            lineGoal: this.lineGoal,
            tSpinCount: this.tSpinCount,
            lolitsCount: this.lolitsCount,
            piece: this.piece ? {
                type: this.piece.type,
                matrix: this.piece.matrix,
                x: this.piece.x,
                y: this.piece.y,
                rotation: this.piece.rotation
            } : null
        };
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lolits_state_lv${this.level}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadGameState(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);

                // Initialize mode-specific shapes
                this.currentMode = state.mode || 4;
                this.shapes = PIECE_SETS[this.currentMode];
                document.getElementById('mode-btn').innerText = `MODE: ${this.currentMode}-BLOCK`;

                this.grid = state.grid;
                this.score = state.score;
                this.lines = state.lines;
                this.level = state.level;
                this.bag = [...state.bag];
                this.nextQueue = [...state.nextQueue];
                this.holdPiece = state.holdPiece;
                this.canHold = state.canHold;
                this.totalAttack = state.totalAttack || 0;
                this.elapsedTime = state.elapsedTime || 0;
                this.lineGoal = state.lineGoal || 0;
                this.tSpinCount = state.tSpinCount || 0;
                this.lolitsCount = state.lolitsCount || 0;

                // Update Goal Button Text
                const goalText = this.lineGoal === 0 ? 'GOAL: ENDLESS' : `GOAL: ${this.lineGoal} LINES`;
                document.getElementById('goal-btn').innerText = goalText;

                if (state.piece) {
                    this.piece = new Tetrimino(state.piece.type, this.shapes);
                    this.piece.matrix = state.piece.matrix;
                    this.piece.x = state.piece.x;
                    this.piece.y = state.piece.y;
                    this.piece.rotation = state.piece.rotation;
                    this.piece.visualX = this.piece.x;
                    this.piece.visualY = this.piece.y;
                }

                this.updateGravity();
                this.updateStats();
                this.updateVisibility();
                this.drawHold();
                this.draw();

                // Clear input
                event.target.value = '';

                if (this.paused) {
                    this.resume();
                }

                this.showActionMessage("LOADED", -1, 0);
            } catch (err) {
                console.error(err);
                alert("ファイルの読み込みに失敗しました。正しいJSON形式ではありません。");
            }
        };
        reader.readAsText(file);
    }



    updateStats() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        document.getElementById('high-score').innerText = this.highScore.toString().padStart(6, '0');
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('lines').innerText = this.lines;
        document.getElementById('level').innerText = this.level;
        // Main panel now shows the attack of the current action/combo
        document.getElementById('attack').innerText = this.attack;

        this.updateLiveDisplay();

        const comboEl = document.getElementById('combo');
        comboEl.innerText = Math.max(0, this.combo);
        if (this.combo > 0) {
            comboEl.classList.add('combo-active');
        } else {
            comboEl.classList.remove('combo-active');
        }

        // --- Update Metrics ---
        // Display passive gravity G
        document.getElementById('pps').innerText = this.currentPPS.toFixed(2);
        document.getElementById('gravity-g').innerText = this.gravityG.toFixed(4);
        document.getElementById('piece-count').innerText = this.placedPieces;
        document.getElementById('tile-count').innerText = this.placedPieces * this.currentMode;
        document.getElementById('total-attack').innerText = this.totalAttack;
        document.getElementById('ts-count').innerText = this.tSpinCount;
        document.getElementById('lolits-count').innerText = this.lolitsCount;

        // TPM and LPM Calculation (Update only on stats update)
        if (this.elapsedTime > 0) {
            const minutes = this.elapsedTime / 60000;
            const totalTiles = this.placedPieces * this.currentMode;
            // Avoid division by very small numbers which causes spikes
            if (minutes > 0.001) {
                const tpm = totalTiles / minutes;
                const lpm = this.lines / minutes;
                document.getElementById('tpm').innerText = tpm.toFixed(2);
                document.getElementById('lpm').innerText = lpm.toFixed(2);
            }
        }
    }

    updateLiveDisplay() {
        if (!this.elapsedTime) return;
        const seconds = this.elapsedTime / 1000;

        document.getElementById('timer').innerText = this.formatTime(this.elapsedTime);
        const rankDesc = this.getRank(seconds, this.lineGoal || 40);
        document.getElementById('current-rank').innerText = rankDesc;
    }

    formatTime(ms) {
        const totalSeconds = ms / 1000;
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        const c = Math.floor((ms % 1000) / 10);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${c.toString().padStart(2, '0')}`;
    }

    showOverlay(title, msg) {
        document.getElementById('overlay-title').innerText = title;
        document.getElementById('overlay-msg').innerText = msg;
        document.getElementById('game-overlay').classList.remove('hidden');

        // Hide surrender button if game is over OR if it hasn't started yet (start screen)
        if (this.gameOver || !this.gameStarted) {
            document.getElementById('surrender-btn').classList.add('v-hidden');
        } else {
            document.getElementById('surrender-btn').classList.remove('v-hidden');
        }
    }

    hideOverlay() {
        document.getElementById('game-overlay').classList.add('hidden');
    }

    showActionMessage(text, combo, attack) {
        const el = document.getElementById('action-msg');
        let content = "";

        // --- Special LOLITS Styling ---
        const isLolits = text.includes("LOLITS");
        const textClass = isLolits ? "lolits-text" : "";

        if (text) content += `<div class="${textClass}">${text}</div>`;
        if (combo > 0) content += `<div class="combo-msg">${combo} COMBO</div>`;
        if (attack > 0) content += `<div class="attack-msg">+${attack} ATTACK</div>`;

        el.innerHTML = content;
        el.classList.remove('active');
        void el.offsetWidth; // Trigger reflow
        el.classList.add('active');

        if (this.actionTimeout) clearTimeout(this.actionTimeout);
        this.actionTimeout = setTimeout(() => {
            el.classList.remove('active');
        }, 1500);
    }

    // --- Rendering ---

    draw() {
        // Handle Shake
        if (this.shake > 0) {
            this.ctx.save();
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.translate(dx, dy);
            this.canvas.parentElement.classList.add('shake');
        } else {
            this.canvas.parentElement.classList.remove('shake');
        }

        // Draw Field
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(0, -TOP_OFFSET * BLOCK_SIZE);

        this.drawGrid();
        this.drawFlashes();
        this.drawLockFlashes();
        this.drawBeams();
        this.drawGhost();
        this.drawTetrimino(this.piece, this.ctx);
        this.drawParticles();

        this.ctx.restore();
        this.drawNext();

        if (this.shake > 0) {
            this.ctx.restore();
        }
    }

    drawGrid() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(this.ctx, x, y, COLORS[value]);
                }
            });
        });
    }

    drawTetrimino(piece, ctx, offset = { x: 0, y: 0 }) {
        const xPos = piece.visualX || piece.x;
        const yPos = piece.visualY || piece.y;
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const blockColor = COLORS[piece.type];
                    this.drawBlock(ctx, x + xPos + offset.x, y + yPos + offset.y, blockColor);
                }
            });
        });
    }

    drawLockFlashes() {
        this.ctx.save();
        this.lockFlashes.forEach((f, i) => {
            this.ctx.globalAlpha = f.life;
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = 20 * f.life;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.fillRect(f.x * BLOCK_SIZE, f.y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

            f.life -= 0.1;
            if (f.life <= 0) this.lockFlashes.splice(i, 1);
        });
        this.ctx.restore();
    }

    createImpactParticles(x, y, type) {
        const color = COLORS[type];
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: (x + Math.random() * 3) * BLOCK_SIZE,
                y: (y + Math.random() * 3) * BLOCK_SIZE,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 1.0,
                color: color
            });
        }
    }

    createHardDropBeam(x, startY, endY, type) {
        this.beams.push({
            x: x * BLOCK_SIZE,
            startY: startY * BLOCK_SIZE,
            endY: endY * BLOCK_SIZE,
            width: this.shapes[type][0].length * BLOCK_SIZE,
            life: 1.0,
            color: COLORS[type]
        });
    }

    drawBeams() {
        this.beams.forEach((b, i) => {
            this.ctx.save();
            this.ctx.globalAlpha = b.life * 0.3;
            const gradient = this.ctx.createLinearGradient(0, b.startY, 0, b.endY);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, b.color);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(b.x, b.startY, b.width, b.endY - b.startY + BLOCK_SIZE * 3);
            this.ctx.restore();
            b.life -= 0.1;
            if (b.life <= 0) this.beams.splice(i, 1);
        });
    }

    drawFlashes() {
        this.flashes.forEach((f, i) => {
            this.ctx.save();
            this.ctx.globalAlpha = f.life * 0.6;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.fillRect(0, f.y * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);
            this.ctx.restore();
            f.life -= 0.15;
            if (f.life <= 0) this.flashes.splice(i, 1);
        });
    }

    createLineClearParticles(yRow, intensity = 1.0) {
        const count = Math.floor(4 * intensity);
        for (let x = 0; x < COLS; x++) {
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: x * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                    y: yRow * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 30 * intensity,
                    vy: (Math.random() - 0.5) * 30 * intensity,
                    life: 1.0,
                    color: '#ffffff',
                    size: (Math.random() * 6 + 2) * intensity
                });
            }
        }
    }

    drawParticles() {
        this.ctx.save();
        this.particles.forEach((p, i) => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            const size = p.size || 4;
            this.ctx.fillRect(p.x, p.y, size, size);
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            if (p.life <= 0) this.particles.splice(i, 1);
        });
        this.ctx.restore();
    }

    drawGhost() {
        const ghost = { ...this.piece };
        while (!this.collide(ghost.matrix, { x: ghost.x, y: ghost.y })) {
            ghost.y++;
        }
        ghost.y--;

        ghost.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(this.ctx, x + ghost.x, y + ghost.y, COLORS['G'], true);
                }
            });
        });
    }

    drawBlock(ctx, x, y, color, isGhost = false) {
        const px = x * BLOCK_SIZE;
        const py = y * BLOCK_SIZE;

        if (isGhost) {
            ctx.strokeStyle = '#ffffff55';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
            return;
        }

        // Main block
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(px + 1, py + 1, BLOCK_SIZE - 2, 4);
        ctx.fillRect(px + 1, py + 1, 4, BLOCK_SIZE - 2);

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
    }

    drawNext() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.nextQueue.slice(0, 3).forEach((type, i) => {
            const matrix = this.shapes[type];
            const size = matrix.length;
            const offsetX = (6 - matrix[0].length) / 2;
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlockSmall(this.nextCtx, x + offsetX, y + i * 4.5 + 0.5, COLORS[type]);
                    }
                });
            });
        });
    }

    drawHold() {
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        if (this.holdPiece) {
            const matrix = this.shapes[this.holdPiece];
            const offsetX = (6 - matrix[0].length) / 2;
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlockSmall(this.holdCtx, x + offsetX, y + 0.5, COLORS[this.holdPiece]);
                    }
                });
            });
        }
    }

    drawBlockSmall(ctx, x, y, color) {
        const size = 15;
        const px = x * size + 5;
        const py = y * size;
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
        ctx.shadowBlur = 0;
    }

    update(timestamp = 0) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.paused || this.gameOver) {
            this.draw();
            // Even if game over, we need to keep the loop for potential restarts via SPACE
            requestAnimationFrame((t) => this.update(t));
            return;
        }

        this.elapsedTime += deltaTime;
        this.updateLiveDisplay();

        // Horizontal Movement (DAS/ARR)
        if (this.moveDir !== 0) {
            this.dasCounter += deltaTime;
            if (this.dasCounter >= this.DAS_DELAY) {
                this.arrCounter += deltaTime;
                if (this.arrCounter >= this.ARR_SPEED) {
                    if (this.moveSide(this.moveDir)) {
                        this.piece.isMoving = true;
                    }
                    this.arrCounter = 0;
                }
            }
        }

        // Auto Drop
        this.dropCounter += deltaTime;
        // Soft drop speed is at least 20x faster than current gravity, or at least 1G
        const softDropG = Math.max(this.gravityG * 20, 1.0);
        const softDropInterval = 1000 / (softDropG * 60);
        const currentInterval = (this.softDropActive) ? softDropInterval : this.dropInterval;

        if (this.gravityG >= 20.0 && !this.softDropActive) {
            // 20G: Instant drop to ground
            let dropped = false;
            while (!this.collide()) {
                this.piece.y++;
                dropped = true;
            }
            this.piece.y--;
            if (dropped) {
                time = 0; // Reset lock delay if it actually moved down (Play Time)
                this.lastMoveWasRotate = false; // Normal gravity move clears T-Spin
            }
        } else {
            while (this.dropCounter >= currentInterval) {
                this.drop(this.softDropActive);
                if (this.gravityG < 1.0 || this.softDropActive) break;
                this.dropCounter -= currentInterval; // FIX: Subtract currentInterval, not 1000
            }
        }

        // Lock Delay Logic
        if (this.piece) {
            this.piece.y++;
            const onGround = this.collide();
            this.piece.y--;

            if (onGround) {
                if (this.piece.isMoving) {
                    time = 0; // Reset delay while moving or rotating (but limited by lockMoveCount)
                } else {
                    time += deltaTime;
                    if (time >= this.lockDelay) {
                        this.lock(this.softDropActive);
                        time = 0;
                    }
                }

                // Guideline rule: Force lock after 15 moves/rotations
                if (this.piece.lockMoveCount >= 15) {
                    this.lock(this.softDropActive);
                    time = 0;
                }
            } else {
                time = 0;
                this.piece.lockMoveCount = 0; // Reset if it leaves the ground
            }
            this.piece.isMoving = false; // Reset for next frame
        }

        // Update Shake & Visuals
        if (this.shake > 0) this.shake *= 0.8;
        if (this.shake < 0.1) this.shake = 0;

        if (this.piece) {
            this.piece.updateVisuals(deltaTime);
        }

        this.draw();
        requestAnimationFrame((t) => this.update(t));
    }
}

// Start Game
window.onload = () => {
    new Game();
};
