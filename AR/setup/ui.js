// ui.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

export function createButtonPanel(label, position, callback, scene, gameState) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = label === 'Confirm' ? '#4CAF50' : '#F44336'; 
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, 128, 80);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  const button = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), material);
  button.position.copy(position);
  button.userData.onClick = callback; 
  scene.add(button);

  gameState.interactiveButtons.push(button);
}
