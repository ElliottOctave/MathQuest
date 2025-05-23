import { setupGame, updatePerformance, getDifficulty} from '../template/gameTemplate.js';
let progress = 0;
let difficulty;
let mistakes = 0;
let startTime = Date.now();
const synth = window.speechSynthesis;

const allPizzas = [
  { image: "pizza_full.png", label: "A whole pizza", difficulty: [1, 3] },
  { image: "pizza_half.png", label: "Half of a pizza", difficulty: [1, 2, 3] },
  { image: "pizza_quarter.png", label: "One quarter", difficulty: [2, 3] },
  { image: "pizza_three_quarter.png", label: "Three quarters", difficulty: [2, 3] },
  { image: "pizza_quarter.png", label: "One quarter", difficulty: [3] },
  { image: "pizza_half.png", label: "Two quarters", difficulty: [3] },
  { image: "pizza_full.png", label: "Four quarters", difficulty: [3] }
];

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: getFeedbackMessage,
  gameId: "game12", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;

// Expose restartGame to reset progress and call the restart function from the game template
window.restartGame = () => {
  mistakes = 0;
  progress = 0;
  startTime = Date.now();
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};

window.onload = () => restartGame();

async function generateQuestion() {
  difficulty = await getDifficulty("game12");
  document.getElementById("feedback").innerHTML = "";
  const pizzaOptions = allPizzas.filter(p => p.difficulty.includes(difficulty));
  const correctPizza = pizzaOptions[Math.floor(Math.random() * pizzaOptions.length)];

  document.getElementById("pizzaImage").src = `../assets/fractions/${correctPizza.image}`;
  document.getElementById("pizzaImage").alt = correctPizza.label;

  const uniqueAnswers = [...new Set(pizzaOptions.map(p => p.label))];
  const shuffledChoices = shuffleArray(uniqueAnswers).slice(0, 4);

  if (!shuffledChoices.includes(correctPizza.label)) {
    shuffledChoices[0] = correctPizza.label;
    shuffleArray(shuffledChoices);
  }

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  shuffledChoices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary m-2";
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(choice, correctPizza.label);
    choicesDiv.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  const feedback = document.getElementById("feedback");
  if (selected === correct) {
    feedback.innerHTML = `<span class="correct">✅ Correct!</span>`;
    progress += 20;
    document.getElementById("progressBar").style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        updatePerformance("game12", mistakes, startTime);
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
      }, 500);
    } else {
      setTimeout(() => generateQuestion(difficulty), 1200);
    }
  } else {
    mistakes ++;
    game.registerMistake();
    feedback.innerHTML = `<span class="incorrect">❌ Try again!</span>`;
  }
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! You selected the correct pizza portion.`
    : `❌ Oops! Try again. The correct answer is ${correctAnswer}.`;
}

function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f39c12', '#f1c40f', '#27ae60']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f39c12', '#f1c40f', '#27ae60']
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

window.showHelp = function () {
  const currentDifficulty = window.difficulty || 1;

const examples = {
  1: {
    image: "pizza_half.png",
    label: "Half of a pizza",
    reasoning: "The pizza is cut into 2 equal slices. One slice is still there, and one slice is gone. That means half of the pizza is left!"
  },
  2: {
    image: "pizza_three_quarter.png",
    label: "Three quarters",
    reasoning: "The pizza is cut into 4 equal slices. One slice is missing. That means 3 slices are left — that's three quarters!"
  },
  3: {
    image: "pizza_quarter.png",
    label: "One quarter",
    reasoning: "The pizza is cut into 4 equal slices. Only 1 slice is still there. That means one quarter is left!"
  }
};


  const { image, label, reasoning } = examples[currentDifficulty];

  const tipBox = document.createElement("div");
  tipBox.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #fff3cd;
      border-left: 5px solid #ffc107;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      font-family: 'Comic Sans MS', sans-serif;
      max-width: 360px;
      z-index: 1002;
    ">
      <h5 style="margin-top: 0;">Tip!</h5>
      <p><strong>Look at the pizza below.</strong><br>Try to count how many slices are there, and how many are left.</p>
      <div style="text-align: center;">
        <img src="../assets/fractions/${image}" alt="${label}" style="width: 160px; margin: 10px auto;">
      </div>
      <p>${reasoning}</p>
      <p style="margin-bottom: 5px;"><strong>Try to count the missing and full slices in your game!</strong></p>
      <button onclick="this.parentElement.remove()" class="btn btn-warning btn-sm mt-3" style="background-color: #ffc107; border: none;">Close</button>
    </div>
  `;
  document.body.appendChild(tipBox);
};

