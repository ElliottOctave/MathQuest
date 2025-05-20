import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';
let difficulty;
let progress = 0;
let mistakes = 0;
let startTime = Date.now();
const synth = window.speechSynthesis;

const shapesByDifficulty = {
  1: ["square", "circle", "triangle"],
  2: ["square", "circle", "triangle", "rectangle", "hexagon"],
  3: ["square", "rotated-square", "rectangle", "oval", "circle"]
};

const game = setupGame({
  generateQuestionFn: generateShapes,
  gameId: "game11", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;

// Expose restartGame to reset progress and call the restart function from the game template
window.restartGame = () => {
  mistakes = 0;
  startTime = Date.now();
  progress = 0;
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};

window.onload = () => restartGame();

async function generateShapes() {
  difficulty = await getDifficulty("game11");
  console.log("Generating shapes for difficulty:", diff);
  document.getElementById("feedback").innerHTML = "";
  const shapeContainer = document.getElementById("shapeContainer");
  shapeContainer.innerHTML = "";

  const pool = shapesByDifficulty[difficulty];
  const baseShape = pool[Math.floor(Math.random() * pool.length)];
  let oddShape;
  do {
    oddShape = pool[Math.floor(Math.random() * pool.length)];
  } while (oddShape === baseShape);

  // Difficulty scaling: more shapes
  const shapeCount = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 6;
  const oddIndex = Math.floor(Math.random() * shapeCount);

  for (let i = 0; i < shapeCount; i++) {
    const shapeType = i === oddIndex ? oddShape : baseShape;
    const shape = document.createElement("div");
    shape.className = `shape ${shapeType}`;
    shape.style.backgroundColor = getRandomColor(shapeType); // to avoid coloring triangles
    if (difficulty === 3 && shapeType !== "triangle") {
      shape.style.transform = `rotate(${Math.floor(Math.random() * 360)}deg)`;
    }
    shape.onclick = () => handleAnswer(i === oddIndex);
    shapeContainer.appendChild(shape);
  }
}

function handleAnswer(isCorrect) {
  const feedback = document.getElementById("feedback");
  if (isCorrect) {
    feedback.innerHTML = `<span class="correct">✅ Great! That's the odd one out.</span>`;
    progress += 20;
    document.getElementById("progressBar").style.width = `${progress}%`;
    if (progress >= 100) {
      setTimeout(() => {
        updatePerformance("game11", mistakes, startTime);
        const win = new bootstrap.Modal(document.getElementById("winModal"));
        win.show();
        launchConfetti();
      }, 500);
    } else {
      setTimeout(generateShapes(difficulty), 1500);
    }
  } else {
    mistakes++;
    game.registerMistake();
    feedback.innerHTML = `<span class="incorrect">❌ Try again!</span>`;
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

function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      angle: 60,
      spread: 55,
      origin: {x: 0},
      colors: ['#f39c12', '#6bcB77', '#3498db']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: {x: 1},
      colors: ['#f39c12', '#6bcB77', '#3498db']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function getRandomColor(shapeType) {
  if (shapeType === "triangle") return "transparent"; // handled with borders
  const colors = ["#3498db", "#e74c3c", "#f1c40f", "#8e44ad", "#1abc9c"];
  return colors[Math.floor(Math.random() * colors.length)];
}
