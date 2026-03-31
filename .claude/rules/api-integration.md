# API Integration Rules

> Load EVERY TIME before writing any code that calls an API or handles API response

---

## Core Principles

1. **NEVER guess payload** — read the actual API source (route handler, schema, validation) first
2. **NEVER assume field names** — check naming convention (snake_case vs camelCase) per project
3. **NEVER skip required fields** — check validation rules in source before sending
4. **NEVER assume response shape** — some endpoints return string, some return object, some wrap in `{ data: ... }`
5. **ALWAYS show payload + response** — before writing code, document what you send and what you expect back

---

## Pre-Integration Checklist (MUST do before writing code)

### Step 1: Read the Source
- [ ] Find the **endpoint** → route/handler definition, HTTP method, path, accepted params
- [ ] Find the **input validation** → what fields are required, types, constraints
- [ ] Find the **business logic** → what the endpoint does with the data
- [ ] Find the **data model** → DB table/collection structure behind the endpoint
- [ ] Find the **auth layer** → what authentication/authorization is required

### Step 2: Document the Contract
Write this for EVERY endpoint before coding:

```
ENDPOINT: [METHOD] [PATH]
AUTH:     [required auth method | None]
REQUEST:  { field: type (required|optional) }
RESPONSE: { field: type }
EXAMPLE REQUEST:  { actual JSON }
EXAMPLE RESPONSE: { actual JSON }
```

### Step 3: Ask the User
- [ ] What test credentials to use?
- [ ] Is there seed/mock data available?
- [ ] Any fields that need specific values (enums, IDs)?
- [ ] What's the API base URL? (local, staging, production)

### Step 4: Test First
- [ ] Use `curl` or API client to test the endpoint with real payload
- [ ] Verify the response matches expected shape
- [ ] Only THEN write the frontend/client code

---

## Naming Convention Awareness

> Every project may differ — always check before assuming

| Pattern | Example | Check |
|---------|---------|-------|
| Backend snake → Frontend camel | `user_id` ↔ `userId` | Transform layer needed? |
| Same case both sides | `userId` ↔ `userId` | No transform needed |
| Different words | API `quantity` vs UI `qty` | Map explicitly |
| Nested vs flat | `{ user: { name } }` vs `{ userName }` | Flatten/expand? |

**Rule:** Read 1 real response before writing any mapping code.

---

## Service Layer Pattern

- Separate API calls into a dedicated layer — don't scatter `fetch`/`http` calls across components/pages
- **Base URL** from env var — NEVER hardcode
- **Auth token** attached via interceptor or wrapper — not per-call
- **Error handling** centralized — map HTTP status to app errors
- **Types/Schemas** match API contract — define request/response structure from Step 2

---

## Auth Integration Checklist

- [ ] Token storage: httpOnly cookie preferred, fallback to secure storage
- [ ] Attach token: interceptor/middleware, not manual per-request
- [ ] Refresh flow: auto-refresh on 401, queue pending requests
- [ ] Logout: clear token + redirect, invalidate server-side if possible
- [ ] Guard/Role check: verify before calling protected endpoints

---

## Error Handling

| HTTP Status | Action |
|-------------|--------|
| 400 | Show validation errors from response body |
| 401 | Trigger refresh token → retry, or redirect to login |
| 403 | Show "no permission" — don't retry |
| 404 | Show "not found" — check endpoint path |
| 422 | Show field-level errors from response |
| 429 | Backoff + retry with delay |
| 500 | Show generic error — log details for debugging |

**Rule:** Never swallow errors silently. Always show feedback to user or log for debugging.

---

## Common Mistakes to Avoid

| Mistake | Correct |
|---------|---------|
| Hardcode base URL | Use env var (per framework convention) |
| Guess field names | Read API source/docs first |
| Assume response is always JSON object | Could be string, array, or wrapped |
| Forget auth header | Use interceptor, not manual |
| No loading/error state | Always handle Loading/Error/Empty/Success |
| Skip validation on client | Validate before sending — don't rely on server alone |
| Catch error but ignore it | At minimum log + show toast |

---

## Verification Flow

After writing API integration code:

1. Open browser DevTools → Network tab
2. Trigger the action
3. Check request payload matches the documented contract
4. Check response shape matches expected
5. Check for 400/401/403/500 errors
6. If error → read the error message → fix payload → retry

> **Rule:** If you can't verify with real data, DON'T mark the task as done.
