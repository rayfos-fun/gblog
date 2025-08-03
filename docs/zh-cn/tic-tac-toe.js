
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetBtn = document.getElementById('reset');
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function handleCellClick(clickedCellEvent) {
  const clickedCell = clickedCellEvent.target;
  const clickedCellIndex = parseInt(clickedCell.dataset.index);

  if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
    return;
  }

  gameBoard[clickedCellIndex] = currentPlayer;
  clickedCell.textContent = currentPlayer;
  checkWin();
  checkDraw();
  switchPlayer();
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWin() {
  for (let i = 0; i <= 7; i++) {
    const winCondition = winningConditions[i];
    const a = gameBoard[winCondition[0]];
    const b = gameBoard[winCondition[1]];
    const c = gameBoard[winCondition[2]];

    if (a === '' || b === '' || c === '') {
      continue;
    }

    if (a === b && b === c) {
      message.textContent = `${currentPlayer} 胜利!`;
      gameActive = false;
      return;
    }
  }
}

function checkDraw() {
  if (!gameBoard.includes('') && gameActive) {
    message.textContent = `平手！`;
    gameActive = false;
  }
}

function handleReset() {
  currentPlayer = 'X';
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  message.textContent = '';
  cells.forEach(cell => cell.textContent = '');
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', handleReset);