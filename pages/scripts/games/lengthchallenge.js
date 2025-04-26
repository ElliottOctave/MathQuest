let difficulty = 1;
let progress = 0;
let flags = [];
let selectedOrder = [];
let synth = window.speechSynthesis;

window.onload = () => {
  changeDifficulty();
};

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
  const flagsArea = document.getElementById("flagsArea");
  flagsArea.innerHTML = "";
  document.getElementById("feedback").innerHTML = "";
  selectedOrder = [];

  const numFlags = 5;
  flags = [];

  for (let i = 0; i < numFlags; i++) {
    const height = Math.floor(Math.random() * 100) + 50;
    const color = randomColor();
    const id = Math.random().toString(36).substr(2, 7);
    flags.push({ id, height, color });
  }

  flags.forEach(flag => {
    const div = document.createElement("div");
    div.className = "flag-block";
    div.style.height = `${flag.height}px`;
    div.style.backgroundColor = flag.color;
    div.dataset.id = flag.id;

    if (difficulty < 3) {
      div.addEventListener("click", () => selectFlag(flag.id));
    } else {
      div.draggable = true;
      div.addEventListener("dragstart", handleDragStart);
      div.addEventListener("dragover", handleDragOver);
      div.addEventListener("drop", handleDrop);
    }

    flagsArea.appendChild(div);
  });

  updateTaskText();
}

function updateTaskText() {
  const task = document.getElementById("taskText");
  if (difficulty === 1) {
    task.innerHTML = "Click the shortest flag!";
  } else if (difficulty === 2) {
    task.innerHTML = "Click the tallest flag!";
  } else {
    task.innerHTML = "Drag the flags from shortest ➔ tallest!";
  }
}

function selectFlag(id) {
  const flagDivs = document.querySelectorAll('.flag-block');
  flagDivs.forEach(div => div.classList.remove('selected'));
  
  const flagDiv = document.querySelector(`[data-id="${id}"]`);
  flagDiv.classList.add('selected');
  selectedOrder = [id];
}

// DRAG AND DROP HANDLERS
function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData("text/plain");
  const targetId = e.target.dataset.id;

  const flagsArea = document.getElementById("flagsArea");
  const draggedEl = document.querySelector(`[data-id="${draggedId}"]`);
  const targetEl = document.querySelector(`[data-id="${targetId}"]`);

  if (draggedEl && targetEl && draggedEl !== targetEl) {
    flagsArea.insertBefore(draggedEl, targetEl);
  }
}

function submitAnswer() {
  if (difficulty < 3) {
    if (selectedOrder.length === 0) {
      document.getElementById("feedback").innerHTML = "❗ Please select a flag first!";
      return;
    }
  }

  if (difficulty === 1) {
    const shortest = flags.reduce((min, flag) => (flag.height < min.height ? flag : min));
    if (selectedOrder[0] === shortest.id) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  } else if (difficulty === 2) {
    const tallest = flags.reduce((max, flag) => (flag.height > max.height ? flag : max));
    if (selectedOrder[0] === tallest.id) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  } else {
    const currentOrder = Array.from(document.querySelectorAll(".flag-block")).map(div => div.dataset.id);
    const correctOrder = [...flags].sort((a, b) => a.height - b.height).map(f => f.id);

    if (JSON.stringify(currentOrder) === JSON.stringify(correctOrder)) {
      correctAnswer();
    } else {
      wrongAnswer();
    }
  }
}

function correctAnswer() {
  document.getElementById("feedback").innerHTML = `<span class="correct">✅ Correct!</span>`;
  progress += 20;
  document.getElementById("progressBar").style.width = `${progress}%`;

  if (progress >= 100) {
    setTimeout(() => {
      const win = new bootstrap.Modal(document.getElementById("winModal"));
      win.show();
      launchConfetti();
    }, 500);
  } else {
    setTimeout(() => {
      generateQuestion();
    }, 1500);
  }
}

function wrongAnswer() {
  document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Try again!</span>`;
}

function randomColor() {
  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6F91"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function readStory() {
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