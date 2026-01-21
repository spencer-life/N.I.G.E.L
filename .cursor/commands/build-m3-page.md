# Build Material 3 Page

## Overview
Scaffold a complete Material Web (M3) page with proper imports, theming, and responsive layout.

## Reference
Before implementing, review `@docs/MATERIAL-WEB-REFERENCE.md` for component patterns and best practices.

## Steps
1. **Create page structure**
   - Set up HTML/JSX with semantic structure
   - Add proper DOCTYPE and meta tags for responsive design
   - Include Material Symbols font for icons

2. **Import Material Web components**
   - Import only needed components to keep bundle small
   - Use proper import paths from `@material/web`
   - Example: `import '@material/web/button/filled-button.js'`

3. **Apply Material Design tokens**
   - Use CSS custom properties for theming
   - Apply `--md-sys-color-*` tokens for colors
   - Use `--md-sys-typescale-*` tokens for typography
   - Apply `--md-sys-shape-*` tokens for shapes

4. **Create responsive layout**
   - Use flexbox/grid for layout
   - Ensure mobile-first responsive design
   - Consider breakpoints for tablet/desktop

## Component Checklist
- [ ] Top app bar (`<md-top-app-bar>`)
- [ ] Navigation (drawer or tabs)
- [ ] Main content area
- [ ] Action buttons (`<md-filled-button>`, `<md-fab>`)
- [ ] Input fields if needed (`<md-outlined-text-field>`)
- [ ] Material Symbols icons (`<md-icon>`)

## Theming
Ensure these tokens are defined in your CSS:
```css
:root {
  --md-sys-color-primary: #your-brand-color;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-surface: #ffffff;
  --md-sys-color-on-surface: #1c1b1f;
  --md-ref-typeface-brand: 'Roboto', sans-serif;
  --md-sys-shape-corner-medium: 8px;
}
```

## Best Practices
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test on multiple screen sizes
- Validate against Material Design guidelines
- Keep components tree-shakeable (import individually)
