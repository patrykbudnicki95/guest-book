---
name: db-change
description: Every file a Supabase schema change has to touch here - numbered idempotent migration, schema.sql, hand-written types/supabase.ts, per-query Zod schemas, RLS policies and GRANTs, the demo seed, and the changelog manual step. Use whenever adding, renaming or removing a table, column, constraint, trigger or policy, or when asked to "store", "persist" or "save" something new in the database.
allowed-tools: Read, Glob, Grep, Bash(ls supabase/migrations:*), Bash(git diff:*)
---

# Changing the database

Nothing here applies SQL automatically, and the build can't see the database. A column that's missing in one of these places shows up as an empty list (the Zod `safeParse` fallback) or as an RLS denial at runtime, not as a build error. Work through every step.

## 1. Migration: `supabase/migrations/NNN_<what>.sql`

- Use the next free number (`ls supabase/migrations`), zero-padded: `003_...`.
- Make it **idempotent**, because it may run against a database that's already partly migrated. Use `ADD COLUMN IF NOT EXISTS`, `DROP CONSTRAINT IF EXISTS` before `ADD CONSTRAINT`, `CREATE OR REPLACE FUNCTION`, and `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`. `002_add_plan_and_upload_size.sql` is the reference.
- Start with a short comment explaining *why* the change exists. Backfill existing rows when a new column depends on them.

## 2. `supabase/schema.sql`: the canonical fresh install

Apply the same change here: edit the `CREATE TABLE` directly rather than appending an `ALTER`. A fresh project built from `schema.sql` must end up identical to an old one that has run every migration.

## 3. Access: RLS policies and GRANTs

A **new table** needs `ENABLE ROW LEVEL SECURITY`, policies, and table `GRANT`s for `anon` / `authenticated` (see the end of `schema.sql`). RLS decides which rows a role can see; the GRANT decides whether it can touch the table at all. Remember that guests are `anon`, so anything they read or insert needs both. A new column on an existing table inherits that table's access, so check that this is acceptable. For example, `events` is readable by everyone.

## 4. `types/supabase.ts`: written by hand, not generated

Update `Row`, `Insert` and `Update` for the table. Keep nullability and defaults consistent: a column with a default is optional in `Insert`.

## 5. Zod schemas: `lib/schemas/database.ts`

The schemas are **per query shape** (`EventSettingsSchema`, `EventFullSchema`, `UploadGuestSchema`, …), and each one matches a specific `.select("...")`. Add the field to the schemas whose selects should return it, then update those `.select()` strings in `app/actions/*` and the pages. If a select and its schema disagree, `safeParse` fails and the UI quietly shows its fallback. For an update path, also extend the `*UpdateSchema` / `*InsertSchema`.

## 6. Demo

`lib/demo/seed.ts` builds an `EventFull` (and the uploads) for `/demo`. Add the new field with a sensible Gold-plan value, or the build fails on the type. If the field is editable, wire it through `lib/demo/store.ts` / `provider.tsx`.

## 7. Docs and changelog

- Update the table in `docs/architecture/data-model.md`, including any trigger or policy.
- In `changelog/<branch>.md`, under **Manual steps**, add: "Run `supabase/migrations/NNN_<what>.sql` in the Supabase SQL editor."

## Done when

`npm run build` passes, and the reply **ends** with this block so it can't be missed:

```
⚠️ Run this migration before testing:
  supabase/migrations/NNN_<what>.sql → Supabase dashboard → SQL editor → paste → Run
  (run it on every environment: local/dev project, preview, production)
Changes access rules: <yes — which policy/grant | no>
Pages that read the changed columns: <list>
```

Until the user confirms they ran it, assume the database doesn't have the change. A "bug" reported in the meantime is probably just the unapplied migration.
