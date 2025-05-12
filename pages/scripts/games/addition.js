import { setupGame, getDifficulty } from '../template/gameTemplate.js';

let num1, num2;
let gameStarted = false;
let difficulty; 

async function generateQuestion() {
  difficulty = await getDifficulty("game1");
  console.log("Generating question for difficulty:", difficulty);
  if (!gameStarted) {
    gameStarted = true;
  }
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;

  // num1 tussen 1 en max
  num1 = Math.floor(Math.random() * max) + 1;

  // num2 tussen 1 en (max - num1 + 1), maar minstens 1
  const remaining = Math.max(1, max - num1 + 1);
  num2 = Math.floor(Math.random() * remaining) + 1;

  document.getElementById("visual-num1").innerHTML = renderFruits(num1, "apple.webp");
  document.getElementById("visual-num2").innerHTML = renderFruits(num2, "berry.png");
}


function renderFruits(n, type) {
  const src = `../assets/addition/${type}`;
  return Array(n).fill(`<img src="${src}" width="30" style="margin: 3px;">`).join('');
}

function checkAnswer(userInput) {
  const correctAnswer = num1 + num2;
  return { correct: userInput === correctAnswer, correctAnswer };
}

function feedback(correct, answer) {
  return correct
    ? `✅ Great job!`
    : `❌ Oops! Try again.`;
}

const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: feedback,
  gameId: "game1"
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = game.submitAnswer;
window.restartGame = game.restartGame;

window.showHelp = function () {
  const total = num1 + num2;

  if (num1 === 0 || num2 === 0) {
    alert("No tip available for this question. Try the next one!");
    return;
  }

  const appleImg = `<img src="/pages/assets/addition/apple.webp" width="30" style="margin: 2px;">`;
  const berryImg = `<img src="/pages/assets/addition/berry.png" width="30" style="margin: 2px;">`;

  const apples = Array(num1).fill(appleImg);
  const berries = Array(num2).fill(berryImg);
  const fruitIcons = [...apples, ...berries];

  const visualEquation = `${apples.join('')} + ${berries.join('')} = ?`;

  const cells = fruitIcons.map((fruit, i) => {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px;">
        <div style="font-weight: bold;">${i + 1}</div>
        <div>${fruit}</div>
      </div>
    `;
  });

  const helpBox = document.createElement('div');
  helpBox.innerHTML = `
    <div style="position: fixed; bottom: 80px; right: 20px; background: #fff9c4; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 360px; z-index: 1001;">
      <h5>Example:</h5>
      <p><em>This little example will help you understand how to solve it!</em></p>

      <p><strong>Question:</strong><br>${visualEquation}</p>

      <p><strong>Tip:</strong> Line up the fruit and count them one by one.</p>

      <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; margin: 10px 0;">
        ${cells.join('')}
      </div>

      <p><strong>Count until the end.</strong><br>
      So: ${num1} + ${num2} = <strong>${total}</strong></p>

      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-2">Close</button>
    </div>
  `;
  document.body.appendChild(helpBox);
};

window.onload = () => changeDifficulty();
