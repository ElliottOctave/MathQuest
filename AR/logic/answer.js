import { showSuccessPanel } from '../setup/panels.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';


function checkAnswer(gameState) {
  updateCounterDisplay(gameState);

  if (gameState.applesInBasket === gameState.correctAnswer) {
    showSuccessPanel(gameState.scene, gameState.camera);
  } else {
    console.log('❌ Not correct yet');
  }
}

function updateCounterDisplay(gameState) {
  const { texture, ctx, canvas } = gameState.appleCounter;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#114477'; // same blue as equation
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🍎 ${gameState.applesInBasket}`, canvas.width / 2, canvas.height / 2);

  texture.needsUpdate = true;
  gameState.appleCounter.panel.material.map = texture;
  gameState.appleCounter.panel.material.needsUpdate = true;
}





export { checkAnswer, updateCounterDisplay };
