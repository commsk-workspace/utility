---
name: skill-creator
description: Create new SKILL.md files, improve existing skills, and test skill quality. Use this skill whenever the user wants to build a new skill from scratch, turn a workflow into a reusable skill, update or optimize an existing SKILL.md, or test how well a skill performs. Trigger on phrases like "สร้าง skill", "ทำ skill ใหม่", "เปลี่ยน workflow นี้เป็น skill", "แก้ skill", or "อยากให้มี skill สำหรับ...".
---

# Skill Creator

ช่วยสร้าง SKILL.md ใหม่, ปรับปรุง skill ที่มีอยู่, และทดสอบว่า skill ทำงานได้ดีแค่ไหน

---

## Skill Structure ของ Project นี้

```
.claude/skills/
├── routing.md                  ← master index (อัปเดตเมื่อเพิ่ม skill ใหม่)
└── routes/
    ├── {group}.md              ← group index
    └── {group}/{name}/
        └── SKILL.md            ← skill file
```

**Groups ที่มี:** `frontend`, `backend`, `database`, `mobile`, `game`, `devops`, `tools`

---

## Anatomy of a SKILL.md

```yaml
---
name: skill-name                    # ชื่อที่ใช้เรียก skill
description: |                      # สำคัญมาก — นี่คือ trigger mechanism
  What it does + when to use it.
  ยิ่ง specific ยิ่งดี รวม keywords ที่ user จะพูดด้วย
allowed-tools:                      # (optional) pre-approve tools
  - Bash
  - Edit
context: fork                       # (optional) run in isolated subagent
---

# Skill Title

[เนื้อหา markdown — instructions, steps, patterns, examples]
```

**Progressive Disclosure — 3 ระดับ:**
1. **Frontmatter** (name + description) — โหลดตลอดเวลา ~100 words
2. **SKILL.md body** — โหลดเมื่อ skill trigger ควรอยู่ใต้ 500 บรรทัด
3. **Bundled resources** — `references/`, `scripts/`, `assets/` — โหลดตามต้องการ

---

## กระบวนการสร้าง Skill

### Mode A — "สร้าง skill สำหรับโปรเจคนี้" (Auto-Research Mode)

เมื่อบอสบอกให้สร้าง skill สำหรับ tech/library ที่ระบุ **ห้ามถาม — ให้ทำเลย**:

1. **Research ก่อนเสมอ** — ค้นหา official docs + best practices ล่าสุดก่อนเขียน
   - อ่าน official documentation ของ tech นั้น
   - ค้นหา GitHub repo + README + CHANGELOG
   - หา community best practices (เช่น patterns ที่ใช้กันทั่วไป, pitfalls ที่ควรหลีกเลี่ยง)
   - ดู version ล่าสุดที่ stable — ห้ามใช้ความรู้เก่าถ้ามีของใหม่กว่า

2. **Scan codebase** ของโปรเจคด้วย — ดูว่าใช้ version อะไร, มี pattern อะไรอยู่แล้ว, มีข้อจำกัดอะไร

3. **เขียน SKILL.md** จาก research นั้นทันที — ไม่ต้องถาม

4. **สรุปให้บอส** ว่า research เจออะไร และ skill ทำอะไรได้บ้าง

> ตัวอย่าง: "สร้าง skill สำหรับ Prisma" → research Prisma docs → scan โปรเจค → เขียน skill → deliver

---

### Mode B — สร้าง skill ทั่วไป (Interactive Mode)

เมื่อ intent ยังไม่ชัด ถามก่อน:

1. Skill นี้ให้ Claude ทำอะไรได้?
2. user จะพูดว่าอะไรเพื่อ trigger มัน?
3. output ที่คาดหวังมีรูปแบบยังไง?
4. มี edge case หรือ dependency ที่ต้องรู้ไหม?

ถ้า user บอกว่า "เปลี่ยน workflow นี้เป็น skill" — ให้ดึง steps, tools ที่ใช้, และ corrections ที่ user แก้ออกจาก conversation history ก่อน

### Step 2: เลือก Group และ Path

Match keyword กับ group:

| Group | Keywords |
|-------|---------|
| `frontend` | React, Vue, Next.js, Nuxt, CSS, UX/UI, PWA |
| `backend` | NestJS, Node, Laravel, PHP, Go, Python, Java, API |
| `database` | DB, schema, ERD, migration, Prisma, TypeORM |
| `mobile` | Flutter, React Native |
| `game` | Roblox, Unity, Cocos, Lua |
| `devops` | CI/CD, Docker, security, Electron |
| `tools` | project, scaffold, test, workflow, utility |

Path: `.claude/skills/routes/{group}/{skill-name}/SKILL.md`

### Step 3: เขียน SKILL.md

**Description field — สำคัญที่สุด:**
- อธิบายทั้ง "ทำอะไร" และ "เมื่อไหร่ใช้"
- ใส่ keywords ที่ user จะพูด (ทั้งไทยและอังกฤษถ้าใช้ทั้งคู่)
- เขียนให้ "pushy" นิดนึง — Claude มีแนวโน้ม undertrigger skills
  - ❌ "Helps with NestJS projects"
  - ✅ "Expert in NestJS. Use this skill whenever NestJS, controllers, pipes, guards, modules, or decorators are mentioned — even if not explicitly asked for a 'NestJS' solution."

**Body — Writing Patterns:**

Prefer imperative form:
```markdown
## Steps
1. Read the existing file first
2. Match the current code style
3. Add error handling for null cases
```

Define output formats explicitly:
```markdown
## Output Format
ALWAYS use this structure:
# [Title]
## Summary
## Changes
## Next Steps
```

Include examples:
```markdown
## Example
Input: "สร้าง endpoint สำหรับ user login"
Output: POST /auth/login with JWT response
```

**ถ้า skill ซับซ้อน — แตก references:**
```
{skill-name}/
├── SKILL.md          ← workflow + selection logic
└── references/
    ├── patterns.md   ← detailed patterns
    └── examples.md   ← code examples
```

### Step 4: อัปเดต Group Index + Routing

หลัง write SKILL.md แล้ว ต้องอัปเดต:

1. **Group file** — `.claude/skills/routes/{group}.md`
   - เพิ่ม entry ใน table ของ skill ใหม่

2. **routing.md** — `.claude/skills/routing.md`
   - ไม่ต้องแก้ถ้า group ยังเหมือนเดิม (routing.md ชี้ไป group files อยู่แล้ว)

### Step 5: ทดสอบ

สร้าง 2-3 test prompts ที่ user จะพูดจริงๆ แล้วถามบอสว่าถูกทิศทางไหม:

```
Test 1: [realistic user prompt]
Test 2: [edge case prompt]
Test 3: [prompt ที่ควร trigger skill นี้ ไม่ใช่ skill อื่น]
```

รัน test โดยทำตาม skill instructions เลย แล้วดูว่า output ตรงกับที่คาดไหม

### Step 6: Optimize Description (ถ้าจำเป็น)

ถ้า skill trigger ไม่สม่ำเสมอ ให้ปรับ description:
- เพิ่ม trigger phrases ที่ชัดขึ้น
- ลด ambiguity กับ skill อื่นใน group เดียวกัน
- เพิ่ม context ว่า "even when user doesn't explicitly say X..."

---

## Checklist ก่อนส่ง

- [ ] `name` ไม่ซ้ำกับ skill อื่น
- [ ] `description` มีทั้ง what + when + keywords
- [ ] Body อยู่ใต้ 500 บรรทัด (ถ้าเกิน → แตก references/)
- [ ] Group index อัปเดตแล้ว
- [ ] ทดสอบด้วย realistic prompt แล้ว

---

## ตัวอย่าง SKILL.md ที่ดี

```yaml
---
name: prisma
description: Prisma ORM expert for schema design, migrations, and queries.
  Use whenever Prisma schema, migrations, relations, seed, or Prisma Client
  are mentioned — even if the user just says "database schema" in a NestJS project.
---

# Prisma Expert

## Schema Conventions
- Always use `@id @default(uuid())` for primary keys
- Enum types go at the top of schema.prisma
...
```

---

## ข้อควรระวัง

- **ห้ามสร้าง skill ที่ทำให้ทำสิ่งที่เป็นอันตราย** (malware, exploit, unauthorized access)
- **ห้าม hardcode secrets** ใน skill content
- **Skill ต้องไม่ทำสิ่งที่ user ไม่คาดหวัง** — content ต้อง match description เสมอ
- ถ้า skill overlap กับ skill ที่มีอยู่ → บอกบอสก่อน ถามว่าจะ merge หรือแยก
