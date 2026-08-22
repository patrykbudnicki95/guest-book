# seo-foundation

Gives the app a real SEO foundation plus per-event plan entitlements that the UI, server actions and marketing copy all read from.

## Added

- Locale-aware metadata, crawl files (`robots.txt`, `sitemap.xml`, `llms.txt`, OG image) and indexable marketing pages (`/cennik`, `/pakiety/*`, `/poradnik`, `/wirtualna-ksiega-gosci`).
- `lib/permissions` entitlements table: storage, per-file size, guest upload window, download window and feature flags per plan, including placeholders for Save the Date, games and Find Your Table.
- Real storage accounting (`uploads.file_size_bytes`, `events.storage_used_bytes`) with quota checks on guest upload, R2 `ContentLength` signing, `HeadObject` verification and object deletion on remove.
- Dashboard plan usage card, locked editors for branding/schedule/menu, and a `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER` selector in Settings for testing tiers before Stripe.

## Changed

- Guest galleries, login, signup and the dashboard send `noindex`. Guest uploads now respect the event's plan (photos-only on Basic/Silver, window and quota on every plan).
- Plan prices, feature bullets and FAQ numbers come from `lib/pricing.ts` and `PLAN_ENTITLEMENTS`, so marketing copy cannot drift from what the app actually allows.

## Manual steps

- Add `NEXT_PUBLIC_SITE_URL=https://your-domain.pl` to `.env` and Vercel.
- Run `supabase/migrations/002_add_plan_and_upload_size.sql` in the Supabase SQL editor (adds `plan_id`, size columns and the storage-counter trigger).
- Set `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER=true` locally to change an event's plan from dashboard Settings. Leave it off in production.
