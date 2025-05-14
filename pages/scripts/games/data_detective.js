import { setupGame, updatePerformance, getDifficulty } from '../template/gameTemplate.js';

let game_difficulty = 1;
let progress = 0;
const synth = window.speechSynthesis;
let mistakes = 0;
let startTime = Date.now();
let difficulty;
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
async function generateQuestion() {
  difficulty = await getDifficulty("game9");
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
      box.style.backgroundColor = "#a0c4ff";
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
  game.registerMistake();
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

window.showHelp = function () {
  const chartArea = document.getElementById("chartArea");
  const fruitRows = Array.from(chartArea.children);
  const questionText = document.getElementById("questionText").textContent;

  const data = fruitRows.map(row => {
    const icon = row.querySelector(".icon")?.textContent.trim() || "❓";
    const boxes = row.querySelectorAll(".chart-box").length;
    return { icon, boxes };
  });

  const isMost = questionText.includes("most");
  const isLeast = questionText.includes("least");
  const isCompare = questionText.includes("How many");

  const createBoxRow = (n) => {
    return Array.from({ length: n }).map(() =>
      `<div style="width: 20px; height: 20px; background-color: #a0c4ff; margin: 2px; border-radius: 4px;"></div>`
    ).join("");
  };

  let content = `<p style="margin-bottom: 4px;"><strong>Question:</strong> ${questionText}</p><hr style="margin: 8px 0;">`;

  if (isMost || isLeast) {
    const sorted = [...data].sort((a, b) => isMost ? b.boxes - a.boxes : a.boxes - b.boxes);
    const target = sorted[0];

    content += `
      <p><strong>Let’s solve it together!</strong></p>
      <p>Look at how long each row is. The longest row means the most. The shortest row means the least.</p>
      <div style="margin: 12px 0;">
        ${data.map(d => `
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 20px; width: 30px;">${d.icon}</span>
            ${createBoxRow(d.boxes)}
          </div>
        `).join("")}
      </div>
      <p>The <strong>${isMost ? "longest" : "shortest"}</strong> row is the answer.</p>
      <p><strong>The correct answer is:</strong> ${target.icon}</p>
    `;
  }

  if (isCompare) {
    const match = questionText.match(/How many (more|less) does (.+) have than (.+)\?/);
    if (!match) return;
    const [, mode, labelA, labelB] = match;

    const itemA = data.find(d => labelA.includes(d.icon)) || data[0];
    const itemB = data.find(d => labelB.includes(d.icon)) || data[1];
    const diff = Math.abs(itemA.boxes - itemB.boxes);

    content += `
      <p><strong>Let’s compare two rows!</strong></p>
      <p>Look at how many boxes each row has. Count how many more one row has than the other.</p>
      <div style="margin: 12px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; width: 30px;">${itemA.icon}</span>
          ${createBoxRow(itemA.boxes)}
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 20px; width: 30px;">${itemB.icon}</span>
          ${createBoxRow(itemB.boxes)}
        </div>
      </div>
      <p>We count the extra boxes between them.</p>
      <p><strong>The difference is:</strong> ${diff}</p>
    `;
  }

  const tipBox = document.createElement("div");
  tipBox.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: #fff9c4;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 420px;
      max-height: 70vh;
      overflow-y: auto;
      z-index: 1001;
      font-family: sans-serif;
    ">
      <h5>Tip:</h5>
      ${content}
      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-3">Close</button>
    </div>
  `;

  document.body.appendChild(tipBox);
};
