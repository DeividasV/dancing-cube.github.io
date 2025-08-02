// Wire Network Random Generation
class WireNetworkGenerator {
  constructor() {
    this.container = null;
    this.wires = [];
    this.nodes = [];
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log("Setting up wire network...");
    this.container = document.getElementById("wire-container");
    if (!this.container) {
      console.error("Wire container not found");
      return;
    }
    console.log("Wire container found:", this.container);

    // Hide loading animation
    const loadingContainer = document.querySelector(".loading-container");
    if (loadingContainer) {
      setTimeout(() => {
        loadingContainer.style.display = "none";
      }, 1000);
    }

    this.generateRandomNetwork();
  }

  generateRandomNetwork() {
    console.log("Generating random network...");
    // Clear existing content
    this.container.innerHTML = "";
    this.wires = [];
    this.nodes = [];

    // Generate random wires
    this.generateHorizontalWires();
    this.generateVerticalWires();
    this.generateDiagonalWires();
    this.generateNodes();

    console.log(
      "Network generated with",
      this.wires.length,
      "wires and",
      this.nodes.length,
      "nodes"
    );
  }

  generateHorizontalWires() {
    const numWires = 4 + Math.floor(Math.random() * 3); // 4-6 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-h wire-h${i + 1}`;

      // Random positioning and sizing
      const top = 10 + Math.random() * 80; // 10-90%
      const left = 5 + Math.random() * 30; // 5-35%
      const width = 20 + Math.random() * 40; // 20-60%

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: ${width}%;
        height: 4px;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "horizontal");
      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateVerticalWires() {
    const numWires = 4 + Math.floor(Math.random() * 3); // 4-6 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-v wire-v${i + 1}`;

      // Random positioning and sizing
      const top = 5 + Math.random() * 30; // 5-35%
      const left = 10 + Math.random() * 80; // 10-90%
      const height = 20 + Math.random() * 40; // 20-60%

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: 4px;
        height: ${height}%;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "vertical");
      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateDiagonalWires() {
    const numWires = 2 + Math.floor(Math.random() * 3); // 2-4 wires

    for (let i = 0; i < numWires; i++) {
      const wire = document.createElement("div");
      wire.className = `wire wire-d wire-d${i + 1}`;

      // Random positioning and sizing
      const top = 20 + Math.random() * 60; // 20-80%
      const left = 20 + Math.random() * 60; // 20-80%
      const width = 15 + Math.random() * 25; // 15-40%
      const rotation = -60 + Math.random() * 120; // -60 to 60 degrees

      wire.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: ${width}%;
        height: 4px;
        background: #ffd700;
        border-radius: 2px;
        box-shadow: 0 0 10px #ffd700;
        transform: rotate(${rotation}deg);
        transform-origin: left center;
        z-index: 2;
      `;

      // Add random pulses
      this.addPulses(wire, "diagonal");
      this.container.appendChild(wire);
      this.wires.push(wire);
    }
  }

  generateNodes() {
    const numNodes = 3 + Math.floor(Math.random() * 4); // 3-6 nodes

    for (let i = 0; i < numNodes; i++) {
      const node = document.createElement("div");
      node.className = `node node${i + 1}`;

      // Random positioning
      const top = 15 + Math.random() * 70; // 15-85%
      const left = 15 + Math.random() * 70; // 15-85%

      node.style.cssText = `
        position: absolute;
        top: ${top}%;
        left: ${left}%;
        width: 12px;
        height: 12px;
        background: #ff6b35;
        border-radius: 50%;
        box-shadow: 0 0 15px #ff6b35;
        z-index: 10;
        animation: nodePulse 2s ease-in-out infinite;
      `;

      this.container.appendChild(node);
      this.nodes.push(node);
    }
  }

  addPulses(wire, type) {
    const numPulses = 1 + Math.floor(Math.random() * 2); // 1-2 pulses per wire

    for (let i = 0; i < numPulses; i++) {
      const pulse = document.createElement("div");
      pulse.className = `pulse pulse-${type}`;

      const delay = Math.random() * 3; // 0-3 second delay
      const duration = 2 + Math.random() * 3; // 2-5 second duration

      pulse.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #00ffff;
        border-radius: 50%;
        box-shadow: 0 0 15px #00ffff;
        animation: pulse${
          type.charAt(0).toUpperCase() + type.slice(1)
        } ${duration}s linear infinite;
        animation-delay: ${delay}s;
        opacity: 0.8;
      `;

      // Position pulses based on wire type
      if (type === "horizontal") {
        pulse.style.top = "-4px";
        pulse.style.left = "-8px";
      } else if (type === "vertical") {
        pulse.style.left = "-4px";
        pulse.style.top = "-8px";
      } else if (type === "diagonal") {
        pulse.style.top = "-4px";
        pulse.style.left = "-8px";
      }

      wire.appendChild(pulse);
    }
  }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes pulseHorizontal {
    0% { left: -8px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: 100%; opacity: 0; }
  }

  @keyframes pulseVertical {
    0% { top: -8px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  @keyframes pulseDiagonal {
    0% { transform: translateX(-8px) translateY(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateX(100%) translateY(50%); opacity: 0; }
  }

  @keyframes nodePulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 0 15px #ff6b35;
    }
    50% { 
      transform: scale(1.2);
      box-shadow: 0 0 25px #ff6b35;
    }
  }

  .wire:hover {
    box-shadow: 0 0 20px #ffd700, 0 0 30px rgba(255, 215, 0, 0.5);
    background: #ffed4e;
  }
`;
document.head.appendChild(style);

// Initialize the wire network generator
console.log("Initializing wire network generator...");
new WireNetworkGenerator();

// Regenerate network on spacebar press
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    new WireNetworkGenerator();
  }
});
