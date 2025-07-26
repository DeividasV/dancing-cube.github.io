// Fluid Dynamics Simulation Application
class FluidDynamicsApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fluidSystem = null;
    this.particles = [];
    this.isRunning = true;

    // Fluid simulation parameters
    this.viscosity = 0.03;
    this.particleCount = 5000;
    this.gridSize = 128;
    this.fluidVelocity = new Float32Array(this.gridSize * this.gridSize * 2);
    this.fluidDensity = new Float32Array(this.gridSize * this.gridSize);

    // Mouse interaction
    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, isDown: false };
    this.mouseForce = 100.0;

    // Performance monitoring
    this.frameCount = 0;
    this.lastTime = 0;
    this.fps = 0;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.createFluidSystem();
    this.createParticles();
    this.setupEventListeners();
    this.setupUI();
    this.animate();

    // Hide loading indicator
    const loading = document.querySelector(".loading");
    if (loading) loading.style.display = "none";
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0.0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    document.getElementById("container").appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 50);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.6, 100);
    pointLight.position.set(-10, -10, 10);
    this.scene.add(pointLight);
  }

  createFluidSystem() {
    // Create fluid visualization plane
    const fluidGeometry = new THREE.PlaneGeometry(
      80,
      80,
      this.gridSize - 1,
      this.gridSize - 1
    );

    // Custom shader material for fluid visualization
    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        viscosity: { value: this.viscosity },
        velocityTexture: { value: null },
        densityTexture: { value: null },
        resolution: { value: new THREE.Vector2(this.gridSize, this.gridSize) },
      },
      vertexShader: `
                uniform float time;
                uniform vec2 resolution;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Create wave distortion
                    vec3 pos = position;
                    pos.z += sin(pos.x * 0.1 + time) * 0.5;
                    pos.z += cos(pos.y * 0.1 + time * 1.2) * 0.3;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
      fragmentShader: `
                uniform float time;
                uniform float viscosity;
                uniform vec2 resolution;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                void main() {
                    vec2 uv = vUv;
                    
                    // Create fluid-like patterns
                    float noise1 = sin(uv.x * 10.0 + time * 2.0) * cos(uv.y * 10.0 + time * 1.5);
                    float noise2 = sin(uv.x * 20.0 - time * 1.8) * cos(uv.y * 15.0 + time * 2.2);
                    float noise3 = sin(uv.x * 8.0 + time * 1.2) * sin(uv.y * 12.0 - time * 1.7);
                    
                    float combined = (noise1 + noise2 * 0.5 + noise3 * 0.3) * viscosity * 10.0;
                    
                    // Distance from center for radial effects
                    float dist = distance(uv, vec2(0.5));
                    
                    // Create color based on fluid properties
                    float hue = combined * 0.3 + time * 0.1 + dist * 0.5;
                    float saturation = 0.8 + combined * 0.2;
                    float brightness = 0.3 + abs(combined) * 0.7;
                    
                    vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
                    
                    // Add glow effect
                    float glow = 1.0 - dist * 2.0;
                    glow = max(0.0, glow);
                    color += vec3(0.0, 1.0, 0.5) * glow * 0.3;
                    
                    gl_FragColor = vec4(color, 0.8 + abs(combined) * 0.2);
                }
            `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.fluidSystem = new THREE.Mesh(fluidGeometry, fluidMaterial);
    this.scene.add(this.fluidSystem);
  }

  createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    // Initialize particles randomly
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random positions within the fluid area
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 80;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Initial velocities
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Colors based on position
      const hue = Math.random() * 0.3 + 0.5; // Blue-green range
      colors[i3] = hue;
      colors[i3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i3 + 2] = 0.6 + Math.random() * 0.4;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(velocities, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    // Particle material with custom shader
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointSize: { value: 2.0 },
      },
      vertexShader: `
                uniform float time;
                uniform float pointSize;
                attribute vec3 velocity;
                attribute vec3 color;
                varying vec3 vColor;
                
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                void main() {
                    vColor = hsv2rgb(color);
                    
                    vec3 pos = position;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = pointSize * (1.0 + sin(time + pos.x * 0.1) * 0.5);
                }
            `,
      fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);

    // Store references for updates
    this.particlePositions = positions;
    this.particleVelocities = velocities;
    this.particleColors = colors;
  }

  setupEventListeners() {
    // Mouse events for fluid interaction
    const canvas = this.renderer.domElement;

    canvas.addEventListener("mousedown", (e) => {
      this.mouse.isDown = true;
      this.updateMousePosition(e);
    });

    canvas.addEventListener("mousemove", (e) => {
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.updateMousePosition(e);

      if (this.mouse.isDown) {
        this.addFluidForce();
      }
    });

    canvas.addEventListener("mouseup", () => {
      this.mouse.isDown = false;
    });

    // Touch events for mobile
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.mouse.isDown = true;
      this.updateTouchPosition(e.touches[0]);
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.updateTouchPosition(e.touches[0]);
      this.addFluidForce();
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.mouse.isDown = false;
    });

    // Window resize
    window.addEventListener("resize", () => this.onWindowResize());
  }

  updateMousePosition(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  updateTouchPosition(touch) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
  }

  addFluidForce() {
    const forceX = (this.mouse.x - this.mouse.prevX) * this.mouseForce;
    const forceY = (this.mouse.y - this.mouse.prevY) * this.mouseForce;

    // Apply force to nearby particles
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const px = this.particlePositions[i3] / 40; // Normalize to [-1, 1]
      const py = this.particlePositions[i3 + 1] / 40;

      const dist = Math.sqrt(
        (px - this.mouse.x) ** 2 + (py - this.mouse.y) ** 2
      );

      if (dist < 0.3) {
        const influence = 1.0 - dist / 0.3;
        this.particleVelocities[i3] += forceX * influence * 0.1;
        this.particleVelocities[i3 + 1] += forceY * influence * 0.1;
      }
    }
  }

  setupUI() {
    // Create fluid info display
    const infoDiv = document.createElement("div");
    infoDiv.className = "fluid-info";
    infoDiv.innerHTML = `
            <div>PARTICLES: <span class="value">${this.particleCount}</span></div>
            <div>VISCOSITY: <span class="value">${this.viscosity}</span></div>
            <div>FPS: <span class="value" id="fps">0</span></div>
        `;
    document.body.appendChild(infoDiv);
  }

  updateParticles(deltaTime) {
    if (!this.isRunning) return;

    const damping = 0.98;
    const bounds = 40;

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Update positions
      this.particlePositions[i3] += this.particleVelocities[i3] * deltaTime;
      this.particlePositions[i3 + 1] +=
        this.particleVelocities[i3 + 1] * deltaTime;
      this.particlePositions[i3 + 2] +=
        this.particleVelocities[i3 + 2] * deltaTime;

      // Apply damping
      this.particleVelocities[i3] *= damping;
      this.particleVelocities[i3 + 1] *= damping;
      this.particleVelocities[i3 + 2] *= damping;

      // Boundary conditions
      if (Math.abs(this.particlePositions[i3]) > bounds) {
        this.particleVelocities[i3] *= -0.5;
        this.particlePositions[i3] =
          Math.sign(this.particlePositions[i3]) * bounds;
      }

      if (Math.abs(this.particlePositions[i3 + 1]) > bounds) {
        this.particleVelocities[i3 + 1] *= -0.5;
        this.particlePositions[i3 + 1] =
          Math.sign(this.particlePositions[i3 + 1]) * bounds;
      }

      // Add some turbulence
      this.particleVelocities[i3] += (Math.random() - 0.5) * 0.02;
      this.particleVelocities[i3 + 1] += (Math.random() - 0.5) * 0.02;

      // Update colors based on velocity
      const speed = Math.sqrt(
        this.particleVelocities[i3] ** 2 + this.particleVelocities[i3 + 1] ** 2
      );
      this.particleColors[i3] = (speed * 0.1) % 1.0; // Hue based on speed
    }

    // Update geometry
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) * 0.001;
    this.lastTime = currentTime;

    // Update FPS counter
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1 / deltaTime);
      const fpsElement = document.getElementById("fps");
      if (fpsElement) fpsElement.textContent = this.fps;
    }

    // Update fluid system
    if (this.fluidSystem && this.fluidSystem.material.uniforms) {
      this.fluidSystem.material.uniforms.time.value = currentTime * 0.001;
      this.fluidSystem.material.uniforms.viscosity.value = this.viscosity;
    }

    // Update particles
    if (this.particles && this.particles.material.uniforms) {
      this.particles.material.uniforms.time.value = currentTime * 0.001;
    }

    this.updateParticles(deltaTime);

    // Rotate camera slightly for dynamic view
    this.camera.position.x = Math.sin(currentTime * 0.0005) * 5;
    this.camera.position.y = Math.cos(currentTime * 0.0007) * 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  toggleSimulation() {
    this.isRunning = !this.isRunning;
  }

  resetFluid() {
    // Reset particle positions and velocities
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      this.particlePositions[i3] = (Math.random() - 0.5) * 80;
      this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 80;
      this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 10;

      this.particleVelocities[i3] = (Math.random() - 0.5) * 2;
      this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 2;
      this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  addTurbulence() {
    // Add random forces to particles
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      this.particleVelocities[i3] += (Math.random() - 0.5) * 5;
      this.particleVelocities[i3 + 1] += (Math.random() - 0.5) * 5;
      this.particleVelocities[i3 + 2] += (Math.random() - 0.5) * 2;
    }
  }

  updateViscosity(value) {
    this.viscosity = parseFloat(value);
    const infoElement = document.querySelector(".fluid-info .value");
    if (infoElement) {
      infoElement.nextElementSibling.querySelector(".value").textContent =
        this.viscosity;
    }
  }

  updateParticleCount(value) {
    const newCount = parseInt(value);
    if (newCount !== this.particleCount) {
      // Remove old particles
      this.scene.remove(this.particles);

      // Update count and recreate
      this.particleCount = newCount;
      this.createParticles();

      // Update UI
      const infoElement = document.querySelector(".fluid-info");
      if (infoElement) {
        infoElement.querySelector(".value").textContent = this.particleCount;
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Global variables for compatibility
let app;

function toggleSimulation() {
  if (app) app.toggleSimulation();
}

function resetFluid() {
  if (app) app.resetFluid();
}

function addTurbulence() {
  if (app) app.addTurbulence();
}

function updateViscosity(value) {
  if (app) app.updateViscosity(value);
}

function updateParticleCount(value) {
  if (app) app.updateParticleCount(value);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if Three.js is loaded
  if (typeof THREE === "undefined") {
    console.error("Three.js is not loaded");
    return;
  }

  app = new FluidDynamicsApp();
});
