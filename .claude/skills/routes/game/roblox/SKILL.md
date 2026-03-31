# Roblox — SKILL

## Overview
Game platform using Roblox Studio and Luau (typed Lua variant). Server-authoritative architecture
with client-server split. Free to publish, monetized via Robux and Developer Exchange.

## Setup / Base Project
```
1. Download Roblox Studio from https://create.roblox.com
2. File > New > Baseplate (or choose template)
3. Scripts go in ServerScriptService (server) or StarterPlayerScripts (client)
4. Test with Play (F5) or Start (F8) for client-server split testing
5. Enable type checking: --!strict at top of every script
```

## Core Concepts
- **Client-Server** — `LocalScript` (client), `Script` (server); never trust client
- **RemoteEvent / RemoteFunction** — Fire from client, handle on server; validate all inputs server-side
- **DataStore v2** — `DataStoreService:GetDataStore()` for persistent data; always use pcall
- **MemoryStoreService** — Ephemeral shared data (leaderboards, matchmaking); auto-expires
- **Luau types** — `type Player = { Name: string, Score: number }`; use `--!strict` mode
- **Services** — `Players`, `ReplicatedStorage`, `ServerStorage`, `RunService`, `UserInputService`
- **Instances** — Everything is an Instance; use `Instance.new()`, `:Clone()`, `:Destroy()`

## Common Patterns
```lua
-- [data] Save/load player data with DataStore
local DataStore = game:GetService("DataStoreService"):GetDataStore("PlayerData")
local function loadData(player: Player): number
    local ok, data = pcall(DataStore.GetAsync, DataStore, "user_" .. player.UserId)
    return if ok and data then data else 0
end
```
```lua
-- [network] RemoteEvent server-side validation
local remote = game.ReplicatedStorage:WaitForChild("PurchaseEvent")
remote.OnServerEvent:Connect(function(player, itemId)
    if typeof(itemId) ~= "string" then return end -- [security] type check
    if not Items[itemId] then return end -- [security] reject invalid input
    processPurchase(player, itemId)
end)
```

## Gotchas
- Never use `DataStore` from client — server only
- Always wrap DataStore calls in `pcall` — they can fail due to throttling
- `WaitForChild` with timeout to avoid infinite yields: `WaitForChild("X", 5)`
- RemoteEvents can be spoofed — validate every argument type and value on server
- Use `task.spawn` / `task.defer` / `task.delay` instead of legacy `spawn` / `delay` / `wait`

## Security
- Never trust the client — validate every RemoteEvent/RemoteFunction argument type and range on server
- All game logic (currency, inventory, damage) must be server-authoritative — client is display only
- Type-check all remote arguments: `if typeof(arg) ~= "string" then return end`
- Rate-limit RemoteEvent calls per player to prevent spam/exploit flooding
- Never store secrets in ReplicatedStorage or client-accessible locations

## References
- https://create.roblox.com/docs
- https://luau-lang.org
- https://create.roblox.com/docs/reference/engine
