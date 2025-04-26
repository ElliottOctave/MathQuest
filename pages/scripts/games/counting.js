let difficulty = 1;
let startNumber = 1;
let currentTarget = 1;
let totalClicks = 0;

window.onload = () => {
  changeDifficulty();
};

function changeDifficulty() {
  const select = document.getElementById("difficultySelect");
  difficulty = parseInt(select.value);
  startNewGame();
}

function startNewGame() {
  const balloonArea = document.getElementById("balloonArea");
  balloonArea.innerHTML = "";
  totalClicks = 0;
  document.getElementById("progressBar").style.width = "0%";

  // Determine starting number
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

function handleClick(num, balloon) {
    if (num === currentTarget) {
      balloon.style.transition = "transform 1s ease, opacity 1s ease";
      balloon.style.transform = "translateY(-200px)";
      balloon.style.opacity = "0";
      balloon.style.pointerEvents = "none"; // disable further clicks
      currentTarget++;
      totalClicks++;
  
      const progress = (totalClicks / 10) * 100;
      document.getElementById("progressBar").style.width = `${progress}%`;
  
      if (totalClicks >= 10) {
        setTimeout(() => {
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

function restartGame() {
  startNewGame();
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

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}