import { setupGame } from '../template/gameTemplate.js';

let num1, num2;
let gameStarted = false;
let difficulty; // track difficulty for help function

function generateQuestion(d) {
  if (!gameStarted) gameStarted = true;
  difficulty = d; // store current difficulty
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

  // Sla over als één van de twee nul is
  if (num1 === 0 || num2 === 0) {
    alert("Geen tip beschikbaar voor deze oefening, probeer de volgende!");
    return;
  }

  const apples = Array(num1).fill('🍎');
  const berries = Array(num2).fill('🍓');
  const fruitIcons = [...apples, ...berries];

  // Visuele opgave met fruit en plus-teken
  const visualEquation = `${apples.join(' ')} + ${berries.join(' ')} = ?`;

  // Genereer HTML voor uitgelijnde getallen en fruitjes
  const cells = fruitIcons.map((fruit, i) => {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; margin: 4px;">
        <div style="font-weight: bold;">${i + 1}</div>
        <div style="font-size: 1.5rem;">${fruit}</div>
      </div>
    `;
  });

  const helpBox = document.createElement('div');
  helpBox.innerHTML = `
    <div style="position: fixed; bottom: 80px; right: 20px; background: #fff9c4; padding: 15px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); max-width: 360px; z-index: 1001;">
      <h5>Voorbeeldje:</h5>
      <p><strong>Opgave:</strong><br><span style="font-size: 1.4rem;">${visualEquation}</span></p>
      <p>👉 Zet al het fruit op een rijtje en tel ze één voor één!</p>

      <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; margin: 10px 0;">
        ${cells.join('')}
      </div>

      <p>🔔 Tel tot het einde.<br>
      ✅ Dus: ${num1} + ${num2} = <strong>${total}</strong> 🎉</p>

      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-2">Sluiten</button>
    </div>
  `;
  document.body.appendChild(helpBox);
};

window.onload = () => changeDifficulty();
