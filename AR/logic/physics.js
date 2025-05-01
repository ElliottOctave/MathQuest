import { checkAnswer, updateCounterDisplay } from './answer.js';


export function animate(scene, camera, renderer, gameState) {
  renderer.setAnimationLoop(() => {
    const { fallingApples, basket, tutorialPanel } = gameState;

    for (let i = fallingApples.length - 1; i >= 0; i--) {
      const obj = fallingApples[i];
      obj.velocity.y -= 0.00098;
      obj.mesh.position.add(obj.velocity);

      if (obj.mesh.position.y <= 0.02) {
        obj.mesh.position.y = 0.02;
        obj.velocity.set(0, 0, 0);
        obj.mesh.userData.isFalling = false;
        fallingApples.splice(i, 1);
      }

      const distance = obj.mesh.position.distanceTo(basket.position);
      if (distance < 0.4) {
        scene.remove(obj.mesh);
        gameState.applesInBasket++;
        updateCounterDisplay(gameState);
        checkAnswer(gameState);
        fallingApples.splice(i, 1);
      }
    }

    if (gameState.tutorialPanel) {
      gameState.tutorialPanel.lookAt(camera.position);
    }

    if (gameState.appleCounter?.panel) {
      gameState.appleCounter.panel.lookAt(camera.position);
    }

    renderer.render(scene, camera);
  });
}



  
