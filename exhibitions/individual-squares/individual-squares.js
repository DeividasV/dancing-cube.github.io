/**
 * Individual Squares Visualization
 * Creates 100 individual animated squares with unique gradients
 */

class IndividualSquares {
  constructor() {
    this.container = document.getElementById("squaresContainer");
    this.totalSquares = 100;

    // Sound system
    this.audioContext = null;
    this.masterGain = null;
    this.soundEnabled = false; // Default to OFF
    this.ambientOscillators = [];
    this.backgroundSoundTimer = null;
    this.ambientTimers = []; // Store multiple ambient timers

    this.initAudio();
    this.initialize();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
      console.log("Audio context initialized successfully");
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

  playChord(frequencies, duration = 0.4, volume = 0.06) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, "sine", volume);
      }, index * 30);
    });
  }

  // Toggle sound on/off (called from top menu button)
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log("Sound toggled:", this.soundEnabled ? "ON" : "OFF");

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
      console.log("Resuming audio context");
      this.audioContext.resume();
    }

    // Play confirmation sound if enabling
    if (this.soundEnabled) {
      console.log("Playing confirmation sound");
      setTimeout(() => {
        this.playTone(440, 0.3, "sine", 0.15);
      }, 100);
      this.startBackgroundAmbient();
    } else {
      this.stopBackgroundAmbient();
    }
  }

  startBackgroundAmbient() {
    if (!this.soundEnabled || !this.audioContext) return;

    // Clear any existing background sounds
    this.stopBackgroundAmbient();

    // Create gentle ambient pad
    this.createAmbientPad();

    // Create subtle rhythmic elements
    this.createRhythmicElements();
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

  createAmbientPad() {
    if (!this.audioContext) return;

    try {
      // Warm bass foundation - C major chord root
      const bassOsc = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      const bassLFO = this.audioContext.createOscillator();
      const bassLFOGain = this.audioContext.createGain();

      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(65.4, this.audioContext.currentTime); // C2

      // Add gentle breathing to bass
      bassLFO.type = "sine";
      bassLFO.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
      bassLFOGain.gain.setValueAtTime(0.008, this.audioContext.currentTime);

      bassLFO.connect(bassLFOGain);
      bassLFOGain.connect(bassGain.gain);

      bassGain.gain.setValueAtTime(0.04, this.audioContext.currentTime);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start();
      bassLFO.start();
      this.ambientOscillators.push(bassOsc);
      this.ambientOscillators.push(bassLFO);

      // Melodic pad layer - C major chord
      const padOsc = this.audioContext.createOscillator();
      const padGain = this.audioContext.createGain();
      const padFilter = this.audioContext.createBiquadFilter();
      const padLFO = this.audioContext.createOscillator();
      const padLFOGain = this.audioContext.createGain();

      padOsc.type = "sawtooth";
      padOsc.frequency.setValueAtTime(261.6, this.audioContext.currentTime); // C4

      // Add warmth with low-pass filter
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      padFilter.Q.setValueAtTime(0.7, this.audioContext.currentTime);

      // Gentle vibrato
      padLFO.type = "sine";
      padLFO.frequency.setValueAtTime(0.3, this.audioContext.currentTime);
      padLFOGain.gain.setValueAtTime(8, this.audioContext.currentTime);

      padLFO.connect(padLFOGain);
      padLFOGain.connect(padOsc.frequency);

      padGain.gain.setValueAtTime(0.025, this.audioContext.currentTime);

      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(this.masterGain);

      padOsc.start();
      padLFO.start();
      this.ambientOscillators.push(padOsc);
      this.ambientOscillators.push(padLFO);

      // Harmony layer - E note (major third)
      const harmOsc = this.audioContext.createOscillator();
      const harmGain = this.audioContext.createGain();
      const harmFilter = this.audioContext.createBiquadFilter();

      harmOsc.type = "sine";
      harmOsc.frequency.setValueAtTime(329.6, this.audioContext.currentTime); // E4

      harmFilter.type = "lowpass";
      harmFilter.frequency.setValueAtTime(1500, this.audioContext.currentTime);
      harmFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

      harmGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);

      harmOsc.connect(harmFilter);
      harmFilter.connect(harmGain);
      harmGain.connect(this.masterGain);

      harmOsc.start();
      this.ambientOscillators.push(harmOsc);

      // Ethereal high melody - G note (perfect fifth)
      const highOsc = this.audioContext.createOscillator();
      const highGain = this.audioContext.createGain();
      const highLFO = this.audioContext.createOscillator();
      const highLFOGain = this.audioContext.createGain();
      const highFilter = this.audioContext.createBiquadFilter();

      highOsc.type = "triangle";
      highOsc.frequency.setValueAtTime(392, this.audioContext.currentTime); // G4

      // Dreamy filter
      highFilter.type = "bandpass";
      highFilter.frequency.setValueAtTime(800, this.audioContext.currentTime);
      highFilter.Q.setValueAtTime(2, this.audioContext.currentTime);

      // Slow modulation for dreaminess
      highLFO.type = "sine";
      highLFO.frequency.setValueAtTime(0.15, this.audioContext.currentTime);
      highLFOGain.gain.setValueAtTime(5, this.audioContext.currentTime);

      highLFO.connect(highLFOGain);
      highLFOGain.connect(highOsc.frequency);

      highGain.gain.setValueAtTime(0.018, this.audioContext.currentTime);

      highOsc.connect(highFilter);
      highFilter.connect(highGain);
      highGain.connect(this.masterGain);

      highOsc.start();
      highLFO.start();

      this.ambientOscillators.push(highOsc);
      this.ambientOscillators.push(highLFO);
    } catch (e) {
      console.log("Error creating ambient pad:", e);
    }
  }

  createRhythmicElements() {
    if (!this.audioContext) return;

    // Create gentle melodic pulses in C major scale
    const cMajorScale = [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9]; // C4 to B4
    let noteIndex = 0;

    const createMelodicPulse = () => {
      if (!this.soundEnabled) return;

      try {
        const pulseOsc = this.audioContext.createOscillator();
        const pulseGain = this.audioContext.createGain();
        const pulseFilter = this.audioContext.createBiquadFilter();

        // Choose next note in scale progression
        const frequency = cMajorScale[noteIndex % cMajorScale.length];
        noteIndex++;

        pulseOsc.type = "sine";
        pulseOsc.frequency.setValueAtTime(
          frequency,
          this.audioContext.currentTime
        );

        // Warm filter
        pulseFilter.type = "lowpass";
        pulseFilter.frequency.setValueAtTime(
          2000,
          this.audioContext.currentTime
        );
        pulseFilter.Q.setValueAtTime(1, this.audioContext.currentTime);

        pulseGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        pulseGain.gain.linearRampToValueAtTime(
          0.03,
          this.audioContext.currentTime + 0.1
        );
        pulseGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 1.2
        );

        pulseOsc.connect(pulseFilter);
        pulseFilter.connect(pulseGain);
        pulseGain.connect(this.masterGain);

        pulseOsc.start();
        pulseOsc.stop(this.audioContext.currentTime + 1.2);
      } catch (e) {
        console.log("Error creating melodic pulse:", e);
      }
    };

    // Create warm bell-like tones
    const createBellTone = () => {
      if (!this.soundEnabled) return;

      try {
        const bellFreqs = [523.3, 659.3, 784]; // C5, E5, G5 - major chord
        const baseFreq =
          bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

        // Create bell harmonics
        for (let i = 0; i < 3; i++) {
          const bellOsc = this.audioContext.createOscillator();
          const bellGain = this.audioContext.createGain();
          const bellFilter = this.audioContext.createBiquadFilter();

          bellOsc.type = "sine";
          bellOsc.frequency.setValueAtTime(
            baseFreq * (i + 1),
            this.audioContext.currentTime
          );

          bellFilter.type = "lowpass";
          bellFilter.frequency.setValueAtTime(
            3000,
            this.audioContext.currentTime
          );
          bellFilter.Q.setValueAtTime(2, this.audioContext.currentTime);

          const volume = 0.015 / (i + 1); // Decreasing volume for harmonics

          bellGain.gain.setValueAtTime(0, this.audioContext.currentTime);
          bellGain.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + 0.05
          );
          bellGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.audioContext.currentTime + 2.5
          );

          bellOsc.connect(bellFilter);
          bellFilter.connect(bellGain);
          bellGain.connect(this.masterGain);

          bellOsc.start();
          bellOsc.stop(this.audioContext.currentTime + 2.5);
        }
      } catch (e) {
        console.log("Error creating bell tone:", e);
      }
    };

    // Create gentle arpeggio sequences
    const createArpeggio = () => {
      if (!this.soundEnabled) return;

      try {
        const chordNotes = [261.6, 329.6, 392, 523.3]; // C major arpeggio

        chordNotes.forEach((freq, index) => {
          setTimeout(() => {
            if (!this.soundEnabled) return;

            const arpOsc = this.audioContext.createOscillator();
            const arpGain = this.audioContext.createGain();
            const arpFilter = this.audioContext.createBiquadFilter();

            arpOsc.type = "triangle";
            arpOsc.frequency.setValueAtTime(
              freq,
              this.audioContext.currentTime
            );

            arpFilter.type = "lowpass";
            arpFilter.frequency.setValueAtTime(
              1800,
              this.audioContext.currentTime
            );
            arpFilter.Q.setValueAtTime(1.5, this.audioContext.currentTime);

            arpGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            arpGain.gain.linearRampToValueAtTime(
              0.02,
              this.audioContext.currentTime + 0.02
            );
            arpGain.gain.exponentialRampToValueAtTime(
              0.001,
              this.audioContext.currentTime + 0.8
            );

            arpOsc.connect(arpFilter);
            arpFilter.connect(arpGain);
            arpGain.connect(this.masterGain);

            arpOsc.start();
            arpOsc.stop(this.audioContext.currentTime + 0.8);
          }, index * 200);
        });
      } catch (e) {
        console.log("Error creating arpeggio:", e);
      }
    };

    // Schedule melodic elements with more musical timing
    const scheduleMelodicPulse = () => {
      if (this.soundEnabled) {
        createMelodicPulse();
        this.backgroundSoundTimer = setTimeout(
          scheduleMelodicPulse,
          3000 + Math.random() * 2000
        );
      }
    };

    const scheduleBellTone = () => {
      if (this.soundEnabled) {
        createBellTone();
        const bellTimer = setTimeout(
          scheduleBellTone,
          8000 + Math.random() * 7000
        );
        this.ambientTimers.push(bellTimer);
      }
    };

    const scheduleArpeggio = () => {
      if (this.soundEnabled) {
        createArpeggio();
        const arpTimer = setTimeout(
          scheduleArpeggio,
          12000 + Math.random() * 8000
        );
        this.ambientTimers.push(arpTimer);
      }
    };

    // Start all melodic elements with musical timing
    this.backgroundSoundTimer = setTimeout(scheduleMelodicPulse, 2000);
    const bellTimer = setTimeout(scheduleBellTone, 5000);
    const arpTimer = setTimeout(scheduleArpeggio, 10000);
    this.ambientTimers.push(bellTimer, arpTimer);
  }

  initialize() {
    this.generateSquares();
    this.setupAnimations();
  }

  // Function to generate random colors
  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 40); // 60-100%
    const lightness = 40 + Math.floor(Math.random() * 30); // 40-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Function to create a unique gradient
  createGradient() {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColor();
    const color3 = this.getRandomColor();
    const color4 = this.getRandomColor();

    const angle = Math.floor(Math.random() * 360);
    return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3}, ${color4})`;
  }

  generateSquares() {
    // Clear existing squares
    this.container.innerHTML = "";

    for (let i = 1; i <= this.totalSquares; i++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.index = i;

      // Give each square a unique gradient
      square.style.background = this.createGradient();

      // Add gradient animation with slight variation
      const gradientDuration = 4 + Math.random() * 6; // 4-10 seconds
      square.style.setProperty("--gradient-duration", `${gradientDuration}s`);

      // Add random pulse animation
      const pulseDuration = 2 + Math.random() * 4; // 2-6 seconds
      const pulseDelay = Math.random() * 3; // 0-3 seconds delay
      square.style.setProperty("--pulse-duration", `${pulseDuration}s`);
      square.style.setProperty("--pulse-delay", `${pulseDelay}s`);

      // Add slight delay variation for entrance
      const delay = Math.random() * 2; // 0-2 seconds
      square.style.animationDelay = `${delay}s`;

      // Add hover effect data
      square.addEventListener("mouseenter", () =>
        this.onSquareHover(square, i)
      );
      square.addEventListener("mouseleave", () => this.onSquareLeave(square));
      square.addEventListener("click", () => this.onSquareClick(square, i));

      this.container.appendChild(square);
    }

    // Start random pulsing after a short delay
    setTimeout(() => {
      this.startRandomPulsing();
    }, 1000);
  }

  setupAnimations() {
    // Stagger the entrance animations
    const squares = this.container.querySelectorAll(".square");
    squares.forEach((square, index) => {
      const delay = index * 0.02; // 20ms delay between each square
      square.style.setProperty("--entrance-delay", `${delay}s`);

      // Apply entrance animation with delay
      setTimeout(() => {
        square.classList.add("entered");
      }, delay * 1000);
    });
  }

  startRandomPulsing() {
    const squares = this.container.querySelectorAll(".square");

    const pulseRandomSquare = () => {
      // Pick a random square
      const randomIndex = Math.floor(Math.random() * squares.length);
      const square = squares[randomIndex];

      // Add pulse class
      square.classList.add("pulsing");

      // Play melodic pulse sound
      const melodicNotes = [261.6, 293.7, 329.6, 349.2, 392]; // C major pentatonic
      const randomNote =
        melodicNotes[Math.floor(Math.random() * melodicNotes.length)];
      this.playTone(randomNote, 0.5, "triangle", 0.025);

      // Remove pulse class after animation
      setTimeout(() => {
        square.classList.remove("pulsing");
      }, 1000);

      // Schedule next pulse
      const nextPulse = 500 + Math.random() * 2000; // 0.5-2.5 seconds
      setTimeout(pulseRandomSquare, nextPulse);
    };

    // Start the pulsing cycle
    pulseRandomSquare();

    // Start background ambient if sound is enabled
    if (this.soundEnabled) {
      this.startBackgroundAmbient();
    }
  }

  onSquareHover(square, index) {
    // Play melodic hover sound based on C major pentatonic scale
    const pentatonicScale = [261.6, 293.7, 329.6, 392, 440]; // C D E G A
    const scaleIndex = index % pentatonicScale.length;
    const baseFreq = pentatonicScale[scaleIndex];

    // Add octave variation for variety
    const octaveMultiplier = (Math.floor(index / 20) % 3) + 1; // 1x, 2x, or 3x
    const frequency = baseFreq * octaveMultiplier;

    this.playTone(frequency, 0.25, "sine", 0.04);
    // Create ripple effect
    const ripple = document.createElement("div");
    ripple.className = "ripple-effect";
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleExpand 0.6s ease-out;
      pointer-events: none;
    `;

    square.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);

    // Add CSS for ripple animation if not already added
    if (!document.querySelector("#ripple-styles")) {
      const style = document.createElement("style");
      style.id = "ripple-styles";
      style.textContent = `
        @keyframes rippleExpand {
          from {
            width: 4px;
            height: 4px;
            opacity: 1;
          }
          to {
            width: 50px;
            height: 50px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  onSquareLeave(square) {
    // Optional: Add leave effect if needed
  }

  onSquareClick(square, index) {
    // Play beautiful chord progressions based on square position
    const chordProgression = [
      [261.6, 329.6, 392], // C major
      [293.7, 369.99, 440], // D minor
      [329.6, 415.3, 493.9], // E minor
      [349.2, 440, 523.3], // F major
      [392, 493.9, 587.3], // G major
    ];

    const chordIndex = Math.floor(index / 20) % chordProgression.length;
    const chord = chordProgression[chordIndex];

    this.playChord(chord, 0.6, 0.06);
    // Create burst effect on click
    square.style.animation = "none";
    square.offsetHeight; // Trigger reflow
    square.style.animation = null;

    // Regenerate gradient for clicked square
    square.style.background = this.createGradient();

    // Add temporary glow effect
    square.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.8)";
    setTimeout(() => {
      square.style.boxShadow = "";
    }, 300);

    // Create particle explosion effect
    this.createParticleExplosion(square);
  }

  createParticleExplosion(square) {
    const rect = square.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;

      document.body.appendChild(particle);

      const angle = (i * 45 * Math.PI) / 180;
      const distance = 50 + Math.random() * 30;
      const duration = 600 + Math.random() * 200;

      particle
        .animate(
          [
            {
              transform: "translate(-50%, -50%) scale(1)",
              opacity: 1,
            },
            {
              transform: `translate(-50%, -50%) translate(${
                Math.cos(angle) * distance
              }px, ${Math.sin(angle) * distance}px) scale(0)`,
              opacity: 0,
            },
          ],
          {
            duration: duration,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          document.body.removeChild(particle);
        });
    }
  }

  regenerateAllSquares() {
    // Play regeneration sound
    this.playChord([150, 200, 250, 300, 400], 0.8, 0.04);

    this.generateSquares();
    this.setupAnimations();
  }

  shuffleColors() {
    // Play shuffle sound
    this.playChord([400, 500, 600], 0.5, 0.03);

    const squares = this.container.querySelectorAll(".square");
    squares.forEach((square, index) => {
      setTimeout(() => {
        square.style.background = this.createGradient();
        // Play color change sound
        if (this.soundEnabled && Math.random() < 0.1) {
          const colorFreq = 800 + Math.random() * 400;
          this.playTone(colorFreq, 0.1, "sine", 0.02);
        }
      }, index * 50);
    });
  }
}

// Global functions for controls
function regenerateSquares() {
  if (window.squaresInstance) {
    window.squaresInstance.regenerateAllSquares();
  }
}

function shuffleColors() {
  if (window.squaresInstance) {
    window.squaresInstance.shuffleColors();
  }
}

// Global function for sound toggle button
window.toggleAppSound = function () {
  if (window.squaresInstance) {
    window.squaresInstance.toggleSound();
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Hide loading screen
  setTimeout(() => {
    const loadingContainer = document.querySelector(".loading-container");
    if (loadingContainer) {
      loadingContainer.classList.add("hidden");
    }
  }, 1000);

  // Initialize the squares
  window.squaresInstance = new IndividualSquares();

  // Enable audio context on any user interaction
  const activateAudio = () => {
    if (
      window.squaresInstance.audioContext &&
      window.squaresInstance.audioContext.state === "suspended"
    ) {
      console.log("Activating audio context due to user interaction");
      window.squaresInstance.audioContext.resume();
    }
  };

  document.addEventListener("click", activateAudio);
  document.addEventListener("keydown", activateAudio);
  document.addEventListener("touchstart", activateAudio);
});
