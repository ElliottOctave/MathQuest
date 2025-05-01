function checkAnswer(game) {
  updateCounterDisplay(game);
  if (game.applesInBasket === game.correctAnswer) {
    alert('✅ Correct!');
  } else if (game.applesInBasket > game.correctAnswer) {
    alert('❌ Too many apples!');
  }
}


  function updateCounterDisplay(gameState) {
    const { texture, ctx } = gameState.appleCounter;
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🍎 ${gameState.applesInBasket}`, 256, 80);
    texture.needsUpdate = true;
  }
  

export { checkAnswer, updateCounterDisplay };
