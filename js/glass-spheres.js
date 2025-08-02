// Glass Spheres Exhibition - Floating Glass Balls with Interactive Effects

// Create floating particles
function createParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.className = "particles";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 10 + "s";
    particle.style.animationDuration = 8 + Math.random() * 4 + "s";
    document.body.appendChild(particle);
  }
}

// Create musical notes
function createMusicNotes() {
  const notes = ["♪", "♫", "♬", "♩", "♭", "♯"];
  for (let i = 0; i < 12; i++) {
    const note = document.createElement("div");
    note.className = "music-note";
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.left = Math.random() * 100 + "%";
    note.style.animationDelay = Math.random() * 15 + "s";
    note.style.animationDuration = 12 + Math.random() * 6 + "s";
    document.body.appendChild(note);
  }
}

// Interactive mouse effects
function initMouseEffects() {
  document.addEventListener("mousemove", (e) => {
    const balls = document.querySelectorAll(".glass-ball");
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    balls.forEach((ball, index) => {
      const intensity = 0.1 + index * 0.05;
      const offsetX = (mouseX - 0.5) * 50 * intensity;
      const offsetY = (mouseY - 0.5) * 30 * intensity;

      ball.style.transform += ` translate(${offsetX}px, ${offsetY}px)`;
      ball.style.filter = `brightness(${1 + mouseY * 0.3}) contrast(${
        1 + mouseX * 0.2
      })`;
    });
  });
}

// Dynamic light intensity based on time
function initDynamicLighting() {
  setInterval(() => {
    const lightRays = document.querySelectorAll(".light-ray");
    lightRays.forEach((ray) => {
      ray.style.opacity = 0.3 + Math.random() * 0.7;
    });
  }, 2000);
}

// Initialize all effects
function init() {
  // Hide loading indicator
  setTimeout(() => {
    const loading = document.querySelector(".loading");
    if (loading) loading.style.display = "none";
  }, 2000);

  // Initialize effects
  createParticles();
  createMusicNotes();
  initMouseEffects();
  initDynamicLighting();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
