import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
let flags = [];
let selectedOrder = [];
let synth = window.speechSynthesis;
let mistakes = 0;
let startTime = Date.now();
let difficulty;
  // Initialize the game with the necessary functions
  const game = setupGame({
    generateQuestionFn: generateQuestion,
    checkAnswerFn: checkAnswer,
    getFeedbackMessageFn: getFeedbackMessage,
    gameId: "game7", // Unique game ID for tracking
  });

  window.readStory = game.readStory;
  window.changeDifficulty = game.changeDifficulty;
  window.restartGame = window.restartGame = () => {
  progress = 0;
  mistakes = 0;
  startTime = Date.now();
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};
  window.submitAnswer = submitAnswer;

  window.onload = () => changeDifficulty();

// Function to generate the question (i.e., create the flags)
async function generateQuestion() {
  difficulty = await getDifficulty("game7"); // gameId van dit spel
  console.log("Generating question for difficulty:", difficulty);
  game_difficulty = difficulty || 1; // Default to 1 if not provided
  const flagsArea = document.getElementById("flagsArea");
  flagsArea.innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  selectedOrder = [];

  const numFlags = 5;
  flags = [];

  for (let i = 0; i < numFlags; i++) {
    const height = Math.floor(Math.random() * 100) + 50;
    const color = randomColor();
    const id = Math.random().toString(36).substr(2, 7);
    flags.push({ id, height, color });
  }

  flags.forEach(flag => {
    const div = document.createElement("div");
    div.className = "flag-block";
    div.style.height = `${flag.height}px`;
    div.style.backgroundColor = flag.color;
    div.dataset.id = flag.id;

    if (game_difficulty < 3) {
      div.addEventListener("click", () => selectFlag(flag.id));
    } else {
      div.draggable = true;
      div.addEventListener("dragstart", handleDragStart);
      div.addEventListener("dragover", handleDragOver);
      div.addEventListener("drop", handleDrop);
    }

    flagsArea.appendChild(div);
  });

  updateTaskText();
}

export function submitAnswer() {
  if (game_difficulty < 3) {
    if (selectedOrder.length === 0) {
      document.getElementById("feedback").innerHTML = "❗ Please select a flag first!";
      return;
    }
  }

  if (game_difficulty === 1) {
    const shortest = flags.reduce((min, flag) => (flag.height < min.height ? flag : min));
    if (selectedOrder[0] === shortest.id) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  } else if (game_difficulty === 2) {
    const tallest = flags.reduce((max, flag) => (flag.height > max.height ? flag : max));
    if (selectedOrder[0] === tallest.id) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  } else {
    const currentOrder = Array.from(document.querySelectorAll(".flag-block")).map(div => div.dataset.id);
    const correctOrder = [...flags].sort((a, b) => a.height - b.height).map(f => f.id);

    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  }
}

function correctAnswer() {
  document.getElementById("feedback").innerHTML = `<span class="correct">✅ Correct!</span>`;
  progress += 20;
  document.getElementById("progressBar").style.width = `${progress}%`;

  if (progress >= 100) {
    setTimeout(() => {
      const win = new bootstrap.Modal(document.getElementById("winModal"));
      win.show();
      updatePerformance("game7", mistakes, startTime);
      launchConfetti();
    }, 500);
  } else {
    setTimeout(() => {
      generateQuestion(game_difficulty);
    }, 1500);
  }
}

function wrongAnswer() {
  mistakes++;
  game.registerMistake();
  document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Try again!</span>`;
}

// Update the task instructions based on difficulty
function updateTaskText() {
  const task = document.getElementById("taskText");
  if (game_difficulty === 1) {
    task.innerHTML = "Click the shortest flag!";
  } else if (game_difficulty === 2) {
    task.innerHTML = "Click the tallest flag!";
  } else {
    task.innerHTML = "Drag the flags from shortest ➔ tallest!";
  }
}

// Function to select a flag (click mode)
function selectFlag(id) {
  console.log("Selected flag ID:", id);
  const flagDivs = document.querySelectorAll('.flag-block');
  flagDivs.forEach(div => div.classList.remove('selected'));

  const flagDiv = document.querySelector(`[data-id="${id}"]`);
  flagDiv.classList.add('selected');
  selectedOrder = [id];
}

// DRAG AND DROP HANDLERS
function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text/plain");
  const targetId = e.target.dataset.id;

  const flagsArea = document.getElementById("flagsArea");
  const draggedEl = document.querySelector(`[data-id="${draggedId}"]`);
  const targetEl = document.querySelector(`[data-id="${targetId}"]`);

  if (draggedEl && targetEl && draggedEl !== targetEl) {
    flagsArea.insertBefore(draggedEl, targetEl);
  }
}

// Function to check if the answer is correct (for template integration)
function checkAnswer(userInput) {
  return { correct: selectedOrder[0] === userInput, correctAnswer: selectedOrder[0] };
}

// Function to get the feedback message (for template integration)
function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! You selected the correct flag.`
    : `❌ Oops! Try again. The correct flag was ${correctAnswer}.`;
}

// Function to handle the restart of the game
function restartGame() {
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion(game_difficulty);
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

// Function to get a random color for the flags
function randomColor() {
  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6F91"];
  return colors[Math.floor(Math.random() * colors.length)];
}

window.showHelp = function () {
  if (!flags.length) return;

  const flagHeights = [...flags];
  const sorted = flagHeights.slice().sort((a, b) => a.height - b.height);

  let title = "";
  let explanation = "";
  let example = "";

  const flagVisuals = sorted.map(f =>
    `<div style="width: 30px; height: ${f.height / 2}px; background:${f.color}; margin: 0 5px; border-radius: 4px;"></div>`
  ).join('');

  // 🟡 Difficulty 1 – Kortste vlag
  if (difficulty === 1) {
    const minHeight = Math.min(...sorted.map(f => f.height));
    const linePosition = minHeight / 2;

    title = "Let’s find the shortest flag!";
    explanation = `
      <p>All flags are hanging from the same rope.</p>
      <p>The shortest one is the flag that <strong>hangs the least</strong>.</p>
      <p>Use your eyes like a ruler and look at the <strong>bottoms</strong> of the flags.</p>
      <p>Which one stops first?</p>
    `;

    example = `
      <p>Let’s look:</p>
      <div style="position: relative; display: flex; justify-content: center; align-items: flex-start; height: 100px; margin-bottom: 10px;">
        <div style="position: absolute; top: ${linePosition}px; left: 0; right: 0; height: 2px; background: #555;"></div>
        ${flagVisuals}
      </div>
      <p>The shortest flag <strong>just touches the line</strong>. The others go lower!</p>
    `;
  }

  // 🔵 Difficulty 2 – Langste vlag
  else if (difficulty === 2) {
    const maxHeight = Math.max(...sorted.map(f => f.height));
    const linePosition = maxHeight / 2;

    title = "Let’s find the tallest flag!";
    explanation = `
      <p>All the flags hang from the same place.</p>
      <p>The tallest flag <strong>hangs the furthest down</strong>.</p>
      <p>Look with your eyes like a ruler: who goes the lowest?</p>
    `;

    example = `
      <p>See this example:</p>
      <div style="position: relative; display: flex; justify-content: center; align-items: flex-start; height: 100px; margin-bottom: 10px;">
        <div style="position: absolute; top: ${linePosition}px; left: 0; right: 0; height: 2px; background: #555;"></div>
        ${flagVisuals}
      </div>
      <p>The tallest flag <strong>just touches the line</strong>. The others stay higher!</p>
    `;
  }

  // 🟣 Difficulty 3 – Sorteer van klein naar groot
  else {
    title = "Let’s sort the flags!";
    explanation = `
      <p>Can you put the flags in a line?</p>
      <p>Start with the flag that hangs the least.</p>
      <p>Then pick the next biggest... all the way to the longest one!</p>
    `;

    example = `
      <p>This is how the order should look:</p>
      <div style="display: flex; justify-content: center; align-items: flex-start; height: 100px;">
        ${flagVisuals}
      </div>
    `;
  }

  // Tip box
  const tipBox = document.createElement("div");
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
      <h5 style="margin-top: 0;">Tip:</h5>
      <p><strong>${title}</strong></p>
      ${explanation}
      ${example}
      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-3">Close</button>
    </div>
  `;
  document.body.appendChild(tipBox);
};
