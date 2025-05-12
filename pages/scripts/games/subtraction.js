import { setupGame, getDifficulty } from '../template/gameTemplate.js';

let totalFruits = 0;
let numToSteal = 0;
let fruitArray = [];
let difficulty;

async function generateQuestion() {
  difficulty = await getDifficulty("game2"); // of jouw gameId
  console.log("Generating question for difficulty:", difficulty);

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

window.showHelp = function () {
  const beforeFruits = [...fruitArray];
  const afterFruits = [...fruitArray];

  // Simuleer aftrekking
  for (let i = 0; i < numToSteal; i++) {
    const index = Math.floor(Math.random() * afterFruits.length);
    afterFruits.splice(index, 1);
  }

  // Genereer HTML-tabelrij met indices en fruitjes
  function generateIndexedRow(fruits) {
    const cells = fruits.map((fruit, i) => `
      <td style="text-align: center; padding: 4px;">
        <div style="font-weight: bold;">${i + 1}</div>
        <img src="/pages/assets/subtraction/${fruit}.webp" width="30" style="margin-top: 2px;">
      </td>
    `);
    return `<table><tr>${cells.join('')}</tr></table>`;
  }

  const helpBox = document.createElement('div');
  helpBox.innerHTML = `
    <div style="position: fixed; bottom: 80px; right: 20px; background: #e8f5e9; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 400px; z-index: 1001;">
      <h5>Example:</h5>
      <p><em>This little example will help you understand how to solve it!</em></p>

      <p><strong>Before:</strong></p>
      ${generateIndexedRow(beforeFruits)}

      <p class="mt-3"><strong>After:</strong></p>
      ${generateIndexedRow(afterFruits)}

      <p class="mt-3"><strong>Tip:</strong> Count the fruits one by one and compare the rows.</p>
      <p>How many fruits are gone?</p>
      <p><strong>${beforeFruits.length} - ${afterFruits.length} = ${beforeFruits.length - afterFruits.length}</strong></p>
      <p>So <strong>${beforeFruits.length - afterFruits.length} fruit${beforeFruits.length - afterFruits.length === 1 ? '' : 's'} disappeared</strong>.</p>

      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-2">Close</button>
    </div>
  `;
  document.body.appendChild(helpBox);
};

window.onload = () => changeDifficulty();