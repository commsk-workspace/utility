# CSS Architecture — SKILL

## Overview
CSS architecture patterns: BEM naming, CSS Modules for scoping, and Tailwind CSS v4 for
utility-first styling. Modern CSS supports nesting, layers, container queries natively.

## Setup / Base Project
```bash
# Tailwind CSS v4 (Vite) — zero-config, CSS-first
npm install tailwindcss @tailwindcss/vite
# Add plugin to vite.config.ts, import in CSS: @import "tailwindcss"
# No tailwind.config.js needed — configure via @theme in CSS

# CSS Modules — built into Vite/Next.js/Nuxt (no install needed)
# Name files as *.module.css
```

## Core Concepts
- **Tailwind v4**: CSS-first config via `@theme {}`, no JS config file needed
- **Tailwind v4**: Automatic content detection, new `@utility` for custom utilities
- **Tailwind v4**: Native `@starting-style` and `@property` support for animations
- **BEM**: `.block__element--modifier` — predictable naming without tooling
- **CSS Modules**: Scoped class names via `import styles from './Comp.module.css'`
- **CSS Variables**: `--color-primary: #3b82f6` for theming, shared across approaches
- **Layers**: `@layer base, components, utilities` to control specificity
- **Nesting**: Native CSS nesting (`& .child {}`) — no preprocessor needed
- **`:has()` selector**: Parent selector, fully supported in modern browsers

## Common Patterns
```css
/* [css] Tailwind v4 theme customization */
@import "tailwindcss";
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-display: "Inter", sans-serif;
}
```

```css
/* [css] BEM with native nesting */
.card {
  border: 1px solid var(--color-border);
  & .card__title { font-weight: 700; }
  &.card--featured { border-color: var(--color-primary); }
}
```

```tsx
// [css] CSS Modules in React
import s from './Card.module.css'
const Card = ({ featured }) => (
  <div className={`${s.card} ${featured ? s.featured : ''}`}>...</div>
)
```

## Gotchas
- Tailwind v4: Config is now CSS-based `@theme` — no `tailwind.config.js`
- Tailwind v4: `@apply` still works but prefer utilities in markup
- CSS Modules: Cannot use global selectors without `:global()` wrapper
- BEM: Discipline required — no tooling enforces naming
- Native nesting uses `&` — identical to Sass nesting syntax
- Avoid mixing approaches in same component — pick one per project

## Security
- Never inject user input into CSS custom properties or `style` attributes without sanitization
- Avoid `url()` with user-controlled values — can leak data via external resource loading
- Use CSS Modules or scoped styles to prevent class name collision and style injection
- Set `Content-Security-Policy: style-src 'self'` to block injected stylesheets

## References
- https://tailwindcss.com/docs
- https://getbem.com
- https://github.com/css-modules/css-modules
