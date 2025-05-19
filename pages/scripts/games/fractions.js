import { setupGame, updatePerformance } from '../template/gameTemplate.js';
let progress = 0;
let difficulty = 1;
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

function generateQuestion(diff) {
  difficulty = diff || 1;
  console.log("Generating pizza question for difficulty:", diff);
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
