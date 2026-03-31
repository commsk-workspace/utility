---
name: project-init
description: Initialize a blank project — create .workspace/ structure and system overview workflow. Trigger automatically at session start when .workspace/ does not exist. Also trigger when user says "init project", "setup workspace", "เริ่มโปรเจค", "สร้าง workspace", or "ตั้งค่าโปรเจคใหม่".
---

# Project Init

ใช้เมื่อเริ่ม project ใหม่ที่ยังไม่มี `.workspace/` — ถามบอส แล้วสร้าง workspace structure และ system overview ให้พร้อมทำงาน

---

## Step 1: ถามบอส

เริ่มด้วยคำถามสั้นๆ ก่อน **อย่าสร้างอะไรก่อนที่จะได้คำตอบ**:

```
บอสคะ โปรเจคนี้ยังไม่มี .workspace/ เลย 🌱
หนูช่วยตั้งค่าให้ได้เลย — บอกหน่อยนะคะว่า:

1. โปรเจคนี้ชื่อ/ทำอะไรคะ? (อธิบายสั้นๆ ได้เลย)
2. มี system หรือ module อะไรบ้าง? (เช่น auth, dashboard, api, frontend)
3. tech stack คืออะไรคะ? (ถ้ายังไม่รู้ก็ไม่เป็นไรค่ะ)
```

รับคำตอบก่อน แล้วค่อยไป Step 2

---

## Step 2: สร้าง .workspace/ Structure

สร้าง folder structure ตาม systems ที่บอสบอก:

```
.workspace/
├── inbox/
│   ├── pending/        ← agent task queue
│   └── done/
├── plans.md            ← roadmap รวมทุก system
└── {system}/           ← สร้างตาม systems ที่บอสบอก
    ├── plans.md        ← plan เฉพาะ system นี้
    ├── backlog/
    ├── inprogress/
    ├── issue/
    └── done/
```

**ถ้าบอสยังไม่รู้ systems** — สร้างแค่โครงสร้าง base ก่อน:
```
.workspace/
├── inbox/pending/
├── inbox/done/
└── plans.md
```

---

## Step 3: สร้าง plans.md

### 3a — Project-level: `.workspace/plans.md`

```markdown
# [Project Name] — Plans

> Updated: {date}

## Overview
[อธิบายโปรเจค 1-2 บรรทัด]

## Tech Stack
[จาก input ของบอส หรือ TBD ถ้ายังไม่รู้]

## Systems

| System | Status | Plan |
|--------|--------|------|
| {system} | Not Started | [.workspace/{system}/plans.md](./{system}/plans.md) |

## Roadmap
- [ ] Phase 1: Setup & Foundation
- [ ] Phase 2: Core Features
- [ ] Phase 3: Polish & Deploy

## Notes
[ข้อมูลเพิ่มเติมจากบอส]
```

### 3b — System-level: `.workspace/{system}/plans.md` (สร้างทุก system)

```markdown
# {System} — Plans

> Updated: {date}

## Overview
[อธิบาย system นี้ทำอะไร]

## Goals
- [ ] ...
- [ ] ...

## Backlog Summary
| REQ | Description | Status |
|-----|-------------|--------|
| REQ-001 | ... | Backlog |

## Dependencies
- ขึ้นอยู่กับ: [ระบุ system อื่นที่ต้องการ ถ้ามี]

## Notes
[ข้อมูลเพิ่มเติม]
```

---

## Step 4: สร้าง System Overview Workflow

สร้าง `.workspace/workflow/system-overview.md` แบบ Mermaid diagram:

**ถ้าบอสบอก systems มาแล้ว:**
```markdown
# System Overview — [Project Name]

> สร้างจาก initial planning — อัปเดตเมื่อ architecture ชัดขึ้น

## Architecture Overview

​```mermaid
flowchart TD
  subgraph Frontend
    UI[UI Layer]
  end
  subgraph Backend
    API[API Server]
    AUTH[Auth]
  end
  subgraph Database
    DB[(Database)]
  end
  UI --> API
  API --> AUTH
  API --> DB
​```

## Systems
| System | Description | Status |
|--------|-------------|--------|
| {system} | [จาก input บอส] | Planned |
```

**ถ้าบอสยังไม่รู้ tech stack** — ทำ placeholder ก่อน แล้วแจ้งว่าอัปเดตได้ทีหลัง

---

## Step 5: สรุปให้บอสดู

หลังสร้างเสร็จ สรุปแบบนี้:

```
เสร็จแล้วค่ะบอส ✅ นี่คือสิ่งที่หนูสร้าง:

📁 .workspace/
  ├── inbox/pending/ + done/
  ├── plans.md                      ← roadmap รวมทุก system
  ├── workflow/system-overview.md
  └── {system}/
      ├── plans.md                  ← plan เฉพาะ system
      └── backlog/ inprogress/ issue/ done/

ถัดไปบอสอยากเริ่มที่ system ไหนก่อนคะ?
หรือถ้ามี requirement อยู่แล้ว บอกได้เลยนะคะ หนูจะสร้าง backlog ให้ 💜
```

---

## Edge Cases

- **บอสตอบสั้นมาก** เช่น "web app" → ถามเพิ่มว่ามี auth ไหม, มี admin panel ไหม, frontend+backend หรือ fullstack
- **บอสบอก systems เยอะมาก** (>7 systems) → แนะนำให้จัดกลุ่มเป็น Phase ใน plans.md แทน
- **มี code อยู่แล้วแต่ไม่มี .workspace/** → scan codebase ก่อน แล้ว suggest systems จาก folder structure ที่มีอยู่
- **บอสบอกว่ามี requirements doc** → ขอดูก่อน แล้วสร้าง backlog จากนั้นเลย
