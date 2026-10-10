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
| `app/[locale]/demo/components/demo-<tab>-tab.tsx` (rendered by `demo/dashboard/<tab>/page.tsx`) | `app/[locale]/(admin)/dashboard/<tab>/components/<tab>-tab.tsx` |
| `app/[locale]/demo/components/demo-guest-page.tsx` | guest page pieces from `app/[locale]/e/[eventId]/` |

- When you change a tab's or guest component's props, callbacks or behaviour, update the demo page and `lib/demo/*` (`types.ts`, `store.ts`, `provider.tsx`, `seed.ts`) in the same change. The build catches a prop mismatch but not a feature that's missing from the demo.
- Demo callbacks mirror the server-action return shapes (`{ success, error? }`). Keep them in sync.
- The demo event owns **Gold** by default, so new features show up unlocked. `?apps=<product>` on any demo link (or the switcher in the demo banner) makes it own just that app, and "Discover" on the demo overview adds apps on the spot. Gate demo pages with `hasApp` on `event.products` like the real ones.
- The demo must never write to Supabase or R2.
- Every demo `page.tsx` and layout stays a **server** file with `export const instant = false`, and its client logic lives in `demo/components/`. `DemoProvider` renders a skeleton until IndexedDB loads, so these segments never render on the server and Next 16.3 otherwise reports them as "dropped from rendering". `instant` can't be exported from a `"use client"` file.
