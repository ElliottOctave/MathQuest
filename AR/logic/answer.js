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
  const { texture, ctx } = gameState.appleCounter;

  console.log("🧮 counter display update →", gameState.applesInBasket);

  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`🍎 ${gameState.applesInBasket}`, 256, 80);

  // ✅ Force update texture
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter; // 👈 add this to ensure smooth refresh
}


  

export { checkAnswer, updateCounterDisplay };
