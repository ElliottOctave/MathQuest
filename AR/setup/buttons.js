import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { updateCounterDisplay } from '../logic/answer.js';
import { checkAnswer } from '../logic/answer.js';


function createButtonPanel(label, position, callback, scene, gameState) {
    // Cube button
    const button = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.1, 0.2), 
        new THREE.MeshStandardMaterial({
            color: label === 'Confirm' ? '#4CAF50' : '#F44336'
        })
    );
    button.position.copy(position);
    button.userData.onClick = callback;        
    button.userData.interactive = true;         
    gameState.interactiveButtons.push(button); 
    scene.add(button);

    // Floating label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = label === 'Confirm' ? '#4CAF50' : '#F44336';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, 128, 42);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const labelPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), labelMaterial);
    labelPlane.position.set(0, 0.07, 0); 
    button.add(labelPlane);
}

export function createButtonTable(scene, gameState) {
    // Table 
    const table = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.3, 0.6),
        new THREE.MeshStandardMaterial({ color: '#8B5A2B' })
    );

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(gameState.basket.quaternion);
    const offset = forward.clone().multiplyScalar(1.0);
    table.position.copy(gameState.basket.position).add(offset);
    table.position.y = 0.15;
    scene.add(table);

    // Button positions 
    const confirmPos = table.position.clone().add(new THREE.Vector3(0.00, 0.2, 0.15));
    const removePos = table.position.clone().add(new THREE.Vector3(0.02, 0.2, -0.15));

    gameState.interactiveButtons = [];

    createButtonPanel('Confirm', confirmPos, () => checkAnswer(gameState), scene, gameState);

    createButtonPanel('Remove', removePos, () => {
        if (gameState.applesInBasket > 0) {
            gameState.applesInBasket--;
            console.log("🔁 Updating counter display...");
            updateCounterDisplay(gameState);

            const thrownApple = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 16, 16),
                new THREE.MeshStandardMaterial({ color: 'red' })
            );
            thrownApple.position.copy(gameState.basket.position);
            thrownApple.userData.isFalling = true;
            thrownApple.userData.isApple = true;
            thrownApple.userData.fromRemoveButton = true;

            scene.add(thrownApple);

            // jumped apple
            const direction = new THREE.Vector3(0, 1.5, -1).normalize(); 
            const speed = 0.05 + Math.random() * 0.01;

            gameState.fallingApples.push({
                mesh: thrownApple,
                velocity: direction.multiplyScalar(speed)
            });
        }
    }, scene, gameState);





    // Instruction Label 
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✔ Confirm to check | ❌ Remove to toss an apple', 512, 80);

    const texture = new THREE.CanvasTexture(canvas);
    const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.2),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
    );

    label.position.set(table.position.x + 1, table.position.y + 0.5, table.position.z - 0.4);
    label.lookAt(scene.position);
    scene.add(label);
}
