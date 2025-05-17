import { checkAnswer, updateCounterDisplay } from './answer.js';

export function animate(scene, camera, renderer, gameState) {
  renderer.setAnimationLoop(() => {
    const { fallingApples, basket, tutorialPanel, appleCounter } = gameState;

    for (let i = fallingApples.length - 1; i >= 0; i--) {
      const obj = fallingApples[i];

      // Gravity
      obj.velocity.y -= 0.00098;
      obj.mesh.position.add(obj.velocity);

      // Hit the ground
      if (obj.mesh.position.y <= 0.02) {
        obj.mesh.position.y = 0.02;
        obj.velocity.set(0, 0, 0);
        obj.mesh.userData.isFalling = false;

        // Clean up removed apples
        if (obj.mesh.userData.fromRemoveButton) {
          scene.remove(obj.mesh);
        }

        fallingApples.splice(i, 1);
        continue;
      }

      // Check basket collision 
      const distance = obj.mesh.position.distanceTo(basket.position);
      if (distance < 0.4 && !obj.mesh.userData.fromRemoveButton) {
        scene.remove(obj.mesh);
        gameState.applesInBasket++;
        updateCounterDisplay(gameState);
        fallingApples.splice(i, 1);
      }
    }

    // tutorial panel 
    if (tutorialPanel) {
      tutorialPanel.lookAt(camera.position);
    }

    // counter panel
    if (appleCounter?.panel) {
      appleCounter.panel.lookAt(camera.position);
    }

    renderer.render(scene, camera);
  });
}



  
