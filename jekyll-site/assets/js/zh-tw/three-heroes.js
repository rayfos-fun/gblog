const output = document.getElementById('game-output');
const attackBtn = document.getElementById('attack-btn');
const musouBtn = document.getElementById('musou-btn');
const fleeBtn = document.getElementById('flee-btn');
const actionButtonsDiv = document.getElementById('action-buttons');
const statusSection = document.getElementById('status-section');
const gameControlsDiv = document.getElementById('game-controls');

const characters = {
  '呂布': { name: '呂布', hp: 500, maxHp: 500, atk: 60, fury: 0, maxFury: 100, def: 0, quote: '吾乃三國第一猛將，誰敢與我一戰！' },
  '劉備': { name: '劉備', hp: 250, maxHp: 250, atk: 25, quote: '漢賊不兩立，王業不偏安。' },
  '關羽': { name: '關羽', hp: 350, maxHp: 350, atk: 40, quote: '溫酒斬華雄！' },
  '張飛': { name: '張飛', hp: 300, maxHp: 300, atk: 35, quote: '燕人張翼德在此！誰敢與我決一死戰！' }
};

let playerCharacter = null;
let enemies = [];
let isMusouActive = false;

function print(message) {
  const text = `> ${message}\n`;
  output.textContent += text;
  output.scrollTop = output.scrollHeight; // auto scroll
}

function updateStatusDisplay() {
  statusSection.innerHTML = '';
  
  enemies.forEach(enemy => {
    const enemyStatusHTML = `
      <div class="character-status">
        <div>${enemy.name}</div>
        <div class="status-bar">
          <div class="hp-bar" style="width: ${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%;"></div>
          <span class="hp-text">HP: ${Math.max(0, enemy.hp)} / ${enemy.maxHp}</span>
        </div>
      </div>
    `;
    statusSection.innerHTML += enemyStatusHTML;
  });
  
  const playerStatusHTML = `
    <div class="character-status">
      <div style="color: #ffcc00;">${playerCharacter.name} (玩家)</div>
      <div class="status-bar">
        <div class="hp-bar" style="width: ${Math.max(0, (playerCharacter.hp / playerCharacter.maxHp) * 100)}%;"></div>
        <span class="hp-text">HP: ${Math.max(0, playerCharacter.hp)} / ${playerCharacter.maxHp}</span>
      </div>
      <div class="status-bar" style="margin-top: 5px;">
        <div class="fury-bar" style="width: ${Math.min(100, playerCharacter.fury)}%;"></div>
        <span class="fury-text">怒氣: ${Math.min(100, playerCharacter.fury)} / ${playerCharacter.maxFury}</span>
      </div>
    </div>
  `;
  statusSection.innerHTML += playerStatusHTML;

  musouBtn.disabled = playerCharacter.fury < 100;
}

function startGame() {
  const oldRestartGroup = document.querySelector('#game-controls .button-group:not(#action-buttons)');
  if (oldRestartGroup) {
    oldRestartGroup.remove();
  }

  output.textContent = '';

  playerCharacter = { ...characters['呂布'] };
  enemies = [
    { ...characters['劉備'] },
    { ...characters['關羽'] },
    { ...characters['張飛'] }
  ];

  print('三國 MUD 戰鬥小遊戲：呂布一打三！');
  print(`你扮演的是 ${playerCharacter.name}。 ${playerCharacter.quote}`);
  print(`你的對手是：劉備、關羽、張飛！\n`);
  
  updateStatusDisplay();
  print('戰鬥開始！');

  actionButtonsDiv.style.display = 'flex';
}

function attackEnemy() {
  if (!playerCharacter || enemies.length === 0) return;
  
  // 玩家回合結束，移除無雙防禦加成
  if (isMusouActive) {
    isMusouActive = false;
  }

  // 玩家攻擊，隨機選擇一個活著的敵人
  const aliveEnemies = enemies.filter(enemy => enemy.hp > 0);
  if (aliveEnemies.length === 0) {
    print('\n恭喜你！你已經擊敗了所有敵人！');
    endGame();
    return;
  }

  const targetEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
  const playerDamage = Math.floor(Math.random() * (playerCharacter.atk * 0.4) + playerCharacter.atk * 0.8);
  
  print(`你對 ${targetEnemy.name} 造成了 ${playerDamage} 點傷害！`);
  targetEnemy.hp -= playerDamage;
  playerCharacter.fury += 50; // 每次攻擊增加怒氣
  updateStatusDisplay();
  
  if (targetEnemy.hp <= 0) {
    print(`\n你擊敗了 ${targetEnemy.name}！`);
  }

  if (enemies.every(enemy => enemy.hp <= 0)) {
    print('\n恭喜你！你擊敗了所有敵人，贏得了勝利！');
    endGame();
    return;
  }

  print('\n輪到敵人的回合...');
  aliveEnemies.forEach(enemy => {
    const enemyDamage = Math.floor(Math.random() * (enemy.atk * 0.4) + enemy.atk * 0.8);
    
    // 根據是否處於無雙狀態來計算實際傷害
    let actualDamage = isMusouActive ? Math.max(0, enemyDamage - playerCharacter.def) : enemyDamage;
    
    print(`${enemy.name} 對你造成了 ${actualDamage} 點傷害！`);
    playerCharacter.hp -= actualDamage;
  });
  updateStatusDisplay();

  if (playerCharacter.hp <= 0) {
    print(`\n你被擊敗了！戰敗了...`);
    endGame();
    return;
  }
  
  print('\n請選擇你的下一步...');
}

// 玩家發動無雙攻擊
function useMusou() {
  if (!playerCharacter || enemies.length === 0) return;
  
  if (playerCharacter.fury < 100) {
    print('\n怒氣不足！無法發動無雙攻擊！');
    return;
  }
  
  const aliveEnemies = enemies.filter(enemy => enemy.hp > 0);
  if (aliveEnemies.length === 0) {
    print('\n周圍已沒有敵人了，無須發動大招！');
    return;
  }

  print(`\n${playerCharacter.name} 怒氣爆發，發動了無雙攻擊！`);
  const musouDamage = Math.floor(playerCharacter.atk * 2); // 無雙傷害為普通攻擊的2倍
  
  playerCharacter.fury -= 100; // 消耗怒氣
  isMusouActive = true; // 啟用無雙防禦加成
  playerCharacter.def = 15; // 設置臨時防禦力
  print(`呂布的防禦力臨時提升了 15 點！`);
  
  aliveEnemies.forEach(enemy => {
    print(`無雙劍氣對 ${enemy.name} 造成了 ${musouDamage} 點傷害！`);
    enemy.hp -= musouDamage;
    if (enemy.hp <= 0) {
      print(`${enemy.name} 被擊敗了！`);
    }
  });
  updateStatusDisplay();

  // 檢查是否所有敵人都被擊敗
  if (enemies.every(enemy => enemy.hp <= 0)) {
    print('\n恭喜你！你擊敗了所有敵人，贏得了勝利！');
    endGame();
    return;
  }

  // 敵人反擊
  print('\n輪到敵人的回合...');
  aliveEnemies.forEach(enemy => {
    // 敵人可能會在無雙攻擊後被擊敗，所以要再次檢查
    if (enemy.hp > 0) {
      const enemyDamage = Math.floor(Math.random() * (enemy.atk * 0.4) + enemy.atk * 0.8);
      
      // 根據是否處於無雙狀態來計算實際傷害
      let actualDamage = isMusouActive ? Math.max(0, enemyDamage - playerCharacter.def) : enemyDamage;

      print(`${enemy.name} 對你造成了 ${actualDamage} 點傷害！`);
      playerCharacter.hp -= actualDamage;
    }
  });
  
  // 無雙防禦加成只持續一回合，在本回合結束後移除
  isMusouActive = false;
  playerCharacter.def = 0;

  updateStatusDisplay();

  if (playerCharacter.hp <= 0) {
    print(`\n你被擊敗了！戰敗了...`);
    endGame();
    return;
  }

  print('\n請選擇你的下一步...');
}

// 逃跑
function flee() {
  print(`\n你選擇了逃跑...`);
  print(`戰鬥結束。`);
  endGame();
}

// 結束遊戲
function endGame() {
  actionButtonsDiv.style.display = 'none';
  
  // 顯示重新開始按鈕
  const restartButton = document.createElement('button');
  restartButton.classList.add('choice-button');
  restartButton.textContent = '重新開始';
  restartButton.onclick = () => {
    startGame();
    actionButtonsDiv.style.display = 'flex';
  };
  const restartGroup = document.createElement('div');
  restartGroup.classList.add('button-group');
  restartGroup.appendChild(restartButton);
  gameControlsDiv.appendChild(restartGroup);
}

// 設定按鈕事件
document.getElementById('attack-btn').onclick = attackEnemy;
document.getElementById('musou-btn').onclick = useMusou;
document.getElementById('flee-btn').onclick = flee;

// 啟動遊戲
startGame();