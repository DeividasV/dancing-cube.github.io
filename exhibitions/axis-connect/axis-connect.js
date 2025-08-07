// Axis Connect Exhibition - 3D Axis Connections Visualization

class AxisVisualizer {
  constructor() {
    this.initScene();
    this.createConnections();
    this.setupAnimation();
    this.bindEvents();
    this.animate();
  }

  initScene() {
    // Get container dimensions
    this.container = document.getElementById("container");
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60, // Increased FOV to show more of the structure
      width / height,
      0.1,
      2000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle color space based on Three.js version
    if (this.renderer.outputEncoding !== undefined) {
      this.renderer.outputEncoding = THREE.sRGBEncoding; // Legacy
    } else if (this.renderer.outputColorSpace !== undefined) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Modern
    }

    // Handle tone mapping based on Three.js version
    if (THREE.ACESFilmicToneMapping !== undefined) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    }

    this.renderer.setClearColor(0x000000, 0); // Transparent background
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Append renderer to container
    this.container.appendChild(this.renderer.domElement);

    // Add simple mouse interaction instead of OrbitControls
    this.mouseInteraction = {
      isMouseDown: false,
      mouseX: 0,
      mouseY: 0,
      rotationX: 0,
      rotationY: 0,
      targetRotationX: 0,
      targetRotationY: 0,
      lastInteractionTime: -10, // Start with old time to prevent immediate auto-movement
    };

    this.setupMouseInteraction();

    // Main group for all connections
    this.connectionGroup = new THREE.Group();
    this.scene.add(this.connectionGroup);

    // Camera position - positioned to show full structure
    this.camera.position.set(120, 80, 140);
    this.camera.lookAt(0, 0, 0);

    // Scale factor - adjusted for better screen fit
    this.scale = 24;

    // Animation clock for proper timing
    this.clock = new THREE.Clock();

    // Setup resize observer for better responsiveness
    this.setupResizeObserver();

    // Handle resize
    window.addEventListener("resize", () => this.handleResize());
  }

  setupMouseInteraction() {
    // Mouse interaction for camera control
    this.renderer.domElement.addEventListener("mousedown", (event) => {
      this.mouseInteraction.isMouseDown = true;
      this.mouseInteraction.mouseX = event.clientX;
      this.mouseInteraction.mouseY = event.clientY;
    });

    document.addEventListener("mousemove", (event) => {
      if (this.mouseInteraction.isMouseDown) {
        const deltaX = event.clientX - this.mouseInteraction.mouseX;
        const deltaY = event.clientY - this.mouseInteraction.mouseY;

        this.mouseInteraction.targetRotationY += deltaX * 0.01;
        this.mouseInteraction.targetRotationX += deltaY * 0.01;
        this.mouseInteraction.lastInteractionTime = this.time;

        this.mouseInteraction.mouseX = event.clientX;
        this.mouseInteraction.mouseY = event.clientY;
      }
    });

    document.addEventListener("mouseup", () => {
      this.mouseInteraction.isMouseDown = false;
      this.mouseInteraction.lastInteractionTime = this.time;
    });

    // Scroll zoom
    this.renderer.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      const zoom = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(zoom);
      this.camera.position.clampLength(80, 300); // Adjusted range for better structure viewing
      this.mouseInteraction.lastInteractionTime = this.time; // Update interaction time
    });
  }

  setupResizeObserver() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }
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
    // Clear existing connections with proper disposal
    while (this.connectionGroup.children.length > 0) {
      const obj = this.connectionGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
      this.connectionGroup.remove(obj);
    }

    // Material definitions with corrected color semantics
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

      // X-Z Plane (Blue family - corrected from "Green")
      xzPosPos: new THREE.LineBasicMaterial({
        color: 0x3742fa,
        transparent: true,
        opacity: 0.9,
      }),
      xzNegNeg: new THREE.LineBasicMaterial({
        color: 0x2f3542,
        transparent: true,
        opacity: 0.8,
      }),
      xzPosNeg: new THREE.LineBasicMaterial({
        color: 0x5352ed,
        transparent: true,
        opacity: 0.7,
      }),
      xzNegPos: new THREE.LineBasicMaterial({
        color: 0x40407a,
        transparent: true,
        opacity: 0.7,
      }),

      // Y-Z Plane (Green family - corrected)
      yzPosPos: new THREE.LineBasicMaterial({
        color: 0x2ed573,
        transparent: true,
        opacity: 0.9,
      }),
      yzNegNeg: new THREE.LineBasicMaterial({
        color: 0x1e824c,
        transparent: true,
        opacity: 0.8,
      }),
      yzPosNeg: new THREE.LineBasicMaterial({
        color: 0x7bed9f,
        transparent: true,
        opacity: 0.7,
      }),
      yzNegPos: new THREE.LineBasicMaterial({
        color: 0x5f27cd,
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
    const tValues = []; // Store parameter t for each vertex

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      tValues.push(t);

      // Linear interpolation between points
      const x = point1[0] + (point2[0] - point1[0]) * t;
      const y = point1[1] + (point2[1] - point1[1]) * t;
      const z = point1[2] + (point2[2] - point1[2]) * t;

      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(vertices), 3)
    );
    geometry.setAttribute(
      "t",
      new THREE.BufferAttribute(new Float32Array(tValues), 1)
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
      // New bending parameters - more subtle for better structure visibility
      bendAmp: { x: 8, y: 10, z: 6 },
      bendFreq: { x: 0.015, y: 0.02, z: 0.012 },
      bendPhase: { x: 0, y: Math.PI / 3, z: (Math.PI * 2) / 3 },
    };

    // Randomize parameters periodically with proper cleanup
    this.randomizeInterval = setInterval(
      () => this.randomizeParams(),
      4000 + Math.random() * 6000
    );
  }

  randomizeParams() {
    this.animParams.rotSpeed.x = 0.001 + Math.random() * 0.006;
    this.animParams.rotSpeed.y = 0.001 + Math.random() * 0.007;
    this.animParams.rotSpeed.z = 0.001 + Math.random() * 0.004;
    this.animParams.waveAmp = 4 + Math.random() * 12;
    this.animParams.waveFreq = 0.008 + Math.random() * 0.025;
    this.animParams.zoomSpeed = 0.004 + Math.random() * 0.015;
    this.animParams.moveAmp = 8 + Math.random() * 20;

    // Randomize bending parameters - keep them more controlled
    this.animParams.bendAmp.x = 4 + Math.random() * 12;
    this.animParams.bendAmp.y = 6 + Math.random() * 16;
    this.animParams.bendAmp.z = 3 + Math.random() * 10;
    this.animParams.bendFreq.x = 0.008 + Math.random() * 0.02;
    this.animParams.bendFreq.y = 0.01 + Math.random() * 0.025;
    this.animParams.bendFreq.z = 0.006 + Math.random() * 0.018;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Use proper delta time from clock
    const deltaTime = this.clock.getDelta();
    this.time += deltaTime;

    // Update mouse interaction (smooth damping)
    this.mouseInteraction.rotationX +=
      (this.mouseInteraction.targetRotationX -
        this.mouseInteraction.rotationX) *
      0.05;
    this.mouseInteraction.rotationY +=
      (this.mouseInteraction.targetRotationY -
        this.mouseInteraction.rotationY) *
      0.05;

    // Apply mouse rotation to camera
    const radius = this.camera.position.length();
    this.camera.position.x =
      radius *
      Math.sin(this.mouseInteraction.rotationY) *
      Math.cos(this.mouseInteraction.rotationX);
    this.camera.position.y = radius * Math.sin(this.mouseInteraction.rotationX);
    this.camera.position.z =
      radius *
      Math.cos(this.mouseInteraction.rotationY) *
      Math.cos(this.mouseInteraction.rotationX);

    // Rotate the entire connection group
    this.connectionGroup.rotation.x += this.animParams.rotSpeed.x;
    this.connectionGroup.rotation.y += this.animParams.rotSpeed.y;
    this.connectionGroup.rotation.z += this.animParams.rotSpeed.z;

    // Animate per-vertex bending for actual curves
    this.connectionGroup.children.forEach((line, index) => {
      const pos = line.geometry.getAttribute("position");
      const t = line.geometry.getAttribute("t");
      const { originalPoint1: a, originalPoint2: b } = line.userData;

      for (let i = 0; i < pos.count; i++) {
        const u = t.getX(i);

        // Linear interpolation between original points
        const x = a[0] + (b[0] - a[0]) * u;
        const y = a[1] + (b[1] - a[1]) * u;
        const z = a[2] + (b[2] - a[2]) * u;

        // Sinusoidal bend orthogonal to the segment
        // Fade bend at endpoints using u * (1 - u)
        const bendIntensity = u * (1 - u) * 4; // Peak at u=0.5

        const bendX =
          Math.sin(
            this.time * this.animParams.bendFreq.x +
              u * Math.PI * 2 +
              index * 0.1
          ) *
          this.animParams.bendAmp.x *
          bendIntensity;
        const bendY =
          Math.sin(
            this.time * this.animParams.bendFreq.y +
              u * Math.PI * 3 +
              index * 0.15
          ) *
          this.animParams.bendAmp.y *
          bendIntensity;
        const bendZ =
          Math.sin(
            this.time * this.animParams.bendFreq.z +
              u * Math.PI * 1.5 +
              index * 0.08
          ) *
          this.animParams.bendAmp.z *
          bendIntensity;

        pos.setXYZ(i, x + bendX, y + bendY, z + bendZ);
      }
      pos.needsUpdate = true;
    });

    // Wave effect on individual lines (reduced for subtlety)
    this.connectionGroup.children.forEach((line, index) => {
      const wave =
        Math.sin(this.time * this.animParams.waveFreq + index * 0.15) *
        this.animParams.waveAmp;
      line.position.y = wave * 0.04; // Reduced amplitude
      line.position.x =
        Math.cos(this.time * this.animParams.waveFreq * 0.8 + index * 0.1) *
        this.animParams.waveAmp *
        0.02; // Reduced amplitude
    });

    // Camera zoom and movement (automatic when not interacting)
    const timeSinceInteraction =
      this.time - this.mouseInteraction.lastInteractionTime;

    if (!this.mouseInteraction.isMouseDown) {
      // Only start automatic movement after user has interacted and then stopped
      if (
        timeSinceInteraction > 3.0 &&
        this.mouseInteraction.lastInteractionTime > 0
      ) {
        // Subtle automatic orbital movement instead of accumulating rotation
        const autoRotationY = Math.sin(this.time * 0.0003) * 0.2; // Gentle oscillation
        const autoRotationX = Math.cos(this.time * 0.0002) * 0.1; // Slower vertical movement

        // Gradually blend to automatic movement
        const blendFactor = Math.min((timeSinceInteraction - 3.0) / 2.0, 1.0); // Blend over 2 seconds
        this.mouseInteraction.targetRotationY +=
          (autoRotationY - this.mouseInteraction.targetRotationY) *
          blendFactor *
          0.02;
        this.mouseInteraction.targetRotationX +=
          (autoRotationX - this.mouseInteraction.targetRotationX) *
          blendFactor *
          0.02;
      }

      // Gentle zoom breathing
      const breathingZoom = 1 + Math.sin(this.time * 0.001) * 0.03; // Reduced breathing
      const baseRadius = 150; // Increased base distance to show full structure
      const currentRadius = this.camera.position.length();
      const targetRadius = baseRadius * breathingZoom;
      const newRadius = currentRadius + (targetRadius - currentRadius) * 0.02;
      this.camera.position.normalize().multiplyScalar(newRadius);
    }

    // Always look at center
    this.camera.lookAt(0, 0, 0);

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
      const newWidth = this.container.offsetWidth;
      const newHeight = this.container.offsetHeight;

      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    });

    // Click interaction
    window.addEventListener("click", () => {
      this.randomizeParams();

      // Random rotation burst (smoother)
      this.connectionGroup.rotation.x += (Math.random() - 0.5) * 1.5;
      this.connectionGroup.rotation.y += (Math.random() - 0.5) * 1.5;
      this.connectionGroup.rotation.z += (Math.random() - 0.5) * 1.5;

      // Random position shift (reduced)
      this.connectionGroup.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );

      // Reset position smoothly
      setTimeout(() => {
        this.connectionGroup.position.set(0, 0, 0);
      }, 1500);
    });
  }

  // Cleanup method for proper disposal
  dispose() {
    // Clear animation interval
    if (this.randomizeInterval) {
      clearInterval(this.randomizeInterval);
    }

    // Dispose of geometry and materials
    this.connectionGroup.children.forEach((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });

    // Dispose of resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Dispose of renderer
    this.renderer.dispose();
  }
}

// Initialize the visualization
function init() {
  // Initialize the axis visualizer
  new AxisVisualizer();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
