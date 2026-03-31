# PHP — SKILL

## Overview
Server-side scripting language. PHP 8.4 (Nov 2024) brings property hooks, asymmetric visibility,
`#[\Deprecated]` attribute, `array_find()`, and improved DOM API. PHP 8.3+ minimum recommended.

## Setup / Base Project
```bash
# Install PHP 8.4+
sudo apt install php8.4 php8.4-pdo php8.4-mbstring php8.4-xml php8.4-curl
# Built-in dev server
php -S localhost:8000 -t public
# Composer (dependency manager)
curl -sS https://getcomposer.org/installer | php
```

## Core Concepts
- **OOP** — classes, interfaces, traits, enums (8.1+), readonly classes (8.2+)
- **Type Safety** — always: `declare(strict_types=1);`
- **PDO** — always use prepared statements, never string interpolation
- **Property Hooks** (8.4) — `public string $name { get => ...; set => ...; }`
- **Asymmetric Visibility** (8.4) — `public private(set) string $name`
- **Enums** — `enum Status: string { case Active = 'active'; }`
- **Fibers** — cooperative multitasking (8.1+) for async patterns
- **Namespaces** — PSR-4 autoloading via Composer
- **Security** — `htmlspecialchars()` for XSS, CSRF tokens, `password_hash(PASSWORD_ARGON2ID)`

## Common Patterns
```php
<?php declare(strict_types=1);

// PDO with prepared statement
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// PHP 8.4 property hooks
class User {
    public string $fullName {
        get => "{$this->firstName} {$this->lastName}";
    }
    public function __construct(
        public readonly string $firstName,
        public readonly string $lastName,
    ) {}
}
```

## Gotchas
- Never use `mysql_*` functions — use PDO with prepared statements
- Always set `declare(strict_types=1)` at file top
- `==` is loose comparison; use `===` for type-safe checks
- `htmlspecialchars($str, ENT_QUOTES, 'UTF-8')` — always specify encoding
- Disable `display_errors` in production; log to file instead
- PHP 8.4 deprecates implicit nullable types — use explicit `?Type` syntax

## Security
- Always use PDO prepared statements — never concatenate user input into SQL strings
- Escape output with `htmlspecialchars($str, ENT_QUOTES, 'UTF-8')` to prevent XSS
- Use `password_hash(PASSWORD_ARGON2ID)` for passwords — never MD5/SHA1
- Implement CSRF tokens for all state-changing forms — validate on every POST
- Set `session.cookie_httponly`, `session.cookie_secure`, `session.cookie_samesite` in php.ini

## References
- https://www.php.net/releases/8.4/
- https://www.php-fig.org/psr/
- https://phptherightway.com/
