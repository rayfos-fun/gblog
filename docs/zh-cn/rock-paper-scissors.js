const choices = ["石头", "布", "剪刀"];
const resultElement = document.getElementById("result");

function playRound(playerChoice) {
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = "";

  if (playerChoice === computerChoice) {
    result = `对手出${computerChoice}，双方平手!`;
  } else {
    result = `玩家出${playerChoice}，对手出${computerChoice}。`
    if ((playerChoice === "石头" && computerChoice === "剪刀") ||
        (playerChoice === "布" && computerChoice === "石头") ||
        (playerChoice === "剪刀" && computerChoice === "布")) {
      result += '玩家';
    } else {
      result += '对手';
    }
    result += '胜利！';
  }
  resultElement.textContent = result;
}