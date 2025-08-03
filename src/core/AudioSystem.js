/**
 * Unified Audio System
 * Handles all audio generation and processing for exhibitions
 */
class AudioSystem {
  constructor() {
    this.context = null;
    this.enabled = false;
    this.masterGain = null;
    this.volume = 0.3;

    // Audio nodes and synthesizers
    this.oscillators = new Map();
    this.synthesizers = new Map();
    this.effects = new Map();

    // Audio state
    this.isInitialized = false;
    this.activeNodes = new Set();

    // Performance monitoring
    this.analyser = null;
    this.frequencyData = null;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      // Resume context if suspended (browser autoplay policy)
      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      // Create master gain node
      this.masterGain = this.context.createGain();
      this.masterGain.gain.setValueAtTime(
        this.volume,
        this.context.currentTime
      );
      this.masterGain.connect(this.context.destination);

      // Create analyser for visualizations
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.masterGain.connect(this.analyser);

      this.isInitialized = true;
      console.log("🎵 Audio system initialized");
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

      // Resume context if needed
      if (this.context && this.context.state === "suspended") {
        await this.context.resume();
      }

      console.log("🔊 Audio enabled");
    } else {
      this.stopAll();
      console.log("🔇 Audio disabled");
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.volume,
        this.context.currentTime
      );
    }
  }

  getVolume() {
    return this.volume;
  }

  // Basic oscillator creation
  createOscillator(frequency, type = "sine", options = {}) {
    if (!this.enabled || !this.context) return null;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.type = type;

    // Configure gain
    const initialGain = options.gain || 0.1;
    gainNode.gain.setValueAtTime(initialGain, this.context.currentTime);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Track active nodes
    this.activeNodes.add(oscillator);
    this.activeNodes.add(gainNode);

    // Cleanup when oscillator ends
    oscillator.onended = () => {
      this.activeNodes.delete(oscillator);
      this.activeNodes.delete(gainNode);
    };

    return { oscillator, gainNode };
  }

  // Play a simple tone
  playTone(frequency, duration = 0.1, type = "sine", options = {}) {
    if (!this.enabled) return null;

    const { oscillator, gainNode } = this.createOscillator(
      frequency,
      type,
      options
    );
    if (!oscillator) return null;

    const now = this.context.currentTime;
    const fadeTime = options.fadeTime || 0.01;
    const gain = options.gain || 0.1;

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + fadeTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration - fadeTime
    );

    // Play
    oscillator.start(now);
    oscillator.stop(now + duration);

    return { oscillator, gainNode };
  }

  // Play collision sound with velocity-based parameters
  playCollisionSound(velocity = 0.5, material = "metal") {
    if (!this.enabled) return;

    const frequency = this.mapVelocityToFrequency(velocity, material);
    const duration = this.mapVelocityToDuration(velocity);
    const gain = Math.min(velocity * 0.2, 0.3);

    switch (material) {
      case "metal":
        this.playTone(frequency, duration, "square", { gain, fadeTime: 0.005 });
        this.playTone(frequency * 2, duration * 0.3, "sine", {
          gain: gain * 0.5,
        });
        break;

      case "glass":
        this.playTone(frequency, duration, "triangle", {
          gain,
          fadeTime: 0.01,
        });
        this.playTone(frequency * 1.5, duration * 0.8, "sine", {
          gain: gain * 0.3,
        });
        break;

      case "soft":
        this.playTone(frequency * 0.5, duration * 1.5, "sine", {
          gain: gain * 0.8,
          fadeTime: 0.02,
        });
        break;

      default:
        this.playTone(frequency, duration, "sine", { gain });
    }
  }

  // Create a synthesizer for continuous audio
  createSynthesizer(name, config = {}) {
    if (!this.enabled || !this.context) return null;

    const synth = {
      name,
      config,
      oscillators: [],
      gainNode: this.context.createGain(),
      filterNode: config.filter ? this.context.createBiquadFilter() : null,
      isPlaying: false,
    };

    // Setup filter if specified
    if (synth.filterNode) {
      synth.filterNode.type = config.filter.type || "lowpass";
      synth.filterNode.frequency.setValueAtTime(
        config.filter.frequency || 1000,
        this.context.currentTime
      );
      synth.filterNode.Q.setValueAtTime(
        config.filter.Q || 1,
        this.context.currentTime
      );
    }

    // Connect audio chain
    const destination = synth.filterNode || synth.gainNode;
    if (synth.filterNode) {
      synth.filterNode.connect(synth.gainNode);
    }
    synth.gainNode.connect(this.masterGain);

    synth.gainNode.gain.setValueAtTime(
      config.gain || 0.1,
      this.context.currentTime
    );

    this.synthesizers.set(name, synth);
    return synth;
  }

  // Play note on synthesizer
  playNote(synthName, frequency, duration = null) {
    const synth = this.synthesizers.get(synthName);
    if (!synth || !this.enabled) return;

    const oscillator = this.context.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.type = synth.config.waveform || "sine";

    const destination = synth.filterNode || synth.gainNode;
    oscillator.connect(destination);

    synth.oscillators.push(oscillator);
    this.activeNodes.add(oscillator);

    oscillator.start();

    if (duration) {
      oscillator.stop(this.context.currentTime + duration);
      oscillator.onended = () => {
        const index = synth.oscillators.indexOf(oscillator);
        if (index > -1) synth.oscillators.splice(index, 1);
        this.activeNodes.delete(oscillator);
      };
    }

    return oscillator;
  }

  // Stop synthesizer
  stopSynthesizer(name) {
    const synth = this.synthesizers.get(name);
    if (!synth) return;

    synth.oscillators.forEach((osc) => {
      try {
        osc.stop();
        this.activeNodes.delete(osc);
      } catch (e) {
        // Oscillator may already be stopped
      }
    });
    synth.oscillators = [];
    synth.isPlaying = false;
  }

  // Procedural sound generation for particle systems
  createParticleSound(position, velocity, particleType = "default") {
    if (!this.enabled) return;

    const distance = position.length();
    const speed = velocity.length();

    // Map 3D position to stereo field
    const pan = Math.max(-1, Math.min(1, position.x / 10));

    // Map distance to volume
    const distanceGain = Math.max(0, 1 - distance / 50);

    // Map speed to frequency
    const baseFreq = this.getParticleFrequency(particleType);
    const frequency = baseFreq + speed * 50;

    const duration = 0.05 + speed * 0.1;
    const gain = distanceGain * speed * 0.1;

    this.playPositionalTone(frequency, duration, gain, pan);
  }

  // Positional audio with panning
  playPositionalTone(frequency, duration, gain, pan = 0) {
    if (!this.enabled) return;

    const { oscillator, gainNode } = this.createOscillator(frequency, "sine", {
      gain,
    });
    if (!oscillator) return;

    // Create panner
    const pannerNode = this.context.createStereoPanner();
    pannerNode.pan.setValueAtTime(pan, this.context.currentTime);

    // Reconnect with panner
    oscillator.disconnect();
    oscillator.connect(gainNode);
    gainNode.connect(pannerNode);
    pannerNode.connect(this.masterGain);

    const now = this.context.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);

    this.activeNodes.add(pannerNode);
    oscillator.onended = () => {
      this.activeNodes.delete(pannerNode);
    };
  }

  // Audio analysis for visualizations
  getFrequencyData() {
    if (!this.analyser) return null;

    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getAverageFrequency() {
    const data = this.getFrequencyData();
    if (!data) return 0;

    const sum = Array.from(data).reduce((a, b) => a + b, 0);
    return sum / data.length;
  }

  // Cleanup methods
  stopAll() {
    // Stop all synthesizers
    this.synthesizers.forEach((synth, name) => {
      this.stopSynthesizer(name);
    });

    // Stop all active nodes
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Node may already be stopped
      }
    });

    this.activeNodes.clear();
  }

  dispose() {
    this.stopAll();
    this.synthesizers.clear();
    this.oscillators.clear();
    this.effects.clear();

    if (this.context) {
      this.context.close();
      this.context = null;
    }

    this.isInitialized = false;
    console.log("🗑️ Audio system disposed");
  }

  // Utility methods
  mapVelocityToFrequency(velocity, material) {
    const baseFreqs = {
      metal: 800,
      glass: 1200,
      soft: 200,
      default: 440,
    };

    const base = baseFreqs[material] || baseFreqs.default;
    return base + velocity * 500;
  }

  mapVelocityToDuration(velocity) {
    return 0.05 + velocity * 0.15;
  }

  getParticleFrequency(type) {
    const freqs = {
      water: 200,
      fire: 800,
      electric: 1500,
      default: 440,
    };
    return freqs[type] || freqs.default;
  }

  // Note conversion utilities
  noteToFrequency(note, octave = 4) {
    const noteMap = {
      C: 0,
      "C#": 1,
      Db: 1,
      D: 2,
      "D#": 3,
      Eb: 3,
      E: 4,
      F: 5,
      "F#": 6,
      Gb: 6,
      G: 7,
      "G#": 8,
      Ab: 8,
      A: 9,
      "A#": 10,
      Bb: 10,
      B: 11,
    };

    const semitone = noteMap[note];
    if (semitone === undefined) return 440;

    return 440 * Math.pow(2, (semitone - 9 + (octave - 4) * 12) / 12);
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = AudioSystem;
}
