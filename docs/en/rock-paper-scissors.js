const choices = ["rock", "paper", "scissors"];
const resultElement = document.getElementById("result");

function playRound(playerChoice) {
  const computerChoice = choices[Math.floor(Math.random() * 3)];
  let result = "";

  if (playerChoice === computerChoice) {
    result = `Computer chose ${computerChoice}. It's a tie!`;
  } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")) {
    result = `You chose ${playerChoice}, computer chose ${computerChoice}. You win!`;
  } else {
    result = `You chose ${playerChoice}, computer chose ${computerChoice}. Computer wins!`;
  }
  resultElement.textContent = result;
}
