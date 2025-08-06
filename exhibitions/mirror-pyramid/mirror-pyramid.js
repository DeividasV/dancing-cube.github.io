// Mirror Pyramid Exhibition - Four Mirrored Spheres with Collision Balls
let scene,
  camera,
  renderer,
  pyramidGroup,
  spheres = [],
  animationId,
  cubeCamera,
  cubeRenderTarget;

// Audio system - initialize lazily
let audioSystem = null;
let soundEnabled = false; // Default to OFF
let ambientSoundId = null;

const SPHERE_RADIUS = 3.5;
const BALL_RADIUS = 0.1;
const NUM_BALLS_PER_SPHERE = 512;
const NUM_SPHERES = 4;
let pyramidRotationX = 0;
let pyramidRotationY = 0;

// Enhanced visual effects
let particleSystem = null;
let lightBeams = [];

// Audio control
function toggleSound(enabled) {
  // Initialize AudioSystem lazily
  if (!audioSystem && typeof AudioSystem !== "undefined") {
    audioSystem = new AudioSystem();
  }

  soundEnabled = enabled;

  if (audioSystem) {
    audioSystem.toggle(enabled);

    if (enabled) {
      // Start ambient crystalline atmosphere
      ambientSoundId = audioSystem.createAmbientPad(150, [1, 1.5, 2, 3]);
    } else {
      if (ambientSoundId) {
        audioSystem.stopAmbientSound(ambientSoundId);
        ambientSoundId = null;
      }
    }
  }
}

// Enhanced collision sound
function playCollisionSound(velocity = 0.5) {
  if (!soundEnabled || !audioSystem) return;

  const frequency = 800 + Math.random() * 400;
  const duration = 0.08 + velocity * 0.05;
  const volume = Math.min(0.02 + velocity * 0.03, 0.08);

  audioSystem.createInteractionSound(frequency, "triangle", duration, volume);
}

// Crystal reflection sound
function playReflectionSound(intensity = 0.3) {
  if (!soundEnabled || !audioSystem) return;

  const frequency = 1200 + intensity * 600;
  const duration = 0.2;
  const volume = 0.04;

  audioSystem.createInteractionSound(frequency, "sine", duration, volume);
}

// Ball physics properties
class Ball {
  constructor(mesh, position, velocity, sphereCenter, isMagenta = true) {
    this.mesh = mesh;
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.sphereCenter = sphereCenter.clone();
    this.speed = 0.03 + Math.random() * 0.02;
    this.isMagenta = isMagenta;
  }

  update() {
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(this.speed));

    // Keep ball on sphere surface relative to sphere center
    const localPos = this.position.clone().sub(this.sphereCenter);
    localPos.normalize().multiplyScalar(SPHERE_RADIUS + BALL_RADIUS);
    this.position.copy(localPos.add(this.sphereCenter));

    // Update mesh position
    this.mesh.position.copy(this.position);

    // Rotate ball based on movement
    const axis = new THREE.Vector3()
      .crossVectors(this.velocity, localPos)
      .normalize();
    if (axis.length() > 0) {
      this.mesh.rotateOnAxis(axis, this.speed / BALL_RADIUS);
    }

    // Update velocity to be tangent to sphere
    const normal = localPos.normalize();
    this.velocity.sub(normal.clone().multiplyScalar(this.velocity.dot(normal)));
    this.velocity.normalize();
  }

  switchColor() {
    this.isMagenta = !this.isMagenta;
    const newColor = this.isMagenta ? 0xff00ff : 0xffff00;
    this.mesh.material.color.setHex(newColor);
  }

  checkCollision(otherBall) {
    const distance = this.position.distanceTo(otherBall.position);
    const minDistance = BALL_RADIUS * 2;

    if (distance < minDistance) {
      // Switch colors on collision
      this.switchColor();
      otherBall.switchColor();

      // Calculate collision response
      const normal = otherBall.position.clone().sub(this.position).normalize();
      const relativeVelocity = this.velocity.clone().sub(otherBall.velocity);
      const speed = relativeVelocity.dot(normal);

      if (speed > 0) return;

      // Elastic collision
      this.velocity.sub(normal.clone().multiplyScalar(speed));
      otherBall.velocity.add(normal.clone().multiplyScalar(speed));

      // Separate balls to prevent overlap
      const overlap = minDistance - distance;
      const separation = normal.clone().multiplyScalar(overlap * 0.5);
      this.position.sub(separation);
      otherBall.position.add(separation);

      // Play collision sound with velocity-based intensity
      const impactVelocity = Math.abs(speed);
      playCollisionSound(impactVelocity);
    }
  }
}

class SphereSystem {
  constructor(center, rotationAxis, sphereGroup) {
    this.center = center.clone();
    this.rotationAxis = rotationAxis.normalize();
    this.balls = [];
    this.mainSphere = null;
    this.rotationSpeed = 0.001 + Math.random() * 0.0005;
    this.sphereGroup = sphereGroup;
  }

  createSphere() {
    // Create main mirrored sphere
    const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 48, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x999999,
      metalness: 1.0,
      roughness: 0.0,
      reflectivity: 1.0,
      envMap: cubeRenderTarget.texture,
      envMapIntensity: 2.0,
    });

    this.mainSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.mainSphere.position.copy(this.center);
    this.mainSphere.receiveShadow = true;
    this.mainSphere.castShadow = true;
    this.sphereGroup.add(this.mainSphere);
  }

  createBalls() {
    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 12, 8);

    for (let i = 0; i < NUM_BALLS_PER_SPHERE; i++) {
      const ballMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff00ff,
        metalness: 1.0,
        roughness: 0.0,
        reflectivity: 1.0,
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 2.0,
      });

      const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
      ballMesh.castShadow = true;
      ballMesh.receiveShadow = true;

      // Ultra-precise positioning using Fibonacci sphere
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const i_norm = i / NUM_BALLS_PER_SPHERE;
      const theta = 2 * Math.PI * i_norm * goldenRatio;
      const phi = Math.acos(1 - 2 * i_norm);

      const localPosition = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).multiplyScalar(SPHERE_RADIUS + BALL_RADIUS);

      // Minimal random offset
      localPosition.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      );
      localPosition.normalize().multiplyScalar(SPHERE_RADIUS + BALL_RADIUS);

      const worldPosition = localPosition.clone().add(this.center);

      // Random velocity tangent to sphere
      const velocity = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      // Make velocity tangent to sphere
      const normal = localPosition.clone().normalize();
      velocity.sub(normal.clone().multiplyScalar(velocity.dot(normal)));
      velocity.normalize();

      const ball = new Ball(
        ballMesh,
        worldPosition,
        velocity,
        this.center,
        true
      );
      this.balls.push(ball);
      this.sphereGroup.add(ballMesh);
    }
  }

  update() {
    // Individual sphere rotation
    if (this.mainSphere) {
      this.mainSphere.rotateOnAxis(this.rotationAxis, this.rotationSpeed);
    }

    // Update balls
    this.balls.forEach((ball) => {
      ball.update();
    });

    // Optimized collision detection
    this.performCollisionDetection();
  }

  performCollisionDetection() {
    const spatialGrid = new Map();
    const gridSize = BALL_RADIUS * 3;

    // Populate spatial grid
    this.balls.forEach((ball, index) => {
      const gridX = Math.floor(ball.position.x / gridSize);
      const gridY = Math.floor(ball.position.y / gridSize);
      const gridZ = Math.floor(ball.position.z / gridSize);
      const key = `${gridX},${gridY},${gridZ}`;

      if (!spatialGrid.has(key)) {
        spatialGrid.set(key, []);
      }
      spatialGrid.get(key).push(index);
    });

    // Check collisions
    const checkedPairs = new Set();
    spatialGrid.forEach((ballIndices) => {
      for (let i = 0; i < ballIndices.length; i++) {
        for (let j = i + 1; j < ballIndices.length; j++) {
          const pairKey = `${Math.min(
            ballIndices[i],
            ballIndices[j]
          )},${Math.max(ballIndices[i], ballIndices[j])}`;
          if (!checkedPairs.has(pairKey)) {
            checkedPairs.add(pairKey);
            const ball1 = this.balls[ballIndices[i]];
            const ball2 = this.balls[ballIndices[j]];

            const roughDistance = ball1.position.distanceToSquared(
              ball2.position
            );
            if (roughDistance < (BALL_RADIUS * 2.5) ** 2) {
              ball1.checkCollision(ball2);
            }
          }
        }
      }
    });
  }
}

function init() {
  setTimeout(() => {
    const loading = document.querySelector(".loading");
  }, 2000);

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  // Calculate optimal camera distance for maximum screen coverage
  const pyramidHeight = 8;
  const pyramidWidth = 14;
  const cameraDistance = Math.max(pyramidWidth, pyramidHeight) * 1.8;

  // Camera setup for maximum screen coverage
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, pyramidHeight * 0.3, cameraDistance);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  document.getElementById("container").appendChild(renderer.domElement);

  // Enhanced lighting setup
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  // Main directional light
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight1.position.set(20, 20, 20);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 4096;
  directionalLight1.shadow.mapSize.height = 4096;
  directionalLight1.shadow.camera.near = 0.1;
  directionalLight1.shadow.camera.far = 100;
  directionalLight1.shadow.camera.left = -40;
  directionalLight1.shadow.camera.right = 40;
  directionalLight1.shadow.camera.top = 40;
  directionalLight1.shadow.camera.bottom = -40;
  scene.add(directionalLight1);

  // Side lights for better illumination
  const pointLight1 = new THREE.PointLight(0xfff8dc, 1.0, 150);
  pointLight1.position.set(-20, 10, 15);
  pointLight1.castShadow = true;
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xe6f3ff, 1.0, 150);
  pointLight2.position.set(20, 10, -15);
  pointLight2.castShadow = true;
  scene.add(pointLight2);

  // Create environment map
  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });

  cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
  scene.add(cubeCamera);

  // Create pyramid group for unified rotation
  pyramidGroup = new THREE.Group();
  scene.add(pyramidGroup);

  // Calculate tetrahedron positions for maximum screen coverage
  const baseRadius = 7; // Distance from center to base vertices
  const height = baseRadius * Math.sqrt(2 / 3) * 2; // Tetrahedron height

  // Perfect tetrahedron positions
  const spherePositions = [
    // Base triangle vertices
    new THREE.Vector3(baseRadius, -height / 4, 0),
    new THREE.Vector3(
      -baseRadius / 2,
      -height / 4,
      (baseRadius * Math.sqrt(3)) / 2
    ),
    new THREE.Vector3(
      -baseRadius / 2,
      -height / 4,
      (-baseRadius * Math.sqrt(3)) / 2
    ),
    // Apex
    new THREE.Vector3(0, (height * 3) / 4, 0),
  ];

  const rotationAxes = [
    new THREE.Vector3(0, 1, 0.3),
    new THREE.Vector3(0.3, 1, 0),
    new THREE.Vector3(-0.3, 1, 0.2),
    new THREE.Vector3(0, 1, -0.3),
  ];

  // Create four sphere systems in pyramid formation
  for (let i = 0; i < NUM_SPHERES; i++) {
    const sphereSystem = new SphereSystem(
      spherePositions[i],
      rotationAxes[i],
      pyramidGroup
    );
    sphereSystem.createSphere();
    sphereSystem.createBalls();
    spheres.push(sphereSystem);
  }

  animate();
}

function animate() {
  animationId = requestAnimationFrame(animate);

  // Smooth pyramid rotation for maximum visual impact
  pyramidRotationY += 0.003; // Primary rotation around Y axis
  pyramidRotationX = Math.sin(pyramidRotationY * 0.3) * 0.2; // Gentle wobble

  pyramidGroup.rotation.y = pyramidRotationY;
  pyramidGroup.rotation.x = pyramidRotationX;
  pyramidGroup.rotation.z = Math.sin(pyramidRotationY * 0.7) * 0.1; // Subtle Z rotation

  // Update environment map occasionally
  if (cubeCamera && animationId % 15 === 0) {
    // Hide all objects temporarily
    spheres.forEach((sphere) => {
      if (sphere.mainSphere) sphere.mainSphere.visible = false;
      sphere.balls.forEach((ball) => {
        if (ball.mesh) ball.mesh.visible = false;
      });
    });

    cubeCamera.position.copy(new THREE.Vector3(0, 0, 0));
    cubeCamera.update(renderer, scene);

    // Show all objects again
    spheres.forEach((sphere) => {
      if (sphere.mainSphere) sphere.mainSphere.visible = true;
      sphere.balls.forEach((ball) => {
        if (ball.mesh) ball.mesh.visible = true;
      });
    });
  }

  // Update each sphere system
  spheres.forEach((sphere) => {
    sphere.update();
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  init();

  // Make toggleSound globally accessible for the existing sound button
  window.toggleAppSound = (enabled) => {
    toggleSound(enabled);
  };

  // Connect to existing sound button if present
  const soundButton = document.querySelector(".sound-toggle-button");
  if (soundButton) {
    let soundEnabled = false;
    soundButton.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      toggleSound(soundEnabled);
      soundButton.textContent = soundEnabled ? "🔊" : "🔇";
      soundButton.title = soundEnabled
        ? "Sound ON - Click to disable"
        : "Sound OFF - Click to enable";
    });
  }
});
