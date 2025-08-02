/**
 * 3D Infinite Knot Visualization
 * Creates randomly generated 3D knot objects that move smoothly around each other
 * with interactive camera controls
 */

class InfiniteKnot3D {
  constructor() {
    this.canvas = document.getElementById("knotCanvas");
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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Colored accent lights
    const light1 = new THREE.PointLight(0x8b5cf6, 1.0, 30);
    light1.position.set(-10, 5, 0);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0x14b8a6, 1.0, 30);
    light2.position.set(10, -5, 0);
    this.scene.add(light2);

    const light3 = new THREE.PointLight(0xf97316, 1.0, 30);
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

    // Random knot parameters - different for each knot
    const params = {
      p: 2 + index, // Different knot types: 2, 3, 4
      q: 3 + index * 2, // Different windings: 3, 5, 7
      speed: 0.5 + Math.random() * 1.0,
      offset: Math.random() * Math.PI * 2,
    };

    // Create knot using TorusKnotGeometry - this is reliable and visible
    const knotGeometry = new THREE.TorusKnotGeometry(
      3, // radius
      1, // tube radius
      100, // radial segments
      16, // tubular segments
      params.p, // p parameter
      params.q // q parameter
    );

    // Main knot material
    const mainMaterial = new THREE.MeshPhongMaterial({
      color: colorScheme.main,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
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
      orbitSpeed: params.speed * 0.05,
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
      // Orbit motion around the center
      const orbitAngle = this.time * knot.orbitSpeed + knot.orbitOffset;
      const x = Math.cos(orbitAngle) * knot.orbitRadius;
      const z = Math.sin(orbitAngle) * knot.orbitRadius;
      const y = Math.sin(this.time * 0.5 + index) * 3; // Vertical oscillation

      knot.group.position.set(x, y, z);

      // Self rotation
      knot.group.rotation.x += 0.008 * knot.params.speed;
      knot.group.rotation.y += 0.012 * knot.params.speed;
      knot.group.rotation.z += 0.006 * knot.params.speed;

      // Subtle scaling animation
      const scale = 1 + Math.sin(this.time * 2 + index) * 0.15;
      knot.group.scale.setScalar(scale);
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
    // Window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.knotInstance = new InfiniteKnot3D();
});
