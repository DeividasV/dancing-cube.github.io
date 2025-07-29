// Flying Ice Cubes Physics Engine
class FlyingIceCubesPhysics {
  constructor() {
    this.cubes = [];
    this.titleBounds = null;
    this.isInitialized = false;
    this.animationId = null;
    this.init();
  }

  init() {
    this.setupCubes();
    this.setupTitleBounds();
    this.startPhysicsLoop();
    this.setupEventListeners();
  }

  setupCubes() {
    const cubeElements = document.querySelectorAll(".flying-cube");

    cubeElements.forEach((element, index) => {
      const velocityX =
        parseFloat(element.dataset.velocityX) * 0.3 ||
        (Math.random() - 0.5) * 1.2; // Much slower
      const velocityY =
        parseFloat(element.dataset.velocityY) * 0.3 ||
        (Math.random() - 0.5) * 1.2; // Much slower

      const cube = {
        element: element,
        iceCube: element.querySelector(".ice-cube"),
        x: Math.random() * (window.innerWidth - 120),
        y: Math.random() * (window.innerHeight - 120) + 200, // Start below title
        vx: velocityX,
        vy: velocityY,
        width: 120,
        height: 120,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 360,
        rotationSpeedX: (Math.random() - 0.5) * 0.5, // Much slower rotation
        rotationSpeedY: (Math.random() - 0.5) * 0.5, // Much slower rotation
        rotationSpeedZ: (Math.random() - 0.5) * 0.5, // Much slower rotation
        bounceCount: 0,
        lastCollision: 0,
        mass: 1 + Math.random() * 0.5,
        isHovered: false,
      };

      this.cubes.push(cube);
      this.setupCubeEvents(cube);
    });

    this.isInitialized = true;
  }

  setupTitleBounds() {
    const titleElement = document.querySelector(".hero-title");
    const titleLineElement = document.querySelector(".title-line");

    if (titleElement && titleLineElement) {
      const titleRect = titleElement.getBoundingClientRect();
      const lineRect = titleLineElement.getBoundingClientRect();

      this.titleBounds = {
        x: Math.min(titleRect.left, lineRect.left),
        y: titleRect.top,
        width: Math.max(titleRect.width, lineRect.width),
        height: titleRect.height + lineRect.height + 20,
        centerX: titleRect.left + titleRect.width / 2,
        centerY: titleRect.top + titleRect.height / 2,
      };
    }
  }

  setupCubeEvents(cube) {
    cube.iceCube.addEventListener("mouseenter", () => {
      cube.isHovered = true;
      this.onCubeHover(cube);
    });

    cube.iceCube.addEventListener("mouseleave", () => {
      cube.isHovered = false;
      this.onCubeLeave(cube);
    });

    cube.iceCube.addEventListener("click", (e) => {
      e.preventDefault();
      this.onCubeClick(cube, e);
    });
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.setupTitleBounds();
    });

    // Add mouse interaction for gravity effect
    document.addEventListener("mousemove", (e) => {
      this.cubes.forEach((cube) => {
        const dx = e.clientX - (cube.x + cube.width / 2);
        const dy = e.clientY - (cube.y + cube.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = Math.max(0, 1 - distance / 200) * 0.1;
          cube.vx += (dx / distance) * force;
          cube.vy += (dy / distance) * force;
        }
      });
    });
  }

  startPhysicsLoop() {
    const update = () => {
      if (this.isInitialized) {
        this.updatePhysics();
        this.checkCollisions();
        this.updateVisuals();
      }
      this.animationId = requestAnimationFrame(update);
    };

    update();
  }

  updatePhysics() {
    const currentTime = Date.now();

    this.cubes.forEach((cube) => {
      // Apply very gentle gravity
      cube.vy += 0.01; // Much gentler gravity

      // Apply stronger air resistance for smoother movement
      cube.vx *= 0.995;
      cube.vy *= 0.995;

      // Update position
      cube.x += cube.vx;
      cube.y += cube.vy;

      // Update rotation - much slower and smoother
      cube.rotationX += cube.rotationSpeedX * 0.5;
      cube.rotationY += cube.rotationSpeedY * 0.5;
      cube.rotationZ += cube.rotationSpeedZ * 0.5;

      // Bounce off screen edges
      this.checkScreenBounds(cube);

      // Bounce off title
      this.checkTitleCollision(cube);

      // Add very gentle randomness
      if (Math.random() < 0.0005) {
        cube.vx += (Math.random() - 0.5) * 0.1;
        cube.vy += (Math.random() - 0.5) * 0.1;
      }
    });
  }

  checkScreenBounds(cube) {
    const bounce = 0.6; // Less energetic bounces
    const minSpeed = 0.2; // Lower minimum speed

    // Left and right bounds
    if (cube.x <= 0) {
      cube.x = 0;
      cube.vx = Math.abs(cube.vx) * bounce;
      if (cube.vx < minSpeed) cube.vx = minSpeed;
      this.createBounceEffect(cube, "edge");
    } else if (cube.x >= window.innerWidth - cube.width) {
      cube.x = window.innerWidth - cube.width;
      cube.vx = -Math.abs(cube.vx) * bounce;
      if (Math.abs(cube.vx) < minSpeed) cube.vx = -minSpeed;
      this.createBounceEffect(cube, "edge");
    }

    // Top and bottom bounds
    if (cube.y <= 0) {
      cube.y = 0;
      cube.vy = Math.abs(cube.vy) * bounce;
      if (cube.vy < minSpeed) cube.vy = minSpeed;
      this.createBounceEffect(cube, "edge");
    } else if (cube.y >= window.innerHeight - cube.height) {
      cube.y = window.innerHeight - cube.height;
      cube.vy = -Math.abs(cube.vy) * bounce;
      if (Math.abs(cube.vy) < minSpeed) cube.vy = -minSpeed;
      this.createBounceEffect(cube, "edge");
    }
  }

  checkTitleCollision(cube) {
    if (!this.titleBounds) return;

    const cubeCenter = {
      x: cube.x + cube.width / 2,
      y: cube.y + cube.height / 2,
    };

    // Check if cube is colliding with title area
    if (
      cubeCenter.x > this.titleBounds.x - 50 &&
      cubeCenter.x < this.titleBounds.x + this.titleBounds.width + 50 &&
      cubeCenter.y > this.titleBounds.y - 50 &&
      cubeCenter.y < this.titleBounds.y + this.titleBounds.height + 50
    ) {
      // Calculate bounce direction based on which side of title was hit
      const titleCenterX = this.titleBounds.x + this.titleBounds.width / 2;
      const titleCenterY = this.titleBounds.y + this.titleBounds.height / 2;

      const dx = cubeCenter.x - titleCenterX;
      const dy = cubeCenter.y - titleCenterY;

      const bounce = 0.8; // Gentler title bounces

      if (Math.abs(dx) > Math.abs(dy)) {
        // Hit from side
        cube.vx = (dx > 0 ? 1 : -1) * Math.abs(cube.vx) * bounce;
        if (Math.abs(cube.vx) < 1) cube.vx = dx > 0 ? 1 : -1;
      } else {
        // Hit from top/bottom
        cube.vy = (dy > 0 ? 1 : -1) * Math.abs(cube.vy) * bounce;
        if (Math.abs(cube.vy) < 1) cube.vy = dy > 0 ? 1 : -1;
      }

      // Move cube away from title to prevent sticking
      if (Math.abs(dx) > Math.abs(dy)) {
        cube.x =
          dx > 0
            ? this.titleBounds.x + this.titleBounds.width + 50
            : this.titleBounds.x - cube.width - 50;
      } else {
        cube.y =
          dy > 0
            ? this.titleBounds.y + this.titleBounds.height + 50
            : this.titleBounds.y - cube.height - 50;
      }

      this.createBounceEffect(cube, "title");
      this.addTitlePulseEffect();
    }
  }

  checkCollisions() {
    for (let i = 0; i < this.cubes.length; i++) {
      for (let j = i + 1; j < this.cubes.length; j++) {
        this.checkCubeCollision(this.cubes[i], this.cubes[j]);
      }
    }
  }

  checkCubeCollision(cube1, cube2) {
    const dx = cube1.x + cube1.width / 2 - (cube2.x + cube2.width / 2);
    const dy = cube1.y + cube1.height / 2 - (cube2.y + cube2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (cube1.width + cube2.width) / 2;

    if (distance < minDistance) {
      // Collision detected - elastic collision physics
      const angle = Math.atan2(dy, dx);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // Rotate velocities
      const vx1 = cube1.vx * cos + cube1.vy * sin;
      const vy1 = cube1.vy * cos - cube1.vx * sin;
      const vx2 = cube2.vx * cos + cube2.vy * sin;
      const vy2 = cube2.vy * cos - cube2.vx * sin;

      // Conservation of momentum
      const finalVx1 =
        ((cube1.mass - cube2.mass) * vx1 + 2 * cube2.mass * vx2) /
        (cube1.mass + cube2.mass);
      const finalVx2 =
        ((cube2.mass - cube1.mass) * vx2 + 2 * cube1.mass * vx1) /
        (cube1.mass + cube2.mass);

      // Rotate back
      cube1.vx = finalVx1 * cos - vy1 * sin;
      cube1.vy = vy1 * cos + finalVx1 * sin;
      cube2.vx = finalVx2 * cos - vy2 * sin;
      cube2.vy = vy2 * cos + finalVx2 * sin;

      // Add some energy and randomness
      const energy = 0.1;
      cube1.vx += (Math.random() - 0.5) * energy;
      cube1.vy += (Math.random() - 0.5) * energy;
      cube2.vx += (Math.random() - 0.5) * energy;
      cube2.vy += (Math.random() - 0.5) * energy;

      // Separate cubes to prevent sticking
      const overlap = minDistance - distance;
      const separationX = (dx / distance) * overlap * 0.5;
      const separationY = (dy / distance) * overlap * 0.5;

      cube1.x += separationX;
      cube1.y += separationY;
      cube2.x -= separationX;
      cube2.y -= separationY;

      // Add spin from collision
      const spinForce = 2;
      cube1.rotationSpeedX += (Math.random() - 0.5) * spinForce;
      cube1.rotationSpeedY += (Math.random() - 0.5) * spinForce;
      cube2.rotationSpeedX += (Math.random() - 0.5) * spinForce;
      cube2.rotationSpeedY += (Math.random() - 0.5) * spinForce;

      this.createBounceEffect(cube1, "cube");
      this.createBounceEffect(cube2, "cube");
      this.createCollisionSparks(cube1, cube2);
    }
  }

  updateVisuals() {
    this.cubes.forEach((cube) => {
      // Update position
      cube.element.style.left = cube.x + "px";
      cube.element.style.top = cube.y + "px";

      // Update rotation - make it more obvious
      if (!cube.isHovered) {
        cube.iceCube.style.transform = `
          rotateX(${cube.rotationX}deg) 
          rotateY(${cube.rotationY}deg) 
          rotateZ(${cube.rotationZ}deg)
        `;
      }
    });
  }

  createBounceEffect(cube, type) {
    // Flash the cube on bounce
    cube.iceCube.style.filter = "brightness(1.5) saturate(1.5)";
    cube.iceCube.style.transform += " scale(1.1)";

    setTimeout(() => {
      cube.iceCube.style.filter = "";
      cube.iceCube.style.transform = cube.iceCube.style.transform.replace(
        " scale(1.1)",
        ""
      );
    }, 200);

    // Create ice particles
    this.createIceParticles(cube, type);
  }

  createIceParticles(cube, type) {
    const centerX = cube.x + cube.width / 2;
    const centerY = cube.y + cube.height / 2;
    const particleCount = type === "title" ? 8 : 5;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.style.position = "fixed";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.width = "4px";
      particle.style.height = "4px";
      particle.style.background =
        type === "title"
          ? "rgba(0, 255, 136, 0.8)"
          : "rgba(255, 255, 255, 0.8)";
      particle.style.borderRadius = "50%";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "1000";
      particle.style.boxShadow = "0 0 10px currentColor";

      document.body.appendChild(particle);

      const angle = ((Math.PI * 2) / particleCount) * i;
      const velocity = 3 + Math.random() * 4;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let x = 0,
        y = 0,
        opacity = 1,
        size = 4;

      const animateParticle = () => {
        x += vx;
        y += vy * 0.9; // Gravity effect
        opacity *= 0.95;
        size *= 0.98;

        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity;
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        if (opacity > 0.1 && size > 0.5) {
          requestAnimationFrame(animateParticle);
        } else {
          document.body.removeChild(particle);
        }
      };

      animateParticle();
    }
  }

  createCollisionSparks(cube1, cube2) {
    const x = (cube1.x + cube2.x) / 2 + 60;
    const y = (cube1.y + cube2.y) / 2 + 60;

    for (let i = 0; i < 6; i++) {
      const spark = document.createElement("div");
      spark.style.position = "fixed";
      spark.style.left = x + "px";
      spark.style.top = y + "px";
      spark.style.width = "3px";
      spark.style.height = "3px";
      spark.style.background = "rgba(255, 255, 255, 1)";
      spark.style.borderRadius = "50%";
      spark.style.pointerEvents = "none";
      spark.style.zIndex = "1000";
      spark.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.8)";

      document.body.appendChild(spark);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 5;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let px = 0,
        py = 0,
        opacity = 1;

      const animateSpark = () => {
        px += vx;
        py += vy;
        opacity *= 0.92;

        spark.style.transform = `translate(${px}px, ${py}px)`;
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

  addTitlePulseEffect() {
    const titleLine = document.querySelector(".title-line");
    if (titleLine) {
      titleLine.style.boxShadow = "0 0 60px rgba(0, 255, 136, 1)";
      titleLine.style.transform = "scaleX(1.1) scaleY(1.5)";

      setTimeout(() => {
        titleLine.style.boxShadow = "";
        titleLine.style.transform = "";
      }, 300);
    }
  }

  onCubeHover(cube) {
    cube.iceCube.style.transform = `
      rotateX(${cube.rotationX + 15}deg) 
      rotateY(${cube.rotationY + 15}deg) 
      rotateZ(${cube.rotationZ}deg)
      scale(1.1)
    `;

    // Add attraction force towards mouse
    cube.vx *= 0.5;
    cube.vy *= 0.5;
  }

  onCubeLeave(cube) {
    // Reset transform handled by updateVisuals
  }

  onCubeClick(cube, event) {
    event.preventDefault();

    // Add explosive force
    const explosionForce = 8;
    cube.vx += (Math.random() - 0.5) * explosionForce;
    cube.vy += (Math.random() - 0.5) * explosionForce;

    // Add spin
    cube.rotationSpeedX += (Math.random() - 0.5) * 10;
    cube.rotationSpeedY += (Math.random() - 0.5) * 10;
    cube.rotationSpeedZ += (Math.random() - 0.5) * 10;

    // Create click explosion effect
    this.createClickExplosion(cube);

    // Navigate after delay
    setTimeout(() => {
      window.location.href = cube.iceCube.href;
    }, 300);
  }

  createClickExplosion(cube) {
    const centerX = cube.x + cube.width / 2;
    const centerY = cube.y + cube.height / 2;

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.style.position = "fixed";
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.width = "6px";
      particle.style.height = "6px";
      particle.style.background = "rgba(0, 255, 136, 1)";
      particle.style.borderRadius = "50%";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "1000";
      particle.style.boxShadow = "0 0 20px rgba(0, 255, 136, 1)";

      document.body.appendChild(particle);

      const angle = ((Math.PI * 2) / 12) * i;
      const velocity = 5 + Math.random() * 6;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      let x = 0,
        y = 0,
        opacity = 1,
        size = 6;

      const animateExplosion = () => {
        x += vx;
        y += vy;
        opacity *= 0.9;
        size *= 0.96;

        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity;
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        if (opacity > 0.1 && size > 1) {
          requestAnimationFrame(animateExplosion);
        } else {
          document.body.removeChild(particle);
        }
      };

      animateExplosion();
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FlyingIceCubesPhysics();
});

// Audio feedback system
class IceCubeAudio {
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

  playBounceSound(type = "normal") {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const frequencies = {
      normal: [600, 300],
      title: [800, 200],
      cube: [700, 350],
    };

    const [startFreq, endFreq] = frequencies[type] || frequencies.normal;

    oscillator.frequency.setValueAtTime(
      startFreq,
      this.audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      endFreq,
      this.audioContext.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.15
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }
}

const iceCubeAudio = new IceCubeAudio();
