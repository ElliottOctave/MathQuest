import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let difficulty = 1;
let progress = 0;
let currentEquation = [];
let correctEquation = [];
let missingValues = [];

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateEquation,
  checkAnswerFn: submitAnswer,
  getFeedbackMessageFn: showFeedback,
  gameId: "game7", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = submitAnswer;
window.restartGame = () => {
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};

window.onload = () => changeDifficulty();

// Function to generate the equation
function generateEquation(difficulty) {
  const operators = ['+', '-'];
  let left = 0, right = 0, result = 0, op = '+';

  // Set max based on difficulty
  const max =
    difficulty === 1 ? 10 :
    difficulty === 2 ? 15 :
    20;

  do {
    left = Math.floor(Math.random() * (max + 1));
    right = Math.floor(Math.random() * (max + 1));
    op = operators[Math.floor(Math.random() * operators.length)];
    result = op === '+' ? left + right : left - right;
  } while (
    left < 0 || right < 0 || result < 0 ||
    result > max || left > max || right > max
  );

  const base = [`${left}`, op, `${right}`, '=', `${result}`];
  correctEquation = [...base];
  currentEquation = [...base];
  missingValues = [];

  // Hide parts based on difficulty
  if (difficulty === 1) {
    const missing = Math.random() < 0.5 ? 0 : 2;
    missingValues.push(base[missing]);
    currentEquation[missing] = '__';
  } else if (difficulty === 2) {
    currentEquation[1] = '__'; // hide operator
    currentEquation[0] = '__'; // hide number
    missingValues.push(base[0]);
    missingValues.push(base[1]);
  } else {
    currentEquation[0] = '__'; // first number
    currentEquation[2] = '__'; // second number
    missingValues.push(base[0]);
    missingValues.push(base[2]);
  }

  renderEquation();
  renderTiles();
}

// Function to render the equation with placeholders
function renderEquation() {
  const container = document.getElementById('equationContainer');
  container.innerHTML = '';

  currentEquation.forEach((item, i) => {
    const el = document.createElement('div');
    if (item === '__') {
      el.className = 'equation-slot';
      el.dataset.index = i;
      el.ondragover = e => e.preventDefault();
      el.ondrop = handleDrop;
    } else {
      el.className = 'equation-slot';
      el.textContent = item;
      el.style.fontWeight = 'bold';
      el.style.backgroundColor = '#f5f5f5';
    }
    container.appendChild(el);
  });
}

// Function to render the tiles with possible answers
function renderTiles() {
  const pool = ['+', '-', '=', ...Array.from({ length: 21 }, (_, i) => `${i}`)];
  const tilesContainer = document.getElementById("tiles");
  tilesContainer.innerHTML = '';

  let tileOptions = [...missingValues];

  // Add random fake options (without duplicating correct ones)
  while (tileOptions.length < 6) {
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (!tileOptions.includes(random)) {
      tileOptions.push(random);
    }
  }

  shuffleArray(tileOptions).forEach(val => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.draggable = true;
    tile.textContent = val;
    tile.ondragstart = e => e.dataTransfer.setData("text/plain", val);
    tilesContainer.appendChild(tile);
  });
}

// Function to handle drag and drop of tiles
function handleDrop(e) {
  e.preventDefault();
  const value = e.dataTransfer.getData("text/plain");
  const slot = e.target;
  slot.textContent = value;
  slot.style.backgroundColor = "#e0f7fa";
}

// Function to submit the answer
export function submitAnswer() {
  const slots = document.querySelectorAll('.equation-box .equation-slot');
  const guess = Array.from(slots).map(el => el.textContent.trim());

  let left = guess[0], op = guess[1], right = guess[2], eq = guess[3], result = guess[4];

  if ([left, op, right, eq, result].includes('__') || eq !== '=') {
    showFeedback("❌ Equation is incomplete or invalid", false);
    return;
  }

  left = parseInt(left);
  right = parseInt(right);
  result = parseInt(result);

  let isCorrect = false;

  if (op === '+' && left + right === result) isCorrect = true;
  if (op === '-' && left - right === result) isCorrect = true;

  if (isCorrect) {
    progress += 20;
    document.getElementById("progressBar").style.width = `${progress}%`;
    showFeedback("✅ Correct!", true);

    if (progress >= 100) {
      setTimeout(() => {
        const winModal = new bootstrap.Modal(document.getElementById("winModal"));
        winModal.show();
        launchConfetti();
        updatePerformance("game7");
      }, 600);
    } else {
      setTimeout(generateEquation, 1200);
    }

  } else {
    showFeedback("❌ Try again!", false);
  }
}

// Function to show feedback
function showFeedback(message, correct) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.className = correct ? 'correct' : 'incorrect';
}

// Function to shuffle the array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Function to launch confetti when the game is won
function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#ff6b6b', '#ffe066', '#6bcB77']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4dabf7', '#ffcccb', '#f39c12']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
