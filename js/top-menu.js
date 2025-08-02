// Top Menu Navigation Component
class TopMenuNavigator {
  constructor() {
    // Define exhibition order
    this.exhibitions = [
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
      "quantum-bounce.html",
    ];

    this.currentExhibition = this.getCurrentExhibition();
    this.currentIndex = this.exhibitions.indexOf(this.currentExhibition);
    this.init();
  }

  getCurrentExhibition() {
    const currentPath = window.location.pathname;
    const filename = currentPath.split("/").pop();
    return filename;
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

  navigateTo(exhibition) {
    if (exhibition) {
      // Add subtle transition
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

  getExhibitionTitle(filename) {
    const titleMap = {
      "quantum-bounce.html": "QU4NTUM_B0UNC3",
      "fluid-dynamics.html": "FLU1D_DYN4M1X",
      "wire-network.html": "W1R3_N3TW0RK",
      "individual-squares.html": "1ND1V1DU4L_SQU4R3S",
      "droplets-dance.html": "DR0PL3TS_D4NC3",
      "blood-ocean.html": "BL00D_0C34N",
      "morphing-forms.html": "M0RPH1NG_F0RMS",
      "glass-spheres.html": "GL4SS_SPH3R3S",
      "mirror-pyramid.html": "M1RR0R_PYR4M1D",
      "axis-connect.html": "4X1S_C0NN3CT",
      "deformed-coord.html": "D3F0RM3D_C00RD",
      "infinite-knot.html": "1NF1N1T3_KN0T",
      "infinite-knot-3d.html": "1NF1N1T3_KN0T_3D",
    };
    return titleMap[filename] || filename.replace(".html", "").toUpperCase();
  }

  updateNavigationButtons() {
    // Handle both class-based and ID-based button selectors
    const prevButtons = [
      document.querySelector(".prev-button"),
      document.querySelector("#prevButton"),
      document.querySelector("[data-nav='prev']"),
    ].filter((btn) => btn !== null);

    const nextButtons = [
      document.querySelector(".next-button"),
      document.querySelector("#nextButton"),
      document.querySelector("[data-nav='next']"),
    ].filter((btn) => btn !== null);

    const homeButtons = [
      document.querySelector(".home-button"),
      document.querySelector("#homeButton"),
      document.querySelector("[data-nav='home']"),
    ].filter((btn) => btn !== null);

    // Setup previous buttons
    prevButtons.forEach((button) => {
      if (button && button.parentNode) {
        button.classList.remove("disabled");
        button.removeAttribute("disabled");

        // Remove any existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add new listener
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goToPrevious();
        });

        // Add tooltip
        const prevExhibition = this.getPreviousExhibition();
        const prevTitle = this.getExhibitionTitle(prevExhibition);
        newButton.setAttribute("title", `Previous: ${prevTitle}`);
      }
    });

    // Setup next buttons
    nextButtons.forEach((button) => {
      if (button && button.parentNode) {
        button.classList.remove("disabled");
        button.removeAttribute("disabled");

        // Remove any existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add new listener
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goToNext();
        });

        // Add tooltip
        const nextExhibition = this.getNextExhibition();
        const nextTitle = this.getExhibitionTitle(nextExhibition);
        newButton.setAttribute("title", `Next: ${nextTitle}`);
      }
    });

    // Setup home buttons
    homeButtons.forEach((button) => {
      if (button && button.parentNode) {
        // Remove any existing listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add new listener
        newButton.addEventListener("click", (e) => {
          e.preventDefault();
          this.goToHome();
        });

        newButton.setAttribute("title", "Return to Gallery");
      }
    });
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          this.goToPrevious();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          this.goToNext();
          break;
        case "h":
        case "H":
        case "Escape":
          e.preventDefault();
          this.goToHome();
          break;
      }
    });
  }

  createTopMenu(title) {
    // Check if top menu already exists
    let topMenu = document.querySelector(".top-menu");
    if (!topMenu) {
      topMenu = document.createElement("div");
      topMenu.className = "top-menu";
      document.body.prepend(topMenu);
    }

    topMenu.innerHTML = `
      <div class="nav-left">
        <div class="menu-title">${title}</div>
      </div>
      <div class="nav-right">
        <button class="nav-button prev-button" data-nav="prev">PREV</button>
        <button class="nav-button next-button" data-nav="next">NEXT</button>
        <button class="nav-button home-button" data-nav="home">HOME</button>
      </div>
    `;

    // Ensure the exhibition container accounts for the menu
    let container = document.querySelector(".exhibition-container");
    if (!container) {
      container = document.querySelector(".main-content");
    }
    if (container) {
      container.style.marginTop = "60px";
      container.style.height = "calc(100vh - 60px)";
    }
  }

  init() {
    // Wait for DOM to be ready
    const initNavigation = () => {
      // Only create top menu if it doesn't already exist with proper structure
      let topMenu = document.querySelector(".top-menu");
      if (!topMenu || !topMenu.querySelector('[data-nav="prev"]')) {
        const currentTitle = this.getExhibitionTitle(this.currentExhibition);
        this.createTopMenu(currentTitle);
      }

      // Setup navigation functionality with a small delay to ensure elements exist
      setTimeout(() => {
        this.updateNavigationButtons();
        this.setupKeyboardNavigation();
      }, 100);

      // Add loading animation hide after initialization
      setTimeout(() => {
        const loadingContainer = document.querySelector(".loading-container");
        if (loadingContainer) {
          loadingContainer.classList.add("hidden");
          setTimeout(() => {
            loadingContainer.style.display = "none";
          }, 500);
        }
      }, 1000);
    };

    // Initialize based on document state
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initNavigation);
    } else {
      initNavigation();
    }
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (!window.topMenuNavigator) {
    window.topMenuNavigator = new TopMenuNavigator();
  }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState !== "loading") {
  if (!window.topMenuNavigator) {
    window.topMenuNavigator = new TopMenuNavigator();
  }
}
