# Dancing Cube - Project Structure

## 📁 Clean & Organized Project Structure

```
dancing-cube.github.io/
├── 🏠 ROOT FILES
│   ├── index.html              # Main exhibition grid homepage
│   ├── package.json            # Project metadata
│   ├── README.md              # Project documentation
│   ├── favicon.ico            # Website favicon
│   ├── site.webmanifest       # PWA manifest
│   └── template.html          # Exhibition template
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
│   │   └── quantum-bounce.js # Exhibition logic
│   │
│   ├── morphing-forms/
│   │   ├── index.html
│   │   └── morphing-forms.js
│   │
│   ├── fluid-dynamics/
│   │   ├── index.html
│   │   └── fluid-dynamics.js
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
│   │   ├── exhibition-grid.css # Homepage grid styles
│   │   └── exhibition-grid.js  # Homepage grid logic
│   │
│   ├── legacy/             # Legacy compatibility
│   │   └── exhibition-compatibility.js # Backward compatibility
│   │
│   └── README.md           # Framework documentation
│
├── 🔧 SCRIPTS/             # Development utilities
│   ├── create_exhibition.sh # Creates new exhibitions
│   ├── verify_exhibitions.sh # Verifies structure
│   ├── test_exhibitions.sh # Tests exhibitions
│   └── README.md          # Scripts documentation
│
└── 📚 DOCS/
    └── DEVELOPMENT.md      # Development guide
```

## 🎯 Key Improvements

### ✅ **Clean Structure**

- Each exhibition has its own folder
- Responsive grid layout for homepage
- Clear separation between framework and exhibitions
- Development scripts organized separately
- Easy to navigate and maintain

### ✅ **URL Structure**

- **Homepage**: `https://dancing-cube.github.io/`
- **Exhibitions**: `https://dancing-cube.github.io/exhibitions/quantum-bounce/`
- **Framework**: Not directly accessible (internal use only)

### ✅ **File Organization**

- **`index.html`** in each exhibition folder for clean URLs
- **Framework files** centralized in `src/`
- **Legacy files** preserved for compatibility
- **Shared assets** in logical locations
- **Development scripts** in `scripts/` directory

### ✅ **Development Benefits**

- **Responsive grid layout**: 4x3 on large screens, adaptive on smaller
- **Easy to add new exhibitions**: Use creation scripts
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
