// BL00D_0C34N - 3D Blood Ocean Renderer
// High-performance WebGL-ready renderer with Hi-DPI support

class BloodOceanRenderer {
  constructor(containerId = "container") {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element '${containerId}' not found`);
    }

    this.canvas = null;
    this.ctx = null;
    this.isDisposed = false;
    this.isPaused = false;
    this.animationId = null;

    // Performance tracking
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 60;
    this.frameCount = 0;

    // Object pools for GC optimization
    this.ripplePool = [];
    this.dropPool = [];
    this.maxRipples = 400;
    this.maxDrops = 250;

    // 3D perspective parameters
    this.perspective = {
      fov: 60,
      viewAngle: 25,
      horizon: 0,
      distance: 1000,
      camera: { x: 0, y: -200, z: 300 },
    };

    // State containers
    this.time = 0;
    this.ripples = [];
    this.drops = [];
    this.oceanSurface = null;

    // Mouse tracking
    this.mouseX = 0;
    this.mouseZ = 0;
    this.lastMouseTime = 0;
    this.mouseRippleDelay = 0.1; // Create mouse ripples every 100ms

    // Enhanced blood red palette - solid dark bordeaux colors
    this.bloodColors = [
      { base: "#5a0000", reflect: "#8b0000", shine: "#a52a2a" }, // Dark bordeaux
      { base: "#660000", reflect: "#990000", shine: "#b22222" }, // Deep red
      { base: "#4a0000", reflect: "#750000", shine: "#8b0000" }, // Very dark red
      { base: "#550000", reflect: "#800000", shine: "#a00000" }, // Maroon
      { base: "#600000", reflect: "#8b0000", shine: "#aa0000" }, // Dark crimson
    ];

    this.init();
  }

  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.oceanSurface = new WaveSurface(this);
    this.start();
  }

  createCanvas() {
    // Create canvas if it doesn't exist
    this.canvas =
      document.getElementById("blood-canvas") || this.createNewCanvas();
    this.ctx = this.canvas.getContext("2d");

    // Hi-DPI support
    this.resizeCanvas();
  }

  createNewCanvas() {
    const canvas = document.createElement("canvas");
    canvas.id = "blood-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    this.container.appendChild(canvas);
    return canvas;
  }

  // Hi-DPI rendering with device pixel ratio scaling
  resizeCanvas() {
    if (!this.canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const { clientWidth: w, clientHeight: h } = this.canvas;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);

    // Scale context to ensure drawing operations are in CSS pixels
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Update perspective based on new canvas size
    this.perspective.horizon = h * 0.3;
  }

  setupEventListeners() {
    // Resize handler
    window.addEventListener("resize", () => this.resizeCanvas());

    // Visibility change for battery optimization
    document.addEventListener("visibilitychange", () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        this.lastTime = performance.now();
      }
    });

    // Mouse interaction
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));

    // Performance monitoring
    window.addEventListener("beforeunload", () => this.dispose());
  }

  handleClick(e) {
    console.log("Click detected at:", e.clientX, e.clientY);

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = this.screenToWorld(screenX, screenY);
    console.log("World position:", worldPos);

    this.createClickRipples(worldPos.x, worldPos.z); // Create bigger ripples for clicks

    // Audio driven by wave physics
    if (window.bloodOceanAudio && window.bloodOceanAudio.isEnabled()) {
      console.log("Audio is enabled, playing physics-driven ripple sound");
      const metrics = this.sampleWaveInteraction(
        worldPos.x,
        worldPos.z,
        this.time
      );
      const pan = Math.max(
        -1,
        Math.min(1, (screenX / this.canvas.clientWidth) * 2 - 1)
      );
      const intensity = 0.6 + metrics.energy * 0.9; // 0.6..1.5

      console.log("Wave physics metrics:", metrics);
      console.log("Calling playWaveInteraction with physics data:", {
        intensity,
        pan,
        maxRadius: 120 * (0.7 + metrics.energy * 0.6),
        energy: metrics.energy,
        slope: metrics.slope,
        curvature: metrics.curvature,
        vertVel: metrics.vertVel,
      });

      window.bloodOceanAudio.playWaveInteraction(intensity, pan, {
        maxRadius: 120 * (0.7 + metrics.energy * 0.6),
        energy: metrics.energy,
        slope: metrics.slope,
        curvature: metrics.curvature,
        vertVel: metrics.vertVel,
      });
    } else {
      console.log("Audio not available or not enabled:", {
        audioExists: !!window.bloodOceanAudio,
        audioEnabled: window.bloodOceanAudio
          ? window.bloodOceanAudio.isEnabled()
          : false,
      });
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = this.screenToWorld(screenX, screenY);
    this.mouseX = worldPos.x;
    this.mouseZ = worldPos.z;

    // Create small following ripples periodically
    if (this.time - this.lastMouseTime > this.mouseRippleDelay) {
      this.createMouseRipples(this.mouseX, this.mouseZ);
      this.lastMouseTime = this.time;
    }
  }

  // Convert screen coordinates to world coordinates using inverse projection
  screenToWorld(screenX, screenY) {
    // This must exactly reverse the project3D transformation

    // Step 1: Convert screen coordinates back to relative coordinates
    const screenCenterX = this.canvas.clientWidth / 2;
    const relativeX = screenX - screenCenterX;
    const relativeY = screenY - this.perspective.horizon;

    // Step 2: We need to estimate the depth (rotZ) to calculate proper scale
    // For points on the water surface, assume y ≈ 0 in world space
    // Points closer to horizon are further away (smaller rotZ)
    // Points further from horizon are closer (larger rotZ)

    const estimatedRotZ = Math.max(-500, Math.min(500, -relativeY * 1.5));

    // Step 3: Calculate scale (same formula as project3D)
    const scale =
      this.perspective.distance / (estimatedRotZ + this.perspective.distance);

    // Step 4: Reverse the screen projection
    const viewX = relativeX / scale;
    const rotY = relativeY / scale;

    // Step 5: Reverse the viewing angle rotation
    const angleRad = (this.perspective.viewAngle * Math.PI) / 180;
    // project3D: rotY = viewY * cos - viewZ * sin
    // project3D: rotZ = viewY * sin + viewZ * cos
    // Solving for viewY and viewZ:
    const viewY =
      rotY * Math.cos(angleRad) + estimatedRotZ * Math.sin(angleRad);
    const viewZ =
      -rotY * Math.sin(angleRad) + estimatedRotZ * Math.cos(angleRad);

    // Step 6: Convert back to world coordinates
    const worldX = viewX + this.perspective.camera.x;
    const worldY = viewY + this.perspective.camera.y;
    const worldZ = viewZ + this.perspective.camera.z;

    return { x: worldX, z: worldZ };
  }

  createClickRipples(worldX, worldZ) {
    // Bigger, more dramatic ripples for clicks
    this.addRipple(worldX, worldZ, 2.0, 0, 180);
    this.addRipple(worldX, worldZ, 1.5, 0.1, 140);
    this.addRipple(worldX, worldZ, 1.0, 0.25, 100);
    this.addRipple(worldX, worldZ, 0.7, 0.45, 70);
    this.addRipple(worldX, worldZ, 0.4, 0.7, 50);
  }

  createMouseRipples(worldX, worldZ) {
    // Small, subtle ripples that follow the mouse
    const intensity = 0.3 + Math.random() * 0.2;
    const radius = 30 + Math.random() * 20;
    this.addRipple(worldX, worldZ, intensity, 0, radius);

    // Occasionally play subtle mouse ripple sounds
    if (
      Math.random() < 0.1 &&
      window.bloodOceanAudio &&
      window.bloodOceanAudio.isEnabled()
    ) {
      const normalizedX = Math.max(-1, Math.min(1, worldX / 500)); // Normalize world position
      const rippleData = {
        maxRadius: radius,
        intensity: intensity,
        position: { x: worldX, z: worldZ },
        type: "mouse",
      };

      // Very subtle mouse ripple sound
      window.bloodOceanAudio.playWaveInteraction(
        intensity * 0.3,
        normalizedX,
        rippleData
      );
    }
  }

  // Object pool management for GC optimization
  addRipple(x, z, intensity = 1, delay = 0, maxRadius = null) {
    if (this.ripples.length >= this.maxRipples) {
      // Reuse oldest ripple instead of creating new one
      const oldRipple = this.ripples.shift();
      if (oldRipple && oldRipple.reset) {
        oldRipple.reset(x, z, intensity, delay, maxRadius);
        this.ripples.push(oldRipple);
      }
    } else {
      this.ripples.push(new Ripple3D(this, x, z, intensity, delay, maxRadius));
    }
  }

  addDrop() {
    if (this.drops.length >= this.maxDrops) {
      // Reuse oldest drop instead of creating new one
      const oldDrop = this.drops.shift();
      if (oldDrop && oldDrop.reset) {
        oldDrop.reset();
        this.drops.push(oldDrop);
      }
    } else {
      this.drops.push(new BloodDrop3D(this));
    }
  }

  // 3D transformation utilities
  project3D(x, y, z) {
    const viewX = x - this.perspective.camera.x;
    const viewY = y - this.perspective.camera.y;
    const viewZ = z - this.perspective.camera.z;

    // Rotate for viewing angle
    const angleRad = (this.perspective.viewAngle * Math.PI) / 180;
    const rotY = viewY * Math.cos(angleRad) - viewZ * Math.sin(angleRad);
    const rotZ = viewY * Math.sin(angleRad) + viewZ * Math.cos(angleRad);

    const scale =
      this.perspective.distance / (rotZ + this.perspective.distance);

    return {
      x: this.canvas.clientWidth / 2 + viewX * scale,
      y: this.perspective.horizon + rotY * scale,
      scale: scale,
      depth: rotZ,
    };
  }

  getWaveHeight(x, z, t) {
    let height = 0;
    height += Math.sin(x * 0.01 + t * 2) * 15;
    height += Math.sin(z * 0.008 + t * 1.5) * 12;
    height += Math.cos(x * 0.015 + z * 0.012 + t * 1.8) * 8;
    height += Math.sin(x * 0.02 + z * 0.015 + t * 2.2) * 5;
    return height;
  }

  // Sample local wave physics for audio-driven ripple sounds
  sampleWaveInteraction(x, z, t) {
    const eps = 1.0;
    const hC = this.getWaveHeight(x, z, t);
    const hL = this.getWaveHeight(x - eps, z, t);
    const hR = this.getWaveHeight(x + eps, z, t);
    const hD = this.getWaveHeight(x, z - eps, t);
    const hU = this.getWaveHeight(x, z + eps, t);

    // gradient magnitude (surface steepness)
    const dX = (hR - hL) / (2 * eps);
    const dZ = (hU - hD) / (2 * eps);
    const slope = Math.min(1.0, Math.sqrt(dX * dX + dZ * dZ) / 12); // normalize to ~[0..1]

    // curvature (Laplacian) – concave (>0) vs convex (<0)
    const lap = (hL + hR + hD + hU - 4 * hC) / (eps * eps);
    const curvature = Math.max(-1, Math.min(1, lap / 8)); // clamp for mapping

    // vertical velocity (approx using tiny dt)
    const dt = 1 / 120;
    const hNext = this.getWaveHeight(x, z, t + dt);
    const v = (hNext - hC) / dt; // px/s
    const vertVel = Math.max(0, Math.min(1, Math.abs(v) / 150)); // normalize

    // crude "energy" score
    const energy = Math.max(
      0,
      Math.min(1, slope * 0.6 + vertVel * 0.5 + Math.abs(curvature) * 0.3)
    );

    return { slope, curvature, vertVel, energy, hC };
  }

  // Frame-rate independent animation loop
  animate(currentTime) {
    if (this.isDisposed) return;

    try {
      this.animationId = requestAnimationFrame((time) => this.animate(time));

      if (this.isPaused) return;

      // Calculate delta time for frame-rate independence
      if (this.lastTime === 0) this.lastTime = currentTime;
      this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1 / 30); // Cap at 30fps minimum
      this.lastTime = currentTime;

      this.time += this.deltaTime;
      this.frameCount++;

      // Performance monitoring (every 60 frames)
      if (this.frameCount % 60 === 0) {
        this.fps = Math.round(1 / this.deltaTime);
      }

      this.update();
      this.render();
    } catch (error) {
      console.error("Animation error:", error);
      // Stop animation on error to prevent infinite error loops
      this.stop();
    }
  }

  update() {
    // Move camera slightly for dynamic effect
    this.perspective.camera.x = Math.sin(this.time * 0.3) * 50;
    this.perspective.camera.z = 300 + Math.cos(this.time * 0.2) * 30;

    // Update ripples with bounds checking
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      if (!this.ripples[i].update(this.deltaTime)) {
        this.ripples.splice(i, 1);
      }
    }

    // Update drops with bounds checking
    for (let i = this.drops.length - 1; i >= 0; i--) {
      if (!this.drops[i].update(this.deltaTime)) {
        this.drops.splice(i, 1);
      }
    }

    // Create random effects with time-based probability
    if (Math.random() < 0.012 * (this.deltaTime * 60)) {
      const x = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      const intensity = Math.random() * 0.6 + 0.2;
      this.addRipple(x, z, intensity, 0, 60);
    }

    // Disabled blood drops - keep only the beautiful wave lines
    // if (Math.random() < 0.025 * (this.deltaTime * 60)) {
    //   this.addDrop();
    // }

    // Send wave data to audio system (every few frames for performance)
    if (this.frameCount % 10 === 0) {
      this.updateAudioWithWaveData();
    }

    // Cap array sizes for GC management
    if (this.ripples.length > this.maxRipples) {
      this.ripples.length = this.maxRipples;
    }
    if (this.drops.length > this.maxDrops) {
      this.drops.length = this.maxDrops;
    }
  }

  // Send wave analysis data to audio system for dynamic sound
  updateAudioWithWaveData() {
    if (!window.bloodOceanAudio || !window.bloodOceanAudio.isEnabled()) return;

    try {
      // Analyze current wave state
      const rippleCount = this.ripples.length;
      const dropCount = this.drops.length;

      // Calculate average ripple amplitude/intensity
      let totalAmplitude = 0;
      let activeRipples = 0;
      for (const ripple of this.ripples) {
        if (ripple.active && ripple.opacity > 0.1) {
          totalAmplitude += ripple.amplitude * ripple.opacity;
          activeRipples++;
        }
      }
      const averageAmplitude =
        activeRipples > 0 ? totalAmplitude / activeRipples / 12 : 0; // Normalize to 0-1

      // Calculate overall wave intensity based on multiple factors
      const baseWaveIntensity = (Math.sin(this.time * 0.8) + 1) / 2; // Base ocean rhythm
      const rippleActivity = Math.min(rippleCount / 20, 1); // Ripple density factor
      const waveIntensity = baseWaveIntensity * 0.6 + rippleActivity * 0.4;

      // Create wave data object
      const waveData = {
        rippleCount,
        dropCount,
        averageAmplitude,
        waveIntensity,
        time: this.time,
        activeRipples,
      };

      // Send to audio system
      window.bloodOceanAudio.updateAmbientWithWaveData(waveData);
    } catch (error) {
      console.warn("Error updating audio with wave data:", error);
    }
  }

  render() {
    try {
      // Clear with darker gradient background for more impressive contrast
      const bgGradient = this.ctx.createLinearGradient(
        0,
        0,
        0,
        this.canvas.clientHeight
      );
      bgGradient.addColorStop(0, "#050000"); // Even darker
      bgGradient.addColorStop(0.3, "#0f0000");
      bgGradient.addColorStop(0.7, "#1a0000");
      bgGradient.addColorStop(1, "#250000");
      this.ctx.fillStyle = bgGradient;
      this.ctx.fillRect(
        0,
        0,
        this.canvas.clientWidth,
        this.canvas.clientHeight
      );

      // Draw ocean surface
      if (this.oceanSurface) {
        this.oceanSurface.draw();
      }

      // Draw ripples
      this.ripples.forEach((ripple) => {
        try {
          ripple.draw();
        } catch (error) {
          console.warn("Ripple draw error:", error);
        }
      });

      // Disabled blood drops rendering - focus on wave lines only
      // Keep drops array updated but don't render them
      this.drops.forEach((drop) => {
        try {
          drop.update(this.deltaTime); // Update but don't draw
        } catch (error) {
          console.warn("Drop update error:", error);
        }
      });
    } catch (error) {
      console.error("Render error:", error);
      // Continue animation even if render fails
    }
  }

  start() {
    if (this.animationId) return; // Already running

    this.lastTime = performance.now();
    this.isPaused = false;
    this.animate(this.lastTime);

    // Disabled initial drops - focus on pure wave aesthetics
    // Initial drops removed for clean wave lines aesthetic
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isPaused = true;
  }

  setIntensity(intensity) {
    // Adjust visual intensity (0-1 range)
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  dispose() {
    if (this.isDisposed) return;

    this.stop();

    // Clear all arrays
    this.ripples.length = 0;
    this.drops.length = 0;
    this.ripplePool.length = 0;
    this.dropPool.length = 0;

    // Remove event listeners
    window.removeEventListener("resize", this.resizeCanvas);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    if (this.canvas) {
      this.canvas.removeEventListener("click", this.handleClick);
      this.canvas.removeEventListener("mousemove", this.handleMouseMove);
      // Remove canvas from DOM if we created it
      if (this.canvas.id === "blood-canvas" && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }

    // Null references
    this.canvas = null;
    this.ctx = null;
    this.oceanSurface = null;
    this.container = null;
    this.isDisposed = true;
  }
}

// Enhanced 3D Wave surface with optimized rendering
class WaveSurface {
  constructor(renderer) {
    this.renderer = renderer;
    this.gridSize = 20;
    this.width = 2000;
    this.depth = 2000;
    this.colorSet =
      this.renderer.bloodColors[
        Math.floor(Math.random() * this.renderer.bloodColors.length)
      ];

    // Pre-create Path2D objects for better performance
    this.wavePaths = [];
    this.lastPathUpdate = 0;
    this.pathUpdateInterval = 1 / 30; // Update paths at 30fps for smooth animation
  }

  draw() {
    try {
      const ctx = this.renderer.ctx;
      const time = this.renderer.time;

      // Update paths periodically for performance
      if (time - this.lastPathUpdate > this.pathUpdateInterval) {
        this.updateWavePaths();
        this.lastPathUpdate = time;
      }

      this.drawWaveGrid();
      // Disabled reflective patches - keep only flowing wave lines
      // this.drawReflectivePatches();
    } catch (error) {
      console.warn("WaveSurface draw error:", error);
    }
  }

  updateWavePaths() {
    // Pre-calculate wave paths for batched rendering - HORIZONTAL LINES ONLY
    this.wavePaths = [];
    const halfWidth = this.width / 2;
    const halfDepth = this.depth / 2;

    // Only horizontal wave lines extending to infinity perspective
    for (let zStep = -halfDepth; zStep < halfDepth; zStep += this.gridSize) {
      const path = new Path2D();
      let firstPoint = true;

      // Extend lines much further for infinite perspective effect
      for (
        let xStep = -halfWidth * 1.5;
        xStep <= halfWidth * 1.5;
        xStep += this.gridSize / 3
      ) {
        const waveHeight = this.renderer.getWaveHeight(
          xStep,
          zStep,
          this.renderer.time
        );
        const projected = this.renderer.project3D(xStep, waveHeight, zStep);

        if (projected.scale > 0.05) {
          // Show more distant lines
          if (firstPoint) {
            path.moveTo(projected.x, projected.y);
            firstPoint = false;
          } else {
            path.lineTo(projected.x, projected.y);
          }
        }
      }

      if (!firstPoint) {
        const depthFactor = (zStep + halfDepth) / this.depth;
        this.wavePaths.push({ path, depthFactor, type: "horizontal" });
      }
    }
  }

  drawWaveGrid() {
    const ctx = this.renderer.ctx;

    // Render horizontal wave lines with solid dark bordeaux color
    this.wavePaths.forEach(({ path, depthFactor }) => {
      // Strong visibility with solid dark red color
      const alpha = Math.max(0.6, 1 - depthFactor * 0.4); // High visibility even at distance

      // Use solid dark bordeaux/red color - no gradients, just pure color
      ctx.strokeStyle = `rgba(102, 0, 0, ${alpha})`; // Solid dark red #660000
      ctx.lineWidth = Math.max(1.5, 4 * (1 - depthFactor * 0.7)); // Thick, prominent lines

      // Add slight glow effect for more impressive look
      ctx.shadowColor = "rgba(139, 0, 0, 0.5)";
      ctx.shadowBlur = 2;

      ctx.stroke(path);

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }

  drawReflectivePatches() {
    const patchSize = 40;
    const halfWidth = this.width / 2;
    const halfDepth = this.depth / 2;

    // Render patches with LOD based on distance
    for (let z = -halfDepth; z < halfDepth; z += patchSize) {
      for (let x = -halfWidth; x < halfWidth; x += patchSize) {
        const distanceFromCenter = Math.sqrt(x * x + z * z);

        // Skip distant patches for performance
        if (distanceFromCenter > 800) continue;

        this.drawWaterPatch(x, z, patchSize, patchSize);
      }
    }
  }

  drawWaterPatch(startX, startZ, width, height) {
    const ctx = this.renderer.ctx;
    const corners = [
      { x: startX, z: startZ },
      { x: startX + width, z: startZ },
      { x: startX + width, z: startZ + height },
      { x: startX, z: startZ + height },
    ];

    const projectedCorners = corners
      .map((corner) => {
        const waveHeight = this.renderer.getWaveHeight(
          corner.x,
          corner.z,
          this.renderer.time
        );
        return this.renderer.project3D(corner.x, waveHeight, corner.z);
      })
      .filter((p) => p.scale > 0.1);

    if (projectedCorners.length < 3) return;

    // Calculate surface normal for improved lighting
    const normal = this.calculateNormal(
      startX + width / 2,
      startZ + height / 2
    );
    const lightIntensity = Math.max(0.3, normal.y * 0.7 + 0.3);

    // Environment tint for metallic effect
    const envTint = { r: 0.1, g: 0.15, b: 0.2 }; // Subtle blue-gray

    // Create reflective gradient with environment tinting
    const centerProj = this.renderer.project3D(
      startX + width / 2,
      this.renderer.getWaveHeight(
        startX + width / 2,
        startZ + height / 2,
        this.renderer.time
      ),
      startZ + height / 2
    );

    const gradient = ctx.createRadialGradient(
      centerProj.x,
      centerProj.y,
      0,
      centerProj.x,
      centerProj.y,
      width * centerProj.scale
    );

    const depthFactor = (startZ + this.depth / 2) / this.depth;
    const alpha = Math.max(0.4, 1 - depthFactor * 0.6);

    // Mix environment color into reflections and return RGBA string
    const mixEnvColorWithAlpha = (baseColor, envIntensity, alpha) => {
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);

      const mixedR = Math.round(
        r * (1 - envTint.r) + 255 * envTint.r * envIntensity
      );
      const mixedG = Math.round(
        g * (1 - envTint.g) + 255 * envTint.g * envIntensity
      );
      const mixedB = Math.round(
        b * (1 - envTint.b) + 255 * envTint.b * envIntensity
      );

      return `rgba(${mixedR}, ${mixedG}, ${mixedB}, ${alpha})`;
    };

    // Enhanced gradient with environment reflections
    gradient.addColorStop(
      0,
      mixEnvColorWithAlpha(
        this.colorSet.shine,
        0.3,
        (lightIntensity * alpha * 128) / 255
      )
    );
    gradient.addColorStop(
      0.3,
      mixEnvColorWithAlpha(
        this.colorSet.reflect,
        0.2,
        (lightIntensity * alpha * 180) / 255
      )
    );
    gradient.addColorStop(
      0.7,
      this.colorSet.base +
        Math.floor(alpha * 220)
          .toString(16)
          .padStart(2, "0")
    );
    gradient.addColorStop(
      1,
      this.colorSet.base +
        Math.floor(alpha * 160)
          .toString(16)
          .padStart(2, "0")
    );

    // Draw patch
    ctx.beginPath();
    ctx.moveTo(projectedCorners[0].x, projectedCorners[0].y);
    for (let i = 1; i < projectedCorners.length; i++) {
      ctx.lineTo(projectedCorners[i].x, projectedCorners[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Enhanced specular highlights with wind direction bias
    if (lightIntensity > 0.6) {
      const windBias = Math.sin(this.renderer.time * 0.5) * 0.3; // Simulate wind direction

      ctx.beginPath();
      ctx.ellipse(
        centerProj.x + windBias * 10,
        centerProj.y,
        Math.max(1, 3 * centerProj.scale),
        Math.max(0.5, 1.5 * centerProj.scale),
        windBias * 0.2, // Slight rotation based on wind
        0,
        Math.PI * 2
      );
      ctx.fillStyle =
        this.colorSet.shine +
        Math.floor((lightIntensity - 0.6) * 255)
          .toString(16)
          .padStart(2, "0");
      ctx.fill();
    }
  }

  calculateNormal(x, z) {
    const epsilon = 1;
    const hL = this.renderer.getWaveHeight(x - epsilon, z, this.renderer.time);
    const hR = this.renderer.getWaveHeight(x + epsilon, z, this.renderer.time);
    const hD = this.renderer.getWaveHeight(x, z - epsilon, this.renderer.time);
    const hU = this.renderer.getWaveHeight(x, z + epsilon, this.renderer.time);

    return {
      x: (hL - hR) / (2 * epsilon),
      y: 1,
      z: (hD - hU) / (2 * epsilon),
    };
  }
}

// Enhanced 3D Ripple with object pooling support
class Ripple3D {
  constructor(renderer, x, z, intensity = 1, delay = 0, maxRadius = null) {
    this.renderer = renderer;
    this.reset(x, z, intensity, delay, maxRadius);
  }

  reset(x, z, intensity = 1, delay = 0, maxRadius = null) {
    this.centerX = x;
    this.centerZ = z;
    this.radius = 0;
    this.maxRadius = maxRadius || (Math.random() * 100 + 80) * intensity;
    this.speed = (Math.random() * 2 + 1.5) * intensity;
    this.opacity = intensity;
    this.colorSet =
      this.renderer.bloodColors[
        Math.floor(Math.random() * this.renderer.bloodColors.length)
      ];
    this.amplitude = 12 * intensity;
    this.delay = delay;
    this.age = 0;
    this.active = delay === 0;
  }

  update(deltaTime) {
    this.age += deltaTime;

    if (!this.active && this.age >= this.delay) {
      this.active = true;
    }

    if (this.active) {
      this.radius += this.speed * deltaTime * 60; // Frame-rate independent
      this.opacity -= 0.005 * deltaTime * 60;
    }

    return this.opacity > 0 && this.radius < this.maxRadius;
  }

  draw() {
    if (!this.active) return;

    const ctx = this.renderer.ctx;
    const segments = 32;

    // Batch path creation for better performance
    const path = new Path2D();

    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      const x1 = this.centerX + Math.cos(angle1) * this.radius;
      const z1 = this.centerZ + Math.sin(angle1) * this.radius;
      const x2 = this.centerX + Math.cos(angle2) * this.radius;
      const z2 = this.centerZ + Math.sin(angle2) * this.radius;

      const waveHeight1 =
        this.renderer.getWaveHeight(x1, z1, this.renderer.time) +
        this.amplitude * Math.exp(-this.radius / 40);
      const waveHeight2 =
        this.renderer.getWaveHeight(x2, z2, this.renderer.time) +
        this.amplitude * Math.exp(-this.radius / 40);

      const proj1 = this.renderer.project3D(x1, waveHeight1, z1);
      const proj2 = this.renderer.project3D(x2, waveHeight2, z2);

      if (proj1.scale > 0.1 && proj2.scale > 0.1) {
        if (i === 0) {
          path.moveTo(proj1.x, proj1.y);
        }
        path.lineTo(proj2.x, proj2.y);
      }
    }

    const alpha = this.opacity * Math.max(0.3, this.radius / this.maxRadius);
    // Use solid dark bordeaux color for ripples too
    ctx.strokeStyle = `rgba(139, 0, 0, ${alpha})`; // Consistent solid dark red
    ctx.lineWidth = Math.max(1, 2.5 * (this.radius / this.maxRadius));
    ctx.stroke(path);
  }
}

// Enhanced 3D Blood Drop with object pooling support
class BloodDrop3D {
  constructor(renderer) {
    this.renderer = renderer;
    this.reset();
  }

  reset() {
    this.x = (Math.random() - 0.5) * 1500;
    this.y = -150 - Math.random() * 100;
    this.z = (Math.random() - 0.5) * 1500;

    const sizeType = Math.random();
    if (sizeType < 0.3) {
      this.size = Math.random() * 2 + 1;
      this.dropType = "tiny";
    } else if (sizeType < 0.7) {
      this.size = Math.random() * 4 + 3;
      this.dropType = "medium";
    } else {
      this.size = Math.random() * 8 + 6;
      this.dropType = "large";
    }

    this.speed = Math.random() * 1.5 + 0.8;
    if (this.dropType === "large") this.speed *= 1.3;
    if (this.dropType === "tiny") this.speed *= 0.7;

    this.colorSet =
      this.renderer.bloodColors[
        Math.floor(Math.random() * this.renderer.bloodColors.length)
      ];
    this.wobble = Math.random() * 0.015 + 0.005;
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.rotationSpeed = Math.random() * 0.1 + 0.05;
    this.rotation = 0;
  }

  update(deltaTime) {
    const frameRate = deltaTime * 60; // Frame-rate independent movement

    this.y += this.speed * frameRate;
    this.x +=
      Math.sin(this.y * this.wobble + this.wobbleOffset) * 0.8 * frameRate;
    this.rotation += this.rotationSpeed * frameRate;

    const surfaceHeight = this.renderer.getWaveHeight(
      this.x,
      this.z,
      this.renderer.time
    );
    if (this.y > surfaceHeight) {
      this.createNaturalRipples();
      return false;
    }

    return this.y < 600;
  }

  createNaturalRipples() {
    const baseIntensity = this.size / 10;

    // Notify audio system with spatial information
    if (window.bloodOceanAudio && window.bloodOceanAudio.isEnabled()) {
      const projected = this.renderer.project3D(this.x, this.y, this.z);
      const normalizedX = Math.max(
        -1,
        Math.min(1, (projected.x / this.renderer.canvas.clientWidth) * 2 - 1)
      );

      console.log(`${this.dropType} drop hit - playing sound`);
      if (this.dropType === "tiny") {
        window.bloodOceanAudio.playWaveInteraction(0.3, normalizedX);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 0.6, 0, 40);
        if (Math.random() < 0.6) {
          this.renderer.addRipple(this.x, this.z, baseIntensity * 0.3, 0.2, 25);
        }
      } else if (this.dropType === "medium") {
        window.bloodOceanAudio.playWaveInteraction(0.6, normalizedX);
        this.renderer.addRipple(this.x, this.z, baseIntensity, 0, 80);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 0.7, 0.15, 60);
        if (Math.random() < 0.7) {
          this.renderer.addRipple(
            this.x,
            this.z,
            baseIntensity * 0.4,
            0.35,
            40
          );
        }
      } else {
        window.bloodOceanAudio.playWaveInteraction(1.0, normalizedX);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 1.2, 0, 120);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 0.9, 0.1, 100);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 0.6, 0.25, 80);
        this.renderer.addRipple(this.x, this.z, baseIntensity * 0.4, 0.45, 60);
        if (Math.random() < 0.8) {
          this.renderer.addRipple(this.x, this.z, baseIntensity * 0.2, 0.7, 40);
        }
      }
    }
  }

  draw() {
    const projected = this.renderer.project3D(this.x, this.y, this.z);
    if (projected.scale > 0.1) {
      const ctx = this.renderer.ctx;
      const size = this.size * projected.scale;

      ctx.save();
      ctx.translate(projected.x, projected.y);
      ctx.rotate(this.rotation);

      // Drop shadow
      ctx.beginPath();
      ctx.ellipse(2, 2, size, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fill();

      // Main drop with gradient
      const gradient = ctx.createRadialGradient(
        -size * 0.3,
        -size * 0.4,
        0,
        0,
        0,
        size * 1.2
      );

      if (this.dropType === "tiny") {
        gradient.addColorStop(0, this.colorSet.shine + "cc");
        gradient.addColorStop(0.6, this.colorSet.reflect);
        gradient.addColorStop(1, this.colorSet.base);
      } else if (this.dropType === "large") {
        gradient.addColorStop(0, this.colorSet.shine);
        gradient.addColorStop(0.2, this.colorSet.reflect);
        gradient.addColorStop(0.7, this.colorSet.base);
        gradient.addColorStop(1, this.colorSet.base + "88");
      } else {
        gradient.addColorStop(0, this.colorSet.shine + "dd");
        gradient.addColorStop(0.4, this.colorSet.reflect);
        gradient.addColorStop(1, this.colorSet.base);
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      if (this.dropType === "large") {
        ctx.beginPath();
        ctx.ellipse(
          -size * 0.2,
          -size * 0.3,
          size * 0.2,
          size * 0.3,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = this.colorSet.shine + "66";
        ctx.fill();
      }

      ctx.restore();
    }
  }
}

// Export for global access
window.BloodOceanRenderer = BloodOceanRenderer;
