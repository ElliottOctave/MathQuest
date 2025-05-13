import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let progress = 0;
let currentEquation = [];
let correctEquation = [];
let missingValues = [];
let mistakes = 0;
let startTime = Date.now();
let difficulty;

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateEquation,
  checkAnswerFn: submitAnswer,
  getFeedbackMessageFn: showFeedback,
  gameId: "game3", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = submitAnswer;
window.restartGame = () => {
  progress = 0;
  mistakes = 0;
  startTime = Date.now();
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};

window.onload = () => changeDifficulty();

// Function to generate the equation
async function generateEquation() {
  difficulty = await getDifficulty("game3"); // gameId van dit spel
  const operators = ['+', '-'];
  let left = 0, right = 0, result = 0, op = '+';

  const max =
    difficulty === 1 ? 10 :
    difficulty === 2 ? 15 : 20;

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
    currentEquation[0] = '__';
    currentEquation[2] = '__';
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
        updatePerformance("game7", mistakes, startTime);
      }, 600);
    } else {
      setTimeout(generateEquation, 1200);
    }

  } else {
    mistakes++;
    game.registerMistake();
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

window.showHelp = function () {
  const operators = ['+', '-'];

  function createExercise(gaps = 1) {
    const max = 20;
    let left, right, result, op;
    do {
      left = Math.floor(Math.random() * (max + 1));
      right = Math.floor(Math.random() * (max + 1));
      op = operators[Math.floor(Math.random() * operators.length)];
      result = op === '+' ? left + right : left - right;
    } while (
      result < 0 || result > max ||
      left > max || right > max
    );

    const full = [`${left}`, op, `${right}`, '=', `${result}`];
    let display = [...full];
    const missing = [];

    if (gaps === 1) {
      const idx = Math.random() < 0.5 ? 0 : 2;
      display[idx] = '__';
      missing.push(full[idx]);
    } else if (gaps === 2) {
      display[0] = '__';
      display[2] = '__';
      missing.push(full[0], full[2]);
    }

    const pool = ['+', '-', '=', ...Array.from({ length: 21 }, (_, i) => `${i}`)];
    let options = [...missing];
    while (options.length < 6) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      if (!options.includes(rand)) options.push(rand);
    }

    return {
      display,
      solution: full,
      options: shuffleArray(options)
    };
  }

  function renderEquation(arr) {
    return arr.map(v => `
      <div style="display:inline-block; margin: 4px; padding: 8px 12px;
                  border-radius: 8px; font-weight: bold;
                  background-color: ${v === '__' ? '#ffe082' : '#e0e0e0'};">
        ${v}
      </div>
    `).join('');
  }

  function renderOptions(arr) {
    return arr.map(v => `
      <div style="display:inline-block; margin: 3px; padding: 8px 10px;
                  border-radius: 6px; background-color: #ffd54f;">
        ${v}
      </div>
    `).join('');
  }

  function generateExplanation(e) {
    const missing = e.display.map((v, i) => v === '__' ? i : -1).filter(i => i !== -1);
    const op = e.solution[1];
    const left = parseInt(e.solution[0]);
    const right = parseInt(e.solution[2]);
    const result = parseInt(e.solution[4]);
    let expl = '';
  
    if (missing.length === 1) {
      const idx = missing[0];
      const val = e.solution[idx];
  
      if (idx === 0) {
        expl = `
          <p>The first number is missing.</p>
          <p>Tip: Try to find the number that ${op === '+' ? 'you add to' : 'you start with before subtracting'} ${right} to get ${result}.</p>
          <p>Think: what number ${op === '+' ? 'plus' : 'minus'} ${right} makes ${result}?</p>
          <p>The answer is <strong>${val}</strong>.</p>
        `;
      } else if (idx === 2) {
        expl = `
          <p>The second number is missing.</p>
          <p>Tip: Try to find the number that goes with ${left} to make ${result} using ${op === '+' ? 'adding' : 'subtracting'}.</p>
          <p>Think: what number fits in <strong>${left} ${op} ? = ${result}</strong>?</p>
          <p>The answer is <strong>${val}</strong>.</p>
        `;
      }
    } else {
      expl = `
        <p>Two numbers are missing.</p>
        <p>Tip: Try some of the choices and see what fits together with ${op} to make ${result}.</p>
        <p>Think: what two numbers go together with ${op} to get ${result}?</p>
        <p>The full equation is: <strong>${e.solution[0]} ${op} ${e.solution[2]} = ${result}</strong>.</p>
      `;
    }
  
    return expl;
  }
  
  const ex1 = createExercise(1); // 1 missing part
  const ex2 = createExercise(2); // 2 missing parts

  const tipBox = document.createElement('div');
  tipBox.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #fff9c4;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 420px;
      max-height: 75vh;
      overflow-y: auto;
      z-index: 1001;
      font-family: sans-serif;
    ">

      <h5>Example 1</h5>
      <p>Let’s look at this one together:</p>
      <div>${renderEquation(ex1.display)}</div>
      <p><strong>Choices:</strong></p>
      <div>${renderOptions(ex1.options)}</div>
      ${generateExplanation(ex1)}

      <hr>

      <h5>Example 2</h5>
      <p>Here’s another one to figure out:</p>
      <div>${renderEquation(ex2.display)}</div>
      <p><strong>Choices:</strong></p>
      <div>${renderOptions(ex2.options)}</div>
      ${generateExplanation(ex2)}

      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-3">Close</button>
    </div>
  `;

  document.body.appendChild(tipBox);

  function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }
};
