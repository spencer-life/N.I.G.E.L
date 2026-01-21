# Audit Material 3 Styles

## Overview
Review current file for Material Design 3 compliance and suggest improvements to align with M3 standards.

## Reference
Check against `@docs/MATERIAL-WEB-REFERENCE.md` for correct patterns.

## Audit Categories

### 1. Component Usage
**Check for:**
- [ ] Standard HTML elements that should be M3 components
  - `<button>` → `<md-filled-button>` or `<md-outlined-button>`
  - `<input>` → `<md-outlined-text-field>`
  - `<checkbox>` → `<md-checkbox>`
  - `<select>` → `<md-select>`

**Action:** Suggest M3 component replacements with proper imports

### 2. Color Usage
**Check for:**
- [ ] Hardcoded hex colors (`#6750A4`)
- [ ] RGB/RGBA values
- [ ] Named colors (`blue`, `red`)

**Replace with M3 tokens:**
- `--md-sys-color-primary`
- `--md-sys-color-secondary`
- `--md-sys-color-surface`
- `--md-sys-color-error`
- `--md-sys-color-on-*` variants

### 3. Typography
**Check for:**
- [ ] Hardcoded font sizes
- [ ] Font weight values
- [ ] Line height values

**Replace with M3 tokens:**
- `--md-sys-typescale-headline-large`
- `--md-sys-typescale-body-medium`
- `--md-sys-typescale-label-small`

### 4. Spacing & Shape
**Check for:**
- [ ] Hardcoded border-radius values
- [ ] Non-standard spacing

**Replace with M3 tokens:**
- `--md-sys-shape-corner-small` (4px)
- `--md-sys-shape-corner-medium` (8px)
- `--md-sys-shape-corner-large` (16px)

### 5. Icons
**Check for:**
- [ ] Non-Material icon fonts
- [ ] SVG icons that could be Material Symbols
- [ ] Missing icon imports

**Action:** Suggest Material Symbols Outlined

## Output Format
Provide a detailed report with:
1. Issues found (categorized)
2. Specific line numbers
3. Recommended changes with code examples
4. Priority (high/medium/low)

## Example Improvements
```typescript
// Before
<button style="background: #6750A4; border-radius: 12px;">
  Click me
</button>

// After
import '@material/web/button/filled-button.js';

<md-filled-button>
  Click me
</md-filled-button>

// CSS
.custom-button {
  --md-filled-button-container-color: var(--md-sys-color-primary);
  --md-filled-button-container-shape: var(--md-sys-shape-corner-medium);
}
```
