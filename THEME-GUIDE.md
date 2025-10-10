# Elemental Designs Store - Theme Guide

## Overview

All styles have been consolidated into a single SCSS file: `src/app.scss`

This file contains:

- **Universal SCSS Variables** - For compile-time optimization
- **CSS Variables (Custom Properties)** - For runtime theming
- **All global styles** - Body, layouts, components, responsive design
- **Utility classes** - Reusable helper classes

## File Structure

```
src/
├── app.scss           # 🎨 SINGLE SOURCE OF TRUTH for all styles
├── routes/
│   └── +layout.svelte # Imports app.scss globally <-- exists in all components below
└── lib/
    ├── Button.svelte  # Imports app.scss and local <styles> tag
    └── Navbar.svelte  # Imports app.scss and local <styles> tag
```

## SCSS Variables

### Colors

```scss
$bg-primary: #1a1625;          // Main background
$bg-secondary: #2a2438;        // Secondary background
$bg-panel: rgba(26, 22, 37, 0.6);  // Panel backgrounds
$bg-nav: rgba(42, 36, 56, 0.8);    // Navbar background

$border-primary: #3d3650;      // Primary borders
$border-secondary: #4a4560;    // Secondary borders
$border-accent: #6b5d7a;       // Accent borders

$text-primary: #f3f4f6;        // Primary text
$text-secondary: #e8e4f3;      // Secondary text
$text-muted: #d1d5db;          // Muted text
$text-muted-2: #9ca3af;        // More muted text
$text-muted-3: #94a3b8;        // Most muted text

$accent-primary: #a78bfa;      // Primary accent (purple)
$accent-secondary: #8b5cf6;    // Secondary accent (darker purple)
```

### Spacing

```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px
$spacing-3xl: 4rem;     // 64px
```

### Border Radius

```scss
$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 50%;
```

### Shadows

```scss
$shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.3);
$shadow-md: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
$shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
$shadow-accent: 0 10px 25px -5px rgba(167, 139, 250, 0.4);
$shadow-accent-sm: 0 10px 25px -5px rgba(167, 139, 250, 0.2);
```

### Transitions

```scss
$transition-fast: 0.18s ease;
$transition-normal: 0.3s ease;
$transition-slow: 0.5s ease;
```

### Breakpoints

```scss
$mobile-breakpoint: 400px;
$tablet-breakpoint: 768px;
$wrap-breakpoint: 936px;
$desktop-breakpoint: 1200px;
```

## CSS Variables (Runtime)

These are also defined in `app.scss` under `:root` and can be changed dynamically:

```css
:root {
  --bg-primary: #1a1625;
  --bg-secondary: #2a2438;
  --bg-panel: rgba(26, 22, 37, 0.6);
  --nav-bg: rgba(42, 36, 56, 0.8);
  
  --border-primary: #3d3650;
  --border-secondary: #4a4560;
  --panel-border: #4a4560;
  
  --text-primary: #f3f4f6;
  --text-secondary: #e8e4f3;
  --muted: #d1d5db;
  --muted-2: #9ca3af;
  
  --accent: #a78bfa;
  --accent-2: #8b5cf6;
  
  --nav-padding: 6px;
  --nav-gap: 4px;
  
  --glass-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

## Usage Examples

### Using SCSS Variables in Components

```svelte
<style lang="scss">
  @import '../app.scss';

  .my-component {
    background: $bg-panel;
    padding: $spacing-lg;
    border-radius: $radius-md;
    transition: all $transition-normal;
  
    @media (max-width: $tablet-breakpoint) {
      padding: $spacing-md;
    }
  }
</style>
```

### Using CSS Variables (Runtime)

```svelte
<style>
  .my-component {
    background: var(--bg-panel);
    color: var(--muted);
    border: 1px solid var(--panel-border);
  }
  
  .my-component:hover {
    border-color: var(--accent);
  }
</style>
```

### Using Utility Classes

```svelte
<div class="theme-glass">
  <!-- This div will have panel styling with glass effect -->
</div>
```

## Responsive Design

All breakpoints use mobile-first approach:

```scss
// Mobile (≤400px) - base styles

@media (max-width: $tablet-breakpoint) {
  // Tablet adjustments (≤768px)
}

@media (max-width: $wrap-breakpoint) {
  // Wrapped mode (≤936px)
}

// Desktop (>936px) - default styles
```

## When to Use SCSS Variables vs CSS Variables

### Use SCSS Variables ($var) when:

- ✅ Value is known at compile time
- ✅ Need to use in media queries
- ✅ Need calculations (darken, lighten, etc.)
- ✅ Performance is critical (pre-compiled)

### Use CSS Variables (--var) when:

- ✅ Value might change at runtime
- ✅ Need to create theme switchers
- ✅ Want to inherit values in nested elements
- ✅ Need to change via JavaScript

## Color Palette

### Primary Colors

- **Background**: Dark purple-grey (#1a1625)
- **Accent**: Light purple (#a78bfa)
- **Accent Dark**: Deep purple (#8b5cf6)

### Text Colors

- **Primary**: Near white (#f3f4f6)
- **Secondary**: Light grey (#e8e4f3)
- **Muted**: Medium grey (#d1d5db)

### Border Colors

- **Primary**: Dark grey (#3d3650)
- **Secondary**: Medium grey (#4a4560)
- **Accent**: Purple-grey (#6b5d7a)

## Best Practices

1. **Always import app.scss in component styles** - This gives you access to all variables
2. **Use SCSS variables for breakpoints** - They work in media queries
3. **Use CSS variables for colors** - They can be themed dynamically
4. **Prefer utility classes** - Use `.theme-glass` instead of repeating styles
5. **Keep responsive** - Test at 400px, 768px, and 936px breakpoints
6. **Use spacing variables** - Don't hardcode padding/margin values

## Migration Notes

The following files have been consolidated into `app.scss`:

- ❌ `src/app.css` (removed)
- ❌ `src/lib/theme.css` (removed)
- ✅ `src/app.scss` (NEW - single source of truth)

All components now import from `app.scss` instead of the old files.
