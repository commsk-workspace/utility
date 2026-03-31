# Tester — SKILL

## Overview
Automated testing strategy with Vitest 3.x / Jest 30.x (JS/TS) and pytest 8.x (Python).
Unit, integration, and e2e testing with coverage tracking and test loop methodology.

## Setup / Base Project
```bash
# Vitest (recommended for Vite/modern projects)
npm install -D vitest @vitest/coverage-v8

# Jest (general Node.js / React)
npm install -D jest ts-jest @types/jest

# Playwright (e2e)
npm install -D @playwright/test && npx playwright install

# pytest (Python)
pip install pytest pytest-cov pytest-asyncio
```

## Core Concepts
- **Test pyramid**: many unit tests > fewer integration > minimal e2e
- **Unit test**: isolate single function/component, mock dependencies
- **Integration test**: test modules working together (API + DB, service + repo)
- **E2E test**: simulate real user flow (Playwright preferred over Cypress for new projects)
- **Coverage target**: 80%+ lines — but prioritize critical paths over raw %
- **Test loop**: run -> analyze failure -> fix root cause -> re-run (max 3 rounds, then escalate)
- **AAA pattern**: Arrange, Act, Assert — one assertion per concept

## Common Patterns
```typescript
// [test] Vitest example with proper AAA
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './cart';

describe('calculateTotal', () => {
  it('should sum item prices with tax', () => {
    const items = [{ price: 100 }, { price: 200 }];
    expect(calculateTotal(items, 0.07)).toBe(321);
  });
});
```
```python
# [test] pytest example with parametrize
import pytest

@pytest.mark.parametrize("items,tax,expected", [
    ([{"price": 100}, {"price": 200}], 0.07, 321),
])
def test_calculate_total(items, tax, expected):
    assert calculate_total(items, tax=tax) == expected
```
```bash
# Run with coverage
npx vitest --coverage
pytest --cov=src --cov-report=term-missing
```

## Gotchas
- Do not test implementation details — test behavior and outputs
- Mock external services (API, DB) in unit tests, not in integration tests
- Flaky tests: fix or quarantine immediately — never ignore
- If tests fail 3+ rounds, stop and analyze root cause before continuing
- Keep test files next to source (`cart.test.ts` beside `cart.ts`)
- Playwright > Cypress for new projects — faster, multi-browser, better DX

## Security
- Include security test cases: XSS payload injection, SQL injection strings, auth bypass attempts
- Test authorization boundaries — verify users cannot access other users' resources
- Validate that error responses do not leak stack traces, internal paths, or DB schema
- Test rate limiting and brute-force protection on auth endpoints
- Run `npm audit` / `pip audit` in CI alongside test suite — fail build on critical vulnerabilities

## References
- https://vitest.dev/
- https://jestjs.io/docs/getting-started
- https://docs.pytest.org/en/stable/
- https://playwright.dev/
