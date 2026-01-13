
import { describe, it, expect, beforeEach } from 'vitest';
import { HanoiEngine } from './HanoiEngine';

describe('HanoiEngine', () => {
    let engine: HanoiEngine;

    beforeEach(() => {
        engine = new HanoiEngine(3); // Default 3 disks
    });

    it('should initialize correctly', () => {
        expect(engine.totalDisks).toBe(3);
        expect(engine.moves).toBe(0);
        expect(engine.gameOver).toBe(false);
        // Peg 0 should have disks [3, 2, 1] (bottom to top)
        expect(engine.pegs[0]).toEqual([3, 2, 1]);
        expect(engine.pegs[1]).toEqual([]);
        expect(engine.pegs[2]).toEqual([]);
    });

    it('should handle reset', () => {
        engine.attemptMove(0, 1);
        expect(engine.moves).toBe(1);
        engine.reset(4);
        expect(engine.totalDisks).toBe(4);
        expect(engine.moves).toBe(0);
        expect(engine.pegs[0]).toEqual([4, 3, 2, 1]);
    });

    it('should allow valid move (empty peg)', () => {
        // Move smallest disk (1) from peg 0 to peg 1
        const result = engine.attemptMove(0, 1);
        expect(result).toBe('SUCCESS');
        expect(engine.moves).toBe(1);
        expect(engine.pegs[0]).toEqual([3, 2]);
        expect(engine.pegs[1]).toEqual([1]);
    });

    it('should allow valid move (smaller on larger)', () => {
        // Move 1 to peg 1: [3, 2], [1], []
        engine.attemptMove(0, 1);
        // Move 2 to peg 2: [3], [1], [2]
        engine.attemptMove(0, 2);
        // Move 1 to peg 2: [3], [], [2, 1]
        const result = engine.attemptMove(1, 2);

        expect(result).toBe('SUCCESS');
        expect(engine.pegs[2]).toEqual([2, 1]);
    });

    it('should prevent invalid move (larger on smaller)', () => {
        // Move 1 to peg 1
        engine.attemptMove(0, 1);
        // Try to move 2 (from 0) on top of 1 (at 1) -> Invalid because 2 > 1
        // State: Peg 0: [3, 2], Peg 1: [1]
        const result = engine.attemptMove(0, 1);

        expect(result).toBe('INVALID');
        expect(engine.moves).toBe(1); // Moves shouldn't increment
        expect(engine.pegs[0]).toEqual([3, 2]);
        expect(engine.pegs[1]).toEqual([1]);
    });

    it('should prevent moving from empty peg', () => {
        const result = engine.attemptMove(1, 2);
        expect(result).toBe('INVALID');
    });

    it('should detect win condition', () => {
        // Minimal moves to win with 3 disks is 7
        // 1. 0 -> 2
        engine.attemptMove(0, 2);
        // 2. 0 -> 1
        engine.attemptMove(0, 1);
        // 3. 2 -> 1
        engine.attemptMove(2, 1);
        // 4. 0 -> 2
        engine.attemptMove(0, 2);
        // 5. 1 -> 0
        engine.attemptMove(1, 0);
        // 6. 1 -> 2
        engine.attemptMove(1, 2);
        // 7. 0 -> 2
        const result = engine.attemptMove(0, 2);

        expect(result).toBe('GAME_OVER');
        expect(engine.gameOver).toBe(true);
        expect(engine.pegs[2].length).toBe(3);
        expect(engine.checkWin()).toBe(true);
    });
});
