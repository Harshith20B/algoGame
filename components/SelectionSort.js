const barContainer = document.getElementById("bar-container");
const minBtn = document.getElementById("min-btn");
const nextBtn = document.getElementById("next-btn");
const resetBtn = document.getElementById("reset-btn");
const minSelect = document.getElementById("min-select");
const feedback = document.getElementById("feedback");
const rightCounter = document.getElementById("right-counter");
const wrongCounter = document.getElementById("wrong-counter");
const currentElementDisplay = document.getElementById("current-element");

let bars = [];
let array = [];
let i = 0;
let rightAnswers = 0;
let wrongAnswers = 0;
let minIndex = -1;

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
  updateSelection();
}

// Update selection view
function updateSelection() {
  // Display the i-th element
  currentElementDisplay.textContent = `Current element (i): ${array[i]}`;

  // Highlight the current i-th element
  bars.forEach((bar, index) => {
    if (index < i) {
      bar.style.backgroundColor = "lightgray"; // Sorted elements
    } else if (index === i) {
      bar.style.backgroundColor = "red"; // Current element
    } else {
      bar.style.backgroundColor = "#6c63ff"; // Unsorted elements
    }
  });

  // Populate the dropdown with unsorted elements, including the i-th element
  minSelect.innerHTML = "";
  for (let j = i; j < array.length; j++) {
    const option = document.createElement("option");
    option.value = j;
    option.textContent = array[j];
    minSelect.appendChild(option);
  }
}

// Swap elements in array and DOM
function swapElements() {
  [array[i], array[minIndex]] = [array[minIndex], array[i]];
  [bars[i].textContent, bars[minIndex].textContent] = [bars[minIndex].textContent, bars[i].textContent];
  [bars[i].style.height, bars[minIndex].style.height] = [bars[minIndex].style.height, bars[i].style.height];
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

// Handle "Select Minimum" button click
function selectMinimum() {
  const userMinIndex = parseInt(minSelect.value, 10);

  // Find the correct minimum index
  let correctMinIndex = i;
  for (let j = i + 1; j < array.length; j++) {
    if (array[j] < array[correctMinIndex]) {
      correctMinIndex = j;
    }
  }

  // Check if the user selected the correct minimum
  if (userMinIndex === correctMinIndex) {
    feedback.textContent = "Good job! You selected the correct minimum.";
    updateCounters(true);
  } else {
    feedback.textContent = `Wrong answer! The correct minimum is ${array[correctMinIndex]}. But swapping anyway.`;
    updateCounters(false);
  }

  // Perform the swap
  minIndex = correctMinIndex;
  swapElements();

  // Proceed to the next iteration
  i++;
  if (i < array.length) {
    updateSelection();
  } else {
    feedback.textContent = "Array is sorted! Well done!";
    nextBtn.disabled = true;
    minBtn.disabled = true;
  }
}

// Handle "Next" button click (moves to the next element)
function moveToNextElement() {
  if (i < array.length) {
    updateSelection();
  }
}

// Reset the game
function resetGame() {
  i = 0;
  rightAnswers = 0;
  wrongAnswers = 0;
  rightCounter.textContent = 0;
  wrongCounter.textContent = 0;
  feedback.textContent = "";
  nextBtn.disabled = false;
  minBtn.disabled = false;
  generateBars();
  updateSelection();
}

// Event listeners
nextBtn.addEventListener("click", moveToNextElement);
minBtn.addEventListener("click", selectMinimum);
resetBtn.addEventListener("click", resetGame);

// Initialize the game
generateBars();
updateSelection();