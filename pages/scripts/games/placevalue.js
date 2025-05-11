import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let difficulty = 1;
let target = 0;
let basket = [];

  // Initialize the game with the necessary functions
  const game = setupGame({
    generateQuestionFn: generateQuestion,
    checkAnswerFn: submitAnswer,
    getFeedbackMessageFn: () => {},
    gameId: "game4", // Unique game ID for tracking
  });

  window.readStory = game.readStory;
  window.onload = game.changeDifficulty;
  window.drag = drag;
  window.allowDrop = allowDrop;
  window.drop = drop;
  window.submitAnswer = submitAnswer;
  window.removeItem = removeItem;

  // Expose restartGame to reset progress and call the restart function from the game template
  window.restartGame = () => {
    document.getElementById("progressBar").style.width = "0%";
    game.restartGame(); // This calls the restart function from the game template
    target = 0;
    basket = [];
    document.getElementById("basket").innerHTML = "";
  };

// Function to change the difficulty of the game
function changeDifficulty() {
  difficulty = parseInt(document.getElementById("difficultySelect").value);
  restartGame();
}

function restartGame() {
  basket = [];
  document.getElementById("basket").innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion();
}

function generateQuestion(difficulty) {
  let max;
  if (difficulty === 1) max = 30;
  else if (difficulty === 2) max = 60;
  else max = 100;

  target = Math.floor(Math.random() * (max - 9)) + 10; // at least 10
  document.getElementById("targetNumber").textContent = target;
}

// Function to allow items to be dragged and dropped into the basket
function allowDrop(ev) {
  ev.preventDefault();
}

// Function to handle the dragging of items
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

// Function to handle dropping of dragged items into the basket
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  basket.push(data);

  const img = document.createElement("img");
  img.src = document.getElementById(data).src;
  img.width = data === "gift" ? 60 : 40;
  img.style.margin = "4px";
  img.dataset.type = data; // Save whether it’s a gift or balloon
  img.onclick = function() { removeItem(this); }; // Make it clickable to delete
  document.getElementById("basket").appendChild(img);
}

// Function to remove an item from the basket
function removeItem(img) {
  const type = img.dataset.type;
  const index = basket.indexOf(type);
  if (index > -1) {
    basket.splice(index, 1); // Remove from basket array
  }
  img.remove(); // Remove visually
}

// Function to submit the answer
export function submitAnswer() {
  const ones = basket.filter(item => item === "balloon").length;
  const tens = basket.filter(item => item === "gift").length;
  const total = tens * 10 + ones;

  const feedback = document.getElementById("feedback");

  if (total === target) {
    feedback.innerHTML = `<span class="correct">✅ Great job! ${tens} tens and ${ones} ones = ${target}</span>`;
    let width = parseInt(document.getElementById("progressBar").style.width) || 0;
    width += 20;
    document.getElementById("progressBar").style.width = `${width}%`;

    if (width >= 100) {
      setTimeout(() => {
        const winModal = new bootstrap.Modal(document.getElementById("winModal"));
        winModal.show();
        launchConfetti();
        updatePerformance("game4");
      }, 600);
    } else {
      setTimeout(() => {
        console.log(difficulty);
        basket = [];
        document.getElementById("basket").innerHTML = "";
        generateQuestion();
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
