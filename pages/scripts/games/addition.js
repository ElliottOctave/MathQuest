let num1, num2;
let difficulty = 1; // 1 = easy, 2 = medium, 3 = hard
let streak = 0;

function generateQuestion() {
  const max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;

  num1 = Math.floor(Math.random() * (max + 1));
  num2 = Math.floor(Math.random() * (max + 1));

  document.getElementById('num1').textContent = num1;
  document.getElementById('num2').textContent = num2;
  document.getElementById('answer').value = '';
  document.getElementById('feedback').textContent = '';
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

    // Adaptive difficulty
    if (streak >= 3 && difficulty < 3) {
      difficulty++;
      streak = 0;
    }
  } else {
    feedback.textContent = `❌ Oops! The correct answer was ${correctAnswer}`;
    feedback.className = 'incorrect';
    streak = 0;
    if (difficulty > 1) difficulty--; // Decrease difficulty on failure
  }

  // Next question after 2 seconds
  setTimeout(generateQuestion, 2000);
}

window.onload = generateQuestion;
