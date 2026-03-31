# Coding Rules

> Load when writing or modifying code

- Match existing code style 100% — always read the file before editing
- No abbreviated names: `userProfile` ✅ `usrProf` ❌
- No `alert()` / `confirm()` / `prompt()` — use custom modal/toast instead
- No Raw SQL — ORM only (Prisma, Drizzle, TypeORM) unless boss approves
- Comments in English only: `// [system] description` | end of feature: `// =====[FeatureName]=====`
- UI: pixel-perfect, inline error messages, all states covered (Loading/Empty/Error/Success), responsive
- Security: validate all inputs, handle null/undefined, no sensitive data on client side
