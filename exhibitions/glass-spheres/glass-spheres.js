// Glass Spheres Exhibition - Futuristic Holographic Glass Orbs with Advanced Effects

class FuturisticGlassOrbs {
  constructor() {
    this.container = document.getElementById("container");
    this.orbs = [];
    this.energyFields = [];
    this.hologramLines = [];
    this.scanLines = [];
    this.time = 0;
    this.audioContext = null;
    this.soundEnabled = false;

    this.initAudio();
    this.setupEnvironment();
    this.createOrbs();
    this.createEnergyFields();
    this.createHologramLines();
    this.createScanLines();
    this.createDataStreams();
    this.initInteractions();
    this.animate();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio not supported");
    }
  }

  playHologramSound(frequency = 400, duration = 0.2) {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed");
    }
  }

  setupEnvironment() {
    // Create futuristic background with grid
    this.container.style.cssText = `
      background: 
        radial-gradient(circle at 30% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
        linear-gradient(45deg, 
          rgba(0, 20, 40, 0.8) 0%, 
          rgba(10, 0, 30, 0.9) 50%, 
          rgba(0, 30, 20, 0.8) 100%
        );
      position: relative;
      overflow: hidden;
    `;

    // Create animated grid background
    const gridOverlay = document.createElement("div");
    gridOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridPulse 4s ease-in-out infinite;
      pointer-events: none;
    `;
    this.container.appendChild(gridOverlay);
  }

  createOrbs() {
    for (let i = 0; i < 12; i++) {
      const orb = document.createElement("div");
      orb.className = "futuristic-orb";

      const size = 60 + Math.random() * 40;
      const x = Math.random() * (this.container.offsetWidth - size);
      const y = Math.random() * (this.container.offsetHeight - size);

      orb.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: 
          radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.8) 0%,
            rgba(0, 255, 255, 0.6) 30%,
            rgba(255, 0, 255, 0.4) 60%,
            rgba(0, 255, 255, 0.2) 80%,
            transparent 100%
          );
        border: 2px solid rgba(0, 255, 255, 0.6);
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.6),
          0 0 40px rgba(255, 0, 255, 0.4),
          inset 0 0 20px rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        animation: orbFloat ${3 + Math.random() * 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        cursor: pointer;
        transition: all 0.3s ease;
      `;

      // Add inner core
      const core = document.createElement("div");
      core.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20%;
        height: 20%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(0, 255, 255, 0.8) 100%);
        border-radius: 50%;
        animation: coreRotate ${2 + Math.random() * 3}s linear infinite;
      `;
      orb.appendChild(core);

      // Add energy rings
      for (let j = 0; j < 3; j++) {
        const ring = document.createElement("div");
        ring.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${80 + j * 20}%;
          height: ${80 + j * 20}%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(0, 255, 255, ${0.3 - j * 0.1});
          border-radius: 50%;
          animation: ringPulse ${1.5 + j * 0.5}s ease-in-out infinite;
          animation-delay: ${j * 0.2}s;
        `;
        orb.appendChild(ring);
      }

      this.container.appendChild(orb);
      this.orbs.push({
        element: orb,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: size,
      });
    }
  }

  createEnergyFields() {
    for (let i = 0; i < 6; i++) {
      const field = document.createElement("div");
      field.className = "energy-field";

      field.style.cssText = `
        position: absolute;
        width: 200px;
        height: 200px;
        left: ${Math.random() * (this.container.offsetWidth - 200)}px;
        top: ${Math.random() * (this.container.offsetHeight - 200)}px;
        background: radial-gradient(circle, 
          rgba(0, 255, 255, 0.2) 0%,
          rgba(255, 0, 255, 0.1) 30%,
          transparent 70%
        );
        border-radius: 50%;
        animation: fieldPulse ${4 + Math.random() * 2}s ease-in-out infinite;
        pointer-events: none;
      `;

      this.container.appendChild(field);
      this.energyFields.push(field);
    }
  }

  createHologramLines() {
    for (let i = 0; i < 8; i++) {
      const line = document.createElement("div");
      line.className = "hologram-line";

      const isVertical = Math.random() > 0.5;
      line.style.cssText = `
        position: absolute;
        background: linear-gradient(${isVertical ? "0deg" : "90deg"}, 
          transparent 0%,
          rgba(0, 255, 255, 0.6) 50%,
          transparent 100%
        );
        ${
          isVertical
            ? `width: 2px; height: 100%; left: ${Math.random() * 100}%; top: 0;`
            : `width: 100%; height: 2px; left: 0; top: ${Math.random() * 100}%;`
        }
        animation: lineScroll ${3 + Math.random() * 2}s linear infinite;
        pointer-events: none;
      `;

      this.container.appendChild(line);
      this.hologramLines.push(line);
    }
  }

  createScanLines() {
    for (let i = 0; i < 3; i++) {
      const scanLine = document.createElement("div");
      scanLine.className = "scan-line";

      scanLine.style.cssText = `
        position: absolute;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(0, 255, 255, 0.8) 50%,
          transparent 100%
        );
        top: ${i * 33}%;
        animation: scanMove ${2 + i * 0.5}s linear infinite;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
      `;

      this.container.appendChild(scanLine);
      this.scanLines.push(scanLine);
    }
  }

  createDataStreams() {
    for (let i = 0; i < 20; i++) {
      const stream = document.createElement("div");
      stream.className = "data-stream";

      const chars = "01ABCDEFabcdef";
      stream.textContent = Array.from(
        { length: 3 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");

      stream.style.cssText = `
        position: absolute;
        color: rgba(0, 255, 255, 0.7);
        font-family: 'Courier New', monospace;
        font-size: 12px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: dataFloat ${3 + Math.random() * 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        pointer-events: none;
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
      `;

      this.container.appendChild(stream);
    }
  }

  initInteractions() {
    this.orbs.forEach((orbData, index) => {
      orbData.element.addEventListener("mouseenter", () => {
        orbData.element.style.transform = "scale(1.2)";
        orbData.element.style.boxShadow = `
          0 0 30px rgba(0, 255, 255, 0.8),
          0 0 60px rgba(255, 0, 255, 0.6),
          inset 0 0 30px rgba(255, 255, 255, 0.3)
        `;
        this.playHologramSound(400 + index * 50, 0.3);
      });

      orbData.element.addEventListener("mouseleave", () => {
        orbData.element.style.transform = "scale(1)";
        orbData.element.style.boxShadow = `
          0 0 20px rgba(0, 255, 255, 0.6),
          0 0 40px rgba(255, 0, 255, 0.4),
          inset 0 0 20px rgba(255, 255, 255, 0.2)
        `;
      });

      orbData.element.addEventListener("click", () => {
        this.createEnergyBurst(
          orbData.x + orbData.size / 2,
          orbData.y + orbData.size / 2
        );
        this.playHologramSound(600 + index * 100, 0.5);
      });
    });

    // Global mouse effects
    this.container.addEventListener("mousemove", (e) => {
      const rect = this.container.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / rect.width;
      const mouseY = (e.clientY - rect.top) / rect.height;

      this.orbs.forEach((orbData, index) => {
        const distance = Math.sqrt(
          Math.pow(mouseX * rect.width - orbData.x, 2) +
            Math.pow(mouseY * rect.height - orbData.y, 2)
        );

        if (distance < 150) {
          const intensity = 1 - distance / 150;
          orbData.element.style.filter = `brightness(${
            1 + intensity * 0.5
          }) hue-rotate(${intensity * 60}deg)`;
        } else {
          orbData.element.style.filter = "brightness(1) hue-rotate(0deg)";
        }
      });
    });
  }

  createEnergyBurst(x, y) {
    const burst = document.createElement("div");
    burst.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(0, 255, 255, 0.8) 50%, transparent 100%);
      border-radius: 50%;
      animation: energyBurst 0.8s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    this.container.appendChild(burst);

    setTimeout(() => {
      if (burst.parentNode) {
        burst.parentNode.removeChild(burst);
      }
    }, 800);
  }

  animate() {
    this.time += 0.016;

    // Update orb positions
    this.orbs.forEach((orbData) => {
      orbData.x += orbData.vx;
      orbData.y += orbData.vy;

      // Bounce off edges
      if (
        orbData.x <= 0 ||
        orbData.x >= this.container.offsetWidth - orbData.size
      ) {
        orbData.vx *= -1;
      }
      if (
        orbData.y <= 0 ||
        orbData.y >= this.container.offsetHeight - orbData.size
      ) {
        orbData.vy *= -1;
      }

      orbData.element.style.left = orbData.x + "px";
      orbData.element.style.top = orbData.y + "px";
    });

    requestAnimationFrame(() => this.animate());
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;

    if (
      this.soundEnabled &&
      this.audioContext &&
      this.audioContext.state === "suspended"
    ) {
      this.audioContext.resume();
    }
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes orbFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  @keyframes coreRotate {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes ringPulse {
    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  }

  @keyframes fieldPulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }

  @keyframes lineScroll {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes scanMove {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
  }

  @keyframes dataFloat {
    0%, 100% { opacity: 0.3; transform: translateY(0px); }
    50% { opacity: 1; transform: translateY(-10px); }
  }

  @keyframes gridPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.7; }
  }

  @keyframes energyBurst {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Global sound toggle function
window.toggleAppSound = function () {
  if (window.futuristicOrbs) {
    window.futuristicOrbs.toggleSound();
  }
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.futuristicOrbs = new FuturisticGlassOrbs();
});
