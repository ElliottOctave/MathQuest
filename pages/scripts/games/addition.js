let num1, num2;
let difficulty = 1;
let streak = 0;

function generateQuestion() {
  let maxSum;
  switch (difficulty) {
    case 1: maxSum = 5; break;
    case 2: maxSum = 10; break;
    case 3: maxSum = 20; break;
    default: maxSum = 5;
  }

  num1 = Math.floor(Math.random() * (maxSum + 1));
  num2 = Math.floor(Math.random() * (maxSum - num1 + 1));

  document.getElementById('answer').value = '';
  document.getElementById('feedback').textContent = '';

  document.getElementById('visual-num1').innerHTML = generateFruits(num1, 'apple');
  document.getElementById('visual-num2').innerHTML = generateFruits(num2, 'berry');
}

function generateFruits(n, type) {
  const fruitURL = type === 'apple'
    ? '../assets/apple.webp'
    : '../assets/berry.png';

  let icons = '';
  for (let i = 0; i < n; i++) {
    icons += `<img src="${fruitURL}" alt="${type}" width="30" style="margin: 3px;">`;
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
  const correctAnswer = num1 + num2;

  if (userAnswer === correctAnswer) {
    feedback.textContent = `✅ Correct! ${num1} + ${num2} = ${correctAnswer}`;
    feedback.className = 'correct';
    streak++;
  } else {
    feedback.textContent = `❌ Oops! The correct answer was ${correctAnswer}`;
    feedback.className = 'incorrect';
    streak = 0;
  }

  setTimeout(generateQuestion, 2000);
}

function changeDifficulty() {
  const selected = document.getElementById('difficultySelect').value;
  difficulty = parseInt(selected);
  streak = 0;
  generateQuestion();
}

window.onload = generateQuestion;

let progress = 0;

function submitAnswer() {
  const userInput = document.getElementById('answer').value;
  const feedback = document.getElementById('feedback');

  if (userInput === '') {
    feedback.textContent = 'Please enter an answer.';
    feedback.className = 'incorrect';
    return;
  }

  const userAnswer = parseInt(userInput);
  const correctAnswer = num1 + num2;

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = `<span class="correct">✅ Great job! ${num1} + ${num2} = ${correctAnswer}</span>`;
    progress += 20; // 5 correct = 100%
    document.getElementById('progressBar').style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        const winModal = new bootstrap.Modal(document.getElementById('winModal'));
        winModal.show();
      }, 1000); // delay so the last progress shows nicely
    }
    
    setTimeout(generateQuestion, 1500);
  } else {
    feedback.innerHTML = `<span class="incorrect">❌ Try again! Hint: count the blocks</span>`;
  }
}

function restartGame() {
  progress = 0;
  streak = 0;
  difficulty = parseInt(document.getElementById('difficultySelect').value);
  document.getElementById('progressBar').style.width = '0%';
  generateQuestion();
}

let synth = window.speechSynthesis;

function readStory() {
  if (synth.speaking) {
    synth.cancel(); // Stop previous speech if still talking
  }

  const text = document.getElementById("storyText").textContent;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  synth.speak(utterance);
}
