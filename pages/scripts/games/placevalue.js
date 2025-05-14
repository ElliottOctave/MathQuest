import { setupGame, updatePerformance } from '../template/gameTemplate.js';

let target = 0;
let basket = [];
let mistakes = 0;
let startTime = Date.now();
let gameDifficulty = 1;

  // Initialize the game with the necessary functions
  const game = setupGame({
    generateQuestionFn: generateQuestion,
    checkAnswerFn: submitAnswer,
    getFeedbackMessageFn: () => {},
    gameId: "game5", // Unique game ID for tracking
  });

  window.readStory = game.readStory;
  window.onload = game.changeDifficulty;
  window.drag = drag;
  window.allowDrop = allowDrop;
  window.drop = drop;
  window.submitAnswer = submitAnswer;
  window.removeItem = removeItem;

  // Expose restartGame to reset progress and call the restart function from the game template
  window.restartGame = () => {
    document.getElementById("progressBar").style.width = "0%";
  
    if (mistakes >= 3) {
      const helpBtn = document.getElementById("helpButton");
      if (helpBtn) helpBtn.style.display = "block";
    } else {
      const helpBtn = document.getElementById("helpButton");
      if (helpBtn) helpBtn.style.display = "none";
    }
  
    game.restartGame(); // Calls template restart
    target = 0;
    basket = [];
    mistakes = 0;
    startTime = Date.now();
    document.getElementById("basket").innerHTML = "";
    document.getElementById("feedback").innerHTML = "";
  };
  

function generateQuestion(difficulty) {
  gameDifficulty = difficulty || 1; // Default to 1 if not provided
  console.log("Generating question for difficulty:", difficulty);
  let max;
  if (difficulty === 1) max = 30;
  else if (difficulty === 2) max = 60;
  else max = 100;

  target = Math.floor(Math.random() * (max - 9)) + 10; // at least 10
  document.getElementById("targetNumber").textContent = target;
}

// Function to allow items to be dragged and dropped into the basket
function allowDrop(ev) {
  ev.preventDefault();
}

// Function to handle the dragging of items
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

// Function to handle dropping of dragged items into the basket
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  basket.push(data);

  const img = document.createElement("img");
  img.src = document.getElementById(data).src;
  img.width = data === "gift" ? 60 : 40;
  img.style.margin = "4px";
  img.dataset.type = data; // Save whether it’s a gift or balloon
  img.onclick = function() { removeItem(this); }; // Make it clickable to delete
  document.getElementById("basket").appendChild(img);
}

// Function to remove an item from the basket
function removeItem(img) {
  const type = img.dataset.type;
  const index = basket.indexOf(type);
  if (index > -1) {
    basket.splice(index, 1); // Remove from basket array
  }
  img.remove(); // Remove visually
}

// Function to submit the answer
export function submitAnswer() {
  const ones = basket.filter(item => item === "balloon").length;
  const tens = basket.filter(item => item === "gift").length;
  const total = tens * 10 + ones;

  const feedback = document.getElementById("feedback");

  if (total === target) {
    feedback.innerHTML = `<span class="correct">✅ Great job! ${tens} tens and ${ones} ones = ${target}</span>`;
    let width = parseInt(document.getElementById("progressBar").style.width) || 0;
    width += 20;
    document.getElementById("progressBar").style.width = `${width}%`;

    if (width >= 100) {
      setTimeout(() => {
        const winModal = new bootstrap.Modal(document.getElementById("winModal"));
        winModal.show();
        launchConfetti();
        updatePerformance("game5", mistakes, startTime);
      }, 600);
    } else {
      setTimeout(() => {
        basket = [];
        document.getElementById("basket").innerHTML = "";
        generateQuestion(gameDifficulty);
      }, 1500);
    }
  } else {
    mistakes++;
    game.registerMistake();
    feedback.innerHTML = `<span class="incorrect">❌ Oops! Try again!</span>`;
  }
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

window.showHelp = function () {
  const targetVal = target;
  let remaining = targetVal;
  let steps = [];
  let giftCount = 0;
  let balloonCount = 0;

  while (remaining >= 10) {
    steps.push({
      type: "gift",
      before: remaining,
      after: remaining - 10,
      reason: "Because 10 fits in " + remaining
    });
    remaining -= 10;
    giftCount++;
  }

  while (remaining > 0) {
    steps.push({
      type: "balloon",
      before: remaining,
      after: remaining - 1,
      reason: "Because 10 doesn’t fit in " + remaining
    });
    remaining -= 1;
    balloonCount++;
  }

  const stepVisuals = steps.map((step, i) => {
    const imgSrc = step.type === "gift"
      ? "../assets/placevalue/gift.webp"
      : "../assets/placevalue/balloon.webp";
    const alt = step.type === "gift" ? "gift" : "balloon";
  
    const nowLine = step.after > 0
    ? `<p>Now we need <strong>${step.after}</strong>.</p>`
    : `<p><strong>There’s nothing left!</strong></p>`;  
  
    return `
      <div style="margin-bottom: 16px;">
        <p><strong>Step ${i + 1}</strong></p>
        <p>We still need <strong>${step.before}</strong>.</p>
        <p>${step.reason}</p>
        <p>
          Place a 
          <img src="${imgSrc}" alt="${alt}" width="35" style="vertical-align: middle;">
        </p>
        ${nowLine}
      </div>
    `;
  }).join('');  

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
      max-width: 400px;
      max-height: 75vh;
      overflow-y: auto;
      z-index: 1001;
      font-family: sans-serif;
    ">
      <h5 style="margin-top: 0;">Tip:</h5>
      <p>We want to build the number <strong>${targetVal}</strong>.</p>
      <p>At each step, ask yourself:</p>
      <ul>
        <li><strong>Is the number 10 or more?</strong> → Place a 
          <img src="../assets/placevalue/gift.webp" alt="gift" width="25" style="vertical-align: middle;">
        </li>
        <li><strong>Less than 10?</strong> → Place a 
          <img src="../assets/placevalue/balloon.webp" alt="balloon" width="20" style="vertical-align: middle;">
        </li>
      </ul>
      <hr>
      ${stepVisuals}
      <hr>
      <p>You need <strong>${giftCount}</strong> gift${giftCount !== 1 ? "s" : ""} and <strong>${balloonCount}</strong> balloon${balloonCount !== 1 ? "s" : ""}.</p>
      <button onclick="this.parentElement.remove()" class="btn btn-sm btn-outline-secondary mt-3">Close</button>
    </div>
  `;
  document.body.appendChild(tipBox);
};
