// basket.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

function createBasket(scene) {
  const basketProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.15, 0.0),
    new THREE.Vector2(0.17, 0.05),
    new THREE.Vector2(0.20, 0.10),
    new THREE.Vector2(0.24, 0.15),
    new THREE.Vector2(0.28, 0.20),
    new THREE.Vector2(0.30, 0.25)
  ];

  const basketGeometry = new THREE.LatheGeometry(basketProfile, 64);
  const basketMaterial = new THREE.MeshStandardMaterial({
    color: 0xA0522D,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  const basket = new THREE.Mesh(basketGeometry, basketMaterial);
  basket.scale.set(1.5, 1.5, 1.5);
  basket.position.set(2, 0, 0);
  basket.castShadow = true;
  basket.receiveShadow = false;

  scene.add(basket);

  return basket; 
}


export {createBasket}
