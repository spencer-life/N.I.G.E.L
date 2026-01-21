# Material Web Components (M3) Reference Guide

## Overview
This guide establishes **Material Web Components (M3)** as the standard design system for frontend projects. These components implement Google's Material Design 3 guidelines using standard Web Components, making them framework-agnostic (works with React, Vue, Svelte, or vanilla HTML).

**Official Documentation:** [material-web.dev](https://material-web.dev/)
**NPM Package:** `@material/web`

## 1. Installation

For production projects (Node.js/Bundler):
```bash
npm install @material/web
```

For rapid prototyping (CDN):
```html
<script type="importmap">
  {
    "imports": {
      "@material/web/": "https://esm.run/@material/web/"
    }
  }
</script>
<script type="module">
  import '@material/web/all.js';
</script>
```

## 2. Basic Usage

Import specific components to keep bundle size low (Recommended):

```typescript
// Import only what you need
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/textfield/outlined-text-field.js';
```

Use in HTML:

```html
<form>
  <md-outlined-text-field label="Email" type="email" required></md-outlined-text-field>
  
  <label>
    <md-checkbox touch-target="wrapper"></md-checkbox>
    Subscribe to newsletter
  </label>

  <div class="actions">
    <md-outlined-button type="reset">Reset</md-outlined-button>
    <md-filled-button type="submit">Submit</md-filled-button>
  </div>
</form>
```

## 3. Common Components Reference

| Component | Tag | Import Path |
|-----------|-----|-------------|
| **Button (Filled)** | `<md-filled-button>` | `@material/web/button/filled-button.js` |
| **Button (Outlined)** | `<md-outlined-button>` | `@material/web/button/outlined-button.js` |
| **Button (Text)** | `<md-text-button>` | `@material/web/button/text-button.js` |
| **Checkbox** | `<md-checkbox>` | `@material/web/checkbox/checkbox.js` |
| **Text Field** | `<md-outlined-text-field>` | `@material/web/textfield/outlined-text-field.js` |
| **Switch** | `<md-switch>` | `@material/web/switch/switch.js` |
| **Icon** | `<md-icon>` | `@material/web/icon/icon.js` |
| **List** | `<md-list>` | `@material/web/list/list.js` |
| **List Item** | `<md-list-item>` | `@material/web/list/list-item.js` |
| **Dialog** | `<md-dialog>` | `@material/web/dialog/dialog.js` |

## 4. Theming (CSS Tokens)

Material Web uses CSS custom properties (tokens) for styling. Define these in your root CSS.

```css
:root {
  /* Color Palette */
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-secondary: #625B71;
  
  /* Typography */
  --md-sys-typescale-body-large-font: 'Roboto', sans-serif;
  
  /* Shape */
  --md-sys-shape-corner-small: 4px;
  --md-sys-shape-corner-medium: 8px;
  --md-sys-shape-corner-large: 16px;
}
```

## 5. Icons Setup

Material Web Components work best with Material Symbols. Add this to your HTML `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

Usage:
```html
<md-icon>favorite</md-icon>
<md-filled-button>
  <md-icon slot="icon">send</md-icon>
  Send
</md-filled-button>
```

## 6. React Integration

Since these are Web Components, they work in React but require some handling for events.

```tsx
import React from 'react';
import '@material/web/button/filled-button.js';

// Setup type definitions for custom elements (TypeScript)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export const MyButton = () => (
  <md-filled-button onClick={() => console.log('clicked')}>
    Click Me
  </md-filled-button>
);
```
