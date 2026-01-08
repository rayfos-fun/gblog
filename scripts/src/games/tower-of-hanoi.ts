/**
 * Tower of Hanoi Game Logic
 * Extracted from jekyll-site/_includes/games/tower-of-hanoi.html
 */

interface HanoiStrings {
    win: string;
    warn: string;
    empty: string;
}

interface TowerOfHanoiConfig {
    strings: HanoiStrings;
}

interface Window {
    TowerOfHanoiConfig: TowerOfHanoiConfig;
    hanoiGame: {
        handleTowerClick: (towerIndex: number) => void;
    };
}

const hanoiGame = window.hanoiGame = (function () {
    // Configuration & State
    let moves: number = 0;
    let totalDisks: number = 4;
    let isGameFinished: boolean = false;
    let towers: number[][] = [[], [], []];
    let selectedTowerIndex: number = -1;

    // Localized Strings (Injected via global config)
    const STRINGS: HanoiStrings = window.TowerOfHanoiConfig.strings;

    // DOM Elements
    let elMoveCount: HTMLElement;
    let elMessage: HTMLElement;
    let elDiskInput: HTMLInputElement;
    let towerEls: HTMLElement[];

    /**
     * Initialize the game board
     */
    function init(): void {
        // Initialize DOM references
        // We use non-null assertions (!) because these elements are hardcoded in the HTML template
        // and are required for the game to function.
        elMoveCount = document.getElementById('moveCount')!;
        elMessage = document.getElementById('gameMessage')!;
        elDiskInput = document.getElementById('diskCount') as HTMLInputElement;

        towerEls = [
            document.getElementById('tower-0')!,
            document.getElementById('tower-1')!,
            document.getElementById('tower-2')!
        ];

        // Get disk count from input
        let val = parseInt(elDiskInput.value);
        if (isNaN(val) || val < 3) val = 3;
        if (val > 8) val = 8;
        totalDisks = val;
        elDiskInput.value = val.toString();

        // Reset state
        towers = [[], [], []];
        selectedTowerIndex = -1;
        moves = 0;
        isGameFinished = false;
        elMoveCount.innerText = '0';
        elMessage.innerText = '';
        elMessage.className = 'hanoi-message';

        // Remove selection styles
        towerEls.forEach(t => t.classList.remove('selected'));

        // Fill first tower (Largest disk is 1, Smallest is N in UI logic??)
        // Original logic: "Typically target is the last tower... Large number = Larger disk"
        // Let's stick to: Larger number = Larger disk.
        // Stack bottom to top: [4, 3, 2, 1]
        for (let i = totalDisks; i >= 1; i--) {
            towers[0].push(i);
        }

        render();
    }

    /**
     * Render the disks based on the towers array state
     */
    function render(): void {
        // Clear existing disks from DOM (keep pole)
        towerEls.forEach((el, index) => {
            // Remove all .disk elements
            const disks = el.querySelectorAll('.disk');
            disks.forEach(d => d.remove());

            // Re-append disks from state
            towers[index].forEach(diskSize => {
                const diskDiv = document.createElement('div');
                diskDiv.className = `disk disk-${diskSize}`;
                // tower array: [4, 3, 2, 1] -> 4 is bottom.
                // We append in order, so bottom uses flex-direction or just order.
                // The CSS is flex-direction: column-reverse, so first child is at bottom.
                el.appendChild(diskDiv);
            });
        });
    }

    /**
     * Handle user click on a tower
     */
    function handleTowerClick(towerIndex: number): void {
        if (isGameFinished) return;

        elMessage.innerText = ''; // Clear messages

        // Scenario 1: No tower currently selected
        if (selectedTowerIndex === -1) {
            if (towers[towerIndex].length === 0) {
                showMessage(STRINGS.empty, 'error');
                return;
            }
            // Select this tower
            selectedTowerIndex = towerIndex;
            towerEls[towerIndex].classList.add('selected');
        }
        // Scenario 2: Clicked the SAME tower (Deselect)
        else if (selectedTowerIndex === towerIndex) {
            selectedTowerIndex = -1;
            towerEls[towerIndex].classList.remove('selected');
        }
        // Scenario 3: Attempt to move to a different tower
        else {
            attemptMove(selectedTowerIndex, towerIndex);
        }
    }

    /**
     * Attempt to move top disk from source to target
     */
    function attemptMove(fromIdx: number, toIdx: number): void {
        const sourceTower = towers[fromIdx];
        const targetTower = towers[toIdx];

        const diskToMove = sourceTower[sourceTower.length - 1]; // Top disk
        // If target is empty, top disk size is effectively infinite (or max allowed)
        const topTargetDisk = targetTower.length > 0 ? targetTower[targetTower.length - 1] : 999;

        // Validation: Can only place smaller disk on larger disk
        if (diskToMove < topTargetDisk) {
            // Valid move
            sourceTower.pop();
            targetTower.push(diskToMove);
            moves++;
            elMoveCount.innerText = moves.toString();

            // Deselect
            towerEls[fromIdx].classList.remove('selected');
            selectedTowerIndex = -1;

            render();
            checkWin();
        } else {
            // Invalid move
            showMessage(STRINGS.warn, 'error');
            // Deselect on error? Or keep selected? Original code deselects.
            towerEls[fromIdx].classList.remove('selected');
            selectedTowerIndex = -1;
        }
    }

    /**
     * Check if the game is won (all disks on last tower)
     */
    function checkWin(): void {
        // Typically target is the last tower (index 2)
        if (towers[2].length === totalDisks) {
            isGameFinished = true;
            showMessage(STRINGS.win, 'success');
        }
    }

    /**
     * Helper to show messages
     */
    function showMessage(text: string, type: 'success' | 'error'): void {
        elMessage.innerText = text;
        if (type === 'success') {
            elMessage.className = 'hanoi-message success-message';
        } else {
            elMessage.className = 'hanoi-message';
        }
    }

    // Initialize on load (if DOM is ready, or when deferred script runs)
    try {
        // Wait for DOMContentLoaded to be safe, although 'defer' usually handles this.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGame);
        } else {
            initGame();
        }

        function initGame() {
            init();
            const restartBtn = document.getElementById('restartBtn');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => init());
            }
        }
    } catch (e) {
        console.error("Tower of Hanoi initialization failed:", e);
    }

    // Export public methods
    return {
        handleTowerClick
    };
})();
