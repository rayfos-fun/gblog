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
    feedbackDiv.textContent = `Too low. Try again between ${low} and ${high}.`;
  } else if (guess > secretNumber) {
    high = Math.min(high, guess);
    feedbackDiv.textContent = `Too high. Try again between ${low} and ${high}.`;
  } else {
    // guess === secretNumber
    feedbackDiv.textContent = `Congratulations! You guessed the number ${secretNumber}!`;
    // Optionally disable the input and button after winning
    guessInput.disabled = true;
    document.querySelector('button').disabled = true;
  }

  guessInput.value = "";
}
