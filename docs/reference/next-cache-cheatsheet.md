# Next.js Cache Components — cheatsheet (16.3.2)

Repo: `cacheComponents: true` in `next.config.ts`. Official index: [next-cache-components.md](./next-cache-components.md).

## Mental model

- **Dynamic by default** — all server code runs at request time unless you cache or prerender it.
- Build produces a **static shell** (App Shell). Uncached async work streams inside `<Suspense>`.
- Dev/build surfaces **blocking-route** insights when a route would not render instantly — fix with Suspense or `use cache`.

## Patterns in this repo

| Intent | Pattern |
|--------|---------|
| Fresh data every request | Async component + `<Suspense>` (no `use cache`) |
| Shared / slow-changing data | `'use cache'` + **`cacheLife(...)`** (always pair them) |
| Data reused across components | Data-level cache: `'use cache'` on `getX()` in `lib/` |
| Whole page/section cache | UI-level cache: `'use cache'` at top of component body |
| `cookies` / `headers` / `searchParams` / dynamic `params` | `<Suspense>` around the subtree, **or** extract values and pass as args to a cached function |
| Cookie/header reads that must be cached | `'use cache: private'` (rare; see official docs) |
| Durable cache across serverless instances | `'use cache: remote'` (platform handler; not default) |
| After mutation | `updateTag` (same request) or `revalidateTag` (SWR) |
| Tag cached work | `cacheTag('…')` inside the cached scope |
| Unique per request (`random`, `Date.now`, UUID) | `await connection()` then compute — inside `<Suspense>` |

## Don't

- `export const dynamic`, `revalidate`, `fetchCache`
- `runtime = 'edge'` — Cache Components requires Node.js
- `'use cache'` in the same scope as `cookies()` / `headers()` / raw runtime APIs (extract args instead)
- Rely on in-memory cache surviving between serverless requests — use `remote` if you need durability

## Incremental migration

If a route isn't ready: `export const instant = false` on that segment. Codemod: `npx @next/codemod@canary cache-components-instant-false ./app`.

## Metadata & route handlers

- `generateMetadata` / `generateViewport`: same rules as pages — cache or Suspense uncached access.
- `GET` Route Handlers follow the same prerendering model when Cache Components is on.

## When stuck

1. Read the dev overlay **blocking-route** card (links to official walkthrough).
2. Official migration: https://nextjs.org/docs/app/guides/migrating-to-cache-components
3. Agent index: https://nextjs.org/docs/llms.txt
