# PostgreSQL 17 — SKILL

## Overview
PostgreSQL is the most advanced open-source RDBMS. Version 17 adds incremental backup, enhanced parallel query, improved JSONB performance, and better logical replication. **Performance is priority #1** — every query must pass EXPLAIN ANALYZE before deployment.

## Setup / Base Project
```bash
# Install (Docker)
docker run -d --name postgres -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:17

# Performance-tuned postgresql.conf
shared_buffers = 25% of RAM           # main data cache
effective_cache_size = 75% of RAM     # planner hint for OS cache
work_mem = 128MB                      # per-sort/hash operation memory
maintenance_work_mem = 512MB          # VACUUM, CREATE INDEX speed
random_page_cost = 1.1                # SSD setting (default 4.0 is for HDD)
effective_io_concurrency = 200        # SSD parallel reads
max_parallel_workers_per_gather = 4   # parallel query execution
```

## Core Concepts
- **JSONB** over JSON — binary, indexable with GIN, supports `@>` containment
- **Partial indexes**: index only matching rows — smaller, faster
- **UUID**: `gen_random_uuid()` built-in since v13
- **CTEs**: inlined by planner in v12+ — use `MATERIALIZED` to force isolation

## Security
- **Parameterized queries only** — never concatenate user input into SQL strings
- **Least privilege roles**: `app_read` (SELECT), `app_write` (INSERT/UPDATE/DELETE), `migration` (ALTER/CREATE/DROP), `root` (superuser DBA only)
- **Encrypt at rest** (TDE or filesystem encryption) + **in transit** (`ssl = on`, enforce via `hostssl` in pg_hba.conf)
- **Never store passwords as plain text** — use bcrypt/argon2 at app layer
- **Audit logging** — use `pgaudit` extension (who/when/what changed)
- **Private network only** — never expose port 5432 to public; use SSH tunnel or VPN
- **Rotate credentials regularly** — automate with secrets manager (Vault, AWS Secrets Manager)
- **Rate limit + connection limit** — `ALTER ROLE app_user CONNECTION LIMIT 20`
- **Input validation at app layer** before any data reaches the database
- **Backup + test restore regularly** — `pg_dump` / `pg_basebackup`; verify restores monthly

## Performance (CRITICAL)
```sql
-- [postgres] ALWAYS EXPLAIN ANALYZE before deploying
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT * FROM orders WHERE status = 'active';

-- [postgres] composite index with INCLUDE for covering queries
CREATE INDEX idx_orders_perf ON orders (status, created_at DESC) INCLUDE (total, customer_id);

-- [postgres] partial index — only index what you query
CREATE INDEX idx_active_orders ON orders (created_at) WHERE status = 'active';

-- [postgres] GIN index for JSONB — fast containment queries
CREATE INDEX idx_meta_gin ON products USING GIN (metadata jsonb_path_ops);

-- [postgres] batch upsert with ON CONFLICT
INSERT INTO products (sku, name, price) VALUES
  ('A1','Widget',10), ('A2','Gadget',20)
ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price;

-- [postgres] cursor pagination — O(1) vs OFFSET O(n)
SELECT * FROM orders WHERE (created_at, id) < (:last_date, :last_id)
ORDER BY created_at DESC, id DESC LIMIT 50;
```

### Performance Rules
1. **Index every WHERE/JOIN/ORDER BY column** — watch for Seq Scan on large tables
2. **EXPLAIN (ANALYZE, BUFFERS) every query** before production
3. **Never `SELECT *`** — select needed columns; enables index-only scans
4. **Connection pooling mandatory** — use PgBouncer/Supavisor (PG forks per connection!)
5. **Cursor pagination** — never use OFFSET for deep pages
6. **Batch operations** — use multi-row INSERT/UPDATE, `unnest()` for bulk
7. **Monitor slow queries** — `pg_stat_statements` extension + `log_min_duration_statement = 500`
8. **Autovacuum tuning** — ensure dead tuples are cleaned; tune `autovacuum_vacuum_scale_factor`
9. **Read replicas** — route SELECT to streaming replica for read-heavy workloads
10. **Avoid N+1** — use JOINs, lateral joins, or batch queries
11. **Cache hot data (Redis)** — invalidate on write; reduce repeated reads

## Advanced Patterns
- **View**: repeated complex JOINs, dashboards, reports — simplify with `CREATE VIEW`
- **Materialized View**: heavy aggregation, dashboards — `CREATE MATERIALIZED VIEW` + `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- **Trigger**: audit log auto-insert, auto-update `updated_at`, sync denormalized data, enforce data integrity
- **Stored Procedure / Function**: batch multi-step operations, reduce round-trips, scheduled jobs via `pg_cron`
- **ORM vs Raw**: use ORM for CRUD; use raw SQL / View / Trigger / Procedure when ORM is too slow or complex

## Gotchas
- `NOT IN (subquery)` with NULLs returns no rows — use `NOT EXISTS` instead
- `VACUUM` and `ANALYZE` are critical — broken autovacuum = table bloat = slow
- `LIKE '%x%'` causes seq scan — use `pg_trgm` GIN index
- Default `random_page_cost = 4.0` is for HDD — set to 1.1 for SSD

## References
- https://www.postgresql.org/docs/17/
- https://www.postgresql.org/docs/17/performance-tips.html
