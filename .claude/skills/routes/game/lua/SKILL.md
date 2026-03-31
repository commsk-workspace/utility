# Lua — SKILL

## Overview
Lightweight embeddable scripting language. Lua 5.4 adds integers and generational GC.
Luau (Roblox fork) adds type annotations and type inference. Love2D 11.5+ for 2D games, OpenResty for web/APIs.

## Setup / Base Project
```bash
sudo apt install lua5.4    # Linux (brew install lua on macOS)
# Love2D: download from https://love2d.org — run with: love .
# OpenResty: install from https://openresty.org — nginx + LuaJIT
# Luau: https://github.com/luau-lang/luau — standalone CLI available
```

## Core Concepts
- **Tables** — Only data structure: array, dict, object, module — all are tables
- **Metatables** — `setmetatable(t, mt)` for operator overloading, OOP, proxy patterns
- **Coroutines** — `coroutine.create/resume/yield` for cooperative multitasking
- **1-indexed** — Arrays start at 1, `#t` returns length, `ipairs` for sequential iteration
- **Closures** — Functions are first-class; upvalues captured by reference
- **Luau extras** — Type annotations, `if-then` expressions, string interpolation, generalized iteration
- **Generational GC** — Lua 5.4 uses generational GC by default; tune with `collectgarbage("generational")`

## Common Patterns
```lua
-- [oop] Class pattern with metatables
local Entity = {}
Entity.__index = Entity
function Entity.new(name: string, hp: number)
    return setmetatable({ name = name, hp = hp }, Entity)
end
function Entity:takeDamage(dmg: number)
    self.hp = math.max(0, self.hp - dmg)
end
```
```lua
-- [love2d] Minimal game loop
function love.load()
    player = { x = 400, y = 300, speed = 200 }
end
function love.update(dt)
    if love.keyboard.isDown("right") then player.x = player.x + player.speed * dt end
end
function love.draw()
    love.graphics.circle("fill", player.x, player.y, 16)
end
```

## Gotchas
- `nil` in tables breaks `#` length operator — use manual count or `table.move`
- String indexing does not exist — use `string.sub(s, i, i)` or `s:sub(i, i)`
- Global by default — always use `local` to avoid polluting `_G`
- Lua 5.4 has integer subtype but `/` division still returns float; use `//` for integer division
- In Luau, use `task.spawn`/`task.defer`/`task.delay` instead of legacy `spawn`/`delay`/`wait`

## Security
- Sandbox untrusted code — restrict `os`, `io`, `loadfile`, `dofile` via custom environment tables
- Validate all external input — Lua's dynamic typing makes it easy to pass unexpected types
- Use `setfenv` (5.1) or `_ENV` (5.2+) to isolate script execution environments
- In OpenResty, sanitize all user input before SQL/template interpolation — use parameterized queries
- Never use `loadstring()` / `load()` on user-provided strings without strict sandboxing

## References
- https://www.lua.org/manual/5.4
- https://luau-lang.org
- https://love2d.org/wiki/Main_Page
- https://openresty.org/en/getting-started.html
