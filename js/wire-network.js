/**
 * Wire Network Visualization
 * Creates an interactive wire pulse system with network connections
 */

class WireNetwork {
  constructor() {
    this.container = document.querySelector(".wire-network");
    this.wires = [];
    this.nodes = [];
    this.pulses = [];

    this.initialize();
  }

  initialize() {
    this.collectElements();
    this.setupInteractions();
    this.setupDynamicEffects();
  }

  collectElements() {
    this.wires = Array.from(this.container.querySelectorAll(".wire"));
    this.nodes = Array.from(this.container.querySelectorAll(".node"));
    this.pulses = Array.from(this.container.querySelectorAll(".pulse"));
  }

  setupInteractions() {
    // Wire interactions
    this.wires.forEach((wire, index) => {
      wire.addEventListener("mouseenter", () => this.onWireHover(wire, index));
      wire.addEventListener("mouseleave", () => this.onWireLeave(wire, index));
      wire.addEventListener("click", () => this.onWireClick(wire, index));
    });

    // Node interactions
    this.nodes.forEach((node, index) => {
      node.addEventListener("mouseenter", () => this.onNodeHover(node, index));
      node.addEventListener("mouseleave", () => this.onNodeLeave(node, index));
      node.addEventListener("click", () => this.onNodeClick(node, index));
    });

    // Container interactions
    this.container.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.container.addEventListener("click", (e) => this.onContainerClick(e));
  }

  setupDynamicEffects() {
    // Add random variations to pulse animations
    this.pulses.forEach((pulse) => {
      const baseDuration = parseFloat(
        getComputedStyle(pulse).animationDuration
      );
      const variation = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x speed
      pulse.style.animationDuration = `${baseDuration * variation}s`;

      // Random delay
      const delay = Math.random() * 2;
      pulse.style.animationDelay = `${delay}s`;
    });

    // Add subtle wire glow variations
    this.wires.forEach((wire) => {
      const glowDuration = 1.5 + Math.random() * 1; // 1.5-2.5 seconds
      wire.style.setProperty("--glow-duration", `${glowDuration}s`);
    });
  }

  onWireHover(wire, index) {
    // Enhance wire glow
    wire.style.boxShadow = "0 0 25px #ffd700, 0 0 50px rgba(255, 215, 0, 0.5)";
    wire.style.background = "#ffed4e";

    // Create electrical spark effect
    this.createSparkEffect(wire);

    // Highlight connected nodes
    this.highlightConnectedNodes(wire);

    // Speed up pulses on this wire
    const wirePulses = wire.querySelectorAll(".pulse");
    wirePulses.forEach((pulse) => {
      const currentDuration = parseFloat(
        getComputedStyle(pulse).animationDuration
      );
      pulse.style.animationDuration = `${currentDuration * 0.5}s`;
    });
  }

  onWireLeave(wire, index) {
    // Reset wire appearance
    wire.style.boxShadow = "";
    wire.style.background = "";

    // Reset pulse speeds
    const wirePulses = wire.querySelectorAll(".pulse");
    wirePulses.forEach((pulse) => {
      pulse.style.animationDuration = "";
    });

    // Reset connected nodes
    this.resetConnectedNodes();
  }

  onWireClick(wire, index) {
    // Create electrical burst
    this.createElectricalBurst(wire);

    // Temporarily disable and re-enable wire
    this.resetWire(wire);

    // Send pulse wave through connected wires
    this.sendPulseWave(wire);
  }

  onNodeHover(node, index) {
    // Create expanding ring effect
    this.createNodeRing(node);

    // Highlight connected wires
    this.highlightConnectedWires(node);
  }

  onNodeLeave(node, index) {
    // Reset connected wires
    this.resetConnectedWires();
  }

  onNodeClick(node, index) {
    // Create node explosion effect
    this.createNodeExplosion(node);

    // Send signal through all connected wires
    this.sendNodeSignal(node);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create subtle electromagnetic field effect
    this.createFieldEffect(x, y);
  }

  onContainerClick(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create electromagnetic pulse
    this.createEMPEffect(x, y);
  }

  createSparkEffect(wire) {
    const rect = wire.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    for (let i = 0; i < 3; i++) {
      const spark = document.createElement("div");
      spark.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: #00ffff;
        border-radius: 50%;
        pointer-events: none;
        left: ${Math.random() * wire.offsetWidth}px;
        top: ${wire.offsetTop + Math.random() * wire.offsetHeight}px;
        box-shadow: 0 0 10px #00ffff;
      `;

      this.container.appendChild(spark);

      spark
        .animate(
          [
            {
              opacity: 1,
              transform: "scale(1)",
            },
            {
              opacity: 0,
              transform: "scale(0)",
            },
          ],
          {
            duration: 300 + Math.random() * 200,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          if (spark.parentNode) {
            this.container.removeChild(spark);
          }
        });
    }
  }

  createElectricalBurst(wire) {
    const rect = wire.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const centerX = wire.offsetLeft + wire.offsetWidth / 2;
    const centerY = wire.offsetTop + wire.offsetHeight / 2;

    for (let i = 0; i < 8; i++) {
      const burst = document.createElement("div");
      burst.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #ffd700;
        border-radius: 50%;
        pointer-events: none;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 15px #ffd700;
      `;

      this.container.appendChild(burst);

      const angle = (i * 45 * Math.PI) / 180;
      const distance = 30 + Math.random() * 20;

      burst
        .animate(
          [
            {
              opacity: 1,
              transform: "translate(-50%, -50%) scale(1)",
            },
            {
              opacity: 0,
              transform: `translate(-50%, -50%) translate(${
                Math.cos(angle) * distance
              }px, ${Math.sin(angle) * distance}px) scale(0)`,
            },
          ],
          {
            duration: 500,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          if (burst.parentNode) {
            this.container.removeChild(burst);
          }
        });
    }
  }

  createNodeRing(node) {
    const ring = document.createElement("div");
    ring.style.cssText = `
      position: absolute;
      left: ${node.offsetLeft + node.offsetWidth / 2}px;
      top: ${node.offsetTop + node.offsetHeight / 2}px;
      width: 0px;
      height: 0px;
      border: 2px solid rgba(255, 107, 53, 0.6);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;

    this.container.appendChild(ring);

    ring
      .animate(
        [
          {
            width: "0px",
            height: "0px",
            opacity: 0.8,
          },
          {
            width: "60px",
            height: "60px",
            opacity: 0,
          },
        ],
        {
          duration: 800,
          easing: "ease-out",
        }
      )
      .addEventListener("finish", () => {
        if (ring.parentNode) {
          this.container.removeChild(ring);
        }
      });
  }

  createNodeExplosion(node) {
    const centerX = node.offsetLeft + node.offsetWidth / 2;
    const centerY = node.offsetTop + node.offsetHeight / 2;

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: #ff6b35;
        border-radius: 50%;
        pointer-events: none;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 8px #ff6b35;
      `;

      this.container.appendChild(particle);

      const angle = (i * 30 * Math.PI) / 180;
      const distance = 40 + Math.random() * 30;

      particle
        .animate(
          [
            {
              opacity: 1,
              transform: "translate(-50%, -50%) scale(1)",
            },
            {
              opacity: 0,
              transform: `translate(-50%, -50%) translate(${
                Math.cos(angle) * distance
              }px, ${Math.sin(angle) * distance}px) scale(0)`,
            },
          ],
          {
            duration: 600 + Math.random() * 200,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          if (particle.parentNode) {
            this.container.removeChild(particle);
          }
        });
    }
  }

  createFieldEffect(x, y) {
    // Create subtle field distortion
    if (Math.random() < 0.1) {
      // Only occasionally create effect
      const field = document.createElement("div");
      field.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 20px;
        height: 20px;
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
      `;

      this.container.appendChild(field);

      field
        .animate(
          [
            {
              width: "20px",
              height: "20px",
              opacity: 0.3,
            },
            {
              width: "40px",
              height: "40px",
              opacity: 0,
            },
          ],
          {
            duration: 400,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          if (field.parentNode) {
            this.container.removeChild(field);
          }
        });
    }
  }

  createEMPEffect(x, y) {
    // Create electromagnetic pulse effect
    const emp = document.createElement("div");
    emp.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 10px;
      height: 10px;
      border: 3px solid rgba(0, 255, 136, 0.8);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
    `;

    this.container.appendChild(emp);

    emp
      .animate(
        [
          {
            width: "10px",
            height: "10px",
            opacity: 0.8,
            borderWidth: "3px",
          },
          {
            width: "200px",
            height: "200px",
            opacity: 0,
            borderWidth: "1px",
          },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        }
      )
      .addEventListener("finish", () => {
        if (emp.parentNode) {
          this.container.removeChild(emp);
        }
      });

    // Temporarily affect all pulses
    this.pulses.forEach((pulse) => {
      pulse.style.animationDuration = "0.5s";
    });

    setTimeout(() => {
      this.pulses.forEach((pulse) => {
        pulse.style.animationDuration = "";
      });
    }, 1000);
  }

  highlightConnectedNodes(wire) {
    // Simple implementation - could be enhanced with actual connection mapping
    this.nodes.forEach((node) => {
      node.style.boxShadow =
        "0 0 25px #ff6b35, 0 0 50px rgba(255, 107, 53, 0.3)";
    });
  }

  resetConnectedNodes() {
    this.nodes.forEach((node) => {
      node.style.boxShadow = "";
    });
  }

  highlightConnectedWires(node) {
    // Simple implementation - highlight nearby wires
    this.wires.forEach((wire) => {
      wire.style.boxShadow = "0 0 15px #ffd700";
    });
  }

  resetConnectedWires() {
    this.wires.forEach((wire) => {
      wire.style.boxShadow = "";
    });
  }

  resetWire(wire) {
    wire.style.opacity = "0.3";
    setTimeout(() => {
      wire.style.opacity = "";
    }, 200);
  }

  sendPulseWave(wire) {
    // Create a wave effect across all wires
    this.wires.forEach((w, index) => {
      setTimeout(() => {
        w.style.boxShadow = "0 0 30px #ffd700";
        setTimeout(() => {
          w.style.boxShadow = "";
        }, 200);
      }, index * 100);
    });
  }

  sendNodeSignal(node) {
    // Send signal from node through network
    this.wires.forEach((wire, index) => {
      setTimeout(() => {
        const wirePulses = wire.querySelectorAll(".pulse");
        wirePulses.forEach((pulse) => {
          pulse.style.animationDuration = "0.5s";
        });

        setTimeout(() => {
          wirePulses.forEach((pulse) => {
            pulse.style.animationDuration = "";
          });
        }, 1000);
      }, index * 50);
    });
  }
}

// Global functions for controls
function resetNetwork() {
  if (window.networkInstance) {
    // Reset all animations and effects
    const allElements = document.querySelectorAll(".wire, .node, .pulse");
    allElements.forEach((element) => {
      element.style.animation = "none";
      element.offsetHeight; // Trigger reflow
      element.style.animation = null;
      element.style.boxShadow = "";
      element.style.background = "";
      element.style.opacity = "";
    });
  }
}

function pulseAll() {
  if (window.networkInstance) {
    const pulses = document.querySelectorAll(".pulse");
    pulses.forEach((pulse) => {
      pulse.style.animationDuration = "0.5s";
    });

    setTimeout(() => {
      pulses.forEach((pulse) => {
        pulse.style.animationDuration = "";
      });
    }, 2000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Hide loading screen
  setTimeout(() => {
    const loadingContainer = document.querySelector(".loading-container");
    if (loadingContainer) {
      loadingContainer.classList.add("hidden");
    }
  }, 1000);

  // Initialize the wire network
  window.networkInstance = new WireNetwork();
});
