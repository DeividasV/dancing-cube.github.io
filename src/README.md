# Exhibition Framework

A lightweight, modular framework for creating interactive 3D exhibitions with Three.js.

## Features

### 🎯 **Core Framework**

- **Base Exhibition Class**: Common functionality for all exhibitions
- **Unified Audio System**: Web Audio API with built-in synthesizers
- **Component Architecture**: Reusable UI components
- **Event Management**: Mouse, keyboard, and touch interactions
- **Performance Monitoring**: FPS tracking and optimization

### 🎨 **UI Components**

- **TopMenu**: Consistent navigation across all exhibitions
- **ExhibitionWindow**: Unified container with loading states
- **Audio Controls**: Toggle button with visual feedback
- **Navigation**: Previous/Next exhibition browsing
- **Fullscreen Support**: Seamless fullscreen experience

### 🔊 **Audio System**

- **Procedural Sound Generation**: Real-time audio synthesis
- **Collision Audio**: Physics-based sound effects
- **Synthesizer Management**: Multiple audio contexts
- **Spatial Audio**: Positional audio with panning
- **Performance Optimized**: Minimal audio latency

### 📱 **Responsive Design**

- **Mobile Optimized**: Touch controls and mobile menu
- **Cross-Platform**: Works on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Full keyboard navigation
- **Accessibility**: Screen reader friendly

## Quick Start

### 1. Create Exhibition HTML

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Exhibition - Dancing Cube</title>

    <!-- Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

    <!-- Exhibition Framework -->
    <script src="../src/core/ComponentManager.js"></script>
  </head>
  <body>
    <script src="../src/exhibitions/my-exhibition.js"></script>
  </body>
</html>
```

### 2. Create Exhibition Class

```javascript
class MyExhibition extends Exhibition {
  constructor() {
    super({
      title: "MY_3XH1B1T10N",
      description: "An amazing 3D experience",
      hasAudio: true,
      backgroundColor: 0x0a0a0a,
    });
  }

  async load() {
    // Create your 3D scene here
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

## Architecture

```
src/
├── core/
│   ├── Exhibition.js          # Base exhibition class
│   ├── AudioSystem.js         # Unified audio system
│   └── ComponentManager.js    # Framework loader
├── components/
│   ├── TopMenu.js            # Navigation component
│   └── ExhibitionWindow.js   # Container component
├── css/
│   └── exhibition-framework.css  # Unified styles
└── exhibitions/
    ├── quantum-bounce.js     # Example exhibition
    └── morphing-forms.js     # Example exhibition
```

## Base Exhibition Class

The `Exhibition` class provides:

### Configuration

```javascript
{
    title: 'Exhibition Title',
    description: 'Exhibition description',
    hasAudio: true,
    autoStart: true,
    backgroundColor: 0x0a0a0a,
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 0, z: 10 }
    }
}
```

### Methods to Override

```javascript
async load()                    // Setup scene objects
update(deltaTime)              // Animation loop
onMouseDown(event)             // Mouse interactions
onKeyDown(event)               // Keyboard controls
onAudioToggle(enabled)         // Audio state changes
onDispose()                    // Cleanup resources
```

### Built-in Features

- **Three.js Setup**: Scene, camera, renderer
- **Event Handling**: Mouse, keyboard, touch, resize
- **Performance**: FPS monitoring, auto-pause
- **Audio Integration**: Built-in audio system
- **Mobile Support**: Touch controls, responsive UI

## Audio System

### Basic Usage

```javascript
// Play simple tone
this.audioSystem.playTone(440, 0.5, "sine");

// Play collision sound
this.audioSystem.playCollisionSound(velocity, "metal");

// Create synthesizer
this.audioSystem.createSynthesizer("mySynth", {
  waveform: "square",
  gain: 0.1,
  filter: {
    type: "lowpass",
    frequency: 1000,
  },
});

// Play note on synthesizer
this.audioSystem.playNote("mySynth", 440, 1.0);
```

### Spatial Audio

```javascript
// Positional audio with panning
this.audioSystem.playPositionalTone(frequency, duration, gain, pan);

// Particle-based audio
this.audioSystem.createParticleSound(position, velocity, "water");
```

## UI Components

### TopMenu Features

- **Navigation**: Previous/Next exhibition
- **Audio Control**: Toggle with visual feedback
- **Fullscreen**: Enter/exit fullscreen mode
- **Help**: Built-in help overlay
- **Keyboard Shortcuts**: Full keyboard support

### Exhibition Window Features

- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Responsive Layout**: Mobile-optimized design
- **Fullscreen Support**: Seamless transitions

## Event System

### Mouse Events

```javascript
onMouseDown(event) {
    const mouse = this.getMousePosition(event);
    const worldPos = this.screenToWorld(mouse.x, mouse.y, 10);
    // Handle interaction
}
```

### Keyboard Shortcuts

- **Arrow Keys**: Navigate exhibitions
- **Space**: Pause/resume or reset
- **A**: Toggle audio
- **F**: Toggle fullscreen
- **H** or **?**: Show help

### Touch Support

- **Touch Events**: Full mobile support
- **Gesture Recognition**: Pinch, swipe, tap
- **Mobile Menu**: Collapsible navigation

## Performance

### Optimization Features

- **Auto-pause**: When tab is inactive
- **FPS Monitoring**: Performance tracking
- **Resource Management**: Automatic cleanup
- **Level of Detail**: Distance-based optimization
- **Memory Management**: Geometry/material disposal

### Best Practices

```javascript
// Efficient geometry updates
geometry.attributes.position.needsUpdate = true;

// Object pooling for particles
this.particlePool = [];

// Cleanup in onDispose()
onDispose() {
    this.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
}
```

## Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+

## Examples

See the included exhibitions:

- **`quantum-bounce.js`**: Physics simulation with audio
- **`morphing-forms.js`**: Organic shape transformations

## Migration Guide

### From Individual Exhibitions

1. **Replace HTML structure** with framework template
2. **Extend Exhibition class** instead of custom implementation
3. **Move scene setup** to `load()` method
4. **Move animation** to `update(deltaTime)` method
5. **Replace audio code** with AudioSystem methods
6. **Remove custom navigation** (handled by framework)

### Audio Migration

```javascript
// Old way
this.audioContext = new AudioContext();
const oscillator = this.audioContext.createOscillator();
// ... manual setup

// New way
this.audioSystem.playTone(frequency, duration, waveform);
```

### UI Migration

```javascript
// Old way
document.querySelector('.audio-toggle').addEventListener('click', ...);

// New way
onAudioToggle(enabled) {
    // Framework handles UI, you handle logic
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add your exhibition to `src/exhibitions/`
4. Test on multiple devices
5. Submit a pull request

## License

MIT License - see LICENSE file for details
