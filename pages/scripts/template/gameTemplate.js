// scripts/template/gameTemplate.js
let startTime;
let mistakes;

export function setupGame({
  generateQuestionFn,
  checkAnswerFn,
  getFeedbackMessageFn,
  gameId,
  restartGameFn,
  readStoryTextId = "storyText",
  answerInputId = "answer",
  feedbackId = "feedback",
  progressBarId = "progressBar",
  winModalId = "winModal",
  confettiColors = ['#ff6b6b', '#ffe066', '#6bcB77']
}) {
  let difficulty;
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
  
  async function changeDifficulty() {
    console.log("Changing difficulty...");
    if (gameId) {
      const newDifficulty = await calculateDifficulty(gameId);
      console.log("New difficulty level:", newDifficulty);
      difficulty = newDifficulty;
    }
    generateQuestionFn(difficulty);
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

  async function restartGame() {
    progress = 0;
    startTime = Date.now();
    mistakes = 0;
    document.getElementById(progressBarId).style.width = "0%";
    if (gameId) {
      const newDifficulty = await calculateDifficulty(gameId);
      console.log("New difficulty level:", newDifficulty);
      difficulty = newDifficulty;
    }
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
import { onAuthStateChanged } from "firebase/auth";

export async function updatePerformance(gameId) {
  console.log("[updatePerformance] Called for gameId:", gameId);
  if (!auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  const timeField = `time_${gameId}`;
  const retryField = `retryFrequency_${gameId}`;

  const endTime = Date.now();
  const timeTaken = Math.floor((endTime - startTime) / 1000);

  console.log("🎯 Game Finished!");
  console.log(`🕒 Time taken: ${timeTaken} seconds`);
  console.log(`❌ Mistakes made: ${mistakes}`);

  // Add 1 coin to the user's coins after winning
  let newCoins = userData['coins'] || 0;
  newCoins += 1; // Add 1 coin

  const newTimeStack = [...(userData[timeField] || []), timeTaken];
  const newRetryStack = [...(userData[retryField] || []), mistakes];

  const trimmedTimeStack = newTimeStack.slice(-5);
  const trimmedRetryStack = newRetryStack.slice(-5);

  console.log(`🗂️ Previous Times: ${userData[timeField] || []}`);
  console.log(`🗂️ Previous Retries: ${userData[retryField] || []}`);
  console.log(`📥 New Times: ${trimmedTimeStack}`);
  console.log(`📥 New Retries: ${trimmedRetryStack}`);
  console.log(`💰 Updated Coins: ${newCoins}`);

  await updateDoc(userRef, {
    [timeField]: trimmedTimeStack,
    [retryField]: trimmedRetryStack,
    ['coins']: newCoins // Update coins in Firestore
  });

  console.log("✅ Game stats updated in Firestore!");
}

async function calculateDifficulty(gameId) {
  console.log("[calculateDifficulty] Called for gameId:", gameId);

  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      console.log("[onAuthStateChanged] triggered, user:", user);

      if (!user) {
        console.log("❗ No logged-in user, defaulting to Easy difficulty");
        resolve(1);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("❗ No user data found, defaulting to Easy difficulty");
        resolve(1);
        return;
      }

      const userData = userSnap.data();
      const timeStack = userData[`time_${gameId}`] || [];
      const retryStack = userData[`retryFrequency_${gameId}`] || [];

      if (timeStack.length === 0 || retryStack.length === 0) {
        console.log("❗ Not enough game data, defaulting to Easy difficulty");
        resolve(1);
        return;
      }

      const avgTime = timeStack.reduce((a, b) => a + b, 0) / timeStack.length;
      const avgMistakes = retryStack.reduce((a, b) => a + b, 0) / retryStack.length;

      console.log(`📊 Calculated average time: ${avgTime.toFixed(2)}s`);
      console.log(`📊 Calculated average mistakes: ${avgMistakes.toFixed(2)}`);

      if (avgTime <= 30 && avgMistakes <= 1) {
        console.log("🚀 Selected Hard difficulty (3)");
        resolve(3);
      } else if (avgTime <= 60 && avgMistakes <= 3) {
        console.log("⚡ Selected Medium difficulty (2)");
        resolve(2);
      } else {
        console.log("🐢 Selected Easy difficulty (1)");
        resolve(1);
      }
    });
  });
}