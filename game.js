/**
 * lolits - World Guideline Implementation
 */

// --- Constants ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = {
    'I': '#00f0f0',
    'O': '#f0f000',
    'T': '#a000f0',
    'S': '#00f000',
    'Z': '#f00000',
    'J': '#0000f0',
    'L': '#f0a000',
    'G': 'rgba(255, 255, 255, 0.15)' // Ghost
};

const SHAPES = {
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
    constructor(type) {
        this.type = type;
        this.matrix = SHAPES[type].map(row => [...row]);
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
        this.y = (this.type === 'I') ? -1 : 0;
    }

    rotateMatrix(dir) {
        const result = this.matrix.map((_, i) =>
            this.matrix.map(row => row[i])
        );
        if (dir > 0) result.forEach(row => row.reverse());
        else result.reverse();
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

        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;

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
        this.flashes = [];
        this.lockFlashes = [];
        this.isTSpin = false;
        this.lastMoveWasRotate = false;
        this.attack = 0;
        this.totalAttack = 0;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lockDelay = 500; // Standard lock delay (ms)
        this.lastTime = 0;
        this.gravityG = 1 / 60; // Blocks per frame

        this.paused = true;
        this.gameOver = false;

        // DAS/ARR Settings (in ms)
        this.DAS_DELAY = 170; // Delayed Auto Shift
        this.ARR_SPEED = 30;  // Auto Repeat Rate
        this.dasCounter = 0;
        this.arrCounter = 0;
        this.moveDir = 0; // -1: Left, 0: None, 1: Right
        this.softDropActive = false;

        this.placedPieces = 0;
        this.gameStartTime = Date.now();
        this.lastPieceLockTime = Date.now();
        this.currentPPS = 0;

        this.highScore = parseInt(localStorage.getItem('lolits-highscore')) || 0;

        this.init();
    }

    init() {
        this.fillNextQueue();
        this.spawnPiece();
        this.updateStats();
        this.draw();

        // Bind events
        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());

        this.initMobileControls();

        // Show start overlay
        this.showOverlay('lolits', 'Press SPACE to Start');
    }

    createGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    fillNextQueue() {
        while (this.nextQueue.length < 6) {
            if (this.bag.length === 0) {
                this.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
                // Shuffle bag
                for (let i = this.bag.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
                }
            }
            this.nextQueue.push(this.bag.pop());
        }
    }

    spawnPiece(type = null) {
        this.piece = new Tetrimino(type || this.nextQueue.shift());
        time = 0; // Reset lock delay on spawn
        this.piece.visualX = this.piece.x;
        this.piece.visualY = this.piece.y;
        this.fillNextQueue();
        this.canHold = true;
        this.isTSpin = false; // Reset T-Spin flag on spawn
        this.lastMoveWasRotate = false;

        if (this.collide()) {
            this.gameOver = true;
            this.showOverlay('GAME OVER', 'Final Score: ' + this.score);
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

        // SRS Wall Kick
        const kickTable = (this.piece.type === 'I') ? WALL_KICK_I : WALL_KICK_J_L_T_S_Z;
        const transitionKey = `${startRotation}-${nextRotation}`;
        const kickIndex = KICK_TRANSITIONS[transitionKey];
        const kicks = kickTable[kickIndex];

        for (let i = 0; i < kicks.length; i++) {
            const [kx, ky] = kicks[i];
            if (!this.collide(matrix, { x: this.piece.x + kx, y: this.piece.y - ky })) {
                this.piece.matrix = matrix;
                this.piece.x += kx;
                this.piece.y -= ky;
                this.piece.rotation = nextRotation;

                // T-Spin detection flag
                if (this.piece.type === 'T') {
                    this.tSpinType = this.checkTSpin(i); // i is the kick index
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

                return;
            }
        }
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

        const rowsDropped = this.piece.y - startY;
        this.score += rowsDropped * 2; // Hard drop points

        // Visual effect: screen shake and particles
        this.shake = 10;
        this.createImpactParticles(this.piece.x, this.piece.y, this.piece.type);
        this.createHardDropBeam(this.piece.x, startY, this.piece.y, this.piece.type);

        this.lock();
    }

    lock(isSoftDrop = false) {
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

            // Score Calculation
            if (linesCleared > 0) {
                this.combo++;
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
                this.showActionMessage(actionText, this.combo, linesCleared > 0 ? points : 0);
            }

            this.lines += linesCleared;
            this.updateGravity();
            this.updateStats();
        } else {
            this.combo = -1;
        }
    }

    updateGravity() {
        this.level = Math.floor(this.lines / 10) + 1;

        // Refined Gravity Curve
        if (this.level < 10) {
            // Level 1-10: Standard Guideline Speed (1/60G to 10/60G)
            this.gravityG = this.level / 60;
        } else if (this.level < 30) {
            // Level 10-30: Scaling towards 1.0G
            this.gravityG = (10 / 60) + (this.level - 10) * 0.041;
        } else if (this.level < 100) {
            // Level 30-100: Scaling towards 20.0G (TGM style)
            this.gravityG = 1.0 + (this.level - 30) * 0.27;
        } else {
            this.gravityG = 20.0;
        }

        // Calculate dropInterval based on G (G = blocks per frame, 1 frame = 16.66ms)
        this.dropInterval = 1000 / (this.gravityG * 60);

        // Shorten lock delay at high levels (Guideline/TGM)
        if (this.level > 50) {
            this.lockDelay = Math.max(150, 500 - (this.level - 50) * 5);
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
        if (e.keyCode === 32) { // SPACE
            if (this.gameOver) {
                this.reset();
            } else if (this.paused) {
                this.resume();
            } else {
                this.hardDrop();
            }
            e.preventDefault();
            return;
        }

        if (this.paused || this.gameOver) return;

        switch (e.keyCode) {
            case 37: // LEFT
                if (this.moveDir !== -1) {
                    this.moveSide(-1);
                    this.moveDir = -1;
                    this.dasCounter = 0;
                }
                e.preventDefault();
                break;
            case 39: // RIGHT
                if (this.moveDir !== 1) {
                    this.moveSide(1);
                    this.moveDir = 1;
                    this.dasCounter = 0;
                }
                e.preventDefault();
                break;
            case 38: // UP - Rotate CW
                this.rotate(1);
                e.preventDefault();
                break;
            case 40: // DOWN
                this.drop(true);
                e.preventDefault();
                break;
            case 88: // X - Rotate CW
                this.rotate(1);
                break;
            case 90: // Z - Rotate CCW
                this.rotate(-1);
                break;
            case 67: // C - Hold
                this.hold();
                break;
            case 80: // P - Pause
                this.pause();
                break;
        }
    }

    handleKeyUp(e) {
        if (e.keyCode === 37 && this.moveDir === -1) {
            this.moveDir = 0;
        } else if (e.keyCode === 39 && this.moveDir === 1) {
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

    pause() {
        this.paused = true;
        this.showOverlay('PAUSED', 'Press SPACE to Resume');
    }

    resume() {
        this.paused = false;
        this.hideOverlay();
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.update(t));
    }

    reset() {
        this.grid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.updateGravity();
        this.bag = [];
        this.nextQueue = [];
        this.holdPiece = null;
        this.gameOver = false;
        this.moveDir = 0;
        this.combo = -1;
        this.b2b = false;
        this.totalAttack = 0;
        this.fillNextQueue();
        this.spawnPiece();
        this.placedPieces = 0;
        this.gameStartTime = Date.now();
        this.lastPieceLockTime = Date.now();
        this.currentPPS = 0;
        this.updateStats();
        this.resume();
        this.drawHold();
    }

    initMobileControls() {
        const bind = (id, action, stopAction) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                action();
            });
            if (stopAction) {
                const stop = (e) => {
                    e.preventDefault();
                    stopAction();
                };
                el.addEventListener('pointerup', stop);
                el.addEventListener('pointerleave', stop);
                el.addEventListener('pointercancel', stop);
            }
        };

        bind('btn-left', () => {
            if (this.moveDir !== -1) {
                this.moveSide(-1);
                this.moveDir = -1;
                this.dasCounter = 0;
            }
        }, () => {
            if (this.moveDir === -1) this.moveDir = 0;
        });

        bind('btn-right', () => {
            if (this.moveDir !== 1) {
                this.moveSide(1);
                this.moveDir = 1;
                this.dasCounter = 0;
            }
        }, () => {
            if (this.moveDir === 1) this.moveDir = 0;
        });

        bind('btn-down', () => {
            this.softDropActive = true;
        }, () => {
            this.softDropActive = false;
        });

        bind('btn-hard-drop', () => {
            if (this.paused || this.gameOver) {
                if (this.gameOver) this.reset();
                else this.resume();
            } else {
                this.hardDrop();
            }
        });
        bind('btn-rotate-cw', () => this.rotate(1));
        bind('btn-rotate-ccw', () => this.rotate(-1));
        bind('btn-hold', () => this.hold());
        bind('btn-pause', () => {
            if (this.paused) this.resume();
            else this.pause();
        });
    }

    updateStats() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('lolits-highscore', this.highScore);
        }

        document.getElementById('high-score').innerText = this.highScore.toString().padStart(6, '0');
        document.getElementById('score').innerText = this.score.toString().padStart(6, '0');
        document.getElementById('lines').innerText = this.lines;
        document.getElementById('level').innerText = this.level;
        document.getElementById('attack').innerText = this.totalAttack;
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
        document.getElementById('tile-count').innerText = this.placedPieces * 4;
    }

    showOverlay(title, msg) {
        document.getElementById('overlay-title').innerText = title;
        document.getElementById('overlay-msg').innerText = msg;
        document.getElementById('game-overlay').classList.remove('hidden');
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
        this.drawGrid();
        this.drawFlashes();
        this.drawLockFlashes();
        this.drawBeams();
        this.drawGhost();
        this.drawTetrimino(this.piece, this.ctx);
        this.drawParticles();
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
            width: SHAPES[type][0].length * BLOCK_SIZE,
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
            const matrix = SHAPES[type];
            const offsetX = (4 - matrix[0].length) / 2;
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlockSmall(this.nextCtx, x + offsetX, y + i * 3.5 + 1, COLORS[type]);
                    }
                });
            });
        });
    }

    drawHold() {
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        if (this.holdPiece) {
            const matrix = SHAPES[this.holdPiece];
            const offsetX = (4 - matrix[0].length) / 2;
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.drawBlockSmall(this.holdCtx, x + offsetX, y + 1, COLORS[this.holdPiece]);
                    }
                });
            });
        }
    }

    drawBlockSmall(ctx, x, y, color) {
        const size = 20;
        const px = x * size + 10;
        const py = y * size;
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
        ctx.shadowBlur = 0;
    }

    update(timestamp = 0) {
        if (this.paused || this.gameOver) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

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
            while (!this.collide()) {
                this.piece.y++;
            }
            this.piece.y--;
        } else {
            while (this.dropCounter >= currentInterval) {
                this.drop(this.softDropActive);
                if (this.gravityG < 1.0 || this.softDropActive) break;
                this.dropCounter -= this.dropInterval;
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
