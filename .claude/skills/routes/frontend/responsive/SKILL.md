# Responsive Design — SKILL

## Overview
Responsive design using mobile-first breakpoints, fluid typography, container queries,
and modern CSS layout (Grid + Flexbox). Target: mobile, tablet, desktop.

## Setup / Base Project
No install needed — native CSS features. For Tailwind responsive utilities:
```bash
# Tailwind v4 breakpoints are mobile-first: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
# Usage: className="text-sm md:text-base lg:text-lg"
# Custom: @theme { --breakpoint-3xl: 1920px; }
```

## Core Concepts
- **Mobile-first**: Base styles = mobile, add `min-width` media queries upward
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Container Queries**: `@container` — style based on parent size, not viewport
- **Fluid typography**: `clamp(1rem, 2.5vw, 2rem)` for smooth scaling
- **CSS Grid**: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- **Flexbox**: `flex-wrap` + `gap` for simple responsive layouts
- **`dvh` / `svh`**: Use `100dvh` instead of `100vh` for mobile viewport
- **`field-sizing: content`**: Auto-resize textareas to content (modern browsers)
- **`@media (prefers-color-scheme)`**: Respect system dark/light mode

## Common Patterns
```css
/* [responsive] mobile-first grid with container query */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* [responsive] container query for component-level responsiveness */
.card-wrapper { container-type: inline-size; }
@container (min-width: 400px) {
  .card { flex-direction: row; }
}
```

## Gotchas
- Always set `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `100vh` on mobile includes address bar — use `100dvh` instead
- Container queries require `container-type: inline-size` on parent
- Test on real devices — emulators miss touch, keyboard, and performance issues
- Avoid fixed widths (`width: 500px`) — use `max-width` or fluid units
- Tailwind v4: Custom breakpoints use `@theme` not `tailwind.config.js`

## References
- https://web.dev/responsive-web-design-basics
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
- https://utopia.fyi
