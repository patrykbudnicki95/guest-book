# Permissions & products

## Principles

- What an event may do comes from **`events.products`**, the list of products the couple bought for that event. Products are the apps (`guestbook`, `saveTheDate`, `seating`) and **`gold`**, which grants every app, including apps added later.
- **`APP_ENTITLEMENTS`** (`lib/permissions/entitlements.ts`) is the single source of truth for each app's features and limits. Gold isn't listed there; `ownedApps(products)` in `lib/pricing.ts` expands it.
- **Prices** live only in `lib/pricing.ts` (`PRODUCTS`, PLN). They are placeholders until the research in `docs/product/roadmap.md` is in.
- Marketing numbers use ICU placeholders from `productCopyValues` (`lib/plan-features.ts`), so copy can't promise what the app rejects.
- Owners **can't write `products`**: the `events` table has column-level INSERT/UPDATE grants that leave it out (migration `007_products.sql`). Only the service role changes it: the dev switcher today, the payment webhook later (`lib/supabase/admin.ts`).

## Current entitlements (summary)

| App | Features | Limits |
|--|--|--|
| `guestbook` | guest uploads, gallery, QR, custom branding, schedule, menu, video, QR table cards | 800 GB storage, 200 MB per file, guests upload 14 days after the wedding, 90 days to download, 3 QR table cards |
| `saveTheDate` | save the date page | — |
| `seating` | find your table | 100 tables |
| `gold` | every app above | every limit above |

Limits merge by taking the most generous value across owned apps. An event that owns nothing gets zero everywhere.

## How to check in code

```typescript
import { hasApp, hasFeature, getLimits, checkUploadAllowed } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";

hasFeature({ products: event.products, feature: "schedule" });
hasApp({ products: event.products, app: "seating" });
getLimits(event.products).storageBytes;

const context = await getEventPlanContext(eventId);
// { id, products, date, is_active, storage_used_bytes }
```

| Layer | API | Role |
|-------|-----|------|
| Dashboard navigation | `getOwnedApps` (layout) → `DashboardNav` | Shows only owned apps' tabs; the rest are in "Discover" on the overview |
| UI | `hasFeature`, `PlanLock` | Hide/lock only — not security |
| Guest upload | `checkUploadAllowed` | Presign + save must both call; an event without the guestbook is treated as inactive |
| Owner mutations | `getEventPlanContext` / `requireOwnedEventFeature` | Re-check on server |

## Adding an app

1. Add its id to `APP_IDS` and a price to `PRODUCTS` (`lib/pricing.ts`), and to the `events_products_check` constraint (migration).
2. Add its features to `FEATURES` and an entry in `APP_ENTITLEMENTS`.
3. Give its dashboard tabs `app: "<id>"` in `dashboard-nav.tsx`, gate the UI (`hasFeature` + `PlanLock`) and the server action.
4. Add `products.<id>.{name,tagline}` and `landing.pricing.<id>` to both message files, plus an icon in `discover-apps.tsx`.
5. Demo: it follows `event.products`, and `?apps=<id>` opens a demo of the app alone.

## Known gaps

- **Download window**: gated in gallery UI only. Files use public R2 URLs until the bucket is private and downloads use signed GETs.
- **No checkout yet**: products change only through the dev switcher (`setEventProducts`, runs only if `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true`, server-checked, needs `SUPABASE_SERVICE_ROLE_KEY`) or by hand in Supabase.
- **Upgrade credit** (single-app purchases counted toward Gold) is undecided; see the roadmap.
