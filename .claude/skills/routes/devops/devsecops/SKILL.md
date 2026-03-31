# DevSecOps — SKILL

## Overview
CI/CD pipelines with GitHub Actions, Docker containerization, Infrastructure as Code,
secrets management, and supply-chain security. Secure-by-default automation workflows.

## Setup / Base Project
```bash
# GitHub Actions — create workflow directory
mkdir -p .github/workflows

# Docker — verify installation
docker --version          # 27.x+
docker compose version    # v2.32+

# Terraform (IaC)
terraform -version        # 1.10+
```

## Core Concepts
- **GitHub Actions**: triggers (`push`, `pull_request`, `schedule`, `workflow_dispatch`), reusable workflows, composite actions
- **Docker**: multi-stage builds, distroless/Alpine base images, `.dockerignore`, BuildKit caching
- **Secrets**: never hardcode — GitHub Secrets, HashiCorp Vault, AWS SSM, or `.env` (gitignored)
- **IaC**: Terraform 1.10+ or Pulumi; remote state (S3/GCS); use `terraform plan` before `apply`
- **Supply chain**: pin action SHAs (`actions/checkout@<sha>`), Dependabot/Renovate, SLSA provenance
- **Least privilege**: CI tokens scoped to minimum required permissions via `permissions:` block

## Common Patterns
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
permissions: { contents: read }
jobs:
  build:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm test
```
```dockerfile
# Multi-stage Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
CMD ["dist/main.js"]
```

## Gotchas
- Pin action versions by SHA, not tag — prevents supply-chain attacks
- Use `npm ci` (not `npm install`) in CI for reproducible installs
- Docker layer cache: copy `package*.json` before source for faster rebuilds
- Never store secrets in Docker image layers — use runtime env or mounted secrets
- Set `permissions:` at workflow level to restrict GITHUB_TOKEN scope

## Security
- Scan container images with Trivy or Snyk before pushing to registry — block critical CVEs
- Run dependency audit in CI (`npm audit`, `pip audit`, `composer audit`) — fail on high-severity
- Use Dependabot or Renovate for automated dependency updates with auto-merge for patches
- Sign Docker images and verify signatures in deployment — prevent tampered image pulls
- Scan IaC (Terraform/Pulumi) with `tfsec` or `checkov` to catch misconfigurations before apply

## References
- https://docs.github.com/en/actions
- https://docs.docker.com/build/building/multi-stage/
- https://developer.hashicorp.com/terraform/docs
