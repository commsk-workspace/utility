# Kanban Rules

> Load when managing .workspace/ files (req/issue/done)

`.workspace/` must always be at **project root**

```
{system}/ → backlog/ → inprogress/ → done/
           issue/ ──────────────────→ done/
```
- Naming: `req_YYYYMMDD_v1.md` / `issue_YYYYMMDD_v1.md`
- Always create new files in `backlog/` — never create directly in inprogress/done
- Before fixing a bug → always create an `issue/` entry first
- Check backlog+inprogress before accepting new work — notify boss if items pending
- Never skip inprogress — never move backlog directly to done
- `done/` = archive, do not modify
- Templates → see `rules/workspace-templates.md`
- When REQ is complete → immediately change `- [ ]` to `- [x]` with Edit tool
