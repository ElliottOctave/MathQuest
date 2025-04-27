let difficulty = 1;
let progress = 0;
let correctHour = 0;
let correctMinute = 0;
let draggedHour = 0;
let draggedMinute = 0;
let draggingHand = null;
const synth = window.speechSynthesis;

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
  document.getElementById("feedback").innerHTML = "";
  const digitalArea = document.getElementById("digitalArea");

  if (difficulty === 1) {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = 0;
  } else if (difficulty === 2) {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = Math.random() < 0.5 ? 0 : 30;
  } else {
    correctHour = Math.floor(Math.random() * 12) + 1;
    correctMinute = Math.random() < 0.5 ? 0 : 30;
  }

  if (difficulty < 3) {
    digitalArea.innerHTML = `
      <div class="digital-clock">
        <div class="time-section">
          <button class="adjust-btn" onclick="adjustHour(1)">▲</button>
          <div id="hourDisplay" class="time-number">0</div>
          <button class="adjust-btn" onclick="adjustHour(-1)">▼</button>
        </div>
        <div class="separator">:</div>
        <div class="time-section">
          <button class="adjust-btn" onclick="adjustMinute(1)">▲</button>
          <div id="minuteDisplay" class="time-number">00</div>
          <button class="adjust-btn" onclick="adjustMinute(-1)">▼</button>
        </div>
      </div>
    `;
    updateDigitalDisplay();
  } else {
    digitalArea.innerHTML = `
      <div class="digital-clock">
        <div class="time-section">
          <div class="time-number">${correctHour}</div>
        </div>
        <div class="separator">:</div>
        <div class="time-section">
          <div class="time-number">${correctMinute.toString().padStart(2, '0')}</div>
        </div>
      </div>
    `;
  }  

  drawClock();
}

function adjustHour(change) {
    const display = document.getElementById('hourDisplay');
    let value = parseInt(display.textContent) || 0;
    value = (value + change + 13) % 13; // 0-12 only
    if (value === 0) value = 12;
    display.textContent = value;
  }
  
  function adjustMinute(change) {
    const display = document.getElementById('minuteDisplay');
    let value = parseInt(display.textContent) || 0;
    value = (value === 30 ? 30 : 0);
    value = (value + (change * 30) + 60) % 60; // 0 or 30 only
    display.textContent = value.toString().padStart(2, '0');
  }
  
  function updateDigitalDisplay() {
    document.getElementById('hourDisplay').textContent = '0';
    document.getElementById('minuteDisplay').textContent = '00';
  }  

function drawClock() {
  
  const canvas = document.getElementById("analogClock");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.stroke();

  ctx.font = "16px Comic Sans MS";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 1; i <= 12; i++) {
    const angle = (i - 3) * (Math.PI * 2) / 12;
    ctx.fillText(i, 100 + Math.cos(angle) * 70, 100 + Math.sin(angle) * 70);
  }

  let hour = difficulty === 3 ? draggedHour : correctHour;
  let minute = difficulty === 3 ? draggedMinute : correctMinute;

  drawHand(ctx, ((hour % 12) + minute / 60) * 30, 50, 6);
  drawHand(ctx, minute * 6, 70, 3);

  // Draw small hour ticks
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) * (Math.PI / 180);
    const x1 = 100 + Math.cos(angle) * 80;
    const y1 = 100 + Math.sin(angle) * 80;
    const x2 = 100 + Math.cos(angle) * 90;
    const y2 = 100 + Math.sin(angle) * 90;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
}

  if (difficulty === 3) {
    canvas.onmousedown = startDrag;
    canvas.onmousemove = dragMove;
    canvas.onmouseup = stopDrag;
  } else {
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
  }
}

function drawHand(ctx, angle, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.moveTo(100, 100);
  ctx.lineTo(100 + Math.cos((Math.PI / 180) * (angle - 90)) * length,
              100 + Math.sin((Math.PI / 180) * (angle - 90)) * length);
  ctx.stroke();
}

function startDrag(e) {
  draggingHand = detectHand(e);
}

function stopDrag(e) {
  draggingHand = null;
}

function dragMove(e) {
  if (!draggingHand) return;

  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left - 100;
  const y = e.clientY - rect.top - 100;
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  const adjustedAngle = (angle + 360 + 90) % 360;

  if (draggingHand === "hour") {
    draggedHour = Math.round(adjustedAngle / 30);
    if (draggedHour === 0) draggedHour = 12;
  } else if (draggingHand === "minute") {
    draggedMinute = Math.round(adjustedAngle / 6);
    if (draggedMinute === 60) draggedMinute = 0;
  }
  drawClock();
}

function detectHand(e) {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left - 100;
  const y = e.clientY - rect.top - 100;
  const dist = Math.sqrt(x * x + y * y);

  return dist < 60 ? "hour" : "minute";
}

function submitAnswer() {
  if (difficulty < 3) {
    const input = `${parseInt(document.getElementById("hourDisplay").textContent)}:${document.getElementById("minuteDisplay").textContent}`;
    const correctString = `${correctHour}:${correctMinute.toString().padStart(2, '0')}`;
    if (input === correctString) {
      correctFeedback();
    } else {
      wrongFeedback();
    }
  } else {
    if (draggedHour === correctHour && draggedMinute === correctMinute) {
      correctFeedback();
    } else {
      wrongFeedback();
    }
  }
}

function correctFeedback() {
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

function wrongFeedback() {
  document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Try again!</span>`;
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
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}