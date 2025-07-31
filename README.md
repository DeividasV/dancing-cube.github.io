# Dancing Cube - Interactive 3D Exhibition

A collection of interactive 3D visualizations and geometric art exhibitions built with Three.js.

## Live Demo

https://deividasv.github.io/dancing-cube.github.io/index.html

## Exhibitions

- **QU4NTUM_B0UNC3** - Interactive 3D physics simulation with bouncing cubes in a wireframe grid environment
- **FLU1D_DYN4M1X** - Dynamic fluid dynamics simulation with particle systems
- **BL00D_0C34N** - Atmospheric blood ocean visualization with wave effects
- **DR0PL3TS_D4NC3** - Dancing droplets simulation with gravity and collision detection
- **M0RPH1NG_F0RMS** - Morphing 3D shapes with dynamic transformations

## Project Structure

```
├── index.html              # Main landing page with exhibition gallery
├── exhibitions/            # Individual exhibition pages
│   ├── quantum-bounce.html
│   ├── fluid-dynamics.html
│   ├── blood-ocean.html
│   ├── droplets-dance.html
│   └── morphing-forms.html
├── css/                    # Stylesheets
│   ├── constellation-cards.css
│   ├── shared-navigation.css
│   ├── quantum-bounce.css
│   └── fluid-dynamics.css
└── js/                     # JavaScript files
    ├── constellation-cards.js
    ├── shared-controls.js
    ├── quantum-bounce.js
    └── fluid-dynamics.js
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
