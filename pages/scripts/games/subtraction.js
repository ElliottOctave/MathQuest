let difficulty = 1;
let progress = 0;
let fruitArray = [];
let numToSteal = 0;
const synth = window.speechSynthesis;

function generateQuestion() {
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
  const totalFruits = Math.floor(Math.random() * (max - 1)) + 2; // min 2
  numToSteal = Math.floor(Math.random() * (totalFruits - 1)) + 1;

  // Reset UI
  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("afterBasket").style.visibility = "hidden";
  document.getElementById("beforeBasket").innerHTML = "";
  document.getElementById("afterBasket").innerHTML = "";

  // Generate random fruit mix (banana & mango)
  fruitArray = [];
  for (let i = 0; i < totalFruits; i++) {
    const type = Math.random() < 0.5 ? "banana" : "mango";
    fruitArray.push(type);
  }

  // Show full basket before
  const beforeBasket = document.getElementById("beforeBasket");
  fruitArray.forEach(type => {
    beforeBasket.appendChild(createFruitIcon(type));
  });

  animateMonkey(() => {
    // Remove `numToSteal` fruits randomly
    const remainingFruits = [...fruitArray];
    for (let i = 0; i < numToSteal; i++) {
      const indexToRemove = Math.floor(Math.random() * remainingFruits.length);
      remainingFruits.splice(indexToRemove, 1);
    }

    // Show remaining fruits
    const afterBasket = document.getElementById("afterBasket");
    remainingFruits.forEach(type => {
      afterBasket.appendChild(createFruitIcon(type));
    });
    afterBasket.style.visibility = "visible";
  });
}

function createFruitIcon(type) {
  const img = document.createElement("img");
  img.src = `../assets/subtraction/${type}.webp`;
  img.alt = type;
  img.width = 30;
  img.style.margin = "3px";
  return img;
}

function animateMonkey(callback) {
  const monkey = document.getElementById("monkey");
  monkey.classList.remove("walk");
  monkey.style.left = "-100px";
  monkey.style.opacity = "1";

  void monkey.offsetWidth; // force reflow
  monkey.classList.add("walk");

  setTimeout(() => {
    if (callback) callback();
  }, 2000); // 2s animation
}

function submitAnswer() {
  const input = document.getElementById("answer").value;
  const feedback = document.getElementById("feedback");

  if (input === "") {
    feedback.textContent = "Please enter your answer.";
    feedback.className = "incorrect";
    return;
  }

  if (parseInt(input) === numToSteal) {
    feedback.innerHTML = `✅ Correct! The monkey took ${numToSteal} fruits.`;
    feedback.className = "correct";
    progress += 20;
    document.getElementById("progressBar").style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
      }, 500);
    }

    setTimeout(generateQuestion, 1500);
  } else {
    feedback.innerHTML = `❌ Oops! Try again.`;
    feedback.className = "incorrect";
  }
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

function changeDifficulty() {
  difficulty = parseInt(document.getElementById("difficultySelect").value);
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion();
}

function restartGame() {
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateQuestion();
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

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

window.onload = generateQuestion;