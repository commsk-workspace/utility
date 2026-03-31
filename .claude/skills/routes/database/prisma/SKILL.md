# Prisma ORM 6.x — SKILL

## Overview
Prisma is a next-generation TypeScript ORM with auto-generated type-safe client and declarative schema. Version 6.x brings improved query engine and connection management. **Performance is priority #1** — every query must avoid N+1 and minimize data transfer.

## Setup / Base Project
```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
npx prisma migrate dev --name init && npx prisma generate
# DATABASE_URL: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30
```

## Core Concepts
- **Schema-first**: `prisma/schema.prisma` is single source of truth
- **Relations**: `@relation` for 1:1, 1:N, M:N (implicit or explicit join table)
- **Type safety**: generated client = full autocomplete + compile-time checks
- **Raw queries**: `prisma.$queryRaw` with tagged template literals when ORM is insufficient

## Security
- **Parameterized queries only** — `$queryRaw` uses tagged template literals (auto-parameterized); never use `$queryRawUnsafe` with user input
- **Least privilege DB roles**: `app_read` (SELECT), `app_write` (INSERT/UPDATE/DELETE), `migration` (ALTER/CREATE/DROP), `root` (DBA only)
- **Encrypt in transit** — use `sslmode=require` in DATABASE_URL; encrypt at rest via DB engine settings
- **Never store passwords as plain text** — use bcrypt/argon2 at app layer before saving
- **Audit logging** — use Prisma middleware or `$extends` to log who/when/what changed
- **Private network only** — DB must not be publicly accessible; use connection string to private host
- **Rotate credentials regularly** — automate with secrets manager; never hardcode DATABASE_URL
- **Connection limit** — set `connection_limit` in URL (5 for serverless, 10-20 for server)
- **Input validation at app layer** (Zod/class-validator) before any Prisma call
- **Backup + test restore regularly** — DB-level backups; verify restores monthly

## Performance (CRITICAL)
```typescript
// [prisma] select ONLY needed fields — less data = faster
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
  where: { isActive: true },
});

// [prisma] avoid N+1 — include relations in ONE query
const orders = await prisma.order.findMany({
  where: { status: "active" },
  include: { items: true, customer: { select: { name: true } } },
});

// [prisma] batch create — single query
await prisma.product.createMany({ data: products, skipDuplicates: true });

// [prisma] batch update via transaction — reduces round trips
await prisma.$transaction(
  ids.map((id) => prisma.order.update({ where: { id }, data: { status: "shipped" } }))
);

// [prisma] cursor pagination — O(1) vs skip O(n)
const page = await prisma.post.findMany({
  take: 20, skip: 1, cursor: { id: lastId }, orderBy: { id: "asc" },
});

// [prisma] raw SQL for hot paths — bypasses ORM overhead
const result = await prisma.$queryRaw`
  SELECT o.id, o.total, c.name FROM orders o
  JOIN customers c ON o.customer_id = c.id
  WHERE o.status = 'active' ORDER BY o.created_at DESC LIMIT 50`;
```

### Performance Rules
1. **`select` over `include`** — fetch only needed fields; less data = faster
2. **Never query in loops** — use `include`, `createMany`, or `$transaction` batch
3. **Cursor pagination** — `cursor` + `take` instead of `skip` for large datasets
4. **`createMany`/`updateMany`** for bulk — single DB round trip
5. **Connection pool** — `connection_limit=5` serverless, `10-20` for servers
6. **`@@index` in schema** — index every `where`/`orderBy` column
7. **Logging** — `{ log: ["query"] }` in dev to catch slow queries and N+1
8. **Raw SQL for hot paths** — `$queryRaw` when ORM overhead matters
9. **Interactive `$transaction`** for complex atomic operations
10. **Cache hot data (Redis)** — invalidate on write; reduce repeated reads

```prisma
// [prisma] always add indexes for filtered/sorted columns
model Order {
  id         Int      @id @default(autoincrement())
  status     String
  total      Decimal
  createdAt  DateTime @default(now())
  customerId Int
  @@index([status, createdAt(sort: Desc)])
  @@index([customerId])
}
```

## Advanced Patterns
- **View**: map DB views in Prisma schema with `@@map("view_name")` + `db.view` preview — use for dashboards, complex JOINs
- **Materialized View**: not natively supported — create via raw migration SQL; refresh with `$queryRaw`
- **Trigger**: create via raw migration (`prisma migrate dev` + custom SQL) for audit logs, auto-timestamps
- **Prisma Middleware / `$extends`**: intercept queries for soft delete, audit logging, caching, access control
- **ORM vs Raw**: use Prisma client for CRUD; use `$queryRaw` / DB Views / Triggers when ORM is too slow or complex

## Gotchas
- `migrate dev` resets DB on drift — **never in production** (use `migrate deploy`)
- `@updatedAt` only triggers on Prisma writes — raw SQL won't update it
- N+1 is the #1 perf killer — enable query logging to detect
- Enums in schema = DB enums — changing values requires migration

## References
- https://www.prisma.io/docs
- https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance
