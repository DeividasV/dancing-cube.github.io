// BL00D_0C34N - Production Blood Ocean Exhibition
// Minimal demo integrating renderer and audio with proper lifecycle management

class BloodOceanExhibition {
  constructor(containerId = "container") {
    this.containerId = containerId;
    this.renderer = null;
    this.isRunning = false;
    this.initialized = false;

    console.log("Blood Ocean Exhibition initializing...");
    this.init();
  }

  init() {
    try {
      // Initialize renderer
      this.renderer = new BloodOceanRenderer(this.containerId);

      // Audio system is already initialized globally
      if (!window.bloodOceanAudio) {
        console.warn("Audio system not available");
      }

      this.setupCleanup();
      this.initialized = true;
      this.isRunning = true;

      console.log("Blood Ocean Exhibition initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Blood Ocean Exhibition:", error);
      this.dispose();
    }
  }

  setupCleanup() {
    // Clean up on page unload
    window.addEventListener("beforeunload", () => this.dispose());

    // Clean up on navigation (for SPAs)
    if (window.addEventListener) {
      window.addEventListener("pagehide", () => this.dispose());
    }

    // Clean up on visibility change when hidden for extended periods
    let hiddenStartTime = null;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        hiddenStartTime = Date.now();
      } else {
        if (hiddenStartTime && Date.now() - hiddenStartTime > 300000) {
          // 5 minutes
          console.log("Page was hidden for extended period, reinitializing...");
          this.restart();
        }
        hiddenStartTime = null;
      }
    });
  }

  start() {
    if (!this.initialized || this.isRunning) return;

    if (this.renderer) {
      this.renderer.start();
    }

    this.isRunning = true;
    console.log("Blood Ocean Exhibition started");
  }

  stop() {
    if (!this.isRunning) return;

    if (this.renderer) {
      this.renderer.stop();
    }

    this.isRunning = false;
    console.log("Blood Ocean Exhibition stopped");
  }

  restart() {
    console.log("Restarting Blood Ocean Exhibition...");
    this.stop();
    this.dispose();

    // Reinitialize after brief delay
    setTimeout(() => {
      this.init();
    }, 100);
  }

  setIntensity(intensity) {
    if (this.renderer) {
      this.renderer.setIntensity(intensity);
    }

    if (window.bloodOceanAudio) {
      // Adjust audio intensity if needed
      const volumeScale = 0.2 + intensity * 0.3; // Scale volume between 0.2-0.5
      window.bloodOceanAudio.setVolume(volumeScale);
    }

    console.log(`Exhibition intensity set to: ${intensity}`);
  }

  getStats() {
    if (!this.renderer) return null;

    return {
      isRunning: this.isRunning,
      isPaused: this.renderer.isPaused,
      fps: this.renderer.fps,
      rippleCount: this.renderer.ripples.length,
      dropCount: this.renderer.drops.length,
      audioEnabled: window.bloodOceanAudio
        ? window.bloodOceanAudio.isEnabled()
        : false,
      time: this.renderer.time,
    };
  }

  dispose() {
    console.log("Disposing Blood Ocean Exhibition...");

    this.stop();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    // Note: Audio system is global, so we don't dispose it here
    // It will be disposed when the page unloads

    this.initialized = false;
    this.isRunning = false;

    console.log("Blood Ocean Exhibition disposed");
  }
}

// Initialize the exhibition when DOM is ready
function initBloodOcean() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBloodOcean);
    return;
  }

  // Check if required elements exist
  const container = document.getElementById("container");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  // Check if required scripts are loaded
  if (typeof BloodOceanRenderer === "undefined") {
    console.error("BloodOceanRenderer not loaded");
    return;
  }

  if (typeof window.bloodOceanAudio === "undefined") {
    console.warn("Blood Ocean Audio system not loaded");
  }

  // Create global exhibition instance
  window.bloodOceanExhibition = new BloodOceanExhibition("container");

  // For debugging and external control
  window.debugBloodOcean = () => {
    if (window.bloodOceanExhibition) {
      console.log("Blood Ocean Stats:", window.bloodOceanExhibition.getStats());
    }
  };

  console.log("Blood Ocean initialized. Use debugBloodOcean() for stats.");
}

// Start initialization
initBloodOcean();

// Performance monitoring (optional)
if (typeof performance !== "undefined" && performance.mark) {
  performance.mark("blood-ocean-load-end");

  if (performance.getEntriesByName("blood-ocean-load-start").length > 0) {
    performance.measure(
      "blood-ocean-load-time",
      "blood-ocean-load-start",
      "blood-ocean-load-end"
    );
    const loadTime = performance.getEntriesByName("blood-ocean-load-time")[0];
    console.log(`Blood Ocean load time: ${loadTime.duration.toFixed(2)}ms`);
  }
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = BloodOceanExhibition;
}
