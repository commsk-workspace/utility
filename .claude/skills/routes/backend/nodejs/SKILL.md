# Node.js — SKILL

## Overview
JavaScript runtime built on V8 for server-side applications.
Event-driven, non-blocking I/O. Node 22 LTS is current stable (active LTS through 2027).

## Setup / Base Project
```bash
# Node.js 22 LTS (use nvm or fnm)
fnm install 22 && fnm use 22
# Express 5 (stable since 2024)
npm init -y && npm install express@5
# Fastify (high-performance alternative)
npm init -y && npm install fastify
```

## Core Concepts
- **Event Loop** — single-threaded; never block with sync operations
- **async/await** — prefer over callbacks and raw Promises
- **Streams** — use for large files/data: `pipeline(readable, transform, writable)`
- **Error Handling** — always wrap async routes; Express 5 auto-catches async errors
- **Environment** — `process.env` with `dotenv`; never hardcode secrets
- **ESM** — use `"type": "module"` in package.json for native ES modules
- **Worker Threads** — offload CPU-heavy tasks via `worker_threads`
- **Built-in test runner** — `node --test` stable since Node 20+
- **Permission model** — `--experimental-permission` for restricting fs/net access
- **Watch mode** — `node --watch app.js` for dev (no nodemon needed)

## Common Patterns
```javascript
// Express 5 API (auto async error handling)
import express from 'express';
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res) => {
  const users = await db.user.findMany();
  res.json({ data: users });
});

// Express 5 catches async errors automatically
app.use((err, req, res, next) => {
  res.status(500).json({ error: { message: err.message } });
});
app.listen(3000);
```

## Gotchas
- Unhandled promise rejections crash the process — always catch
- `express.json()` has 100kb default limit — increase for file uploads
- Use `AbortController` for request cancellation and timeouts
- Avoid `fs.readFileSync` in request handlers — use `fs.promises` instead
- Express 5 removes `app.del()`, changes `req.query` to getter — check migration guide

## Security
- Use `helmet` middleware for security headers (CSP, HSTS, X-Content-Type-Options)
- Configure `cors` with explicit origins — never allow `*` with credentials
- Apply rate limiting (`express-rate-limit` / `@fastify/rate-limit`) on all public endpoints
- Validate request bodies with `zod`, `express-validator`, or `ajv` — never trust raw input
- Always use latest stable Node.js LTS — run `npm audit` before deploy

## References
- https://nodejs.org/docs/latest-v22.x/api/
- https://expressjs.com/
- https://fastify.dev/docs/latest/
