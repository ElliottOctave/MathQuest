import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
const synth = window.speechSynthesis;
let mistakes = 0;
let startTime = Date.now();

// Initialize the game with the necessary functions
const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: getFeedbackMessage,
  gameId: "game9", // Unique game ID for tracking
});

window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;

// Expose restartGame to reset progress and call the restart function from the game template
window.restartGame = () => {
  progress = 0;
  mistakes = 0;
  startTime = Date.now();
  document.getElementById("progressBar").style.width = "0%";
  game.restartGame(); // This calls the restart function from the game template
};

window.onload = () => game.changeDifficulty();


// Function to generate the question
function generateQuestion(difficulty) {
  game_difficulty = difficulty || 1; // Default to 1 if not provided
  document.getElementById("feedback").innerHTML = "";
  const chartArea = document.getElementById("chartArea");
  chartArea.innerHTML = "";
  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  const items = [
    { icon: "🍎", label: "Apples", count: randomInt(2, 10) },
    { icon: "🍌", label: "Bananas", count: randomInt(2, 10) },
    { icon: "🍇", label: "Grapes", count: randomInt(2, 10) },
    { icon: "🍊", label: "Oranges", count: randomInt(2, 10) }
  ];

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = item.icon;
    row.appendChild(icon);

    for (let i = 0; i < item.count; i++) {
      const box = document.createElement("div");
      box.className = "chart-box";
      box.style.backgroundColor = randomPastelColor();
      row.appendChild(box);
    }

    chartArea.appendChild(row);
  });

  let question = "";
  let correctAnswer = "";

  if (difficulty === 1 || difficulty === 2) {
    const mostOrLeast = Math.random() < 0.5 ? "most" : "least";
    if (mostOrLeast === "most") {
      correctAnswer = items.reduce((a, b) => (a.count > b.count ? a : b)).label;
      question = "Which has the most?";
    } else {
      correctAnswer = items.reduce((a, b) => (a.count < b.count ? a : b)).label;
      question = "Which has the least?";
    }
  } else {
    // Hard difficulty: how many more or less
    const [item1, item2] = pickTwoRandom(items);
    const moreOrLess = Math.random() < 0.5 ? "more" : "less";
    const difference = Math.abs(item1.count - item2.count);

    if (item1.count === item2.count) {
      generateQuestion();
      return;
    }

    correctAnswer = difference.toString();
    question = `How many ${moreOrLess} does ${item1.label} have than ${item2.label}?`;
  }

  document.getElementById("questionText").textContent = question;

  if (difficulty < 3) {
    shuffleArray(items);
    items.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary m-2 choice-btn";
      btn.textContent = item.label;
      btn.onclick = () => {
        if (item.label === correctAnswer) {
          correctFeedback();
        } else {
          wrongFeedback();
        }
      };
      choices.appendChild(btn);
    });
  } else {
    // HARD mode: generate number choices
    const options = generateNearNumbers(parseInt(correctAnswer));
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary m-2 choice-btn";
      btn.textContent = opt;
      btn.onclick = () => {
        if (opt.toString() === correctAnswer) {
          correctFeedback();
        } else {
          wrongFeedback();
        }
      };
      choices.appendChild(btn);
    });
  }
}

// Function to generate random integer in a range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate random pastel colors
function randomPastelColor() {
  const colors = ["#ffd6d6", "#d6ffd6", "#d6d6ff", "#fff6d6", "#d6fff6"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to pick two random items from an array
function pickTwoRandom(arr) {
  const shuffled = [...arr];
  shuffleArray(shuffled);
  return [shuffled[0], shuffled[1]];
}

// Function to generate near numbers for the hard difficulty
function generateNearNumbers(correct) {
  const nums = new Set([correct]);
  while (nums.size < 4) {
    nums.add(randomInt(Math.max(0, correct - 2), correct + 2));
  }
  return shuffleArray([...nums]);
}

// Function for correct answer feedback
function correctFeedback() {
  document.getElementById("feedback").innerHTML = `<span class="correct">✅ Correct!</span>`;
  progress += 20;
  document.getElementById("progressBar").style.width = `${progress}%`;

  if (progress >= 100) {
    setTimeout(() => {
      const win = new bootstrap.Modal(document.getElementById("winModal"));
      win.show();
      updatePerformance("game9", mistakes, startTime);
      launchConfetti();
    }, 500);
  } else {
    setTimeout(() => {
      generateQuestion();
    }, 1500);
  }
}

// Function to give wrong answer feedback
function wrongFeedback() {
  mistakes++;
  document.getElementById("feedback").innerHTML = `<span class="incorrect">❌ Try again!</span>`;
}

// Function to launch confetti when the game is won
function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      angle: 60,
      spread: 55,
      origin: {x: 0},
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });
    confetti({
      particleCount: 10,
      angle: 120,
      spread: 55,
      origin: {x: 1},
      colors: ['#3498db', '#ffe066', '#6bcB77']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Function to check if the answer is correct (for template integration)
function checkAnswer(userInput) {
  return { correct: userInput === correctAnswer, correctAnswer: correctAnswer };
}

// Function to get the feedback message (for template integration)
function getFeedbackMessage(correct, correctAnswer) {
  return correct
    ? `✅ Great job! The correct answer is ${correctAnswer}.`
    : `❌ Oops! Try again. The correct answer is ${correctAnswer}.`;
}
