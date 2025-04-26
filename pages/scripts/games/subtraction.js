import { setupGame } from '../template/gameTemplate.js';

let totalFruits = 0;
let numToSteal = 0;
let fruitArray = [];

function generateQuestion(difficulty) {
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
  totalFruits = Math.floor(Math.random() * (max - 1)) + 2;
  numToSteal = Math.floor(Math.random() * (totalFruits - 1)) + 1;

  fruitArray = [];
  for (let i = 0; i < totalFruits; i++) {
    fruitArray.push(Math.random() < 0.5 ? 'banana' : 'mango');
  }

  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("afterBasket").style.visibility = "hidden";

  renderBasket("beforeBasket", fruitArray);
  animateMonkey(() => {
    const remaining = [...fruitArray];
    for (let i = 0; i < numToSteal; i++) {
      const index = Math.floor(Math.random() * remaining.length);
      remaining.splice(index, 1);
    }
    renderBasket("afterBasket", remaining);
    document.getElementById("afterBasket").style.visibility = "visible";
  });
}

function renderBasket(id, fruits) {
  const basket = document.getElementById(id);
  basket.innerHTML = '';
  fruits.forEach(type => {
    const img = document.createElement("img");
    img.src = `../assets/subtraction/${type}.webp`;
    img.alt = type;
    img.width = 30;
    img.style.margin = "3px";
    basket.appendChild(img);
  });
}

function animateMonkey(callback) {
  const monkey = document.getElementById("monkey");
  monkey.classList.remove("walk");
  monkey.style.left = "-100px";
  monkey.style.opacity = "1";
  void monkey.offsetWidth;
  monkey.classList.add("walk");

  setTimeout(() => {
    if (callback) callback();
  }, 2000);
}

function checkAnswer(userInput) {
  return { correct: userInput === numToSteal, correctAnswer: numToSteal };
}

function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! The monkey took ${numToSteal} fruits.`
    : `❌ Oops! Try again.`;
}

const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: getFeedbackMessage,
  confettiColors: ['#f39c12', '#f1c40f', '#27ae60'],
  gameId: "game2" // 👈 dynamic tracking enabled here
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = game.submitAnswer;
window.restartGame = game.restartGame;

window.onload = () => generateQuestion(1);