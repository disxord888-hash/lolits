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

class Piece {
    constructor(type) {
        this.type = type;
        this.matrix = SHAPES[type].map(row => [...row]);
        this.resetPosition();
        this.rotation = 0; // 0, 1, 2, 3
        this.visualX = this.x;
        this.visualY = this.y;
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
        this.isTSpin = false;
        this.lastMoveWasRotate = false;
        this.attack = 0;
        this.totalAttack = 0;

        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;

        this.paused = true;
        this.gameOver = false;

        // DAS/ARR Settings (in ms)
        this.DAS_DELAY = 170; // Delayed Auto Shift
        this.ARR_SPEED = 30;  // Auto Repeat Rate
        this.dasCounter = 0;
        this.arrCounter = 0;
        this.moveDir = 0; // -1: Left, 0: None, 1: Right
        this.softDropActive = false;

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
        this.piece = new Piece(type || this.nextQueue.shift());
        this.piece.visualX = this.piece.x;
        this.piece.visualY = this.piece.y;
        this.fillNextQueue();
        this.canHold = true;

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
                    this.isTSpin = this.checkTSpin();
                } else {
                    this.isTSpin = false;
                }
                this.lastMoveWasRotate = true;
                return;
            }
        }
    }

    checkTSpin() {
        // T-Spin simplified rule: 3 corners occupied
        const corners = [
            { x: this.piece.x, y: this.piece.y },
            { x: this.piece.x + 2, y: this.piece.y },
            { x: this.piece.x, y: this.piece.y + 2 },
            { x: this.piece.x + 2, y: this.piece.y + 2 }
        ];

        let occupied = 0;
        corners.forEach(p => {
            if (p.x < 0 || p.x >= COLS || p.y >= ROWS || (p.y >= 0 && this.grid[p.y][p.x] !== 0)) {
                occupied++;
            }
        });

        return occupied >= 3;
    }

    drop(isManual = false) {
        if (this.paused || this.gameOver) return;
        this.piece.y++;
        if (this.collide()) {
            this.piece.y--;
            this.lock(true); // Treat both auto and manual soft drop as "weak impact"
        } else {
            this.lastMoveWasRotate = false;
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
        this.merge();
        // Check T-Spin status: must be T-piece and last move was rotate
        const tspin = this.piece.type === 'T' && this.lastMoveWasRotate && this.isTSpin;
        this.clearLines(tspin, isSoftDrop);
        this.spawnPiece();
        this.updateStats();
        this.lastMoveWasRotate = false;
        this.isTSpin = false;
    }

    clearLines(tspin = false, isSoftDrop = false) {
        let linesCleared = 0;
        let clearedRows = [];
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (this.grid[y][x] === 0) continue outer;
            }
            clearedRows.push(y);
            const row = this.grid.splice(y, 1)[0].fill(0);
            this.grid.unshift(row);
            y++;
            linesCleared++;
        }

        if (linesCleared > 0) {
            // Trigger effects for each cleared row
            clearedRows.forEach(y => {
                this.createLineClearParticles(y, isSoftDrop ? 0.3 : 1.0);
                this.flashes.push({ y, life: isSoftDrop ? 0.4 : 1.0 });
            });
            const baseShake = linesCleared === 4 ? 20 : 10;
            this.shake = isSoftDrop ? baseShake * 0.3 : baseShake;
        }

        if (linesCleared > 0 || tspin) {
            // Update Combo
            if (linesCleared > 0) {
                this.combo++;
            }

            let basicScore = 0;
            let currentAttack = 0;
            let renScore = 0;
            let additionalScore = 0;

            // 1. Basic Score & Attack Calculation
            if (tspin) {
                const tspinBase = [0, 2, 4, 6];
                currentAttack = tspinBase[Math.min(linesCleared, 3)];
                const tspinPoints = [400, 800, 1200, 1600];
                basicScore = tspinPoints[Math.min(linesCleared, 3)] * this.level;
            } else {
                const lineBase = [0, 0, 1, 2, 4];
                currentAttack = lineBase[linesCleared];
                const lineBases = [0, 40, 100, 300, 1200];
                basicScore = lineBases[linesCleared] * this.level;
            }

            // 2. REN (Combo) Score
            if (this.combo > 0) {
                renScore = 50 * this.combo * this.level;
                // Attack bonus
                const renAttackTable = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5];
                currentAttack += renAttackTable[Math.min(this.combo, 14)];
            }

            // 3. Perfect Clear (Additional Score)
            const isPerfect = this.checkAllClear();
            if (isPerfect) {
                currentAttack = 10;
                additionalScore = 2000 * this.level;
            }

            // 4. Back-to-Back Multiplier
            const isTetris = linesCleared === 4;
            const isDifficult = tspin || isTetris;
            let b2bMultiplier = 1.0;
            let actionText = "";

            if (isDifficult) {
                if (this.b2b) {
                    b2bMultiplier = 1.5;
                    currentAttack += 1;
                    actionText = "B2B ";
                }
                this.b2b = true;
            } else if (linesCleared > 0) {
                this.b2b = false;
            }

            // Final Formula: ((Basic + REN) * B2B + Additional)
            const finalPoints = Math.floor((basicScore + renScore) * b2bMultiplier + additionalScore);
            this.score += finalPoints;

            if (isPerfect) {
                actionText = "PERFECT CLEAR";
            } else {
                if (tspin) {
                    actionText += (linesCleared === 0 ? "T-SPIN" : (linesCleared === 1 ? "T-SPIN SINGLE" : (linesCleared === 2 ? "T-SPIN DOUBLE" : "T-SPIN TRIPLE")));
                } else if (isTetris) {
                    actionText += "LOLITS";
                }
            }

            if (actionText || this.combo > 0) {
                this.showActionMessage(actionText, this.combo, currentAttack > 0 ? currentAttack : null);
            }

            this.totalAttack += currentAttack;
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateStats();
        } else {
            this.combo = -1;
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
        if (text) content += `<div>${text}</div>`;
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
        this.drawBeams();
        this.drawGhost();
        this.drawPiece(this.piece, this.ctx);
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

    drawPiece(piece, ctx, offset = { x: 0, y: 0 }) {
        const xPos = piece.visualX || piece.x;
        const yPos = piece.visualY || piece.y;
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(ctx, x + xPos + offset.x, y + yPos + offset.y, COLORS[piece.type]);
                }
            });
        });
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

    update(time = 0) {
        if (this.paused || this.gameOver) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // Horizontal Movement (DAS/ARR)
        if (this.moveDir !== 0) {
            this.dasCounter += deltaTime;
            if (this.dasCounter >= this.DAS_DELAY) {
                this.arrCounter += deltaTime;
                if (this.arrCounter >= this.ARR_SPEED) {
                    this.moveSide(this.moveDir);
                    this.arrCounter = 0;
                }
            }
        }

        // Auto Drop
        this.dropCounter += deltaTime;
        const currentInterval = (this.softDropActive) ? 30 : this.dropInterval;
        if (this.dropCounter > currentInterval) {
            this.drop(this.softDropActive);
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
