# Guide: Create Workflow / DB / Plans

> Load when boss says "create workflow", "create ERD", "update plans", or "summarize the system"

---

## Output Structure

```
.workspace/
├── plans.md              ← combined roadmap for all systems (update every time)
├── workflow/             ← Mermaid flowchart / sequence / state diagrams
│   ├── system-overview.md       ← full module overview (always create)
│   ├── {feature}-flow.md        ← flow for that feature
│   └── {feature}-sequence.md   ← sequence diagram if complex API calls exist
└── db/                   ← Mermaid ERD split into 3 levels
    ├── erd-overview.md          ← entity names + relations only (always create)
    ├── erd-system.md            ← split by domain/module group
    └── erd-detail.md            ← full columns + types for every entity
```

---

## Scan Codebase First (never skip)

1. **Entity files** — `src/**/entities/*.entity.ts` → table names, columns, relations
2. **Module files** — `src/**/*.module.ts` → module imports/dependencies
3. **Controller files** — `src/**/*.controller.ts` → endpoints, data flow
4. **Router/Pages** — `frontend/src/router.jsx` + `pages/*/` → UI features
5. **plans.md** — always read first to check current status

---

## Workflow Diagram Checklist

### `system-overview.md`
- [ ] Covers all modules in codebase
- [ ] Shows Frontend → API → Database dependencies
- [ ] Uses `subgraph` to separate layers (FE / API / DB)
- [ ] Shows relations between modules

### `{feature}-flow.md`
- [ ] Covers happy path + error path
- [ ] Clear actors (User, System, External)
- [ ] State transitions if status exists
- [ ] Uses `flowchart TD` / `stateDiagram-v2` as appropriate

### `{feature}-sequence.md`
- [ ] Shows Browser → Frontend → API → DB for every step
- [ ] HTTP method + endpoint specified
- [ ] Response format shown
- [ ] Auth flow (JWT) included if auth required

---

## ERD Checklist

### `erd-overview.md`
- [ ] All entities present — show only entity name + cardinality
- [ ] No column details — must be readable at a glance

### `erd-system.md`
- [ ] Grouped by business domain (Auth, Products, Sales, Logistics)
- [ ] Each section has domain description comment
- [ ] Cross-domain relations shown

### `erd-detail.md`
- [ ] All columns with types (string, number, uuid, enum)
- [ ] PK, FK clearly marked
- [ ] Nullable columns marked with `[nullable]`
- [ ] Enum values shown in comments

---

## plans.md Checklist

- [ ] System overview diagram (tech stack)
- [ ] Systems table: Name | Status | Folder
- [ ] Status: Done / In Progress / Not Started / Planned
- [ ] Timestamp updated

---

## Auto-routing

| Boss says... | Output |
|-------------|--------|
| "create workflow from this system" | `workflow/system-overview.md` + feature flows for all modules |
| "create workflow for [feature]" | `workflow/{feature}-flow.md` |
| "create sequence diagram for [feature]" | `workflow/{feature}-sequence.md` |
| "create ERD from this system" | `db/erd-overview.md` + `erd-system.md` + `erd-detail.md` (all 3) |
| "update plans" | `plans.md` |
| "summarize entire system" | full workflow/ and db/ output |

> **Rule:** if boss says "this system" / "this project" → always scan codebase first, never guess
