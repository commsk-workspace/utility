# Cocos Creator — SKILL

## Overview
Open-source game engine for 2D/3D games. TypeScript-based with visual editor.
Cocos Creator 3.8+ supports native builds (iOS, Android, Web, Mini Games) from one codebase.

## Setup / Base Project
```
1. Download Cocos Dashboard from https://www.cocos.com/en/creator-download
2. Install Cocos Creator 3.8+ via Dashboard
3. New Project > Empty (3D) or 2D template
4. Scripts: right-click Assets > Create > TypeScript > NewComponent
5. Build: Project > Build > Select platform > Build
```

## Core Concepts
- **Node + Component** — Node is transform/hierarchy; Components add behavior (like Unity)
- **Lifecycle** — `onLoad()` > `start()` > `update(dt)` > `lateUpdate(dt)` > `onDestroy()`
- **Scene management** — `director.loadScene("sceneName")` for scene transitions
- **Prefabs** — Reusable node templates; instantiate with `instantiate(prefab)`
- **UI** — Canvas + Widget for layout; Label, Sprite, Button, ScrollView, Layout
- **Asset bundles** — `assetManager.loadBundle()` for modular asset loading (replaces `resources.load()` for large projects)
- **Tween system** — `tween(node).to(1, { position: v3(100,0,0) }).start()` for animations
- **Physics** — Built-in 2D (Box2D) and 3D (Bullet/PhysX) physics engines

## Common Patterns
```typescript
// [movement] Basic component with input
import { _decorator, Component, Vec3, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property speed = 5;
    private direction = new Vec3();
    update(dt: number) {
        this.node.translate(this.direction.clone().multiplyScalar(this.speed * dt));
    }
}
```
```typescript
// [scene] Load scene and instantiate prefab
import { director, instantiate, Prefab, _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab) enemyPrefab: Prefab = null!;
    spawnEnemy() { const e = instantiate(this.enemyPrefab); this.node.addChild(e); }
    loadMenu() { director.loadScene('MainMenu'); }
}
```

## Gotchas
- Always use `_decorator` (`@ccclass`, `@property`) — otherwise editor won't detect components
- `@property` must specify type for non-primitives: `@property(Node)`, `@property(Prefab)`
- Use `this.schedule()` / `this.unschedule()` instead of `setInterval`
- `NodePool` for frequently spawned/despawned objects to avoid GC spikes
- `GameManager` must extend `Component` to be attachable to nodes

## Security
- Server-authoritative for all game-critical logic — client handles rendering only
- Validate all network messages on server — never trust client-submitted scores or inventory changes
- Encrypt sensitive assets (game data, config) — Cocos asset bundles are easily extractable
- Never embed API keys in TypeScript source — use server proxy for external services
- Enable build-time code minification and consider additional obfuscation for web builds

## References
- https://docs.cocos.com/creator/3.8/manual/en
- https://docs.cocos.com/creator/3.8/api/en
