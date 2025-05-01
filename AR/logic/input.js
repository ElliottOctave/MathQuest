import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

let raycaster, tempMatrix;

function onSelectStart(event) {
  const controller = event.target;
  const { apples, grabbedApple, fallingApples } = event.data;

  if (grabbedApple.current) return;

  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const intersects = raycaster.intersectObjects(apples, true);
  console.log("Ray hits:", intersects);

  for (const hit of intersects) {
    let obj = hit.object;
    while (obj && !obj.userData.isApple && obj.parent) obj = obj.parent;

    if (obj && obj.userData.isApple && !obj.userData.isFalling) {
      grabbedApple.current = obj;

      const worldPosition = new THREE.Vector3();
      obj.getWorldPosition(worldPosition);

      controller.attach(obj);
      obj.position.copy(controller.worldToLocal(worldPosition.clone()));
      break;
    }
  }
}

function onSelectEnd(event) {
  const controller = event.target;
  const {
    grabbedApple,
    fallingApples,
    scene,
    interactiveButtons
  } = event.data;

  let droppedApple = false;

  if (grabbedApple.current) {
    grabbedApple.current.userData.isFalling = true;
    fallingApples.push({
      mesh: grabbedApple.current,
      velocity: new THREE.Vector3(0, 0, 0)
    });
    scene.attach(grabbedApple.current);
    grabbedApple.current = null;
    droppedApple = true;
  }

  // 👇 Skip button check if we just dropped an apple this frame
  if (droppedApple) return;

  // 🎯 Check for button hits
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  const buttonHits = raycaster.intersectObjects(interactiveButtons, true);
  console.log('🔍 Button hits:', buttonHits);

  for (const hit of buttonHits) {
    let obj = hit.object;
  
    // Traverse up to find parent with .onClick
    while (obj && !obj.userData.onClick && obj.parent) {
      obj = obj.parent;
    }
  
    if (obj && obj.userData.onClick) {
      console.log('✅ Executing button click callback on:', obj);
      obj.userData.onClick();
      return;
    }
  }
  
}


function setupControllers(scene, camera, renderer, gameState) {
  raycaster = new THREE.Raycaster();
  tempMatrix = new THREE.Matrix4();

  const controller = renderer.xr.getController(0);
  gameState.controller = controller;
  gameState.raycaster = raycaster;


  // Use a ref-like object so `grabbedApple` is mutable
  if (!gameState.grabbedApple) gameState.grabbedApple = { current: null };

  controller.addEventListener('selectstart', e =>
    onSelectStart({ ...e, data: gameState })
  );
  controller.addEventListener('selectend', e =>
    onSelectEnd({ ...e, data: gameState })
  );

  const laser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  laser.rotation.x = -Math.PI / 2;
  laser.position.z = -0.5;
  controller.add(laser);

  scene.add(controller);
}

export { onSelectStart, onSelectEnd, setupControllers };
