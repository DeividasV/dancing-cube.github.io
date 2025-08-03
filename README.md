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
