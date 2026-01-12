export type CellState = boolean; // true = ON, false = OFF
export type GameStatus = 'PLAYING' | 'WON';

export interface GameState {
    grid: CellState[]; // 1D array of 25 items (5x5)
    moves: number;
    status: GameStatus;
}

export class LightsOutEngine {
    private readonly SIZE = 5;
    private state: GameState;

    constructor() {
        this.state = {
            grid: new Array(this.SIZE * this.SIZE).fill(false),
            moves: 0,
            status: 'PLAYING'
        };
    }

    get currentState(): Readonly<GameState> {
        return { ...this.state };
    }

    public init() {
        this.state.moves = 0;
        this.state.status = 'PLAYING';

        // Start with all OFF (Solved state)
        this.state.grid.fill(false);

        // Apply random moves to "scramble" it efficiently while guaranteeing solvability
        // A solvable board is any board reachable from the solved state.
        // We apply 10-25 random moves.
        const scrambleCount = 10 + Math.floor(Math.random() * 15);

        for (let i = 0; i < scrambleCount; i++) {
            const randomIdx = Math.floor(Math.random() * this.state.grid.length);
            this.toggle(randomIdx, true); // true = setup phase, don't count moves
        }
    }

    public attemptMove(index: number) {
        if (this.state.status !== 'PLAYING') return;

        this.toggle(index);
        this.state.moves++;

        this.checkWin();
    }

    private toggle(index: number, isSetup: boolean = false) {
        const row = Math.floor(index / this.SIZE);
        const col = index % this.SIZE;

        const targets = [
            { r: row, c: col },     // Self
            { r: row - 1, c: col }, // Up
            { r: row + 1, c: col }, // Down
            { r: row, c: col - 1 }, // Left
            { r: row, c: col + 1 }  // Right
        ];

        targets.forEach(pos => {
            if (pos.r >= 0 && pos.r < this.SIZE && pos.c >= 0 && pos.c < this.SIZE) {
                const tIdx = pos.r * this.SIZE + pos.c;
                this.state.grid[tIdx] = !this.state.grid[tIdx];
            }
        });

        if (!isSetup) {
            this.checkWin();
        }
    }

    private checkWin() {
        const allOff = this.state.grid.every(cell => cell === false);
        if (allOff) {
            this.state.status = 'WON';
        }
    }

    public getCell(r: number, c: number): boolean {
        const idx = r * this.SIZE + c;
        if (idx < 0 || idx >= this.state.grid.length) return false;
        return this.state.grid[idx];
    }
}
