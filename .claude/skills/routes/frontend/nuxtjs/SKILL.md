# Nuxt.js — SKILL

## Overview
Nuxt 3.x (stable) — full-stack Vue 3 framework with Nitro server engine, file-based routing,
auto-imports, and SSR/SSG/ISR support. Nuxt 4 compatibility available via `compatibilityVersion: 4`.

## Setup / Base Project
```bash
npx nuxi@latest init my-app
cd my-app && npm install
npm run dev
```

## Core Concepts
- **File routing**: `pages/` directory auto-generates routes
- **Auto-imports**: Components, composables, and utils are auto-imported
- **`useFetch` / `useAsyncData`**: SSR-friendly data fetching with caching and deduplication
- **`$fetch`**: Universal fetch powered by ofetch — use for client-only or server-to-server calls
- **Server routes**: `server/api/` directory for backend endpoints (Nitro)
- **Layouts**: `layouts/default.vue`, switchable per page via `definePageMeta`
- **Middleware**: `middleware/` for route guards (named, inline, or global)
- **State**: `useState()` for SSR-safe shared state, or Pinia for complex state
- **Nuxt 4 compat**: Set `compatibilityVersion: 4` in nuxt.config to opt into v4 defaults early
- **Nuxt 4 changes**: New `app/` folder structure, `data-clear()` pattern, stricter cookie handling

## Common Patterns
```vue
<!-- pages/users.vue -->
<script setup lang="ts">
// [nuxtjs] SSR-friendly data fetching with status
const { data: users, status } = await useFetch('/api/users')
</script>
<template>
  <div v-if="status === 'pending'">Loading...</div>
  <ul v-else><li v-for="u in users" :key="u.id">{{ u.name }}</li></ul>
</template>
```

```ts
// server/api/users.get.ts — Nitro API route
export default defineEventHandler(async () => {
  return [{ id: 1, name: 'Alice' }]
})
```

## Gotchas
- `useFetch` must be called at top level of `<script setup>` (not inside callbacks)
- `useState` key must be unique across the app — use prefix convention
- `server/` code never ships to client — safe for secrets
- Auto-imports can confuse IDE — run `nuxi prepare` to generate types
- Use `$fetch` for client-side only calls, `useFetch` for SSR-safe calls
- Nuxt 4 moves pages/layouts/components into `app/` subfolder — plan migration early

## Security
- Set CSP headers via `nuxt-security` module or Nitro middleware — block XSS vectors
- Validate all inputs in `server/api/` routes — never trust client data in Nitro handlers
- Protect against CSRF — use `nuxt-security` module for automatic CSRF token handling
- Keep secrets in `runtimeConfig` (server-only) — never in `publicRuntimeConfig`
- Always use latest stable Nuxt version — run `npm audit` before deploy

## References
- https://nuxt.com/docs
- https://nitro.unjs.io
