# Security — SKILL

## Overview
Application security based on OWASP Top 10 (2021), secure code review practices,
authentication/authorization patterns, and supply-chain security. Defense-in-depth approach.

## Setup / Base Project
```bash
# Dependency audit
npm audit                # Node.js
pip-audit                # Python (pip install pip-audit)
# SAST scanning
npx eslint --plugin security .
# Secret scanning
npx secretlint "**/*"
```

## Core Concepts
- **OWASP Top 10 (2021)**: Broken Access Control, Cryptographic Failures, Injection,
  Insecure Design, Security Misconfiguration, Vulnerable Components, Auth Failures,
  Data Integrity Failures, Logging Failures, SSRF
- **Auth**: JWT (short-lived access 15min + refresh token), bcrypt (12+ rounds) or Argon2id for passwords
- **AuthZ**: RBAC or ABAC — check permissions server-side, never trust client
- **Input validation**: whitelist over blacklist, validate type/length/range, use zod/joi schemas
- **Headers**: CORS (strict origin), CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- **Supply chain**: lock files committed, Dependabot/Renovate enabled, audit on CI

## Common Patterns
```typescript
// [security] password hashing with argon2
import argon2 from 'argon2';
const hash = await argon2.hash(plainPassword, { type: argon2.argon2id });
const isValid = await argon2.verify(hash, inputPassword);
```
```typescript
// [security] guard pattern — check role before action
function requireRole(allowedRoles: string[]) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
```

## Gotchas
- Never store JWT secret in code — use env variable or secrets manager
- Always use parameterized queries / ORM — never concatenate user input into SQL
- Rate-limit auth endpoints (express-rate-limit / nestjs-throttler) to prevent brute-force
- Sanitize output (XSS) even if input is validated — defense in depth
- Log auth failures but never log passwords, tokens, or PII
- Rotate secrets and keys periodically — automate rotation where possible

## References
- https://owasp.org/www-project-top-ten/
- https://cheatsheetseries.owasp.org/
- https://jwt.io/introduction
