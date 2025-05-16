import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

function createAppleCounterPanel(scene) {
  const text = `🍎 0`;

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = 'bold 48px Arial';
  const textWidth = tempCtx.measureText(text).width;

  const padding = 80;
  const canvasWidth = Math.ceil((textWidth + padding) / 256) * 256;
  const canvasHeight = 128;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // blue background
  ctx.fillStyle = '#3A73A8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // apple counter 
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  });

  const aspect = canvas.width / canvas.height;
  const height = 0.3;
  const width = height * aspect;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    material
  );

  panel.position.set(2, 2, 0);
  scene.add(panel);

  return { texture, ctx, panel, canvas }; 
}


function createTutorialPanel(scene, camera) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('./assets/tutorial.webp');

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1
  });

  const tutorialPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 1.8),
    material
  );

  tutorialPanel.position.set(-1.8, 1.6, 1.5);
  tutorialPanel.scale.set(0.5, 0.5, 0.5);
  scene.add(tutorialPanel);

  return tutorialPanel;
}

  function createEquationPanel(scene) {
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * (10 - num1)) + 1;
    const sum = num1 + num2;

    const apple = '🍎';

    function buildGroupedApples(n) {
      const groups = Math.floor(n / 2);
      const remainder = n % 2;
      let str = '';
      for (let i = 0; i < groups; i++) {
        str += '🍎🍎   '; 
      }
      if (remainder) str += '🍎';
      return str.trim();
    }

    const apples1 = buildGroupedApples(num1);
    const apples2 = buildGroupedApples(num2);
    const fullText = `${apples1} + ${apples2} = ?`;

    // measure text width
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = '72px Arial';
    const textWidth = tempCtx.measureText(fullText).width;

    
    const canvasWidth = Math.ceil((textWidth + 100) / 256) * 256;
    const canvasHeight = 256;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#114477';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.font = '72px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText(fullText, canvas.width / 2, canvas.height / 2 + 24);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });

    const panelWidth = (canvas.width / canvas.height) * 0.8;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(panelWidth, 0.8), material);
    panel.position.set(0, 3, -1.5);
    scene.add(panel);

    return sum;
  }

  function showSuccessPanel(scene, camera) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
  
    ctx.fillStyle = '#004400';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 Correct! Well done!', canvas.width / 2, canvas.height / 2 + 24);
  
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
  
    const geometry = new THREE.PlaneGeometry(2.5, 0.6);
    const panel = new THREE.Mesh(geometry, material);
  

    const camWorldPos = new THREE.Vector3();
    camera.getWorldPosition(camWorldPos);
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
  
    const panelPos = camWorldPos.clone().add(camDir.multiplyScalar(1.5));
    panel.position.copy(panelPos);
  
    panel.lookAt(camWorldPos);
  
    scene.add(panel);
  
    return panel;
  }
  
  export { createAppleCounterPanel, createTutorialPanel, createEquationPanel, showSuccessPanel };
