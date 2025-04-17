let difficulty = 1; // 1 = Easy, 2 = Medium, 3 = Hard
let streak = 0;
let num1, num2;

function generateQuestion() {
  let max = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 20;
  num1 = Math.floor(Math.random() * (max + 1));
  num2 = Math.floor(Math.random() * (max + 1));
  document.getElementById('num1').textContent = num1;
  document.getElementById('num2').textContent = num2;
  document.getElementById('answer').value = '';
  document.getElementById('feedback').innerHTML = '';
}

function submitAnswer() {
  const userAnswer = parseInt(document.getElementById('answer').value);
  const correctAnswer = num1 + num2;
  const feedback = document.getElementById('feedback');

  if (userAnswer === correctAnswer) {
    feedback.innerHTML = `<span class="correct">✅ Great job! ${num1} + ${num2} = ${correctAnswer}</span>`;
    streak++;
    if (streak >= 3 && difficulty < 3) {
      difficulty++;
      streak = 0;
    }
  } else {
    feedback.innerHTML = `<span class="incorrect">❌ Oops! Try again!</span>`;
    streak = Math.max(0, streak - 1);
    if (streak === 0 && difficulty > 1) {
      difficulty--;
    }
  }

  setTimeout(generateQuestion, 1500);
}

window.onload = generateQuestion;