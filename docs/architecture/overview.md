# Architecture overview

```
┌─────────────┐     RSC / Server Actions      ┌──────────────┐
│  Next.js 16 │ ─────────────────────────────▶│   Supabase   │
│  (Vercel)   │◀──── Auth session / Postgres ─│ Auth + PG    │
└──────┬──────┘                               └──────────────┘
       │
       │ Presigned PUT (no file bytes via Vercel)
       ▼
┌──────────────┐     Public GET (today)       ┌──────────────┐
│ Browser /    │ ────────────────────────────▶│ Cloudflare   │
│ Guest phone  │                              │ R2 bucket    │
└──────────────┘                              └──────────────┘
```

## Layers

| Layer | Role |
|-------|------|
| `app/[locale]/…` | UI: marketing, auth, admin dashboard, guest event, demo |
| `app/actions/*` | Server Actions (auth, uploads, settings, event page, dashboard) |
| `lib/supabase` | SSR + browser clients |
| `lib/storage/r2` | S3 client, public URL helpers, head/delete |
| `lib/permissions` | Entitlements, upload/download windows, storage math |
| `lib/schemas/database` | Zod shapes for query results |
| `lib/pricing` / `lib/plan-features` | Prices and marketing copy values |
| `supabase/schema.sql` + `migrations/` | Canonical DB + incremental changes |

## Auth model

- **Couples**: Supabase email auth → `profiles` row via trigger.
- **Guests**: anonymous; RLS allows public `SELECT` on events/uploads and `INSERT` on uploads.

## i18n

- Locales: `pl` (default), `en`
- `localePrefix: "as-needed"`; marketing slugs localized in `i18n/routing.ts`

## Planned integrations

- **Stripe**: payments / plan purchase (not fully wired)
- **Resend**: transactional email (dependency/stack intent; wire as needed)
