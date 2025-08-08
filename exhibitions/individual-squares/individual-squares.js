/**
 * Futuristic Individual Squares Visualization
 * Creates an elegant, sci-fi inspired grid of animated squares with rich audio
 */

// Configuration object for cyberpunk theme
const FUTURISTIC_CONFIG = {
  // Visual settings
  grid: {
    size: 10,
    totalSquares: 100,
    maxWidth: 520,
    gap: 3,
    padding: 35,
  },

  // Cyberpunk theme only
  theme: {
    name: "Cyberpunk Neon",
    colors: ["#00ff88", "#ff0080", "#00d4ff", "#7c4dff"],
    glow: "rgba(0, 255, 136, 0.4)",
    cssVars: {
      "--theme-primary": "#00ff88",
      "--theme-secondary": "#ff0080",
      "--theme-accent": "#00d4ff",
      "--theme-glow": "rgba(0, 255, 136, 0.4)",
    },
  },

  // Animation settings
  animations: {
    entranceDelay: 20, // ms between square entrances
    breathingDuration: 6000,
    pulseDuration: 1500,
    gradientDuration: 8000,
    rippleDuration: 800,
  },

  // Audio settings
  audio: {
    masterVolume: 0.25,
    scales: {
      pentatonic: [261.6, 293.7, 329.6, 392, 440], // C major pentatonic
      cMajor: [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9],
      chords: {
        cMajor: [261.6, 329.6, 392],
        dMinor: [293.7, 369.99, 440],
        eMinor: [329.6, 415.3, 493.9],
        fMajor: [349.2, 440, 523.3],
        gMajor: [392, 493.9, 587.3],
      },
    },
    effects: {
      reverbDecay: 2.5,
      filterCutoff: 1200,
      ambientVolume: 0.04,
    },
  },
};

class FuturisticSquares {
  constructor() {
    const mainContainer = document.getElementById("container");
    if (!mainContainer) {
      console.error("Container element not found");
      return;
    }

    // Initialize components
    this.config = FUTURISTIC_CONFIG;
    this.animationId = null;

    // Create component instances
    this.visualEngine = new VisualEngine(this.config, mainContainer);
    this.audioEngine = new AudioEngine(this.config.audio);

    // Setup and initialize
    this.initialize();
  }

  async initialize() {
    console.log("FuturisticSquares initialize() starting...");

    // Load CSS if not already loaded
    this.loadFuturisticStyles();

    // Apply cyberpunk theme
    this.applyCyberpunkTheme();

    // Initialize visual components
    this.visualEngine.generateSquares();
    this.visualEngine.setupAnimations();

    // Initialize audio engine
    console.log("Initializing audio engine...");
    await this.audioEngine.initialize();

    // Setup event listeners for keyboard shortcuts and audio activation
    this.setupEventListeners();

    // Sound button will be initialized later after DOM is ready
    console.log(
      "Audio engine ready, sound button will be initialized after DOM"
    );

    // Start the animation loop
    console.log("Starting animation...");
    this.startAnimationLoop();

    console.log("FuturisticSquares initialization completed");
  }

  loadFuturisticStyles() {
    // Check if styles are already loaded
    if (document.querySelector("#futuristic-squares-styles")) {
      return;
    }

    const link = document.createElement("link");
    link.id = "futuristic-squares-styles";
    link.rel = "stylesheet";
    link.href = "./futuristic-squares.css";
    document.head.appendChild(link);
  }

  applyCyberpunkTheme() {
    const theme = this.config.theme;

    // Apply CSS custom properties
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    console.log(`Applied theme: ${theme.name}`);
  }

  setupEventListeners() {
    // Simplified keyboard shortcuts - only regenerate and shuffle
    document.addEventListener("keydown", (e) => {
      switch (e.key.toLowerCase()) {
        case "r":
          this.visualEngine.regenerateAllSquares();
          break;
        case "s":
          this.visualEngine.shuffleColors();
          break;
        case " ":
          e.preventDefault();
          this.toggleSound();
          break;
      }
    });

    // More aggressive audio context activation on user interaction
    const activateAudio = () => {
      console.log("User interaction detected, activating audio context");
      this.audioEngine.activateContext();
    };

    // Add multiple interaction listeners to ensure audio context gets activated
    document.addEventListener("click", activateAudio, { once: true });
    document.addEventListener("keydown", activateAudio, { once: true });
    document.addEventListener("touchstart", activateAudio, { once: true });
    document.addEventListener("mousedown", activateAudio, { once: true });
  }

  startAnimationLoop() {
    let lastTime = 0;
    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update visual engine
      this.visualEngine.update(deltaTime);

      // Continue animation loop
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  // Public methods for external controls
  regenerateSquares() {
    this.audioEngine.playChord(
      this.config.audio.scales.chords.cMajor,
      0.8,
      0.04
    );
    this.visualEngine.regenerateAllSquares();
  }

  shuffleColors() {
    this.audioEngine.playChord([400, 500, 600], 0.5, 0.03);
    this.visualEngine.shuffleColors();
  }

  toggleSound() {
    console.log("FuturisticSquares toggleSound called");
    if (this.audioEngine) {
      this.audioEngine.toggleSound();
    } else {
      console.error("AudioEngine not available");
    }
  }

  destroy() {
    // Clean up resources
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.audioEngine.destroy();
    this.visualEngine.destroy();
  }
}

/**
 * VisualEngine - Handles all visual rendering and animations
 */
class VisualEngine {
  constructor(config, mainContainer) {
    this.config = config;
    this.setupContainer(mainContainer);
    this.squares = [];
    this.pulseQueue = [];
    this.lastPulseTime = 0;
  }

  setupContainer(mainContainer) {
    // Clear the main container
    mainContainer.innerHTML = "";

    // Create the exhibition structure
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";

    const squaresContainer = document.createElement("div");
    squaresContainer.className = "squares-container";
    squaresContainer.id = "squaresContainer";

    mainContent.appendChild(squaresContainer);
    mainContainer.appendChild(mainContent);

    // Store reference to the squares container
    this.container = squaresContainer;
  }

  update(deltaTime) {
    // Handle random pulsing with smooth timing
    this.handleRandomPulsing(deltaTime);
  }

  handleRandomPulsing(deltaTime) {
    this.lastPulseTime += deltaTime;

    // Pulse every 0.5-2.5 seconds
    const nextPulseInterval = 500 + Math.random() * 2000;

    if (this.lastPulseTime >= nextPulseInterval) {
      this.triggerRandomPulse();
      this.lastPulseTime = 0;
    }
  }

  triggerRandomPulse() {
    const squares = this.container.querySelectorAll(".square");
    if (squares.length === 0) return;

    // Pick a random square
    const randomIndex = Math.floor(Math.random() * squares.length);
    const square = squares[randomIndex];

    // Add pulse class
    square.classList.add("pulsing");

    // Play melodic pulse sound through audio engine
    if (window.futuristicSquaresInstance?.audioEngine) {
      const melodicNotes = this.config.audio.scales.pentatonic;
      const randomNote =
        melodicNotes[Math.floor(Math.random() * melodicNotes.length)];
      window.futuristicSquaresInstance.audioEngine.playTone(
        randomNote,
        0.5,
        "triangle",
        0.025
      );
    }

    // Remove pulse class after animation
    setTimeout(() => {
      square.classList.remove("pulsing");
    }, this.config.animations.pulseDuration);
  }

  createThemeGradient(colors) {
    const selectedColors = this.getRandomColorsFromPalette(colors, 4);
    const angle = Math.floor(Math.random() * 360);
    return `linear-gradient(${angle}deg, ${selectedColors.join(", ")})`;
  }

  getRandomColorsFromPalette(palette, count) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      // Add some variation
      const variation = this.addColorVariation(color);
      result.push(variation);
    }
    return result;
  }

  addColorVariation(hexColor) {
    // Convert hex to HSL and add slight variations
    const hsl = this.hexToHSL(hexColor);
    hsl.h += (Math.random() - 0.5) * 30; // ±15 degree hue shift
    hsl.s += (Math.random() - 0.5) * 20; // ±10% saturation shift
    hsl.l += (Math.random() - 0.5) * 20; // ±10% lightness shift

    // Clamp values
    hsl.h = ((hsl.h % 360) + 360) % 360;
    hsl.s = Math.max(0, Math.min(100, hsl.s));
    hsl.l = Math.max(10, Math.min(90, hsl.l));

    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  hexToHSL(hex) {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  generateSquares() {
    // Clear existing squares
    this.container.innerHTML = "";
    this.squares = [];

    // Get cyberpunk theme colors
    const themeColors = this.config.theme.colors;

    for (let i = 1; i <= this.config.grid.totalSquares; i++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.index = i;

      // Give each square a unique gradient from cyberpunk theme
      square.style.background = this.createThemeGradient(themeColors);

      // Add gradient animation with slight variation
      const gradientDuration = 4 + Math.random() * 6; // 4-10 seconds
      square.style.setProperty("--gradient-duration", `${gradientDuration}s`);

      // Add random pulse animation timing
      const pulseDuration = 2 + Math.random() * 4; // 2-6 seconds
      const pulseDelay = Math.random() * 3; // 0-3 seconds delay
      square.style.setProperty("--pulse-duration", `${pulseDuration}s`);
      square.style.setProperty("--pulse-delay", `${pulseDelay}s`);

      // Add entrance delay variation
      const delay = Math.random() * 2; // 0-2 seconds
      square.style.setProperty("--entrance-delay", `${delay}s`);

      // Setup event listeners
      this.setupSquareEventListeners(square, i);

      this.container.appendChild(square);
      this.squares.push(square);
    }
  }

  setupSquareEventListeners(square, index) {
    square.addEventListener("mouseenter", () =>
      this.onSquareHover(square, index)
    );
    square.addEventListener("mouseleave", () => this.onSquareLeave(square));
    square.addEventListener("click", () => this.onSquareClick(square, index));
  }

  setupAnimations() {
    // Stagger the entrance animations
    this.squares.forEach((square, index) => {
      const delay = index * this.config.animations.entranceDelay; // configurable delay
      square.style.setProperty("--entrance-delay", `${delay}ms`);

      // Apply entrance animation with delay
      setTimeout(() => {
        square.classList.add("entered");
      }, delay);
    });
  }

  onSquareHover(square, index) {
    // Play melodic hover sound based on pentatonic scale
    const audioEngine = window.futuristicSquaresInstance?.audioEngine;
    if (audioEngine) {
      const pentatonicScale = this.config.audio.scales.pentatonic;
      const scaleIndex = index % pentatonicScale.length;
      const baseFreq = pentatonicScale[scaleIndex];

      // Add octave variation for variety
      const octaveMultiplier = (Math.floor(index / 20) % 3) + 1;
      const frequency = baseFreq * octaveMultiplier;

      audioEngine.playTone(frequency, 0.25, "sine", 0.04);
    }

    // Create enhanced ripple effect
    this.createEnhancedRipple(square);
  }

  onSquareLeave(square) {
    // Optional: Add leave effect if needed
  }

  onSquareClick(square, index) {
    const audioEngine = window.futuristicSquaresInstance?.audioEngine;
    if (audioEngine) {
      // Play beautiful chord progressions
      const chords = Object.values(this.config.audio.scales.chords);
      const chordIndex = Math.floor(index / 20) % chords.length;
      const chord = chords[chordIndex];
      audioEngine.playChord(chord, 0.6, 0.06);
    }

    // Enhanced visual effects
    this.createClickEffect(square, index);
  }

  createEnhancedRipple(square) {
    const ripple = document.createElement("div");
    ripple.className = "ripple-effect";

    square.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, this.config.animations.rippleDuration);
  }

  createClickEffect(square, index) {
    // Regenerate gradient for clicked square
    const themeColors = this.config.theme.colors;

    square.style.background = this.createThemeGradient(themeColors);

    // Add temporary glow effect using cyberpunk theme
    const themeGlow = this.config.theme.glow;
    square.style.boxShadow = `0 0 30px ${themeGlow}`;
    setTimeout(() => {
      square.style.boxShadow = "";
    }, 300);

    // Create enhanced particle explosion
    this.createEnhancedParticleExplosion(square);
  }

  createEnhancedParticleExplosion(square) {
    const rect = square.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Get cyberpunk theme colors
    const primaryColor = this.config.theme.colors[0];
    const accentColor = this.config.theme.colors[2];
    const themeGlow = this.config.theme.glow;

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 6px;
        height: 6px;
        background: linear-gradient(45deg, ${primaryColor}, ${accentColor});
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 0 6px ${themeGlow};
      `;

      document.body.appendChild(particle);

      const angle = (i * 30 * Math.PI) / 180;
      const distance = 60 + Math.random() * 40;
      const duration = 700 + Math.random() * 300;

      particle
        .animate(
          [
            {
              transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
              opacity: 1,
            },
            {
              transform: `translate(-50%, -50%) translate(${
                Math.cos(angle) * distance
              }px, ${Math.sin(angle) * distance}px) scale(0) rotate(360deg)`,
              opacity: 0,
            },
          ],
          {
            duration: duration,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }
        )
        .addEventListener("finish", () => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle);
          }
        });
    }
  }

  regenerateAllSquares() {
    this.generateSquares();
    this.setupAnimations();
  }

  shuffleColors() {
    const themeColors = this.config.theme.colors;

    this.squares.forEach((square, index) => {
      setTimeout(() => {
        square.style.background = this.createThemeGradient(themeColors);

        // Play color change sound occasionally
        const audioEngine = window.futuristicSquaresInstance?.audioEngine;
        if (audioEngine && audioEngine.soundEnabled && Math.random() < 0.1) {
          const colorFreq = 800 + Math.random() * 400;
          audioEngine.playTone(colorFreq, 0.1, "sine", 0.02);
        }
      }, index * 50);
    });
  }

  destroy() {
    // Clean up event listeners and references
    this.squares = [];
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}

/**
 * AudioEngine - Handles all audio synthesis and effects
 */
class AudioEngine {
  constructor(audioConfig) {
    this.config = audioConfig;
    this.audioContext = null;
    this.masterGain = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientOscillators = [];
    this.backgroundSoundTimer = null;
    this.ambientTimers = [];
    this.reverbNode = null;

    this.initAudio();
  }

  async initialize() {
    console.log("AudioEngine initialize() called");
    // The initAudio() method is already called in constructor
    // This method exists for compatibility with the main class expectations
    return Promise.resolve();
  }

  async initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(
        this.config.masterVolume,
        this.audioContext.currentTime
      );

      // Create enhanced reverb system
      await this.createReverb();

      // Connect to output
      this.masterGain.connect(this.audioContext.destination);

      console.log("Enhanced audio context initialized successfully");
      console.log("Audio context state:", this.audioContext.state);
      console.log("Sound enabled:", this.soundEnabled);
    } catch (e) {
      console.log("Web Audio API not supported:", e);
      this.soundEnabled = false;
    }
  }

  async createReverb() {
    try {
      // Create a simple reverb using convolution
      this.reverbNode = this.audioContext.createConvolver();

      // Generate impulse response for reverb
      const length =
        this.audioContext.sampleRate * this.config.effects.reverbDecay;
      const impulse = this.audioContext.createBuffer(
        2,
        length,
        this.audioContext.sampleRate
      );

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          const decay = Math.pow(1 - i / length, 2);
          channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
        }
      }

      this.reverbNode.buffer = impulse;

      // Create reverb send
      this.reverbSend = this.audioContext.createGain();
      this.reverbReturn = this.audioContext.createGain();

      this.reverbSend.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      this.reverbReturn.gain.setValueAtTime(0.8, this.audioContext.currentTime);

      // Connect reverb chain
      this.reverbSend.connect(this.reverbNode);
      this.reverbNode.connect(this.reverbReturn);
      this.reverbReturn.connect(this.masterGain);
    } catch (e) {
      console.log("Reverb creation failed:", e);
    }
  }

  activateContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      console.log("Activating audio context due to user interaction");
      this.audioContext
        .resume()
        .then(() => {
          console.log(
            "Audio context activated, state:",
            this.audioContext.state
          );
        })
        .catch((err) => {
          console.error("Failed to activate audio context:", err);
        });
    }
  }

  initializeSoundButton() {
    console.log("Initializing sound button...");
    const soundButton = document.querySelector(".sound-toggle-button");
    console.log("Sound button found during init:", !!soundButton);

    if (soundButton) {
      console.log("Button text:", soundButton.textContent);

      // Update button appearance
      soundButton.textContent = this.soundEnabled ? "🔊" : "🔇";
      soundButton.title = this.soundEnabled
        ? "Sound ON - Click to mute"
        : "Sound OFF - Click to enable";

      // Bind click event in JS instead of relying on HTML onclick
      soundButton.addEventListener("click", () => {
        console.log("Sound button clicked via JS event listener");
        if (window.futuristicSquaresInstance) {
          window.futuristicSquaresInstance.toggleSound();
        } else {
          console.error("futuristicSquaresInstance not found");
        }
      });

      console.log(
        "Sound button initialized successfully with JS event binding"
      );
    } else {
      console.error("Sound button not found during initialization!");
    }
  }

  playTone(
    frequency,
    duration = 0.3,
    type = "sine",
    volume = 0.1,
    useEffects = true
  ) {
    if (!this.soundEnabled || !this.audioContext) {
      return;
    }

    // Resume audio context if suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    try {
      // Create oscillator with FM synthesis for richer tones
      const carrier = this.audioContext.createOscillator();
      const modulator = this.audioContext.createOscillator();
      const modulatorGain = this.audioContext.createGain();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      // Setup FM synthesis for richer timbres
      carrier.type = type;
      modulator.type = "sine";

      carrier.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      modulator.frequency.setValueAtTime(
        frequency * 2.1,
        this.audioContext.currentTime
      ); // Slight detuning

      // Modulation depth
      modulatorGain.gain.setValueAtTime(
        frequency * 0.3,
        this.audioContext.currentTime
      );

      // Connect FM synthesis
      modulator.connect(modulatorGain);
      modulatorGain.connect(carrier.frequency);

      // Enhanced filtering
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(
        this.config.effects.filterCutoff + frequency * 0.5,
        this.audioContext.currentTime
      );
      filter.Q.setValueAtTime(1.2, this.audioContext.currentTime);

      // Connect audio chain
      carrier.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Add reverb send if enabled
      if (useEffects && this.reverbSend) {
        gainNode.connect(this.reverbSend);
      }

      // Enhanced envelope with more musical curve
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        volume * 0.1,
        this.audioContext.currentTime + 0.005
      );
      gainNode.gain.exponentialRampToValueAtTime(
        volume,
        this.audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        volume * 0.3,
        this.audioContext.currentTime + duration * 0.7
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + duration
      );

      // Add slight frequency vibrato for organic feel
      const vibrato = this.audioContext.createOscillator();
      const vibratoGain = this.audioContext.createGain();

      vibrato.frequency.setValueAtTime(4.5, this.audioContext.currentTime);
      vibratoGain.gain.setValueAtTime(
        frequency * 0.008,
        this.audioContext.currentTime
      );

      vibrato.connect(vibratoGain);
      vibratoGain.connect(carrier.frequency);

      // Start all oscillators
      carrier.start(this.audioContext.currentTime);
      modulator.start(this.audioContext.currentTime);
      vibrato.start(this.audioContext.currentTime);

      // Stop all oscillators
      const stopTime = this.audioContext.currentTime + duration;
      carrier.stop(stopTime);
      modulator.stop(stopTime);
      vibrato.stop(stopTime);
    } catch (e) {
      console.log("Enhanced audio playback error:", e);
    }
  }

  playChord(frequencies, duration = 0.4, volume = 0.06) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, "sine", volume, true);
      }, index * 50); // Slightly longer stagger for richer effect
    });
  }

  toggleSound() {
    console.log("AudioEngine toggleSound called");
    console.log("Current soundEnabled state:", this.soundEnabled);
    console.log("AudioContext:", this.audioContext);
    console.log("AudioContext state:", this.audioContext?.state);

    // ALWAYS resume AudioContext first if suspended (for user gesture)
    if (this.audioContext && this.audioContext.state === "suspended") {
      console.log("Resuming suspended audio context...");
      this.audioContext.resume().then(() => {
        console.log("Audio context resumed, state:", this.audioContext.state);
      });
    }

    // Toggle the sound state
    this.soundEnabled = !this.soundEnabled;
    console.log("Sound toggled:", this.soundEnabled ? "ON" : "OFF");

    // ALWAYS update UI immediately, regardless of audio state
    const soundButton = document.querySelector(".sound-toggle-button");
    console.log("Sound button found:", !!soundButton);

    if (soundButton) {
      soundButton.textContent = this.soundEnabled ? "🔊" : "🔇";
      soundButton.title = this.soundEnabled
        ? "Sound ON - Click to mute"
        : "Sound OFF - Click to enable";
      console.log("Button updated to:", soundButton.textContent);
    }

    // Handle audio enabling/disabling
    if (this.soundEnabled && this.audioContext) {
      console.log("Sound enabled - starting audio features...");

      // Play confirmation sound with slight delay to ensure context is ready
      setTimeout(() => {
        if (this.audioContext.state === "running") {
          console.log("Playing confirmation sound");
          this.playTone(440, 0.3, "sine", 0.15);
        }
      }, 100);

      // Start background ambient immediately
      this.startBackgroundAmbient();
    } else if (!this.soundEnabled) {
      console.log("Sound disabled - stopping ambient audio");
      this.stopBackgroundAmbient();
    }
  }

  startBackgroundAmbient() {
    if (!this.soundEnabled || !this.audioContext) return;

    // Clear any existing background sounds
    this.stopBackgroundAmbient();

    // Create enhanced ambient pad with more layers
    this.createEnhancedAmbientPad();

    // Create futuristic rhythmic elements
    this.createFuturisticRhythms();
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

    // Clear all timers
    if (this.backgroundSoundTimer) {
      clearTimeout(this.backgroundSoundTimer);
      this.backgroundSoundTimer = null;
    }

    this.ambientTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.ambientTimers = [];
  }

  createEnhancedAmbientPad() {
    if (!this.audioContext) return;

    try {
      // Deep bass foundation with slow filter sweep
      const bassOsc = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      const bassFilter = this.audioContext.createBiquadFilter();
      const bassLFO = this.audioContext.createOscillator();
      const bassLFOGain = this.audioContext.createGain();

      bassOsc.type = "sawtooth";
      bassOsc.frequency.setValueAtTime(65.4, this.audioContext.currentTime); // C2

      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(120, this.audioContext.currentTime);
      bassFilter.Q.setValueAtTime(2, this.audioContext.currentTime);

      // Slow filter modulation
      bassLFO.type = "sine";
      bassLFO.frequency.setValueAtTime(0.08, this.audioContext.currentTime);
      bassLFOGain.gain.setValueAtTime(30, this.audioContext.currentTime);
      bassLFO.connect(bassLFOGain);
      bassLFOGain.connect(bassFilter.frequency);

      bassGain.gain.setValueAtTime(
        this.config.effects.ambientVolume,
        this.audioContext.currentTime
      );

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start();
      bassLFO.start();
      this.ambientOscillators.push(bassOsc, bassLFO);

      // Ethereal pad layer with complex modulation
      const padOsc1 = this.audioContext.createOscillator();
      const padOsc2 = this.audioContext.createOscillator();
      const padGain = this.audioContext.createGain();
      const padFilter = this.audioContext.createBiquadFilter();
      const padLFO = this.audioContext.createOscillator();
      const padLFOGain = this.audioContext.createGain();

      padOsc1.type = "sawtooth";
      padOsc2.type = "triangle";
      padOsc1.frequency.setValueAtTime(261.6, this.audioContext.currentTime); // C4
      padOsc2.frequency.setValueAtTime(
        261.6 * 1.005,
        this.audioContext.currentTime
      ); // Slight detune

      padFilter.type = "bandpass";
      padFilter.frequency.setValueAtTime(800, this.audioContext.currentTime);
      padFilter.Q.setValueAtTime(0.8, this.audioContext.currentTime);

      // Complex modulation
      padLFO.type = "sine";
      padLFO.frequency.setValueAtTime(0.2, this.audioContext.currentTime);
      padLFOGain.gain.setValueAtTime(200, this.audioContext.currentTime);
      padLFO.connect(padLFOGain);
      padLFOGain.connect(padFilter.frequency);

      padGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);

      padOsc1.connect(padFilter);
      padOsc2.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(this.masterGain);
      padGain.connect(this.reverbSend || this.masterGain);

      padOsc1.start();
      padOsc2.start();
      padLFO.start();
      this.ambientOscillators.push(padOsc1, padOsc2, padLFO);

      // High frequency sparkle layer
      const sparkleOsc = this.audioContext.createOscillator();
      const sparkleGain = this.audioContext.createGain();
      const sparkleFilter = this.audioContext.createBiquadFilter();
      const sparkleLFO = this.audioContext.createOscillator();
      const sparkleLFOGain = this.audioContext.createGain();

      sparkleOsc.type = "triangle";
      sparkleOsc.frequency.setValueAtTime(
        1046.5,
        this.audioContext.currentTime
      ); // C6

      sparkleFilter.type = "highpass";
      sparkleFilter.frequency.setValueAtTime(
        2000,
        this.audioContext.currentTime
      );
      sparkleFilter.Q.setValueAtTime(1.5, this.audioContext.currentTime);

      sparkleLFO.type = "sine";
      sparkleLFO.frequency.setValueAtTime(0.15, this.audioContext.currentTime);
      sparkleLFOGain.gain.setValueAtTime(15, this.audioContext.currentTime);
      sparkleLFO.connect(sparkleLFOGain);
      sparkleLFOGain.connect(sparkleOsc.frequency);

      sparkleGain.gain.setValueAtTime(0.008, this.audioContext.currentTime);

      sparkleOsc.connect(sparkleFilter);
      sparkleFilter.connect(sparkleGain);
      sparkleGain.connect(this.reverbSend || this.masterGain);

      sparkleOsc.start();
      sparkleLFO.start();
      this.ambientOscillators.push(sparkleOsc, sparkleLFO);
    } catch (e) {
      console.log("Error creating enhanced ambient pad:", e);
    }
  }

  createFuturisticRhythms() {
    if (!this.audioContext) return;

    // Digital blips and data sounds
    const createDataBlip = () => {
      if (!this.soundEnabled) return;

      try {
        const blipOsc = this.audioContext.createOscillator();
        const blipGain = this.audioContext.createGain();
        const blipFilter = this.audioContext.createBiquadFilter();

        const frequencies = [1760, 2093, 2637, 3136]; // High frequencies for digital feel
        const frequency =
          frequencies[Math.floor(Math.random() * frequencies.length)];

        blipOsc.type = "square";
        blipOsc.frequency.setValueAtTime(
          frequency,
          this.audioContext.currentTime
        );

        blipFilter.type = "bandpass";
        blipFilter.frequency.setValueAtTime(
          frequency,
          this.audioContext.currentTime
        );
        blipFilter.Q.setValueAtTime(8, this.audioContext.currentTime);

        blipGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        blipGain.gain.exponentialRampToValueAtTime(
          0.008,
          this.audioContext.currentTime + 0.005
        );
        blipGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 0.05
        );

        blipOsc.connect(blipFilter);
        blipFilter.connect(blipGain);
        blipGain.connect(this.masterGain);

        blipOsc.start();
        blipOsc.stop(this.audioContext.currentTime + 0.05);
      } catch (e) {
        console.log("Error creating data blip:", e);
      }
    };

    // Sci-fi sweep sounds
    const createSweep = () => {
      if (!this.soundEnabled) return;

      try {
        const sweepOsc = this.audioContext.createOscillator();
        const sweepGain = this.audioContext.createGain();
        const sweepFilter = this.audioContext.createBiquadFilter();

        sweepOsc.type = "sawtooth";

        const startFreq = 200 + Math.random() * 300;
        const endFreq = startFreq + 400 + Math.random() * 600;

        sweepOsc.frequency.setValueAtTime(
          startFreq,
          this.audioContext.currentTime
        );
        sweepOsc.frequency.exponentialRampToValueAtTime(
          endFreq,
          this.audioContext.currentTime + 1.5
        );

        sweepFilter.type = "lowpass";
        sweepFilter.frequency.setValueAtTime(
          1000,
          this.audioContext.currentTime
        );
        sweepFilter.Q.setValueAtTime(2, this.audioContext.currentTime);

        sweepGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        sweepGain.gain.linearRampToValueAtTime(
          0.015,
          this.audioContext.currentTime + 0.1
        );
        sweepGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 1.5
        );

        sweepOsc.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(this.reverbSend || this.masterGain);

        sweepOsc.start();
        sweepOsc.stop(this.audioContext.currentTime + 1.5);
      } catch (e) {
        console.log("Error creating sweep:", e);
      }
    };

    // Schedule futuristic sounds
    const scheduleDataBlips = () => {
      if (this.soundEnabled) {
        createDataBlip();
        const blipTimer = setTimeout(
          scheduleDataBlips,
          2000 + Math.random() * 4000
        );
        this.ambientTimers.push(blipTimer);
      }
    };

    const scheduleSweeps = () => {
      if (this.soundEnabled) {
        createSweep();
        const sweepTimer = setTimeout(
          scheduleSweeps,
          15000 + Math.random() * 20000
        );
        this.ambientTimers.push(sweepTimer);
      }
    };

    // Start scheduling
    const blipTimer = setTimeout(scheduleDataBlips, 3000);
    const sweepTimer = setTimeout(scheduleSweeps, 8000);
    this.ambientTimers.push(blipTimer, sweepTimer);
  }

  destroy() {
    this.stopBackgroundAmbient();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Global functions for external controls
function regenerateSquares() {
  if (window.futuristicSquaresInstance) {
    window.futuristicSquaresInstance.regenerateSquares();
  }
}

function shuffleColors() {
  if (window.futuristicSquaresInstance) {
    window.futuristicSquaresInstance.shuffleColors();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add a small delay to ensure all framework scripts are loaded
  setTimeout(() => {
    // Initialize the futuristic squares
    console.log("Initializing futuristic squares...");
    window.futuristicSquaresInstance = new FuturisticSquares();
    console.log(
      "FuturisticSquares instance created:",
      window.futuristicSquaresInstance
    );

    // Initialize sound button AFTER instance exists
    console.log("Initializing sound button after instance creation...");
    window.futuristicSquaresInstance.audioEngine.initializeSoundButton();

    console.log("Global toggleAppSound function already defined");
    console.log("Futuristic Individual Squares loaded successfully!");
  }, 100); // Small delay to ensure framework initialization
});
