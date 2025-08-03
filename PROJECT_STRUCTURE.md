# Dancing Cube - Project Structure

## 📁 Clean & Organized Project Structure

```
dancing-cube.github.io/
├── 🏠 ROOT FILES
│   ├── index.html              # Main gallery/homepage
│   ├── package.json            # Project metadata
│   ├── README.md              # Project documentation
│   ├── favicon.ico            # Website favicon
│   ├── site.webmanifest       # PWA manifest
│   └── .gitignore            # Git ignore rules
│
├── 🎨 ASSETS/
│   ├── images/               # Favicons and images
│   ├── audio/               # Audio files (if any)
│   └── lib/
│       └── three.min.js     # Three.js library
│
├── 🎯 EXHIBITIONS/           # Each exhibition in its own folder
│   ├── quantum-bounce/
│   │   ├── index.html       # Exhibition HTML
│   │   ├── quantum-bounce.js # Exhibition logic
│   │   └── legacy-styles.css # Old styles (if needed)
│   │
│   ├── morphing-forms/
│   │   ├── index.html
│   │   ├── morphing-forms.js
│   │   └── (no legacy styles)
│   │
│   ├── fluid-dynamics/
│   │   ├── index.html
│   │   ├── fluid-dynamics.js
│   │   └── legacy-styles.css
│   │
│   ├── wire-network/
│   ├── individual-squares/
│   ├── droplets-dance/
│   ├── blood-ocean/
│   ├── glass-spheres/
│   ├── mirror-pyramid/
│   ├── axis-connect/
│   ├── deformed-coord/
│   └── infinite-knot/
│
├── 🛠️ SRC/                   # Framework & shared code
│   ├── core/                # Core framework
│   │   ├── Exhibition.js    # Base exhibition class
│   │   ├── AudioSystem.js   # Unified audio system
│   │   └── ComponentManager.js # Framework loader
│   │
│   ├── components/          # Reusable UI components
│   │   ├── TopMenu.js      # Navigation component
│   │   └── ExhibitionWindow.js # Container component
│   │
│   ├── css/                # Framework styles
│   │   └── exhibition-framework.css # Unified exhibition styles
│   │
│   ├── shared/             # Shared homepage assets
│   │   ├── constellation-cards.css # Homepage styles
│   │   └── constellation-cards.js  # Homepage logic
│   │
│   ├── legacy/             # Old code (for reference)
│   │   ├── top-menu.js
│   │   ├── shared-controls.js
│   │   └── shared-navigation.css
│   │
│   └── README.md           # Framework documentation
│
└── 📚 DOCS/
    └── DEVELOPMENT.md      # Development guide
```

## 🎯 Key Improvements

### ✅ **Clean Structure**

- Each exhibition has its own folder
- No duplicate files or folders
- Clear separation between framework and exhibitions
- Easy to navigate and maintain

### ✅ **URL Structure**

- **Homepage**: `https://dancing-cube.github.io/`
- **Exhibitions**: `https://dancing-cube.github.io/exhibitions/quantum-bounce/`
- **Framework**: Not directly accessible (internal use only)

### ✅ **File Organization**

- **`index.html`** in each exhibition folder for clean URLs
- **Framework files** centralized in `src/`
- **Legacy files** preserved in `src/legacy/` for reference
- **Shared assets** in logical locations

### ✅ **Development Benefits**

- **Easy to add new exhibitions**: Just create a new folder
- **Consistent framework**: All exhibitions use the same base
- **Clean URLs**: No `.html` extensions needed
- **Version control**: Each exhibition is self-contained

## 🚀 Adding New Exhibitions

1. **Create folder**: `exhibitions/new-exhibition/`
2. **Copy template**: Use quantum-bounce or morphing-forms as template
3. **Update paths**: Ensure all paths point to `../../src/` for framework
4. **Add to homepage**: Update `index.html` with new exhibition link

## 🧹 Cleanup Completed

- ❌ Removed duplicate `src/exhibitions/` folder
- ❌ No loose CSS/JS files in root
- ❌ No old exhibition files outside their folders
- ✅ All exhibitions organized in subfolders
- ✅ Framework centralized in `src/`
- ✅ Homepage correctly links to all exhibitions

## 📊 File Count Summary

- **12 Exhibitions**: Each in its own folder with `index.html`
- **1 Framework**: Unified codebase in `src/`
- **1 Homepage**: Main gallery page
- **0 Duplicates**: Clean, no redundant files
