# REST API Design — SKILL

## Overview
REST API design principles covering resource naming, HTTP methods, status codes,
OpenAPI/Swagger documentation, API versioning strategies, and rate limiting.

## Setup / Base Project
```bash
# OpenAPI Generator CLI
npm install -g @openapitools/openapi-generator-cli
# Swagger UI (Express)
npm install swagger-ui-express swagger-jsdoc
# Redoc (modern alternative)
npm install redoc-express
```

## Core Concepts
- **Resources** — nouns, plural (`/users`, `/orders/{id}/items`), no verbs in URLs
- **HTTP Methods** — GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- **Status Codes** — 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401/403, 404, 422, 429, 500
- **Versioning** — URL prefix `/api/v1/` (simplest) or `Accept` header (pure REST)
- **Pagination** — cursor-based (`?cursor=abc&limit=20`) preferred over offset for large datasets
- **Filtering/Sorting** — `?status=active&sort=-createdAt`
- **Rate Limiting** — sliding window; return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- **HATEOAS** — include `_links` for discoverability when appropriate
- **Idempotency** — PUT/DELETE must be idempotent; use `Idempotency-Key` header for POST
- **Content Negotiation** — support `Accept: application/json` and structured error responses

## Common Patterns
```yaml
# openapi.yaml (OpenAPI 3.1.1)
openapi: 3.1.1
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      parameters:
        - in: query
          name: cursor
          schema: { type: string }
        - in: query
          name: limit
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        '200':
          description: OK
```

## Gotchas
- Never expose internal IDs or stack traces in error responses
- Always validate `Content-Type` header; reject unsupported media types (415)
- Use consistent error format: `{ error: { code, message, details } }`
- Rate limit by API key, not just IP (proxies share IPs)
- Version early — retrofitting versioning is painful
- Prefer cursor pagination over offset for datasets that change frequently

## Security
- Enforce authentication on all non-public endpoints — use OAuth 2.0 / JWT with short expiry
- Rate limit by API key (not just IP) — return `429 Too Many Requests` with `Retry-After`
- Validate and sanitize all input — reject unexpected fields, enforce max lengths and types
- Configure CORS with explicit allowed origins — never use `Access-Control-Allow-Origin: *` with credentials
- Never expose stack traces or internal IDs in error responses

## References
- https://spec.openapis.org/oas/v3.1.1.html
- https://restfulapi.net/
- https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design
