import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/webxr/VRButton.js';

import { setupRenderer, setupCamera } from './setup/scene.js';
import { createEnvironment } from './setup/environment.js';
import { createEquationPanel, createTutorialPanel, createAppleCounterPanel } from './setup/panels.js';
import { createBasket } from './setup/basket.js';
import { createTreesWithApples } from './setup/trees.js';
import { createRusticFence } from './setup/fence.js';

import { setupControllers } from './logic/input.js';
import { animate } from './logic/physics.js';


// 🌍 Setup core Three.js scene
const scene = new THREE.Scene();
const camera = setupCamera();
const renderer = setupRenderer();
document.body.appendChild(VRButton.createButton(renderer));

// 🧠 Shared game state
const gameState = {
    scene,
    fallingApples: [],
    applesInBasket: 0,
    basket: null,
    tutorialPanel: null,
    appleCounter: null,
    correctAnswer: 0,
    apples: [],
    controller: null,
    raycaster: new THREE.Raycaster(),
    tempMatrix: new THREE.Matrix4(),
    grabbedApple: null
};

// 🌞 Setup environment
createEnvironment(scene);

// 🧮 Panels
gameState.correctAnswer = createEquationPanel(scene);
gameState.tutorialPanel = createTutorialPanel(scene, camera);
gameState.appleCounter = createAppleCounterPanel(scene);

// 🧺 Basket
gameState.basket = createBasket(scene);

// 🌳 Trees with apples
createTreesWithApples(scene, gameState.apples);

// 🚧 Fence boundary
createRusticFence(scene);

// 🎮 Controllers
setupControllers(scene, camera, renderer, gameState);

// 🎬 Animation loop
animate(scene, camera, renderer, gameState);

// 🪟 Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
