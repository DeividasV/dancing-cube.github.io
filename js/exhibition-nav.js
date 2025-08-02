// Exhibition Navigation System
class ExhibitionNavigator {
  constructor() {
    // Define exhibition order
    this.exhibitions = [
      "quantum-bounce.html",
      "fluid-dynamics.html",
      "wire-network.html",
      "individual-squares.html",
      "droplets-dance.html",
      "blood-ocean.html",
      "morphing-forms.html",
      "glass-spheres.html",
      "mirror-pyramid.html",
      "axis-connect.html",
      "deformed-coord.html",
      "infinite-knot.html",
      "infinite-kont.html",
    ];

    this.currentExhibition = this.getCurrentExhibition();
    this.currentIndex = this.exhibitions.indexOf(this.currentExhibition);
  }

  getCurrentExhibition() {
    const currentPath = window.location.pathname;
    const filename = currentPath.split("/").pop();
    return filename;
  }

  getPreviousExhibition() {
    if (this.currentIndex <= 0) {
      // If at first exhibition, wrap to last
      return this.exhibitions[this.exhibitions.length - 1];
    }
    return this.exhibitions[this.currentIndex - 1];
  }

  getNextExhibition() {
    if (this.currentIndex >= this.exhibitions.length - 1) {
      // If at last exhibition, wrap to first
      return this.exhibitions[0];
    }
    return this.exhibitions[this.currentIndex + 1];
  }

  navigateTo(exhibition) {
    if (exhibition) {
      // Add a subtle transition effect
      document.body.style.opacity = "0.9";
      document.body.style.transition = "opacity 0.15s ease-out";

      setTimeout(() => {
        window.location.href = exhibition;
      }, 150);
    }
  }

  goToPrevious() {
    const prev = this.getPreviousExhibition();
    this.navigateTo(prev);
  }

  goToNext() {
    const next = this.getNextExhibition();
    this.navigateTo(next);
  }

  goToHome() {
    window.location.href = "../index.html";
  }

  // Update navigation buttons based on current position
  updateNavigationButtons() {
    const prevButton = document.querySelector(".prev-button");
    const nextButton = document.querySelector(".next-button");

    // Since we're looping, both buttons are always enabled
    if (prevButton) {
      prevButton.classList.remove("disabled");
      prevButton.removeAttribute("disabled");
      prevButton.onclick = () => this.goToPrevious();

      // Add tooltip showing previous exhibition
      const prevExhibition = this.getPreviousExhibition();
      const prevTitle = this.getExhibitionTitle(prevExhibition);
      prevButton.setAttribute("title", `Previous: ${prevTitle}`);
    }

    if (nextButton) {
      nextButton.classList.remove("disabled");
      nextButton.removeAttribute("disabled");
      nextButton.onclick = () => this.goToNext();

      // Add tooltip showing next exhibition
      const nextExhibition = this.getNextExhibition();
      const nextTitle = this.getExhibitionTitle(nextExhibition);
      nextButton.setAttribute("title", `Next: ${nextTitle}`);
    }

    // Add home button functionality
    const homeButton = document.querySelector(".home-button");
    if (homeButton) {
      homeButton.onclick = () => this.goToHome();
      homeButton.setAttribute("title", "Return to Gallery");
    }
  }

  // Helper function to get clean exhibition title from filename
  getExhibitionTitle(filename) {
    const titleMap = {
      "quantum-bounce.html": "QU4NTUM_B0UNC3",
      "fluid-dynamics.html": "FLU1D_DYN4M1X",
      "wire-network.html": "W1R3_N3TW0RK",
      "individual-squares.html": "1ND1V1DU4L_SQU4R3S",
      "droplets-dance.html": "DR0PL3TS_D4NC3",
      "blood-ocean.html": "BL00D_0C34N",
      "morphing-forms.html": "M0RPH1N_F0RMS",
      "glass-spheres.html": "GL4SS_SPH3R3S",
      "mirror-pyramid.html": "M1RR0R_PYR4M1D",
      "axis-connect.html": "4X1S_C0NN3CT",
      "deformed-coord.html": "D3F0RM3D_C00RD",
      "infinite-knot.html": "1NF1N1T3_KN0T",
      "infinite-kont.html": "1NF1N1T3_KN0T",
    };
    return titleMap[filename] || filename.replace(".html", "").toUpperCase();
  }

  // Add keyboard navigation
  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Left arrow or 'P' for previous
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") {
        this.goToPrevious();
      }
      // Right arrow or 'N' for next
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") {
        this.goToNext();
      }
      // 'H' or Escape for home
      else if (e.key.toLowerCase() === "h" || e.key === "Escape") {
        this.goToHome();
      }
    });
  }

  // Initialize navigation
  init() {
    this.updateNavigationButtons();
    this.setupKeyboardNavigation();
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const navigator = new ExhibitionNavigator();
  navigator.init();
});
