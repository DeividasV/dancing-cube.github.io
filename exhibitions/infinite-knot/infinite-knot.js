/**
 * 3D Infinite Knot Visualization
 * Creates randomly generated 3D knot objects that move smoothly around each other
 * with interactive camera controls
 */

class InfiniteKnot3D {
  constructor() {
    // Audio system - initialize lazily
    this.audioSystem = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientSoundId = null;

    // Get or create canvas
    this.canvas =
      document.getElementById("knotCanvas") ||
      (() => {
        const container = document.getElementById("container");
        if (!container) {
          console.error("Container element not found");
          return null;
        }
        const newCanvas = document.createElement("canvas");
        newCanvas.id = "knotCanvas";
        newCanvas.style.width = "100%";
        newCanvas.style.height = "100%";
        container.appendChild(newCanvas);
        return newCanvas;
      })();

    if (!this.canvas) return;

    this.knots = [];
    this.knotCount = 3;

    // Animation parameters - slower for smoother movement
    this.time = 0;
    this.animationSpeed = 0.005; // Reduced from 0.01 to 0.005

    this.initialize();
    this.hideLoading();
    this.setupEventListeners();
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
        // Start ambient hypnotic atmosphere
        this.ambientSoundId = this.audioSystem.createAmbientDrone(
          65,
          "triangle"
        );
      } else {
        if (this.ambientSoundId) {
          this.audioSystem.stopAmbientSound(this.ambientSoundId);
          this.ambientSoundId = null;
        }
      }
    }
  }

  // Knot transformation sound
  playKnotSound(intensity = 0.3) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 330 + intensity * 220;
    const duration = 0.4;
    const volume = 0.03;

    this.audioSystem.createInteractionSound(
      frequency,
      "sine",
      duration,
      volume
    );
  }

  // Harmonic resonance sound
  playResonanceSound(harmonicRatio = 1.5) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const baseFreq = 220;
    const frequency = baseFreq * harmonicRatio;
    const duration = 0.6;
    const volume = 0.02;

    this.audioSystem.createInteractionSound(
      frequency,
      "triangle",
      duration,
      volume
    );
  }

  initialize() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.generateRandomKnots();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Add subtle fog for depth
    this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 100);
  }

  setupCamera() {
    const aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x0a0a0a, 1);
  }

  setupLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Main directional light for metallic reflections
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Additional lights for better metallic reflections
    const light1 = new THREE.PointLight(0x8b5cf6, 0.8, 40);
    light1.position.set(-15, 8, 5);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0x14b8a6, 0.8, 40);
    light2.position.set(15, -8, 5);
    this.scene.add(light2);

    const light3 = new THREE.PointLight(0xf97316, 0.8, 40);
    light3.position.set(5, 8, -15);
    this.scene.add(light3);

    // Rim light for edge highlighting
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(-10, -10, -5);
    this.scene.add(rimLight);

    // Create environment map for reflections
    this.createEnvironmentMap();
  }

  createEnvironmentMap() {
    // Create a simple cube environment for reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    // Simple gradient environment
    const envScene = new THREE.Scene();
    const envGeometry = new THREE.SphereGeometry(500, 32, 32);
    const envMaterial = new THREE.MeshBasicMaterial({
      color: 0x222244,
      side: THREE.BackSide,
    });
    const envMesh = new THREE.Mesh(envGeometry, envMaterial);
    envScene.add(envMesh);

    cubeCamera.update(this.renderer, envScene);

    // Apply environment map to all knot materials
    this.environmentMap = cubeRenderTarget.texture;
  }

  setupControls() {
    this.controls = {
      mouseDown: false,
      mouseX: 0,
      mouseY: 0,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
      zoom: 15,
    };

    // Mouse controls
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e));
    this.canvas.addEventListener("dblclick", (e) => this.resetCamera());

    // Touch controls for mobile
    this.canvas.addEventListener("touchstart", (e) => this.onTouchStart(e));
    this.canvas.addEventListener("touchmove", (e) => this.onTouchMove(e));
    this.canvas.addEventListener("touchend", (e) => this.onTouchEnd(e));
  }

  generateRandomKnots() {
    // Clear existing knots
    this.knots.forEach((knot) => {
      this.scene.remove(knot.group);
    });
    this.knots = [];

    const colors = [
      { main: 0x8b5cf6 }, // Purple
      { main: 0x14b8a6 }, // Teal
      { main: 0xf97316 }, // Orange
    ];

    for (let i = 0; i < this.knotCount; i++) {
      const knot = this.createRandomKnot(colors[i % colors.length], i);
      this.knots.push(knot);
      this.scene.add(knot.group);
    }
  }

  createRandomKnot(colorScheme, index) {
    const group = new THREE.Group();

    // Random knot parameters - different for each knot, slower speeds
    const params = {
      p: 2 + index, // Different knot types: 2, 3, 4
      q: 3 + index * 2, // Different windings: 3, 5, 7
      speed: 0.2 + Math.random() * 0.3, // Much slower: 0.2-0.5 instead of 0.5-1.5
      offset: Math.random() * Math.PI * 2,
    };

    // Create knot using TorusKnotGeometry with high segment count for smoothness
    const knotGeometry = new THREE.TorusKnotGeometry(
      3, // radius
      1, // tube radius
      200, // radial segments (increased from 100 to 200)
      32, // tubular segments (increased from 16 to 32)
      params.p, // p parameter
      params.q // q parameter
    );

    // Metallic reflective material
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: colorScheme.main,
      metalness: 0.9,
      roughness: 0.1,
      envMap: this.environmentMap,
      envMapIntensity: 1.5,
      transparent: false,
      opacity: 1.0,
    });

    // Create main mesh
    const mainMesh = new THREE.Mesh(knotGeometry, mainMaterial);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;

    group.add(mainMesh);

    // Position knots in a circle around the origin
    const angle = (Math.PI * 2 * index) / this.knotCount;
    const distance = 8;
    group.position.set(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );

    // Random initial rotation
    group.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    return {
      group,
      params,
      mainMesh,
      initialPosition: group.position.clone(),
      orbitRadius: distance,
      orbitSpeed: params.speed * 0.02, // Even slower orbit: 0.02 instead of 0.05
      orbitOffset: params.offset,
    };
  }

  animate() {
    this.time += this.animationSpeed;
    this.updateKnots();
    this.updateCamera();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  updateKnots() {
    this.knots.forEach((knot, index) => {
      // Smooth orbit motion around the center
      const orbitAngle = this.time * knot.orbitSpeed + knot.orbitOffset;
      const x = Math.cos(orbitAngle) * knot.orbitRadius;
      const z = Math.sin(orbitAngle) * knot.orbitRadius;
      const y = Math.sin(this.time * 0.2 + index) * 2; // Slower, gentler vertical oscillation

      knot.group.position.set(x, y, z);

      // Much slower self rotation for smooth movement
      knot.group.rotation.x += 0.003 * knot.params.speed; // Reduced from 0.008
      knot.group.rotation.y += 0.005 * knot.params.speed; // Reduced from 0.012
      knot.group.rotation.z += 0.002 * knot.params.speed; // Reduced from 0.006

      // Very subtle scaling animation
      const scale = 1 + Math.sin(this.time * 1 + index) * 0.08; // Slower and less pronounced
      knot.group.scale.setScalar(scale);
    });
  }

  updateCamera() {
    // Very smooth camera rotation interpolation
    this.controls.currentRotationX +=
      (this.controls.targetRotationX - this.controls.currentRotationX) * 0.03;
    this.controls.currentRotationY +=
      (this.controls.targetRotationY - this.controls.currentRotationY) * 0.03;

    // Apply rotation to camera
    const distance = this.controls.zoom;
    this.camera.position.x =
      Math.sin(this.controls.currentRotationY) *
      Math.cos(this.controls.currentRotationX) *
      distance;
    this.camera.position.y =
      Math.sin(this.controls.currentRotationX) * distance;
    this.camera.position.z =
      Math.cos(this.controls.currentRotationY) *
      Math.cos(this.controls.currentRotationX) *
      distance;

    this.camera.lookAt(0, 0, 0);
  }

  // Mouse event handlers
  onMouseDown(event) {
    this.controls.mouseDown = true;
    this.controls.mouseX = event.clientX;
    this.controls.mouseY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.controls.mouseDown) return;

    const deltaX = event.clientX - this.controls.mouseX;
    const deltaY = event.clientY - this.controls.mouseY;

    this.controls.targetRotationY += deltaX * 0.01;
    this.controls.targetRotationX += deltaY * 0.01;

    // Clamp vertical rotation
    this.controls.targetRotationX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.controls.targetRotationX)
    );

    this.controls.mouseX = event.clientX;
    this.controls.mouseY = event.clientY;
  }

  onMouseUp(event) {
    this.controls.mouseDown = false;
  }

  onWheel(event) {
    event.preventDefault();
    this.controls.zoom += event.deltaY * 0.01;
    this.controls.zoom = Math.max(5, Math.min(50, this.controls.zoom));
  }

  // Touch event handlers
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.controls.mouseDown = true;
      this.controls.mouseX = event.touches[0].clientX;
      this.controls.mouseY = event.touches[0].clientY;
    }
  }

  onTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1 && this.controls.mouseDown) {
      const deltaX = event.touches[0].clientX - this.controls.mouseX;
      const deltaY = event.touches[0].clientY - this.controls.mouseY;

      this.controls.targetRotationY += deltaX * 0.01;
      this.controls.targetRotationX += deltaY * 0.01;

      this.controls.targetRotationX = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.controls.targetRotationX)
      );

      this.controls.mouseX = event.touches[0].clientX;
      this.controls.mouseY = event.touches[0].clientY;
    }
  }

  onTouchEnd(event) {
    this.controls.mouseDown = false;
  }

  resetCamera() {
    this.controls.targetRotationX = 0;
    this.controls.targetRotationY = 0;
    this.controls.zoom = 15;
  }

  hideLoading() {
    const loadingElement = document.querySelector(".loading");
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.opacity = "0";
        setTimeout(() => {}, 500);
      }, 1000);
    }
  }

  setupEventListeners() {
    // Window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    });
  }
}

// Initialize when both DOM and THREE.js are loaded
function initializeKnots() {
  if (typeof THREE !== "undefined" && THREE.Scene) {
    console.log("THREE.js loaded successfully, initializing knots...");
    window.knotInstance = new InfiniteKnot3D();
  } else {
    console.log("Waiting for THREE.js to load...");
    // If THREE.js isn't loaded yet, wait a bit and try again
    setTimeout(initializeKnots, 100);
  }
}

// Try multiple initialization methods to ensure it works
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeKnots);
} else {
  // DOM is already loaded
  initializeKnots();

  // Connect to existing sound button if present
  setTimeout(() => {
    if (window.knotInstance) {
      // Make toggleSound globally accessible
      window.toggleAppSound = (enabled) => {
        if (window.knotInstance) {
          window.knotInstance.toggleSound(enabled);
        }
      };

      const soundButton = document.querySelector(".sound-toggle-button");
      if (soundButton) {
        let soundEnabled = false;
        soundButton.addEventListener("click", () => {
          soundEnabled = !soundEnabled;
          window.knotInstance.toggleSound(soundEnabled);
          soundButton.textContent = soundEnabled ? "🔊" : "🔇";
          soundButton.title = soundEnabled
            ? "Sound ON - Click to disable"
            : "Sound OFF - Click to enable";
        });
      }
    }
  }, 500);
}

// Also try window.onload as backup
window.addEventListener("load", () => {
  if (!window.knotInstance) {
    console.log("Backup initialization attempt...");
    initializeKnots();
  }
});
