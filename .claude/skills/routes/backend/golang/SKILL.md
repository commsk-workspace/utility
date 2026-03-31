# Go (Golang) — SKILL

## Overview
Statically typed, compiled language by Google. Excellent for APIs, microservices,
CLI tools, and concurrent systems. Go 1.24+ (Feb 2025) with enhanced tooling.

## Setup / Base Project
```bash
# Install Go 1.24+
go version
# Initialize module
mkdir my-api && cd my-api
go mod init github.com/user/my-api
# Popular routers: net/http (stdlib enhanced in 1.22+), gin, echo, chi
go get github.com/gin-gonic/gin
```

## Core Concepts
- **Enhanced net/http** (1.22+) — `mux.HandleFunc("GET /users/{id}", handler)` pattern matching
- **Goroutines** — `go func()` for lightweight concurrency
- **Channels** — `ch := make(chan string)` for goroutine communication
- **Interfaces** — implicit implementation; small interfaces preferred
- **Error Handling** — `if err != nil { return err }` pattern; no exceptions
- **Context** — `context.Context` for cancellation, timeouts, request-scoped values
- **Generics** (1.18+) — type parameters for reusable data structures
- **Struct Tags** — `json:"name"` for serialization, `validate:"required"`
- **Clean Architecture** — handler -> service -> repository layers
- **rangefunc** (1.23+) — iterator functions with `for v := range iter {}`

## Common Patterns
```go
// net/http stdlib (Go 1.22+ enhanced routing)
mux := http.NewServeMux()
mux.HandleFunc("GET /api/users", func(w http.ResponseWriter, r *http.Request) {
    users, err := userService.FindAll(r.Context())
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(map[string]any{"data": users})
})
http.ListenAndServe(":8080", mux)
```

## Gotchas
- Always handle errors — never use `_` to discard errors in production code
- Close response bodies: `defer resp.Body.Close()`
- Goroutine leaks — use `context.WithCancel` or `context.WithTimeout`
- `nil` slices are valid but `nil` maps panic on write — always `make(map[...])`
- Go 1.22+ stdlib router reduces need for third-party routers for simple APIs
- Use `sync.Mutex` or channels for shared state — never share memory directly

## Security
- Use `crypto/rand` for secrets and tokens — never `math/rand` for security-sensitive values
- Use `html/template` (not `text/template`) for HTML output to auto-escape XSS
- Validate all input with struct tags (`validate:"required,min=1"`) and a validator library
- Enforce TLS — use `http.ListenAndServeTLS` or reverse proxy with TLS termination
- Always use latest stable Go version — run `govulncheck ./...` before deploy

## References
- https://go.dev/doc/
- https://go.dev/doc/effective_go
- https://gin-gonic.com/docs/
