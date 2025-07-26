// Exhibition Center Interactive Features
class ExhibitionCenter {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupCardAnimations();
    this.setupParticleBackground();
    this.setupSmoothScrolling();
  }

  setupNavigation() {
    const nav = document.querySelector(".nav");
    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        nav.style.background = "rgba(10, 10, 10, 0.95)";
      } else {
        nav.style.background = "rgba(10, 10, 10, 0.9)";
      }

      // Auto-hide navigation on scroll down
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        nav.style.transform = "translateY(-100%)";
      } else {
        nav.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
    });
  }

  setupScrollEffects() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    // Observe all exhibition cards
    document.querySelectorAll(".exhibition-card").forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(50px)";
      card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(card);
    });
  }

  setupCardAnimations() {
    document.querySelectorAll(".exhibition-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        // Add subtle rotation and scale
        card.style.transform =
          "translateY(-10px) rotateX(5deg) rotateY(5deg) scale(1.02)";
        card.style.transition =
          "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)";
      });

      // Add click ripple effect
      card.addEventListener("click", (e) => {
        const ripple = document.createElement("div");
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(0, 255, 136, 0.2);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;

        card.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add ripple animation keyframes
    if (!document.getElementById("ripple-styles")) {
      const style = document.createElement("style");
      style.id = "ripple-styles";
      style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
      document.head.appendChild(style);
    }
  }

  setupParticleBackground() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;
    document.body.appendChild(canvas);

    const particles = [];
    const particleCount = 50;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? "0, 255, 136" : "255, 107, 107",
      };
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    }

    function updateParticles() {
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Breathing effect
        particle.opacity +=
          Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(${particle.color}, ${
              0.1 * (1 - distance / 100)
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
    }

    function animate() {
      updateParticles();
      drawParticles();
      requestAnimationFrame(animate);
    }

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initParticles();
    });
  }

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Utility method to add new exhibitions dynamically
  addExhibition(exhibition) {
    const grid = document.querySelector(".exhibition-grid");
    const card = document.createElement("div");
    card.className = "exhibition-card";
    card.innerHTML = `
            <div class="card-header">
                <div class="card-icon">${exhibition.icon}</div>
                <h3 class="card-title">${exhibition.title}</h3>
            </div>
            <p class="card-description">${exhibition.description}</p>
            <div class="card-meta">
                <span>Tech: ${exhibition.tech}</span>
                <span>Status: ${exhibition.status}</span>
            </div>
            <a href="${exhibition.link}" class="card-action">
                Launch Experience →
            </a>
        `;
    grid.appendChild(card);

    // Re-setup animations for the new card
    this.setupCardAnimations();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ExhibitionCenter();
});

// Export for potential external use
window.ExhibitionCenter = ExhibitionCenter;
