import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { GLTFLoader } from '../extrafiles/GLFT.js';

export function createTreesWithApples(scene, applesArray) {
  const trunkHeight = 1.2;
  const leafMaterial = new THREE.MeshStandardMaterial({ color: '#3DAE2B' });
  const leafCenters = [];

  const arcCenter = new THREE.Vector3(0, 0, 0);
  const arcRadius = 2.5;
  const treeAngles = [-Math.PI / 4, -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4];

  const appleLoader = new GLTFLoader();
  appleLoader.load('./assets/apple.glb', (gltf) => {
    const appleModel = gltf.scene;

    treeAngles.forEach((angle) => {
      const x = arcCenter.x + arcRadius * Math.sin(angle);
      const z = arcCenter.z - arcRadius * Math.cos(angle);

      // Tree trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.15, trunkHeight, 12),
        new THREE.MeshStandardMaterial({ color: '#8B4513' })
      );
      trunk.position.set(x, trunkHeight / 2, z);
      trunk.castShadow = true;
      scene.add(trunk);

      // Leaves
      const leaf1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 16, 16),
        leafMaterial
      );
      leaf1.position.set(x, trunkHeight + 0.4, z);
      leaf1.castShadow = true;
      scene.add(leaf1);
      leafCenters.push({ center: leaf1.position.clone(), radius: 0.6 });

      const leaf2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        leafMaterial
      );
      leaf2.position.set(x - 0.3, trunkHeight + 0.1, z);
      leaf2.castShadow = false;
      scene.add(leaf2);
      leafCenters.push({ center: leaf2.position.clone(), radius: 0.5 });

      // Apples
      const applesPerLeaf = 2;
      const totalApples = applesPerLeaf * 2;

      for (let i = 0; i < totalApples; i++) {
        const leafIndex = i < applesPerLeaf ? leafCenters.length - 1 : leafCenters.length - 2;
        const { center, radius } = leafCenters[leafIndex];

        const theta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(60, 120));
        const phi = THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(70, 100));

        const ax = center.x + radius * Math.sin(phi) * Math.cos(theta);
        const ay = center.y + radius * Math.cos(phi);
        const az = center.z + radius * Math.sin(phi) * Math.sin(theta);

        const apple = appleModel.clone();
        apple.scale.set(0.002, 0.002, 0.002);
        apple.position.set(ax, ay, az);
        apple.userData.isApple = true;

        apple.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
            child.geometry.computeBoundingBox();
          }
        });

        applesArray.push(apple);
        scene.add(apple);
      }
    });
  });
}
