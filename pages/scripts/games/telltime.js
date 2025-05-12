import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
let correctHour = 0;
let correctMinute = 0;
let draggedHour = 0;
let draggedMinute = 0;
let draggingHand = null;
const synth = window.speechSynthesis;

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: submitAnswer,
  getFeedbackMessageFn: correctFeedback,
  gameId: "game6", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.restartGame = () => {
  document.getElementById("progressBar").style.width = "0%";
  progress = 0;
  game.restartGame(); // This calls the restart function from the game template
};
window.adjustHour = adjustHour;
window.adjustMinute = adjustMinute;
window.submitAnswer = submitAnswer;

window.onload = () => changeDifficulty();

// Function to generate the question
function generateQuestion(difficulty) {
  game_difficulty = difficulty || 1; // Default to 1 if not provided
  console.log("Generating question for difficulty:", difficulty);
  const digitalArea = document.getElementById("digitalArea");

  if (game_difficulty === 1) {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = 0;
  } else if (game_difficulty === 2) {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = Math.random() < 0.5 ? 0 : 30;
  } else {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = Math.random() < 0.5 ? 0 : 30;
  }
  console.log(game_difficulty, correctHour, correctMinute);
  if (game_difficulty < 3) {
    digitalArea.innerHTML = `
      <div class="digital-clock">
        <div class="time-section">
          <button class="adjust-btn" onclick="adjustHour(1)">▲</button>
          <div id="hourDisplay" class="time-number">0</div>
          <button class="adjust-btn" onclick="adjustHour(-1)">▼</button>
        </div>
        <div class="separator">:</div>
        <div class="time-section">
          <button class="adjust-btn" onclick="adjustMinute(1)">▲</button>
          <div id="minuteDisplay" class="time-number">00</div>
          <button class="adjust-btn" onclick="adjustMinute(-1)">▼</button>
        </div>
      </div>
    `;
    updateDigitalDisplay();
  } else {
    digitalArea.innerHTML = `
      <div class="digital-clock">
        <div class="time-section">
          <div class="time-number">${correctHour}</div>
        </div>
        <div class="separator">:</div>
        <div class="time-section">
          <div class="time-number">${correctMinute.toString().padStart(2, '0')}</div>
        </div>
      </div>
    `;
  }

  drawClock();
}

// Function to adjust hour
function adjustHour(change) {
    const display = document.getElementById('hourDisplay');
    let value = parseInt(display.textContent) || 0;
    value = (value + change + 13) % 13; // 0-12 only
    if (value === 0) value = 12;
    display.textContent = value;
  }

// Function to adjust minute
function adjustMinute(change) {
  const display = document.getElementById('minuteDisplay');
  let value = parseInt(display.textContent) || 0;
  value = (value === 30 ? 30 : 0);
  value = (value + (change * 30) + 60) % 60; // 0 or 30 only
  display.textContent = value.toString().padStart(2, '0');
}

// Function to update the digital display
function updateDigitalDisplay() {
  document.getElementById('hourDisplay').textContent = '0';
  document.getElementById('minuteDisplay').textContent = '00';
}

// Function to draw the clock
function drawClock() {
  const canvas = document.getElementById("analogClock");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.stroke();

  ctx.font = "16px Comic Sans MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 1; i <= 12; i++) {
    const angle = (i - 3) * (Math.PI * 2) / 12;
    ctx.fillText(i, 100 + Math.cos(angle) * 70, 100 + Math.sin(angle) * 70);
  }

  let hour = game_difficulty === 3 ? draggedHour : correctHour;
  let minute = game_difficulty === 3 ? draggedMinute : correctMinute;

  drawHand(ctx, ((hour % 12) + minute / 60) * 30, 50, 6);
  drawHand(ctx, minute * 6, 70, 3);

  // Draw small hour ticks
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * (Math.PI / 180);
    const x1 = 100 + Math.cos(angle) * 80;
    const y1 = 100 + Math.sin(angle) * 80;
    const x2 = 100 + Math.cos(angle) * 90;
    const y2 = 100 + Math.sin(angle) * 90;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  console.log(game_difficulty);
  if (game_difficulty === 3) {
    canvas.onmousedown = startDrag;
    canvas.onmousemove = dragMove;àà
    canvas.onmouseup = stopDrag;
  } else {
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
  }
}

// Function to draw the hands on the clock
function drawHand(ctx, angle, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.moveTo(100, 100);
  ctx.lineTo(100 + Math.cos((Math.PI / 180) * (angle - 90)) * length,
              100 + Math.sin((Math.PI / 180) * (angle - 90)) * length);
  ctx.stroke();
}

// Function to start dragging the hands
function startDrag(e) {
  draggingHand = detectHand(e);
}

// Function to stop dragging
function stopDrag(e) {
  draggingHand = null;
}

// Function to move the hands while dragging
function dragMove(e) {
  if (!draggingHand) return;

  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left - 100;
  const y = e.clientY - rect.top - 100;
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  const adjustedAngle = (angle + 360 + 90) % 360;

  if (draggingHand === "hour") {
    draggedHour = Math.round(adjustedAngle / 30);
    if (draggedHour === 0) draggedHour = 12;
  } else if (draggingHand === "minute") {
    draggedMinute = Math.round(adjustedAngle / 6);
    if (draggedMinute === 60) draggedMinute = 0;
  }
  drawClock();
}

// Function to detect which hand is being dragged
function detectHand(e) {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left - 100;
  const y = e.clientY - rect.top - 100;
  const dist = Math.sqrt(x * x + y * y);

  return dist < 60 ? "hour" : "minute";
}

// Function to submit the answer
export function submitAnswer() {
  if (game_difficulty < 3) {
    const input = `${parseInt(document.getElementById("hourDisplay").textContent)}:${document.getElementById("minuteDisplay").textContent}`;
    const correctString = `${correctHour}:${correctMinute.toString().padStart(2, '0')}`;
    if (input === correctString) {
      correctFeedback();
    } else {
      wrongFeedback();
    }
  } else {
    if (draggedHour === correctHour && draggedMinute === correctMinute) {
      correctFeedback();
    } else {
      wrongFeedback();
    }
  }
}

// Function to give feedback for a correct answer
function correctFeedback() {
  document.getElementById("feedback").innerHTML = `<span class="correct">✅ Correct!</span>`;
  progress += 20;
  document.getElementById("progressBar").style.width = `${progress}%`;

  if (progress >= 100) {
    setTimeout(() => {
      const win = new bootstrap.Modal(document.getElementById("winModal"));
      win.show();
      updatePerformance("game6");
      launchConfetti();
    }, 500);
  } else {
    setTimeout(() => {
      generateQuestion(game_difficulty);
    }, 1500);
  }
}

// Function to give feedback for a wrong answer
function wrongFeedback() {
  document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Try again!</span>`;
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
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
