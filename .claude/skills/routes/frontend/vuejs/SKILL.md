# Vue.js — SKILL

## Overview
Vue 3.5+ with Composition API and `<script setup>` SFC syntax. Reactive, progressive framework.
Ecosystem: Vue Router 4, Pinia 2 (state), VueUse (composables), Vite 6.

## Setup / Base Project
```bash
npm create vue@latest my-app
cd my-app && npm install
npm run dev
```
Prompts let you pick TypeScript, Router, Pinia, ESLint, Prettier.

## Core Concepts
- **`<script setup>`** — default SFC style, auto-exposes to template
- **Reactivity**: `ref()`, `reactive()`, `computed()`, `watch()`, `watchEffect()`
- **Vue 3.5**: `useId()`, `useTemplateRef()`, `Teleport` deferred, improved SSR hydration
- **Vue 3.5**: Reactive props destructure with defaults (stable, no longer experimental)
- **Props/Emits**: `defineProps<{}>()`, `defineEmits<{}>()` with TS generics
- **defineModel**: Two-way binding for custom components (stable in 3.4+)
- **Composables**: `use*` functions to extract reusable logic
- **Pinia**: `defineStore()` with `state`, `getters`, `actions` — official state management
- **Provide/Inject**: Dependency injection across component tree

## Common Patterns
```vue
<script setup lang="ts">
// [vuejs] composable with reactive state and defineModel
import { ref, onMounted } from 'vue'

const users = ref<User[]>([])
const loading = ref(true)

onMounted(async () => {
  users.value = await fetch('/api/users').then(r => r.json())
  loading.value = false
})
</script>
<template>
  <div v-if="loading">Loading...</div>
  <ul v-else><li v-for="u in users" :key="u.id">{{ u.name }}</li></ul>
</template>
```

## Gotchas
- `ref` needs `.value` in script, but NOT in template
- `reactive()` loses reactivity on destructure — use `toRefs()` or stick with `ref()`
- `watch` on reactive object is deep by default; `watch` on ref is shallow
- Avoid `v-if` and `v-for` on same element — wrap in `<template>`
- Vapor mode (compile-time reactivity, no vDOM) is experimental — not production-ready yet

## Security
- Never use `v-html` with unsanitized user input — use DOMPurify if dynamic HTML is required
- Set Content-Security-Policy headers to block inline scripts and XSS vectors
- Validate all user input client-side (for UX) and server-side (for security)
- Avoid exposing sensitive data in Pinia stores that persist to localStorage
- Always use latest stable Vue version — run `npm audit` before deploy

## References
- https://vuejs.org
- https://pinia.vuejs.org
- https://vueuse.org
