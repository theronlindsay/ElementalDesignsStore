## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Editing:

### Codebase Structure:

```
src/
├── app.d.ts                    # TypeScript declarations for SvelteKit app
├── app.html                    # HTML template for the app shell
├── app.scss                    # 🎨 Universal theme & global styles (SCSS)
│                               #    - SCSS variables (colors, spacing, breakpoints)
│                               #    - CSS custom properties (:root)
│                               #    - Global styles (body, layouts, components)
│                               #    - Utility classes (.theme-glass)
│                               #    - Responsive design (@media queries)
│
├── lib/                        # Reusable components (Make reusable components PLEASE)
│   ├── index.js               # Library exports, add any new components to this list 
│   ├── Button.svelte          # Reusable button component with variants
│   │                          #    - Props: variant, size, type, ariaLabel
│   │                          #    - Variants: default, ghost, primary
│   │                          #    - Uses theme.scss colors
│   │
│   ├── Navbar.svelte          # Responsive navigation component
│   │                          #    - Desktop, Wrapped (≤936px), Mobile (≤450px)
│   │                          #    - Animated selector for active nav item
│   │                          #    - Search bar & account/cart buttons
│   │                          #    - SCSS with breakpoint variables
│   │
│   ├── Footer.svelte          # Footer component
│   │                          #    - Newsletter signup
│   │                          #    - Links and social media
│   │
│   ├── CartItem.svelte        # Shopping cart item component
│   │                          #    - Props: item, onUpdateQuantity, onRemove
│   │                          #    - Quantity controls with +/- buttons
│   │                          #    - Responsive grid layout
│   │
│   ├── CartSummary.svelte     # Cart order summary component
│   │                          #    - Props: subtotal, shipping, tax
│   │                          #    - Calculates total automatically
│   │                          #    - Sticky positioning on desktop
│   │
│   ├── EmptyCart.svelte       # Empty cart state component
│   │                          #    - Shows when cart has no items
│   │                          #    - Call-to-action to start shopping
│   │
│   └── assets/                # Static assets (images, icons)
│       ├── favicon.svg        # Site favicon
│       ├── Logo.png           # Main logo with background
│       └── LogoTransparent.png # Transparent logo for navbar
│
└── routes/                     # SvelteKit file-based routing
    ├── +layout.svelte         # Root layout (wraps all pages)
    │                          #    - Imports app.scss globally
    │                          #    - Contains footer component
    │                          #    - Sets up Font Awesome icons
    │
    ├── +page.svelte           # HOMEPAGE(route: /)
    │                          #    - Hero section
    │                          #    - Content grid (events, custom orders)
    │                          #    - Categories showcase
    │
    ├── page.svelte.spec.js    # Unit tests for homepage
    │
    ├── about/
    │   └── +page.svelte       # About page (route: /about)
    │                          #    - Company story and values
    │                          #    - Meet the maker section
    │
    └── cart/
        └── +page.svelte       # Shopping cart page (route: /cart)
                               #    - Uses CartItem, CartSummary, EmptyCart components
                               #    - Quantity management and item removal
                               #    - Promo code input
                               #    - Order summary with tax/shipping
  
```

#### Key Files Explained:

**`app.scss`** - Single source of truth for all styling

- Contains both SCSS variables (compile-time) and CSS variables (runtime)
- Organized sections: Variables, Utility Classes, Global Styles, Components
- Fully responsive with mobile-first approach
- See `THEME-GUIDE.md` for complete documentation

**`lib/Button.svelte`** - Reusable button component

- Accepts props for customization (variant, size, type)
- Automatically forwards additional props via `$$restProps`
- Styled with theme colors for consistency

**`lib/Navbar.svelte`** - Main navigation

- Responsive design with three breakpoint modes
- Animated selector that follows active nav item
- Desktop: Full navbar with search and actions
- Wrapped (≤936px): Search bar centers below nav items
- Mobile (≤450px): Hamburger menu with collapsible nav

**`routes/+layout.svelte`** - Root layout wrapper

- Imports global styles and Font Awesome
- Contains footer that appears on all pages
- Renders child pages via `{@render children?.()}`

**`routes/+page.svelte`** - Homepage

- Includes Navbar component
- Hero section with call-to-action
- Event listings and custom order information
- Category grid showcase

#### CSS:

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment. We will be using Node.js and deploying on a VPS
