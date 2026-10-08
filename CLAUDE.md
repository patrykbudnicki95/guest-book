# CLAUDE.md

Virtual wedding guestbook SaaS. Guests scan a QR code, open `/e/[eventId]` and upload photos/videos and wishes, with no account. Couples manage events in a dashboard. Not in production yet, so there are **no backward-compatibility requirements**.

**Stack:** Next.js 16.3 App Router (`cacheComponents: true`), React 19 (RSC + Server Actions), TypeScript, Tailwind 4, shadcn/ui, Lucide, sonner, vaul; Supabase (Auth, Postgres, RLS); Cloudflare R2 (presigned uploads); next-intl (`pl` default, `en`); Zod 4; react-hook-form. Stripe and Resend are planned but not wired.

## Commands

- Verify with `npm run lint` and `npm run build`. The build also type-checks.
- **Do not start `npm run dev`.** The human does manual UI testing.
- There is **no test runner**. Don't add Jest/Vitest unless asked.

## Map

```
app/[locale]/(auth)/              login, signup
app/[locale]/(admin)/dashboard/   couple dashboard: overview, gallery, event-page, qr-code, settings
app/[locale]/e/[eventId]/         guest event page (public, noindex)
app/[locale]/demo/                /demo sandbox: state in IndexedDB (lib/demo), no server writes
app/[locale]/{pricing,packages,guides,...}   marketing (indexable)
app/actions/                      server actions, including Supabase reads used by pages
lib/permissions  lib/pricing.ts  lib/plan-features.ts   plans (see .claude/rules/permissions.md)
lib/schemas/database.ts           Zod shapes for every Supabase query result
lib/seo  lib/storage/r2.ts  lib/supabase/{server,client}.ts
supabase/schema.sql + migrations/ canonical DB; types/supabase.ts generated types
messages/{pl,en}.json             translations
proxy.ts                          next-intl middleware + temporary Basic Auth gate
```

## Rules that apply everywhere

- **Zod-validate every Supabase result** with a schema from `lib/schemas/database.ts` (it must match the selected columns). Use `safeParse`, never `parse`. On failure, log `[fnName] Zod validation failed:` with `z.prettifyError`, log the raw JSON, then return a safe default or fail the action. `app/actions/settings-actions.ts` is the reference.
- Fetch in **Server Components**; mutate through **Server Actions** in `app/actions/`. Client components call server actions. They don't call `fetch` or Supabase for app data. The one exception is the browser's direct PUT of a file to a presigned R2 URL.
- Build UI from `components/ui` (shadcn) and don't invent parallel primitives. Design **mobile-first** because guests are on phones. On mobile use `Drawer` instead of `Dialog`. Use `sonner` for toasts. Components are functions with **named exports**; Next's `page`/`layout` default exports are the exception.
- **Colocate.** Code used by one route lives in that route's `components/` and `schemas/`. Code used by two or more routes goes to root `components/` or `lib/`.
- **i18n.** Every user-facing string goes in **both** `messages/pl.json` and `messages/en.json` under the same key. A component reads its own text with `useTranslations` (or `getTranslations` if async), not via string props from the page. This works in server and client components because the layout provides all messages. Pass text as props only to shared components that render different content per caller (`FAQ`, `PricingCard`). Don't add `"use client"` just to translate. Import anything that navigates (`Link`, `redirect`, `useRouter().push`) from `@/i18n/navigation`. Only non-navigating hooks such as `useParams` or `router.refresh()` come from `next/navigation`. Every href must exist in `pathnames` in `i18n/routing.ts`. Marketing slugs are localized (`/cennik` vs `/en/pricing`). `pl` has no URL prefix.
- **`/demo` renders the real dashboard and guest components.** A change to either must update the demo in the same change (see `.claude/rules/demo-parity.md`).
- **Plans live on the event** (`events.plan_id`), not on the profile. Never hardcode plan names, GB or day counts. See `.claude/rules/permissions.md`.

Path-scoped rules in `.claude/rules/` load automatically when you touch matching files: permissions, R2 storage, Cache Components, demo parity.

## Changelog

Each branch has exactly one `changelog/<branch-name>.md`, following `changelog/TEMPLATE.md`. Create it, or update it if it exists, as part of finishing any feature work. It has at most 8 bullets, describes behaviour rather than files, and adds a `Manual steps` section for SQL, env vars or dashboard settings. When work closes a roadmap item, tick it in `docs/product/roadmap.md`.

## Gotchas

- `proxy.ts` puts the whole site behind Basic Auth until launch. Remove that block before going to production.
- `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true` turns on plan switching in Settings. It's for local use only.
- **Any DB change (table, column, constraint, policy, trigger) needs a migration in `supabase/migrations/NNN_<what>.sql`.** Claude can't apply SQL, so end the reply with a clearly marked **"⚠️ Run this migration"** line naming the file and saying to run it in the Supabase SQL editor before testing. The full checklist (about 7 places, including the hand-written `types/supabase.ts`) is in the `db-change` skill.
- R2 objects are public today, so download-window limits only exist in the UI.

## Working principles

- State assumptions. Ask only when different readings lead to materially different work. If a simpler approach exists, say so.
- Write the minimum code that solves the problem: no speculative abstractions, configurability or error handling.
- Make surgical changes. Every changed line should trace to the request. Match the surrounding style. Mention unrelated dead code instead of deleting it.
- Split a component only when the piece carries business logic or is reused.

## Docs and skills

Read on demand; don't preload. Start with `docs/README.md`: `architecture/` covers the data model, permissions and storage, `product/` covers vision and roadmap, and `reference/next-cache-*.md` covers Cache Components.

Skills in `.claude/skills/`: `verify-change` (gates + diff review before calling work done), `seo-requirements` (new or changed indexable pages), `db-change` (any table, column or policy change), `new-guide` (write or translate a guide article), `launch-checklist` (what's left before going live), `test-cases` (manual QA steps for the branch), `pull-request` (GitHub PR title and body). Write new skills with `skill-creator`. Put guidance triggered by editing files under `.claude/rules/` with `paths:`; put guidance triggered by a task in a skill.

When a session uncovers a convention or gotcha this file lacks, or describes wrongly, propose a short edit to the user. Don't rewrite this file silently.
