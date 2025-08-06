// 3D Bouncing Cubes Application
class BouncingCubesApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.gridGroup = null;
    this.movingCubes = [];
    this.isPaused = false;

    // Configuration
    this.GRID_SIZE = 8;
    this.CUBE_SIZE = 2.5;
    this.SPACING = 3.0;

    // Audio system - initialize lazily
    this.audioSystem = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientSoundId = null;

    // Mouse controls
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.isMouseDown = false;

    // Auto rotation
    this.autoRotationX = Math.random() * 0.002 - 0.001;
    this.autoRotationY = Math.random() * 0.002 - 0.001;
    this.autoRotationZ = Math.random() * 0.002 - 0.001;

    this.init();
  }

  // Audio control
  toggleSound(enabled) {
    // Initialize AudioSystem lazily
    if (!this.audioSystem && typeof AudioSystem !== "undefined") {
      this.audioSystem = new AudioSystem();
    }

    this.soundEnabled = enabled;

    if (this.audioSystem) {
      this.audioSystem.toggle(enabled);

      if (enabled) {
        // Start ambient quantum atmosphere
        this.ambientSoundId = this.audioSystem.createAmbientDrone(
          100,
          "square"
        );
      } else {
        if (this.ambientSoundId) {
          this.audioSystem.stopAmbientSound(this.ambientSoundId);
          this.ambientSoundId = null;
        }
      }
    }
  }

  // Create a subtle collision sound
  playCollisionSound(velocity = 0.1) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 220 + Math.random() * 110;
    const duration = 0.15;
    const volume = Math.min(0.05 + velocity * 0.1, 0.15);

    this.audioSystem.createInteractionSound(
      frequency,
      "square",
      duration,
      volume
    );
  }

  // Quantum phase sound
  playQuantumSound(phase = 0.5) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 440 + phase * 220;
    const duration = 0.3;
    const volume = 0.04;

    this.audioSystem.createInteractionSound(
      frequency,
      "triangle",
      duration,
      volume
    );
  }

  // Create a wall bounce sound (slightly different tone)
  playWallBounceSound(velocity = 0.1) {
    if (!this.soundEnabled) return;

    // Use framework audio system if available
    if (this.audioSystem && this.audioSystem.playTone) {
      const frequency = 330 + Math.random() * 140;
      const duration = 0.12;
      const volume = Math.min(0.04 + velocity * 0.08, 0.12);
      this.audioSystem.playTone(frequency, duration, "sine", volume);
      return;
    }
    // Fallback to basic audio implementation
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const baseFrequency = 330 + Math.random() * 140;
      oscillator.frequency.setValueAtTime(
        baseFrequency,
        this.audioContext.currentTime
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFrequency * 0.7,
        this.audioContext.currentTime + 0.08
      );

      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filterNode.Q.setValueAtTime(0.8, this.audioContext.currentTime);

      const volume = Math.min(0.04 + velocity * 0.08, 0.12);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.005
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.12
      );

      oscillator.type = "sine";
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.12);
    } catch (e) {
      // Silent fail
    }
  }

  // Toggle sound on/off
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;

    // Update button visual state
    const soundButton = document.querySelector(".sound-toggle-button");
    if (soundButton) {
      soundButton.textContent = this.soundEnabled ? "🔊" : "🔇";
      soundButton.title = this.soundEnabled
        ? "Sound ON - Click to mute"
        : "Sound OFF - Click to enable";
    }

    // Resume audio context if enabling sound
    if (
      this.soundEnabled &&
      this.audioContext &&
      this.audioContext.state === "suspended"
    ) {
      this.audioContext.resume();
    }

    // Play a test sound when enabling
    if (this.soundEnabled) {
      setTimeout(() => this.playCollisionSound(0.3), 100);
    }
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.createGrid();
    this.createMovingCubes();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    // Scene setup
    this.scene = new THREE.Scene();

    // Get container dimensions with fallback
    const container = document.getElementById("container");
    if (!container) {
      console.error("Container element not found");
      return;
    }

    const containerWidth = container.offsetWidth || window.innerWidth;
    const containerHeight = container.offsetHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(
      60, // Reduced FOV to make cubes appear larger
      containerWidth / containerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setClearColor(0x111111);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Camera position - adjusted for 8x8x8 grid with larger spacing
    this.camera.position.set(40, 35, 40);
    this.camera.lookAt(0, 0, 0);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  createGrid() {
    this.gridGroup = new THREE.Group();

    // Create wireframe grid with transparency for hollow effect
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.15,
    });

    // Draw selective grid lines for hollow effect
    for (let i = 0; i <= this.GRID_SIZE; i++) {
      for (let j = 0; j <= this.GRID_SIZE; j++) {
        // Only draw outer edge lines and some sparse internal lines
        const isEdge =
          i === 0 || i === this.GRID_SIZE || j === 0 || j === this.GRID_SIZE;
        const isSparse = i % 2 === 0 && j % 2 === 0;

        if (isEdge || (isSparse && Math.random() > 0.6)) {
          // X-direction lines
          const geometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING,
              (-this.GRID_SIZE / 2) * this.SPACING
            ),
            new THREE.Vector3(
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING,
              (this.GRID_SIZE / 2) * this.SPACING
            ),
          ]);
          this.gridGroup.add(new THREE.Line(geometry1, wireframeMaterial));
        }

        if (isEdge || (isSparse && Math.random() > 0.6)) {
          // Y-direction lines
          const geometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (-this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING
            ),
            new THREE.Vector3(
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING
            ),
          ]);
          this.gridGroup.add(new THREE.Line(geometry2, wireframeMaterial));
        }

        if (isEdge || (isSparse && Math.random() > 0.6)) {
          // Z-direction lines
          const geometry3 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (-this.GRID_SIZE / 2) * this.SPACING,
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING
            ),
            new THREE.Vector3(
              (this.GRID_SIZE / 2) * this.SPACING,
              (i - this.GRID_SIZE / 2) * this.SPACING,
              (j - this.GRID_SIZE / 2) * this.SPACING
            ),
          ]);
          this.gridGroup.add(new THREE.Line(geometry3, wireframeMaterial));
        }
      }
    }

    this.scene.add(this.gridGroup);
  }

  createMovingCubes() {
    for (let i = 0; i < 8; i++) {
      const cube = new MovingCube(
        this.GRID_SIZE,
        this.CUBE_SIZE,
        this.SPACING,
        this
      );
      this.gridGroup.add(cube.mesh);
      this.movingCubes.push(cube);
    }
  }

  setupEventListeners() {
    // Mouse events
    this.renderer.domElement.addEventListener("mousedown", (e) =>
      this.onMouseDown(e)
    );
    this.renderer.domElement.addEventListener("mousemove", (e) =>
      this.onMouseMove(e)
    );
    this.renderer.domElement.addEventListener("mouseup", () =>
      this.onMouseUp()
    );

    // Window resize
    window.addEventListener("resize", () => this.onWindowResize());

    // Initialize sound button state
    setTimeout(() => {
      const soundButton = document.querySelector(".sound-toggle-button");
      if (soundButton) {
        soundButton.textContent = this.soundEnabled ? "🔊" : "🔇";
        soundButton.title = this.soundEnabled
          ? "Sound ON - Click to mute"
          : "Sound OFF - Click to enable";
      }
    }, 100);
  }

  checkCollisions() {
    for (let i = 0; i < this.movingCubes.length; i++) {
      for (let j = i + 1; j < this.movingCubes.length; j++) {
        const cube1 = this.movingCubes[i];
        const cube2 = this.movingCubes[j];

        const distance = Math.sqrt(
          Math.pow(cube1.position.x - cube2.position.x, 2) +
            Math.pow(cube1.position.y - cube2.position.y, 2) +
            Math.pow(cube1.position.z - cube2.position.z, 2)
        );

        if (distance < 1.2) {
          // Calculate collision normal
          const nx = (cube2.position.x - cube1.position.x) / distance;
          const ny = (cube2.position.y - cube1.position.y) / distance;
          const nz = (cube2.position.z - cube1.position.z) / distance;

          // Relative velocity
          const rvx = cube2.velocity.x - cube1.velocity.x;
          const rvy = cube2.velocity.y - cube1.velocity.y;
          const rvz = cube2.velocity.z - cube1.velocity.z;

          // Relative velocity along normal
          const speedAlongNormal = rvx * nx + rvy * ny + rvz * nz;

          if (speedAlongNormal > 0) continue;

          // Collision response with mutations
          const restitution = 0.8 + Math.random() * 0.4;
          const impulse = (2 * speedAlongNormal) / 2;

          cube1.velocity.x += impulse * nx * restitution;
          cube1.velocity.y += impulse * ny * restitution;
          cube1.velocity.z += impulse * nz * restitution;

          cube2.velocity.x -= impulse * nx * restitution;
          cube2.velocity.y -= impulse * ny * restitution;
          cube2.velocity.z -= impulse * nz * restitution;

          // Add random mutations
          const mutationStrength = 0.02;
          cube1.velocity.x += (Math.random() - 0.5) * mutationStrength;
          cube1.velocity.y += (Math.random() - 0.5) * mutationStrength;
          cube1.velocity.z += (Math.random() - 0.5) * mutationStrength;

          cube2.velocity.x += (Math.random() - 0.5) * mutationStrength;
          cube2.velocity.y += (Math.random() - 0.5) * mutationStrength;
          cube2.velocity.z += (Math.random() - 0.5) * mutationStrength;

          // Change colors on collision
          cube1.changeColor();
          cube2.changeColor();

          // Play collision sound based on impact velocity
          const impactVelocity = Math.abs(speedAlongNormal);
          this.playCollisionSound(impactVelocity);

          // Separate cubes to prevent overlap
          const overlap = 1.2 - distance;
          const separationX = nx * overlap * 0.5;
          const separationY = ny * overlap * 0.5;
          const separationZ = nz * overlap * 0.5;

          cube1.position.x -= separationX;
          cube1.position.y -= separationY;
          cube1.position.z -= separationZ;

          cube2.position.x += separationX;
          cube2.position.y += separationY;
          cube2.position.z += separationZ;
        }
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update moving cubes
    this.movingCubes.forEach((cube) => cube.update(this.isPaused));

    // Check for collisions
    this.checkCollisions();

    // Auto rotation of the entire grid
    if (!this.isMouseDown) {
      this.gridGroup.rotation.x += this.autoRotationX;
      this.gridGroup.rotation.y += this.autoRotationY;
      this.gridGroup.rotation.z += this.autoRotationZ;

      // Occasionally change rotation direction
      if (Math.random() < 0.001) {
        this.autoRotationX += (Math.random() - 0.5) * 0.0005;
        this.autoRotationY += (Math.random() - 0.5) * 0.0005;
        this.autoRotationZ += (Math.random() - 0.5) * 0.0005;

        // Clamp rotation speeds
        this.autoRotationX = Math.max(
          -0.003,
          Math.min(0.003, this.autoRotationX)
        );
        this.autoRotationY = Math.max(
          -0.003,
          Math.min(0.003, this.autoRotationY)
        );
        this.autoRotationZ = Math.max(
          -0.003,
          Math.min(0.003, this.autoRotationZ)
        );
      }
    }

    // Mouse rotation
    if (this.isMouseDown) {
      this.gridGroup.rotation.y +=
        (this.targetRotationY - this.gridGroup.rotation.y) * 0.05;
      this.gridGroup.rotation.x +=
        (this.targetRotationX - this.gridGroup.rotation.x) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  onMouseDown(event) {
    this.isMouseDown = true;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  onMouseMove(event) {
    if (this.isMouseDown) {
      const deltaX = event.clientX - this.mouseX;
      const deltaY = event.clientY - this.mouseY;

      this.targetRotationY = this.gridGroup.rotation.y + deltaX * 0.01;
      this.targetRotationX = this.gridGroup.rotation.x + deltaY * 0.01;

      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  resetCubes() {
    // Remove existing cubes
    this.movingCubes.forEach((cube) => {
      this.gridGroup.remove(cube.mesh);
    });
    this.movingCubes = [];

    // Create new cubes
    this.createMovingCubes();
  }

  onWindowResize() {
    const container = document.getElementById("container");
    const containerWidth = container.offsetWidth || window.innerWidth;
    const containerHeight = container.offsetHeight || window.innerHeight;

    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);
  }
}

class MovingCube {
  constructor(gridSize, cubeSize, spacing, app) {
    this.gridSize = gridSize;
    this.cubeSize = cubeSize;
    this.spacing = spacing;
    this.app = app; // Reference to main app for sound effects

    this.position = {
      x: Math.random() * (gridSize - 1),
      y: Math.random() * (gridSize - 1),
      z: Math.random() * (gridSize - 1),
    };

    this.velocity = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1,
    };

    this.currentColor = {
      h: Math.random(),
      s: 0.8,
      l: 0.6,
    };
    this.targetColor = { ...this.currentColor };

    // Create cube mesh
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(
        this.currentColor.h,
        this.currentColor.s,
        this.currentColor.l
      ),
      shininess: 300,
      specular: 0xffffff,
      reflectivity: 0.9,
      transparent: true,
      opacity: 0.8,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
  }

  changeColor() {
    this.targetColor = {
      h: Math.random(),
      s: 0.7 + Math.random() * 0.3,
      l: 0.5 + Math.random() * 0.3,
    };
  }

  updateColor() {
    const lerpSpeed = 0.02;
    this.currentColor.h +=
      (this.targetColor.h - this.currentColor.h) * lerpSpeed;
    this.currentColor.s +=
      (this.targetColor.s - this.currentColor.s) * lerpSpeed;
    this.currentColor.l +=
      (this.targetColor.l - this.currentColor.l) * lerpSpeed;

    // Handle hue wraparound
    if (Math.abs(this.targetColor.h - this.currentColor.h) > 0.5) {
      if (this.targetColor.h > this.currentColor.h) {
        this.currentColor.h += 1;
      } else {
        this.currentColor.h -= 1;
      }
    }

    // Normalize hue
    this.currentColor.h = ((this.currentColor.h % 1) + 1) % 1;

    // Update mesh color
    this.mesh.material.color.setHSL(
      this.currentColor.h,
      this.currentColor.s,
      this.currentColor.l
    );
  }

  updateMeshPosition() {
    this.mesh.position.set(
      (this.position.x - this.gridSize / 2 + 0.5) * this.spacing,
      (this.position.y - this.gridSize / 2 + 0.5) * this.spacing,
      (this.position.z - this.gridSize / 2 + 0.5) * this.spacing
    );
  }

  update(isPaused) {
    if (isPaused) return;

    this.updateColor();

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;

    // Wall collision detection
    if (this.position.x <= 0 || this.position.x >= this.gridSize - 1) {
      const oldVelocity = Math.abs(this.velocity.x);
      this.velocity.x = -this.velocity.x * (0.9 + Math.random() * 0.2);
      this.velocity.y += (Math.random() - 0.5) * 0.01;
      this.velocity.z += (Math.random() - 0.5) * 0.01;
      this.position.x = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.x)
      );
      this.changeColor();
      // Play wall bounce sound
      if (this.app) this.app.playWallBounceSound(oldVelocity);
    }

    if (this.position.y <= 0 || this.position.y >= this.gridSize - 1) {
      const oldVelocity = Math.abs(this.velocity.y);
      this.velocity.y = -this.velocity.y * (0.9 + Math.random() * 0.2);
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.z += (Math.random() - 0.5) * 0.01;
      this.position.y = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.y)
      );
      this.changeColor();
      // Play wall bounce sound
      if (this.app) this.app.playWallBounceSound(oldVelocity);
    }

    if (this.position.z <= 0 || this.position.z >= this.gridSize - 1) {
      const oldVelocity = Math.abs(this.velocity.z);
      this.velocity.z = -this.velocity.z * (0.9 + Math.random() * 0.2);
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.y += (Math.random() - 0.5) * 0.01;
      this.position.z = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.z)
      );
      this.changeColor();
      // Play wall bounce sound
      if (this.app) this.app.playWallBounceSound(oldVelocity);
    }

    // Speed limiting
    const maxSpeed = 0.15;
    const speed = Math.sqrt(
      this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2
    );
    if (speed > maxSpeed) {
      this.velocity.x = (this.velocity.x / speed) * maxSpeed;
      this.velocity.y = (this.velocity.y / speed) * maxSpeed;
      this.velocity.z = (this.velocity.z / speed) * maxSpeed;
    }

    this.updateMeshPosition();
  }
}

// Global variables for compatibility
let app;

// Toggle sound function for the button
window.toggleAppSound = function () {
  if (app) {
    app.toggleSound();
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if Three.js is loaded
  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded");
    return;
  }

  // Wait a bit for the DOM to be ready
  setTimeout(() => {
    const container = document.getElementById("container");
    if (container) {
      app = new BouncingCubesApp();

      // Make toggleSound globally accessible for the existing sound button
      window.toggleAppSound = (enabled) => {
        if (app) {
          app.toggleSound(enabled);
        }
      };

      // Connect to existing sound button if present
      const soundButton = document.querySelector(".sound-toggle-button");
      if (soundButton) {
        let soundEnabled = false;
        soundButton.addEventListener("click", () => {
          soundEnabled = !soundEnabled;
          app.toggleSound(soundEnabled);
          soundButton.textContent = soundEnabled ? "🔊" : "🔇";
          soundButton.title = soundEnabled
            ? "Sound ON - Click to disable"
            : "Sound OFF - Click to enable";
        });
      }
    } else {
      console.error("Container element not found for quantum-bounce");
    }
  }, 200);
});
