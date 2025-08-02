// Axis Connect Exhibition - 3D Axis Connections Visualization

class AxisVisualizer {
  constructor() {
    this.initScene();
    this.createConnections();
    this.setupAnimation();
    this.bindEvents();
    this.animate();

    // Remove loading text once initialized
    const loadingElement = document.querySelector(".loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  initScene() {
    // Get container dimensions
    const container = document.getElementById("container");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45, // Reduced FOV for better zoom
      width / height,
      0.1,
      2000
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("canvas3d"),
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Main group for all connections
    this.connectionGroup = new THREE.Group();
    this.scene.add(this.connectionGroup);

    // Camera position - closer for better zoom and space usage
    this.camera.position.set(50, 40, 60);
    this.camera.lookAt(0, 0, 0);

    // Scale factor - larger for better space usage
    this.scale = 32;

    // Handle resize
    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize() {
    const container = document.getElementById("container");
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  createConnections() {
    // Clear existing connections
    while (this.connectionGroup.children.length > 0) {
      this.connectionGroup.remove(this.connectionGroup.children[0]);
    }

    // Material definitions with distinct colors
    this.materials = {
      // X-Y Plane (Red family)
      xyPosPos: new THREE.LineBasicMaterial({
        color: 0xff4757,
        transparent: true,
        opacity: 0.9,
      }),
      xyNegNeg: new THREE.LineBasicMaterial({
        color: 0xc44569,
        transparent: true,
        opacity: 0.8,
      }),
      xyPosNeg: new THREE.LineBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.7,
      }),
      xyNegPos: new THREE.LineBasicMaterial({
        color: 0xf8b500,
        transparent: true,
        opacity: 0.7,
      }),

      // X-Z Plane (Green family)
      xzPosPos: new THREE.LineBasicMaterial({
        color: 0x00d2d3,
        transparent: true,
        opacity: 0.9,
      }),
      xzNegNeg: new THREE.LineBasicMaterial({
        color: 0x0abde3,
        transparent: true,
        opacity: 0.8,
      }),
      xzPosNeg: new THREE.LineBasicMaterial({
        color: 0x00cec9,
        transparent: true,
        opacity: 0.7,
      }),
      xzNegPos: new THREE.LineBasicMaterial({
        color: 0x48dbfb,
        transparent: true,
        opacity: 0.7,
      }),

      // Y-Z Plane (Yellow/Orange family)
      yzPosPos: new THREE.LineBasicMaterial({
        color: 0xfeca57,
        transparent: true,
        opacity: 0.9,
      }),
      yzNegNeg: new THREE.LineBasicMaterial({
        color: 0xff9ff3,
        transparent: true,
        opacity: 0.8,
      }),
      yzPosNeg: new THREE.LineBasicMaterial({
        color: 0xf0932b,
        transparent: true,
        opacity: 0.7,
      }),
      yzNegPos: new THREE.LineBasicMaterial({
        color: 0xeb4d4b,
        transparent: true,
        opacity: 0.7,
      }),
    };

    this.createXYPlane();
    this.createXZPlane();
    this.createYZPlane();
  }

  createXYPlane() {
    // X-Y Plane: Y-axis points to X-axis points

    // Positive Y to Positive X: Y25→X1, Y24→X2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, this.scale - i, 0], // Y-axis point
        [i + 1, 0, 0], // X-axis point
        this.materials.xyPosPos
      );
    }

    // Negative Y to Negative X: Y-25→X-1, Y-24→X-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, -(this.scale - i), 0], // Y-axis point
        [-(i + 1), 0, 0], // X-axis point
        this.materials.xyNegNeg
      );
    }

    // Positive Y to Negative X: Y25→X-1, Y24→X-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, this.scale - i, 0], // Y-axis point
        [-(i + 1), 0, 0], // X-axis point
        this.materials.xyPosNeg
      );
    }

    // Negative Y to Positive X: Y-25→X1, Y-24→X2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, -(this.scale - i), 0], // Y-axis point
        [i + 1, 0, 0], // X-axis point
        this.materials.xyNegPos
      );
    }
  }

  createXZPlane() {
    // X-Z Plane: Z-axis points to X-axis points

    // Positive Z to Positive X: Z25→X1, Z24→X2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, this.scale - i], // Z-axis point
        [i + 1, 0, 0], // X-axis point
        this.materials.xzPosPos
      );
    }

    // Negative Z to Negative X: Z-25→X-1, Z-24→X-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, -(this.scale - i)], // Z-axis point
        [-(i + 1), 0, 0], // X-axis point
        this.materials.xzNegNeg
      );
    }

    // Positive Z to Negative X: Z25→X-1, Z24→X-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, this.scale - i], // Z-axis point
        [-(i + 1), 0, 0], // X-axis point
        this.materials.xzPosNeg
      );
    }

    // Negative Z to Positive X: Z-25→X1, Z-24→X2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, -(this.scale - i)], // Z-axis point
        [i + 1, 0, 0], // X-axis point
        this.materials.xzNegPos
      );
    }
  }

  createYZPlane() {
    // Y-Z Plane: Z-axis points to Y-axis points

    // Positive Z to Positive Y: Z25→Y1, Z24→Y2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, this.scale - i], // Z-axis point
        [0, i + 1, 0], // Y-axis point
        this.materials.yzPosPos
      );
    }

    // Negative Z to Negative Y: Z-25→Y-1, Z-24→Y-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, -(this.scale - i)], // Z-axis point
        [0, -(i + 1), 0], // Y-axis point
        this.materials.yzNegNeg
      );
    }

    // Positive Z to Negative Y: Z25→Y-1, Z24→Y-2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, this.scale - i], // Z-axis point
        [0, -(i + 1), 0], // Y-axis point
        this.materials.yzPosNeg
      );
    }

    // Negative Z to Positive Y: Z-25→Y1, Z-24→Y2, etc.
    for (let i = 0; i < this.scale; i++) {
      this.createConnection(
        [0, 0, -(this.scale - i)], // Z-axis point
        [0, i + 1, 0], // Y-axis point
        this.materials.yzNegPos
      );
    }
  }

  createConnection(point1, point2, material) {
    // Create curved line with multiple segments for bending
    const segments = 20;
    const vertices = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      // Linear interpolation between points
      const x = point1[0] + (point2[0] - point1[0]) * t;
      const y = point1[1] + (point2[1] - point1[1]) * t;
      const z = point1[2] + (point2[2] - point1[2]) * t;

      // Add sinusoidal bending - this will be animated
      const bendX = 0; // Will be modified in animation
      const bendY = 0; // Will be modified in animation
      const bendZ = 0; // Will be modified in animation

      vertices.push(x + bendX, y + bendY, z + bendZ);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );

    const line = new THREE.Line(geometry, material);

    // Store original points for bending calculations
    line.userData = {
      originalPoint1: point1,
      originalPoint2: point2,
      segments: segments,
    };

    this.connectionGroup.add(line);
  }

  setupAnimation() {
    this.time = 0;
    this.animParams = {
      rotSpeed: { x: 0.003, y: 0.004, z: 0.002 },
      waveAmp: 8,
      waveFreq: 0.015,
      zoomAmp: 40,
      zoomSpeed: 0.008,
      moveAmp: 15,
      moveSpeed: 0.006,
      // New bending parameters
      bendAmp: { x: 12, y: 15, z: 10 },
      bendFreq: { x: 0.02, y: 0.025, z: 0.018 },
      bendPhase: { x: 0, y: Math.PI / 3, z: (Math.PI * 2) / 3 },
    };

    // Randomize parameters periodically
    setInterval(() => this.randomizeParams(), 4000 + Math.random() * 6000);
  }

  randomizeParams() {
    this.animParams.rotSpeed.x = 0.001 + Math.random() * 0.006;
    this.animParams.rotSpeed.y = 0.001 + Math.random() * 0.007;
    this.animParams.rotSpeed.z = 0.001 + Math.random() * 0.004;
    this.animParams.waveAmp = 4 + Math.random() * 12;
    this.animParams.waveFreq = 0.008 + Math.random() * 0.025;
    this.animParams.zoomSpeed = 0.004 + Math.random() * 0.015;
    this.animParams.moveAmp = 8 + Math.random() * 20;

    // Randomize bending parameters
    this.animParams.bendAmp.x = 5 + Math.random() * 20;
    this.animParams.bendAmp.y = 5 + Math.random() * 25;
    this.animParams.bendAmp.z = 5 + Math.random() * 18;
    this.animParams.bendFreq.x = 0.01 + Math.random() * 0.03;
    this.animParams.bendFreq.y = 0.01 + Math.random() * 0.04;
    this.animParams.bendFreq.z = 0.01 + Math.random() * 0.035;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.016;

    // Rotate the entire connection group
    this.connectionGroup.rotation.x += this.animParams.rotSpeed.x;
    this.connectionGroup.rotation.y += this.animParams.rotSpeed.y;
    this.connectionGroup.rotation.z += this.animParams.rotSpeed.z;

    // Wave effect on individual lines
    this.connectionGroup.children.forEach((line, index) => {
      const wave =
        Math.sin(this.time * this.animParams.waveFreq + index * 0.15) *
        this.animParams.waveAmp;
      line.position.y = wave * 0.08;
      line.position.x =
        Math.cos(this.time * this.animParams.waveFreq * 0.8 + index * 0.1) *
        this.animParams.waveAmp *
        0.04;
    });

    // Camera zoom and movement
    const zoom =
      100 +
      Math.sin(this.time * this.animParams.zoomSpeed) * this.animParams.zoomAmp;
    this.camera.position.z = zoom;
    this.camera.position.x =
      80 +
      Math.sin(this.time * this.animParams.moveSpeed) * this.animParams.moveAmp;
    this.camera.position.y =
      60 +
      Math.cos(this.time * this.animParams.moveSpeed * 0.7) *
        this.animParams.moveAmp *
        0.6;

    // Dynamic look-at with slight movement
    const lookX = Math.sin(this.time * 0.004) * 8;
    const lookY = Math.cos(this.time * 0.005) * 6;
    this.camera.lookAt(lookX, lookY, 0);

    // Scale pulsing
    const scale = 1 + Math.sin(this.time * 0.01) * 0.15;
    this.connectionGroup.scale.set(scale, scale, scale);

    // Color animation for some materials
    Object.values(this.materials).forEach((material, index) => {
      if (index % 4 === 0) {
        const hue = (this.time * 0.02 + index * 0.2) % 1;
        material.color.setHSL(hue, 0.8, 0.6);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  bindEvents() {
    // Window resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Click interaction
    window.addEventListener("click", () => {
      this.randomizeParams();

      // Random rotation burst
      this.connectionGroup.rotation.x += (Math.random() - 0.5) * 3;
      this.connectionGroup.rotation.y += (Math.random() - 0.5) * 3;
      this.connectionGroup.rotation.z += (Math.random() - 0.5) * 3;

      // Random position shift
      this.connectionGroup.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );

      // Reset position smoothly
      setTimeout(() => {
        this.connectionGroup.position.set(0, 0, 0);
      }, 1500);
    });
  }
}

// Initialize the visualization
function init() {
  // Hide loading indicator
  setTimeout(() => {
    const loading = document.querySelector(".loading");
    if (loading) loading.style.display = "none";
  }, 2000);

  // Initialize the axis visualizer
  new AxisVisualizer();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
