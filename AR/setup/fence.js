// fence.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

function createRusticFence(scene) {
  const fenceMaterial = new THREE.MeshStandardMaterial({ color: '#8B5A2B' });
  const radius = 0.07;
  const coneHeight = 0.1;

  const fenceRadius = 3.5;
  const postCount = 150;

  for (let i = 0; i < postCount; i++) {
    const angle = (i / postCount) * Math.PI * 2;
    const x = Math.sin(angle) * fenceRadius;
    const z = Math.cos(angle) * fenceRadius;

    const postHeight = 0.6 + Math.random() * 0.2;

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, postHeight, 12),
      fenceMaterial
    );
    post.position.set(x, postHeight / 2, z);
    post.castShadow = true;
    scene.add(post);

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.8, coneHeight, 12),
      fenceMaterial
    );
    cone.position.set(x, postHeight + coneHeight / 2, z);
    cone.castShadow = true;
    scene.add(cone);
  }
}

export {createRusticFence}
