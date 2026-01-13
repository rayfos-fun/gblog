export type MoveResult = 'SUCCESS' | 'INVALID' | 'GAME_OVER';

export class HanoiEngine {
    public pegs: number[][]; // 2D array representing pegs and disks
    public moves: number;
    public totalDisks: number;
    public gameOver: boolean;

    constructor(totalDisks: number = 3) {
        this.totalDisks = totalDisks;
        this.moves = 0;
        this.gameOver = false;
        this.pegs = [[], [], []];
        this.init();
    }

    private init() {
        this.moves = 0;
        this.gameOver = false;
        this.pegs = [[], [], []];
        // Initialize first peg with disks (largest at index 0? No, stack usually top is end)
        // Visualization: push(3), push(2), push(1) -> [3, 2, 1] means 1 is top.
        // Let's use standard stack: last element is top.
        // Disks: 1 (smallest) to N (largest).
        // Bottom is largest (N), Top is smallest (1).
        // So array should be [N, ..., 1].
        for (let i = this.totalDisks; i >= 1; i--) {
            this.pegs[0].push(i);
        }
    }

    public reset(totalDisks?: number) {
        if (totalDisks) {
            this.totalDisks = totalDisks;
        }
        this.init();
    }

    public attemptMove(fromPegIndex: number, toPegIndex: number): MoveResult {
        if (this.gameOver) return 'GAME_OVER';
        if (fromPegIndex === toPegIndex) return 'INVALID';
        if (fromPegIndex < 0 || fromPegIndex > 2 || toPegIndex < 0 || toPegIndex > 2) return 'INVALID';

        const fromPeg = this.pegs[fromPegIndex];
        if (fromPeg.length === 0) return 'INVALID'; // Cannot move from empty peg

        const toPeg = this.pegs[toPegIndex];
        const diskToMove = fromPeg[fromPeg.length - 1]; // Top disk

        // Check if move is valid: target peg empty OR target top disk > moving disk
        if (toPeg.length === 0 || toPeg[toPeg.length - 1] > diskToMove) {
            // Execute move
            fromPeg.pop();
            toPeg.push(diskToMove);
            this.moves++;

            if (this.checkWin()) {
                this.gameOver = true;
                return 'GAME_OVER';
            }
            return 'SUCCESS';
        }

        return 'INVALID';
    }

    public checkWin(): boolean {
        // Win if all disks are on the last peg (index 2) or middle peg (index 1) - standard rules usually say last execution
        // User logic: `state.pegs[2].length === state.totalDisks` (implies last peg only? or typically any non-start peg)
        // Wikipedia: "move the entire stack to another rod".
        // Original code: `state.pegs[2].length === state.totalDisks` (specifically peg 2).
        // Let's stick to peg 2 (index 2) based on original code `if (state.pegs[2].length === state.totalDisks)`.
        return this.pegs[2].length === this.totalDisks;
    }
}
