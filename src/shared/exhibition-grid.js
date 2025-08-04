// Dancing Cube - Exhibition Grid JavaScript

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
  }

  setupCards() {
    const cardElements = document.querySelectorAll(".glass-card");

    cardElements.forEach((card, index) => {
      const cardData = {
        element: card,
        index: index,
        baseAnimationDelay: index * 0.5, // Staggered animation
      };

      this.cards.push(cardData);

      // Add entrance animation
      this.animateCardEntrance(cardData, index);

      // Setup hover effects
      this.setupCardHoverEffects(card);
    });
  }

  animateCardEntrance(cardData, index) {
    const card = cardData.element;

    // Start with cards hidden and slightly below
    card.style.opacity = "0";
    card.style.transform = "translateY(50px) scale(0.8)";

    // Animate in with staggered delay
    setTimeout(() => {
      card.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0) scale(1)";
    }, index * 150);
  }

  setupCardHoverEffects(card) {
    const cardIcon = card.querySelector(".card-icon");
    const cardTitle = card.querySelector(".card-title");

    card.addEventListener("mouseenter", () => {
      // Enhanced hover effect with icon rotation and title glow
      if (cardIcon) {
        cardIcon.style.transform = "scale(1.1) rotate(5deg)";
      }
      if (cardTitle) {
        cardTitle.style.textShadow = "0 0 15px rgba(0, 255, 136, 0.6)";
      }
    });

    card.addEventListener("mouseleave", () => {
      // Reset hover effects
      if (cardIcon) {
        cardIcon.style.transform = "scale(1) rotate(0deg)";
      }
      if (cardTitle) {
        cardTitle.style.textShadow = "none";
      }
    });

    // Add click effect
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-link")) return; // Don't interfere with navigation

      // Brief scale animation on click
      card.style.transform = "scale(0.98)";
      setTimeout(() => {
        card.style.transform = "scale(1)";
      }, 150);
    });
  }

  startAnimationLoop() {
    const animate = () => {
      this.updateCardAnimations();
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateCardAnimations() {
    const time = Date.now() * 0.001;

    this.cards.forEach((cardData) => {
      const card = cardData.element;
      const icon = card.querySelector(".icon-gradient");

      if (icon) {
        // Subtle floating animation with mouse influence
        const mouseInfluenceX = this.mousePosition.x * 2;
        const mouseInfluenceY = this.mousePosition.y * 2;

        const floatOffset = Math.sin(time + cardData.baseAnimationDelay) * 3;
        const rotationOffset =
          Math.sin(time * 0.5 + cardData.baseAnimationDelay) * 2;

        // Apply subtle transform that responds to mouse
        const transformX =
          mouseInfluenceX + Math.sin(time * 0.3 + cardData.index) * 1;
        const transformY = mouseInfluenceY + floatOffset;

        card.style.transform = `translate(${transformX}px, ${transformY}px) rotate(${rotationOffset}deg)`;
      }
    });
  }

  handleResize() {
    // Reset any transforms on resize to prevent layout issues
    this.cards.forEach((cardData) => {
      cardData.element.style.transform = "";
    });

    // Restart animation after brief delay
    setTimeout(() => {
      this.startAnimationLoop();
    }, 100);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ExhibitionGrid();
});

// Also initialize if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new ExhibitionGrid();
  });
} else {
  new ExhibitionGrid();
}
