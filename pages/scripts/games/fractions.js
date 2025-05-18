let progress = 0;
let difficulty = 1;
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

window.onload = () => changeDifficulty();

function changeDifficulty() {
  difficulty = parseInt(document.getElementById("difficultySelect").value);
  restartGame();
}

function restartGame() {
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion();
}

function generateQuestion() {
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
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
      }, 500);
    } else {
      setTimeout(generateQuestion, 1200);
    }
  } else {
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

function readStory() {
  if (synth.speaking) synth.cancel();
  const text = document.getElementById("storyText").textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  synth.speak(utterance);
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