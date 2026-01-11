---
title: "河內塔 (Tower of Hanoi)"
date: "2024-01-11"
description: "經典的數學遞迴益智遊戲"
bgmSrc: "https://storage.googleapis.com/rayfos-bucket/audio/soft_theme.mp3"
---

<div class="game-wrapper flex flex-col items-center gap-6 p-4">
    <div class="game-stats flex gap-8 text-lg font-bold text-gray-700 dark:text-gray-300">
        <div id="move-count">移動次數: 0</div>
        <div class="flex items-center gap-2">
            <label for="disk-select">盤子數量:</label>
            <select id="disk-select" class="select select-bordered select-sm">
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
            </select>
        </div>
    </div>
    <div class="canvas-container relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <canvas id="hanoi-canvas" width="600" height="300" class="max-w-full h-auto cursor-pointer"></canvas>
    </div>
    <div class="controls flex gap-4">
<button 
        id="restart-btn" 
        class="relative overflow-hidden group px-8 py-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold tracking-wide flex items-center gap-2"
    >
        <span class="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left"></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="relative z-10">重新開始</span>
    </button>
    </div>
    <div id="message-area" class="h-6 text-xl font-bold text-primary"></div>
</div>

<style>
    .game-wrapper {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>

<script>
    const CONFIG = {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'],
        pegColor: '#95a5a6',
        messages: {
            win: "🎉 恭喜獲勝！太厲害了！",
            warn: "⚠️ 無效移動：大盤子不能放在小盤子上",
            empty: "⚠️ 這裡沒有盤子",
        }
    };

    let state = {
        pegs: [[], [], []], // 三根柱子
        selectedPeg: -1,    // 目前選中的柱子索引 (-1 代表沒選)
        moves: 0,
        totalDisks: 3
    };

    // --- DOM 元素 ---
    const canvas = document.getElementById('hanoi-canvas');
    const ctx = canvas.getContext('2d');
    const moveDisplay = document.getElementById('move-count');
    const msgDisplay = document.getElementById('message-area');
    const diskSelect = document.getElementById('disk-select');
    const restartBtn = document.getElementById('restart-btn');

    // --- 遊戲邏輯 ---

    function initGame() {
        state.moves = 0;
        state.selectedPeg = -1;
        state.pegs = [[], [], []];
        state.totalDisks = parseInt(diskSelect.value);
        
        // 初始化第一根柱子的盤子 (大在下，小在上)
        for (let i = state.totalDisks; i >= 1; i--) {
            state.pegs[0].push(i);
        }

        updateUI();
        draw();
        showMessage("請點擊柱子開始移動");
    }

    function handleInput(e) {
        const rect = canvas.getBoundingClientRect();
        // 取得點擊相對於 Canvas 的 X 座標 (考慮縮放)
        const scaleX = canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;
        
        // 簡單判斷點擊了哪一根柱子 (將寬度三等分)
        const colWidth = canvas.width / 3;
        const pegIndex = Math.floor(x / colWidth);

        if (state.selectedPeg === -1) {
            // 1. 還沒選柱子 -> 嘗試選取
            if (state.pegs[pegIndex].length > 0) {
                state.selectedPeg = pegIndex;
                showMessage("選擇了柱子 " + (pegIndex + 1));
            } else {
                showMessage(CONFIG.messages.empty);
            }
        } else {
            // 2. 已經選了柱子 -> 嘗試移動到新柱子
            if (state.selectedPeg === pegIndex) {
                // 點同一根 -> 取消選取
                state.selectedPeg = -1;
                showMessage("取消選取");
            } else {
                attemptMove(state.selectedPeg, pegIndex);
            }
        }
        draw();
    }

    function attemptMove(from, to) {
        const fromPeg = state.pegs[from];
        const toPeg = state.pegs[to];
        
        const diskToMove = fromPeg[fromPeg.length - 1]; // 頂端盤子
        const targetTopDisk = toPeg[toPeg.length - 1];  // 目標柱頂端盤子

        // 規則檢查：目標柱必須為空，或者目標盤子比移動盤子大
        if (toPeg.length === 0 || targetTopDisk > diskToMove) {
            toPeg.push(fromPeg.pop());
            state.moves++;
            state.selectedPeg = -1;
            updateUI();
            checkWin();
        } else {
            showMessage(CONFIG.messages.warn);
            state.selectedPeg = -1; // 失敗後重置選取
        }
    }

    function checkWin() {
        // 所有盤子都移到最後一根柱子 (或者第二根也可以)
        if (state.pegs[2].length === state.totalDisks) {
            showMessage(CONFIG.messages.win);
            setTimeout(() => alert(CONFIG.messages.win), 100);
        } else {
            showMessage("");
        }
    }

    // --- 繪圖邏輯 ---
    function draw() {
        // 清空畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const pegWidth = 10;
        const pegHeight = 200;
        const baseHeight = 20;
        const floorY = canvas.height - baseHeight;
        const colWidth = canvas.width / 3;

        // 畫底座
        ctx.fillStyle = '#34495e';
        ctx.fillRect(20, floorY, canvas.width - 40, baseHeight);

        // 畫三根柱子
        for (let i = 0; i < 3; i++) {
            const centerX = i * colWidth + colWidth / 2;
            
            // 柱子本體
            ctx.fillStyle = CONFIG.pegColor;
            ctx.fillRect(centerX - pegWidth / 2, floorY - pegHeight, pegWidth, pegHeight);

            // 高亮目前選取的柱子
            if (state.selectedPeg === i) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 4;
                ctx.strokeRect(i * colWidth + 10, 10, colWidth - 20, canvas.height - 20);
            }

            // 畫盤子
            const pegDisks = state.pegs[i];
            for (let j = 0; j < pegDisks.length; j++) {
                const diskSize = pegDisks[j]; // 1 (最小) ~ totalDisks (最大)
                // 計算盤子寬度：根據盤子大小比例
                const maxDiskWidth = colWidth * 0.8;
                const minDiskWidth = 40;
                const widthStep = (maxDiskWidth - minDiskWidth) / state.totalDisks;
                const width = minDiskWidth + (diskSize - 1) * widthStep;
                
                const height = 25;
                const x = centerX - width / 2;
                const y = floorY - (j + 1) * height; // 由下往上堆疊

                // 顏色循環
                ctx.fillStyle = CONFIG.colors[(diskSize - 1) % CONFIG.colors.length];
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, 5); // 圓角矩形
                ctx.fill();
                ctx.strokeStyle = '#2c3e50';
                ctx.stroke();
                
                // 畫數字 (可選)
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(diskSize, centerX, y + 17);
            }
        }
    }

    function updateUI() {
        moveDisplay.textContent = `移動次數: ${state.moves}`;
    }

    function showMessage(msg) {
        msgDisplay.textContent = msg;
    }

    // --- 事件監聽 ---
    canvas.addEventListener('click', handleInput);
    
    restartBtn.addEventListener('click', () => {
        initGame();
    });

    diskSelect.addEventListener('change', () => {
        initGame();
    });

    // 啟動
    initGame();
</script>