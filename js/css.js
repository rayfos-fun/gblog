document.addEventListener('DOMContentLoaded', () => {
  const flexContainer = document.getElementById('flex-container');
  const directionRadios = document.querySelectorAll('input[name="flex-direction"]');

  // Set initial flex-direction based on the checked radio button
  directionRadios.forEach(radio => {
    if (radio.checked) {
      flexContainer.style.flexDirection = radio.value;
    }
  });

  // Add change event listener to each radio button
  directionRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      flexContainer.style.flexDirection = event.target.value;
    });
  });
});