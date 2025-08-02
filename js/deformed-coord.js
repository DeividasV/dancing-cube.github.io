/**
 * Deformed Coordinate System Visualization
 * Creates an interactive deformed sinusoidal coordinate system with dynamic grid
 */

class DeformedCoordinateSystem {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.animationId = null;
    this.isAnimating = false;
    this.time = 0;

    this.initializeParameters();
    this.setupEventListeners();
    this.draw();
  }

  initializeParameters() {
    // Random parameters for sinusoidal deformation (increased amplitude for more dramatic bending)
    this.xAxisParams = {
      freq1: Math.random() * 0.015 + 0.008,
      freq2: Math.random() * 0.012 + 0.005,
      amp1: Math.random() * 50 + 20,
      amp2: Math.random() * 35 + 10,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
    };

    this.yAxisParams = {
      freq1: Math.random() * 0.015 + 0.008,
      freq2: Math.random() * 0.012 + 0.005,
      amp1: Math.random() * 50 + 20,
      amp2: Math.random() * 35 + 10,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
    };
  }

  setupEventListeners() {
    // Bind methods to maintain context
    this.regenerateAxes = this.regenerateAxes.bind(this);
    this.toggleAnimation = this.toggleAnimation.bind(this);

    // Set up global functions for buttons
    window.regenerateAxes = this.regenerateAxes;
    window.toggleAnimation = this.toggleAnimation;
  }

  deformPoint(x, y, t = 0) {
    // X-axis bending (affects y-coordinate of horizontal movements)
    const xBendY =
      this.xAxisParams.amp1 *
        Math.sin(
          x * this.xAxisParams.freq1 + this.xAxisParams.phase1 + t * 0.02
        ) +
      this.xAxisParams.amp2 *
        Math.sin(
          x * this.xAxisParams.freq2 + this.xAxisParams.phase2 + t * 0.03
        );

    // Y-axis bending (affects x-coordinate of vertical movements)
    const yBendX =
      this.yAxisParams.amp1 *
        Math.sin(
          y * this.yAxisParams.freq1 + this.yAxisParams.phase1 + t * 0.025
        ) +
      this.yAxisParams.amp2 *
        Math.sin(
          y * this.yAxisParams.freq2 + this.yAxisParams.phase2 + t * 0.02
        );

    return {
      x: x + yBendX,
      y: y + xBendY,
    };
  }

  drawDeformedGrid(t = 0) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Create red gradient for filling squares
    const gradient = this.ctx.createLinearGradient(0, 0, 80, 80);
    gradient.addColorStop(0, "rgba(255, 100, 100, 0.7)");
    gradient.addColorStop(0.5, "rgba(255, 50, 50, 0.5)");
    gradient.addColorStop(1, "rgba(200, 50, 50, 0.3)");

    // Fill every second deformed square with red gradient (adjusted for new grid density)
    for (let i = -15; i <= 14; i++) {
      for (let j = -12; j <= 11; j++) {
        // Checkerboard pattern: fill when (i + j) is even
        if ((i + j) % 2 === 0) {
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();

          // Get the four corners of the square (adjusted spacing)
          const corners = [
            this.deformPoint(i * 25, j * 20, t),
            this.deformPoint((i + 1) * 25, j * 20, t),
            this.deformPoint((i + 1) * 25, (j + 1) * 20, t),
            this.deformPoint(i * 25, (j + 1) * 20, t),
          ];

          // Draw the deformed square
          this.ctx.moveTo(
            corners[0].x + this.centerX,
            corners[0].y + this.centerY
          );
          this.ctx.lineTo(
            corners[1].x + this.centerX,
            corners[1].y + this.centerY
          );
          this.ctx.lineTo(
            corners[2].x + this.centerX,
            corners[2].y + this.centerY
          );
          this.ctx.lineTo(
            corners[3].x + this.centerX,
            corners[3].y + this.centerY
          );
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
    }

    this.drawGridLines(t);
    this.drawMainAxes(t);
    this.drawAxisLabels(t);
    this.drawTickMarks(t);
    this.drawOrigin(t);
  }

  drawGridLines(t) {
    // Draw grid lines
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.lineWidth = 0.5;

    // Vertical grid lines (bending with the coordinate system) - more dense
    for (let i = -15; i <= 15; i++) {
      const baseX = i * 25; // Reduced spacing for denser grid
      this.ctx.beginPath();
      for (let j = -18; j <= 18; j++) {
        const baseY = j * 17;
        const deformed = this.deformPoint(baseX, baseY, t);
        const screenX = deformed.x + this.centerX;
        const screenY = deformed.y + this.centerY;

        if (this.isInBounds(screenX, screenY)) {
          if (j === -18) {
            this.ctx.moveTo(screenX, screenY);
          } else {
            this.ctx.lineTo(screenX, screenY);
          }
        }
      }
      this.ctx.stroke();
    }

    // Horizontal grid lines (bending with the coordinate system) - more dense
    for (let i = -15; i <= 15; i++) {
      const baseY = i * 20; // Reduced spacing for denser grid
      this.ctx.beginPath();
      for (let j = -25; j <= 25; j++) {
        const baseX = j * 15;
        const deformed = this.deformPoint(baseX, baseY, t);
        const screenX = deformed.x + this.centerX;
        const screenY = deformed.y + this.centerY;

        if (this.isInBounds(screenX, screenY)) {
          if (j === -25) {
            this.ctx.moveTo(screenX, screenY);
          } else {
            this.ctx.lineTo(screenX, screenY);
          }
        }
      }
      this.ctx.stroke();
    }
  }

  drawMainAxes(t) {
    // Draw main axes with bending
    this.ctx.strokeStyle = "#ff4444";
    this.ctx.lineWidth = 4;

    // Bent Y-axis (vertical line through center) - extended for more scale coverage
    this.ctx.beginPath();
    for (let i = -20; i <= 20; i++) {
      const baseY = i * 15;
      const deformed = this.deformPoint(0, baseY, t);
      const screenX = deformed.x + this.centerX;
      const screenY = deformed.y + this.centerY;

      if (i === -20) {
        this.ctx.moveTo(screenX, screenY);
      } else {
        this.ctx.lineTo(screenX, screenY);
      }
    }
    this.ctx.stroke();

    // Bent X-axis (horizontal line through center) - extended for more scale coverage
    this.ctx.beginPath();
    for (let i = -25; i <= 25; i++) {
      const baseX = i * 15;
      const deformed = this.deformPoint(baseX, 0, t);
      const screenX = deformed.x + this.centerX;
      const screenY = deformed.y + this.centerY;

      if (i === -25) {
        this.ctx.moveTo(screenX, screenY);
      } else {
        this.ctx.lineTo(screenX, screenY);
      }
    }
    this.ctx.stroke();
  }

  drawAxisLabels(t) {
    // Draw axis labels
    this.ctx.fillStyle = "#ff4444";
    this.ctx.font = "18px Inter";
    this.ctx.fontWeight = "bold";

    // X-axis label at the end of bent x-axis
    const xEndDeformed = this.deformPoint(380 - this.centerX, 0, t);
    this.ctx.fillText(
      "x",
      xEndDeformed.x + this.centerX - 10,
      xEndDeformed.y + this.centerY + 5
    );

    // Y-axis label at the end of bent y-axis
    const yEndDeformed = this.deformPoint(0, -(300 - this.centerY), t);
    this.ctx.fillText(
      "y",
      yEndDeformed.x + this.centerX - 8,
      yEndDeformed.y + this.centerY + 5
    );
  }

  drawTickMarks(t) {
    // Draw tick marks and numbers along bent axes
    this.ctx.fillStyle = "#333";
    this.ctx.font = "12px Inter";
    this.ctx.textAlign = "center";

    // X-axis ticks along the bent x-axis (25 numbers: -12 to +12)
    for (let i = -12; i <= 12; i++) {
      if (i === 0) continue;
      const baseX = i * 30; // Reduced spacing to fit more numbers
      const deformed = this.deformPoint(baseX, 0, t);
      const screenX = deformed.x + this.centerX;
      const screenY = deformed.y + this.centerY;

      // Only draw if visible on screen
      if (this.isInBounds(screenX, screenY, 50)) {
        // Tick mark perpendicular to the bent axis
        const nextDeformed = this.deformPoint(baseX + 5, 0, t);
        const dx = nextDeformed.x - deformed.x;
        const dy = nextDeformed.y - deformed.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = (-dy / length) * 6;
        const perpY = (dx / length) * 6;

        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + perpX, screenY + perpY);
        this.ctx.lineTo(screenX - perpX, screenY - perpY);
        this.ctx.stroke();

        // Number with smaller font for better fit
        this.ctx.fillStyle = "#333";
        this.ctx.font = "10px Inter";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          i.toString(),
          screenX + perpX * 2,
          screenY + perpY * 2 + 12
        );
      }
    }

    // Y-axis ticks along the bent y-axis (25 numbers: -12 to +12)
    for (let i = -12; i <= 12; i++) {
      if (i === 0) continue;
      const baseY = -i * 23; // Reduced spacing and negative because canvas y increases downward
      const deformed = this.deformPoint(0, baseY, t);
      const screenX = deformed.x + this.centerX;
      const screenY = deformed.y + this.centerY;

      // Only draw if visible on screen
      if (this.isInBounds(screenX, screenY, 50)) {
        // Tick mark perpendicular to the bent axis
        const nextDeformed = this.deformPoint(0, baseY + 5, t);
        const dx = nextDeformed.x - deformed.x;
        const dy = nextDeformed.y - deformed.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = (-dy / length) * 6;
        const perpY = (dx / length) * 6;

        this.ctx.strokeStyle = "#333";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + perpX, screenY + perpY);
        this.ctx.lineTo(screenX - perpX, screenY - perpY);
        this.ctx.stroke();

        // Number with smaller font for better fit
        this.ctx.fillStyle = "#333";
        this.ctx.font = "10px Inter";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          i.toString(),
          screenX - perpX * 2 - 12,
          screenY - perpY * 2 + 4
        );
      }
    }
  }

  drawOrigin(t) {
    // Draw origin
    const originDeformed = this.deformPoint(0, 0, t);
    const originX = originDeformed.x + this.centerX;
    const originY = originDeformed.y + this.centerY;
    this.ctx.fillStyle = "#ff4444";
    this.ctx.beginPath();
    this.ctx.arc(originX, originY, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.fillStyle = "#333";
    this.ctx.font = "14px Inter";
    this.ctx.fontWeight = "bold";
    this.ctx.fillText("0", originX - 20, originY + 25);
  }

  isInBounds(x, y, margin = 100) {
    return (
      x >= -margin &&
      x <= this.width + margin &&
      y >= -margin &&
      y <= this.height + margin
    );
  }

  animate() {
    if (this.isAnimating) {
      this.drawDeformedGrid(this.time);
      this.time += 1;
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  regenerateAxes() {
    this.xAxisParams = {
      freq1: Math.random() * 0.02 + 0.005,
      freq2: Math.random() * 0.015 + 0.003,
      amp1: Math.random() * 30 + 10,
      amp2: Math.random() * 20 + 5,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
    };

    this.yAxisParams = {
      freq1: Math.random() * 0.02 + 0.005,
      freq2: Math.random() * 0.015 + 0.003,
      amp1: Math.random() * 30 + 10,
      amp2: Math.random() * 20 + 5,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
    };

    this.drawDeformedGrid(this.time);
  }

  toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    if (this.isAnimating) {
      this.animate();
    } else {
      cancelAnimationFrame(this.animationId);
    }
  }

  draw() {
    this.drawDeformedGrid();
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

  // Initialize the coordinate system
  new DeformedCoordinateSystem();
});
