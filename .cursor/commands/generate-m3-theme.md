# Generate Material 3 Theme

## Overview
Create a complete Material Design 3 theme based on a primary color, generating all color roles, typography tokens, and shape tokens.

## Reference
See `@docs/MATERIAL-WEB-REFERENCE.md` for token usage and implementation.

## Steps

### 1. Color System
Based on the provided primary color, generate the full Material Design 3 color system:

#### Primary Colors
- `--md-sys-color-primary` - Main brand color
- `--md-sys-color-on-primary` - Text/icons on primary
- `--md-sys-color-primary-container` - Subdued primary
- `--md-sys-color-on-primary-container` - Text on primary container

#### Secondary Colors
- `--md-sys-color-secondary` - Accent color
- `--md-sys-color-on-secondary` - Text/icons on secondary
- `--md-sys-color-secondary-container` - Subdued secondary
- `--md-sys-color-on-secondary-container` - Text on secondary container

#### Tertiary Colors
- `--md-sys-color-tertiary` - Complementary accent
- `--md-sys-color-on-tertiary` - Text/icons on tertiary
- `--md-sys-color-tertiary-container` - Subdued tertiary
- `--md-sys-color-on-tertiary-container` - Text on tertiary container

#### Surface Colors
- `--md-sys-color-surface` - Default surface
- `--md-sys-color-on-surface` - Text/icons on surface
- `--md-sys-color-surface-variant` - Subtle surface
- `--md-sys-color-on-surface-variant` - Text on surface variant

#### Utility Colors
- `--md-sys-color-error` - Error state
- `--md-sys-color-on-error` - Text on error
- `--md-sys-color-outline` - Borders and dividers
- `--md-sys-color-shadow` - Shadows and elevation

### 2. Typography Scale
Generate the full typographic scale:

#### Display
- `headline-large` - 32px, 400 weight
- `headline-medium` - 28px, 400 weight
- `headline-small` - 24px, 400 weight

#### Body
- `body-large` - 16px, 400 weight
- `body-medium` - 14px, 400 weight
- `body-small` - 12px, 400 weight

#### Labels
- `label-large` - 14px, 500 weight
- `label-medium` - 12px, 500 weight
- `label-small` - 11px, 500 weight

### 3. Shape Tokens
Define corner radius tokens:
- `--md-sys-shape-corner-extra-small` - 4px
- `--md-sys-shape-corner-small` - 8px
- `--md-sys-shape-corner-medium` - 12px
- `--md-sys-shape-corner-large` - 16px
- `--md-sys-shape-corner-extra-large` - 28px

### 4. Elevation
Define elevation levels (0-5) with appropriate shadows

## Output Format

Generate a complete CSS file with:
1. Light theme (default)
2. Dark theme (in `@media (prefers-color-scheme: dark)`)
3. Typography tokens
4. Shape tokens
5. Usage examples

## Example Structure
```css
:root {
  /* === Color System === */
  /* Primary */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  
  /* Surface */
  --md-sys-color-surface: #FFFBFE;
  --md-sys-color-on-surface: #1C1B1F;
  
  /* === Typography === */
  --md-sys-typescale-headline-large-size: 32px;
  --md-sys-typescale-body-medium-size: 14px;
  
  /* === Shape === */
  --md-sys-shape-corner-medium: 12px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-primary: #D0BCFF;
    --md-sys-color-surface: #1C1B1F;
  }
}
```

## Accessibility Considerations
- Ensure all color pairs meet WCAG AA contrast (4.5:1)
- Primary/on-primary must be readable
- Surface/on-surface must be readable
- Error states must be distinguishable

## Brand Customization
Allow customization of:
- Typeface families (brand, plain, monospace)
- Shape corner radii
- Color tone adjustments for brand alignment
