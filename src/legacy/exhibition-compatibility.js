// Exhibition Compatibility Wrapper
// This ensures exhibitions work with the new framework structure

// Only run if not already initialized
if (!window.exhibitionFrameworkInitialized) {
  console.log("Initializing exhibition framework...");

  // Track that we're initializing to prevent multiple runs
  window.exhibitionFrameworkInitialized = true;

  // Initialize the framework components when the page loads
  document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM ready, checking framework components...");

    // If all components already exist, just initialize them
    if (window.AudioSystem && window.TopMenu && window.ExhibitionWindow) {
      console.log("Framework components already available, initializing...");
      initializeFramework();
      return;
    }

    // Otherwise, load them dynamically
    console.log("Loading framework components dynamically...");
    try {
      await loadFrameworkComponents();
      initializeFramework();
    } catch (error) {
      console.error("Failed to load framework:", error);
    }
  });

  // Function to load framework components
  async function loadFrameworkComponents() {
    const components = [
      { src: "../../src/core/AudioSystem.js", className: "AudioSystem" },
      {
        src: "../../src/core/ComponentManager.js",
        className: "ComponentManager",
      },
      { src: "../../src/components/TopMenu.js", className: "TopMenu" },
      {
        src: "../../src/components/ExhibitionWindow.js",
        className: "ExhibitionWindow",
      },
      { src: "../../src/core/Exhibition.js", className: "Exhibition" },
    ];

    for (const component of components) {
      // Check if class already exists globally
      if (!window[component.className]) {
        try {
          await loadScript(component.src);
          console.log(`Loaded ${component.className}`);
        } catch (error) {
          console.warn(`Failed to load ${component.className}:`, error);
        }
      } else {
        console.log(`${component.className} already exists`);
      }
    }
  }

  // Helper to load a single script - with duplicate prevention
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded by looking for existing script tags
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`Script already loaded: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize framework components
  function initializeFramework() {
    console.log("Initializing framework components...");

    // Initialize TopMenu after components are loaded
    setTimeout(() => {
      if (typeof TopMenu !== "undefined" && TopMenu.init) {
        try {
          TopMenu.init();
          console.log("TopMenu initialized");
        } catch (e) {
          console.log("TopMenu initialization skipped:", e.message);
        }
      }

      // Initialize AudioSystem if available
      if (typeof AudioSystem !== "undefined") {
        try {
          if (!window.exhibitionAudioSystem) {
            window.exhibitionAudioSystem = new AudioSystem();
            console.log("AudioSystem initialized");
          }
        } catch (e) {
          console.log("AudioSystem initialization skipped:", e.message);
        }
      }

      // Signal that framework is ready
      document.dispatchEvent(new CustomEvent("exhibitionFrameworkReady"));
      console.log("Framework ready event dispatched");
    }, 100);

    // Add basic responsive canvas functionality for legacy exhibitions
    const canvas = document.querySelector("canvas");
    if (canvas) {
      function resizeCanvas() {
        const container = canvas.parentElement;
        if (container) {
          const width = container.offsetWidth;
          const height = container.offsetHeight;
          canvas.style.width = width + "px";
          canvas.style.height = height + "px";

          // Trigger resize event for the exhibition
          if (window.dispatchEvent) {
            window.dispatchEvent(new Event("resize"));
          }
        }
      }

      // Set up resize handler
      window.addEventListener("resize", resizeCanvas);
      setTimeout(resizeCanvas, 100); // Initial resize after DOM is ready
    }
  }
} else {
  console.log("Exhibition framework already initialized, skipping...");
}

// Global compatibility functions
window.exhibitionUtils = {
  resizeCanvas: function (canvas) {
    const container = canvas.parentElement;
    if (container) {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return { width, height };
      }
    }
    return null;
  },
};
