// Fluid Dynamics Simulation Application

// Simple AudioSystem fallback if the framework version isn't available
class AudioSystem {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.effectsGain = null;
    this.ambientSources = new Map();
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      this.masterGain = this.context.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.context.currentTime);
      this.masterGain.connect(this.context.destination);

      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.setValueAtTime(0.4, this.context.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.effectsGain = this.context.createGain();
      this.effectsGain.gain.setValueAtTime(0.6, this.context.currentTime);
      this.effectsGain.connect(this.masterGain);

      this.isInitialized = true;
      console.log("🎵 AudioSystem initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize audio system:", error);
      this.enabled = false;
    }
  }

  async toggle(enabled) {
    this.enabled = enabled;

    if (enabled) {
      if (!this.isInitialized) {
        await this.init();
      }

      if (this.context && this.context.state === "suspended") {
        await this.context.resume();
      }

      console.log("🔊 Audio enabled");
    } else {
      console.log("🔇 Audio disabled");
    }
  }

  createAmbientDrone(frequency = 80, type = "sawtooth") {
    if (!this.enabled || !this.context) return null;

    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gainNode = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(frequency * 2, this.context.currentTime);
    filter.Q.setValueAtTime(2, this.context.currentTime);

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.context.currentTime + 2);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ambientGain);

    oscillator.start();

    const id = "ambient_drone_" + Date.now();
    this.ambientSources.set(id, { oscillator, gainNode, filter });

    return id;
  }

  createInteractionSound(
    frequency,
    type = "sine",
    duration = 0.1,
    volume = 0.1
  ) {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(frequency * 2, this.context.currentTime);

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume,
      this.context.currentTime + 0.01
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + duration
    );

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.effectsGain);

    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  playTone(frequency, duration = 0.1, type = "sine", options = {}) {
    if (!this.enabled || !this.context) return null;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.type = type;

    const gain = options.gain || 0.1;
    const fadeTime = options.fadeTime || 0.01;

    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      gain,
      this.context.currentTime + fadeTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + duration - fadeTime
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);

    return { oscillator, gainNode };
  }

  stopAmbientSound(id) {
    const source = this.ambientSources.get(id);
    if (!source) return;

    source.gainNode.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + 0.5
    );
    setTimeout(() => {
      source.oscillator.stop();
      this.ambientSources.delete(id);
    }, 500);
  }
}

class FluidDynamicsApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fluidSystem = null;
    this.particles = [];
    this.isRunning = true;

    // Audio system - initialize lazily
    this.audioSystem = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientSoundId = null;

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
    this.lastTime = 0;

    // Camera tracking for audio
    this.lastCameraPosition = { x: 0, y: 0, z: 50 };
    this.cameraMovementTimer = 0;
    this.visualIntensityTimer = 0;
    this.depthSoundTimer = 0;

    // Enhanced visual effects
    this.flowTrails = [];
    this.vortexCenters = [];
    this.turbulenceAreas = [];

    this.init();
  }

  // Audio control methods
  async toggleSound(enabled) {
    console.log("FluidDynamicsApp toggleSound called with:", enabled);

    // Initialize AudioSystem lazily
    if (!this.audioSystem && typeof AudioSystem !== "undefined") {
      console.log("Initializing AudioSystem...");
      this.audioSystem = new AudioSystem();
      await this.audioSystem.init();
      console.log("AudioSystem initialized:", this.audioSystem);
    }

    this.soundEnabled = enabled;
    console.log("Sound enabled set to:", this.soundEnabled);

    if (this.audioSystem) {
      await this.audioSystem.toggle(enabled);
      console.log("AudioSystem toggled to:", enabled);

      if (enabled) {
        // Start ambient underwater-like sound
        console.log("Creating ambient drone...");
        this.ambientSoundId = this.audioSystem.createAmbientDrone(
          60,
          "sawtooth"
        );
        console.log("Ambient sound ID:", this.ambientSoundId);
      } else {
        // Stop ambient sound
        if (this.ambientSoundId) {
          console.log("Stopping ambient sound:", this.ambientSoundId);
          this.audioSystem.stopAmbientSound(this.ambientSoundId);
          this.ambientSoundId = null;
        }
      }
    } else {
      console.error("AudioSystem not available");
    }
  }

  // Enhanced fluid interaction sound
  playFluidSound(frequency = 300, velocity = 0.1) {
    console.log(
      "playFluidSound called with frequency:",
      frequency,
      "velocity:",
      velocity
    );
    if (!this.soundEnabled || !this.audioSystem) {
      console.log("Sound disabled or no audio system");
      return;
    }

    const adjustedFreq = frequency + (Math.random() - 0.5) * 100;
    const duration = 0.05 + velocity * 0.1;
    const volume = Math.min(0.02 + velocity * 0.03, 0.05);

    console.log("Playing interaction sound:", adjustedFreq, duration, volume);
    this.audioSystem.createInteractionSound(
      adjustedFreq,
      "sine",
      duration,
      volume
    );
  }

  // Create a boundary collision sound
  playBoundarySound(velocity = 0.1) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 150 + Math.random() * 100;
    const duration = 0.15;
    const volume = Math.min(0.02 + velocity * 0.04, 0.06);

    this.audioSystem.createInteractionSound(
      frequency,
      "triangle",
      duration,
      volume
    );
  }

  // Create a turbulence sound
  playTurbulenceSound() {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 200 + Math.random() * 200;
    const duration = 0.3;
    const volume = 0.08;

    this.audioSystem.createInteractionSound(
      frequency,
      "sawtooth",
      duration,
      volume
    );
  }

  // Create ambient camera movement sound
  playCameraMovementSound(intensity = 0.1) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const baseFreq = 220 + intensity * 80;
    this.audioSystem.createInteractionSound(
      baseFreq,
      "sine",
      1.5,
      Math.min(0.01 + intensity * 0.02, 0.03)
    );
  }

  // Create depth perception sound for zoom
  playDepthSound(depth = 0.5) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 100 + depth * 150;
    this.audioSystem.createInteractionSound(
      frequency,
      "triangle",
      0.8,
      Math.min(0.008 + depth * 0.015, 0.025)
    );
  }

  // Create visual intensity sound based on particle density
  playVisualIntensitySound(intensity = 0.5) {
    if (!this.soundEnabled || !this.audioSystem) return;

    const frequency = 800 + intensity * 400;
    this.audioSystem.createInteractionSound(
      frequency,
      "sine",
      0.4,
      Math.min(0.005 + intensity * 0.01, 0.015)
    );
  }

  init() {
    this.setupScene();
    this.setupLighting();
    this.createFluidSystem();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    console.log("Setting up scene...");
    this.scene = new THREE.Scene();

    // Get the exhibition container dimensions
    const container = document.getElementById("container");

    console.log("Container:", container);

    if (!container) {
      console.error("Container element not found");
      console.log("Available elements:", {
        containerById: document.getElementById("container"),
        exhibitionFrame: document.querySelector(".exhibition-frame"),
        topMenu: document.querySelector(".top-menu"),
        exhibitionContainer: document.querySelector(".exhibition-container"),
      });
      return;
    }

    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    console.log("Container dimensions:", width, height);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0.0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Append renderer to container
    container.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 50);
    console.log("Scene setup complete");
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
    // Get container dimensions to scale fluid plane appropriately
    const container = document.querySelector(".exhibition-frame");
    let containerWidth = 100;
    let containerHeight = 100;

    if (container) {
      containerWidth = Math.max(container.offsetWidth * 0.1, 100);
      containerHeight = Math.max(container.offsetHeight * 0.1, 100);
    }

    // Create fluid visualization plane that scales with container
    const fluidGeometry = new THREE.PlaneGeometry(
      containerWidth,
      containerHeight,
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

    // Get container dimensions for particle bounds
    const container = document.querySelector(".exhibition-frame");
    let containerWidth = 80;
    let containerHeight = 80;

    if (container) {
      containerWidth = Math.max(container.offsetWidth * 0.1, 80);
      containerHeight = Math.max(container.offsetHeight * 0.1, 80);
    }

    // Initialize particles randomly
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random positions within the fluid area (scaled to container)
      positions[i3] = (Math.random() - 0.5) * containerWidth;
      positions[i3 + 1] = (Math.random() - 0.5) * containerHeight;
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

    let interactionStrength = 0;
    let interactionCount = 0;

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

        interactionStrength += influence;
        interactionCount++;
      }
    }

    // Play fluid interaction sound based on interaction strength
    if (interactionCount > 0 && Math.random() < 0.1) {
      // 10% chance to avoid too many sounds
      const avgInfluence = interactionStrength / interactionCount;
      const mouseSpeed = Math.sqrt(forceX * forceX + forceY * forceY) * 0.01;
      this.playFluidSound(250 + avgInfluence * 100, mouseSpeed);
    }
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
        const oldVel = Math.abs(this.particleVelocities[i3]);
        this.particleVelocities[i3] *= -0.5;
        this.particlePositions[i3] =
          Math.sign(this.particlePositions[i3]) * bounds;

        // Play boundary sound occasionally
        if (oldVel > 1 && Math.random() < 0.05) {
          this.playBoundarySound(oldVel * 0.1);
        }
      }

      if (Math.abs(this.particlePositions[i3 + 1]) > bounds) {
        const oldVel = Math.abs(this.particleVelocities[i3 + 1]);
        this.particleVelocities[i3 + 1] *= -0.5;
        this.particlePositions[i3 + 1] =
          Math.sign(this.particlePositions[i3 + 1]) * bounds;

        // Play boundary sound occasionally
        if (oldVel > 1 && Math.random() < 0.05) {
          this.playBoundarySound(oldVel * 0.1);
        }
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

    // Calculate camera movement for ambient sounds
    const newCameraX = Math.sin(currentTime * 0.0005) * 5;
    const newCameraY = Math.cos(currentTime * 0.0007) * 3;

    // Track camera movement intensity
    const cameraMovement = Math.sqrt(
      (newCameraX - this.lastCameraPosition.x) ** 2 +
        (newCameraY - this.lastCameraPosition.y) ** 2
    );

    this.lastCameraPosition.x = newCameraX;
    this.lastCameraPosition.y = newCameraY;

    // Rotate camera slightly for dynamic view
    this.camera.position.x = newCameraX;
    this.camera.position.y = newCameraY;
    this.camera.lookAt(0, 0, 0);

    // Trigger view-related sounds at intervals
    this.cameraMovementTimer += deltaTime;
    this.visualIntensityTimer += deltaTime;
    this.depthSoundTimer += deltaTime;

    // Ambient camera movement sound (every 8-12 seconds)
    if (this.cameraMovementTimer > 8 + Math.random() * 4) {
      this.playCameraMovementSound(cameraMovement * 20);
      this.cameraMovementTimer = 0;
    }

    // Visual intensity sound based on particle activity (every 6-10 seconds)
    if (this.visualIntensityTimer > 6 + Math.random() * 4) {
      // Calculate average particle velocity for intensity
      let totalVelocity = 0;
      for (let i = 0; i < this.particleCount; i++) {
        const i3 = i * 3;
        totalVelocity += Math.sqrt(
          this.particleVelocities[i3] ** 2 +
            this.particleVelocities[i3 + 1] ** 2
        );
      }
      const avgVelocity = totalVelocity / this.particleCount;
      this.playVisualIntensitySound(Math.min(avgVelocity * 0.1, 1.0));
      this.visualIntensityTimer = 0;
    }

    // Depth perception sound (every 10-15 seconds)
    if (this.depthSoundTimer > 10 + Math.random() * 5) {
      // Use camera z-distance relative to origin for depth perception
      const depth = Math.abs(this.camera.position.z - 50) / 20;
      this.playDepthSound(Math.min(depth, 1.0));
      this.depthSoundTimer = 0;
    }

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

    // Play turbulence sound
    this.playTurbulenceSound();
  }

  updateViscosity(value) {
    this.viscosity = parseFloat(value);
  }

  updateParticleCount(value) {
    const newCount = parseInt(value);
    if (newCount !== this.particleCount) {
      // Remove old particles
      this.scene.remove(this.particles);

      // Update count and recreate
      this.particleCount = newCount;
      this.createParticles();
    }
  }

  onWindowResize() {
    const container = document.getElementById("container");
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Global variables for compatibility
let app;

// Toggle sound function for the button
window.toggleAppSound = async function () {
  console.log("toggleAppSound called");
  if (app) {
    const newState = !app.soundEnabled;
    console.log("Toggling sound to:", newState);
    await app.toggleSound(newState);

    // Update button state
    const soundButton = document.querySelector(".sound-toggle-button");
    if (soundButton) {
      soundButton.textContent = newState ? "🔊" : "🔇";
      soundButton.title = newState
        ? "Sound ON - Click to disable"
        : "Sound OFF - Click to enable";
    }

    // Play confirmation sound
    if (newState) {
      console.log("Playing confirmation sound");
      setTimeout(() => {
        app.playFluidSound(440, 0.3);
        // Also try a simple test tone
        if (app.audioSystem && app.audioSystem.enabled) {
          console.log("Playing test tone");
          app.audioSystem.playTone(880, 0.5, "sine", { gain: 0.1 });
        }
      }, 200);
    }
  }
};

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

  // AudioSystem is now defined locally in this file, so we can proceed
  console.log("AudioSystem available:", typeof AudioSystem !== "undefined");
  console.log("AudioSystem:", AudioSystem);

  // Add a delay to ensure all elements are rendered and CSS is applied
  setTimeout(() => {
    console.log("Initializing FluidDynamicsApp...");
    app = new FluidDynamicsApp();

    // Make toggleSound globally accessible for the existing sound button
    window.toggleAppSound = async (enabled) => {
      if (app) {
        await app.toggleSound(enabled);
      }
    };

    // Connect to existing sound button if present
    const soundButton = document.querySelector(".sound-toggle-button");
    if (soundButton) {
      let soundEnabled = false;
      soundButton.addEventListener("click", async () => {
        soundEnabled = !soundEnabled;
        await app.toggleSound(soundEnabled);
        soundButton.textContent = soundEnabled ? "🔊" : "🔇";
        soundButton.title = soundEnabled
          ? "Sound ON - Click to disable"
          : "Sound OFF - Click to enable";
      });
    }
  }, 500);
});
