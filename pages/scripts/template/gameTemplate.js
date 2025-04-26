// scripts/template/gameTemplate.js
let startTime;
let mistakes;

export function setupGame({
  generateQuestionFn,
  checkAnswerFn,
  getFeedbackMessageFn,
  gameId,
  readStoryTextId = "storyText",
  answerInputId = "answer",
  feedbackId = "feedback",
  progressBarId = "progressBar",
  winModalId = "winModal",
  confettiColors = ['#ff6b6b', '#ffe066', '#6bcB77']
}) {
  let difficulty = 1;
  let progress = 0;
  startTime = Date.now();
  mistakes = 0;
  const synth = window.speechSynthesis;

  function readStory() {
    if (synth.speaking) synth.cancel();
    const text = document.getElementById(readStoryTextId).textContent;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.speak(utterance);
  }

  function changeDifficulty() {
    difficulty = parseInt(document.getElementById("difficultySelect").value);
    progress = 0;
    document.getElementById(progressBarId).style.width = "0%";
    generateQuestionFn(difficulty);
    startTime = Date.now();
    mistakes = 0;
  }

  function submitAnswer() {
    const input = document.getElementById(answerInputId).value;
    const feedback = document.getElementById(feedbackId);
    const result = checkAnswerFn(parseInt(input));

    if (result.correct) {
      feedback.innerHTML = getFeedbackMessageFn(true);
      feedback.className = "correct";
      progress += 20;
      document.getElementById(progressBarId).style.width = `${progress}%`;

      if (progress >= 100) {
        setTimeout(() => {
          const win = new bootstrap.Modal(document.getElementById(winModalId));
          win.show();
          launchConfetti();
          if (gameId) {
            updatePerformance(gameId);
          }
        }, 500);
      }

      setTimeout(() => generateQuestionFn(difficulty), 1500);
    } else {
      feedback.innerHTML = getFeedbackMessageFn(false, result.correctAnswer);
      feedback.className = "incorrect";
      mistakes += 1;
    }
  }

  function restartGame() {
    progress = 0;
    startTime = Date.now();
    mistakes = 0;
    document.getElementById(progressBarId).style.width = "0%";
    generateQuestionFn(difficulty);
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
        colors: confettiColors
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: confettiColors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  return {
    readStory,
    changeDifficulty,
    submitAnswer,
    restartGame
  };
}

import { auth, db } from "../../../firebase.js"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function updatePerformance(gameId) {
  if (!auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  const timeField = `time_${gameId}`;
  const retryField = `retryFrequency_${gameId}`;

  const endTime = Date.now();
  console.log("Start time:", startTime);
  const timeTaken = Math.floor((endTime - startTime) / 1000);

  console.log("🎯 Game Finished!");
  console.log(`🕒 Time taken: ${timeTaken} seconds`);
  console.log(`❌ Mistakes made: ${mistakes}`);

  const newTimeStack = [...(userData[timeField] || []), timeTaken];
  const newRetryStack = [...(userData[retryField] || []), mistakes];

  const trimmedTimeStack = newTimeStack.slice(-5);
  const trimmedRetryStack = newRetryStack.slice(-5);

  console.log(`🗂️ Previous Times: ${userData[timeField] || []}`);
  console.log(`🗂️ Previous Retries: ${userData[retryField] || []}`);
  console.log(`📥 New Times: ${trimmedTimeStack}`);
  console.log(`📥 New Retries: ${trimmedRetryStack}`);

  await updateDoc(userRef, {
    [timeField]: trimmedTimeStack,
    [retryField]: trimmedRetryStack
  });

  console.log("✅ Game stats updated in Firestore!");
}
