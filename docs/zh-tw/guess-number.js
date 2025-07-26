let secretNumber = 1 + Math.floor(Math.random() * 999)
let low = 0;
let high = 1000;

checkGuess = function() {
  const guessInput = document.getElementById("guess");
  const feedbackDiv = document.getElementById("feedback");
  const guess = parseInt(guessInput.value);

  if (isNaN(guess) || guess < 0 || guess > 1000) {
    feedbackDiv.textContent = "Please enter a valid number between 0 and 1000.";
    return;
  }

  if (guess < secretNumber) {
    low = Math.max(low, guess);
    feedbackDiv.textContent = `太小了。再試一次吧！數字範圍從${low}到${high}。`;
  } else if (guess > secretNumber) {
    high = Math.min(high, guess);
    feedbackDiv.textContent = `太大了。再試一次吧！數字範圍從${low}到${high}。`;
  } else {
    // guess === secretNumber
    feedbackDiv.textContent = `恭喜答對! 正確答案就是${secretNumber}！`;
    // Optionally disable the input and button after winning
    guessInput.disabled = true;
    document.querySelector('button').disabled = true;
  }

  guessInput.value = "";
}
