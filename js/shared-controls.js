// Shared Control Panel Functionality

class ExhibitionControls {
  constructor() {
    this.isActive = false;
    this.init();
  }

  init() {
    // Hide any existing old controls
    const oldControls = document.querySelectorAll('.controls:not(.shared-controls)');
    oldControls.forEach(control => {
      control.style.display = 'none';
    });

    // Create controls toggle button
    this.createToggleButton();
    
    // Create controls panel if it doesn't exist
    if (!document.querySelector('.controls.shared-controls')) {
      this.createControlsPanel();
    }

    // Setup event listeners
    this.setupEventListeners();
  }  createToggleButton() {
    const toggle = document.createElement("div");
    toggle.className = "controls-toggle";
    toggle.setAttribute("aria-label", "Toggle Controls");
    document.body.appendChild(toggle);
    this.toggleButton = toggle;
  }

  createControlsPanel() {
    const controls = document.createElement("div");
    controls.className = "controls shared-controls";
    controls.innerHTML = `
      <h3>Exhibition Controls</h3>
      <div class="control-group">
        <button class="control-button" onclick="window.location.reload()">
          🔄 Reload Exhibition
        </button>
      </div>
      <div class="instruction">
        This exhibition is interactive.<br>
        Explore and discover hidden features!
      </div>
    `;
    document.body.appendChild(controls);
    this.controlsPanel = controls;
  }

  setupEventListeners() {
    this.toggleButton.addEventListener("click", () => {
      this.toggle();
    });

    // Close controls when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.isActive &&
        !this.controlsPanel.contains(e.target) &&
        !this.toggleButton.contains(e.target)
      ) {
        this.close();
      }
    });

    // Close controls with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isActive) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isActive) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isActive = true;
    this.controlsPanel.classList.add("active");
    this.toggleButton.classList.add("active");
  }

  close() {
    this.isActive = false;
    this.controlsPanel.classList.remove("active");
    this.toggleButton.classList.remove("active");
  }

  // Method to add custom controls
  addControl(html) {
    const customGroup = document.createElement("div");
    customGroup.className = "control-group";
    customGroup.innerHTML = html;

    const instruction = this.controlsPanel.querySelector(".instruction");
    this.controlsPanel.insertBefore(customGroup, instruction);
  }

  // Method to update instruction text
  setInstructions(text) {
    const instruction = this.controlsPanel.querySelector(".instruction");
    if (instruction) {
      instruction.innerHTML = text;
    }
  }

  // Method to add info display
  addInfoDisplay(title, content) {
    const infoDisplay = document.createElement("div");
    infoDisplay.className = "info-display";
    infoDisplay.innerHTML = `
      <h4>${title}</h4>
      <div class="data" id="info-${title
        .toLowerCase()
        .replace(/\s/g, "-")}">${content}</div>
    `;
    this.controlsPanel.appendChild(infoDisplay);
    return infoDisplay.querySelector(".data");
  }
}

// Initialize controls when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.exhibitionControls = new ExhibitionControls();
});

// Hide loading indicator when page is loaded
window.addEventListener("load", () => {
  const loading = document.querySelector(".loading");
  if (loading) {
    setTimeout(() => {
      loading.style.opacity = "0";
      setTimeout(() => {
        loading.style.display = "none";
      }, 300);
    }, 1000);
  }
});
