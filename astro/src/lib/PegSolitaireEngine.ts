export type CellState = 'INVALID' | 'HOLE' | 'PEG';
export type GameStatus = 'PLAYING' | 'WON' | 'LOST';
export type MoveResult = 'SUCCESS' | 'INVALID' | 'GAME_OVER_WIN' | 'GAME_OVER_LOSS';

export interface Position {
    r: number;
    c: number;
}

export class PegSolitaireEngine {
    public grid: CellState[][];
    public pegsRemaining: number;
    public status: GameStatus;

    // English Cross Board Map (1: Peg, 0: Invalid, 2: Empty Hole)
    // Initially center is empty
    private static readonly INITIAL_BOARD = [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 2, 1, 1, 1], // Center (3,3) is empty hole
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 0]
    ];

    constructor() {
        this.grid = [];
        this.pegsRemaining = 0;
        this.status = 'PLAYING';
        this.init();
    }

    public init() {
        this.grid = [];
        this.pegsRemaining = 0;
        this.status = 'PLAYING';

        for (let r = 0; r < 7; r++) {
            const row: CellState[] = [];
            for (let c = 0; c < 7; c++) {
                const val = PegSolitaireEngine.INITIAL_BOARD[r][c];
                if (val === 0) {
                    row.push('INVALID');
                } else if (val === 1) {
                    row.push('PEG');
                    this.pegsRemaining++;
                } else {
                    row.push('HOLE');
                }
            }
            this.grid.push(row);
        }
    }

    public getCell(r: number, c: number): CellState {
        if (r < 0 || r >= 7 || c < 0 || c >= 7) return 'INVALID';
        return this.grid[r][c];
    }

    public isValidSelection(r: number, c: number): boolean {
        return this.getCell(r, c) === 'PEG' && this.status === 'PLAYING';
    }

    public attemptMove(from: Position, to: Position): MoveResult {
        if (this.status !== 'PLAYING') return 'INVALID';

        // Check orthogonality
        if (from.r !== to.r && from.c !== to.c) return 'INVALID';

        // Check distance (must be exactly 2)
        const dist = Math.abs(from.r - to.r) + Math.abs(from.c - to.c);
        if (dist !== 2) return 'INVALID';

        // Must move from PEG to HOLE
        if (this.getCell(from.r, from.c) !== 'PEG') return 'INVALID';
        if (this.getCell(to.r, to.c) !== 'HOLE') return 'INVALID';

        // Check captured peg
        const midR = (from.r + to.r) / 2;
        const midC = (from.c + to.c) / 2;
        if (this.getCell(midR, midC) !== 'PEG') return 'INVALID';

        // Execute Move
        this.grid[from.r][from.c] = 'HOLE';
        this.grid[midR][midC] = 'HOLE'; // Remove captured peg
        this.grid[to.r][to.c] = 'PEG';

        this.pegsRemaining--;

        // Check Win/Loss
        if (this.pegsRemaining === 1) {
            // Perfect Win if remaining peg is in center (3,3), but standard win is just 1 peg.
            // Usually ending in center is "Genius".
            this.status = 'WON';
            return 'GAME_OVER_WIN';
        }

        if (!this.hasPossibleMoves()) {
            this.status = 'LOST';
            return 'GAME_OVER_LOSS';
        }

        return 'SUCCESS';
    }

    private hasPossibleMoves(): boolean {
        const directions = [
            [0, 2], [0, -2], [2, 0], [-2, 0]
        ];

        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (this.grid[r][c] === 'PEG') {
                    for (const d of directions) {
                        const destR = r + d[0];
                        const destC = c + d[1];
                        const midR = r + d[0] / 2;
                        const midC = c + d[1] / 2;

                        if (this.getCell(destR, destC) === 'HOLE' && this.getCell(midR, midC) === 'PEG') {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
