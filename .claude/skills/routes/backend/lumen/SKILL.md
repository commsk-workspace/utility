# Lumen — SKILL

## Overview
> **DEPRECATED**: Lumen is officially discontinued. Taylor Otwell announced end-of-life.
> Laravel itself is now lightweight enough for APIs. **Use full Laravel for all new projects.**
> For ultra-lightweight PHP APIs, consider Laravel with `--no-interaction` or API-only mode.

## Migration Path (Lumen → Laravel)
```bash
# Create new Laravel project (API-only)
composer create-project laravel/laravel my-api
cd my-api
# Remove unnecessary frontend scaffolding
php artisan install:api          # install API routes + Sanctum
# Laravel 12 slim mode is faster than Lumen ever was
```

## Recommended Alternatives
- **Laravel (API-only)** — full framework, great DX, same performance with OPcache
- **Laravel + Octane** — Swoole/RoadRunner for persistent workers (10x throughput)
- **API Platform (Symfony)** — auto-generated REST/GraphQL from entities

## If Maintaining Legacy Lumen
```php
// routes/web.php (Lumen syntax)
$router->group(['prefix' => 'api/v1', 'middleware' => 'auth'], function () use ($router) {
    $router->get('/users', 'UserController@index');
    $router->post('/users', 'UserController@store');
});
```

## Migration Checklist (Lumen → Laravel)
- [ ] Replace `bootstrap/app.php` bootstrapping with Laravel's `bootstrap/app.php`
- [ ] Move routes from `$router->` syntax to Laravel `Route::` facade
- [ ] Enable Eloquent/Facades (they're on by default in Laravel)
- [ ] Replace manual middleware registration with Laravel middleware groups
- [ ] Update `composer.json` deps from `laravel/lumen-framework` to `laravel/framework`
- [ ] Run `php artisan optimize` for route/config caching (unavailable in Lumen)

## Gotchas
- Lumen receives no new features or security patches
- Many modern Laravel packages (Livewire, Reverb, Octane) have no Lumen support
- PHP 8.3+ compatibility may break older Lumen versions
- Do not start new projects with Lumen — migrate existing ones to Laravel

## Security
- Lumen receives no security patches — migrate to Laravel immediately for active support
- If maintaining legacy: validate all input, use prepared statements via Eloquent, enable HTTPS
- Use `$fillable` on models to prevent mass assignment vulnerabilities
- Implement middleware-based auth (JWT) — Lumen has no built-in session/CSRF support
- Always use latest stable Laravel version for new projects — run `composer audit` before deploy

## References
- https://laravel.com/docs (recommended replacement)
- https://laravel.com/docs/octane (for high-performance APIs)
