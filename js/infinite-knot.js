/**
 * Infinite Knot Visualization
 * Creates animated curved knot patterns with dynamic path morphing
 */

class InfiniteKnot {
  constructor() {
    this.container = document.querySelector(".knot-container");
    this.svg = document.querySelector("svg");

    this.initialize();
  }

  initialize() {
    this.createKnotPaths();
    this.setupAnimations();
  }

  createKnotPaths() {
    // The SVG content is already defined in the HTML
    // This method can be used to create dynamic paths if needed
    const paths = this.svg.querySelectorAll("path[d]");

    paths.forEach((path, index) => {
      // Add entrance animation delay
      path.style.animationDelay = `${index * 0.5}s`;

      // Add interaction handlers
      path.addEventListener("mouseenter", () => this.onPathHover(path));
      path.addEventListener("mouseleave", () => this.onPathLeave(path));
    });
  }

  setupAnimations() {
    // Add dynamic variations to the existing animations
    this.addDynamicVariations();
    this.setupInteractiveEffects();
  }

  addDynamicVariations() {
    const redRopes = this.svg.querySelectorAll(".red-rope");
    const blueRopes = this.svg.querySelectorAll(".blue-rope");

    redRopes.forEach((rope, index) => {
      const duration = 8 + Math.random() * 4; // 8-12 seconds
      rope.style.animationDuration = `${duration}s`;
    });

    blueRopes.forEach((rope, index) => {
      const duration = 8 + Math.random() * 4; // 8-12 seconds
      rope.style.animationDuration = `${duration}s`;
      rope.style.animationDelay = `${1.5 + Math.random() * 2}s`;
    });
  }

  setupInteractiveEffects() {
    // Add mouse tracking for enhanced interactivity
    this.container.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.container.addEventListener("click", (e) => this.onContainerClick(e));
  }

  onPathHover(path) {
    // Enhance the path on hover
    path.style.strokeWidth = "16";
    path.style.filter = "url(#glow) brightness(1.5)";

    // Create ripple effect at mouse position
    this.createRippleEffect(path);
  }

  onPathLeave(path) {
    // Reset path appearance
    path.style.strokeWidth = "";
    path.style.filter = "";
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Subtly influence the gradient positions based on mouse movement
    const gradients = this.svg.querySelectorAll("linearGradient");
    gradients.forEach((gradient, index) => {
      const offset = index % 2 === 0 ? x : y;
      gradient.style.gradientTransform = `rotate(${offset * 3.6}deg)`;
    });
  }

  onContainerClick(e) {
    // Create burst effect at click location
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.createBurstEffect(x, y);

    // Temporarily speed up animations
    this.speedUpAnimations();
  }

  createRippleEffect(path) {
    // Create a temporary circle that expands from the path
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", "400"); // Center of SVG
    circle.setAttribute("cy", "300");
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "#00ff88");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("opacity", "0.8");

    this.svg.appendChild(circle);

    // Animate the ripple
    circle
      .animate(
        [
          { r: "5", opacity: "0.8" },
          { r: "100", opacity: "0" },
        ],
        {
          duration: 800,
          easing: "ease-out",
        }
      )
      .addEventListener("finish", () => {
        this.svg.removeChild(circle);
      });
  }

  createBurstEffect(x, y) {
    // Convert screen coordinates to SVG coordinates
    const svgX = (x / this.container.offsetWidth) * 800;
    const svgY = (y / this.container.offsetHeight) * 600;

    // Create multiple expanding circles
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", svgX);
        circle.setAttribute("cy", svgY);
        circle.setAttribute("r", "2");
        circle.setAttribute("fill", i % 2 === 0 ? "#ff6666" : "#6666ff");
        circle.setAttribute("opacity", "0.8");

        this.svg.appendChild(circle);

        circle
          .animate(
            [
              { r: "2", opacity: "0.8" },
              { r: "30", opacity: "0" },
            ],
            {
              duration: 600 + i * 100,
              easing: "ease-out",
            }
          )
          .addEventListener("finish", () => {
            if (circle.parentNode) {
              this.svg.removeChild(circle);
            }
          });
      }, i * 100);
    }
  }

  speedUpAnimations() {
    const animatedElements = this.svg.querySelectorAll(".red-rope, .blue-rope");

    animatedElements.forEach((element) => {
      const currentDuration = parseFloat(
        getComputedStyle(element).animationDuration
      );
      element.style.animationDuration = `${currentDuration * 0.5}s`;
    });

    // Reset after 3 seconds
    setTimeout(() => {
      animatedElements.forEach((element) => {
        element.style.animationDuration = "";
      });
    }, 3000);
  }

  morphKnot() {
    // Create new random path variations
    const paths = this.svg.querySelectorAll("path[d]");

    paths.forEach((path) => {
      const currentD = path.getAttribute("d");
      // This could be expanded to create actual path morphing
      // For now, we'll add a scaling effect

      path.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.1)" },
          { transform: "scale(1)" },
        ],
        {
          duration: 2000,
          easing: "ease-in-out",
        }
      );
    });
  }
}

// Global functions for controls
function morphKnot() {
  if (window.knotInstance) {
    window.knotInstance.morphKnot();
  }
}

function resetKnot() {
  if (window.knotInstance) {
    // Reset all animations
    const animatedElements = document.querySelectorAll(".red-rope, .blue-rope");
    animatedElements.forEach((element) => {
      element.style.animation = "none";
      element.offsetHeight; // Trigger reflow
      element.style.animation = null;
    });
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

  // Initialize the knot
  window.knotInstance = new InfiniteKnot();
});
