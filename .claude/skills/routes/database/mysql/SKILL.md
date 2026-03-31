# MySQL 9.x / 8.4 LTS — SKILL

## Overview
MySQL is the most widely-used open-source RDBMS. Version 9.x (Innovation) and 8.4 LTS bring improved performance defaults, better optimizer hints, and enhanced InnoDB. **Performance is priority #1** — every query must be optimized before deployment.

## Setup / Base Project
```bash
# Install (Docker)
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 mysql:8.4

# Performance-tuned my.cnf
innodb_buffer_pool_size = 70% of RAM    # cache hot data in memory
innodb_buffer_pool_instances = 8        # reduce contention on large pools
innodb_log_file_size = 1G              # larger = fewer flushes, faster writes
innodb_flush_log_at_trx_commit = 2     # async flush — 10x faster writes (trade: 1s data risk)
innodb_io_capacity = 2000              # match SSD IOPS
max_connections = 200
thread_cache_size = 16
```

## Core Concepts
- **InnoDB only** — always use InnoDB engine; never MyISAM
- **PK**: auto-increment BIGINT (UUID as PK = random I/O = slow inserts)
- **Charset**: `utf8mb4` + `utf8mb4_0900_ai_ci` collation always
- **Prepared statements**: parameterized queries only — prevents injection + enables plan caching

## Security
- **Parameterized queries only** — never concatenate user input into SQL strings
- **Least privilege roles**: `app_read` (SELECT), `app_write` (INSERT/UPDATE/DELETE), `migration` (ALTER/CREATE/DROP), `root` (DBA only)
- **Encrypt at rest** (InnoDB tablespace encryption) + **in transit** (TLS/SSL `require_secure_transport = ON`)
- **Never store passwords as plain text** — use bcrypt/argon2 at app layer
- **Audit logging** — enable `audit_log` plugin or trigger-based audit (who/when/what changed)
- **Private network only** — never expose port 3306 to public; use SSH tunnel or VPN
- **Rotate credentials regularly** — automate with secrets manager (Vault, AWS Secrets Manager)
- **Rate limit + connection limit** — `max_user_connections`, `max_connections` per user
- **Input validation at app layer** before any data reaches the database
- **Backup + test restore regularly** — `mysqldump` or Percona XtraBackup; verify restores monthly

## Performance (CRITICAL)
```sql
-- [mysql] ALWAYS run EXPLAIN ANALYZE before deploying any query
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'active';

-- [mysql] composite index — leftmost prefix rule, cover the query
CREATE INDEX idx_orders_status_date ON orders (status, created_at DESC)
  INCLUDE (total_amount, customer_id);

-- [mysql] batch insert — 10-50x faster than single inserts
INSERT INTO logs (level, message, created_at) VALUES
  ('info','msg1',NOW()), ('warn','msg2',NOW()), ('error','msg3',NOW());

-- [mysql] cursor pagination — O(1) vs OFFSET O(n)
SELECT * FROM orders WHERE id > :last_id ORDER BY id LIMIT 50;
```

### Performance Rules
1. **Index every WHERE/JOIN/ORDER BY column** — no full table scans
2. **EXPLAIN ANALYZE every query** before production deployment
3. **Never `SELECT *`** — select only needed columns; enables covering index
4. **Never use OFFSET pagination** — use keyset/cursor pagination
5. **Batch all bulk operations** — INSERT/UPDATE in chunks of 500-1000
6. **Connection pooling mandatory** — use ProxySQL or mysql2 pool
7. **Monitor slow queries** — enable `slow_query_log` with `long_query_time = 0.5`
8. **Read replicas** for read-heavy loads — route SELECT to replica, writes to primary
9. **Avoid N+1** — use JOINs or subqueries instead of looping queries
10. **Cache hot data (Redis)** — invalidate on write; reduce repeated reads

## Advanced Patterns
- **View**: repeated complex JOINs, dashboards, reports — simplify with `CREATE VIEW`
- **Materialized View**: MySQL lacks native support — emulate with table + scheduled refresh
- **Trigger**: audit log auto-insert, auto-update `updated_at`, sync denormalized data, enforce data integrity
- **Stored Procedure**: batch multi-step operations, reduce round-trips, scheduled jobs via Event Scheduler
- **ORM vs Raw**: use ORM for CRUD; use raw SQL / View / Trigger / Procedure when ORM is too slow or complex

## Gotchas
- `GROUP BY` does NOT implicitly sort in 8.4+ — add explicit `ORDER BY`
- `ON DELETE CASCADE` can mass-delete unexpectedly — audit before using
- VARCHAR(255) index limit: 767 bytes on older utf8mb4 configs
- `innodb_flush_log_at_trx_commit = 2` trades 1s durability for massive write speed

## References
- https://dev.mysql.com/doc/refman/8.4/en/optimization.html
- https://dev.mysql.com/doc/refman/9.0/en/
