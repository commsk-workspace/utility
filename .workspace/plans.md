# DevTools Utility — Plans

> Updated: 2026-04-02

## Overview

DevTools Utility is a comprehensive collection of 25+ free online developer tools built with Next.js 14, TypeScript, Tailwind CSS, and Prisma. It serves as a "Swiss Army Knife" for developers with tools for formatting, converting, generating, and analyzing code/data.

**Production URL:** https://util.commsk.dev

## Tech Stack

```
Next.js 14 + TypeScript + Tailwind CSS + Radix UI
Prisma 5.22 (MySQL/PostgreSQL)
Monaco Editor + Mermaid 11.3
PM2 (Production)
```

## Systems

| System | Status | Path |
|--------|--------|------|
| Home / Dashboard | Done | `src/app/page.tsx` |
| Mermaid Editor | Done | `src/app/mermaid/` |
| Markdown Editor | Done | `src/app/markdown/` |
| JSON Tools | Done | `src/app/json/` |
| SQL Tools | Done | `src/app/sql/` |
| Data Converter | Done | `src/app/converter/` |
| Crypto Tools | Done | `src/app/crypto/` |
| Text Tools | Done | `src/app/text/` |
| Color Tools | Done | `src/app/color/` |
| CSV Converter | Done | `src/app/csv/` |
| Diff Checker | Done | `src/app/diff/` |
| Regex Tester | Done | `src/app/regex/` |
| Password Generator | Done | `src/app/password/` |
| URL Parser | Done | `src/app/url/` |
| Base64 Encoder | Done | `src/app/base64/` |
| JWT Decoder | Done | `src/app/jwt/` |
| Gradient Generator | Done | `src/app/gradient/` |
| Lorem Ipsum | Done | `src/app/lorem/` |
| API Tester | Done | `src/app/api-tester/` |
| Code Minifier | Done | `src/app/minify/` |
| Image Optimizer | Done | `src/app/image/` |
| Placeholder Gen | Done | `src/app/placeholder/` |
| SVG Optimizer | Done | `src/app/svg/` |
| Share/View Page | Done | `src/app/share/[id]/` |
| Document API | Done | `src/app/api/documents/` |

## Goals

- [x] Fix SVG XSS vulnerability (dangerouslySetInnerHTML)
- [x] Add CORS proxy option for API Tester
- [x] Improve JS minifier (safer regex)
- [x] Fix CSV header parsing consistency
- [x] Fix JWT misleading badge
- [x] Add all tools to homepage (was 8, now 23)
- [x] Add Markdown unsaved changes warning
- [ ] Add more tools (Cron Expression, Epoch Converter, etc.)
- [ ] Add i18n support (TH/EN)
- [ ] Add PWA support for offline usage
- [ ] Add search/filter on homepage

## Backlog Summary

| REQ | Description | Status |
|-----|-------------|--------|
| REQ-001 | Security fixes (SVG XSS, input validation) | Backlog |
| REQ-002 | Feature improvements (JWT verify, API proxy, CSV parser) | Backlog |
| REQ-003 | New tools (Cron, Epoch, QR Code page, etc.) | Backlog |
| REQ-004 | UX improvements (search, PWA, i18n) | Backlog |

## Dependencies

- External: picsum.photos (placeholder images), Mermaid CDN, Monaco CDN
- Internal: Prisma DB connection required for share feature
