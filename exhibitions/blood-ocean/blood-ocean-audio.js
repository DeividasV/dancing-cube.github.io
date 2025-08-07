// BL00D_0C34N - Enhanced Audio System
// Production-ready Web Audio with compliance, safety, and spatial audio

class BloodOceanAudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.soundEnabled = false;
    this.isInitialized = false;
    this.ambientSources = [];
    this.ambientTimers = [];

    // Load settings from localStorage
    this.loadSettings();

    // Don't initialize audio context until user gesture
    console.log("Blood Ocean Audio System created (waiting for user gesture)");
  }

  loadSettings() {
    try {
      const savedVolume = localStorage.getItem("bloodOceanVolume");
      const savedEnabled = localStorage.getItem("bloodOceanSoundEnabled");

      this.masterVolume = savedVolume ? parseFloat(savedVolume) : 0.35;
      this.soundEnabled = savedEnabled === "true";

      console.log(
        `Audio settings loaded: volume=${this.masterVolume}, enabled=${this.soundEnabled}`
      );
    } catch (e) {
      console.warn("Could not load audio settings from localStorage:", e);
      this.masterVolume = 0.35;
      this.soundEnabled = false;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem("bloodOceanVolume", this.masterVolume.toString());
      localStorage.setItem(
        "bloodOceanSoundEnabled",
        this.soundEnabled.toString()
      );
    } catch (e) {
      console.warn("Could not save audio settings to localStorage:", e);
    }
  }

  // Only call this after a user gesture for autoplay compliance
  async initAudio() {
    if (this.isInitialized) return true;

    try {
      console.log("Initializing Web Audio API...");

      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create compressor for audio safety
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(
        -24,
        this.audioContext.currentTime
      );
      this.compressor.knee.setValueAtTime(30, this.audioContext.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.audioContext.currentTime);
      this.compressor.attack.setValueAtTime(
        0.003,
        this.audioContext.currentTime
      );
      this.compressor.release.setValueAtTime(
        0.25,
        this.audioContext.currentTime
      );

      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );

      // Connect: masterGain -> compressor -> destination
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);

      // Resume context if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log(
        `Audio initialized: state=${this.audioContext.state}, sampleRate=${this.audioContext.sampleRate}`
      );
      return true;
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
      this.soundEnabled = false;
      return false;
    }
  }

  async toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log(`Sound ${this.soundEnabled ? "enabled" : "disabled"}`);

    if (this.soundEnabled) {
      // Initialize audio context on first enable (user gesture)
      const initialized = await this.initAudio();
      if (!initialized) {
        this.soundEnabled = false;
        return false;
      }

      // Play brief confirmation sound
      setTimeout(() => {
        this.playTone(880, 0.5, "sine", 0.3);
      }, 100);

      // Start ambient sounds
      setTimeout(() => {
        this.startBackgroundAmbient();
      }, 600);
    } else {
      this.stopBackgroundAmbient();
    }

    this.saveSettings();
    return this.soundEnabled;
  }

  isEnabled() {
    return this.soundEnabled && this.isInitialized;
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );
    }
    this.saveSettings();
    console.log(`Master volume set to: ${this.masterVolume}`);
  }

  // Enhanced tone generation with spatial positioning
  async playTone(
    frequency,
    duration = 0.3,
    type = "sine",
    volume = 0.1,
    pan = 0
  ) {
    if (!this.isEnabled()) return;

    try {
      // Resume context if needed
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      const panner = this.audioContext.createStereoPanner();

      // Set up oscillator
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );

      // Ocean-like filter
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      // Spatial positioning
      panner.pan.value = Math.max(-1, Math.min(1, pan));

      // Envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      // Connect: oscillator -> filter -> gain -> panner -> master
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(this.masterGain);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      console.log(`Playing tone: ${frequency}Hz, pan: ${pan.toFixed(2)}`);
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }

  startBackgroundAmbient() {
    if (!this.isEnabled()) return;

    console.log("Starting enhanced background ambient sounds...");
    this.stopBackgroundAmbient();

    // Create ambient sources
    this.createOceanDrone();
    this.createWaveNoise();
    this.scheduleWaveSounds();
  }

  stopBackgroundAmbient() {
    console.log(
      `Stopping ${this.ambientSources.length} ambient sources and ${this.ambientTimers.length} timers`
    );

    // Stop all ambient sources
    this.ambientSources.forEach((source, index) => {
      try {
        if (source.stop) {
          source.stop();
        } else if (source.disconnect) {
          source.disconnect();
        }
      } catch (e) {
        console.warn(`Error stopping ambient source ${index}:`, e);
      }
    });
    this.ambientSources = [];

    // Clear all timers
    this.ambientTimers.forEach((timer) => clearTimeout(timer));
    this.ambientTimers = [];
  }

  createOceanDrone() {
    if (!this.isEnabled()) return;

    try {
      // Deep bass drone (60Hz)
      const bassOsc = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      const bassFilter = this.audioContext.createBiquadFilter();

      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(60, this.audioContext.currentTime);

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(120, this.audioContext.currentTime);
      bassFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

      bassGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      bassGain.gain.linearRampToValueAtTime(
        0.25,
        this.audioContext.currentTime + 2
      );

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start();
      this.ambientSources.push(bassOsc);

      // Mid-frequency drone with slight detuning (90Hz)
      const midOsc = this.audioContext.createOscillator();
      const midGain = this.audioContext.createGain();
      const midFilter = this.audioContext.createBiquadFilter();

      midOsc.type = "triangle";
      midOsc.frequency.setValueAtTime(90, this.audioContext.currentTime);

      midFilter.type = "lowpass";
      midFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
      midFilter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      midGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      midGain.gain.linearRampToValueAtTime(
        0.15,
        this.audioContext.currentTime + 3
      );

      midOsc.connect(midFilter);
      midFilter.connect(midGain);
      midGain.connect(this.masterGain);

      midOsc.start();
      this.ambientSources.push(midOsc);

      console.log("Ocean drone created successfully");
    } catch (error) {
      console.error("Error creating ocean drone:", error);
    }
  }

  // Create noise-based wave sounds instead of tones
  createWaveNoise() {
    if (!this.isEnabled()) return;

    try {
      // Create brown noise buffer for more natural wave sounds
      const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate brown noise (more natural than white noise)
      let lastValue = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastValue + 0.02 * white) / 1.02;
        lastValue = data[i];
        data[i] *= 3.5; // Amplify
      }

      // Create buffer source
      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for wave-like sound
      const lowpass = this.audioContext.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(600, this.audioContext.currentTime);
      lowpass.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      // LFO for natural wave modulation
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      lfo.frequency.value = 0.08; // Slow wave modulation
      lfoGain.gain.value = 500;

      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      // Volume control
      const waveGain = this.audioContext.createGain();
      waveGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      waveGain.gain.linearRampToValueAtTime(
        0.12,
        this.audioContext.currentTime + 4
      );

      // Connect: noise -> lowpass -> gain -> master
      noiseSource.connect(lowpass);
      lowpass.connect(waveGain);
      waveGain.connect(this.masterGain);

      noiseSource.start();
      lfo.start();

      this.ambientSources.push(noiseSource, lfo);

      console.log("Wave noise created successfully");
    } catch (error) {
      console.error("Error creating wave noise:", error);
    }
  }

  scheduleWaveSounds() {
    if (!this.isEnabled()) return;

    const scheduleNextWave = () => {
      if (!this.isEnabled()) return;

      // Generate wave sound with noise instead of pure tone
      this.playWaveNoise();

      // Schedule next wave (3-9 seconds)
      const nextDelay = 3000 + Math.random() * 6000;
      const timer = setTimeout(scheduleNextWave, nextDelay);
      this.ambientTimers.push(timer);
    };

    // Start scheduling after initial delay
    const timer = setTimeout(scheduleNextWave, 2000);
    this.ambientTimers.push(timer);
  }

  playWaveNoise() {
    if (!this.isEnabled()) return;

    try {
      // Create short burst of filtered noise for wave sound
      const bufferSize = this.audioContext.sampleRate * 0.5; // 0.5 seconds
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate pink noise for more natural wave sound
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }

      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        80 + Math.random() * 60,
        this.audioContext.currentTime
      );
      filter.Q.setValueAtTime(2, this.audioContext.currentTime);

      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(
        0.2,
        this.audioContext.currentTime + 0.05
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 1.5
      );

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noiseSource.start();
    } catch (error) {
      console.error("Error playing wave noise:", error);
    }
  }

  // Enhanced wave interaction with spatial audio
  async playWaveInteraction(intensity = 1.0, pan = 0) {
    if (!this.isEnabled()) return;

    try {
      // Resume context if needed
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create short noise burst for splash
      const bufferSize = this.audioContext.sampleRate * 0.3;
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate
      );
      const data = buffer.getChannelData(0);

      // Generate noise with envelope
      for (let i = 0; i < data.length; i++) {
        const t = i / bufferSize;
        const envelope = Math.exp(-t * 8) * (1 - t);
        data[i] = (Math.random() * 2 - 1) * envelope * intensity;
      }

      const splashSource = this.audioContext.createBufferSource();
      splashSource.buffer = buffer;

      // Filter for splash character
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(
        120 + intensity * 80,
        this.audioContext.currentTime
      );
      filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

      // Spatial positioning
      const panner = this.audioContext.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));

      const gain = this.audioContext.createGain();
      gain.gain.value = 0.15 * intensity;

      splashSource.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain);

      splashSource.start();

      console.log(
        `Wave interaction: intensity=${intensity.toFixed(2)}, pan=${pan.toFixed(
          2
        )}`
      );
    } catch (error) {
      console.error("Error playing wave interaction:", error);
    }
  }

  dispose() {
    console.log("Disposing audio system...");

    this.stopBackgroundAmbient();

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.isInitialized = false;
    this.soundEnabled = false;

    console.log("Audio system disposed");
  }
}

// Create global audio system instance
window.bloodOceanAudio = new BloodOceanAudioSystem();

// Global function for framework compatibility
window.toggleAppSound = async function () {
  console.log("toggleAppSound called for blood-ocean");

  if (window.bloodOceanAudio) {
    return await window.bloodOceanAudio.toggleSound();
  } else {
    console.error("Blood Ocean audio system not available");
    return false;
  }
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = BloodOceanAudioSystem;
}
