# React.js — SKILL

## Overview
React 19 with Vite 6 for fast development. Component-based UI library using JSX and hooks.
Ecosystem: React Router v7, Zustand 5, TanStack Query v5, React Hook Form v7.

## Setup / Base Project
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install
npm run dev
```

## Core Concepts
- **Function components only** — no class components
- **Hooks**: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`
- **React 19**: `use()` hook for promises/context, `useActionState`, `useOptimistic`, `useFormStatus`
- **React 19**: Auto-memoization via React Compiler (no manual `useMemo`/`useCallback` needed)
- **React 19**: `ref` as prop (no `forwardRef` needed), `<Context>` as provider directly
- **State management**: Local state -> Context -> Zustand (escalate as needed)
- **Data fetching**: TanStack Query v5 (`useQuery`, `useMutation`, `useSuspenseQuery`)
- **Routing**: React Router v7 — framework mode with loaders/actions, or library mode
- **Forms**: React Hook Form + Zod for validation, or native form actions with `useActionState`

## Common Patterns
```tsx
// [reactjs] component with TanStack Query and Suspense
function UserList() {
  const { data } = useSuspenseQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// [reactjs] React 19 form action with useActionState
function AddUser() {
  const [state, action, pending] = useActionState(async (prev, formData) => {
    const res = await fetch('/api/users', { method: 'POST', body: formData });
    return res.ok ? { success: true } : { error: 'Failed' };
  }, null);
  return (
    <form action={action}>
      <input name="name" required />
      <button disabled={pending}>{pending ? 'Saving...' : 'Add'}</button>
    </form>
  );
}
```

## Gotchas
- Never mutate state directly — always return new objects/arrays
- Avoid `useEffect` for derived state — use `useMemo` or React Compiler
- Keys must be stable and unique — never use array index for dynamic lists
- `StrictMode` fires effects twice in dev — this is intentional
- React Compiler requires `react-compiler-runtime` and Babel/SWC plugin
- `forwardRef` is deprecated in React 19 — pass `ref` as a regular prop

## Security
- Never use `dangerouslySetInnerHTML` — sanitize with DOMPurify if unavoidable
- Set Content-Security-Policy headers to prevent XSS and script injection
- Validate and sanitize all user input before rendering or sending to API
- Avoid storing tokens in localStorage — use httpOnly cookies or secure session management
- Always use latest stable React version — run `npm audit` before deploy

## References
- https://react.dev
- https://vitejs.dev
- https://tanstack.com/query
- https://reactrouter.com
