# UX/UI Design Systems — SKILL

## Overview
Design system fundamentals: component states, accessibility (a11y), and consistent
UI patterns. Focus on WCAG 2.2 AA compliance and predictable user experience.

## Setup / Base Project
```bash
# Icon libraries (pick one — never use emoji in UI)
npm install lucide-react        # React
npm install @iconify/vue         # Vue

# Headless UI for accessible primitives
npm install @radix-ui/react-dialog   # React (Radix)
npm install radix-vue                 # Vue (Radix Vue / Reka UI)
```

## Core Concepts
- **Component states**: Loading, Empty, Error, Success — design ALL four always
- **Accessibility**: Semantic HTML, ARIA roles, keyboard navigation, focus management
- **Color contrast**: Minimum 4.5:1 for text, 3:1 for large text (WCAG 2.2 AA)
- **Design tokens**: CSS variables for colors, spacing, typography, radii
- **Form UX**: Inline validation errors below input, clear labels, disabled state
- **Feedback**: Toast/snackbar for actions, skeleton loaders, optimistic updates
- **Motion**: `prefers-reduced-motion` media query — respect user preferences
- **Popover API**: Native `<dialog>` and `popover` attribute — less JS needed
- **View Transitions API**: Smooth page/state transitions with `document.startViewTransition()`
- **Inert attribute**: `inert` on background content when modal is open — native focus trap

## Common Patterns
```tsx
// [uxui] accessible button with loading state
function SubmitButton({ loading, children }) {
  return (
    <button type="submit" disabled={loading} aria-busy={loading}>
      {loading ? <Spinner aria-hidden="true" /> : null}
      {loading ? 'Saving...' : children}
    </button>
  );
}
```

```css
/* [uxui] respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Gotchas
- Never use color alone to convey information — add icons or text
- `div` and `span` are not interactive — use `button` or `a` for clickable elements
- Modals: prefer `<dialog>` element or `inert` attribute over manual focus trapping
- Toast messages must have `role="status"` or `aria-live="polite"`
- Never remove focus outlines without providing an alternative (`:focus-visible`)
- `popover` attribute is supported in all modern browsers — prefer over custom dropdowns

## References
- https://www.w3.org/WAI/WCAG22/quickref
- https://www.radix-ui.com
- https://www.a11yproject.com/checklist
