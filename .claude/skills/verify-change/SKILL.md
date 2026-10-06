---
name: verify-change
description: Verify a change is actually done before calling it done - run lint and build, check pl/en message parity, read the diff for checks that were weakened to get green, and state what green does not cover. Use when an implementation or refactor is finished, when asked whether something works or is ready to commit or open a PR, and before reporting success on any multi-file change.
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(npm run lint:*), Bash(npm run build:*), Bash(node -e:*)
---

# Verify a change

A diff that looks right isn't done. A change is done when the gates have run and you saw the result, and you've said plainly what they can't cover. There is no test suite here, so the gates catch less than usual and the manual part of this check matters more.

## 1. Run the gates

```bash
npm run lint
npm run build
```

`next build` type-checks the whole app and catches Cache Components blocking-route errors (uncached data outside `<Suspense>`). Run it even for small changes, because type errors usually show up in a *consumer*, such as a demo page that renders the dashboard tab you changed.

If the build fails because env vars are missing, say that rather than calling it green. A failing gate is a result: report it with its output. Never report a gate as passing if it didn't run.

## 2. Check message parity

If the diff touches `messages/`, both locales must have the same keys:

```bash
node -e 'const f=(o,p="")=>Object.entries(o).flatMap(([k,v])=>typeof v==="object"?f(v,p+k+"."):[p+k]);const pl=new Set(f(require("./messages/pl.json"))),en=new Set(f(require("./messages/en.json")));console.log("missing in en:",[...pl].filter(k=>!en.has(k)));console.log("missing in pl:",[...en].filter(k=>!pl.has(k)))'
```

## 3. Read the diff for quiet weakening

```bash
git diff main...HEAD
git diff
```

Look for these:

- `as any`, `@ts-expect-error`, `// eslint-disable` added to get past a gate
- `safeParse` replaced by `parse`, removed, or the Zod schema loosened (`.optional()`, `z.any()`) to make a query fit
- a plan check that's only in the UI (`hasFeature` / `PlanLock`) with no matching server-action check (`checkUploadAllowed`, `getEventPlanContext`, `requireOwnedEventFeature`)
- a hardcoded plan name, GB/MB number or day count instead of `PLAN_ENTITLEMENTS`
- a user-facing string not in `messages/*.json`, or a navigating `Link`/`redirect` imported from `next/*`
- file bytes routed through a server action instead of a presigned PUT

Any of these can be fine if it's deliberate and explained. If you made one yourself, say so.

## 4. Say what green doesn't cover

Name whichever of these apply:

- **DB change.** The migration in `supabase/migrations/` hasn't been applied anywhere. Check that `schema.sql`, `types/supabase.ts` and `lib/schemas/database.ts` were all updated, and that the changelog lists the SQL under `Manual steps`.
- **RLS.** The build can't see policies. A new table or column that guests read or write needs a policy and grants for `anon`.
- **R2.** Presign, CORS and `HeadObject` only run against a real bucket.
- **Dashboard tab changes.** Check that `app/[locale]/demo/dashboard/*` and `lib/demo/*` were updated to match.
- **Anything a person has to click.** The human does UI testing. Offer the `test-cases` skill.
- **Changelog.** Is `changelog/<branch>.md` present and current?

## 5. Report with evidence

```
Gates: lint ✓  build ✓
i18n:  pl/en keys in sync (or: not touched)
Diff:  no casts/disables added, Zod and server-side plan checks intact
Gaps:  <items from step 4 that apply, or "none">
```

If something failed, lead with the failing gate and its actual output.
