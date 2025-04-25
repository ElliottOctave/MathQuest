// scripts/template/gameTemplate.js

export function setupGame({
  generateQuestionFn,
  checkAnswerFn,
  getFeedbackMessageFn,
  readStoryTextId = "storyText",
  answerInputId = "answer",
  feedbackId = "feedback",
  progressBarId = "progressBar",
  winModalId = "winModal",
  confettiColors = ['#ff6b6b', '#ffe066', '#6bcB77']
}) {
  let difficulty = 1;
  let progress = 0;
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
        }, 500);
      }

      setTimeout(() => generateQuestionFn(difficulty), 1500);
    } else {
      feedback.innerHTML = getFeedbackMessageFn(false, result.correctAnswer);
      feedback.className = "incorrect";
    }
  }

  function restartGame() {
    progress = 0;
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