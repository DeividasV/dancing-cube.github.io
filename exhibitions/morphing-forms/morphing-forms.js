// M0RPH1N_F0RMS - 3D Morphing Shapes Simulation

// Get container and set up scene
const container = document.getElementById("container");
if (!container) {
  console.error("Container element not found");
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

// Append renderer to container
if (container) {
  container.appendChild(renderer.domElement);
}

// Container-based sizing
function resizeCanvas() {
  const width = container.offsetWidth || window.innerWidth;
  const height = container.offsetHeight || window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== AUDIO SYSTEM =====
class MorphingAudioSystem {
  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);

      this.soundEnabled = false; // Default OFF
      this.oscillators = new Set(); // Track active oscillators
      this.ambientOscillators = [];
      this.isAmbientPlaying = false;

      console.log("🎵 Morphing Audio System initialized");
    } catch (error) {
      console.warn("Audio not supported:", error);
      this.audioContext = null;
    }
  }

  // Core tone generation with organic wave shapes
  playTone(frequency, duration = 0.3, type = "sine", volume = 0.1) {
    if (!this.audioContext || !this.soundEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Organic envelope for fluid morphing sounds
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      this.oscillators.add(oscillator);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      oscillator.onended = () => {
        this.oscillators.delete(oscillator);
      };
    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  }

  // Frequency sweep for morphing effects
  playSweep(startFreq, endFreq, duration = 1.0, volume = 0.08) {
    if (!this.audioContext || !this.soundEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.type = "triangle"; // Organic wave shape
      oscillator.frequency.setValueAtTime(
        startFreq,
        this.audioContext.currentTime
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        endFreq,
        this.audioContext.currentTime + duration
      );

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.05
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      this.oscillators.add(oscillator);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      oscillator.onended = () => {
        this.oscillators.delete(oscillator);
      };
    } catch (error) {
      console.warn("Sweep playback error:", error);
    }
  }

  // Multi-layered ambient background for space morphing
  startBackgroundAmbient() {
    if (!this.audioContext || !this.soundEnabled || this.isAmbientPlaying)
      return;

    try {
      this.isAmbientPlaying = true;

      // Deep space drone (very low frequency)
      const drone1 = this.audioContext.createOscillator();
      const droneGain1 = this.audioContext.createGain();
      drone1.connect(droneGain1);
      droneGain1.connect(this.masterGain);
      drone1.type = "sawtooth";
      drone1.frequency.setValueAtTime(40, this.audioContext.currentTime);
      droneGain1.gain.setValueAtTime(0, this.audioContext.currentTime);
      droneGain1.gain.exponentialRampToValueAtTime(
        0.03,
        this.audioContext.currentTime + 2
      );

      // Morphing texture (mid frequency with slow modulation)
      const drone2 = this.audioContext.createOscillator();
      const droneGain2 = this.audioContext.createGain();
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();

      drone2.connect(droneGain2);
      droneGain2.connect(this.masterGain);
      lfo.connect(lfoGain);
      lfoGain.connect(drone2.frequency);

      drone2.type = "triangle";
      drone2.frequency.setValueAtTime(120, this.audioContext.currentTime);
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.3, this.audioContext.currentTime);
      lfoGain.gain.setValueAtTime(15, this.audioContext.currentTime);

      droneGain2.gain.setValueAtTime(0, this.audioContext.currentTime);
      droneGain2.gain.exponentialRampToValueAtTime(
        0.025,
        this.audioContext.currentTime + 3
      );

      // High frequency sparkle layer
      const drone3 = this.audioContext.createOscillator();
      const droneGain3 = this.audioContext.createGain();
      const lfo2 = this.audioContext.createOscillator();
      const lfoGain2 = this.audioContext.createGain();

      drone3.connect(droneGain3);
      droneGain3.connect(this.masterGain);
      lfo2.connect(lfoGain2);
      lfoGain2.connect(droneGain3.gain);

      drone3.type = "sine";
      drone3.frequency.setValueAtTime(800, this.audioContext.currentTime);
      lfo2.type = "sine";
      lfo2.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
      lfoGain2.gain.setValueAtTime(0.01, this.audioContext.currentTime);

      droneGain3.gain.setValueAtTime(0.015, this.audioContext.currentTime);

      this.ambientOscillators = [
        { osc: drone1, gain: droneGain1 },
        { osc: drone2, gain: droneGain2 },
        { osc: drone3, gain: droneGain3 },
        { osc: lfo, gain: lfoGain },
        { osc: lfo2, gain: lfoGain2 },
      ];

      this.ambientOscillators.forEach(({ osc }) => {
        osc.start(this.audioContext.currentTime);
      });

      console.log("🌊 Ambient morphing soundscape started");
    } catch (error) {
      console.warn("Ambient audio error:", error);
      this.isAmbientPlaying = false;
    }
  }

  stopBackgroundAmbient() {
    if (!this.isAmbientPlaying || !this.audioContext) return;

    try {
      this.ambientOscillators.forEach(({ osc, gain }) => {
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 1
        );
        osc.stop(this.audioContext.currentTime + 1.1);
      });

      this.ambientOscillators = [];
      this.isAmbientPlaying = false;

      console.log("🌊 Ambient soundscape stopped");
    } catch (error) {
      console.warn("Error stopping ambient:", error);
    }
  }

  // Morphing-specific sound effects
  playMergeSound(baseSize) {
    const frequency = 200 + baseSize * 50; // Size affects pitch
    this.playSweep(frequency, frequency * 1.5, 0.8, 0.06);
    console.log(`🔗 Merge sound: ${frequency.toFixed(0)}Hz`);
  }

  playSplitSound(baseSize) {
    const frequency = 400 + baseSize * 40;
    this.playSweep(frequency, frequency * 0.6, 0.6, 0.05);
    console.log(`✂️ Split sound: ${frequency.toFixed(0)}Hz`);
  }

  playColorChangeSound() {
    const frequency = 600 + Math.random() * 400;
    this.playTone(frequency, 0.2, "triangle", 0.04);
  }

  playShapeSpawnSound() {
    const frequency = 300 + Math.random() * 200;
    this.playSweep(frequency, frequency * 1.8, 0.5, 0.05);
  }

  // Sound toggle functionality
  toggleSound() {
    if (!this.audioContext) {
      console.warn("Audio not available");
      return;
    }

    this.soundEnabled = !this.soundEnabled;

    const button = document.querySelector(".sound-toggle-button");
    if (button) {
      if (this.soundEnabled) {
        button.innerHTML = "🔊";
        button.title = "Sound ON - Click to disable";

        // Confirmation sound - organic morphing chord
        this.playTone(440, 0.2, "triangle", 0.08);
        setTimeout(() => this.playTone(550, 0.2, "triangle", 0.06), 100);
        setTimeout(() => this.playTone(660, 0.3, "triangle", 0.04), 200);

        // Start ambient after brief delay
        setTimeout(() => this.startBackgroundAmbient(), 1000);

        console.log("🎵 Morphing audio ENABLED");
      } else {
        button.innerHTML = "🔇";
        button.title = "Sound OFF - Click to enable";
        this.stopBackgroundAmbient();
        console.log("🔇 Morphing audio DISABLED");
      }
    }
  }

  // Cleanup method
  destroy() {
    this.stopBackgroundAmbient();
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.oscillators.clear();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
  }
}

// Initialize audio system
const morphingAudio = new MorphingAudioSystem();

// Connect to global toggle function
window.toggleAppSound = () => morphingAudio.toggleSound();

renderer.setClearColor(0x000000, 0);

// Space background with stars
function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 2000;
    positions[i + 1] = (Math.random() - 0.5) * 2000;
    positions[i + 2] = (Math.random() - 0.5) * 2000;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.8,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const starField = createStarField();

// Futuristic color palette
const colors = [
  0x00ffff, // Cyan
  0xff00ff, // Magenta
  0x00ff00, // Green
  0xffff00, // Yellow
  0xff4500, // Orange Red
  0x9400d3, // Violet
  0x00bfff, // Deep Sky Blue
  0xff1493, // Deep Pink
];

// Shape class for morphing blob objects
class MorphingShape {
  constructor() {
    this.position = new THREE.Vector3(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );

    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );

    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.targetColor = this.color;
    this.currentColor = new THREE.Color(this.color);
    this.baseSize = Math.random() * 1.5 + 1;
    this.isAlive = true;
    this.time = Math.random() * 1000;
    this.colorTransitionSpeed = 0.002;
    this.mergeProgress = 0;
    this.splitProgress = 0;
    this.isMerging = false;
    this.isSplitting = false;

    // Create base sphere geometry with more vertices for smooth deformation
    this.baseGeometry = new THREE.SphereGeometry(this.baseSize, 32, 32);
    this.geometry = this.baseGeometry.clone();

    // Store original positions for morphing
    this.originalPositions = this.geometry.attributes.position.array.slice();
    this.noiseSeeds = [];

    // Generate noise seeds for each vertex
    for (let i = 0; i < this.originalPositions.length / 3; i++) {
      this.noiseSeeds.push({
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        z: Math.random() * 1000,
      });
    }

    this.createMesh();
  }

  // Simple noise function
  noise(x, y, z) {
    return Math.sin(x) * Math.cos(y) * Math.sin(z) * 0.5 + 0.5;
  }

  // Multi-octave noise for more organic shapes
  fbm(x, y, z) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < 4; i++) {
      value +=
        this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      frequency *= 2;
      amplitude *= 0.5;
    }

    return value;
  }

  createMesh() {
    const material = new THREE.MeshPhongMaterial({
      color: this.currentColor,
      transparent: true,
      opacity: 0.85,
      emissive: this.currentColor,
      emissiveIntensity: 0.15,
      shininess: 100,
      specular: 0x444444,
    });

    if (this.mesh) {
      scene.remove(this.mesh);
    }

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  updateGeometry() {
    const positions = this.geometry.attributes.position.array;

    // Deform each vertex based on noise functions
    for (let i = 0; i < positions.length; i += 3) {
      const vertexIndex = i / 3;
      const seed = this.noiseSeeds[vertexIndex];

      // Get original position
      const originalX = this.originalPositions[i];
      const originalY = this.originalPositions[i + 1];
      const originalZ = this.originalPositions[i + 2];

      // Calculate noise-based displacement
      const noiseX = this.fbm(seed.x + this.time * 0.002, seed.y, seed.z) * 0.8;
      const noiseY =
        this.fbm(seed.x, seed.y + this.time * 0.0025, seed.z) * 0.8;
      const noiseZ = this.fbm(seed.x, seed.y, seed.z + this.time * 0.003) * 0.8;

      // Additional layer of deformation
      const wave1 = Math.sin(this.time * 0.004 + originalX * 2) * 0.3;
      const wave2 = Math.cos(this.time * 0.003 + originalY * 2) * 0.3;
      const wave3 = Math.sin(this.time * 0.005 + originalZ * 2) * 0.3;

      // Apply deformation
      const deformationFactor = 1 + noiseX + wave1;
      positions[i] = originalX * deformationFactor;
      positions[i + 1] = originalY * (1 + noiseY + wave2);
      positions[i + 2] = originalZ * (1 + noiseZ + wave3);
    }

    // Update geometry
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals(); // Smooth lighting
  }

  update() {
    if (!this.isAlive) return;

    // Update time for continuous morphing
    this.time += 1;

    // Smooth color transitions
    if (Math.random() < 0.0002) {
      // Very rare color changes
      this.targetColor = colors[Math.floor(Math.random() * colors.length)];
      morphingAudio.playColorChangeSound();
    }

    // Gradually interpolate to target color
    const targetColorObj = new THREE.Color(this.targetColor);
    this.currentColor.lerp(targetColorObj, this.colorTransitionSpeed);

    // Update geometry deformation with smooth scaling during merge/split
    let scaleModifier = 1;

    if (this.isMerging) {
      this.mergeProgress += 0.02;
      scaleModifier = 1 + Math.sin(this.mergeProgress * Math.PI) * 0.3;
      if (this.mergeProgress >= 1) {
        this.isMerging = false;
        this.mergeProgress = 0;
      }
    }

    if (this.isSplitting) {
      this.splitProgress += 0.03;
      scaleModifier = 1 + Math.sin(this.splitProgress * Math.PI) * 0.4;
      if (this.splitProgress >= 1) {
        this.isSplitting = false;
        this.splitProgress = 0;
      }
    }

    this.updateGeometry();
    this.mesh.scale.setScalar(scaleModifier);

    // Movement
    this.position.add(this.velocity);

    // Boundary checking - wrap around
    if (Math.abs(this.position.x) > 30) this.velocity.x *= -1;
    if (Math.abs(this.position.y) > 30) this.velocity.y *= -1;
    if (Math.abs(this.position.z) > 30) this.velocity.z *= -1;

    // Update mesh position with gentle floating motion
    this.mesh.position.copy(this.position);
    this.mesh.position.y += Math.sin(this.time * 0.001) * 0.5;

    // Gentle rotation
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.007;
    this.mesh.rotation.z += 0.003;

    // Update material colors smoothly
    this.mesh.material.color.copy(this.currentColor);
    this.mesh.material.emissive.copy(this.currentColor);

    // Subtle emissive intensity variation
    const colorShift = Math.sin(this.time * 0.001) * 0.05 + 0.15;
    this.mesh.material.emissiveIntensity = colorShift;
  }

  distanceTo(other) {
    return this.position.distanceTo(other.position);
  }

  mergeWith(other) {
    // Play merge sound based on size
    morphingAudio.playMergeSound(this.baseSize);

    // Smooth color blending
    const mergeColor = new THREE.Color().lerpColors(
      this.currentColor,
      new THREE.Color(other.currentColor),
      0.5
    );
    this.targetColor = mergeColor.getHex();
    this.currentColor.copy(mergeColor);

    // Gradual size increase
    this.baseSize = Math.min(this.baseSize + other.baseSize * 0.3, 4);
    this.velocity.lerp(other.velocity, 0.5);

    // Blend time offsets for interesting morphing
    this.time = (this.time + other.time) * 0.5;

    // Start merge animation
    this.isMerging = true;
    this.mergeProgress = 0;

    // Remove other shape
    scene.remove(other.mesh);
    other.isAlive = false;

    // Update material smoothly
    this.mesh.material.color.copy(this.currentColor);
    this.mesh.material.emissive.copy(this.currentColor);
  }

  split() {
    if (this.baseSize < 1.5) return null;

    // Play split sound based on size
    morphingAudio.playSplitSound(this.baseSize);

    const newShape = new MorphingShape();
    newShape.position.copy(this.position);
    newShape.position.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      )
    );

    // Inherit similar color with slight variation
    const colorVariation = new THREE.Color(this.currentColor);
    colorVariation.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1); // Slight lightness variation
    newShape.currentColor.copy(colorVariation);
    newShape.targetColor = colorVariation.getHex();

    newShape.baseSize = this.baseSize * 0.6;
    newShape.time = this.time + Math.random() * 50; // Small timing offset

    // Start split animation for both shapes
    this.isSplitting = true;
    this.splitProgress = 0;
    newShape.isSplitting = true;
    newShape.splitProgress = 0;

    this.baseSize *= 0.7;

    // Update both geometries
    this.baseGeometry = new THREE.SphereGeometry(this.baseSize, 32, 32);
    this.geometry = this.baseGeometry.clone();
    this.originalPositions = this.geometry.attributes.position.array.slice();

    return newShape;
  }
}

// Create initial blob shapes
const shapes = [];
for (let i = 0; i < 6; i++) {
  shapes.push(new MorphingShape());
}

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

// Add some colored point lights for atmosphere
const light1 = new THREE.PointLight(0x00ffff, 1, 50);
light1.position.set(10, 10, 10);
scene.add(light1);

const light2 = new THREE.PointLight(0xff00ff, 1, 50);
light2.position.set(-10, -10, 10);
scene.add(light2);

// Camera position
camera.position.z = 25;

// Nebula effect particles
function createNebula() {
  const nebulaGeometry = new THREE.BufferGeometry();
  const nebulaCount = 500;
  const positions = new Float32Array(nebulaCount * 3);
  const colors = new Float32Array(nebulaCount * 3);

  for (let i = 0; i < nebulaCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 100;
    positions[i + 2] = (Math.random() - 0.5) * 100;

    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  nebulaGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  nebulaGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const nebulaMaterial = new THREE.PointsMaterial({
    size: 4,
    transparent: true,
    opacity: 0.3,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });

  const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
  scene.add(nebula);
  return nebula;
}

const nebula = createNebula();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate star field slowly
  starField.rotation.y += 0.0002;
  nebula.rotation.x += 0.0001;
  nebula.rotation.z += 0.0003;

  // Update shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (!shapes[i].isAlive) {
      shapes.splice(i, 1);
      continue;
    }

    shapes[i].update();

    // Check for merging with smooth approach
    for (let j = i + 1; j < shapes.length; j++) {
      const distance = shapes[i].distanceTo(shapes[j]);
      if (distance < 4 && !shapes[i].isMerging && !shapes[j].isMerging) {
        if (Math.random() < 0.003) {
          shapes[i].mergeWith(shapes[j]);
          break;
        }
      }
    }

    // Check for split events
    if (Math.random() < 0.0008 && !shapes[i].isSplitting) {
      const newShape = shapes[i].split();
      if (newShape) {
        shapes.push(newShape);
      }
    }
  }

  // Maintain minimum number of shapes
  if (shapes.length < 3) {
    shapes.push(new MorphingShape());
    morphingAudio.playShapeSpawnSound();
  }

  // Camera movement
  camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
  camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// Additional control functions for interactive features
window.resetShapes = function () {
  // Clear existing shapes and recreate
  shapes.forEach((shape) => scene.remove(shape.mesh));
  shapes.length = 0;

  // Create new shapes
  for (let i = 0; i < 8; i++) {
    shapes.push(new MorphingShape());
  }
};

window.forceMerge = function () {
  // Force two random shapes to merge
  if (shapes.length >= 2) {
    const shape1 = shapes[Math.floor(Math.random() * shapes.length)];
    const shape2 = shapes[Math.floor(Math.random() * shapes.length)];
    if (shape1 !== shape2 && !shape1.isMerging && !shape2.isMerging) {
      shape1.mergeWith(shape2);
    }
  }
};

window.addShape = function () {
  // Add a new shape at random position
  if (shapes.length < 15) {
    shapes.push(new MorphingShape());
  }
};

setTimeout(() => {
  const loading = document.querySelector(".loading");
  if (loading) {
    loading.style.transition = "opacity 0.5s ease, visibility 0.5s ease";
    loading.style.opacity = "0";
    loading.style.visibility = "hidden";
    setTimeout(() => {}, 500);
  }
}, 1000);

// Start animation
animate();
