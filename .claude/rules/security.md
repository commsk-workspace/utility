# Security Checklist

> Load alongside coding.md every time you write code

## Dependencies
- Always use **latest stable version** — no deprecated/unmaintained packages
- Run `npm audit` / `pip audit` / `composer audit` before every deploy
- Lock files (`package-lock.json`, `yarn.lock`, `composer.lock`) must be committed
- Review changelogs before upgrading major versions
- Use Dependabot / Renovate for auto-updates

## Input & Output
- Validate + sanitize all user inputs
- Escape output before rendering (prevent XSS)
- Parameterized queries only (prevent SQL Injection)
- No `eval()`, `dangerouslySetInnerHTML`, or raw HTML without sanitization

## Authentication & Authorization
- Passwords: bcrypt/argon2 (no MD5/SHA1)
- JWT: short expiry + refresh token + httpOnly cookie
- RBAC/ABAC — least privilege always
- Rate limit login attempts (prevent brute force)
- MFA for admin/sensitive operations

## Network & Transport
- HTTPS/TLS everywhere — no HTTP
- CORS: whitelist specific origins, no `*` in production
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options
- API keys / secrets must not be hardcoded — use env vars / vault

## Data Protection
- Encrypt sensitive data at rest (AES-256)
- No sensitive data on client side (localStorage/cookie unencrypted)
- PII masking in logs
- Backup + test restore regularly

## Per-Technology Quick Reference
| Tech | Required |
|------|----------|
| React/Vue/Next | sanitize user input, CSP headers, no dangerouslySetInnerHTML |
| Node/Express | helmet, cors whitelist, rate-limit, express-validator |
| NestJS | ValidationPipe + class-validator, Guards, CSRF |
| Laravel | CSRF token, mass assignment $fillable, Sanctum/Passport |
| PHP | prepared statements, htmlspecialchars, session_regenerate_id |
| Flutter/RN | secure storage, certificate pinning, code obfuscation |
| Go | crypto/rand (no math/rand), html/template auto-escape |
| Python | secrets module, SSTI prevention, Bandit scan |
| DB | least privilege users, no exposed ports, audit log |
