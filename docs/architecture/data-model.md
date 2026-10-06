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

### `entries`

One guest submission: a name, a wish and 0..`MAX_FILES_PER_ENTRY` files. A text-only wish has no uploads.

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `event_id` | → `events` |
| `guest_name`, `message` | Both optional, but an entry needs a message or at least one file (checked in `saveEntry`) |
| `is_private` | Guest's choice on upload. Private entries (and their files) are readable only by the event owner (RLS) |
| `created_at` | |

### `uploads`

The files of an entry.

| Column | Notes |
|--------|--------|
| `id` | UUID PK |
| `event_id` | → `events` (kept for the storage trigger and stats) |
| `entry_id` | → `entries`, `ON DELETE CASCADE` |
| `file_url`, `thumbnail_url` | R2 public URLs today |
| `media_type` | `image` \| `video` |
| `file_size_bytes` | Used for quota |
| `sort_order` | Carousel order inside the entry |
| `created_at` | |

## RLS (summary)

| Table | Read | Write |
|-------|------|--------|
| `profiles` | Own row | Own update |
| `events` | Everyone | Owner insert/update/delete |
| `entries` | Everyone for public rows; owner only for `is_private` rows | Anyone insert; owner delete (cascades to uploads) |
| `uploads` | Same as their entry | Anyone insert; owner delete |

Also: table `GRANT`s for `anon` / `authenticated` (see schema).

## Functions

- `create_entry(p_entry, p_uploads)` — inserts an entry and its uploads in one transaction (`SECURITY INVOKER`, so RLS applies). Guests can't delete, so separate inserts could leave a half-saved entry.

## Triggers

- `handle_new_user` — create profile on signup
- `sync_event_storage_used` — keep `events.storage_used_bytes` in sync (also fires on uploads removed by the entry cascade)
- `update_updated_at_column` — profiles & events

## App Zod schemas

Query result shapes: `lib/schemas/database.ts`. Always `safeParse` before use (see Cursor rule `zod-validation`).
