// Hanging Cubes Interactive Features
class HangingCubesExhibition {
  constructor() {
    this.cubes = [];
    this.collisionThreshold = 10;
    this.init();
  }

  init() {
    this.setupCubes();
    this.setupBouncePhysics();
    this.setupInteractions();
    this.setupAnimationLoop();
  }

  setupCubes() {
    const cubeElements = document.querySelectorAll(".hanging-cube");

    cubeElements.forEach((cubeElement, index) => {
      const stringLength = parseInt(cubeElement.dataset.stringLength);
      const bounceGroup = parseInt(cubeElement.dataset.bounceGroup);
      const glassCube = cubeElement.querySelector(".glass-cube");

      const cube = {
        element: cubeElement,
        glassCube: glassCube,
        stringLength: stringLength,
        bounceGroup: bounceGroup,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        angle: 0,
        angularVelocity: 0,
        isColliding: false,
        collisionCooldown: 0,
      };

      this.cubes.push(cube);

      // Setup hover effects
      glassCube.addEventListener("mouseenter", () => this.onCubeHover(cube));
      glassCube.addEventListener("mouseleave", () => this.onCubeLeave(cube));
      glassCube.addEventListener("click", (e) => this.onCubeClick(cube, e));
    });
  }

  setupBouncePhysics() {
    // Group cubes by bounce groups for collision detection
    this.bounceGroups = {};

    this.cubes.forEach((cube) => {
      if (!this.bounceGroups[cube.bounceGroup]) {
        this.bounceGroups[cube.bounceGroup] = [];
      }
      this.bounceGroups[cube.bounceGroup].push(cube);
    });
  }

  setupInteractions() {
    // Add wind effect on mouse movement
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener("mousemove", (e) => {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      this.cubes.forEach((cube) => {
        const rect = cube.element.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
            Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
        );

        // Apply wind force based on mouse proximity and movement
        if (distance < 200) {
          const force = Math.max(0, 1 - distance / 200);
          cube.angularVelocity += deltaX * force * 0.0001;
          cube.velocity.x += deltaX * force * 0.0002;
        }
      });

      mouseX = e.clientX;
      mouseY = e.clientY;
    });
  }

  setupAnimationLoop() {
    const animate = () => {
      this.updatePhysics();
      this.checkCollisions();
      this.updateVisuals();
      requestAnimationFrame(animate);
    };

    animate();
  }

  updatePhysics() {
    this.cubes.forEach((cube) => {
      // Update collision cooldown
      if (cube.collisionCooldown > 0) {
        cube.collisionCooldown--;
      }

      // Gravity and pendulum physics
      const gravity = 0.0002;
      const damping = 0.98;
      const springForce = 0.001;

      // Calculate pendulum restoration force
      cube.angularVelocity += -Math.sin(cube.angle) * gravity;
      cube.angularVelocity *= damping;
      cube.angle += cube.angularVelocity;

      // Apply spring damping to prevent infinite swinging
      cube.angle *= 0.999;

      // Update position based on string length and angle
      cube.position.x = Math.sin(cube.angle) * cube.stringLength * 0.3;
      cube.position.y = Math.cos(cube.angle) * cube.stringLength * 0.1;
    });
  }

  checkCollisions() {
    // Check collisions within bounce groups (same height cubes)
    Object.values(this.bounceGroups).forEach((group) => {
      if (group.length < 2) return;

      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const cube1 = group[i];
          const cube2 = group[j];

          if (cube1.collisionCooldown > 0 || cube2.collisionCooldown > 0)
            continue;

          const distance = Math.abs(cube1.position.x - cube2.position.x);

          if (distance < this.collisionThreshold) {
            this.handleCollision(cube1, cube2);
          }
        }
      }
    });
  }

  handleCollision(cube1, cube2) {
    // Elastic collision physics
    const tempVelocity = cube1.angularVelocity;
    cube1.angularVelocity = cube2.angularVelocity * 0.8;
    cube2.angularVelocity = tempVelocity * 0.8;

    // Add some randomness to make it more interesting
    cube1.angularVelocity += (Math.random() - 0.5) * 0.002;
    cube2.angularVelocity += (Math.random() - 0.5) * 0.002;

    // Set collision cooldown to prevent multiple collisions
    cube1.collisionCooldown = 30;
    cube2.collisionCooldown = 30;

    // Visual feedback
    this.addCollisionEffect(cube1);
    this.addCollisionEffect(cube2);
  }

  addCollisionEffect(cube) {
    const glassCube = cube.glassCube;

    // Flash effect
    glassCube.style.filter = "brightness(1.5) saturate(1.5)";
    glassCube.style.transform += " scale(1.05)";

    setTimeout(() => {
      glassCube.style.filter = "";
      glassCube.style.transform = glassCube.style.transform.replace(
        " scale(1.05)",
        ""
      );
    }, 150);

    // Create spark particles
    this.createSparkParticles(cube);
  }

  createSparkParticles(cube) {
    const rect = cube.glassCube.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 5; i++) {
      const spark = document.createElement("div");
      spark.style.position = "fixed";
      spark.style.left = centerX + "px";
      spark.style.top = centerY + "px";
      spark.style.width = "3px";
      spark.style.height = "3px";
      spark.style.background = "rgba(0, 255, 136, 0.8)";
      spark.style.borderRadius = "50%";
      spark.style.pointerEvents = "none";
      spark.style.zIndex = "1000";
      spark.style.boxShadow = "0 0 10px rgba(0, 255, 136, 0.6)";

      document.body.appendChild(spark);

      const angle = ((Math.PI * 2) / 5) * i;
      const velocity = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let x = 0,
        y = 0,
        opacity = 1;

      const animateSpark = () => {
        x += vx;
        y += vy;
        opacity *= 0.95;

        spark.style.transform = `translate(${x}px, ${y}px)`;
        spark.style.opacity = opacity;

        if (opacity > 0.1) {
          requestAnimationFrame(animateSpark);
        } else {
          document.body.removeChild(spark);
        }
      };

      animateSpark();
    }
  }

  updateVisuals() {
    this.cubes.forEach((cube) => {
      const transform = `
        translateX(${cube.position.x}px) 
        translateY(${cube.position.y}px) 
        rotate(${cube.angle}rad)
      `;

      cube.element.style.transform = transform;
    });
  }

  onCubeHover(cube) {
    // Add a gentle push when hovering
    cube.angularVelocity += (Math.random() - 0.5) * 0.001;

    // Enhanced glow effect
    cube.glassCube.style.filter = "brightness(1.2) saturate(1.3)";
    cube.glassCube.style.boxShadow = "0 0 40px rgba(0, 255, 136, 0.4)";
  }

  onCubeLeave(cube) {
    // Remove enhanced effects
    cube.glassCube.style.filter = "";
    cube.glassCube.style.boxShadow = "";
  }

  onCubeClick(cube, event) {
    event.preventDefault();

    // Add a strong impulse on click
    cube.angularVelocity += (Math.random() - 0.5) * 0.01;

    // Create ripple effect
    this.createRippleEffect(cube, event);

    // Navigate after a short delay for visual feedback
    setTimeout(() => {
      window.location.href = cube.glassCube.href;
    }, 200);
  }

  createRippleEffect(cube, event) {
    const rect = cube.glassCube.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.width = "0px";
    ripple.style.height = "0px";
    ripple.style.background = "rgba(0, 255, 136, 0.3)";
    ripple.style.borderRadius = "50%";
    ripple.style.transform = "translate(-50%, -50%)";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "5";

    cube.glassCube.appendChild(ripple);

    let size = 0;
    const maxSize = Math.max(rect.width, rect.height) * 2;

    const animateRipple = () => {
      size += maxSize * 0.1;
      const opacity = Math.max(0, 1 - size / maxSize);

      ripple.style.width = size + "px";
      ripple.style.height = size + "px";
      ripple.style.opacity = opacity;

      if (opacity > 0) {
        requestAnimationFrame(animateRipple);
      } else {
        cube.glassCube.removeChild(ripple);
      }
    };

    animateRipple();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new HangingCubesExhibition();
});

// Add some ambient sound effects (optional)
class AmbientSounds {
  constructor() {
    this.audioContext = null;
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.log("Web Audio API not supported");
    }
  }

  playCollisionSound() {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      this.audioContext.currentTime + 0.1
    );

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
}

// Initialize ambient sounds
const ambientSounds = new AmbientSounds();
