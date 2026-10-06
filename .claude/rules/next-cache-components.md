---
paths:
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
  - "app/**/route.ts"
  - "app/actions/**"
  - "next.config.ts"
---

# Cache Components and streaming (Next 16.3)

`cacheComponents: true`. Everything is **dynamic by default**, and caching is opt-in.

- Wrap uncached async work and runtime APIs (`cookies`, `headers`, `searchParams`, awaited `params`) in `<Suspense>` with a skeleton fallback. Without it you get a blocking-route error.
- **Stream per section.** Put each fetch inside the async component that renders its data, under its own `<Suspense>`. Don't await everything at the page top. The dashboard pages show the pattern: `XxxContent` is an async component, `XxxSkeleton` lives in the same file, and the page wraps one in the other.
- To cache, use `'use cache'` together with `cacheLife(...)`, and add `cacheTag` when needed. Read runtime values outside the cached scope and pass them in as arguments. Use `'use cache: private'` only as a last resort.
- After a mutation, call `updateTag` or `revalidateTag`. Auth actions currently use `revalidatePath("/", "layout")`.
- **Don't use** `export const dynamic`, `revalidate`, `fetchCache` or `runtime = "edge"`.
- If a route isn't ready to migrate, set `export const instant = false` temporarily.

The repo patterns are in `docs/reference/next-cache-cheatsheet.md`. Official docs: https://nextjs.org/docs/llms.txt. Don't trust memory of older Next caching APIs.
