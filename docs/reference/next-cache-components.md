# Next.js Cache Components — official docs index

**Do not paste upstream docs into this repo** — they go stale quickly (the old Dec 2025 dump was removed for this reason).

This project targets **Next.js 16.3.2** with `cacheComponents: true` in `next.config.ts`. For day-to-day work in this codebase, start with [next-cache-cheatsheet.md](./next-cache-cheatsheet.md).

## For humans

| Topic | URL |
|-------|-----|
| Caching overview | https://nextjs.org/docs/app/getting-started/caching |
| Enable flag | https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents |
| `use cache` directive | https://nextjs.org/docs/app/api-reference/directives/use-cache |
| `use cache: remote` | https://nextjs.org/docs/app/api-reference/directives/use-cache-remote |
| `use cache: private` | https://nextjs.org/docs/app/api-reference/directives/use-cache-private |
| `cacheLife` | https://nextjs.org/docs/app/api-reference/functions/cacheLife |
| `cacheTag` / revalidation | https://nextjs.org/docs/app/getting-started/revalidating |
| Migration guide | https://nextjs.org/docs/app/guides/migrating-to-cache-components |
| ISR with Cache Components | https://nextjs.org/docs/app/guides/incremental-static-regeneration-cache-components |
| Auth patterns | https://nextjs.org/docs/app/guides/authentication-with-cache-components |
| Next 16 release notes | https://nextjs.org/blog/next-16 |

## For AI agents

- **Index of all Next docs:** https://nextjs.org/docs/llms.txt
- Prefer fetching the URLs above (or `@`-mentioning them) over relying on a local copy.
- Project-specific rules: `.cursor/rules/next-cache-components.mdc` + [cheatsheet](./next-cache-cheatsheet.md).

## Removed segment configs (16.x)

With Cache Components enabled, replace (do not use):

| Old | New |
|-----|-----|
| `export const dynamic = …` | Remove; use Suspense or `use cache` |
| `export const revalidate = …` | `cacheLife` inside `use cache` |
| `export const fetchCache = …` | `use cache` on the fetch scope |
| `experimental.ppr` | Removed; use `cacheComponents: true` |

Incremental adoption: `export const instant = false` on a segment — see [migrating guide](https://nextjs.org/docs/app/guides/migrating-to-cache-components#opting-out-of-validation).
