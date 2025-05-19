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
      const newDifficulty = await getDifficulty(gameId);
      console.log("New difficulty level:", newDifficulty);
      difficulty = newDifficulty;
    }
    generateQuestionFn(difficulty);
  }

  function registerMistake() {
    mistakes += 1;
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
            updatePerformance(gameId, mistakes, startTime);
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
  console.log("Restarting game...");
    if (mistakes >= 3) {
      const helpBtn = document.getElementById("helpButton");
      if (helpBtn) helpBtn.style.display = "block";
    } else {
      const helpBtn = document.getElementById("helpButton");
      if (helpBtn) helpBtn.style.display = "none";
    }
  
    progress = 0;
    startTime = Date.now();
    mistakes = 0;
    document.getElementById(progressBarId).style.width = "0%";
    if (gameId) {
      const newDifficulty = await getDifficulty(gameId);
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
    registerMistake,
    submitAnswer,
    restartGame,
  };
}

import { auth, db } from "../../../firebase.js"; 
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export async function getDifficulty(gameId) {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("❗ No logged-in user, defaulting to Easy difficulty");
        resolve(1);
        return;
      }
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        resolve(1);
        return;
      }

      const userData = userSnap.data();
      const difficultyField = `difficulty_${gameId}`;
      const storedDifficulty = userData[difficultyField] ?? 1;
      console.log("Stored difficulty:", storedDifficulty);

      // Convert 1–9 to tier: 1–3 => 1 (Easy), 4–6 => 2 (Medium), 7–9 => 3 (Hard)
      if (storedDifficulty <= 3) {
        console.log("Difficulty level: Easy");
        resolve(1);
        return;
      }
      if (storedDifficulty <= 6) {
        console.log("Difficulty level: Medium");
        resolve(2);
        return;
      }
      console.log("Difficulty level: Hard");
      resolve(3);
    });
  });
}


export async function updatePerformance(gameId, mistakes, startTime) {
  if (!auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  const timeField = `time_${gameId}`;
  const difficultyField = `difficulty_${gameId}`;
  const retryField = `retryFrequency_${gameId}`;

  const endTime = Date.now();
  const timeTaken = Math.floor((endTime - startTime) / 1000);

  console.log("🎯 Game Finished!");
  console.log(`🕒 Time taken: ${timeTaken} seconds`);
  console.log(`❌ Mistakes made: ${mistakes}`);

  // Add 1 coin to the user's coins after winning
  let newCoins = userData['coins'] || 0;
  newCoins += 1; // Add 1 coin

  const newDifficulty = await calculateDifficulty(gameId, mistakes, timeTaken);
  const newTimeStack = [...(userData[timeField] || []), timeTaken];
  const newRetryStack = [...(userData[retryField] || []), mistakes];

  const trimmedTimeStack = newTimeStack.slice(-5);
  const trimmedRetryStack = newRetryStack.slice(-5);

  console.log(`🗂️ Previous Times: ${userData[timeField] || []}`);
  console.log(`🗂️ Previous Retries: ${userData[retryField] || []}`);
  console.log(`📥 New Times: ${trimmedTimeStack}`);
  console.log(`📥 New Retries: ${trimmedRetryStack}`);
  console.log(`💰 Updated Coins: ${newCoins}`);
  console.log(`💡 Updated Difficulty: ${newDifficulty}`);

  await updateDoc(userRef, {
    [timeField]: trimmedTimeStack,
    [retryField]: trimmedRetryStack,
    [difficultyField]: newDifficulty,
    ['coins']: newCoins // Update coins in Firestore
  });

  console.log("✅ Game stats updated in Firestore!");
}


async function calculateDifficulty(gameId, mistakes, timeTaken) {

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
      const userDifficulty = userData[`difficulty_${gameId}`] || 1;

      console.log(`🕒 time taken: ${timeTaken}s`);
      console.log(`❌ mistakes: ${mistakes}`);
      console.log(`🎚️ Current difficulty: ${userDifficulty}`);

       let delta = 0;

      // Very good performance
      if (timeTaken <= 20 && mistakes === 0) {
        delta = 2;
      }
      // Good performance
       else if (timeTaken <= 30 && mistakes <= 2) {
        delta = 1;
      }
      // Poor performance
      else if (timeTaken > 90 && mistakes > 1 || mistakes >= 5) {
        delta = -2;
      }
      // Below average
      else if (timeTaken > 60 || mistakes >= 3) {
        delta = -1;
      }
      // else no change
      let newDifficulty = userDifficulty + delta;
      newDifficulty = Math.max(1, Math.min(9, newDifficulty)); // Clamp to [1, 9]

      console.log(`📈 Adjusted difficulty: ${newDifficulty} (Δ${delta})`);
      resolve(newDifficulty);
    });
  });
}