import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let difficulty;
let progress = 0;
let totalShapes = 0;
let mistakes = 0;
let startTime = Date.now();
let synth = window.speechSynthesis;

const allShapes = {
  square: "🟦",
  circle: "🔵",
  triangle: "🔺",
  star: "⭐️",
  diamond: "🔷"
};

const game = setupGame({
  generateQuestionFn: generateShapes,
  checkAnswerFn: checkProgress,
  getFeedbackMessageFn: getFeedbackMessage,
  gameId: "game10",
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;

window.restartGame = () => {
  mistakes = 0;
  startTime = Date.now();
  progress = 0;
  totalShapes = 0;
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame();
};

window.onload = () => restartGame();

async function generateShapes(diff) {
  difficulty = await getDifficulty("game10");
  console.log("Generating shapes for difficulty:", diff);
  document.getElementById("feedback").innerHTML = "";

  const shapesToSort = document.getElementById("shapesToSort");
  const dropZones = document.getElementById("dropZones");
  shapesToSort.innerHTML = "";
  dropZones.innerHTML = "";

  const shapeKeys = Object.keys(allShapes).slice(0, difficulty + 2);
  const shapePool = [];

  shapeKeys.forEach(shape => {
    for (let i = 0; i < 3; i++) {
      shapePool.push(shape);
    }
  });

  totalShapes = shapePool.length;

  shuffleArray(shapePool);
  shapePool.forEach((shape, i) => {
    const span = createShapeElement(shape, `shape-${i}`);
    shapesToSort.appendChild(span);
  });

  shapeKeys.forEach(shape => {
    const zone = document.createElement("div");
    zone.className = "drop-zone";
    zone.setAttribute("data-target", shape);
    zone.ondragover = e => e.preventDefault();
    zone.ondrop = e => handleDrop(e, shape);
    zone.innerHTML = `<div class="drop-label">${shape.toUpperCase()}</div>`;
    dropZones.appendChild(zone);
  });

  shapesToSort.ondragover = e => e.preventDefault();
  shapesToSort.ondrop = e => {
    const shape = e.dataTransfer.getData("shape");
    const id = e.dataTransfer.getData("id");
    const span = createShapeElement(shape, id);
    if (!document.getElementById(id)) {
      shapesToSort.appendChild(span);
    }
    checkProgress();
  };
}

function createShapeElement(shape, id) {
  if (document.getElementById(id)) return document.getElementById(id);

  const span = document.createElement("span");
  span.textContent = allShapes[shape];
  span.className = "draggable-shape";
  span.draggable = true;
  span.id = id;
  span.setAttribute("data-shape", shape);

  span.ondragstart = e => {
    e.dataTransfer.setData("shape", shape);
    e.dataTransfer.setData("id", id);
  };

  return span;
}

function handleDrop(e) {
  e.preventDefault();
  const shape = e.dataTransfer.getData("shape");
  const id = e.dataTransfer.getData("id");

  if (!shape) return;

  const span = createShapeElement(shape, id);
  if (document.getElementById(id)) {
    document.getElementById(id).remove();
  }

  let zone = e.target;
  while (zone && !zone.classList.contains("drop-zone")) {
    zone = zone.parentElement;
  }

  const shapesToSort = document.getElementById("shapesToSort");

  if (zone) {
    const expectedShape = zone.getAttribute("data-target");
    if (shape !== expectedShape) {
      mistakes++;
      game.registerMistake();
      document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Oops! That doesn't belong in the ${expectedShape.toUpperCase()} zone.</span>`;
      
      if (!document.getElementById(id)) {
        shapesToSort.appendChild(span);
      }

      setTimeout(() => {
        document.getElementById("feedback").innerHTML = "";
      }, 2500);
    } else {
      document.getElementById("feedback").innerHTML = `<span class="correct">✅ Great! That belongs in the ${expectedShape.toUpperCase()} zone!</span>`;
      zone.appendChild(span);
    }
  }

  checkProgress();
}


function checkProgress() {
  const dropZones = document.querySelectorAll(".drop-zone");
  let correct = 0;

  dropZones.forEach(zone => {
    const expected = zone.getAttribute("data-target");
    const shapes = zone.querySelectorAll(".draggable-shape");

    shapes.forEach(s => {
      if (s.getAttribute("data-shape") === expected) {
        correct++;
      }
    });
  });

  const percent = Math.round((correct / totalShapes) * 100);
  document.getElementById("progressBar").style.width = `${percent}%`;

  if (correct === totalShapes) {
    setTimeout(() => {
      updatePerformance("game10", mistakes, startTime);
      const win = new bootstrap.Modal(document.getElementById("winModal"));
      win.show();
      launchConfetti();
    }, 300);
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! You sorted all the shapes correctly.`
    : `❌ Oops! Try again. The correct placement is ${correctAnswer}.`;
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
      colors: ['#e67e22', '#f1c40f', '#3498db']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#e67e22', '#f1c40f', '#3498db']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

window.showHelp = async function () {
  const helpBox = document.createElement("div");
  helpBox.innerHTML = "";

  const difficultyLevel = await getDifficulty("game10");

  const shapeDescriptions = {
    square: "It has 4 equal sides and 4 corners. This is called a <strong>square</strong>.",
    circle: "It's round and has no corners. This is called a <strong>circle</strong>.",
    triangle: "It has 3 straight sides and 3 corners. This is called a <strong>triangle</strong>.",
    star: "It has pointy arms. This is called a <strong>star</strong>.",
    diamond: "It looks like a tilted square. This is called a <strong>diamond</strong>."
  };

  const shapeEmojis = {
    square: "🟦",
    circle: "🔵",
    triangle: "🔺",
    star: "⭐️",
    diamond: "🔷"
  };

  const shapeKeys = Object.keys(shapeDescriptions).slice(0, difficultyLevel + 2);

  const tipsList = shapeKeys.map(shape => {
    return `
      <div style="margin-bottom: 10px;">
        <span style="font-size: 1.4rem;">${shapeEmojis[shape]}</span>
        <span style="margin-left: 10px;">${shapeDescriptions[shape]}</span>
      </div>
    `;
  }).join("");

  helpBox.innerHTML = `
    <div style="
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: #fff9c4;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 420px;
      max-height: 75vh;
      overflow-y: auto;
      z-index: 1001;
      font-family: 'Comic Sans MS', sans-serif;
    ">
      <h5><strong>Tip:</strong></h5>
      <p>Let’s be smart shape detectives!</p>
      <p>Each shape has a name and a special look. Read the clues and try to match the shapes to the right basket.</p>
      <hr>
      ${tipsList}
      <button onclick="this.parentElement.remove()" class="btn btn-warning mt-3">Close</button>
    </div>
  `;

  document.body.appendChild(helpBox);
};
