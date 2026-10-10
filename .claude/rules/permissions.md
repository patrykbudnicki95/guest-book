---
paths:
  - "lib/permissions/**"
  - "lib/pricing.ts"
  - "lib/plan-features.ts"
  - "app/actions/**"
  - "app/**/dashboard/**"
  - "app/**/e/**"
  - "app/**/demo/**"
  - "app/**/pricing/**"
---

# Products and permissions

An event owns a list of **products** (`events.products`): single apps (`guestbook`, `saveTheDate`, `seating`) and/or `gold`, which grants every app. There are no plan tiers; Basic and Silver are gone.

- `APP_ENTITLEMENTS` in `lib/permissions/entitlements.ts` is the **only** source for features and limits. `ownedApps(products)` (`lib/pricing.ts`) expands Gold.
- Prices are defined only in `PRODUCTS` in `lib/pricing.ts`. Marketing numbers come from the ICU placeholders in `productCopyValues` (`lib/plan-features.ts`), so copy can't promise more than the app allows.
- Never hardcode days, GB, MB, prices or `products.includes("gold")` anywhere else.

```ts
import { hasApp, hasFeature, getLimits, checkUploadAllowed } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";

hasFeature({ products: event.products, feature: "schedule" });
hasApp({ products: event.products, app: "seating" });
getLimits(event.products).storageBytes;
const context = await getEventPlanContext(eventId); // { id, products, date, is_active, storage_used_bytes }
```

- `hasFeature` and `PlanLock` in the UI only control what's shown. They are **not** a security check.
- **Server actions must re-check.** Guest uploads call `checkUploadAllowed` both before presigning and when saving. Owner mutations go through `getEventPlanContext` / `requireOwnedEventFeature`.
- The dashboard navigation shows only owned apps (`app` on each item in `dashboard-nav.tsx`); unowned apps appear in `DiscoverApps` on the overview.
- Owners can't write `events.products` (column-level grants). Change it only with the service-role client in `lib/supabase/admin.ts`: the dev switcher `setEventProducts` (requires `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true`, checked on the server) or, later, the payment webhook.
- To add an app, follow "Adding an app" in `docs/architecture/permissions.md`.
