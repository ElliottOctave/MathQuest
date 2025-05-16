let difficulty = 1;
let progress = 0;
let totalShapes = 0;
let synth = window.speechSynthesis;

const allShapes = {
  square: "🟦",
  circle: "🔵",
  triangle: "🔺",
  star: "⭐️",
  diamond: "🔷"
};

window.onload = () => changeDifficulty();

function changeDifficulty() {
  difficulty = parseInt(document.getElementById("difficultySelect").value);
  restartGame();
}

function restartGame() {
  progress = 0;
  totalShapes = 0;
  document.getElementById("progressBar").style.width = "0%";
  generateShapes();
}

function generateShapes() {
  document.getElementById("feedback").innerHTML = "";

  const shapesToSort = document.getElementById("shapesToSort");
  const dropZones = document.getElementById("dropZones");
  shapesToSort.innerHTML = "";
  dropZones.innerHTML = "";

  const shapeKeys = Object.keys(allShapes).slice(0, difficulty + 2);
  const shapePool = [];

  // Add 3 of each shape
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

  // Make shapesToSort area a drop zone too
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
    // Already placed
    document.getElementById(id).remove();
  }

  // Get the actual drop-zone even if child was clicked
  let zone = e.target;
  while (zone && !zone.classList.contains("drop-zone")) {
    zone = zone.parentElement;
  }

  if (zone) {
    zone.appendChild(span);
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
      colors: ['#e67e22', '#f1c40f', '#3498db']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: {x: 1},
      colors: ['#e67e22', '#f1c40f', '#3498db']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}