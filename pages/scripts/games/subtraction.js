let num1, num2;
let difficulty = 1;
let streak = 0;
let progress = 0;
let synth = window.speechSynthesis;

function generateQuestion() {
  let max;
  switch (difficulty) {
    case 1: max = 5; break;
    case 2: max = 10; break;
    case 3: max = 20; break;
    default: max = 5;
  }

  num1 = Math.floor(Math.random() * (max + 1));
  num2 = Math.floor(Math.random() * (num1 + 1)); // ensure num2 <= num1

  document.getElementById('answer').value = '';
  document.getElementById('feedback').textContent = '';

  document.getElementById('visual-num1').innerHTML = generateFruits(num1, 'banana');
  document.getElementById('visual-num2').innerHTML = generateFruits(num2, 'mango', true);
}

function generateFruits(n, type, fade = false) {
  const fruitURL = type === 'banana'
    ? '../assets/subtraction/banana.webp'
    : '../assets/subtraction/mango.webp';

  let icons = '';
  for (let i = 0; i < n; i++) {
    icons += `<img src="${fruitURL}" alt="${type}" width="30" style="margin: 3px; ${fade ? 'opacity: 0.3;' : ''}">`;
  }
  return icons || '<span style="color:#ccc;">0</span>';
}

function submitAnswer() {
  const userInput = document.getElementById('answer').value;
  const feedback = document.getElementById('feedback');

  if (userInput === '') {
    feedback.textContent = 'Please enter an answer.';
    feedback.className = 'incorrect';
    return;
  }

  const userAnswer = parseInt(userInput);
  const correctAnswer = num1 - num2;

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = `✅ Great job! ${num1} − ${num2} = ${correctAnswer}`;
    feedback.className = 'correct';
    progress += 20;
    document.getElementById('progressBar').style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
        launchConfetti();
      }, 1000);
    }

    setTimeout(generateQuestion, 1500);
  } else {
    feedback.innerHTML = `❌ Try again! Hint: ${num1} minus ${num2}`;
    feedback.className = 'incorrect';
  }
}

function changeDifficulty() {
  const selected = document.getElementById('difficultySelect').value;
  difficulty = parseInt(selected);
  streak = 0;
  generateQuestion();
}

function restartGame() {
  progress = 0;
  streak = 0;
  difficulty = parseInt(document.getElementById('difficultySelect').value);
  document.getElementById('progressBar').style.width = '0%';
  generateQuestion();
}

function readStory() {
  if (synth.speaking) synth.cancel();
  const text = document.getElementById("storyText").textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  synth.speak(utterance);
}

function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f39c12', '#f1c40f', '#27ae60']
    });
    confetti({
      particleCount: 7,
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