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
    this.waveScheduleMultiplier = 1.0; // For dynamic wave timing

    // Load settings from localStorage
    this.loadSettings();

    // Don't initialize audio context until user gesture
    console.log("Blood Ocean Audio System created (waiting for user gesture)");
  }

  loadSettings() {
    try {
      const savedVolume = localStorage.getItem("bloodOceanVolume");
      const savedEnabled = localStorage.getItem("bloodOceanSoundEnabled");

      this.masterVolume = savedVolume ? parseFloat(savedVolume) : 0.5; // Increased default volume
      this.soundEnabled = savedEnabled === "true";

      console.log(
        `Audio settings loaded: volume=${this.masterVolume}, enabled=${this.soundEnabled}`
      );
    } catch (e) {
      console.warn("Could not load audio settings from localStorage:", e);
      this.masterVolume = 0.5; // Increased default volume
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
    console.log(
      `toggleSound called. Current state: enabled=${this.soundEnabled}, initialized=${this.isInitialized}`
    );

    this.soundEnabled = !this.soundEnabled;
    console.log(`Sound ${this.soundEnabled ? "enabled" : "disabled"}`);

    if (this.soundEnabled) {
      // Initialize audio context on first enable (user gesture)
      const initialized = await this.initAudio();
      if (!initialized) {
        console.error("Failed to initialize audio, disabling sound");
        this.soundEnabled = false;
        return false;
      }

      // Play brief confirmation sound
      setTimeout(() => {
        console.log("Playing confirmation beep...");
        this.playTone(880, 0.5, "sine", 0.4); // Increased volume from 0.3 to 0.4
      }, 100);

      // Start ambient sounds
      setTimeout(() => {
        console.log("Starting background ambient...");
        this.startBackgroundAmbient();
      }, 600);
    } else {
      console.log("Stopping background ambient...");
      this.stopBackgroundAmbient();
    }

    this.saveSettings();
    console.log(`Toggle complete. Final state: enabled=${this.soundEnabled}`);
    return this.soundEnabled;
  }

  isEnabled() {
    return this.soundEnabled && this.isInitialized;
  }

  getStatus() {
    return {
      soundEnabled: this.soundEnabled,
      isInitialized: this.isInitialized,
      audioContextState: this.audioContext ? this.audioContext.state : "null",
      masterVolume: this.masterVolume,
      ambientSourcesCount: this.ambientSources.length,
      ambientTimersCount: this.ambientTimers.length,
    };
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
    if (!this.isEnabled()) {
      console.log("Cannot start ambient - audio not enabled");
      return;
    }

    console.log("Starting enhanced background ambient sounds...");
    this.stopBackgroundAmbient();

    // Add delay to ensure audio context is fully ready
    setTimeout(() => {
      if (!this.isEnabled()) return;

      // Create ambient sources
      this.createOceanDrone();
      this.createWaveNoise();
      this.scheduleWaveSounds();

      console.log(
        `Started ${this.ambientSources.length} ambient sources and ${this.ambientTimers.length} timers`
      );
    }, 200);
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
    if (!this.isEnabled()) {
      console.log("Cannot create ocean drone - audio not enabled");
      return;
    }

    try {
      console.log("Creating ocean drone...");

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
        0.3, // Restored ambient volume for better ocean atmosphere
        this.audioContext.currentTime + 2
      );

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start();
      this.ambientSources.push(bassOsc);
      console.log("Bass drone created and started");

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
        0.2, // Restored ambient volume for better ocean atmosphere
        this.audioContext.currentTime + 3
      );

      midOsc.connect(midFilter);
      midFilter.connect(midGain);
      midGain.connect(this.masterGain);

      midOsc.start();
      this.ambientSources.push(midOsc);
      console.log("Mid drone created and started");

      console.log(
        `Ocean drone created successfully with ${this.ambientSources.length} sources`
      );
    } catch (error) {
      console.error("Error creating ocean drone:", error);
    }
  }

  // Create noise-based wave sounds instead of tones
  createWaveNoise() {
    if (!this.isEnabled()) {
      console.log("Cannot create wave noise - audio not enabled");
      return;
    }

    try {
      console.log("Creating wave noise...");

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
        0.15, // Restored ambient volume for better ocean atmosphere
        this.audioContext.currentTime + 4
      );

      // Connect: noise -> lowpass -> gain -> master
      noiseSource.connect(lowpass);
      lowpass.connect(waveGain);
      waveGain.connect(this.masterGain);

      noiseSource.start();
      lfo.start();

      this.ambientSources.push(noiseSource, lfo);
      console.log("Wave noise created and started");

      console.log(
        `Wave noise created successfully, total sources: ${this.ambientSources.length}`
      );
    } catch (error) {
      console.error("Error creating wave noise:", error);
    }
  }

  scheduleWaveSounds() {
    if (!this.isEnabled()) {
      console.log("Cannot schedule wave sounds - audio not enabled");
      return;
    }

    console.log("Scheduling wave sounds...");

    const scheduleNextWave = () => {
      if (!this.isEnabled()) return;

      // Generate wave sound with noise instead of pure tone
      this.playWaveNoise();

      // Schedule next wave (2-6 seconds, modified by activity level)
      const baseDelay = 2000 + Math.random() * 4000;
      const nextDelay = baseDelay * (this.waveScheduleMultiplier || 1.0);
      const timer = setTimeout(scheduleNextWave, nextDelay);
      this.ambientTimers.push(timer);
      console.log(
        `Next wave scheduled in ${(nextDelay / 1000).toFixed(
          1
        )}s (multiplier: ${(this.waveScheduleMultiplier || 1.0).toFixed(2)})`
      );
    };

    // Start scheduling after initial delay (reduced from 2000ms to 1000ms)
    const timer = setTimeout(scheduleNextWave, 1000);
    this.ambientTimers.push(timer);
    console.log("Wave scheduling initialized");
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
        0.3, // Increased from 0.2
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

  // Enhanced wave interaction with physics-based sound generation
  async playWaveInteraction(intensity = 1.0, pan = 0, rippleData = null) {
    if (!this.isEnabled()) {
      console.log("playWaveInteraction called but audio not enabled");
      return;
    }

    console.log("playWaveInteraction called:", { intensity, pan, rippleData });

    try {
      // Resume context if needed
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Defaults
      let energy = 0.8,
        slope = 0.4,
        curvature = 0.0,
        vertVel = 0.3,
        maxRadius = 100;
      if (rippleData) {
        energy = rippleData.energy ?? energy;
        slope = rippleData.slope ?? slope;
        curvature = rippleData.curvature ?? curvature;
        vertVel = rippleData.vertVel ?? vertVel;
        maxRadius = rippleData.maxRadius ?? maxRadius;
      }

      // Map physics -> sound parameters
      const brightness = 300 + slope * 1800; // splash brightness (Hz)
      const burstDur = 0.18 + energy * 0.25; // 0.18..0.43s
      const burstGain = 0.18 + energy * 0.5; // loudness
      const chirpStart = 220 + vertVel * 600; // chirp start
      const chirpEnd = chirpStart * 0.5; // downward sweep
      const hasThump = curvature > 0.15; // concave pocket

      console.log("Physics-based sound parameters:", {
        brightness,
        burstDur,
        burstGain,
        chirpStart,
        chirpEnd,
        hasThump,
        slope,
        curvature,
        vertVel,
        energy,
      });

      // === SPLASH (pink-noise burst, bandpass) ===
      const splashBuf = this._makePinkNoise(burstDur);
      const splashSrc = this.audioContext.createBufferSource();
      splashSrc.buffer = splashBuf;

      const bp = this.audioContext.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(brightness, this.audioContext.currentTime);
      bp.Q.setValueAtTime(1.2 + slope * 2.0, this.audioContext.currentTime);

      const splashPan = this.audioContext.createStereoPanner();
      splashPan.pan.value = Math.max(-1, Math.min(1, pan));

      const splashGain = this.audioContext.createGain();
      // sharp attack + expo release
      const t0 = this.audioContext.currentTime;
      splashGain.gain.setValueAtTime(0, t0);
      splashGain.gain.linearRampToValueAtTime(burstGain, t0 + 0.012);
      splashGain.gain.exponentialRampToValueAtTime(0.001, t0 + burstDur);

      splashSrc.connect(bp);
      bp.connect(splashGain);
      splashGain.connect(splashPan);
      splashPan.connect(this.masterGain);

      // === CHIRP (short sine/triangle sweep for "slap") ===
      const chirp = this.audioContext.createOscillator();
      chirp.type = "triangle";
      chirp.frequency.setValueAtTime(chirpStart, t0);
      chirp.frequency.exponentialRampToValueAtTime(
        chirpEnd,
        t0 + burstDur * 0.9
      );

      const chirpGain = this.audioContext.createGain();
      const chirpLvl = 0.05 + vertVel * 0.18; // louder with vertical motion
      chirpGain.gain.setValueAtTime(0, t0);
      chirpGain.gain.linearRampToValueAtTime(chirpLvl, t0 + 0.01);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, t0 + burstDur);

      const chirpPan = this.audioContext.createStereoPanner();
      chirpPan.pan.value = splashPan.pan.value;

      chirp.connect(chirpGain);
      chirpGain.connect(chirpPan);
      chirpPan.connect(this.masterGain);

      // === Optional THUMP (very short low sine if concave) ===
      let thumpOsc = null,
        thumpGain = null;
      if (hasThump) {
        thumpOsc = this.audioContext.createOscillator();
        thumpOsc.type = "sine";
        const f0 = 60 + Math.min(40, curvature * 120); // 60..100 Hz
        thumpOsc.frequency.setValueAtTime(f0, t0);

        thumpGain = this.audioContext.createGain();
        const lvl = 0.06 + Math.min(0.12, curvature * 0.25);
        thumpGain.gain.setValueAtTime(0, t0);
        thumpGain.gain.linearRampToValueAtTime(lvl, t0 + 0.01);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);

        const thumpPan = this.audioContext.createStereoPanner();
        thumpPan.pan.value = splashPan.pan.value;

        thumpOsc.connect(thumpGain);
        thumpGain.connect(thumpPan);
        thumpPan.connect(this.masterGain);

        console.log("Added thump component:", { frequency: f0, level: lvl });
      }

      // Start/stop
      splashSrc.start(t0);
      chirp.start(t0);
      if (thumpOsc) thumpOsc.start(t0);

      splashSrc.stop(t0 + burstDur + 0.05);
      chirp.stop(t0 + burstDur + 0.05);
      if (thumpOsc) thumpOsc.stop(t0 + 0.25);

      console.log(
        `Physics-driven ripple: slope=${slope.toFixed(
          2
        )}, curvature=${curvature.toFixed(2)}, vertVel=${vertVel.toFixed(
          2
        )}, energy=${energy.toFixed(2)}`
      );
    } catch (err) {
      console.error("playWaveInteraction error:", err);
    }
  }

  // Update ambient sounds based on visual wave activity
  updateAmbientWithWaveData(waveData) {
    if (!this.isEnabled() || this.ambientSources.length === 0) return;

    try {
      // waveData should contain: { rippleCount, averageAmplitude, waveIntensity, time }
      const {
        rippleCount = 0,
        averageAmplitude = 0,
        waveIntensity = 0.5,
        time = 0,
      } = waveData;

      // Modulate ocean drone based on wave activity
      if (this.ambientSources.length >= 2) {
        // Bass oscillator (index 0)
        const bassOsc = this.ambientSources[0];
        if (bassOsc.frequency) {
          // Vary bass frequency slightly based on wave activity (58-62 Hz)
          const bassFreq =
            60 + Math.sin(time * 0.1) * 2 + (waveIntensity - 0.5) * 4;
          bassOsc.frequency.setValueAtTime(
            bassFreq,
            this.audioContext.currentTime
          );
        }

        // Mid oscillator (index 1)
        const midOsc = this.ambientSources[1];
        if (midOsc.frequency) {
          // Vary mid frequency based on ripple activity (85-95 Hz)
          const midFreq = 90 + Math.sin(time * 0.15 + 1) * 5 + rippleCount / 10;
          midOsc.frequency.setValueAtTime(
            Math.min(midFreq, 95),
            this.audioContext.currentTime
          );
        }
      }

      // Modulate wave noise LFO if available
      if (this.ambientSources.length >= 4) {
        const lfo = this.ambientSources[3]; // LFO should be 4th source
        if (lfo.frequency) {
          // Speed up wave modulation when there's more activity
          const lfoFreq = 0.08 + waveIntensity * 0.05 + rippleCount * 0.002;
          lfo.frequency.setValueAtTime(
            Math.min(lfoFreq, 0.2),
            this.audioContext.currentTime
          );
        }
      }

      // Adjust the scheduled wave sounds frequency based on activity
      if (averageAmplitude > 0.7) {
        // More frequent waves when there's high visual activity
        this.waveScheduleMultiplier = 0.7;
      } else if (averageAmplitude < 0.3) {
        // Less frequent waves when calm
        this.waveScheduleMultiplier = 1.3;
      } else {
        this.waveScheduleMultiplier = 1.0;
      }
    } catch (error) {
      console.warn("Error updating ambient with wave data:", error);
    }
  }

  // helper: quick pink noise buffer
  _makePinkNoise(durationSec) {
    const len = Math.max(
      1,
      Math.floor(this.audioContext.sampleRate * durationSec)
    );
    const buf = this.audioContext.createBuffer(
      1,
      len,
      this.audioContext.sampleRate
    );
    const out = buf.getChannelData(0);
    // Voss-McCartney-ish pink
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buf;
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

  // Prevent rapid toggling
  if (window.toggleAppSound._debouncing) {
    console.log("Toggle debounced - ignoring rapid call");
    return window.bloodOceanAudio ? window.bloodOceanAudio.soundEnabled : false;
  }

  window.toggleAppSound._debouncing = true;

  try {
    if (window.bloodOceanAudio) {
      const result = await window.bloodOceanAudio.toggleSound();
      console.log("Toggle result:", result);
      return result;
    } else {
      console.error("Blood Ocean audio system not available");
      return false;
    }
  } finally {
    // Clear debounce after a short delay
    setTimeout(() => {
      window.toggleAppSound._debouncing = false;
    }, 1000);
  }
};

// Debug function to check audio status
window.debugBloodOceanAudio = function () {
  if (window.bloodOceanAudio) {
    const status = window.bloodOceanAudio.getStatus();
    console.log("Blood Ocean Audio Status:", status);
    return status;
  } else {
    console.error("Blood Ocean audio system not available");
    return null;
  }
};

// Debug function to test audio manually
window.testBloodOceanAudio = async function () {
  if (window.bloodOceanAudio) {
    console.log("Testing Blood Ocean Audio...");

    // Force enable if not already
    if (!window.bloodOceanAudio.isEnabled()) {
      console.log("Audio not enabled, enabling...");
      await window.bloodOceanAudio.toggleSound();
    }

    // Test tone
    console.log("Playing test tone...");
    window.bloodOceanAudio.playTone(440, 1.0, "sine", 0.3);

    // Test wave interaction
    setTimeout(() => {
      console.log("Playing wave interaction...");
      window.bloodOceanAudio.playWaveInteraction(1.0, 0);
    }, 1200);

    return "Audio test started";
  } else {
    console.error("Blood Ocean audio system not available");
    return false;
  }
};

// Debug function to reset audio settings
window.resetBloodOceanAudio = function () {
  localStorage.removeItem("bloodOceanVolume");
  localStorage.removeItem("bloodOceanSoundEnabled");
  console.log("Blood Ocean audio settings reset. Reload page to apply.");
};

// Debug function to test contextual ripple sounds
window.testContextualRipples = function () {
  if (!window.bloodOceanAudio || !window.bloodOceanAudio.isEnabled()) {
    console.log("Audio not enabled. Enable audio first with the sound button.");
    return;
  }

  console.log("Testing new ripple-like sounds...");

  // Test small mouse ripple
  setTimeout(() => {
    console.log("Small mouse ripple (high freq, short)...");
    const smallRippleData = {
      maxRadius: 35,
      intensity: 0.4,
      position: { x: 0, z: 0 },
      type: "mouse",
    };
    window.bloodOceanAudio.playWaveInteraction(0.4, 0, smallRippleData);
  }, 500);

  // Test medium click ripple
  setTimeout(() => {
    console.log("Medium click ripple (mid freq, medium)...");
    const mediumRippleData = {
      maxRadius: 100,
      intensity: 1.0,
      position: { x: 200, z: 100 },
      type: "click",
    };
    window.bloodOceanAudio.playWaveInteraction(1.0, 0.3, mediumRippleData);
  }, 1800);

  // Test large click ripple
  setTimeout(() => {
    console.log("Large click ripple (low freq, long, harmonics)...");
    const largeRippleData = {
      maxRadius: 180,
      intensity: 2.0,
      position: { x: -100, z: 200 },
      type: "click",
    };
    window.bloodOceanAudio.playWaveInteraction(1.2, -0.5, largeRippleData);
  }, 3200);

  // Test extra large ripple
  setTimeout(() => {
    console.log(
      "Extra large ripple (very low freq, very long, rich harmonics)..."
    );
    const extraLargeRippleData = {
      maxRadius: 250,
      intensity: 2.5,
      position: { x: 0, z: 0 },
      type: "click",
    };
    window.bloodOceanAudio.playWaveInteraction(1.5, 0, extraLargeRippleData);
  }, 5000);

  return "Ripple sound test started - listen for frequency sweeps and expanding wave sounds!";
};

// Simple test for immediate ripple sound
window.testSingleRipple = function () {
  if (!window.bloodOceanAudio || !window.bloodOceanAudio.isEnabled()) {
    console.log("Audio not enabled. Enable audio first with the sound button.");
    return;
  }

  console.log("Testing single ripple sound immediately...");
  const rippleData = {
    maxRadius: 180,
    intensity: 2.0,
    position: { x: 0, z: 0 },
    type: "click",
  };
  window.bloodOceanAudio.playWaveInteraction(1.2, 0, rippleData);
  return "Single ripple test fired!";
};

// Test immediate loud beep to verify audio output
window.testLoudBeep = function () {
  if (!window.bloodOceanAudio || !window.bloodOceanAudio.isEnabled()) {
    console.log("Audio not enabled. Enable audio first with the sound button.");
    return;
  }

  console.log("Testing loud beep...");
  window.bloodOceanAudio.playTone(800, 0.5, "sine", 0.8); // Very loud test tone
  return "Loud beep test fired!";
};

// Test new physics-based ripple sounds
window.testPhysicsRipples = function () {
  if (!window.bloodOceanAudio || !window.bloodOceanAudio.isEnabled()) {
    console.log("Audio not enabled. Enable audio first with the sound button.");
    return;
  }

  console.log("Testing new physics-based ripple sounds...");

  // Test sharp steep slope (bright, hissy splash)
  setTimeout(() => {
    console.log("Sharp slope ripple (bright & hissy)...");
    const sharpRippleData = {
      energy: 0.9,
      slope: 0.8, // High slope = bright splash
      curvature: 0.1, // Slightly convex
      vertVel: 0.6, // Medium velocity
      maxRadius: 100,
    };
    window.bloodOceanAudio.playWaveInteraction(1.0, 0, sharpRippleData);
  }, 500);

  // Test high vertical velocity (loud, sharp attack)
  setTimeout(() => {
    console.log("High velocity ripple (loud & sharp)...");
    const fastRippleData = {
      energy: 1.0,
      slope: 0.4, // Medium slope
      curvature: 0.0, // Flat
      vertVel: 0.9, // High velocity = loud chirp
      maxRadius: 120,
    };
    window.bloodOceanAudio.playWaveInteraction(1.2, 0.3, fastRippleData);
  }, 1800);

  // Test concave curvature (deep thump)
  setTimeout(() => {
    console.log("Concave curvature ripple (deep thump)...");
    const concaveRippleData = {
      energy: 0.8,
      slope: 0.3, // Low slope = darker splash
      curvature: 0.6, // High concavity = thump
      vertVel: 0.4, // Medium velocity
      maxRadius: 150,
    };
    window.bloodOceanAudio.playWaveInteraction(1.0, -0.5, concaveRippleData);
  }, 3200);

  // Test extreme physics (all components)
  setTimeout(() => {
    console.log("Extreme physics ripple (all components)...");
    const extremeRippleData = {
      energy: 1.2,
      slope: 0.9, // Very steep = very bright
      curvature: 0.7, // Very concave = deep thump
      vertVel: 0.8, // High velocity = loud chirp
      maxRadius: 200,
    };
    window.bloodOceanAudio.playWaveInteraction(1.5, 0, extremeRippleData);
  }, 5000);

  return "Physics-based ripple test started - listen for brightness, chirps, and thumps!";
};

// Force enable audio (bypass toggle issues)
window.forceEnableBloodOceanAudio = async function () {
  if (!window.bloodOceanAudio) {
    console.error("Blood Ocean audio system not available");
    return false;
  }

  console.log("Force enabling audio...");

  // Force enable without toggle
  window.bloodOceanAudio.soundEnabled = true;

  // Initialize if not already
  const initialized = await window.bloodOceanAudio.initAudio();
  if (!initialized) {
    console.error("Failed to initialize audio");
    window.bloodOceanAudio.soundEnabled = false;
    return false;
  }

  // Start ambient
  setTimeout(() => {
    window.bloodOceanAudio.startBackgroundAmbient();
  }, 500);

  // Test sound
  setTimeout(() => {
    console.log("Playing test beep...");
    window.bloodOceanAudio.playTone(880, 0.5, "sine", 0.4);
  }, 100);

  window.bloodOceanAudio.saveSettings();
  console.log("Audio force-enabled successfully!");

  return true;
};

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = BloodOceanAudioSystem;
}
