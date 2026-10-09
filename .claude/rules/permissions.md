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
  - "app/**/packages/**"
---

# Plan permissions

Plans live on the **event** (`events.plan_id`: `basic` | `silver` | `gold`), not on the profile.

- `PLAN_ENTITLEMENTS` in `lib/permissions/entitlements.ts` is the **only** source for features and limits.
- Prices are defined only in `lib/pricing.ts`. Marketing numbers come from the ICU placeholders `planCopyValues` / `planRangeValues` in `lib/plan-features.ts`, so copy can't promise more than the app allows.
- Never hardcode days, GB, MB or `plan === "gold"` anywhere else.

```ts
import { hasFeature, getLimits, checkUploadAllowed } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";

hasFeature({ plan, feature: "schedule" });
getLimits(plan).storageBytes;
const context = await getEventPlanContext(eventId); // { id, plan_id, addons, date, is_active, storage_used_bytes }
```

- `hasFeature` and `PlanLock` in the UI only control what's shown. They are **not** a security check.
- **Server actions must re-check.** Guest uploads call `checkUploadAllowed` both before presigning and when saving. Owner mutations go through `getEventPlanContext` / `requireOwnedEventFeature`.
- To add a feature: add it to `PLAN_FEATURES` and to the right plans in `PLAN_ENTITLEMENTS`, then gate the UI (`hasFeature` + `PlanLock`), the server action, and the demo (`lib/demo` runs as Gold).
- **Add-ons** (`events.addons`, `ADDONS` in `lib/pricing.ts`, `ADDON_FEATURES` in entitlements) unlock a feature on any plan. For such a feature (today `saveTheDate`) pass `addons` to `hasFeature`.
- `weddingGames` intentionally has no consumer yet.
- `setEventPlan` only works when `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true`, and that check runs on the server.

For more detail, read `docs/architecture/permissions.md`.
