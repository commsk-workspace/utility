# Unity — SKILL

## Overview
Industry-standard game engine using C#. Unity 6 (6000.x LTS) is the current long-term support release.
Features URP/HDRP rendering, UI Toolkit, ECS (DOTS), Netcode for GameObjects, and Sentis (on-device AI).

## Setup / Base Project
```
1. Install Unity Hub from https://unity.com/download
2. Install Unity 6 LTS via Hub > Installs > Add
3. New Project > 3D (URP) or 2D (URP) template
4. Scripts: Assets > Create > C# Script
5. Build: File > Build Settings > Select platform > Build
```

## Core Concepts
- **MonoBehaviour lifecycle** — `Awake()` > `OnEnable()` > `Start()` > `Update()` > `FixedUpdate()` > `OnDestroy()`
- **Component pattern** — Attach scripts to GameObjects; prefer composition over inheritance
- **Input System** — New Input System package (replaces legacy `Input.GetAxis`); action maps + bindings
- **Physics** — `Rigidbody` + Colliders; use `FixedUpdate()` for physics code
- **UI Toolkit** — UXML + USS (replaces legacy UGUI); `VisualElement`, `ListView`, data binding
- **ScriptableObjects** — Data containers decoupled from scenes; great for configs, item DBs
- **Addressables** — Async asset loading; replaces `Resources.Load()`
- **DOTS/ECS** — Entity Component System for high-performance scenarios (thousands of entities)

## Common Patterns
```csharp
// [movement] Character controller using New Input System
public class PlayerMove : MonoBehaviour {
    [SerializeField] private float speed = 5f;
    private Rigidbody rb;
    private Vector2 moveInput;
    void Awake() => rb = GetComponent<Rigidbody>();
    public void OnMove(InputAction.CallbackContext ctx) => moveInput = ctx.ReadValue<Vector2>();
    void FixedUpdate() {
        var move = new Vector3(moveInput.x, 0, moveInput.y);
        rb.MovePosition(rb.position + move.normalized * speed * Time.fixedDeltaTime);
    }
}
```
```csharp
// [data] ScriptableObject for item definitions
[CreateAssetMenu(fileName = "Item", menuName = "Game/Item")]
public class ItemData : ScriptableObject {
    public string itemName;
    public int price;
    public Sprite icon;
}
```

## Gotchas
- Never use `Find()` or `GetComponent()` in `Update()` — cache references in `Awake()`
- Use `CompareTag("Enemy")` instead of `tag == "Enemy"` (avoids GC allocation)
- Physics code must go in `FixedUpdate()`, input polling in `Update()`
- Avoid `async void` — use `async UniTask` (UniTask package) or Awaitable (Unity 6 built-in)
- Legacy Input (`Input.GetAxis`) is deprecated — migrate to Input System package

## Security
- Server-authoritative design for multiplayer — never trust client-calculated values (HP, score, position)
- Obfuscate IL2CPP builds to hinder reverse engineering — use tools like Obfuscator or code stripping
- Validate all network messages server-side — reject out-of-range or impossible values
- Never embed API keys or secrets in builds — use server-side proxy for external API calls
- Enable code stripping (`Managed Stripping Level: High`) to reduce attack surface

## References
- https://docs.unity3d.com/6000.0/Documentation/Manual
- https://docs.unity3d.com/6000.0/Documentation/ScriptReference
- https://github.com/Cysharp/UniTask
- https://docs.unity3d.com/Packages/com.unity.inputsystem@1.11/manual
