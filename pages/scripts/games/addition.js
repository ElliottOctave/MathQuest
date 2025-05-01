import { setupGame } from '../template/gameTemplate.js';

let num1, num2;
let startTime;
let mistakes;
let gameStarted = false; // Track if the game has started
function generateQuestion(difficulty) {
  if (!gameStarted) {
    startTime = Date.now(); // Reset timer when game starts
    mistakes = 0; // Reset mistakes
    gameStarted = true;
  }
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
  num1 = Math.floor(Math.random() * (max + 1));
  num2 = Math.floor(Math.random() * (max - num1 + 1));
  document.getElementById("visual-num1").innerHTML = renderFruits(num1, "apple.webp");
  document.getElementById("visual-num2").innerHTML = renderFruits(num2, "berry.png");
}

function renderFruits(n, type) {
  const src = `../assets/addition/${type}`;
  return Array(n).fill(`<img src="${src}" width="30" style="margin: 3px;">`).join('');
}

function checkAnswer(userInput) {
  const correctAnswer = num1 + num2;
  return { correct: userInput === correctAnswer, correctAnswer };
}

function feedback(correct, answer) {
  if (!correct) {
    mistakes++; // Track mistakes
  }
  return correct
    ? `✅ Great job!`
    : `❌ Oops! Try again.`;
}

const game = setupGame({
  generateQuestionFn: generateQuestion,
  checkAnswerFn: checkAnswer,
  getFeedbackMessageFn: feedback,
  gameId: "game1" // 👈 dynamic tracking enabled here
});


window.readStory = game.readStory;
window.changeDifficulty = game.changeDifficulty;
window.submitAnswer = game.submitAnswer;
window.restartGame = game.restartGame;

window.onload = () => changeDifficulty();

async function afterGameWin() {
  const endTime = Date.now();
  const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
  gameStarted = false; // Reset game state for next round
  console.log("🎯 Game Finished!");
  console.log(`🕒 Time taken: ${timeTaken} seconds`);
  console.log(`❌ Mistakes made: ${mistakes}`);

  await updateGame1Stats(timeTaken, mistakes);
}