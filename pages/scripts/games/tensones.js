import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
let coins = 0;
let gems = 0;
const synth = window.speechSynthesis;

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: submitAnswer,
  getFeedbackMessageFn: () => {},
  gameId: "game8", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = submitAnswer;

// Expose restartGame to reset progress and call the restart function from the game template
window.restartGame = () => {
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};


window.onload = () => changeDifficulty();

// Function to generate the question
function generateQuestion(difficulty) {
  game_difficulty = difficulty || 1; // Default to 1 if not provided
  console.log("Generating question for difficulty:", game_difficulty);
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
        updatePerformance("game8");
      }, 600);
    } else {
      console.log(game_difficulty);
      setTimeout(() => {
        generateQuestion(game_difficulty);
      }, 1500);
    }
  } else {
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
