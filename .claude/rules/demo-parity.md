---
paths:
  - "app/**/dashboard/**"
  - "app/**/demo/**"
  - "lib/demo/**"
  - "app/**/e/**"
---

# The demo renders the real dashboard and guest components

`/demo` is a logged-out sandbox. It renders the **same** components as the app, with state from IndexedDB through `useDemoWorkspace()` (`lib/demo/provider.tsx`) instead of server actions:

| Demo page | Reuses |
| --- | --- |
| `app/[locale]/demo/dashboard/<tab>/page.tsx` | `app/[locale]/(admin)/dashboard/<tab>/components/<tab>-tab.tsx` |
| `app/[locale]/demo/components/demo-guest-page.tsx` | guest page pieces from `app/[locale]/e/[eventId]/` |

- When you change a tab's or guest component's props, callbacks or behaviour, update the demo page and `lib/demo/*` (`types.ts`, `store.ts`, `provider.tsx`, `seed.ts`) in the same change. The build catches a prop mismatch but not a feature that's missing from the demo.
- Demo callbacks mirror the server-action return shapes (`{ success, error? }`). Keep them in sync.
- The demo event is **Gold**, so new plan-gated features show up there unlocked.
- The demo must never write to Supabase or R2.
