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
    this.CUBE_SIZE = 0.8;
    this.SPACING = 1;

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

    // 3D Text for ASCII display - separate for each axis
    this.textMeshX = null;
    this.textMeshY = null;
    this.textMeshZ = null;
    this.textUpdateCounter = 0;
    this.textUpdateInterval = 15; // Update every 15 frames

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.createGrid();
    this.createMovingCubes();
    this.setup3DText();
    this.setupEventListeners();
    this.animate();

    // Hide loading indicator
    const loading = document.querySelector(".loading");
    if (loading) loading.style.display = "none";
  }

  setupScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x111111);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("container").appendChild(this.renderer.domElement);

    // Camera position
    this.camera.position.set(15, 15, 15);
    this.camera.lookAt(0, 0, 0);
  }

  setup3DText() {
    // Create 3D text displays for X, Y, Z axes
    this.createAxisText("X", "Initializing...", "x");
    this.createAxisText("Y", "Initializing...", "y");
    this.createAxisText("Z", "Initializing...", "z");
  }

  createAxisText(axis, text, axisType) {
    // Remove existing text mesh if it exists
    const meshName = `textMesh${axis}`;
    if (this[meshName]) {
      this.scene.remove(this[meshName]);
    }

    // Create text using canvas texture approach for better performance
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set canvas size - very large for crisp text
    canvas.width = 2048;
    canvas.height = 512;

    // Clear canvas with slight background for better visibility
    context.fillStyle = "rgba(0, 0, 0, 0.4)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Define colors for each axis
    let axisColor = "#ffffff";
    switch (axisType) {
      case "x":
        axisColor = "#ff6b6b";
        break; // Red for X
      case "y":
        axisColor = "#4ecdc4";
        break; // Teal for Y
      case "z":
        axisColor = "#45b7d1";
        break; // Blue for Z
    }

    // Draw axis label
    context.fillStyle = axisColor;
    context.font = 'bold 80px "Arial", sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(`${axis}-AXIS:`, canvas.width / 2, 120);

    // Draw ASCII text - bigger and more prominent
    context.fillStyle = "#ffffff";
    context.font = 'bold 160px "Courier New", monospace';
    context.fillText(text, canvas.width / 2, 320);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create material with better visibility
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    // Create plane geometry - very large
    const geometry = new THREE.PlaneGeometry(25, 6);

    // Create mesh
    const textMesh = new THREE.Mesh(geometry, material);

    // Position based on axis - further out for better visibility
    switch (axisType) {
      case "x":
        textMesh.position.set(18, 0, 0); // Right side for X axis
        textMesh.rotation.y = -Math.PI / 2; // Face toward center
        break;
      case "y":
        textMesh.position.set(0, 18, 0); // Top for Y axis
        textMesh.rotation.x = Math.PI / 2; // Face down
        break;
      case "z":
        textMesh.position.set(0, 0, 18); // Front for Z axis
        // No rotation needed, faces camera
        break;
    }

    // Add to scene (not grid group so it doesn't rotate)
    this.scene.add(textMesh);
    this[meshName] = textMesh;
  }

  update3DText() {
    // Update less frequently to avoid performance issues
    this.textUpdateCounter++;
    if (this.textUpdateCounter >= this.textUpdateInterval) {
      this.textUpdateCounter = 0;

      // Get current ASCII characters from cubes for each axis
      const asciiData = this.getAxisAsciiChars();

      // Update each axis text display
      if (asciiData.x) {
        this.createAxisText("X", asciiData.x, "x");
      }
      if (asciiData.y) {
        this.createAxisText("Y", asciiData.y, "y");
      }
      if (asciiData.z) {
        this.createAxisText("Z", asciiData.z, "z");
      }
    }
  }

  getAxisAsciiChars() {
    let xChars = "";
    let yChars = "";
    let zChars = "";

    // Process each cube's position to generate ASCII characters for each axis
    this.movingCubes.forEach((cube) => {
      // Convert position to ASCII character (32-126 range for printable chars)
      const xChar = String.fromCharCode(
        32 + Math.floor((cube.position.x / this.GRID_SIZE) * 94)
      );
      const yChar = String.fromCharCode(
        32 + Math.floor((cube.position.y / this.GRID_SIZE) * 94)
      );
      const zChar = String.fromCharCode(
        32 + Math.floor((cube.position.z / this.GRID_SIZE) * 94)
      );

      xChars += xChar;
      yChars += yChar;
      zChars += zChar;
    });

    return {
      x: xChars,
      y: yChars,
      z: zChars,
    };
  }

  getCurrentAsciiChars() {
    let asciiString = "";

    // Process each cube's position to generate ASCII characters
    this.movingCubes.forEach((cube) => {
      // Convert position to ASCII character (32-126 range for printable chars)
      const xChar = String.fromCharCode(
        32 + Math.floor((cube.position.x / this.GRID_SIZE) * 94)
      );
      const yChar = String.fromCharCode(
        32 + Math.floor((cube.position.y / this.GRID_SIZE) * 94)
      );
      const zChar = String.fromCharCode(
        32 + Math.floor((cube.position.z / this.GRID_SIZE) * 94)
      );

      asciiString += xChar + yChar + zChar;
    });

    return asciiString;
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
      const cube = new MovingCube(this.GRID_SIZE, this.CUBE_SIZE, this.SPACING);
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

    // Update 3D text
    this.update3DText();

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
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

class MovingCube {
  constructor(gridSize, cubeSize, spacing) {
    this.gridSize = gridSize;
    this.cubeSize = cubeSize;
    this.spacing = spacing;

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
      shininess: 100,
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
      this.velocity.x = -this.velocity.x * (0.9 + Math.random() * 0.2);
      this.velocity.y += (Math.random() - 0.5) * 0.01;
      this.velocity.z += (Math.random() - 0.5) * 0.01;
      this.position.x = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.x)
      );
      this.changeColor();
    }

    if (this.position.y <= 0 || this.position.y >= this.gridSize - 1) {
      this.velocity.y = -this.velocity.y * (0.9 + Math.random() * 0.2);
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.z += (Math.random() - 0.5) * 0.01;
      this.position.y = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.y)
      );
      this.changeColor();
    }

    if (this.position.z <= 0 || this.position.z >= this.gridSize - 1) {
      this.velocity.z = -this.velocity.z * (0.9 + Math.random() * 0.2);
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.y += (Math.random() - 0.5) * 0.01;
      this.position.z = Math.max(
        0,
        Math.min(this.gridSize - 1, this.position.z)
      );
      this.changeColor();
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

function togglePause() {
  if (app) app.togglePause();
}

function resetCubes() {
  if (app) app.resetCubes();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if Three.js is loaded
  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded");
    return;
  }

  app = new BouncingCubesApp();
});
