const barContainer = document.getElementById("bar-container");
const switchBtn = document.getElementById("switch-btn");
const dontSwitchBtn = document.getElementById("dont-switch-btn");
const resetBtn = document.getElementById("reset-btn");
const feedback = document.getElementById("feedback");
const rightCounter = document.getElementById("right-counter");
const wrongCounter = document.getElementById("wrong-counter");

let bars = [];
let array = [];
let i = 0, j = 0;
let rightAnswers = 0;
let wrongAnswers = 0;

// Generate random bars
function generateBars() {
  barContainer.innerHTML = "";
  bars = [];
  array = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 1);
  array.forEach((value) => {
    const bar = document.createElement("div");
    bar.style.height = `${value * 2}px`;
    bar.classList.add("bar");
    bar.textContent = value;
    barContainer.appendChild(bar);
    bars.push(bar);
  });
}

// Highlight bars for comparison
function highlightBars() {
  if (j < array.length - i - 1) {
    bars[j].style.backgroundColor = "red";
    bars[j + 1].style.backgroundColor = "red";
  }
}

// Remove bar highlights
function removeHighlights() {
  bars.forEach(bar => bar.style.backgroundColor = "#6c63ff");
}

// Update counters
function updateCounters(isCorrect) {
  if (isCorrect) {
    rightAnswers++;
    rightCounter.textContent = rightAnswers;
  } else {
    wrongAnswers++;
    wrongCounter.textContent = wrongAnswers;
  }
}

// Validate user's choice
function validateChoice(switchChoice) {
  const shouldSwitch = array[j] > array[j + 1];
  if (switchChoice === shouldSwitch) {
    feedback.textContent = "Good job! That's the correct choice.";
    updateCounters(true);
  } else {
    feedback.textContent = shouldSwitch
      ? "Wrong! You should have switched. Performing the switch anyway."
      : "Wrong! You shouldn't switch. Moving to the next step.";
    updateCounters(false);
  }

  // Perform the switch if necessary
  if (array[j] > array[j + 1]) {
    [array[j], array[j + 1]] = [array[j + 1], array[j]];
    bars[j].style.height = `${array[j] * 2}px`;
    bars[j].textContent = array[j];
    bars[j + 1].style.height = `${array[j + 1] * 2}px`;
    bars[j + 1].textContent = array[j + 1];
  }

  // Move to the next comparison
  removeHighlights();
  j++;
  if (j >= array.length - i - 1) {
    j = 0;
    i++;
  }

  if (i >= array.length - 1) {
    feedback.textContent = "Sorting complete! Well done!";
    switchBtn.disabled = true;
    dontSwitchBtn.disabled = true;
  } else {
    highlightBars();
  }
}

// Reset the game
function resetGame() {
  i = 0;
  j = 0;
  rightAnswers = 0;
  wrongAnswers = 0;
  rightCounter.textContent = 0;
  wrongCounter.textContent = 0;
  feedback.textContent = "";
  switchBtn.disabled = false;
  dontSwitchBtn.disabled = false;
  generateBars();
  highlightBars();
}

// Event listeners
switchBtn.addEventListener("click", () => validateChoice(true));
dontSwitchBtn.addEventListener("click", () => validateChoice(false));
resetBtn.addEventListener("click", resetGame);

// Initialize game
generateBars();
highlightBars();