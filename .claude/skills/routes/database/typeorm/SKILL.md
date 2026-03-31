# TypeORM 0.3.x — SKILL

## Overview
TypeORM is a TypeScript ORM supporting Active Record and Data Mapper patterns. Version 0.3.x uses DataSource (replaces Connection). Works with PostgreSQL, MySQL, SQLite, SQL Server. **Performance is priority #1** — use QueryBuilder, proper indexes, and batch operations.

## Setup / Base Project
```bash
npm install typeorm reflect-metadata @nestjs/typeorm pg
# tsconfig: "emitDecoratorMetadata": true, "experimentalDecorators": true
npx typeorm migration:generate -d src/data-source.ts src/migrations/Init
npx typeorm migration:run -d src/data-source.ts
```

## Core Concepts
- **DataSource**: single config object replacing deprecated `createConnection`
- **Entities**: `@Entity()` classes with `@Column()` decorators
- **Relations**: `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne` + `@JoinColumn`
- **QueryBuilder**: fluent API for complex queries — use over `.find()` for performance
- **Repository pattern**: `dataSource.getRepository(Entity)` for CRUD

## Security
- **Parameterized queries only** — QueryBuilder uses `:param` syntax (auto-parameterized); never concatenate raw values
- **Least privilege DB roles**: `app_read` (SELECT), `app_write` (INSERT/UPDATE/DELETE), `migration` (ALTER/CREATE/DROP), `root` (DBA only)
- **Encrypt in transit** — DataSource `ssl: { rejectUnauthorized: true }`; encrypt at rest via DB engine settings
- **Never store passwords as plain text** — use bcrypt/argon2 at app layer before saving
- **Audit logging** — use TypeORM subscribers (`@EventSubscriber`) to log who/when/what changed
- **Private network only** — DB must not be publicly accessible; connect via private host/VPN
- **Rotate credentials regularly** — automate with secrets manager; never hardcode credentials in DataSource
- **Connection limit** — DataSource `extra: { max: 20 }` to cap pool size
- **Input validation at app layer** (class-validator DTOs) before any repository/QueryBuilder call
- **Backup + test restore regularly** — DB-level backups; verify restores monthly

## Performance (CRITICAL)
```typescript
// [typeorm] select ONLY needed columns
const users = await userRepo.createQueryBuilder("user")
  .select(["user.id", "user.name", "user.email"])
  .where("user.isActive = :active", { active: true })
  .getMany();

// [typeorm] avoid N+1 — explicit joins in ONE query
const orders = await orderRepo.createQueryBuilder("order")
  .leftJoinAndSelect("order.items", "item")
  .leftJoin("order.customer", "c").addSelect(["c.name"])
  .where("order.status = :s", { s: "active" })
  .orderBy("order.createdAt", "DESC")
  .getMany();

// [typeorm] batch insert — single query for bulk
await dataSource.createQueryBuilder().insert().into(Product)
  .values(products)
  .orUpdate(["price", "name"], ["sku"]) // upsert
  .execute();

// [typeorm] batch update — single round trip
await dataSource.createQueryBuilder().update(Order)
  .set({ status: "shipped" }).whereInIds(orderIds).execute();

// [typeorm] cursor pagination — O(1)
const page = await orderRepo.createQueryBuilder("order")
  .where("order.id > :cursor", { cursor: lastId })
  .orderBy("order.id", "ASC").take(50).getMany();

// [typeorm] transaction for atomic operations
await dataSource.transaction(async (manager) => {
  await manager.save(Order, order);
  await manager.decrement(Inventory, { sku }, "quantity", 1);
});

// [typeorm] raw SQL for hot paths
const result = await dataSource.query(
  `SELECT id, total FROM orders WHERE status = $1 ORDER BY created_at DESC LIMIT 50`,
  ["active"]
);
```

### Performance Rules
1. **QueryBuilder over `.find()`** — more control over JOINs and SELECTs
2. **Select only needed columns** — `.select([...])` reduces data transfer
3. **Never query in loops** — use `leftJoinAndSelect` or batch QueryBuilder
4. **Cursor pagination** — `.where("id > :cursor")` + `.take(N)`, not `.skip()`
5. **Batch insert/update** — `.insert().values([...])` for bulk operations
6. **Connection pool** — `extra: { max: 20, idleTimeoutMillis: 10000 }`
7. **`@Index()` decorators** — index every WHERE/JOIN/ORDER BY column
8. **Query logging** — `logging: ["query"]` in dev to find N+1 and slow queries
9. **Raw SQL for hot paths** — `dataSource.query()` bypasses ORM overhead
10. **Avoid `eager: true`** — causes hidden N+1; use explicit joins
11. **Cache hot data (Redis)** — invalidate on write; reduce repeated reads

```typescript
// [typeorm] entity with performance indexes
@Entity()
@Index(["status", "createdAt"])
@Index(["customerId"])
export class Order {
  @PrimaryGeneratedColumn() id: number;
  @Column() @Index() status: string;
  @Column({ type: "timestamp" }) createdAt: Date;
  @Column() customerId: number;
  @ManyToOne(() => Customer, (c) => c.orders)
  @JoinColumn({ name: "customerId" }) customer: Customer;
}
```

## Advanced Patterns
- **View**: map DB views as entities with `@ViewEntity()` + `@ViewColumn()` — use for dashboards, complex JOINs
- **Trigger**: not managed by TypeORM — create via migration SQL for audit logs, auto-timestamps, sync denormalized data
- **Stored Procedure**: call via `dataSource.query("CALL procedure_name($1)", [param])` — batch multi-step ops
- **TypeORM Subscribers**: `@EventSubscriber()` for before/after insert/update/delete hooks — audit, soft delete, caching
- **ORM vs Raw**: use Repository/QueryBuilder for CRUD; use `dataSource.query()` / DB Views / Triggers when ORM is too slow

## Gotchas
- `synchronize: true` **destroys data** — never in production; use migrations
- `eager: true` = hidden N+1 — prefer explicit `leftJoinAndSelect`
- `@Column()` defaults NOT NULL — specify `{ nullable: true }` explicitly
- Params use `:param` — never concatenate raw values (SQL injection)

## References
- https://typeorm.io/
- https://typeorm.io/select-query-builder
