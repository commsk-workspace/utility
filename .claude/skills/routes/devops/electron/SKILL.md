# Electron — SKILL

## Overview
Desktop application framework using Chromium + Node.js. Electron 34+ with
main/renderer process architecture, context-isolated IPC, and secure packaging.

## Setup / Base Project
```bash
# Recommended: electron-vite for modern scaffolding
npm create electron-vite@latest my-app
# Or manual setup
npm init -y
npm install electron@latest --save-dev
npm install electron-builder --save-dev   # packaging
```

## Core Concepts
- **Main process**: Node.js runtime — manages windows, system APIs, IPC handlers, app lifecycle
- **Renderer process**: Chromium page — runs UI (React/Vue/Svelte), sandboxed by default
- **Preload script**: bridge between main and renderer via `contextBridge.exposeInMainWorld`
- **Context Isolation**: always `true` — renderer cannot access Node.js directly
- **IPC**: `ipcMain.handle` / `ipcRenderer.invoke` for async request-response
- **electron-vite**: HMR for renderer + main process, ESM support, fast dev experience

## Common Patterns
```javascript
// preload.js — expose safe API to renderer
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  onUpdate: (cb) => ipcRenderer.on('update-available', (_e, info) => cb(info)),
});
```
```javascript
// main.js — handle IPC in main process
const { app, BrowserWindow, ipcMain } = require('electron');
ipcMain.handle('read-file', async (_event, filePath) => {
  const fs = require('fs/promises');
  return fs.readFile(filePath, 'utf-8');
});
```

## Gotchas
- Never disable `contextIsolation` or `sandbox` — major security risk
- Never use `nodeIntegration: true` in renderer — use preload + contextBridge
- Use `electron-builder` or `@electron-forge/cli` for cross-platform packaging
- Auto-update: use `electron-updater` with code-signed releases
- Test on all target OS — native behaviors differ (menu, tray, notifications)
- Electron 34+ drops support for older OS versions — check release notes

## Security
- Always keep `contextIsolation: true` and `sandbox: true` — never disable for convenience
- Never set `nodeIntegration: true` in renderer — use preload + `contextBridge` exclusively
- Set strict CSP in `BrowserWindow` options: `content-security-policy: default-src 'self'`
- Do not use `@electron/remote` module — it re-enables dangerous cross-process access
- Always use latest stable Electron version — run `npm audit` and electron security checklist before release

## References
- https://www.electronjs.org/docs/latest/
- https://electron-vite.org/
- https://www.electron.build/
