/**
 * Exhibition Window Component
 * Creates the unified container and layout for all exhibitions
 */
if (typeof ExhibitionWindow === "undefined") {
  class ExhibitionWindow {
    constructor(config) {
      this.config = {
        title: "Exhibition",
        description: "",
        hasAudio: false,
        showNavigation: true,
        showFullscreen: true,
        ...config,
      };

      this.container = null;
      this.contentArea = null;
      this.topMenu = null;
      this.loadingOverlay = null;

      this.create();
    }

    create() {
      // Create main container
      this.container = document.createElement("div");
      this.container.className = "exhibition-window";
      this.container.innerHTML = `
            <div class="exhibition-content"></div>
            <div class="loading-overlay">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading ${this.config.title}...</div>
            </div>
        `;

      // Get references
      this.contentArea = this.container.querySelector(".exhibition-content");
      this.loadingOverlay = this.container.querySelector(".loading-overlay");

      // Create top menu
      this.topMenu = new TopMenu({
        title: this.config.title,
        description: this.config.description,
        hasAudio: this.config.hasAudio,
        showNavigation: this.config.showNavigation,
        showFullscreen: this.config.showFullscreen,
      });

      // Insert top menu at the beginning
      this.container.insertBefore(
        this.topMenu.getElement(),
        this.container.firstChild
      );

      // Append to body
      document.body.appendChild(this.container);

      // Hide loading after a short delay (will be controlled by exhibition)
      this.hideLoading();

      return this.contentArea;
    }

    getContainer() {
      return this.contentArea;
    }

    getTopMenu() {
      return this.topMenu;
    }

    showLoading(text = null) {
      if (text) {
        this.loadingOverlay.querySelector(".loading-text").textContent = text;
      }
      this.loadingOverlay.style.display = "flex";
    }

    hideLoading() {
      // Smooth fade out
      this.loadingOverlay.style.opacity = "0";
      setTimeout(() => {
        this.loadingOverlay.style.display = "none";
        this.loadingOverlay.style.opacity = "1"; // Reset for next time
      }, 500);
    }

    setTitle(title) {
      this.config.title = title;
      this.topMenu.setTitle(title);
    }

    setDescription(description) {
      this.config.description = description;
      this.topMenu.setDescription(description);
    }

    showFullscreen() {
      this.container.classList.add("fullscreen-mode");
      this.topMenu.updateFullscreenButton(true);
    }

    exitFullscreen() {
      this.container.classList.remove("fullscreen-mode");
      this.topMenu.updateFullscreenButton(false);
    }

    toggleFullscreen() {
      if (this.container.classList.contains("fullscreen-mode")) {
        this.exitFullscreen();
      } else {
        this.showFullscreen();
      }
    }

    showError(message, details = null) {
      const errorOverlay = document.createElement("div");
      errorOverlay.className = "error-overlay";
      errorOverlay.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                ${details ? `<div class="error-details">${details}</div>` : ""}
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">
                    Close
                </button>
            </div>
        `;

      this.container.appendChild(errorOverlay);

      // Auto-hide after 10 seconds
      setTimeout(() => {
        if (errorOverlay.parentNode) {
          errorOverlay.remove();
        }
      }, 10000);
    }

    dispose() {
      if (this.topMenu) {
        this.topMenu.dispose();
      }

      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ExhibitionWindow;
}
