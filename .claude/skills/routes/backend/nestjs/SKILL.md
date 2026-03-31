# NestJS — SKILL

## Overview
Progressive Node.js framework (v11+) for scalable server-side apps.
TypeScript-first, decorators, modular architecture. Now supports Node 22+ and ESM natively.

## Setup / Base Project
```bash
npm i -g @nestjs/cli
nest new my-app --strict     # scaffolds with strict TypeScript
nest g resource users        # generates full CRUD (module+controller+service+DTOs)
```

## Core Concepts
- **Modules** — `@Module({ imports, controllers, providers, exports })` organize app
- **Controllers** — `@Controller('users')` handle HTTP routes with `@Get()`, `@Post()`, etc.
- **Providers/Services** — injectable classes with `@Injectable()`, business logic layer
- **Guards** — `@UseGuards(AuthGuard)` for auth/authorization checks
- **Interceptors** — transform response, add logging, caching
- **Pipes** — `ValidationPipe` for DTO validation with `class-validator`
- **DTOs** — `class-validator` + `class-transformer` for request validation
- **ORM** — `@nestjs/typeorm` (TypeORM), `prisma` (Prisma), or `@nestjs/drizzle` (Drizzle)
- **Resource generator** — `nest g resource` creates full CRUD scaffold in one command
- **Fastify adapter** — `@nestjs/platform-fastify` for higher throughput

## Common Patterns
```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Gotchas
- Always enable `whitelist: true` + `forbidNonWhitelisted: true` in ValidationPipe
- Circular dependencies — use `forwardRef(() => Module)` sparingly
- Global pipes/guards set in `main.ts` don't have DI — register in AppModule instead
- `@Res()` decorator disables NestJS response handling — avoid unless necessary
- NestJS 11 dropped Node 16 support — require Node 20+ minimum

## Security
- Enable global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` to strip/reject unknown fields
- Use `@nestjs/helmet` for HTTP security headers (CSP, HSTS, X-Frame-Options)
- Implement Guards for auth — `@UseGuards(JwtAuthGuard)` on all protected routes
- Enable CSRF protection for cookie-based auth with `csurf` middleware
- Always use latest stable NestJS version — run `npm audit` before deploy

## References
- https://docs.nestjs.com/
- https://github.com/nestjs/nest
