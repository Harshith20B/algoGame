const array = [8, 3, 5, 1, 9, 2, 6, 4];
let currentArray = [...array];
let steps = [];
let currentStepIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;

// DOM Elements
const barContainer = document.getElementById("bar-container");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const nextButton = document.getElementById("next-button");
const scoreText = document.getElementById("score-text");

// Generate merge steps
function generateSteps(array) {
  const steps = [];
  let groups = array.map((n) => [n]);

  while (groups.length > 1) {
    const newGroups = [];
    for (let i = 0; i < groups.length; i += 2) {
      if (i + 1 < groups.length) {
        steps.push({
          group1: groups[i],
          group2: groups[i + 1],
        });
        newGroups.push([...groups[i], ...groups[i + 1]].sort((a, b) => a - b));
      } else {
        newGroups.push(groups[i]);
      }
    }
    groups = newGroups;
  }

  return steps;
}

// Render the current step
function renderStep() {
  const step = steps[currentStepIndex];
  renderChart(currentArray, [...step.group1, ...step.group2]);
  questionText.textContent = `Compare the elements: ${step.group1} and ${step.group2}. Select the smallest.`;
  renderOptions([...step.group1, ...step.group2]);
}

// Render the bar chart
function renderChart(array, highlight = []) {
  barContainer.innerHTML = "";
  array.forEach((num) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${num * 20}px`;
    bar.textContent = num;
    if (highlight.includes(num)) bar.classList.add("highlight");
    barContainer.appendChild(bar);
  });
}

// Render the options
function renderOptions(options) {
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => handleAnswer(option);
    optionsContainer.appendChild(button);
  });
}

// Handle the answer
function handleAnswer(selected) {
  const step = steps[currentStepIndex];
  const correct = Math.min(...[...step.group1, ...step.group2]);

  if (selected === correct) {
    feedback.textContent = "Correct! Well done.";
    correctAnswers++;
  } else {
    feedback.textContent = `Wrong! The correct answer was ${correct}.`;
    incorrectAnswers++;
  }

  // Update array with merged groups
  currentArray = currentArray.map((n) =>
    step.group1.includes(n) || step.group2.includes(n) ? null : n
  );
  currentArray = currentArray.filter((n) => n !== null);
  currentArray.push(...[...step.group1, ...step.group2].sort((a, b) => a - b));

  scoreText.textContent = `Correct: ${correctAnswers} | Incorrect: ${incorrectAnswers}`;
  nextButton.disabled = false;
}

// Handle the next step
nextButton.onclick = () => {
  currentStepIndex++;
  if (currentStepIndex < steps.length) {
    renderStep();
  } else {
    feedback.textContent = "Great job! The array is now sorted!";
    renderChart(array.sort((a, b) => a - b));
  }
  nextButton.disabled = true;
};

// Initialize the game
steps = generateSteps(array);
renderStep();