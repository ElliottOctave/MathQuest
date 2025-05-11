import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let difficulty = 1;
let progress = 0;
let flags = [];
let selectedOrder = [];
let synth = window.speechSynthesis;


  // Initialize the game with the necessary functions
  const game = setupGame({
    generateQuestionFn: generateQuestion,
    checkAnswerFn: checkAnswer,
    getFeedbackMessageFn: getFeedbackMessage,
    gameId: "game5", // Unique game ID for tracking
  });

  window.readStory = game.readStory;
  window.changeDifficulty = game.changeDifficulty;
  window.restartGame = game.restartGame;
  // Expose submitAnswer to the global scope
  window.submitAnswer = submitAnswer;

  window.onload = () => changeDifficulty();

// Function to generate the question (i.e., create the flags)
function generateQuestion(difficulty) {
  console.log("Generating question for difficulty:", difficulty);
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

    if (difficulty < 3) {
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
  if (difficulty < 3) {
    if (selectedOrder.length === 0) {
      document.getElementById("feedback").innerHTML = "❗ Please select a flag first!";
      return;
    }
  }

  if (difficulty === 1) {
    const shortest = flags.reduce((min, flag) => (flag.height < min.height ? flag : min));
    if (selectedOrder[0] === shortest.id) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  } else if (difficulty === 2) {
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
      updatePerformance("game5");
      launchConfetti();
    }, 500);
  } else {
    setTimeout(() => {
      generateQuestion(difficulty);
    }, 1500);
  }
}

// Update the task instructions based on difficulty
function updateTaskText() {
  const task = document.getElementById("taskText");
  if (difficulty === 1) {
    task.innerHTML = "Click the shortest flag!";
  } else if (difficulty === 2) {
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
  generateQuestion(difficulty);
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
