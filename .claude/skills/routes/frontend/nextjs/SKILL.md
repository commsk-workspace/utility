# Next.js — SKILL

## Overview
Next.js 15 with App Router, React 19, Server Components, and Server Actions.
Full-stack React framework with SSR, SSG, ISR, streaming, Turbopack (stable), and edge runtime.

## Setup / Base Project
```bash
npx create-next-app@latest my-app --typescript --tailwind --app --src-dir
cd my-app && npm run dev  # uses Turbopack by default in v15
```

## Core Concepts
- **App Router** (`app/`): File-based routing with `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Server Components** (default): No client JS shipped, direct DB/API access
- **Client Components**: Add `'use client'` directive for interactivity (hooks, events)
- **Server Actions**: `'use server'` functions for form submissions and mutations
- **Next.js 15**: `fetch()` is no longer cached by default — opt-in with `cache: 'force-cache'`
- **Next.js 15**: `cookies()`, `headers()`, `params`, `searchParams` are now async
- **Next.js 15**: React 19 support, Turbopack dev server stable, `next/form` component
- **Metadata API**: `export const metadata` or `generateMetadata()` for SEO
- **Route Handlers**: `app/api/*/route.ts` with `GET`, `POST`, etc.
- **Partial Prerendering (PPR)**: Combine static shell + dynamic streaming (experimental)

## Common Patterns
```tsx
// app/users/page.tsx — server component (async by default)
export default async function UsersPage() {
  const users = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },
  }).then(r => r.json());
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// app/users/actions.ts — server action
'use server'
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  await db.user.create({ data: { name } });
  revalidatePath('/users');
}
```

## Gotchas
- Server Components cannot use hooks or browser APIs — add `'use client'` when needed
- Do NOT import server-only code in client components — use `server-only` package
- v15 changed caching defaults: `fetch` no longer cached, Route Handlers no longer cached
- `cookies()` and `headers()` are async in v15 — must `await` them
- Dynamic routes use `[slug]` folders, catch-all use `[...slug]`
- Middleware runs on Edge — no Node.js APIs (fs, etc.)

## Security
- Set CSP headers in `next.config.js` or middleware — block inline scripts and unsafe-eval
- Validate all Server Action inputs server-side — never trust client-submitted FormData
- Protect against CSRF in Server Actions — Next.js includes built-in origin checking, but verify config
- Never expose secrets in client components — use `server-only` package for sensitive modules
- Always use latest stable Next.js version — run `npm audit` before deploy

## References
- https://nextjs.org/docs
- https://nextjs.org/blog
