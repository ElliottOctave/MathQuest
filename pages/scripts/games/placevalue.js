let difficulty = 1;
let target = 0;
let basket = [];

window.onload = () => {
  changeDifficulty();
};

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

function generateQuestion() {
  let max;
  if (difficulty === 1) max = 30;
  else if (difficulty === 2) max = 60;
  else max = 100;

  target = Math.floor(Math.random() * (max - 9)) + 10; // at least 10
  document.getElementById("targetNumber").textContent = target;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

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

function removeItem(img) {
  const type = img.dataset.type;
  const index = basket.indexOf(type);
  if (index > -1) {
    basket.splice(index, 1); // Remove from basket array
  }
  img.remove(); // Remove visually
}

function submitAnswer() {
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
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
      }, 600);
    } else {
      setTimeout(() => {
        basket = [];
        document.getElementById("basket").innerHTML = "";
        generateQuestion();
      }, 1500);
    }
  } else {
    feedback.innerHTML = `<span class="incorrect">❌ Oops! Try again!</span>`;
  }
}

function readStory() {
  const synth = window.speechSynthesis;
  if (synth.speaking) synth.cancel();
  const text = document.getElementById("storyText").textContent;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.9;
  utter.pitch = 1;
  synth.speak(utter);
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