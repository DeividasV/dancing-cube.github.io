// Wire Network Random Generation
class WireNetworkGenerator {
  constructor() {
    this.container = null;
    this.wires = [];
    this.nodes = [];
    this.audioContext = null;
    this.masterGain = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientOscillators = [];
    this.backgroundSoundTimer = null;
    this.initAudio();
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    } catch (e) {
      console.log("Web Audio API not supported");
      this.soundEnabled = false;
    }
  }

  playTone(frequency, duration = 0.3, type = "sine", volume = 0.1) {
    if (!this.soundEnabled || !this.audioContext) return;

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

      // Gentle envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.05
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.log("Audio playback error:", e);
    }
  }

  playChord(frequencies, duration = 0.5, volume = 0.08) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, "sine", volume);
      }, index * 50);
    });
  }

  // Toggle sound on/off (called from top menu button)
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;

    const soundButton = document.querySelector(".sound-toggle-button");
    if (soundButton) {
      soundButton.textContent = this.soundEnabled ? "🔊" : "🔇";
      soundButton.title = this.soundEnabled
        ? "Sound ON - Click to mute"
        : "Sound OFF - Click to enable";
    }

    if (
      this.soundEnabled &&
      this.audioContext &&
      this.audioContext.state === "suspended"
    ) {
      this.audioContext.resume();
    }

    // Play confirmation sound if enabling
    if (this.soundEnabled) {
      this.playTone(440, 0.2, "sine", 0.1);
      this.startBackgroundAmbient();
    } else {
      this.stopBackgroundAmbient();
    }
  }

  startBackgroundAmbient() {
    if (!this.soundEnabled || !this.audioContext) return;

    // Clear any existing background sounds
    this.stopBackgroundAmbient();

    // Create continuous ambient drone
    this.createAmbientDrone();

    // Create electrical humming sound
    this.createElectricalHum();

    // Create subtle pulse rhythm
    this.createPulseRhythm();

    // Create network activity sounds
    this.createNetworkActivity();
  }

  stopBackgroundAmbient() {
    // Stop all ambient oscillators
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.ambientOscillators = [];

    // Clear any timers
    if (this.backgroundSoundTimer) {
      clearInterval(this.backgroundSoundTimer);
      this.backgroundSoundTimer = null;
    }
  }

  createAmbientDrone() {
    if (!this.audioContext) return;

    try {
      // Low frequency drone
      const droneOsc = this.audioContext.createOscillator();
      const droneGain = this.audioContext.createGain();
      const droneFilter = this.audioContext.createBiquadFilter();

      droneOsc.type = "sawtooth";
      droneOsc.frequency.setValueAtTime(60, this.audioContext.currentTime);

      droneFilter.type = "lowpass";
      droneFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
      droneFilter.Q.setValueAtTime(5, this.audioContext.currentTime);

      droneGain.gain.setValueAtTime(0.015, this.audioContext.currentTime);

      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain);

      droneOsc.start();
      this.ambientOscillators.push(droneOsc);
    } catch (e) {
      console.log("Error creating ambient drone:", e);
    }
  }

  createElectricalHum() {
    if (!this.audioContext) return;

    try {
      // Higher frequency electrical hum
      const humOsc = this.audioContext.createOscillator();
      const humGain = this.audioContext.createGain();
      const humLFO = this.audioContext.createOscillator();
      const humLFOGain = this.audioContext.createGain();

      humOsc.type = "square";
      humOsc.frequency.setValueAtTime(120, this.audioContext.currentTime);

      // LFO for subtle modulation
      humLFO.type = "sine";
      humLFO.frequency.setValueAtTime(0.3, this.audioContext.currentTime);
      humLFOGain.gain.setValueAtTime(5, this.audioContext.currentTime);

      humLFO.connect(humLFOGain);
      humLFOGain.connect(humOsc.frequency);

      humGain.gain.setValueAtTime(0.008, this.audioContext.currentTime);

      humOsc.connect(humGain);
      humGain.connect(this.masterGain);

      humOsc.start();
      humLFO.start();

      this.ambientOscillators.push(humOsc);
      this.ambientOscillators.push(humLFO);
    } catch (e) {
      console.log("Error creating electrical hum:", e);
    }
  }

  createPulseRhythm() {
    if (!this.audioContext) return;

    // Create a rhythmic pulse every 3-5 seconds
    const createPulse = () => {
      if (!this.soundEnabled) return;

      try {
        const pulseOsc = this.audioContext.createOscillator();
        const pulseGain = this.audioContext.createGain();

        pulseOsc.type = "sine";
        pulseOsc.frequency.setValueAtTime(220, this.audioContext.currentTime);

        pulseGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        pulseGain.gain.linearRampToValueAtTime(
          0.02,
          this.audioContext.currentTime + 0.01
        );
        pulseGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 0.3
        );

        pulseOsc.connect(pulseGain);
        pulseGain.connect(this.masterGain);

        pulseOsc.start();
        pulseOsc.stop(this.audioContext.currentTime + 0.3);
      } catch (e) {
        console.log("Error creating pulse:", e);
      }
    };

    // Start pulse rhythm
    const schedulePulse = () => {
      if (this.soundEnabled) {
        createPulse();
        this.backgroundSoundTimer = setTimeout(
          schedulePulse,
          3000 + Math.random() * 2000
        );
      }
    };

    // Initial delay
    this.backgroundSoundTimer = setTimeout(schedulePulse, 1000);
  }

  createNetworkActivity() {
    if (!this.audioContext) return;

    // Create continuous subtle network activity sounds
    const activitySounds = () => {
      if (!this.soundEnabled) return;

      try {
        // Random short beeps simulating data transmission
        const beepOsc = this.audioContext.createOscillator();
        const beepGain = this.audioContext.createGain();

        const frequencies = [400, 500, 600, 800, 1000];
        const freq =
          frequencies[Math.floor(Math.random() * frequencies.length)];

        beepOsc.type = "square";
        beepOsc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        beepGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        beepGain.gain.linearRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.005
        );
        beepGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 0.05
        );

        beepOsc.connect(beepGain);
        beepGain.connect(this.masterGain);

        beepOsc.start();
        beepOsc.stop(this.audioContext.currentTime + 0.05);

        // Schedule next activity sound
        if (this.soundEnabled) {
          setTimeout(activitySounds, 200 + Math.random() * 800);
        }
      } catch (e) {
        console.log("Error creating network activity:", e);
      }
    };

    // Start activity sounds after initial delay
    setTimeout(activitySounds, 2000);
  }

  setup() {
    console.log("Setting up wire network...");
    this.container = document.getElementById("container");
    if (!this.container) {
      console.error("Container not found");
      return;
    }
    console.log("Container found:", this.container);

    // Enable audio context on user interaction
    this.container.addEventListener("click", () => {
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    });

    setTimeout(() => {
      // Play gentle startup chord only if sound is enabled
      if (this.soundEnabled) {
        this.playChord([220, 277, 330], 1.0, 0.06);
      }
    }, 1000);

    this.generateRandomNetwork();
  }

  generateRandomNetwork() {
    console.log("Generating random network...");
    // Clear existing content
    this.container.innerHTML = "";
    this.wires = [];
    this.nodes = [];

    // Generate random wires
    this.generateHorizontalWires();
    this.generateVerticalWires();
    this.generateDiagonalWires();
    this.generateNodes();

    // Start ambient sounds
    this.startAmbientSounds();

    // Start background ambient if sound is enabled
    if (this.soundEnabled) {
      this.startBackgroundAmbient();
    }

    console.log(
      "Network generated with",
      this.wires.length,
      "wires and",
      this.nodes.length,
      "nodes"
    );
  }

  startAmbientSounds() {
    if (!this.soundEnabled) return;

    // Play subtle ambient tones every 8-15 seconds
    const playAmbient = () => {
      if (this.soundEnabled) {
        const ambientFreqs = [110, 165, 220, 330];
        const selectedFreq =
          ambientFreqs[Math.floor(Math.random() * ambientFreqs.length)];
        this.playTone(selectedFreq, 2.0, "sine", 0.02);
      }

      // Schedule next ambient sound
      setTimeout(playAmbient, 8000 + Math.random() * 7000);
    };

    // Start after initial delay
    setTimeout(playAmbient, 3000 + Math.random() * 5000);
  }

  generateHorizontalWires() {
    const numWires = 4 + Math.floor(Math.random() * 3); // 4-6 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-h wire-h${i + 1}`;

      // Random positioning and sizing
      const top = 10 + Math.random() * 80; // 10-90%
      const left = 5 + Math.random() * 30; // 5-35%
      const width = 20 + Math.random() * 40; // 20-60%

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: ${width}%;
        height: 4px;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "horizontal");

      // Add subtle sound interaction
      wire.addEventListener("mouseenter", () => {
        const baseFreq = 200 + (top / 100) * 300; // 200-500 Hz based on position
        this.playTone(baseFreq, 0.2, "sine", 0.05);
      });

      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateVerticalWires() {
    const numWires = 4 + Math.floor(Math.random() * 3); // 4-6 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-v wire-v${i + 1}`;

      // Random positioning and sizing
      const top = 5 + Math.random() * 30; // 5-35%
      const left = 10 + Math.random() * 80; // 10-90%
      const height = 20 + Math.random() * 40; // 20-60%

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: 4px;
        height: ${height}%;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "vertical");

      // Add subtle sound interaction
      wire.addEventListener("mouseenter", () => {
        const baseFreq = 300 + (left / 100) * 400; // 300-700 Hz based on position
        this.playTone(baseFreq, 0.2, "sine", 0.05);
      });

      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateDiagonalWires() {
    const numWires = 2 + Math.floor(Math.random() * 3); // 2-4 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-d wire-d${i + 1}`;

      // Random positioning and sizing
      const top = 20 + Math.random() * 60; // 20-80%
      const left = 20 + Math.random() * 60; // 20-80%
      const width = 15 + Math.random() * 25; // 15-40%
      const rotation = -60 + Math.random() * 120; // -60 to 60 degrees

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: ${width}%;
        height: 4px;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        transform: rotate(${rotation}deg);
        transform-origin: left center;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "diagonal");

      // Add subtle sound interaction
      wire.addEventListener("mouseenter", () => {
        const baseFreq = 150 + (rotation + 60) * 3; // Frequency based on rotation
        this.playTone(baseFreq, 0.3, "triangle", 0.04);
      });

      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateNodes() {
    const numNodes = 3 + Math.floor(Math.random() * 4); // 3-6 nodes

    for (let i = 0; i < numNodes; i++) {
      const node = document.createElement("div");
      node.className = `node node${i + 1}`;

      // Random positioning
      const top = 15 + Math.random() * 70; // 15-85%
      const left = 15 + Math.random() * 70; // 15-85%

      node.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: 12px;
        height: 12px;
        background: #ff6b35;
        border-radius: 50%;
        box-shadow: 0 0 15px #ff6b35;
        z-index: 10;
        animation: nodePulse 2s ease-in-out infinite;
        cursor: pointer;
      `;

      // Add click sound for nodes
      node.addEventListener("click", () => {
        const nodeFreq = 400 + i * 50; // Different frequency for each node
        this.playChord([nodeFreq, nodeFreq * 1.2, nodeFreq * 1.5], 0.4, 0.06);
      });

      // Subtle hover sound for nodes
      node.addEventListener("mouseenter", () => {
        const hoverFreq = 800 + i * 30;
        this.playTone(hoverFreq, 0.1, "sine", 0.03);
      });

      this.container.appendChild(node);
      this.nodes.push(node);
    }
  }

  addPulses(wire, type) {
    const numPulses = 1 + Math.floor(Math.random() * 2); // 1-2 pulses per wire

    for (let i = 0; i < numPulses; i++) {
      const pulse = document.createElement("div");
      pulse.className = `pulse pulse-${type}`;

      const delay = Math.random() * 3; // 0-3 second delay
      const duration = 2 + Math.random() * 3; // 2-5 second duration

      pulse.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #00ffff;
        border-radius: 50%;
        box-shadow: 0 0 15px #00ffff;
        animation: pulse${
          type.charAt(0).toUpperCase() + type.slice(1)
        } ${duration}s linear infinite;
        animation-delay: ${delay}s;
        opacity: 0.8;
      `;

      // Position pulses based on wire type
      if (type === "horizontal") {
        pulse.style.top = "-4px";
        pulse.style.left = "-8px";
      } else if (type === "vertical") {
        pulse.style.left = "-4px";
        pulse.style.top = "-8px";
      } else if (type === "diagonal") {
        pulse.style.top = "-4px";
        pulse.style.left = "-8px";
      }

      // Add subtle pulse sound every few cycles
      if (this.soundEnabled && Math.random() < 0.3) {
        setTimeout(() => {
          this.schedulePulseSounds(duration, type);
        }, delay * 1000);
      }

      wire.appendChild(pulse);
    }
  }

  schedulePulseSounds(duration, type) {
    const soundInterval = (duration * 1000) / 3; // Sound 3 times during pulse travel
    let soundCount = 0;

    const playPulseSound = () => {
      if (this.soundEnabled && soundCount < 3) {
        const frequencies = {
          horizontal: 600,
          vertical: 750,
          diagonal: 500,
        };
        this.playTone(
          frequencies[type] + Math.random() * 100,
          0.1,
          "sine",
          0.02
        );
        soundCount++;
        setTimeout(playPulseSound, soundInterval);
      }
    };

    // Start pulse sounds
    setTimeout(playPulseSound, soundInterval);
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes pulseHorizontal {
    0% { left: -8px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: 100%; opacity: 0; }
  }

  @keyframes pulseVertical {
    0% { top: -8px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  @keyframes pulseDiagonal {
    0% { transform: translateX(-8px) translateY(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(100%) translateY(50%); opacity: 0; }
  }

  @keyframes nodePulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 15px #ff6b35;
    }
    50% { 
      transform: scale(1.2);
      box-shadow: 0 0 25px #ff6b35;
    }
  }

  .wire:hover {
    box-shadow: 0 0 20px #ffd700, 0 0 30px rgba(255, 215, 0, 0.5);
    background: #ffed4e;
    transition: all 0.2s ease;
  }

  .node:hover {
    transform: scale(1.3);
    box-shadow: 0 0 25px #ff6b35, 0 0 40px rgba(255, 107, 53, 0.3);
    transition: all 0.2s ease;
  }

  .pulse {
    pointer-events: none;
  }
`;
document.head.appendChild(style);

// Initialize the wire network generator
console.log("Initializing wire network generator...");
let wireGenerator = new WireNetworkGenerator();

// Global function for sound toggle button
window.toggleAppSound = function () {
  if (wireGenerator) {
    wireGenerator.toggleSound();
  }
};

// Regenerate network on spacebar press
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    // Play regeneration sound only if enabled
    if (wireGenerator.soundEnabled) {
      wireGenerator.playChord([150, 200, 250, 300], 0.6, 0.05);
    }
    setTimeout(() => {
      wireGenerator = new WireNetworkGenerator();
    }, 200);
  }
});
