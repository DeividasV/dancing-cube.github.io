/**
 * Individual Squares Visualization
 * Creates 100 individual animated squares with unique gradients
 */

class IndividualSquares {
  constructor() {
    this.container = document.getElementById("squaresContainer");
    this.totalSquares = 100;

    this.initialize();
  }

  initialize() {
    this.generateSquares();
    this.setupAnimations();
  }

  // Function to generate random colors
  getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 40); // 60-100%
    const lightness = 40 + Math.floor(Math.random() * 30); // 40-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Function to create a unique gradient
  createGradient() {
    const color1 = this.getRandomColor();
    const color2 = this.getRandomColor();
    const color3 = this.getRandomColor();
    const color4 = this.getRandomColor();

    const angle = Math.floor(Math.random() * 360);
    return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3}, ${color4})`;
  }

  generateSquares() {
    // Clear existing squares
    this.container.innerHTML = "";

    for (let i = 1; i <= this.totalSquares; i++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.index = i;

      // Give each square a unique gradient
      square.style.background = this.createGradient();

      // Add slight variation to animation duration for more organic feel
      const duration = 3 + Math.random() * 4; // 3-7 seconds
      square.style.animationDuration = `${duration}s`;

      // Add slight delay variation for entrance
      const delay = Math.random() * 2; // 0-2 seconds
      square.style.animationDelay = `${delay}s`;

      // Add hover effect data
      square.addEventListener("mouseenter", () => this.onSquareHover(square));
      square.addEventListener("mouseleave", () => this.onSquareLeave(square));
      square.addEventListener("click", () => this.onSquareClick(square));

      this.container.appendChild(square);
    }
  }

  setupAnimations() {
    // Stagger the entrance animations
    const squares = this.container.querySelectorAll(".square");
    squares.forEach((square, index) => {
      const delay = index * 0.02; // 20ms delay between each square
      square.style.setProperty("--entrance-delay", `${delay}s`);

      // Apply entrance animation with delay
      setTimeout(() => {
        square.classList.add("entered");
      }, delay * 1000);
    });
  }

  onSquareHover(square) {
    // Create ripple effect
    const ripple = document.createElement("div");
    ripple.className = "ripple-effect";
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      animation: rippleExpand 0.6s ease-out;
      pointer-events: none;
    `;

    square.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);

    // Add CSS for ripple animation if not already added
    if (!document.querySelector("#ripple-styles")) {
      const style = document.createElement("style");
      style.id = "ripple-styles";
      style.textContent = `
        @keyframes rippleExpand {
          from {
            width: 4px;
            height: 4px;
            opacity: 1;
          }
          to {
            width: 50px;
            height: 50px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  onSquareLeave(square) {
    // Optional: Add leave effect if needed
  }

  onSquareClick(square) {
    // Create burst effect on click
    square.style.animation = "none";
    square.offsetHeight; // Trigger reflow
    square.style.animation = null;

    // Regenerate gradient for clicked square
    square.style.background = this.createGradient();

    // Add temporary glow effect
    square.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.8)";
    setTimeout(() => {
      square.style.boxShadow = "";
    }, 300);

    // Create particle explosion effect
    this.createParticleExplosion(square);
  }

  createParticleExplosion(square) {
    const rect = square.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
      `;

      document.body.appendChild(particle);

      const angle = (i * 45 * Math.PI) / 180;
      const distance = 50 + Math.random() * 30;
      const duration = 600 + Math.random() * 200;

      particle
        .animate(
          [
            {
              transform: "translate(-50%, -50%) scale(1)",
              opacity: 1,
            },
            {
              transform: `translate(-50%, -50%) translate(${
                Math.cos(angle) * distance
              }px, ${Math.sin(angle) * distance}px) scale(0)`,
              opacity: 0,
            },
          ],
          {
            duration: duration,
            easing: "ease-out",
          }
        )
        .addEventListener("finish", () => {
          document.body.removeChild(particle);
        });
    }
  }

  regenerateAllSquares() {
    this.generateSquares();
    this.setupAnimations();
  }

  shuffleColors() {
    const squares = this.container.querySelectorAll(".square");
    squares.forEach((square, index) => {
      setTimeout(() => {
        square.style.background = this.createGradient();
      }, index * 50);
    });
  }
}

// Global functions for controls
function regenerateSquares() {
  if (window.squaresInstance) {
    window.squaresInstance.regenerateAllSquares();
  }
}

function shuffleColors() {
  if (window.squaresInstance) {
    window.squaresInstance.shuffleColors();
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

  // Initialize the squares
  window.squaresInstance = new IndividualSquares();
});
