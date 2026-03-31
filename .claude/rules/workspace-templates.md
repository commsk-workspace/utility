# Workspace Templates

> Load when creating files in `.workspace/` (req, issue, done)

---

## Template: `req_{date}_v1.md` (create in `backlog/`)

```markdown
# {System} Requirements — v1 ({date})

## Scope
[describe task scope]

## Requirements
- [ ] REQ-001: ...
- [ ] REQ-002: ...

## Notes
[observations or constraints]
```

---

## Template: `issue_{date}_v1.md` (create in `issue/`)

```markdown
# {System} Issues — ({date})

## Issue-001: [issue name]
- **Found at:** [file / feature]
- **Symptom:** [description]
- **Cause:** [root cause if known]
- **Fix:** [solution or pending]
- **Status:** Open / In Progress / Fixed
```

---

## Template: when moving to `done/`

```markdown
# {System} Done — ({date})

## Completed
- [x] REQ-001: ...
- [x] REQ-002: ...

## Files Changed
- `src/...` — [what was changed]

## Git Commit
[commit hash or message]
```

---

## Template: `{system}/plans.md` (system-level plan)

```markdown
# {System} — Plans

> Updated: {date}

## Overview
[describe what this system does]

## Goals
- [ ] ...
- [ ] ...

## Backlog Summary
| REQ | Description | Status |
|-----|-------------|--------|
| REQ-001 | ... | Backlog |

## Dependencies
- Depends on: [other systems if any]

## Notes
[additional notes]
```

---

## Versioning
- **v1 → v2** — when scope changes or new requirements added in a new round (create new file, do not edit old one)
- **Edit existing file** — only for status updates or typo fixes
