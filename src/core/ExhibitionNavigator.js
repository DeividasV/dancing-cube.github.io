/**
 * Exhibition Navigation System
 * Handles PREV/NEXT/HOME navigation between exhibitions
 */

// Exhibition list in order
const EXHIBITIONS = [
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

class ExhibitionNavigator {
  constructor() {
    this.currentExhibition = this.getCurrentExhibitionName();
    this.currentIndex = this.findCurrentIndex();
    this.setupNavigationListeners();
    this.setupSoundToggle();
  }

  getCurrentExhibitionName() {
    // Extract exhibition name from URL path
    const pathParts = window.location.pathname.split("/");
    for (let i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i] && pathParts[i] !== "index.html") {
        return pathParts[i];
      }
    }
    return null;
  }

  findCurrentIndex() {
    return EXHIBITIONS.findIndex((ex) => ex.name === this.currentExhibition);
  }

  navigateTo(direction) {
    let targetIndex;

    switch (direction) {
      case "prev":
        targetIndex = this.currentIndex - 1;
        if (targetIndex < 0) targetIndex = EXHIBITIONS.length - 1; // Loop to last
        break;
      case "next":
        targetIndex = this.currentIndex + 1;
        if (targetIndex >= EXHIBITIONS.length) targetIndex = 0; // Loop to first
        break;
      case "home":
        window.location.href = "../../index.html";
        return;
      default:
        return;
    }

    const targetExhibition = EXHIBITIONS[targetIndex];
    if (targetExhibition) {
      window.location.href = `../${targetExhibition.name}/index.html`;
    }
  }

  setupNavigationListeners() {
    // Get navigation buttons
    const prevButton = document.querySelector('[data-nav="prev"]');
    const nextButton = document.querySelector('[data-nav="next"]');
    const homeButton = document.querySelector('[data-nav="home"]');

    // Add click listeners
    if (prevButton) {
      prevButton.addEventListener("click", () => this.navigateTo("prev"));
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => this.navigateTo("next"));
    }
    if (homeButton) {
      homeButton.addEventListener("click", () => this.navigateTo("home"));
    }

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          this.navigateTo("prev");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          this.navigateTo("next");
          break;
        case "h":
        case "H":
        case "Escape":
          this.navigateTo("home");
          break;
      }
    });
  }

  setupSoundToggle() {
    // Basic sound toggle functionality
    let soundEnabled = false;
    const soundButton = document.querySelector(".sound-toggle-button");

    if (soundButton) {
      soundButton.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundButton.textContent = soundEnabled ? "🔊" : "🔇";
        soundButton.title = soundEnabled
          ? "Sound ON - Click to disable"
          : "Sound OFF - Click to enable";

        // Trigger global sound toggle if available
        if (window.toggleAppSound) {
          window.toggleAppSound();
        }
      });
    }
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ExhibitionNavigator();
});

// Export for use in other scripts
window.ExhibitionNavigator = ExhibitionNavigator;
