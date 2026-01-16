export type GameStatus = 'PLAYING' | 'WON' | 'GAME_OVER';

export interface Tile {
    id: number;
    value: number;
    mergedFrom?: Tile[] | null;
}

export interface Game2048State {
    grid: (Tile | null)[];
    score: number;
    highScore: number;
    status: GameStatus;
    won: boolean;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export class Game2048Engine {
    private size = 4;
    private grid: (Tile | null)[];
    private score: number;
    private highScore: number;
    private status: GameStatus;
    private won: boolean;
    private idCounter = 1;

    constructor(initialHighScore: number = 0) {
        this.grid = Array(this.size * this.size).fill(null);
        this.score = 0;
        this.highScore = initialHighScore;
        this.status = 'PLAYING';
        this.won = false;

        this.restart();
    }

    public restart() {
        this.grid = Array(this.size * this.size).fill(null);
        this.score = 0;
        this.status = 'PLAYING';
        this.won = false;
        this.idCounter = 1;
        this.addRandomTile();
        this.addRandomTile();
    }

    public getGameState(): Game2048State {
        return {
            grid: [...this.grid],
            score: this.score,
            highScore: this.highScore,
            status: this.status,
            won: this.won
        };
    }

    public move(direction: Direction): boolean {
        if (this.status === 'GAME_OVER') return false;

        let moved = false;
        let newGrid = [...this.grid];
        let scoreGain = 0;

        // Clear mergedFrom flags from previous state to avoid sticking animations
        newGrid = newGrid.map(t => t ? { ...t, mergedFrom: null } : null);

        if (direction === 'UP') {
            for (let c = 0; c < this.size; c++) {
                let col = [
                    newGrid[this.getIndex(0, c)],
                    newGrid[this.getIndex(1, c)],
                    newGrid[this.getIndex(2, c)],
                    newGrid[this.getIndex(3, c)]
                ];
                let res = this.compressAndMerge(col);
                if (res.changed) moved = true;
                scoreGain += res.score;
                for (let r = 0; r < this.size; r++) newGrid[this.getIndex(r, c)] = res.arr[r];
            }
        } else if (direction === 'DOWN') {
            for (let c = 0; c < this.size; c++) {
                let col = [
                    newGrid[this.getIndex(3, c)],
                    newGrid[this.getIndex(2, c)],
                    newGrid[this.getIndex(1, c)],
                    newGrid[this.getIndex(0, c)]
                ];
                let res = this.compressAndMerge(col);
                if (res.changed) moved = true;
                scoreGain += res.score;
                for (let r = 0; r < this.size; r++) newGrid[this.getIndex(3 - r, c)] = res.arr[r];
            }
        } else if (direction === 'LEFT') {
            for (let r = 0; r < this.size; r++) {
                let row = [
                    newGrid[this.getIndex(r, 0)],
                    newGrid[this.getIndex(r, 1)],
                    newGrid[this.getIndex(r, 2)],
                    newGrid[this.getIndex(r, 3)]
                ];
                let res = this.compressAndMerge(row);
                if (res.changed) moved = true;
                scoreGain += res.score;
                for (let c = 0; c < this.size; c++) newGrid[this.getIndex(r, c)] = res.arr[c];
            }
        } else if (direction === 'RIGHT') {
            for (let r = 0; r < this.size; r++) {
                let row = [
                    newGrid[this.getIndex(r, 3)],
                    newGrid[this.getIndex(r, 2)],
                    newGrid[this.getIndex(r, 1)],
                    newGrid[this.getIndex(r, 0)]
                ];
                let res = this.compressAndMerge(row);
                if (res.changed) moved = true;
                scoreGain += res.score;
                for (let c = 0; c < this.size; c++) newGrid[this.getIndex(r, 3 - c)] = res.arr[c];
            }
        }

        if (moved) {
            this.grid = newGrid;
            this.score += scoreGain;
            if (this.score > this.highScore) {
                this.highScore = this.score;
            }
            this.addRandomTile();
            this.checkGameStatus();
        }

        return moved;
    }

    private compressAndMerge(line: (Tile | null)[]): { arr: (Tile | null)[], score: number, changed: boolean } {
        let nonZero = line.filter(x => x !== null) as Tile[];
        let merged: (Tile | null)[] = [];
        let scoreGain = 0;
        let skip = false;

        for (let i = 0; i < nonZero.length; i++) {
            if (skip) {
                skip = false;
                continue;
            }
            if (i + 1 < nonZero.length && nonZero[i].value === nonZero[i + 1].value) {
                // Merge
                let val = nonZero[i].value * 2;
                let newTile: Tile = {
                    id: this.idCounter++,
                    value: val,
                    mergedFrom: [nonZero[i], nonZero[i + 1]]
                };
                merged.push(newTile);
                scoreGain += val;
                skip = true;
            } else {
                // Keep existing tile, but make sure we clear old mergedFrom data if we are copying it around?
                // Actually, ensure we keep the same object reference if not changed, to preserve identity.
                merged.push(nonZero[i]);
            }
        }

        while (merged.length < 4) merged.push(null);

        let changed = false;
        for (let i = 0; i < 4; i++) {
            // Check identity change
            // If previous was A, now A -> not changed
            // If previous was A, now null -> changed
            // If previous was null, now A -> changed
            // If previous A, now B -> changed
            if (line[i] !== merged[i]) changed = true;
        }

        return { arr: merged, score: scoreGain, changed: changed };
    }

    private addRandomTile() {
        const available = [];
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] === null) available.push(i);
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            this.grid[randomCell] = {
                id: this.idCounter++,
                value: Math.random() < 0.9 ? 2 : 4
            };
        }
    }

    private getIndex(r: number, c: number) { return r * this.size + c; }

    private checkGameStatus() {
        if (!this.won && this.grid.some(t => t?.value === 2048)) {
            this.status = 'WON';
            this.won = true;
        } else if (!this.grid.includes(null)) {
            // Check if any moves possible
            let movesPossible = false;
            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    let val = this.grid[this.getIndex(r, c)]?.value;
                    if (!val) continue; // Should be handled by includes(null) check above

                    let right = this.grid[this.getIndex(r, c + 1)]?.value;
                    let down = this.grid[this.getIndex(r + 1, c)]?.value;

                    if (c < this.size - 1 && right === val) movesPossible = true;
                    if (r < this.size - 1 && down === val) movesPossible = true;
                }
            }
            if (!movesPossible) {
                this.status = 'GAME_OVER';
            }
        }
    }

    public continuePlaying() {
        if (this.status === 'WON') {
            this.status = 'PLAYING';
        }
    }

    public loadState(state: Game2048State) {
        this.grid = state.grid;
        this.score = state.score;
        this.highScore = state.highScore;
        this.status = state.status;
        this.won = state.won;

        // Ensure idCounter is higher than any existing tile ID to avoid conflicts
        let maxId = 0;
        this.grid.forEach(t => {
            if (t && t.id > maxId) maxId = t.id;
        });
        this.idCounter = maxId + 1;
    }
}
