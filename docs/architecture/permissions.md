# Permissions & plans

## Principles

- Plan is on **`events.plan_id`**, not the profile. One user can own a Basic event and later a Gold one.
- **`PLAN_ENTITLEMENTS`** (`lib/permissions/entitlements.ts`) is the single source of truth for features and limits.
- **Prices** only in `lib/pricing.ts` (Basic / Silver / Gold, PLN).
- Marketing numbers use ICU placeholders via `planCopyValues` / `planRangeValues` in `lib/plan-features.ts` so pricing copy cannot promise what the app rejects.

## Current entitlements (summary)

| | Basic | Silver | Gold |
|--|-------|--------|------|
| Storage | 100 GB | 400 GB | 800 GB |
| Max file | 50 MB | 100 MB | 200 MB |
| Guest upload window (days after wedding) | 3 | 5 | 14 |
| Download window (days) | 14 | 30 | 90 |
| QR table cards | 0 | 0 | 3 |
| Features | uploads, gallery, QR | + branding, schedule, menu | + video, QR cards, findYourTable, saveTheDate, weddingGames |

Some Gold keys (`saveTheDate`, `weddingGames`, `findYourTable`) are declared with no consumer yet — intentional.

## How to check in code

```typescript
import { hasFeature, getLimits, checkUploadAllowed } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";

hasFeature({ plan, feature: "schedule" });
getLimits(plan).storageBytes;

const context = await getEventPlanContext(eventId);
// { id, plan_id, date, is_active, storage_used_bytes }
```

| Layer | API | Role |
|-------|-----|------|
| UI | `hasFeature`, `PlanLock` | Hide/lock only — not security |
| Guest upload | `checkUploadAllowed` | Presign + save must both call |
| Owner mutations | `getEventPlanContext` / `requireOwnedEventFeature` | Re-check on server |

## Adding a feature

1. Add key to `PLAN_FEATURES` and to the right plans in `PLAN_ENTITLEMENTS`.
2. Gate UI with `hasFeature` (+ `PlanLock` in dashboard).
3. Gate the server action the same way.

## Known gaps

- **Download window**: gated in gallery UI only. Files use public R2 URLs until the bucket is private and downloads use signed GETs.
- **Plan switcher**: `setEventPlan` runs only if `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true` (server-checked). Dev escape hatch — off in production.
