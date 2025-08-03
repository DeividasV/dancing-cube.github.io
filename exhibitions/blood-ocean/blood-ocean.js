// BL00D_0C34N - 3D Blood Ocean Simulation

// Audio System for Ocean and Ambient Sounds
class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientOscillators = [];
    this.ambientTimers = [];
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.5, this.audioContext.currentTime); // Increased volume significantly
      console.log(
        "Blood Ocean audio context initialized, state:",
        this.audioContext.state
      );
      console.log("Master gain volume set to:", this.masterGain.gain.value);
    } catch (e) {
      console.log("Web Audio API not supported:", e);
      this.soundEnabled = false;
    }
  }

  playTone(frequency, duration = 0.3, type = "sine", volume = 0.1) {
    if (!this.soundEnabled || !this.audioContext) {
      console.log("Sound disabled or no audio context");
      return;
    }

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Ocean-like filter
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      // Gentle envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      console.log(
        `Playing tone: ${frequency}Hz, ${duration}s, volume: ${volume}`
      );
    } catch (e) {
      console.log("Audio playback error:", e);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log(
      "Blood Ocean sound:",
      this.soundEnabled ? "enabled" : "disabled"
    );

    const button = document.querySelector(".sound-toggle-button");
    if (button) {
      if (this.soundEnabled) {
        button.textContent = "🔊";
        button.title = "Sound ON - Click to disable";

        // Resume audio context if suspended
        if (this.audioContext && this.audioContext.state === "suspended") {
          this.audioContext.resume();
        }

        // Play immediate TEST sound - very loud and obvious
        console.log("Playing TEST confirmation sound...");
        setTimeout(() => {
          this.playTone(880, 1.0, "sine", 0.5); // High A note, very loud
        }, 100);

        setTimeout(() => {
          this.startBackgroundAmbient();
        }, 200);
      } else {
        button.textContent = "🔇";
        button.title = "Sound OFF - Click to enable";
        this.stopBackgroundAmbient();
      }
    }
  }

  startBackgroundAmbient() {
    if (!this.soundEnabled || !this.audioContext) return;

    console.log("Starting background ambient sounds...");
    this.stopBackgroundAmbient();

    // Create deep ocean drone
    this.createOceanDrone();

    // Create periodic wave sounds
    this.createWaveSounds();
  }

  stopBackgroundAmbient() {
    // Stop all ambient oscillators
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.ambientOscillators = [];

    // Clear all timers
    this.ambientTimers.forEach((timer) => clearTimeout(timer));
    this.ambientTimers = [];
  }

  createOceanDrone() {
    if (!this.audioContext || !this.soundEnabled) return;

    try {
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      const filter1 = this.audioContext.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(60, this.audioContext.currentTime);

      filter1.type = "lowpass";
      filter1.frequency.setValueAtTime(120, this.audioContext.currentTime);
      filter1.Q.setValueAtTime(1, this.audioContext.currentTime);

      gain1.gain.setValueAtTime(0.2, this.audioContext.currentTime); // Increased volume significantly

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.masterGain);

      osc1.start();
      this.ambientOscillators.push(osc1);

      // Second layer
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      const filter2 = this.audioContext.createBiquadFilter();

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(90, this.audioContext.currentTime);

      filter2.type = "lowpass";
      filter2.frequency.setValueAtTime(200, this.audioContext.currentTime);
      filter2.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      gain2.gain.setValueAtTime(0.15, this.audioContext.currentTime); // Increased volume significantly

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(this.masterGain);

      osc2.start();
      this.ambientOscillators.push(osc2);

      console.log("Ocean drone started successfully");
    } catch (e) {
      console.log("Error creating ocean drone:", e);
    }
  }

  createWaveSounds() {
    if (!this.soundEnabled) return;

    const scheduleWave = () => {
      if (!this.soundEnabled) return;

      // Play ocean wave sound
      const frequency = 80 + Math.random() * 60;
      this.playTone(frequency, 1.5, "sine", 0.2); // Increased volume significantly

      // Schedule next wave
      const nextDelay = 3000 + Math.random() * 6000; // 3-9 seconds
      const timer = setTimeout(scheduleWave, nextDelay);
      this.ambientTimers.push(timer);
    };

    // Start wave scheduling
    const initialDelay = 2000; // Start after 2 seconds
    const timer = setTimeout(scheduleWave, initialDelay);
    this.ambientTimers.push(timer);
  }

  playWaveInteraction(intensity = 1.0) {
    if (!this.soundEnabled || !this.audioContext) return;

    const frequency = 120 + intensity * 80;
    const volume = 0.1 * intensity;
    this.playTone(frequency, 0.5, "sine", volume);
  }
}

// Initialize audio system
const audioSystem = new AudioSystem();

// Global function for sound toggle button
window.toggleAppSound = function () {
  audioSystem.toggleSound();
};

const canvas = document.getElementById("blood-canvas");
const ctx = canvas.getContext("2d");

// 3D perspective parameters
const perspective = {
  fov: 60,
  viewAngle: 25, // Viewing angle from above
  horizon: 0, // Will be set in resizeCanvas
  distance: 1000,
  camera: { x: 0, y: -200, z: 300 },
};

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  // Update perspective based on new canvas size
  perspective.horizon = canvas.height * 0.3;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let time = 0;
const waves = [];
const ripples = [];
const drops = [];
const reflections = [];

// Enhanced blood red palette with metallic sheens
const bloodColors = [
  { base: "#8b0000", reflect: "#ff4444", shine: "#ffaaaa" },
  { base: "#a0001a", reflect: "#ff3355", shine: "#ff9999" },
  { base: "#b71c1c", reflect: "#ff5555", shine: "#ffbbbb" },
  { base: "#c62828", reflect: "#ff6666", shine: "#ffcccc" },
  { base: "#9c0d0d", reflect: "#dd3333", shine: "#ffaaaa" },
  { base: "#800020", reflect: "#cc4466", shine: "#ff99bb" },
  { base: "#722f37", reflect: "#bb5577", shine: "#ff99cc" },
];

// 3D transformation utilities
function project3D(x, y, z) {
  const viewX = x - perspective.camera.x;
  const viewY = y - perspective.camera.y;
  const viewZ = z - perspective.camera.z;

  // Rotate for viewing angle
  const angleRad = (perspective.viewAngle * Math.PI) / 180;
  const rotY = viewY * Math.cos(angleRad) - viewZ * Math.sin(angleRad);
  const rotZ = viewY * Math.sin(angleRad) + viewZ * Math.cos(angleRad);

  const scale = perspective.distance / (rotZ + perspective.distance);

  return {
    x: canvas.width / 2 + viewX * scale,
    y: perspective.horizon + rotY * scale,
    scale: scale,
    depth: rotZ,
  };
}

function getWaveHeight(x, z, t) {
  let height = 0;
  height += Math.sin(x * 0.01 + t * 2) * 15;
  height += Math.sin(z * 0.008 + t * 1.5) * 12;
  height += Math.cos(x * 0.015 + z * 0.012 + t * 1.8) * 8;
  height += Math.sin(x * 0.02 + z * 0.015 + t * 2.2) * 5;
  return height;
}

// 3D Wave surface
class WaveSurface {
  constructor() {
    this.gridSize = 20;
    this.width = 2000;
    this.depth = 2000;
    this.colorSet = bloodColors[Math.floor(Math.random() * bloodColors.length)];
  }

  draw() {
    const halfWidth = this.width / 2;
    const halfDepth = this.depth / 2;

    // Draw wave grid with perspective
    for (let zStep = -halfDepth; zStep < halfDepth; zStep += this.gridSize) {
      ctx.beginPath();
      let firstPoint = true;

      for (
        let xStep = -halfWidth;
        xStep <= halfWidth;
        xStep += this.gridSize / 2
      ) {
        const waveHeight = getWaveHeight(xStep, zStep, time);
        const projected = project3D(xStep, waveHeight, zStep);

        if (projected.scale > 0.1) {
          if (firstPoint) {
            ctx.moveTo(projected.x, projected.y);
            firstPoint = false;
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
      }

      // Create gradient based on depth
      const depthFactor = (zStep + halfDepth) / this.depth;
      const alpha = Math.max(0.2, 1 - depthFactor * 0.8);

      ctx.strokeStyle =
        this.colorSet.base +
        Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.lineWidth = Math.max(0.5, 2 * (1 - depthFactor));
      ctx.stroke();
    }

    // Draw reflective surface patches
    this.drawReflectivePatches();
  }

  drawReflectivePatches() {
    const patchSize = 40;
    const halfWidth = this.width / 2;
    const halfDepth = this.depth / 2;

    for (let z = -halfDepth; z < halfDepth; z += patchSize) {
      for (let x = -halfWidth; x < halfWidth; x += patchSize) {
        this.drawWaterPatch(x, z, patchSize, patchSize);
      }
    }
  }

  drawWaterPatch(startX, startZ, width, height) {
    const corners = [
      { x: startX, z: startZ },
      { x: startX + width, z: startZ },
      { x: startX + width, z: startZ + height },
      { x: startX, z: startZ + height },
    ];

    const projectedCorners = corners
      .map((corner) => {
        const waveHeight = getWaveHeight(corner.x, corner.z, time);
        return project3D(corner.x, waveHeight, corner.z);
      })
      .filter((p) => p.scale > 0.1);

    if (projectedCorners.length < 3) return;

    // Calculate surface normal for lighting
    const normal = this.calculateNormal(
      startX + width / 2,
      startZ + height / 2
    );
    const lightIntensity = Math.max(0.3, normal.y * 0.7 + 0.3);

    // Create reflective gradient
    const centerProj = project3D(
      startX + width / 2,
      getWaveHeight(startX + width / 2, startZ + height / 2, time),
      startZ + height / 2
    );
    const gradient = ctx.createRadialGradient(
      centerProj.x,
      centerProj.y,
      0,
      centerProj.x,
      centerProj.y,
      width * centerProj.scale
    );

    const depthFactor = (startZ + this.depth / 2) / this.depth;
    const alpha = Math.max(0.4, 1 - depthFactor * 0.6);

    // Reflective coloring
    gradient.addColorStop(
      0,
      this.colorSet.shine +
        Math.floor(lightIntensity * alpha * 128)
          .toString(16)
          .padStart(2, "0")
    );
    gradient.addColorStop(
      0.3,
      this.colorSet.reflect +
        Math.floor(lightIntensity * alpha * 180)
          .toString(16)
          .padStart(2, "0")
    );
    gradient.addColorStop(
      0.7,
      this.colorSet.base +
        Math.floor(alpha * 220)
          .toString(16)
          .padStart(2, "0")
    );
    gradient.addColorStop(
      1,
      this.colorSet.base +
        Math.floor(alpha * 160)
          .toString(16)
          .padStart(2, "0")
    );

    // Draw patch
    ctx.beginPath();
    ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
    for (let i = 1; i < projectedCorners.length; i++) {
      ctx.lineTo(projectedCorners[i].x, projectedCorners[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add specular highlights
    if (lightIntensity > 0.6) {
      ctx.beginPath();
      ctx.arc(
        centerProj.x,
        centerProj.y,
        Math.max(1, 3 * centerProj.scale),
        0,
        Math.PI * 2
      );
      ctx.fillStyle =
        this.colorSet.shine +
        Math.floor((lightIntensity - 0.6) * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.fill();
    }
  }

  calculateNormal(x, z) {
    const epsilon = 1;
    const hL = getWaveHeight(x - epsilon, z, time);
    const hR = getWaveHeight(x + epsilon, z, time);
    const hD = getWaveHeight(x, z - epsilon, time);
    const hU = getWaveHeight(x, z + epsilon, time);

    return {
      x: (hL - hR) / (2 * epsilon),
      y: 1,
      z: (hD - hU) / (2 * epsilon),
    };
  }
}

// Enhanced 3D Ripple
class Ripple3D {
  constructor(x, z, intensity = 1, delay = 0, maxRadius = null) {
    this.centerX = x;
    this.centerZ = z;
    this.radius = 0;
    this.maxRadius = maxRadius || (Math.random() * 100 + 80) * intensity;
    this.speed = (Math.random() * 2 + 1.5) * intensity;
    this.opacity = intensity;
    this.colorSet = bloodColors[Math.floor(Math.random() * bloodColors.length)];
    this.amplitude = 12 * intensity;
    this.delay = delay;
    this.age = 0;
    this.active = delay === 0;
  }

  update() {
    this.age += 0.016;

    if (!this.active && this.age >= this.delay) {
      this.active = true;
    }

    if (this.active) {
      this.radius += this.speed;
      this.opacity -= 0.005;
    }

    return this.opacity > 0 && this.radius < this.maxRadius;
  }

  draw() {
    if (!this.active) return;

    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      const x1 = this.centerX + Math.cos(angle1) * this.radius;
      const z1 = this.centerZ + Math.sin(angle1) * this.radius;
      const x2 = this.centerX + Math.cos(angle2) * this.radius;
      const z2 = this.centerZ + Math.sin(angle2) * this.radius;

      const waveHeight1 =
        getWaveHeight(x1, z1, time) +
        this.amplitude * Math.exp(-this.radius / 40);
      const waveHeight2 =
        getWaveHeight(x2, z2, time) +
        this.amplitude * Math.exp(-this.radius / 40);

      const proj1 = project3D(x1, waveHeight1, z1);
      const proj2 = project3D(x2, waveHeight2, z2);

      if (proj1.scale > 0.1 && proj2.scale > 0.1) {
        ctx.beginPath();
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);

        const alpha = this.opacity * Math.max(0.3, proj1.scale);
        ctx.strokeStyle =
          this.colorSet.reflect +
          Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.lineWidth = Math.max(1, 2.5 * proj1.scale);
        ctx.stroke();
      }
    }
  }
}

// Enhanced 3D Blood Drop
class BloodDrop3D {
  constructor() {
    this.x = (Math.random() - 0.5) * 1500;
    this.y = -150 - Math.random() * 100;
    this.z = (Math.random() - 0.5) * 1500;

    const sizeType = Math.random();
    if (sizeType < 0.3) {
      this.size = Math.random() * 2 + 1;
      this.dropType = "tiny";
    } else if (sizeType < 0.7) {
      this.size = Math.random() * 4 + 3;
      this.dropType = "medium";
    } else {
      this.size = Math.random() * 8 + 6;
      this.dropType = "large";
    }

    this.speed = Math.random() * 1.5 + 0.8;
    if (this.dropType === "large") this.speed *= 1.3;
    if (this.dropType === "tiny") this.speed *= 0.7;

    this.colorSet = bloodColors[Math.floor(Math.random() * bloodColors.length)];
    this.wobble = Math.random() * 0.015 + 0.005;
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.1 + 0.05;
    this.rotation = 0;
  }

  update() {
    this.y += this.speed;
    this.x += Math.sin(this.y * this.wobble + this.wobbleOffset) * 0.8;
    this.rotation += this.rotationSpeed;

    const surfaceHeight = getWaveHeight(this.x, this.z, time);
    if (this.y > surfaceHeight) {
      this.createNaturalRipples();
      return false;
    }

    return this.y < 600;
  }

  createNaturalRipples() {
    const baseIntensity = this.size / 10;

    // Play drop impact sound based on drop size
    if (this.dropType === "tiny") {
      audioSystem.playWaveInteraction(0.3);
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 0.6, 0, 40));
      if (Math.random() < 0.6) {
        ripples.push(
          new Ripple3D(this.x, this.z, baseIntensity * 0.3, 0.2, 25)
        );
      }
    } else if (this.dropType === "medium") {
      audioSystem.playWaveInteraction(0.6);
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity, 0, 80));
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 0.7, 0.15, 60));
      if (Math.random() < 0.7) {
        ripples.push(
          new Ripple3D(this.x, this.z, baseIntensity * 0.4, 0.35, 40)
        );
      }
    } else {
      audioSystem.playWaveInteraction(1.0);
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 1.2, 0, 120));
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 0.9, 0.1, 100));
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 0.6, 0.25, 80));
      ripples.push(new Ripple3D(this.x, this.z, baseIntensity * 0.4, 0.45, 60));
      if (Math.random() < 0.8) {
        ripples.push(
          new Ripple3D(this.x, this.z, baseIntensity * 0.2, 0.7, 40)
        );
      }
    }
  }

  draw() {
    const projected = project3D(this.x, this.y, this.z);
    if (projected.scale > 0.1) {
      const size = this.size * projected.scale;

      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.rotate(this.rotation);

      // Drop shadow
      ctx.beginPath();
      ctx.ellipse(2, 2, size, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Main drop with gradient
      const gradient = ctx.createRadialGradient(
        -size * 0.3,
        -size * 0.4,
        0,
        0,
        0,
        size * 1.2
      );

      if (this.dropType === "tiny") {
        gradient.addColorStop(0, this.colorSet.shine + "cc");
        gradient.addColorStop(0.6, this.colorSet.reflect);
        gradient.addColorStop(1, this.colorSet.base);
      } else if (this.dropType === "large") {
        gradient.addColorStop(0, this.colorSet.shine);
        gradient.addColorStop(0.2, this.colorSet.reflect);
        gradient.addColorStop(0.7, this.colorSet.base);
        gradient.addColorStop(1, this.colorSet.base + "88");
      } else {
        gradient.addColorStop(0, this.colorSet.shine + "dd");
        gradient.addColorStop(0.4, this.colorSet.reflect);
        gradient.addColorStop(1, this.colorSet.base);
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      if (this.dropType === "large") {
        ctx.beginPath();
        ctx.ellipse(
          -size * 0.2,
          -size * 0.3,
          size * 0.2,
          size * 0.3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = this.colorSet.shine + "66";
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

// Initialize
const oceanSurface = new WaveSurface();

// Mouse interaction
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  const worldX = (screenX - canvas.width / 2) * 2;
  const worldZ = (screenY - perspective.horizon) * 4;

  ripples.push(new Ripple3D(worldX, worldZ, 1.2, 0, 120));
  ripples.push(new Ripple3D(worldX, worldZ, 0.8, 0.1, 90));
  ripples.push(new Ripple3D(worldX, worldZ, 0.5, 0.25, 60));
  ripples.push(new Ripple3D(worldX, worldZ, 0.3, 0.45, 40));

  // Play wave interaction sound
  audioSystem.playWaveInteraction(1.2);
});

function animate() {
  // Clear with dark gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGradient.addColorStop(0, "#0a0000");
  bgGradient.addColorStop(0.3, "#1a0000");
  bgGradient.addColorStop(0.7, "#2d0a0a");
  bgGradient.addColorStop(1, "#400d0d");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  time += 0.016;

  // Move camera slightly for dynamic effect
  perspective.camera.x = Math.sin(time * 0.3) * 50;
  perspective.camera.z = 300 + Math.cos(time * 0.2) * 30;

  // Draw ocean surface
  oceanSurface.draw();

  // Update and draw ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    if (!ripples[i].update()) {
      ripples.splice(i, 1);
    } else {
      ripples[i].draw();
    }
  }

  // Update and draw blood drops
  for (let i = drops.length - 1; i >= 0; i--) {
    if (!drops[i].update()) {
      drops.splice(i, 1);
    } else {
      drops[i].draw();
    }
  }

  // Create random effects
  if (Math.random() < 0.012) {
    const x = (Math.random() - 0.5) * 1000;
    const z = (Math.random() - 0.5) * 1000;
    const intensity = Math.random() * 0.6 + 0.2;
    ripples.push(new Ripple3D(x, z, intensity, 0, 60));
  }

  if (Math.random() < 0.025) {
    drops.push(new BloodDrop3D());
  }

  requestAnimationFrame(animate);
}

// Hide loading text once everything is initialized
setTimeout(() => {
  const loading = document.querySelector(".loading-container");
  if (loading) {
    loading.style.transition = "opacity 0.5s ease, visibility 0.5s ease";
    loading.style.opacity = "0";
    loading.style.visibility = "hidden";
    setTimeout(() => {
      loading.style.display = "none";
    }, 500);
  }
}, 1000);

// Start animation
animate();

// Initial drops
for (let i = 0; i < 5; i++) {
  setTimeout(() => drops.push(new BloodDrop3D()), i * 800);
}
