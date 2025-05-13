import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let difficulty;
let startNumber = 1;
let currentTarget = 1;
let totalClicks = 0;
let mistakes = 0;
let startTime = Date.now();

// Setup game
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: getFeedbackMessage,
  gameId: "game3",
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = game.submitAnswer;
window.restartGame = game.restartGame;

window.onload = () => changeDifficulty();

// Generate the balloon question
async function generateQuestion(difficulty) {
  difficulty = await getDifficulty("game1");
  const balloonArea = document.getElementById("balloonArea");
  balloonArea.innerHTML = "";
  totalClicks = 0;
  document.getElementById("progressBar").style.width = "0%";

  if (difficulty === 1) {
    startNumber = 1;
  } else if (difficulty === 2) {
    startNumber = Math.floor(Math.random() * 50) + 1;
  } else {
    startNumber = Math.floor(Math.random() * 80) + 1;
  }

  currentTarget = startNumber;

  const numbers = Array.from({ length: 10 }, (_, i) => startNumber + i);
  const shuffled = shuffleArray(numbers);

  shuffled.forEach(num => {
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    balloon.textContent = num;
    balloon.onclick = () => handleClick(num, balloon);
    balloonArea.appendChild(balloon);
  });
}

// Handle a balloon click
function handleClick(num, balloon) {
  if (num === currentTarget) {
    balloon.style.transition = "transform 1s ease, opacity 1s ease";
    balloon.style.transform = "translateY(-200px)";
    balloon.style.opacity = "0";
    balloon.style.pointerEvents = "none";
    currentTarget++;
    totalClicks++;

    const progress = (totalClicks / 10) * 100;
    document.getElementById("progressBar").style.width = `${progress}%`;

    if (totalClicks >= 10) {
      setTimeout(() => {
        updatePerformance("game3", mistakes, startTime);
        const winModal = new bootstrap.Modal(document.getElementById("winModal"));
        winModal.show();
        launchConfetti();
      }, 600);
    }
  } else {
    balloon.classList.add("wrong");
    mistakes++;
    game.registerMistake(); // ✅ update interne teller in gameTemplate.js
    setTimeout(() => balloon.classList.remove("wrong"), 500);
  }
}

// Shuffle helper
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Template integration: check answer
function checkAnswer(userInput) {
  return { correct: userInput === currentTarget, correctAnswer: currentTarget };
}

// Template integration: feedback message
function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! You clicked the correct balloon.`
    : `❌ Oops! Try again. The correct balloon was ${correctAnswer}.`;
}

// Confetti launcher
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

// Visual tip display
window.showHelp = function () {
  // Genereer 3 opeenvolgende getallen gebaseerd op startNumber
  const sample = [startNumber, startNumber + 1, startNumber + 2];

  // Shuffle de getallen zodat ze niet in volgorde staan
  const shuffled = sample.sort(() => Math.random() - 0.5);
  const sorted = [...shuffled].sort((a, b) => a - b);
  let remaining = [...shuffled];

  const stepsHtml = sorted.map((num, index) => {
    const balloonDisplay = remaining
      .map(n => `
        <div style="display: inline-block; margin: 5px;">
          <div style="background: #ff6b6b; color: white; padding: 10px 15px; border-radius: 50%; font-weight: bold;">
            ${n}
          </div>
        </div>
      `).join('');

    const explanation = `
      <p><strong>Step ${index + 1}:</strong></p>
      <p>Look at the numbers: ${remaining.join(', ')}.</p>
      <p>The smallest number is <strong>${num}</strong>, so we pop that one first.</p>
    `;

    // Verwijder het huidige gepopte nummer uit de overgebleven set
    const idx = remaining.indexOf(num);
    if (idx !== -1) remaining.splice(idx, 1);

    return `
      <div style="margin-bottom: 15px;">
        ${balloonDisplay}
        ${explanation}
      </div>
    `;
  }).join('');

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
      max-width: 380px;
      max-height: 70vh;
      overflow-y: auto;
      z-index: 1001;
      font-family: sans-serif;
    ">
      <h5 style="margin-top: 0;">Example:</h5>
      <p>This little example will help you understand how to solve it!</p>
      ${stepsHtml}
      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-2">Close</button>
    </div>
  `;

  document.body.appendChild(tipBox);
};
