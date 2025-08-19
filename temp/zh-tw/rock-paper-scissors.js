const choices = ["石頭", "布", "剪刀"];
const resultElement = document.getElementById("result");

function playRound(playerChoice) {
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = "";

  if (playerChoice === computerChoice) {
    result = `對手出${computerChoice}，雙方平手!`;
  } else {
    result = `玩家出${playerChoice}，對手出${computerChoice}。`
    if ((playerChoice === "石頭" && computerChoice === "剪刀") ||
        (playerChoice === "布" && computerChoice === "石頭") ||
        (playerChoice === "剪刀" && computerChoice === "布")) {
      result += '玩家';
    } else {
      result += '對手';
    }
    result += '勝利！';
  }
  resultElement.textContent = result;
}