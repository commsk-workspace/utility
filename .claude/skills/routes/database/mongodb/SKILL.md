# MongoDB 8.0 — SKILL

## Overview
MongoDB is a document-oriented NoSQL database storing BSON documents. Version 8.0 brings improved queryable encryption, faster aggregation, enhanced sharding balancer, and better change streams. **Performance is priority #1** — every query must use indexes and be profiled.

## Setup / Base Project
```bash
# Install (Docker)
docker run -d --name mongo -p 27017:27017 mongo:8.0

# Atlas (cloud) — recommended for production
# https://cloud.mongodb.com — free tier M0 available

# Enable profiling for slow queries (>100ms)
db.setProfilingLevel(1, { slowms: 100 })
```

## Core Concepts
- **Schema design**: embed for read-heavy (denormalize), reference for write-heavy
- **ESR rule** for compound indexes: Equality -> Sort -> Range (order matters!)
- **Aggregation pipeline**: `$match` early to reduce documents before `$group`/`$lookup`
- **Transactions**: supported on replica sets — use for multi-document atomics
- **Change Streams**: real-time event-driven on collection/database changes

## Security
- **Parameterized queries only** — never concatenate user input into query objects; use driver query builders
- **Least privilege roles**: `read` (find), `readWrite` (CRUD), `dbAdmin` (indexes/schema), `root` (DBA only)
- **Encrypt at rest** (WiredTiger encryption or Atlas encryption) + **in transit** (TLS/SSL `--tlsMode requireTLS`)
- **Never store passwords as plain text** — use bcrypt/argon2 at app layer
- **Audit logging** — enable `auditLog` in mongod config (who/when/what changed); Atlas has built-in audit
- **Private network only** — bind to `127.0.0.1` or VPC; never expose port 27017 to public
- **Rotate credentials regularly** — automate with secrets manager (Vault, AWS Secrets Manager)
- **Rate limit + connection limit** — set `maxIncomingConnections`, app-level rate limiting
- **Input validation at app layer** — sanitize `$` operators to prevent NoSQL injection
- **Backup + test restore regularly** — `mongodump` / Atlas backup; verify restores monthly

## Performance (CRITICAL)
```javascript
// [mongodb] ALWAYS check query plan with explain
db.orders.find({ status: "active" }).explain("executionStats");

// [mongodb] compound index following ESR rule
db.orders.createIndex({ status: 1, createdAt: -1, amount: 1 });

// [mongodb] covered query — all fields in index, no document fetch
db.orders.find(
  { status: "active" },
  { _id: 0, status: 1, createdAt: 1, amount: 1 }
).hint("status_1_createdAt_-1_amount_1");

// [mongodb] batch insert — use ordered:false for max parallel speed
db.logs.insertMany(docs, { ordered: false });

// [mongodb] batch update with bulkWrite — single round trip
db.products.bulkWrite([
  { updateOne: { filter: { sku: "A1" }, update: { $set: { price: 10 } } } },
  { updateOne: { filter: { sku: "A2" }, update: { $set: { price: 20 } } } }
]);

// [mongodb] cursor pagination — avoid skip() for deep pages
db.orders.find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(50);

// [mongodb] aggregation — $match first to reduce pipeline input
db.orders.aggregate([
  { $match: { status: "completed", createdAt: { $gte: startDate } } },
  { $group: { _id: "$customerId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 100 }
]);
```

### Performance Rules
1. **Index every query filter/sort field** — `COLLSCAN` = disaster on large collections
2. **`explain("executionStats")` every query** before production
3. **Follow ESR rule** — Equality, Sort, Range order in compound indexes
4. **Never `skip()` for deep pagination** — use cursor-based with `_id > lastId`
5. **Batch all bulk operations** — `insertMany`, `bulkWrite` with `ordered: false`
6. **Projection always** — return only needed fields; enables covered queries
7. **Connection pooling** — set `maxPoolSize` (default 100); tune for concurrency
8. **`$match` first** in aggregation — reduce documents before expensive stages
9. **Read preference** — route reads to `secondaryPreferred` for read-heavy workloads
10. **Cache hot data (Redis)** — invalidate on write; reduce repeated reads
11. **Avoid unbounded arrays** — embedded arrays that grow = document migration = slow

## Advanced Patterns
- **View**: repeated aggregation pipelines, dashboards — `db.createView()` for reusable read-only queries
- **Materialized View**: emulate with `$merge` / `$out` in scheduled aggregation pipeline for heavy reports
- **Change Streams**: real-time triggers — audit log, sync denormalized data, event-driven architecture
- **Schema Validation**: `$jsonSchema` validator on collection — enforce data integrity at DB level
- **ORM vs Raw**: use Mongoose for schema enforcement + CRUD; use native driver / aggregation for complex pipelines

## Gotchas
- Document size limit: 16MB — use GridFS for larger files
- `$lookup` is expensive — if you need many joins, consider relational DB
- Default write concern `w:1` — use `w:"majority"` for critical writes
- Create indexes BEFORE loading large datasets — background build is slower

## References
- https://www.mongodb.com/docs/manual/
- https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/
