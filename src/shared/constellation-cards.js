// Dancing Cube - Grid Exhibition Cards JavaScript

class ExhibitionGrid {
  constructor() {
    this.cards = [];
    this.mousePosition = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCards();
    this.startAnimationLoop();
  }

  setupEventListeners() {
    // Track mouse movement for subtle parallax effect
    document.addEventListener("mousemove", (e) => {
      this.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Add hover effects
    this.setupHoverEffects();
  }

  setupCards() {
    const cardElements = document.querySelectorAll(".glass-card");

    cardElements.forEach((card, index) => {
      const cardData = {
        element: card,
        index: index,
        targetPosition: {
          x: ((rect.left - containerRect.left) / containerRect.width) * 100,
          y: ((rect.top - containerRect.top) / containerRect.height) * 100,
        },
        velocity: { x: 0, y: 0 },
        currentOffset: { x: 0, y: 0 },
        targetOffset: { x: 0, y: 0 },
        size: { width: 280, height: 200 }, // Card dimensions
        isMoving: false,
      };

      this.cards.push(cardData);

      // Add entrance animation
      this.animateCardEntrance(cardData, index);
    });

    // Start collision detection
    this.startCollisionDetection();
  }

  animateCardEntrance(cardData, index) {
    const card = cardData.element;

    // Start with cards hidden and slightly below
    card.style.opacity = "0";
    card.style.transform = "translateY(50px) scale(0.8)";

    // Animate in with delay
    setTimeout(() => {
      card.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    }, index * 200);
  }

  setupHoverEffects() {
    this.cards.forEach((cardData) => {
      const card = cardData.element;
      const cardContent = card.querySelector(".card-content");

      card.addEventListener("mouseenter", () => {
        this.onCardHover(cardData, true);
      });

      card.addEventListener("mouseleave", () => {
        this.onCardHover(cardData, false);
      });
    });

    // Setup drag functionality
    this.setupDragFunctionality();
  }

  setupDragFunctionality() {
    this.isDragging = false;
    this.draggedCard = null;
    this.dragOffset = { x: 0, y: 0 };
    this.movedCards = new Set(); // Track which cards have been moved
    this.dragStartTime = 0;
    this.dragStartPos = { x: 0, y: 0 };

    this.cards.forEach((cardData) => {
      const card = cardData.element;

      // Mouse events
      card.addEventListener("mousedown", (e) => {
        if (e.target.closest("a")) return;
        e.preventDefault();
        this.handleStart(cardData, e.clientX, e.clientY);
      });

      // Touch events for mobile
      card.addEventListener("touchstart", (e) => {
        if (e.target.closest("a")) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.handleStart(cardData, touch.clientX, touch.clientY);
      });

      // Click handler for ripple effect
      card.addEventListener("click", (e) => {
        if (!this.isDragging && this.potentialDragCard) {
          this.createRippleEffect(e, card);
        }
      });
    });

    // Global mouse and touch events
    document.addEventListener("mousemove", (e) => {
      this.handleMove(e.clientX, e.clientY);
    });

    document.addEventListener("touchmove", (e) => {
      if (this.isDragging || this.potentialDragCard) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMove(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener("mouseup", () => {
      this.handleEnd();
    });

    document.addEventListener("touchend", () => {
      this.handleEnd();
    });

    // Prevent text selection during drag
    document.addEventListener("selectstart", (e) => {
      if (this.isDragging) {
        e.preventDefault();
      }
    });
  }

  handleStart(cardData, clientX, clientY) {
    this.dragStartTime = Date.now();
    this.dragStartPos.x = clientX;
    this.dragStartPos.y = clientY;
    this.potentialDragCard = cardData;

    // Add a small delay before starting drag to distinguish from click
    this.dragTimeout = setTimeout(() => {
      this.startDrag(cardData, { clientX, clientY });
    }, 150);
  }

  handleMove(clientX, clientY) {
    // If we moved significantly before drag timeout, start drag immediately
    if (this.potentialDragCard && !this.isDragging) {
      const distance = Math.sqrt(
        Math.pow(clientX - this.dragStartPos.x, 2) +
          Math.pow(clientY - this.dragStartPos.y, 2)
      );

      if (distance > 5) {
        clearTimeout(this.dragTimeout);
        this.startDrag(this.potentialDragCard, { clientX, clientY });
      }
    }

    if (this.isDragging) {
      this.drag({ clientX, clientY });
    }
  }

  handleEnd() {
    clearTimeout(this.dragTimeout);

    if (this.isDragging) {
      this.endDrag();
    }

    this.potentialDragCard = null;
  }

  startDrag(cardData, event) {
    this.isDragging = true;
    this.draggedCard = cardData;

    const card = cardData.element;
    const rect = card.getBoundingClientRect();
    const container = document.querySelector(".constellation-container");
    const containerRect = container.getBoundingClientRect();

    // Calculate drag offset
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;

    // Add dragging class
    card.classList.add("dragging");

    // Disable any ongoing animations
    card.style.animation = "none";
    card.style.transition = "none";
  }

  drag(event) {
    if (!this.isDragging || !this.draggedCard) return;

    const container = document.querySelector(".constellation-container");
    const containerRect = container.getBoundingClientRect();
    const card = this.draggedCard.element;

    // Calculate new position
    const x = event.clientX - containerRect.left - this.dragOffset.x;
    const y = event.clientY - containerRect.top - this.dragOffset.y;

    // Convert to percentage for responsive positioning
    const xPercent = (x / containerRect.width) * 100;
    const yPercent = (y / containerRect.height) * 100;

    // Clamp to container bounds
    const clampedX = Math.max(
      0,
      Math.min(100 - (280 / containerRect.width) * 100, xPercent)
    );
    const clampedY = Math.max(
      0,
      Math.min(100 - (200 / containerRect.height) * 100, yPercent)
    );

    // Update position
    card.style.left = clampedX + "%";
    card.style.top = clampedY + "%";

    // Update card data
    this.draggedCard.currentPosition.x = clampedX;
    this.draggedCard.currentPosition.y = clampedY;
  }

  endDrag() {
    if (!this.isDragging || !this.draggedCard) return;

    const card = this.draggedCard.element;

    // Remove dragging class
    card.classList.remove("dragging");

    // Add moved class to keep it on top
    card.classList.add("moved");
    this.movedCards.add(this.draggedCard);

    // Re-enable transitions
    setTimeout(() => {
      card.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    }, 100);

    // Reset drag state
    this.isDragging = false;
    this.draggedCard = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  onCardHover(cardData, isHovering) {
    const card = cardData.element;
    const icon = card.querySelector(".card-icon");
    const title = card.querySelector(".card-title");

    if (isHovering) {
      // Enhance the hover state
      icon.style.transform = "scale(1.1) rotate(5deg)";
      title.style.transform = "translateY(-2px)";

      // Add glow effect to nearby cards
      this.addProximityGlow(cardData, true);
    } else {
      // Reset hover state
      icon.style.transform = "scale(1) rotate(0deg)";
      title.style.transform = "translateY(0)";

      // Remove glow effect
      this.addProximityGlow(cardData, false);
    }
  }

  addProximityGlow(hoveredCard, isActive) {
    this.cards.forEach((cardData) => {
      if (cardData !== hoveredCard) {
        const distance = this.calculateDistance(hoveredCard, cardData);

        if (distance < 300 && isActive) {
          cardData.element.style.boxShadow = `
            0 10px 30px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 255, 136, 0.2)
          `;
        } else if (!isActive) {
          cardData.element.style.boxShadow = "";
        }
      }
    });
  }

  calculateDistance(card1, card2) {
    const rect1 = card1.element.getBoundingClientRect();
    const rect2 = card2.element.getBoundingClientRect();

    const centerX1 = rect1.left + rect1.width / 2;
    const centerY1 = rect1.top + rect1.height / 2;
    const centerX2 = rect2.left + rect2.width / 2;
    const centerY2 = rect2.top + rect2.height / 2;

    return Math.sqrt(
      Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
  }

  createRippleEffect(event, card) {
    const rect = card.getBoundingClientRect();
    const ripple = document.createElement("div");

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(0, 255, 136, 0.3);
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${event.clientX - rect.left - 10}px;
      top: ${event.clientY - rect.top - 10}px;
      width: 20px;
      height: 20px;
      z-index: 10;
    `;

    card.appendChild(ripple);

    // Clean up the ripple element
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  updateParallax() {
    // Subtle parallax effect based on mouse position
    const parallaxStrength = 8; // Reduced to prevent interference with collision system

    this.cards.forEach((cardData) => {
      const card = cardData.element;

      // Calculate offset based on mouse position and card position
      const cardRect = card.getBoundingClientRect();
      const cardCenterX =
        (cardRect.left + cardRect.width / 2) / window.innerWidth;
      const cardCenterY =
        (cardRect.top + cardRect.height / 2) / window.innerHeight;

      const offsetX =
        (this.mousePosition.x - (cardCenterX * 2 - 1)) * parallaxStrength;
      const offsetY =
        (this.mousePosition.y - (cardCenterY * 2 - 1)) * parallaxStrength;

      cardData.targetOffset.x = offsetX;
      cardData.targetOffset.y = offsetY;

      // Smooth interpolation
      cardData.currentOffset.x +=
        (cardData.targetOffset.x - cardData.currentOffset.x) * 0.1;
      cardData.currentOffset.y +=
        (cardData.targetOffset.y - cardData.currentOffset.y) * 0.1;

      // Apply the transform (only if not on mobile and not actively moving)
      if (window.innerWidth > 768 && !cardData.isMoving) {
        const currentTransform = card.style.transform || "";
        const baseTransform = currentTransform
          .replace(/translate\([^)]+\)/g, "")
          .trim();
        card.style.transform = `translate(${cardData.currentOffset.x}px, ${cardData.currentOffset.y}px) ${baseTransform}`;
      }
    });
  }

  animateConstellationLines() {
    const lines = document.querySelectorAll(".constellation-lines line");

    lines.forEach((line, index) => {
      const time = Date.now() * 0.001;
      const opacity = 0.3 + Math.sin(time + index * 0.5) * 0.2;
      line.style.opacity = Math.max(0.1, opacity);
    });
  }

  startAnimationLoop() {
    const animate = () => {
      this.updateParallax();
      this.animateConstellationLines();
      this.updateCardPositions();
      this.checkCollisions();
      requestAnimationFrame(animate);
    };

    animate();
  }

  startCollisionDetection() {
    // Initial collision check and resolution
    setTimeout(() => {
      this.resolveInitialOverlaps();
    }, 1000);
  }

  resolveInitialOverlaps() {
    for (let i = 0; i < this.cards.length; i++) {
      for (let j = i + 1; j < this.cards.length; j++) {
        const card1 = this.cards[i];
        const card2 = this.cards[j];

        if (this.areCardsOverlapping(card1, card2)) {
          this.separateCards(card1, card2);
        }
      }
    }
  }

  areCardsOverlapping(card1, card2) {
    const container = document.querySelector(".constellation-container");
    const containerRect = container.getBoundingClientRect();

    // Convert percentage positions to pixels
    const card1X = (card1.currentPosition.x * containerRect.width) / 100;
    const card1Y = (card1.currentPosition.y * containerRect.height) / 100;
    const card2X = (card2.currentPosition.x * containerRect.width) / 100;
    const card2Y = (card2.currentPosition.y * containerRect.height) / 100;

    // Add some padding for safety
    const padding = 20;
    const overlapThreshold = 50; // Minimum distance between cards

    const distance = Math.sqrt(
      Math.pow(card2X - card1X, 2) + Math.pow(card2Y - card1Y, 2)
    );

    return (
      distance < card1.size.width / 2 + card2.size.width / 2 + overlapThreshold
    );
  }

  separateCards(card1, card2) {
    const container = document.querySelector(".constellation-container");
    const containerRect = container.getBoundingClientRect();

    // Calculate separation vector
    const dx = card2.currentPosition.x - card1.currentPosition.x;
    const dy = card2.currentPosition.y - card1.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Avoid division by zero

    // Normalize and apply separation force
    const separationForce = 15; // Percentage units
    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    // Move cards apart
    card1.targetPosition.x -= normalizedX * separationForce * 0.5;
    card1.targetPosition.y -= normalizedY * separationForce * 0.5;
    card2.targetPosition.x += normalizedX * separationForce * 0.5;
    card2.targetPosition.y += normalizedY * separationForce * 0.5;

    // Keep cards within bounds
    this.keepCardInBounds(card1);
    this.keepCardInBounds(card2);

    // Mark as moving
    card1.isMoving = true;
    card2.isMoving = true;
  }

  keepCardInBounds(card) {
    const margin = 5; // Percentage margin from edges

    // Keep within horizontal bounds
    if (card.targetPosition.x < margin) {
      card.targetPosition.x = margin;
    } else if (card.targetPosition.x > 100 - 25) {
      // 25% for card width
      card.targetPosition.x = 100 - 25;
    }

    // Keep within vertical bounds
    if (card.targetPosition.y < margin) {
      card.targetPosition.y = margin;
    } else if (card.targetPosition.y > 100 - 25) {
      // 25% for card height
      card.targetPosition.y = 100 - 25;
    }
  }

  updateCardPositions() {
    this.cards.forEach((card) => {
      // Smooth interpolation to target position
      const lerp = 0.05; // Smooth movement speed

      if (card.isMoving) {
        card.currentPosition.x +=
          (card.targetPosition.x - card.currentPosition.x) * lerp;
        card.currentPosition.y +=
          (card.targetPosition.y - card.currentPosition.y) * lerp;

        // Apply position to element
        card.element.style.left = card.currentPosition.x + "%";
        card.element.style.top = card.currentPosition.y + "%";

        // Check if movement is complete
        const distanceToTarget = Math.sqrt(
          Math.pow(card.targetPosition.x - card.currentPosition.x, 2) +
            Math.pow(card.targetPosition.y - card.currentPosition.y, 2)
        );

        if (distanceToTarget < 0.5) {
          card.isMoving = false;
        }
      }
    });
  }

  checkCollisions() {
    // Continuous collision detection
    for (let i = 0; i < this.cards.length; i++) {
      for (let j = i + 1; j < this.cards.length; j++) {
        const card1 = this.cards[i];
        const card2 = this.cards[j];

        if (this.areCardsOverlapping(card1, card2)) {
          this.separateCards(card1, card2);
        }
      }
    }
  }

  handleResize() {
    // Recalculate positions on resize if needed
    if (window.innerWidth <= 768) {
      // Reset transforms on mobile
      this.cards.forEach((cardData) => {
        cardData.element.style.transform = "";
        cardData.isMoving = false;
      });
    } else {
      // Re-check collisions after resize
      setTimeout(() => {
        this.resolveInitialOverlaps();
      }, 100);
    }
  }
}

// Add CSS for ripple animation
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ConstellationCards();
});

// Add some constellation sparkle effects
class ConstellationSparkles {
  constructor() {
    this.sparkles = [];
    this.createSparkles();
  }

  createSparkles() {
    const container = document.querySelector(".constellation-container");
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(0, 255, 136, 0.8);
        border-radius: 50%;
        pointer-events: none;
        animation: sparkle ${2 + Math.random() * 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        z-index: 0;
      `;

      container.appendChild(sparkle);
      this.sparkles.push(sparkle);
    }
  }
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement("style");
sparkleStyle.textContent = `
  @keyframes sparkle {
    0%, 100% { 
      opacity: 0;
      transform: scale(0);
    }
    50% { 
      opacity: 1;
      transform: scale(1);
    }
  }
`;
document.head.appendChild(sparkleStyle);

// Initialize sparkles
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    new ConstellationSparkles();
  }, 1000);
});
