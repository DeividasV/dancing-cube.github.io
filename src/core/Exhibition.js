/**
 * Base Exhibition Class
 * Provides a unified framework for all 3D exhibitions
 */
if (typeof Exhibition === "undefined") {
  class Exhibition {
    constructor(config) {
      this.config = {
        title: "Untitled Exhibition",
        description: "",
        hasAudio: false,
        autoStart: true,
        backgroundColor: 0x0a0a0a,
        camera: {
          fov: 75,
          near: 0.1,
          far: 1000,
          position: { x: 0, y: 0, z: 10 },
        },
        ...config,
      };

      // Three.js core
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.container = null;

      // Framework components
      this.topMenu = null;
      this.audioSystem = null;
      this.exhibitionWindow = null;

      // State management
      this.isRunning = false;
      this.isInitialized = false;
      this.animationId = null;

      // Performance monitoring
      this.frameCount = 0;
      this.lastTime = performance.now();

      // Auto-initialize
      this.init();
    }

    async init() {
      try {
        await this.setupWindow();
        await this.setupThreeJS();

        if (this.config.hasAudio) {
          await this.setupAudio();
        }

        this.setupControls();
        this.setupEventListeners();

        // Call subclass load method
        await this.load();

        this.isInitialized = true;

        if (this.config.autoStart) {
          this.start();
        }

        console.log(`✅ ${this.config.title} initialized successfully`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${this.config.title}:`, error);
      }
    }

    async setupWindow() {
      this.exhibitionWindow = new ExhibitionWindow(this.config);
      this.container = this.exhibitionWindow.getContainer();
      this.topMenu = this.exhibitionWindow.getTopMenu();
    }

    async setupThreeJS() {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(this.config.backgroundColor);

      // Create camera
      const { fov, near, far, position } = this.config.camera;
      this.camera = new THREE.PerspectiveCamera(
        fov,
        this.container.clientWidth / this.container.clientHeight,
        near,
        far
      );
      this.camera.position.set(position.x, position.y, position.z);

      // Create renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.container.appendChild(this.renderer.domElement);

      // Setup lighting (basic setup, can be overridden)
      this.setupLighting();
    }

    setupLighting() {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      this.scene.add(ambientLight);

      // Directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);
    }

    async setupAudio() {
      this.audioSystem = new AudioSystem();

      // Connect audio toggle in top menu
      this.topMenu.onAudioToggle((enabled) => {
        this.audioSystem.toggle(enabled);
        this.onAudioToggle(enabled);
      });
    }

    setupControls() {
      // Basic mouse/touch controls
      this.mouseControls = {
        isDown: false,
        mouseX: 0,
        mouseY: 0,
        targetRotationX: 0,
        targetRotationY: 0,
      };

      // Window resize handling
      window.addEventListener("resize", () => this.onWindowResize());
    }

    setupEventListeners() {
      // Canvas mouse events
      const canvas = this.renderer.domElement;

      canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
      canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
      canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
      canvas.addEventListener("wheel", (e) => this.onMouseWheel(e));

      // Touch events for mobile
      canvas.addEventListener("touchstart", (e) => this.onTouchStart(e));
      canvas.addEventListener("touchmove", (e) => this.onTouchMove(e));
      canvas.addEventListener("touchend", (e) => this.onTouchEnd(e));

      // Keyboard events
      window.addEventListener("keydown", (e) => this.onKeyDown(e));
      window.addEventListener("keyup", (e) => this.onKeyUp(e));

      // Visibility change (pause when tab is inactive)
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }

    start() {
      if (!this.isInitialized) {
        console.warn("Exhibition not initialized yet");
        return;
      }

      if (!this.isRunning) {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
        this.onStart();
      }
    }

    pause() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.onPause();
    }

    resume() {
      if (this.isInitialized && !this.isRunning) {
        this.start();
      }
    }

    stop() {
      this.pause();
      if (this.audioSystem) {
        this.audioSystem.stop();
      }
      this.onStop();
    }

    animate() {
      if (!this.isRunning) return;

      this.animationId = requestAnimationFrame(() => this.animate());

      const currentTime = performance.now();
      const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
      this.lastTime = currentTime;

      // Update scene
      this.update(deltaTime);

      // Render
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      // Performance monitoring
      this.frameCount++;
      if (this.frameCount % 60 === 0) {
        this.onPerformanceUpdate(1 / deltaTime); // FPS
      }
    }

    onWindowResize() {
      if (!this.camera || !this.renderer) return;

      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);

      this.onResize(width, height);
    }

    dispose() {
      this.stop();

      // Dispose Three.js resources
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        this.scene.clear();
      }

      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(
            this.renderer.domElement
          );
        }
      }

      // Dispose audio system
      if (this.audioSystem) {
        this.audioSystem.dispose();
      }

      // Remove event listeners
      window.removeEventListener("resize", this.onWindowResize);

      this.onDispose();

      console.log(`🗑️ ${this.config.title} disposed`);
    }

    // Event handlers (override in subclasses)
    onMouseDown(event) {}
    onMouseMove(event) {}
    onMouseUp(event) {}
    onMouseWheel(event) {}
    onTouchStart(event) {}
    onTouchMove(event) {}
    onTouchEnd(event) {}
    onKeyDown(event) {}
    onKeyUp(event) {}
    onResize(width, height) {}
    onStart() {}
    onPause() {}
    onStop() {}
    onDispose() {}
    onAudioToggle(enabled) {}
    onPerformanceUpdate(fps) {}

    // Abstract methods (must be implemented by subclasses)
    async load() {
      throw new Error("load() method must be implemented by subclass");
    }

    update(deltaTime) {
      throw new Error("update() method must be implemented by subclass");
    }

    // Utility methods
    getMousePosition(event) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
      };
    }

    screenToWorld(screenX, screenY, distance = 10) {
      const mouse = new THREE.Vector2(screenX, screenY);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const direction = raycaster.ray.direction;
      const origin = raycaster.ray.origin;

      return origin.clone().add(direction.clone().multiplyScalar(distance));
    }
  }
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = Exhibition;
}
