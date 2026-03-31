# Laravel — SKILL

## Overview
PHP full-stack framework (v12+). Eloquent ORM, built-in auth, queues, task scheduling,
and rich ecosystem (Livewire 3, Inertia 2, Sanctum, Reverb for WebSockets).

## Setup / Base Project
```bash
# Requires PHP 8.3+
composer create-project laravel/laravel my-app
cd my-app
php artisan serve                  # dev server at :8000
php artisan make:model User -mcr   # model + migration + controller + resource
# Laravel Herd (recommended local dev on macOS/Windows)
```

## Core Concepts
- **Eloquent ORM** — ActiveRecord pattern; `User::where('active', true)->get()`
- **Migrations** — `php artisan make:migration create_orders_table`
- **Routes** — `routes/web.php` (session), `routes/api.php` (stateless)
- **Controllers** — resource controllers with `--resource` flag
- **Middleware** — simplified in Laravel 11+; define in `bootstrap/app.php`
- **Validation** — `$request->validate(['email' => 'required|email|unique:users'])`
- **Queues** — `dispatch(new ProcessOrder($order))` with Redis/SQS/database drivers
- **Auth** — Sanctum (SPA/API tokens), Breeze/Jetstream (starter kits)
- **Livewire 3** — reactive server-rendered components with `wire:model`
- **Reverb** — first-party WebSocket server (replaces Pusher for self-hosted)

## Common Patterns
```php
// app/Http/Controllers/UserController.php
class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->paginate(20);
        return response()->json($users);
    }
}
```

## Gotchas
- Always use `$fillable` or `$guarded` on models to prevent mass assignment
- N+1 queries — use `with()` eager loading; enable `Model::preventLazyLoading()`
- Queue workers need restart after deploy (`php artisan queue:restart`)
- Laravel 11+ removed `Http/Kernel.php` — middleware configured in `bootstrap/app.php`
- Never store uploaded files in `public/` without validation

## Security
- Always define `$fillable` (whitelist) on models — never leave mass assignment unguarded
- CSRF protection is automatic for web routes — ensure `@csrf` directive in all forms
- Use Sanctum for SPA/API token auth — avoid rolling custom authentication
- Validate all input with `$request->validate()` — never trust raw `$request->input()`
- Always use latest stable Laravel version — run `composer audit` before deploy

## References
- https://laravel.com/docs
- https://livewire.laravel.com/docs
