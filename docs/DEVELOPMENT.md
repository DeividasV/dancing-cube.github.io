# Development Guide

## File Organization

### Directory Structure

- `/components/` - Reusable HTML components (navigation, headers, etc.)
- `/exhibitions/` - Individual exhibition HTML pages
- `/css/` - All stylesheets organized by component/page
- `/js/` - JavaScript files, one per exhibition plus shared utilities
- `/assets/` - Static assets (libraries, images, fonts, etc.)
- `/docs/` - Documentation files

### Naming Conventions

#### Files

- HTML files: `kebab-case.html` (e.g., `quantum-bounce.html`)
- CSS files: `kebab-case.css` matching the corresponding HTML file
- JavaScript files: `kebab-case.js` matching the corresponding HTML file
- Shared files: descriptive names (e.g., `shared-controls.js`, `top-menu.js`)

#### Exhibition Names

- Display names use leet-speak style: `QU4NTUM_B0UNC3`
- File names use kebab-case: `quantum-bounce`
- IDs use kebab-case: `quantum-bounce`

### Code Organization

#### CSS

- Each exhibition should have its own CSS file
- Shared styles go in `shared-navigation.css` and `top-menu.css`
- Main page uses `constellation-cards.css`

#### JavaScript

- Each exhibition has its own JS file for specific logic
- `top-menu.js` handles all navigation functionality
- `shared-controls.js` contains common utilities
- `constellation-cards.js` handles main page interactions

#### HTML

- All exhibitions use the same navigation component from `/components/top-menu.html`
- Each exhibition is self-contained in its own file
- Include required CSS and JS files in each exhibition page

## Adding New Exhibitions

1. Create HTML file in `/exhibitions/` directory
2. Create corresponding CSS file in `/css/` directory
3. Create corresponding JS file in `/js/` directory
4. Add exhibition to the main gallery in `index.html`
5. Update the exhibitions list in `package.json`
6. Update navigation order in `top-menu.js` if needed

## File Dependencies

### Required in every exhibition page:

- `../css/shared-navigation.css`
- `../css/top-menu.css`
- `../css/[exhibition-name].css`
- `../js/top-menu.js`
- `../js/[exhibition-name].js`

### Optional dependencies:

- `../js/shared-controls.js` (for common utilities)
- `../assets/lib/three.min.js` (for Three.js exhibitions)

## Best Practices

1. **Keep files focused**: Each file should have a single responsibility
2. **Use consistent naming**: Follow the established naming conventions
3. **Minimize dependencies**: Only include what's needed for each exhibition
4. **Document changes**: Update this guide when making structural changes
5. **Test navigation**: Ensure all exhibitions can navigate properly between each other
