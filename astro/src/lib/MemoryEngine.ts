export type GameStatus = 'IDLE' | 'WATCHING' | 'PLAYING' | 'GAME_OVER';

export interface GameState {
    status: GameStatus;
    sequence: number[];
    playerInputIndex: number; // How far the player has correctly input the sequence
    score: number;
    highScore: number;
}

export type InputResult = 'CORRECT' | 'WRONG' | 'ROUND_COMPLETE';

export class MemoryEngine {
    private state: GameState;

    constructor(initialHighScore: number = 0) {
        this.state = {
            status: 'IDLE',
            sequence: [],
            playerInputIndex: 0,
            score: 0,
            highScore: initialHighScore
        };
    }

    get currentState(): Readonly<GameState> {
        return { ...this.state };
    }

    public startGame() {
        this.state.score = 0;
        this.state.sequence = [];
        this.state.status = 'WATCHING';
        this.nextRound();
    }

    public nextRound() {
        // Add random color (0-3)
        const nextColor = Math.floor(Math.random() * 4);
        this.state.sequence.push(nextColor);
        this.state.playerInputIndex = 0;
        this.state.status = 'WATCHING';
        // View should detect 'WATCHING' and play the full sequence, then call 'enableInput()'
    }

    public enableInput() {
        this.state.status = 'PLAYING';
    }

    public handleInput(colorIndex: number): InputResult {
        if (this.state.status !== 'PLAYING') return 'WRONG';

        const expectedColor = this.state.sequence[this.state.playerInputIndex];

        if (colorIndex !== expectedColor) {
            this.gameOver();
            return 'WRONG';
        }

        this.state.playerInputIndex++;

        if (this.state.playerInputIndex === this.state.sequence.length) {
            this.state.score++;
            if (this.state.score > this.state.highScore) {
                this.state.highScore = this.state.score;
            }
            this.state.status = 'WATCHING'; // Waiting for next round sequence generation/playback
            return 'ROUND_COMPLETE';
        }

        return 'CORRECT';
    }

    private gameOver() {
        this.state.status = 'GAME_OVER';
    }

    public reset() {
        // Keep high score
        this.state.status = 'IDLE';
        this.state.sequence = [];
        this.state.score = 0;
        this.state.playerInputIndex = 0;
    }
}
