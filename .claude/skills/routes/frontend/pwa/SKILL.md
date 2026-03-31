# PWA — SKILL

## Overview
Progressive Web Apps: installable web apps with offline support, push notifications,
and native-like experience. Built on Service Worker, Web App Manifest, and Cache API.

## Setup / Base Project
```bash
# Vite PWA plugin (works with React/Vue/Svelte)
npm install -D vite-plugin-pwa

# Workbox 7 (manual setup)
npm install workbox-core workbox-precaching workbox-routing workbox-strategies
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [VitePWA({ registerType: 'autoUpdate' })],
})
```

## Core Concepts
- **Web App Manifest**: `manifest.json` — name, icons, theme_color, start_url, display
- **Service Worker**: Background script for caching, offline, push notifications
- **Workbox 7 strategies**: CacheFirst (assets), NetworkFirst (API), StaleWhileRevalidate
- **Precaching**: Cache app shell at install time for instant offline load
- **Push notifications**: VAPID keys, Notification API + Push API (iOS 16.4+ supported)
- **Install prompt**: `beforeinstallprompt` event for custom install button
- **Background Sync**: Retry failed network requests when back online
- **Periodic Background Sync**: Refresh content in background (limited browser support)
- **`display_override`**: Prefer `["window-controls-overlay", "standalone"]` for desktop PWA

## Common Patterns
```ts
// [pwa] workbox runtime caching for API
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })],
  })
)
```

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"],
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Gotchas
- Service worker only works on HTTPS (and localhost for dev)
- Cache updates require a new SW version — users may see stale content
- `skipWaiting()` can break in-flight requests — prefer `autoUpdate` with prompt
- iOS Safari: Push notifications supported since 16.4, but no Background Sync
- Always include a 512x512 maskable icon for Android adaptive icons
- Test offline mode in DevTools > Application > Service Workers > Offline

## Security
- HTTPS is mandatory — service workers refuse to register on insecure origins
- Set strict CSP headers for service worker scope — prevent script injection in cached responses
- Validate cached responses before use — stale or poisoned cache can serve malicious content
- Use `integrity` hashes for precached assets to detect tampering
- Always use latest stable Workbox version — run `npm audit` before deploy

## References
- https://web.dev/learn/pwa
- https://developer.chrome.com/docs/workbox
- https://vite-pwa-org.netlify.app
