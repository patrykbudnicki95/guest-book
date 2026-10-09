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
| Seating plan tables | 0 | 0 | 100 |
| Features | uploads, gallery, QR | + branding, schedule, menu | + video, QR cards, findYourTable, saveTheDate, weddingGames |

`weddingGames` is declared with no consumer yet — intentional.

## Add-ons

One-off products bought on top of a plan live in **`events.addons`** (`text[]`). Prices are in `ADDONS` (`lib/pricing.ts`), and what each unlocks in `ADDON_FEATURES` (`lib/permissions/entitlements.ts`). Today there is one: `saveTheDate` (included in Gold, sold separately for Basic and Silver).

Wherever an add-on can unlock a feature, pass the event's add-ons: `hasFeature({ plan, feature, addons })`. `getEventPlanContext` returns `addons`, so `requireOwnedEventFeature` / `checkOwnedEventFeature` already account for them. `PlanLock` shows the add-on price next to the minimum plan.

## How to check in code

```typescript
import { hasFeature, getLimits, checkUploadAllowed } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";

hasFeature({ plan, feature: "schedule" });
getLimits(plan).storageBytes;

const context = await getEventPlanContext(eventId);
// { id, plan_id, addons, date, is_active, storage_used_bytes }
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
- **Plan switcher**: `setEventPlan` and `setEventAddon` run only if `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true` (server-checked). Dev escape hatch — off in production.
- **Owners can write `plan_id` and `addons` directly**: the `events` UPDATE grant and policy cover every column, so an owner with the anon key could upgrade their own event. Must be closed (column-level grants or a trigger) before payments go live.
