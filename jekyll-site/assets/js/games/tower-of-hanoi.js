/**
 * Tower of Hanoi Game Logic
 * Extracted from jekyll-site/_includes/games/tower-of-hanoi.html
 */
const hanoiGame = (function () {
    // Configuration & State
    let moves = 0;
    let totalDisks = 4;
    let isGameFinished = false;

    // Localized Strings (Injected via global config)
    const STRINGS = window.TowerOfHanoiConfig.strings;

    // DOM Elements
    // We'll fetch these lazily or on init to ensure they exist
    let elMoveCount;
    let elMessage;
    let elDiskInput;
    let towerEls;

    /**
     * Initialize the game board
     */
    function init() {
        // Initialize DOM references
        elMoveCount = document.getElementById('moveCount');
        elMessage = document.getElementById('gameMessage');
        elDiskInput = document.getElementById('diskCount');
        towerEls = [
            document.getElementById('tower-0'),
            document.getElementById('tower-1'),
            document.getElementById('tower-2')
        ];

        // Get disk count from input
        let val = parseInt(elDiskInput.value);
        if (val < 3) val = 3;
        if (val > 8) val = 8;
        totalDisks = val;
        elDiskInput.value = val;

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

        // Fill first tower (Largest disk is 1, Smallest is N)
        // Actually, easier logic: Larger number = Larger disk
        for (let i = totalDisks; i >= 1; i--) {
            towers[0].push(i);
        }

        render();
    }

    /**
     * Render the disks based on the towers array state
     */
    function render() {
        // Clear existing disks from DOM (keep pole)
        towerEls.forEach((el, index) => {
            // Remove all .disk elements
            const disks = el.querySelectorAll('.disk');
            disks.forEach(d => d.remove());

            // Re-append disks from state
            towers[index].forEach(diskSize => {
                const diskDiv = document.createElement('div');
                diskDiv.className = `disk disk-${diskSize}`;
                // We prepend or append based on flex-direction.
                // Since CSS is column-reverse, appending adds to the "bottom" visually?
                // No, column-reverse means first child is at bottom.
                // tower array: [4, 3, 2, 1] -> 4 is bottom. 
                // So we should just append in order.
                el.appendChild(diskDiv);
            });
        });
    }

    /**
     * Handle user click on a tower
     */
    function handleTowerClick(towerIndex) {
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
    function attemptMove(fromIdx, toIdx) {
        const sourceTower = towers[fromIdx];
        const targetTower = towers[toIdx];

        const diskToMove = sourceTower[sourceTower.length - 1]; // Top disk
        const topTargetDisk = targetTower.length > 0 ? targetTower[targetTower.length - 1] : 999;

        // Validation: Can only place smaller disk on larger disk
        if (diskToMove < topTargetDisk) {
            // Valid move
            sourceTower.pop();
            targetTower.push(diskToMove);
            moves++;
            elMoveCount.innerText = moves;

            // Deselect
            towerEls[fromIdx].classList.remove('selected');
            selectedTowerIndex = -1;

            render();
            checkWin();
        } else {
            // Invalid move
            showMessage(STRINGS.warn, 'error');
            // Shake animation could go here, but simple message for now
            towerEls[fromIdx].classList.remove('selected');
            selectedTowerIndex = -1;
        }
    }

    /**
     * Check if the game is won (all disks on last tower)
     */
    function checkWin() {
        // Typically target is the last tower, but middle works too in some versions.
        // Standard is usually rightmost.
        if (towers[2].length === totalDisks) {
            isGameFinished = true;
            showMessage(STRINGS.win, 'success');
        }
    }

    /**
     * Helper to show messages
     */
    function showMessage(text, type) {
        elMessage.innerText = text;
        if (type === 'success') {
            elMessage.className = 'hanoi-message success-message';
        } else {
            elMessage.className = 'hanoi-message';
        }
    }

    // Initialize on load (if DOM is ready, or when deferred script runs)
    // 'defer' scripts execute after document parsing, so elements should exist.
    // We'll add the event listener for restart here too.

    // Note: We need to make sure we don't crash if Elements are missing (though unlikely in this flow)
    try {
        init();
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', init);
        }
    } catch (e) {
        console.error("Tower of Hanoi initialization failed:", e);
    }

    // Export public methods
    return {
        handleTowerClick
    };
})();
