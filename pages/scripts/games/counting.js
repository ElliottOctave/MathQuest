import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let difficulty = 1;
let startNumber = 1;
let currentTarget = 1;
let totalClicks = 0;

  // Call the setupGame with required functions
  const game = setupGame({
    generateQuestionFn: generateQuestion,
    checkAnswerFn: checkAnswer,
    getFeedbackMessageFn: getFeedbackMessage,
    gameId: "game3", // Unique game ID for tracking
  });

  window.readStory = game.readStory;
  window.changeDifficulty = game.changeDifficulty;
  window.submitAnswer = game.submitAnswer;
  window.restartGame = game.restartGame;

  window.onload = () => changeDifficulty();

// Function to generate the question
function generateQuestion(difficulty) {
  const balloonArea = document.getElementById("balloonArea");
  balloonArea.innerHTML = "";
  totalClicks = 0;
  document.getElementById("progressBar").style.width = "0%";

  // Set the starting number based on the difficulty
  if (difficulty === 1) {
    startNumber = 1;
  } else if (difficulty === 2) {
    startNumber = Math.floor(Math.random() * 50) + 1; // 1-50
  } else {
    startNumber = Math.floor(Math.random() * 80) + 1; // 1-80
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

// Function to handle the click on the balloon
function handleClick(num, balloon) {
  if (num === currentTarget) {
    balloon.style.transition = "transform 1s ease, opacity 1s ease";
    balloon.style.transform = "translateY(-200px)";
    balloon.style.opacity = "0";
    balloon.style.pointerEvents = "none"; // Disable further clicks
    currentTarget++;
    totalClicks++;

    const progress = (totalClicks / 10) * 100;
    document.getElementById("progressBar").style.width = `${progress}%`;

    if (totalClicks >= 10) {
      setTimeout(() => {
        updatePerformance("game3");
        const winModal = new bootstrap.Modal(document.getElementById("winModal"));
        winModal.show();
        launchConfetti();
      }, 600);
    }
  } else {
    balloon.classList.add("wrong");
    setTimeout(() => balloon.classList.remove("wrong"), 500);
  }
}

// Function to shuffle an array
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Function to restart the game
function restartGame() {
  totalClicks = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion(difficulty);
}

// Function to check the answer (for template integration)
function checkAnswer(userInput) {
  return { correct: userInput === currentTarget, correctAnswer: currentTarget };
}

// Function to get the feedback message
function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! You clicked the correct balloon.`
    : `❌ Oops! Try again. The correct balloon was ${correctAnswer}.`;
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
