import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
let coins = 0;
let gems = 0;
let mistakes = 0;
let startTime = Date.now();
const synth = window.speechSynthesis;
let difficulty;

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: submitAnswer,
  getFeedbackMessageFn: () => {},
  gameId: "game6", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = submitAnswer;

// Expose restartGame to reset progress and call the restart function from the game template
window.restartGame = () => {
  mistakes = 0;
  startTime = Date.now();
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};


window.onload = () => changeDifficulty();

// Function to generate the question
async function generateQuestion() {
  difficulty = await getDifficulty("game6");
  console.log("Generating question for difficulty:", difficulty);
  document.getElementById("answer").value = "";
  document.getElementById("treasurePile").innerHTML = "";

  let max = difficulty === 1 ? 30 : difficulty === 2 ? 60 : 99;
  const number = Math.floor(Math.random() * (max - 9)) + 10;

  coins = Math.floor(number / 10);
  gems = number % 10;

  const pile = document.getElementById("treasurePile");

  for (let i = 0; i < coins; i++) {
    const img = document.createElement("img");
    img.src = "../assets/tensones/coinbag.webp";
    img.width = 50;
    img.style.margin = "5px";
    pile.appendChild(img);
  }

  for (let i = 0; i < gems; i++) {
    const img = document.createElement("img");
    img.src = "../assets/tensones/gem.png";
    img.width = 40;
    img.style.margin = "5px";
    pile.appendChild(img);
  }
}

// Function to submit the answer
export function submitAnswer() {
  const input = document.getElementById("answer").value;
  const feedback = document.getElementById("feedback");
  const correct = coins * 10 + gems;

  if (input === "") {
    feedback.textContent = "Please enter your answer.";
    feedback.className = "incorrect";
    return;
  }

  if (parseInt(input) === correct) {
    feedback.innerHTML = `<span class="correct">✅ Great job! ${coins} tens and ${gems} ones = ${correct}</span>`;
    progress += 20;
    document.getElementById("progressBar").style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
        updatePerformance("game8", mistakes, startTime);
      }, 600);
    } else {
      console.log(game_difficulty);
      setTimeout(() => {
        generateQuestion(game_difficulty);
      }, 1500);
    }
  } else {
    mistakes++;
    game.registerMistake();
    feedback.innerHTML = `<span class="incorrect">❌ Oops! Try again!</span>`;
  }
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
  const total = coins * 10 + gems;

  // Maak voorbeeldrij met afbeeldingen
  const exampleVisual = [];

  for (let i = 0; i < coins; i++) {
    exampleVisual.push(`<img src="../assets/tensones/coinbag.webp" width="40" style="margin: 3px;">`);
  }

  for (let i = 0; i < gems; i++) {
    exampleVisual.push(`<img src="../assets/tensones/gem.png" width="32" style="margin: 3px;">`);
  }

  const visualRow = `
    <div style="text-align: center; margin-bottom: 15px;">
      ${exampleVisual.join('')}
    </div>
  `;

  // Uitleg stappen
  const steps = [];

  if (coins > 0) {
    steps.push(`
      <div style="margin-bottom: 14px;">
        <span>Captain Cooper found <strong>${coins}</strong> treasure bag${coins > 1 ? "s" : ""}.</span><br>
        Each <img src="../assets/tensones/coinbag.webp" width="20" style="vertical-align: middle;"> has 10 treasures.<br>
        So that’s <strong>${coins * 10} treasures</strong>.
      </div>
    `);
  }

  if (gems > 0) {
    steps.push(`
      <div style="margin-bottom: 14px;">
        <span>He also found <strong>${gems}</strong> gem${gems > 1 ? "s" : ""}.</span><br>
        Each <img src="../assets/tensones/gem.png" width="18" style="vertical-align: middle;"> is worth 1 treasure.<br>
        That’s <strong>${gems} treasures</strong>.
      </div>
    `);
  }

  steps.push(`
    <hr>
    <p><strong>Let’s count all the treasures together!</strong></p>
    <p>${coins * 10} from the bags + ${gems} from the gems = <strong>${total} treasures</strong></p>
    <p><strong>That’s how we get ${total} treasures!</strong></p>
  `);

  // Bouw het tipvenster
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
      <p>Let’s see how many treasures Captain Cooper found!</p>
      ${visualRow}
      ${steps.join("")}
      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-3">Close</button>
    </div>
  `;
  document.body.appendChild(tipBox);
};
