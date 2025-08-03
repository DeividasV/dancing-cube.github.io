# Dancing Cube - Interactive 3D Exhibition Platform

A modular, framework-based platform for creating interactive 3D visualizations and artistic exhibitions using Three.js.

## 🎯 **Project Overview**

**Dancing Cube** is a collection of interactive 3D exhibitions featuring physics simulations, geometric art, and generative visualizations. The project has been refactored with a unified framework that provides consistent UI, audio systems, and development patterns.

## 📁 **Project Structure**

```
dancing-cube.github.io/
├── README.md                          # Project documentation
├── index.html                         # Main gallery page
├── package.json                       # Project metadata
├── site.webmanifest                   # PWA manifest
├── favicon.ico                        # Site icon
│
├── assets/                            # Static assets
│   ├── audio/                         # Audio files (if any)
│   ├── images/                        # Icons and images
│   │   ├── favicon-*.png             # Various favicon sizes
│   │   └── apple-touch-icon.png      # iOS icon
│   └── lib/                           # Third-party libraries
│       └── three.min.js              # Three.js library
│
├── src/                               # Framework source code
│   ├── components/                    # Reusable UI components
│   │   ├── ExhibitionWindow.js        # Exhibition container
│   │   └── TopMenu.js                 # Navigation component
│   ├── core/                          # Core framework
│   │   ├── Exhibition.js              # Base exhibition class
│   │   ├── AudioSystem.js             # Unified audio system
│   │   └── ComponentManager.js        # Framework loader
│   ├── css/                           # Framework styles
│   │   └── exhibition-framework.css   # Unified CSS
│   ├── shared/                        # Shared utilities
│   │   ├── constellation-cards.js     # Gallery navigation
│   │   └── constellation-cards.css    # Gallery styles
│   ├── legacy/                        # Legacy components
│   │   └── [old framework files]      # Backup of old code
│   └── README.md                      # Framework documentation
│
└── exhibitions/                       # Individual exhibitions
    ├── quantum-bounce/                # Physics simulation
    │   ├── index.html                 # Exhibition page
    │   ├── quantum-bounce.js          # Exhibition logic
    │   └── legacy-styles.css          # Legacy styles (if any)
    ├── fluid-dynamics/                # Fluid simulation
    ├── morphing-forms/                # Shape morphing
    ├── wire-network/                  # Network visualization
    ├── individual-squares/            # Geometric patterns
    ├── droplets-dance/                # Particle systems
    ├── blood-ocean/                   # Organic simulation
    ├── glass-spheres/                 # Glass rendering
    ├── mirror-pyramid/                # Reflection effects
    ├── axis-connect/                  # Axis visualization
    ├── deformed-coord/                # Coordinate deformation
    └── infinite-knot/                 # Mathematical knots
```

## 🚀 **Framework Features**

### **Unified Exhibition Framework**

- **Base Exhibition Class**: Common Three.js setup, event handling, lifecycle management
- **Audio System**: Web Audio API integration with synthesizers and spatial audio
- **Component Architecture**: Reusable UI components (TopMenu, ExhibitionWindow)
- **Event Management**: Mouse, keyboard, and touch interactions
- **Performance Monitoring**: FPS tracking and optimization

### **Consistent User Experience**

- **Top Navigation**: Same menu across all exhibitions
- **Audio Controls**: Universal audio toggle (🔇/🔊) - default OFF
- **Keyboard Shortcuts**: Arrow keys for navigation, A for audio, F for fullscreen
- **Mobile Support**: Touch controls and responsive design
- **Loading States**: Smooth loading animations and error handling

### **Developer Experience**

- **Easy Exhibition Creation**: Extend base class, implement `load()` and `update()`
- **Automatic UI**: Framework handles navigation, audio toggle, layout
- **Code Reuse**: Shared utilities and components
- **Clean Structure**: Each exhibition in its own folder

## 🎨 **Available Exhibitions**

1. **QU4NTUM_B0UNC3** - Physics simulation with bouncing cubes and quantum effects
2. **FLU1D_DYN4M1X** - Fluid dynamics visualization
3. **M0RPH1NG_F0RMS** - Organic shape transformations with procedural audio
4. **W1R3_N3TW0RK** - Network visualization and connectivity
5. **1ND1V1DU4L_SQU4R3S** - Geometric pattern exploration
6. **DR0PL3TS_D4NC3** - Particle system choreography
7. **BL00D_0C34N** - Organic flow simulation
8. **GL4SS_SPH3R3S** - Glass rendering and refraction effects
9. **M1RR0R_PYR4M1D** - Reflection and mirror effects
10. **4X1S_C0NN3CT** - Axis and connection visualization
11. **D3F0RM3D_C00RD** - Coordinate system deformation
12. **1NF1N1T3_KN0T** - Mathematical knot visualization

## 🛠️ **Development**

### **Creating a New Exhibition**

1. Create exhibition folder:

```bash
mkdir exhibitions/my-exhibition
```

2. Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>MY_3XH1B1T10N - Dancing Cube</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="../../src/core/ComponentManager.js"></script>
  </head>
  <body>
    <script src="./my-exhibition.js"></script>
  </body>
</html>
```

3. Create `my-exhibition.js`:

```javascript
class MyExhibition extends Exhibition {
  constructor() {
    super({
      title: "MY_3XH1B1T10N",
      description: "Amazing 3D experience",
      hasAudio: true,
    });
  }

  async load() {
    // Create your 3D scene
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  update(deltaTime) {
    // Animation loop
    if (this.cube) {
      this.cube.rotation.x += deltaTime;
      this.cube.rotation.y += deltaTime * 0.5;
    }
  }
}

// Initialize
document.addEventListener("exhibitionFrameworkReady", () => {
  new MyExhibition();
});
```

### **Adding to Navigation**

Update `src/components/TopMenu.js` to include your exhibition in the navigation array.

## 🎵 **Audio System**

The unified audio system provides:

- **Simple Tones**: `this.audioSystem.playTone(frequency, duration, waveform)`
- **Collision Sounds**: `this.audioSystem.playCollisionSound(velocity, material)`
- **Synthesizers**: `this.audioSystem.createSynthesizer(name, config)`
- **Spatial Audio**: `this.audioSystem.playPositionalTone(freq, duration, gain, pan)`

All exhibitions with `hasAudio: true` automatically get audio toggle buttons.

## 📱 **Browser Support**

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

## 🚀 **Deployment**

The project is designed for GitHub Pages deployment:

1. Push to main branch
2. Enable GitHub Pages from repository settings
3. Site available at `https://[username].github.io/dancing-cube.github.io/`

## 🎯 **Performance**

- **Auto-pause**: When tab becomes inactive
- **Resource management**: Automatic cleanup of Three.js resources
- **Level of detail**: Distance-based optimization (where implemented)
- **FPS monitoring**: Built-in performance tracking

## 🔧 **Migration Notes**

The project has been migrated from individual HTML files to a unified framework:

- **Old structure**: `/exhibitions/exhibition-name.html`
- **New structure**: `/exhibitions/exhibition-name/index.html`
- **Benefits**: Better organization, code reuse, consistent UI/UX
- **Backward compatibility**: Old URLs redirect to new structure

## 📝 **License**

MIT License - Feel free to use this framework for your own 3D exhibitions!

## 🤝 **Contributing**

1. Fork the repository
2. Create your exhibition in `exhibitions/your-name/`
3. Test on multiple devices
4. Submit a pull request

---

**Built with Three.js, Web Audio API, and creative coding passion** ✨

- **QU4NTUM_B0UNC3** - Interactive 3D physics simulation with bouncing cubes in a wireframe grid environment
- **FLU1D_DYN4M1X** - Dynamic fluid dynamics simulation with particle systems
- **BL00D_0C34N** - Atmospheric blood ocean visualization with wave effects
- **DR0PL3TS_D4NC3** - Dancing droplets simulation with gravity and collision detection
- **M0RPH1NG_F0RMS** - Morphing 3D shapes with dynamic transformations

## Project Structure

```
├── index.html                  # Main landing page with exhibition gallery
├── components/                 # Reusable HTML components
│   └── top-menu.html          # Top navigation menu component
├── exhibitions/                # Individual exhibition pages
│   ├── quantum-bounce.html
│   ├── fluid-dynamics.html
│   ├── blood-ocean.html
│   ├── droplets-dance.html
│   ├── morphing-forms.html
│   ├── axis-connect.html
│   ├── deformed-coord.html
│   ├── glass-spheres.html
│   ├── individual-squares.html
│   ├── infinite-knot.html
│   ├── infinite-knot-3d.html
│   ├── mirror-pyramid.html
│   └── wire-network.html
├── css/                        # Stylesheets
│   ├── constellation-cards.css # Main page styling
│   ├── shared-navigation.css   # Navigation component styles
│   ├── top-menu.css           # Top menu specific styles
│   └── [exhibition-name].css  # Individual exhibition styles
├── js/                         # JavaScript files
│   ├── constellation-cards.js  # Main page interactions
│   ├── shared-controls.js      # Common control utilities
│   ├── top-menu.js            # Navigation system
│   └── [exhibition-name].js   # Individual exhibition logic
└── assets/                     # Static assets
    ├── lib/                   # External libraries
    │   └── three.min.js       # Three.js library
    └── images/                # Image assets (future use)
```

## Technologies

- Three.js for 3D rendering
- WebGL for hardware acceleration
- CSS3 for styling and animations
- HTML5 Canvas for particle effects

## Development

Open `index.html` in a web browser to start exploring the exhibitions. Each exhibition is a standalone interactive experience.

For development with a local server:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000
