# Project Starter — SKILL

## Overview
Project scaffolding checklist, folder structure conventions, and tooling setup.
Get from zero to running dev environment in minutes with modern 2025+ tooling.

## Setup / Base Project
```bash
# Verify core tools
node -v    # 22 LTS (or 20 LTS)
npm -v     # 10+
git --version
```

## Core Concepts
- **Monorepo vs Polyrepo**: monorepo (Turborepo 2.x / Nx 20+) for tightly coupled; polyrepo for independent services
- **Folder structure**: group by feature, not by type (`modules/auth/` not `controllers/authController`)
- **Config first**: `.editorconfig`, `tsconfig.json`, `eslint.config.mjs` (flat config), `.prettierrc` before writing code
- **Git init**: `.gitignore`, branch strategy, commit convention (Conventional Commits) decided upfront
- **Environment**: `.env.example` checked in, `.env` gitignored — document every variable
- **Package manager**: npm 10+, pnpm 9+, or yarn 4+ (Berry) — pick one, commit lockfile

## Common Patterns
```
project-root/
  src/
    modules/          # feature-based grouping
      auth/
      users/
    common/           # shared utilities, guards, pipes
    config/           # app configuration
  test/               # e2e and integration tests
  .github/workflows/  # CI/CD
  .workspace/         # project planning (kanban)
  docker-compose.yml
  package.json
  tsconfig.json
  eslint.config.mjs   # ESLint flat config (v9+)
  .env.example
  .gitignore
```

### Scaffolding Checklist
1. Create repo + `.gitignore` + initial commit
2. Set up package manager + `tsconfig.json`
3. Add ESLint 9+ (flat config) + Prettier + `.editorconfig`
4. Create folder structure (feature-based)
5. Add Docker / `docker-compose.yml` if needed
6. Create `.env.example` with all required variables
7. Set up CI workflow (GitHub Actions)
8. Create `.workspace/` with `plans.md`
9. Add husky + lint-staged for pre-commit hooks

## Gotchas
- Always create `.env.example` — new devs need to know what variables exist
- Pin dependency versions in production (`--save-exact`)
- ESLint 9+ uses flat config (`eslint.config.mjs`) — `.eslintrc` is legacy
- Set up husky + lint-staged early — retrofitting is painful
- Do not over-scaffold — start minimal, add structure as needed

## Security
- Add `.env`, `.env.*`, `!.env.example` to `.gitignore` — never commit secrets to repo
- Create `.env.example` with all required variable names (no real values) as documentation
- Add `npm audit` / `composer audit` / `pip audit` step in CI pipeline from day one
- Include a `SECURITY.md` or responsible disclosure policy in public repos
- Always use latest stable versions of all dependencies — run audit before first deploy

## References
- https://docs.npmjs.com/cli/v10/commands/npm-init
- https://turbo.build/repo/docs
- https://nx.dev/getting-started
- https://eslint.org/docs/latest/use/configure/configuration-files
