# feat/products-model

Plans become apps: an event owns single apps (guestbook, save the date, seating plan) or Gold, which grants all of them, and the dashboard shows only what the couple owns.

## Added

- `events.products` replaces `plan_id` and `addons`. Each app has its own features and limits; Gold grants every app, including ones added later. Prices per app and for Gold are placeholders in one place until the market research is in.
- The dashboard navigation shows only the tabs of owned apps. The overview gets a "Discover" section with the other apps, their prices, a demo link and a Gold offer.
- Demos per app: `?apps=guestbook|saveTheDate|seating|gold` on any demo link, a version switcher in the demo banner, and "Add in demo" in Discover so the app appears in the menu right away.
- Guest pages respect owned apps: an event without the guestbook shows "guestbook not active", and seating and save the date pages appear only for their app.

## Changed

- Owners can no longer write what they paid for: `events` INSERT/UPDATE are limited to the columns the dashboard edits. The dev switcher in Settings now has a switch per product and uses the service-role key.
- Pricing page and homepage show four cards (three apps and Gold, with the "instead of" price); copy no longer mentions Basic and Silver.

## Removed

- Basic and Silver, and the per-plan pages `/pakiety/[plan]` (`/en/packages/[plan]`).

## Manual steps

- Run `supabase/migrations/007_products.sql` in the Supabase SQL editor (after `006_add_save_the_date.sql` if that hasn't run yet).
- Add `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API → `service_role` key) to `.env` for the dev product switcher. Server-only; never expose it with a `NEXT_PUBLIC_` prefix.
