# Data model

Source of truth: `supabase/schema.sql` (includes migration-era columns). Apply increments from `supabase/migrations/` on existing DBs.

## Tables

### `profiles`

| Column | Notes |
|--------|--------|
| `id` | PK → `auth.users` |
| `email` | |
| `subscription_status` | Legacy-ish (`free` default); **plans live on events**, not here |
| `created_at`, `updated_at` | |

### `events`

| Column | Notes |
|--------|--------|
| `id` | UUID PK (guest access key) |
| `owner_id` | → `profiles` |
| `names`, `date`, `location` | |
| `qr_code_url`, `theme_color` | |
| `cover_photo_url`, `welcome_message` | Event page |
| `schedule`, `menu` | JSONB |
| `plan_id` | `basic` \| `silver` \| `gold` (default `basic`) |
| `storage_used_bytes` | Denormalized; maintained by trigger on `uploads` |
| `is_active` | |
| `created_at`, `updated_at` | |

### `uploads`

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `event_id` | → `events` |
| `file_url`, `thumbnail_url` | R2 public URLs today |
| `media_type` | `image` \| `video` |
| `file_size_bytes` | Used for quota |
| `guest_name`, `caption` | |
| `created_at` | |

## RLS (summary)

| Table | Read | Write |
|-------|------|--------|
| `profiles` | Own row | Own update |
| `events` | Everyone | Owner insert/update/delete |
| `uploads` | Everyone | Anyone insert; owner delete |

Also: table `GRANT`s for `anon` / `authenticated` (see schema).

## Triggers

- `handle_new_user` — create profile on signup
- `sync_event_storage_used` — keep `events.storage_used_bytes` in sync
- `update_updated_at_column` — profiles & events

## App Zod schemas

Query result shapes: `lib/schemas/database.ts`. Always `safeParse` before use (see Cursor rule `zod-validation`).
