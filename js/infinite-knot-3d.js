/**
 * 3D Infinite Knot Visualization
 * Creates randomly generated 3D knot objects that move smoothly around each other
 * with interactive camera controls
 */

class InfiniteKnot3D {
  constructor() {
    this.canvas = document.getElementById("knotCanvas");
    this.isPaused = false;
    this.knots = [];
    this.knotCount = 3;

    // Animation parameters
    this.time = 0;
    this.animationSpeed = 0.01;

    this.initialize();
    this.hideLoading();
    this.setupEventListeners();
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
    const aspect = window.innerWidth / window.innerHeight;
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x0a0a0a, 1);
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Colored accent lights
    const light1 = new THREE.PointLight(0x8b5cf6, 0.6, 20);
    light1.position.set(-10, 5, 0);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0x14b8a6, 0.6, 20);
    light2.position.set(10, -5, 0);
    this.scene.add(light2);

    const light3 = new THREE.PointLight(0xf97316, 0.6, 20);
    light3.position.set(0, 5, -10);
    this.scene.add(light3);
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
      { main: 0x8b5cf6, glow: 0xc4b5fd }, // Purple
      { main: 0x14b8a6, glow: 0x5eead4 }, // Teal
      { main: 0xf97316, glow: 0xfed7aa }, // Orange
      { main: 0xef4444, glow: 0xfca5a5 }, // Red
      { main: 0x3b82f6, glow: 0x93c5fd }, // Blue
    ];

    for (let i = 0; i < this.knotCount; i++) {
      const knot = this.createRandomKnot(colors[i % colors.length]);
      this.knots.push(knot);
      this.scene.add(knot.group);
    }
  }

  createRandomKnot(colorScheme) {
    const group = new THREE.Group();

    // Random knot parameters
    const params = {
      p: Math.floor(Math.random() * 5) + 2, // 2-6
      q: Math.floor(Math.random() * 5) + 3, // 3-7
      segments: 200 + Math.floor(Math.random() * 100), // 200-300
      radius: 0.1 + Math.random() * 0.2, // 0.1-0.3
      scale: 1 + Math.random() * 2, // 1-3
      speed: 0.5 + Math.random() * 1.5, // 0.5-2
      offset: Math.random() * Math.PI * 2,
    };

    // Generate knot geometry
    const knotGeometry = this.generateKnotGeometry(params);

    // Main knot material
    const mainMaterial = new THREE.MeshPhongMaterial({
      color: colorScheme.main,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });

    // Glow material
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: colorScheme.glow,
      transparent: true,
      opacity: 0.3,
    });

    // Create main mesh
    const mainMesh = new THREE.Mesh(knotGeometry, mainMaterial);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;

    // Create glow mesh (slightly larger)
    const glowGeometry = this.generateKnotGeometry({
      ...params,
      radius: params.radius * 1.5,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

    group.add(glowMesh);
    group.add(mainMesh);

    // Random initial position and rotation
    const angle = Math.PI * 2 * Math.random();
    const distance = 3 + Math.random() * 4;
    group.position.set(
      Math.cos(angle) * distance,
      (Math.random() - 0.5) * 4,
      Math.sin(angle) * distance
    );

    group.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    return {
      group,
      params,
      mainMesh,
      glowMesh,
      initialPosition: group.position.clone(),
      orbitRadius: distance,
      orbitSpeed: params.speed * 0.1,
      orbitOffset: params.offset,
    };
  }

  generateKnotGeometry(params) {
    const points = [];
    const { p, q, segments, radius, scale } = params;

    // Generate knot curve points
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2 * q;

      // Torus knot parametric equations
      const x = (2 + Math.cos(p * t)) * Math.cos(q * t) * scale;
      const y = (2 + Math.cos(p * t)) * Math.sin(q * t) * scale;
      const z = Math.sin(p * t) * scale;

      points.push(new THREE.Vector3(x, y, z));
    }

    // Create tube geometry from points
    const curve = new THREE.CatmullRomCurve3(points, true);
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      segments,
      radius,
      8,
      true
    );

    return tubeGeometry;
  }

  animate() {
    if (!this.isPaused) {
      this.time += this.animationSpeed;
      this.updateKnots();
      this.updateCamera();
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  updateKnots() {
    this.knots.forEach((knot, index) => {
      // Orbit motion
      const orbitAngle = this.time * knot.orbitSpeed + knot.orbitOffset;
      const x = Math.cos(orbitAngle) * knot.orbitRadius;
      const z = Math.sin(orbitAngle) * knot.orbitRadius;
      const y = Math.sin(this.time * 0.5 + index) * 2;

      knot.group.position.set(x, y, z);

      // Self rotation
      knot.group.rotation.x += 0.005 * knot.params.speed;
      knot.group.rotation.y += 0.008 * knot.params.speed;
      knot.group.rotation.z += 0.003 * knot.params.speed;

      // Subtle scaling animation
      const scale = 1 + Math.sin(this.time * 2 + index) * 0.1;
      knot.group.scale.setScalar(scale);

      // Adjust glow opacity based on distance from camera
      const distance = knot.group.position.distanceTo(this.camera.position);
      knot.glowMesh.material.opacity = Math.max(0.1, 0.5 - distance * 0.02);
    });
  }

  updateCamera() {
    // Smooth camera rotation interpolation
    this.controls.currentRotationX +=
      (this.controls.targetRotationX - this.controls.currentRotationX) * 0.05;
    this.controls.currentRotationY +=
      (this.controls.targetRotationY - this.controls.currentRotationY) * 0.05;

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

  togglePause() {
    this.isPaused = !this.isPaused;
    const button = document.getElementById("pauseBtn");
    button.textContent = this.isPaused ? "Play" : "Pause";
  }

  regenerateKnots() {
    this.generateRandomKnots();
  }

  hideLoading() {
    const loadingElement = document.querySelector(".loading");
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.opacity = "0";
        setTimeout(() => {
          loadingElement.style.display = "none";
        }, 500);
      }, 1000);
    }
  }

  setupEventListeners() {
    // Control buttons
    document.getElementById("regenerateBtn").addEventListener("click", () => {
      this.regenerateKnots();
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      this.togglePause();
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.knotInstance = new InfiniteKnot3D();
});
