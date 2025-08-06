// DR0PL3TS_D4NC3 - Three.js Water Droplets System

// Audio system setup - initialize lazily
let audioSystem = null;
let soundEnabled = false; // Default to OFF
let ambientSoundId = null;

// Audio control
function toggleSound(enabled) {
  // Initialize AudioSystem lazily
  if (!audioSystem && typeof AudioSystem !== "undefined") {
    audioSystem = new AudioSystem();
  }

  soundEnabled = enabled;

  if (audioSystem) {
    audioSystem.toggle(enabled);

    if (enabled) {
      // Start ambient water atmosphere
      ambientSoundId = audioSystem.createAmbientNoise("pink", 0.03);
    } else {
      if (ambientSoundId) {
        audioSystem.stopAmbientSound(ambientSoundId);
        ambientSoundId = null;
      }
    }
  }
}

// Water droplet sound
function playDropletSound(frequency = 800, intensity = 0.5) {
  if (!soundEnabled || !audioSystem) return;

  const adjustedFreq = frequency + (Math.random() - 0.5) * 200;
  const duration = 0.1 + intensity * 0.2;
  const volume = Math.min(0.02 + intensity * 0.04, 0.08);

  audioSystem.createInteractionSound(adjustedFreq, "sine", duration, volume);
}

// Splash sound
function playSplashSound(intensity = 0.3) {
  if (!soundEnabled || !audioSystem) return;

  const frequency = 400 + Math.random() * 300;
  const duration = 0.2 + intensity * 0.1;
  const volume = 0.05;

  audioSystem.createInteractionSound(frequency, "triangle", duration, volume);
}

// Global function for sound toggle button
window.toggleAppSound = function () {
  // Initialize AudioSystem lazily
  if (!audioSystem && typeof AudioSystem !== "undefined") {
    audioSystem = new AudioSystem();
  }

  if (audioSystem) {
    audioSystem.toggleSound();
  }
};

// Scene setup
const scene = new THREE.Scene();

// Get container and set up camera with proper aspect ratio
const container = document.getElementById("container");
if (!container) {
  console.error("Container element not found");
}

const width = container ? container.offsetWidth : window.innerWidth;
const height = container ? container.offsetHeight : window.innerHeight;

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Get container and set up renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

// Set container dimensions
renderer.setSize(width, height);
renderer.setClearColor(0x001122);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Append renderer to container
if (container) {
  container.appendChild(renderer.domElement);
}

// Mouse tracking
const mouse = { x: 0, y: 0 };
window.addEventListener("mousemove", (event) => {
  const rect = container
    ? container.getBoundingClientRect()
    : { left: 0, top: 0 };
  const containerWidth = container ? container.offsetWidth : window.innerWidth;
  const containerHeight = container
    ? container.offsetHeight
    : window.innerHeight;

  mouse.x = ((event.clientX - rect.left) / containerWidth) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / containerHeight) * 2 + 1;
});

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x00aaff, 0.6, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Water material
const waterMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x006699,
  transparent: true,
  opacity: 0.8,
  roughness: 0.1,
  metalness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  transmission: 0.3,
  ior: 1.33,
});

// String material
const stringMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0088cc,
  transparent: true,
  opacity: 0.6,
  roughness: 0.2,
  metalness: 0.0,
});

// Droplet class
class WaterDroplet {
  constructor(x, y, z, baseRadius = 0.3) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    );
    this.baseRadius = baseRadius;
    this.currentRadius = baseRadius;
    this.targetRadius = baseRadius;
    this.mass = 1.0;
    this.tension = 0;

    // Create droplet geometry (sphere that can be deformed)
    this.geometry = new THREE.SphereGeometry(this.baseRadius, 16, 12);
    this.mesh = new THREE.Mesh(this.geometry, waterMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // Oscillation parameters for random movement
    this.oscillation = {
      x: Math.random() * Math.PI * 2,
      y: Math.random() * Math.PI * 2,
      z: Math.random() * Math.PI * 2,
      speedX: 0.5 + Math.random() * 1.5,
      speedY: 0.7 + Math.random() * 1.3,
      speedZ: 0.6 + Math.random() * 1.4,
      amplitudeX: 0.1 + Math.random() * 0.2,
      amplitudeY: 0.1 + Math.random() * 0.2,
      amplitudeZ: 0.1 + Math.random() * 0.2,
    };
  }

  update(time, droplets) {
    // Random oscillation
    this.oscillation.x += this.oscillation.speedX * 0.016;
    this.oscillation.y += this.oscillation.speedY * 0.016;
    this.oscillation.z += this.oscillation.speedZ * 0.016;

    const randomForce = new THREE.Vector3(
      Math.sin(this.oscillation.x) * this.oscillation.amplitudeX,
      Math.sin(this.oscillation.y) * this.oscillation.amplitudeY,
      Math.sin(this.oscillation.z) * this.oscillation.amplitudeZ
    );

    // Calculate forces from other droplets
    const totalForce = new THREE.Vector3();
    let totalTension = 0;

    droplets.forEach((other) => {
      if (other !== this) {
        const distance = this.position.distanceTo(other.position);
        const direction = other.position.clone().sub(this.position).normalize();

        // Spring force (attraction when far, repulsion when close)
        const restLength = 1.5;
        const springConstant = 0.1;
        const dampingConstant = 0.95;

        let force;
        if (distance > restLength) {
          // Attraction
          force = springConstant * (distance - restLength);
          totalTension += force;
        } else {
          // Repulsion
          force = -springConstant * (restLength - distance) * 2;
        }

        totalForce.add(direction.multiplyScalar(force));
      }
    });

    // Apply forces
    this.velocity.add(totalForce.multiplyScalar(0.016));
    this.velocity.add(randomForce.multiplyScalar(0.1));
    this.velocity.multiplyScalar(0.98); // Damping

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(0.016));

    // Update tension and radius based on forces
    const previousTension = this.tension;
    this.tension = totalTension;
    this.targetRadius = this.baseRadius * (1 + this.tension * 0.3);
    this.currentRadius += (this.targetRadius - this.currentRadius) * 0.1;

    // Play tension sound when tension changes significantly (less frequent)
    if (
      Math.abs(this.tension - previousTension) > 0.15 &&
      Math.random() < 0.1
    ) {
      playDropletSound(400 + this.tension * 200, this.tension);
    }

    // Play movement sound based on velocity (less frequent)
    const velocityMagnitude = this.velocity.length();
    if (velocityMagnitude > 0.08 && Math.random() < 0.05) {
      playDropletSound(800, Math.min(velocityMagnitude * 8, 1.5));
    }

    // Deform droplet based on velocity and tension
    const stretchFactor = 1 + velocityMagnitude * 2;
    const squeezeFactor = 1 / Math.sqrt(stretchFactor);

    this.mesh.scale.set(
      squeezeFactor * (1 + Math.sin(time * 3 + this.oscillation.x) * 0.1),
      stretchFactor * (1 + Math.sin(time * 2.5 + this.oscillation.y) * 0.1),
      squeezeFactor * (1 + Math.sin(time * 2 + this.oscillation.z) * 0.1)
    );

    // Update mesh position
    this.mesh.position.copy(this.position);

    // Add subtle rotation
    this.mesh.rotation.x += this.velocity.y * 0.1;
    this.mesh.rotation.y += this.velocity.x * 0.1;
    this.mesh.rotation.z += this.velocity.z * 0.1;
  }
}

// String connection class
class WaterString {
  constructor(droplet1, droplet2) {
    this.droplet1 = droplet1;
    this.droplet2 = droplet2;
    this.segments = 20;
    this.vibrationPhase = Math.random() * Math.PI * 2;
    this.vibrationSpeed = 2 + Math.random() * 3;
    this.vibrationAmplitude = 0.05 + Math.random() * 0.1;

    // Create string geometry
    this.geometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(droplet1.position, droplet2.position),
      this.segments,
      0.02,
      8,
      false
    );
    this.mesh = new THREE.Mesh(this.geometry, stringMaterial);
    this.mesh.castShadow = true;
    scene.add(this.mesh);
  }

  update(time) {
    // Update vibration
    const previousPhase = this.vibrationPhase;
    this.vibrationPhase += this.vibrationSpeed * 0.016;

    // Play string vibration sound occasionally (less frequent and quieter)
    if (
      Math.sin(this.vibrationPhase) > 0.99 &&
      Math.sin(previousPhase) <= 0.99 &&
      Math.random() < 0.2
    ) {
      const stringFreq = 120 + this.vibrationSpeed * 20;
      playDropletSound(stringFreq, 0.3);
    }

    // Create curved path between droplets with vibration
    const start = this.droplet1.position;
    const end = this.droplet2.position;
    const distance = start.distanceTo(end);

    // Create control points for the curve
    const points = [];
    for (let i = 0; i <= this.segments; i++) {
      const t = i / this.segments;
      const point = start.clone().lerp(end, t);

      // Add vibration perpendicular to the string
      const direction = end.clone().sub(start).normalize();
      const perpendicular = new THREE.Vector3(
        -direction.y,
        direction.x,
        direction.z
      ).normalize();

      const vibration =
        Math.sin(this.vibrationPhase + t * Math.PI * 4) *
        this.vibrationAmplitude *
        Math.sin(t * Math.PI); // Stronger vibration in the middle

      point.add(perpendicular.multiplyScalar(vibration));

      // Add some random noise
      point.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        )
      );

      points.push(point);
    }

    // Create curve and update geometry
    const curve = new THREE.CatmullRomCurve3(points);
    const radius =
      0.015 + (this.droplet1.tension + this.droplet2.tension) * 0.01;

    // Dispose old geometry and create new one
    this.geometry.dispose();
    this.geometry = new THREE.TubeGeometry(
      curve,
      this.segments,
      radius,
      8,
      false
    );
    this.mesh.geometry = this.geometry;
  }
}

// Camera controller
class CameraController {
  constructor() {
    this.angle = 0;
    this.elevation = 0;
    this.distance = 8;
    this.targetDistance = 8;
    this.rotationSpeed = 0.3;
    this.elevationSpeed = 0.2;
    this.zoomSpeed = 0.1;

    // Random movement parameters
    this.randomPhase = {
      rotation: Math.random() * Math.PI * 2,
      elevation: Math.random() * Math.PI * 2,
      zoom: Math.random() * Math.PI * 2,
    };
  }

  update(time) {
    // Update random phases
    this.randomPhase.rotation += this.rotationSpeed * 0.016;
    this.randomPhase.elevation += this.elevationSpeed * 0.016;
    this.randomPhase.zoom += this.zoomSpeed * 0.016;

    // Calculate camera position with random movements
    this.angle += (0.5 + Math.sin(this.randomPhase.rotation) * 0.3) * 0.016;
    this.elevation = Math.sin(this.randomPhase.elevation) * 0.8;
    this.targetDistance = 6 + Math.sin(this.randomPhase.zoom) * 3;
    this.distance += (this.targetDistance - this.distance) * 0.05;

    // Position camera
    camera.position.x = Math.cos(this.angle) * this.distance;
    camera.position.y = this.elevation * 3;
    camera.position.z = Math.sin(this.angle) * this.distance;

    // Look at center with slight offset
    const lookAtPoint = new THREE.Vector3(
      Math.sin(time * 0.5) * 0.5,
      Math.cos(time * 0.3) * 0.3,
      0
    );
    camera.lookAt(lookAtPoint);
  }
}

// Create droplets
const droplets = [
  new WaterDroplet(0, 0, 0, 0.35),
  new WaterDroplet(2, 1, -1, 0.3),
  new WaterDroplet(-1.5, -1, 1, 0.32),
  new WaterDroplet(1, -2, 0.5, 0.28),
  new WaterDroplet(-2, 0.5, -0.5, 0.33),
];

// Create strings between all droplets
const strings = [];
for (let i = 0; i < droplets.length; i++) {
  for (let j = i + 1; j < droplets.length; j++) {
    strings.push(new WaterString(droplets[i], droplets[j]));
  }
}

// Camera controller
const cameraController = new CameraController();

// Animation loop
let time = 0;
let previousMouseMagnitude = 0;
let previousCameraPosition = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Capture mouse for audio feedback
  const mouseMagnitude = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);

  // Play subtle sound for mouse movement (less frequent and quieter)
  if (
    Math.abs(mouseMagnitude - previousMouseMagnitude) > 0.1 &&
    Math.random() < 0.05
  ) {
    const mouseFreq = 80 + mouseMagnitude * 60;
    playDropletSound(mouseFreq, 0.2);
  }
  previousMouseMagnitude = mouseMagnitude;

  // Camera movement sound feedback (less frequent and quieter)
  const cameraMovement = camera.position.distanceTo(previousCameraPosition);
  if (cameraMovement > 0.02 && Math.random() < 0.1) {
    const cameraFreq = 60 + cameraMovement * 200;
    playDropletSound(cameraFreq, 0.1);
  }
  previousCameraPosition.copy(camera.position);

  // Update droplets
  droplets.forEach((droplet) => droplet.update(time, droplets));

  // Update strings
  strings.forEach((string) => string.update(time));

  // Update camera
  cameraController.update(time);

  // Update point light position
  pointLight.position.x = Math.sin(time * 0.7) * 3;
  pointLight.position.y = Math.cos(time * 0.5) * 2;
  pointLight.position.z = Math.sin(time * 0.3) * 2;

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  const newWidth = container ? container.offsetWidth : window.innerWidth;
  const newHeight = container ? container.offsetHeight : window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
});

// Start animation
animate();
