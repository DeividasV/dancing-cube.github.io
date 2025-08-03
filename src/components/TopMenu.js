/**
 * Top Menu Component
 * Unified navigation and controls for all exhibitions
 */
if (typeof TopMenu === "undefined") {
  class TopMenu {
    constructor(config) {
      this.config = {
        title: "Exhibition",
        description: "",
        hasAudio: false,
        showNavigation: true,
        showFullscreen: true,
        showHelp: true,
        ...config,
      };

      // Navigation data
      this.exhibitions = [
        { name: "fluid-dynamics", title: "FLU1D_DYN4M1X" },
        { name: "wire-network", title: "W1R3_N3TW0RK" },
        { name: "individual-squares", title: "1ND1V1DU4L_SQU4R3S" },
        { name: "droplets-dance", title: "DR0PL3TS_D4NC3" },
        { name: "blood-ocean", title: "BL00D_0C34N" },
        { name: "morphing-forms", title: "M0RPH1NG_F0RMS" },
        { name: "glass-spheres", title: "GL4SS_SPH3R3S" },
        { name: "mirror-pyramid", title: "M1RR0R_PYR4M1D" },
        { name: "axis-connect", title: "4X1S_C0NN3CT" },
        { name: "deformed-coord", title: "D3F0RM3D_C00RD" },
        { name: "infinite-knot", title: "1NF1N1T3_KN0T" },
        { name: "quantum-bounce", title: "QU4NTUM_B0UNC3" },
      ];

      this.currentExhibition = this.getCurrentExhibition();
      this.currentIndex = this.exhibitions.findIndex(
        (ex) => ex.name === this.currentExhibition
      );

      // Component references
      this.element = null;
      this.audioToggle = null;
      this.fullscreenButton = null;
      this.helpButton = null;
      this.navigationButtons = null;

      // State
      this.audioEnabled = false;
      this.isFullscreen = false;
      this.showingHelp = false;

      // Callbacks
      this.audioToggleCallback = null;
      this.fullscreenCallback = null;
      this.helpCallback = null;

      this.create();
      this.setupEventListeners();
    }

    create() {
      this.element = document.createElement("nav");
      this.element.className = "top-menu";

      this.element.innerHTML = `
            <div class="menu-left">
                <a href="../index.html" class="logo" title="Return to Exhibition Gallery">
                    D4NC1NG_CUB3S
                </a>
                <div class="exhibition-info">
                    <span class="exhibition-title">${this.config.title}</span>
                    ${
                      this.config.description
                        ? `<span class="exhibition-description">${this.config.description}</span>`
                        : ""
                    }
                </div>
            </div>
            
            <div class="menu-center">
                ${this.config.showNavigation ? this.createNavigationHTML() : ""}
            </div>
            
            <div class="menu-right">
                ${this.config.hasAudio ? this.createAudioControlsHTML() : ""}
                ${this.config.showFullscreen ? this.createFullscreenHTML() : ""}
                ${this.config.showHelp ? this.createHelpHTML() : ""}
                <button class="menu-toggle" title="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        `;

      // Get component references
      this.audioToggle = this.element.querySelector(".audio-toggle");
      this.fullscreenButton = this.element.querySelector(".fullscreen-toggle");
      this.helpButton = this.element.querySelector(".help-toggle");
      this.navigationButtons = {
        prev: this.element.querySelector(".nav-prev"),
        next: this.element.querySelector(".nav-next"),
        home: this.element.querySelector(".nav-home"),
      };
    }

    createNavigationHTML() {
      const prevExhibition = this.getPreviousExhibition();
      const nextExhibition = this.getNextExhibition();

      return `
            <div class="navigation-controls">
                <button class="nav-button nav-prev" title="Previous Exhibition: ${
                  prevExhibition?.title || "Unknown"
                }">
                    ‹ PREV
                </button>
                <button class="nav-button nav-home" title="Exhibition Gallery">
                    HOME
                </button>
                <button class="nav-button nav-next" title="Next Exhibition: ${
                  nextExhibition?.title || "Unknown"
                }">
                    NEXT ›
                </button>
            </div>
        `;
    }

    createAudioControlsHTML() {
      return `
            <div class="audio-controls">
                <button class="audio-toggle" title="Toggle Audio (Currently OFF)">
                    <span class="audio-icon audio-off">🔇</span>
                    <span class="audio-icon audio-on">🔊</span>
                </button>
            </div>
        `;
    }

    createFullscreenHTML() {
      return `
            <button class="fullscreen-toggle" title="Toggle Fullscreen">
                <span class="fullscreen-icon fullscreen-enter">⛶</span>
                <span class="fullscreen-icon fullscreen-exit">⛷</span>
            </button>
        `;
    }

    createHelpHTML() {
      return `
            <button class="help-toggle" title="Show Help">
                <span class="help-icon">?</span>
            </button>
        `;
    }

    setupEventListeners() {
      // Audio toggle
      if (this.audioToggle) {
        this.audioToggle.addEventListener("click", () => {
          this.toggleAudio();
        });
      }

      // Navigation buttons
      if (this.navigationButtons.prev) {
        this.navigationButtons.prev.addEventListener("click", () => {
          this.navigateToPrevious();
        });
      }

      if (this.navigationButtons.next) {
        this.navigationButtons.next.addEventListener("click", () => {
          this.navigateToNext();
        });
      }

      if (this.navigationButtons.home) {
        this.navigationButtons.home.addEventListener("click", () => {
          this.navigateToHome();
        });
      }

      // Fullscreen toggle
      if (this.fullscreenButton) {
        this.fullscreenButton.addEventListener("click", () => {
          this.toggleFullscreen();
        });
      }

      // Help toggle
      if (this.helpButton) {
        this.helpButton.addEventListener("click", () => {
          this.toggleHelp();
        });
      }

      // Mobile menu toggle
      const menuToggle = this.element.querySelector(".menu-toggle");
      if (menuToggle) {
        menuToggle.addEventListener("click", () => {
          this.toggleMobileMenu();
        });
      }

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        this.handleKeyboard(e);
      });

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!this.element.contains(e.target)) {
          this.closeMobileMenu();
        }
      });
    }

    toggleAudio() {
      this.audioEnabled = !this.audioEnabled;
      this.updateAudioButton();

      if (this.audioToggleCallback) {
        this.audioToggleCallback(this.audioEnabled);
      }
    }

    updateAudioButton() {
      if (!this.audioToggle) return;

      this.audioToggle.classList.toggle("enabled", this.audioEnabled);
      this.audioToggle.title = `Toggle Audio (Currently ${
        this.audioEnabled ? "ON" : "OFF"
      })`;
    }

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      this.updateFullscreenButton(this.isFullscreen);

      if (this.fullscreenCallback) {
        this.fullscreenCallback(this.isFullscreen);
      } else {
        // Default fullscreen behavior
        if (this.isFullscreen) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }
    }

    updateFullscreenButton(isFullscreen) {
      if (!this.fullscreenButton) return;

      this.isFullscreen = isFullscreen;
      this.fullscreenButton.classList.toggle("fullscreen", isFullscreen);
      this.fullscreenButton.title = `${
        isFullscreen ? "Exit" : "Enter"
      } Fullscreen`;
    }

    toggleHelp() {
      this.showingHelp = !this.showingHelp;

      if (this.helpCallback) {
        this.helpCallback(this.showingHelp);
      } else {
        this.showDefaultHelp();
      }
    }

    showDefaultHelp() {
      if (this.showingHelp) {
        const helpOverlay = document.createElement("div");
        helpOverlay.className = "help-overlay";
        helpOverlay.innerHTML = `
                <div class="help-content">
                    <h2>Exhibition Controls</h2>
                    <div class="help-section">
                        <h3>Navigation</h3>
                        <p><strong>PREV/NEXT:</strong> Navigate between exhibitions</p>
                        <p><strong>HOME:</strong> Return to gallery</p>
                        <p><strong>← →:</strong> Keyboard navigation</p>
                    </div>
                    <div class="help-section">
                        <h3>Controls</h3>
                        <p><strong>Mouse:</strong> Rotate view</p>
                        <p><strong>Scroll:</strong> Zoom in/out</p>
                        <p><strong>Space:</strong> Pause/Resume</p>
                        <p><strong>A:</strong> Toggle audio</p>
                        <p><strong>F:</strong> Toggle fullscreen</p>
                    </div>
                    <button class="help-close" onclick="this.parentElement.parentElement.remove()">
                        Close
                    </button>
                </div>
            `;

        document.body.appendChild(helpOverlay);

        // Auto-close after 15 seconds
        setTimeout(() => {
          if (helpOverlay.parentNode) {
            helpOverlay.remove();
          }
        }, 15000);
      }
    }

    toggleMobileMenu() {
      this.element.classList.toggle("mobile-menu-open");
    }

    closeMobileMenu() {
      this.element.classList.remove("mobile-menu-open");
    }

    handleKeyboard(event) {
      // Don't handle if user is typing in an input
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "arrowleft":
          event.preventDefault();
          this.navigateToPrevious();
          break;

        case "arrowright":
          event.preventDefault();
          this.navigateToNext();
          break;

        case "home":
          event.preventDefault();
          this.navigateToHome();
          break;

        case "a":
          event.preventDefault();
          this.toggleAudio();
          break;

        case "f":
          event.preventDefault();
          this.toggleFullscreen();
          break;

        case "?":
        case "h":
          event.preventDefault();
          this.toggleHelp();
          break;

        case "escape":
          event.preventDefault();
          this.closeMobileMenu();
          if (this.isFullscreen) {
            this.toggleFullscreen();
          }
          break;
      }
    }

    // Navigation methods
    getCurrentExhibition() {
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split("/").filter(Boolean);
      // If we're in a subfolder like "exhibitions/quantum-bounce/", return "quantum-bounce"
      if (
        pathParts.length >= 2 &&
        pathParts[pathParts.length - 2] === "exhibitions"
      ) {
        return pathParts[pathParts.length - 1];
      }
      // Fallback to filename-based detection for backward compatibility
      const filename = pathParts.pop();
      return filename.replace(".html", "");
    }

    getPreviousExhibition() {
      if (this.currentIndex <= 0) {
        return this.exhibitions[this.exhibitions.length - 1];
      }
      return this.exhibitions[this.currentIndex - 1];
    }

    getNextExhibition() {
      if (this.currentIndex >= this.exhibitions.length - 1) {
        return this.exhibitions[0];
      }
      return this.exhibitions[this.currentIndex + 1];
    }

    navigateToPrevious() {
      const prev = this.getPreviousExhibition();
      if (prev) {
        this.navigateToExhibition(prev.name);
      }
    }

    navigateToNext() {
      const next = this.getNextExhibition();
      if (next) {
        this.navigateToExhibition(next.name);
      }
    }

    navigateToHome() {
      this.navigateToPage("../../index.html");
    }

    navigateToExhibition(exhibitionName) {
      this.navigateToPage(`../${exhibitionName}/`);
    }

    navigateToPage(url) {
      // Add subtle transition
      document.body.style.opacity = "0.9";
      document.body.style.transition = "opacity 0.15s ease-out";

      setTimeout(() => {
        window.location.href = url;
      }, 150);
    }

    // Public API
    onAudioToggle(callback) {
      this.audioToggleCallback = callback;
    }

    onFullscreen(callback) {
      this.fullscreenCallback = callback;
    }

    onHelp(callback) {
      this.helpCallback = callback;
    }

    setTitle(title) {
      const titleElement = this.element.querySelector(".exhibition-title");
      if (titleElement) {
        titleElement.textContent = title;
      }
    }

    setDescription(description) {
      const descElement = this.element.querySelector(".exhibition-description");
      if (descElement) {
        descElement.textContent = description;
      } else if (description) {
        // Add description if it doesn't exist
        const infoElement = this.element.querySelector(".exhibition-info");
        if (infoElement) {
          const descSpan = document.createElement("span");
          descSpan.className = "exhibition-description";
          descSpan.textContent = description;
          infoElement.appendChild(descSpan);
        }
      }
    }

    setAudioEnabled(enabled) {
      this.audioEnabled = enabled;
      this.updateAudioButton();
    }

    getElement() {
      return this.element;
    }

    dispose() {
      // Remove event listeners
      document.removeEventListener("keydown", this.handleKeyboard);
      document.removeEventListener("click", this.closeMobileMenu);

      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = TopMenu;
}
