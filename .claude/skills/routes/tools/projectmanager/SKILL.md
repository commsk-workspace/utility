# Project Manager — SKILL

## Overview
Sprint planning, roadmap management, and risk assessment using Agile/Scrum methodology.
Structured approach to breaking work into deliverable increments with clear tracking.

## Setup / Base Project
```
.workspace/
  plans.md              # roadmap overview with status icons
  {system}/
    plan.md             # system-level plan
    backlog/            # requirements waiting
    inprogress/         # currently active
    done/               # completed archive
    issue/              # bugs and blockers
```

## Core Concepts
- **Sprint**: 1-2 week cycle — plan, execute, review, retro
- **User Story**: "As a [role], I want [goal], so that [benefit]"
- **Story Points**: relative effort estimation (1, 2, 3, 5, 8, 13) — Fibonacci scale
- **Velocity**: avg points completed per sprint — use for capacity planning
- **Kanban flow**: Backlog -> In Progress -> Review -> Done (no skipping ever)
- **Risk matrix**: Probability (L/M/H) x Impact (L/M/H) — mitigate H/H first
- **Definition of Done**: code complete, tested, reviewed, build passes, documented
- **WIP limit**: limit in-progress items to prevent context-switching overhead

## Common Patterns
```markdown
## Sprint 5 — 2026-03-24 to 2026-04-07

### Goals
- Complete user auth module
- Fix critical delivery bugs

### Capacity: 21 points (3 devs x 7pts)

| Task | Points | Owner | Status |
|------|--------|-------|--------|
| JWT refresh | 5 | Dev A | Done |
| Password reset | 3 | Dev B | In Progress |
| Fix #42 | 2 | Dev C | Review |
```

## Gotchas
- Do not start new work before checking existing backlog/inprogress
- Scope creep: if requirements change mid-sprint, re-estimate and re-plan
- Never skip retrospective — continuous improvement depends on it
- Track blockers daily — unresolved blockers kill velocity
- Keep sprint scope realistic — under-promise, over-deliver
- Always create issue/ entry before fixing bugs — track everything

## References
- https://scrumguides.org/
- https://www.atlassian.com/agile/scrum
- https://www.mountaingoatsoftware.com/agile/user-stories
