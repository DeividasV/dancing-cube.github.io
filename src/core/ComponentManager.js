/**
 * Component Manager
 * Handles loading and initialization of the framework components
 */
if (typeof ComponentManager === "undefined") {
  class ComponentManager {
    constructor() {
      this.loadedComponents = new Set();
      this.loadPromises = new Map();
      this.basePath = this.getBasePath();
    }

    getBasePath() {
      const script = document.currentScript;
      if (script) {
        const src = script.src;
        const pathParts = src.split("/");
        pathParts.pop(); // Remove filename (ComponentManager.js)
        pathParts.pop(); // Remove core directory
        return pathParts.join("/") + "/";
      }
      return "../src/";
    }

    async loadCSS(path) {
      return new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    }

    async loadScript(path) {
      const cacheKey = path;

      if (this.loadPromises.has(cacheKey)) {
        return this.loadPromises.get(cacheKey);
      }

      const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = path;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      this.loadPromises.set(cacheKey, promise);
      return promise;
    }

    async loadFramework() {
      try {
        console.log("🚀 Loading Exhibition Framework...");

        // Load CSS first
        await this.loadCSS(`${this.basePath}css/exhibition-framework.css`);

        // Load core components in order
        await this.loadScript(`${this.basePath}core/AudioSystem.js`);
        await this.loadScript(`${this.basePath}components/TopMenu.js`);
        await this.loadScript(`${this.basePath}components/ExhibitionWindow.js`);
        await this.loadScript(`${this.basePath}core/Exhibition.js`);

        console.log("✅ Exhibition Framework loaded successfully");

        // Signal that framework is ready
        document.dispatchEvent(new CustomEvent("exhibitionFrameworkReady"));
      } catch (error) {
        console.error("❌ Failed to load Exhibition Framework:", error);
        throw error;
      }
    }

    async waitForFramework() {
      if (
        window.Exhibition &&
        window.AudioSystem &&
        window.TopMenu &&
        window.ExhibitionWindow
      ) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        document.addEventListener("exhibitionFrameworkReady", resolve, {
          once: true,
        });
      });
    }

    async createExhibition(config, ExhibitionClass) {
      await this.waitForFramework();

      if (!ExhibitionClass) {
        throw new Error("ExhibitionClass is required");
      }

      return new ExhibitionClass(config);
    }
  }

  // Global instance
  window.ComponentManager = new ComponentManager();

  // Auto-load framework when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.ComponentManager.loadFramework();
    });
  } else {
    window.ComponentManager.loadFramework();
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = ComponentManager;
}
