-- Guestbook entries: one guest submission = one name + one wish + 0..10 files.
-- Name, message and privacy move from each file (uploads) to the entry, so a
-- guest can send several photos/videos with one wish, or a wish with no files.

CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_name TEXT,
  message TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_event_id_created_at
  ON entries(event_id, created_at DESC);

ALTER TABLE uploads ADD COLUMN IF NOT EXISTS entry_id UUID REFERENCES entries(id) ON DELETE CASCADE;
-- Carousel order inside an entry; created_at is identical within one insert.
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS sort_order SMALLINT NOT NULL DEFAULT 0;

-- Backfill: every existing upload becomes its own entry, reusing the upload id.
-- Skipped once the old columns are gone (migration already ran).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'uploads' AND column_name = 'guest_name'
  ) THEN
    INSERT INTO entries (id, event_id, guest_name, message, is_private, created_at)
    SELECT id, event_id, guest_name, caption, is_private, created_at
    FROM uploads
    WHERE entry_id IS NULL
    ON CONFLICT (id) DO NOTHING;

    UPDATE uploads SET entry_id = id WHERE entry_id IS NULL;
  END IF;
END $$;

ALTER TABLE uploads ALTER COLUMN entry_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_entry_id ON uploads(entry_id);

-- The old SELECT policy reads uploads.is_private, so it goes before the column.
DROP POLICY IF EXISTS "Public uploads are viewable by everyone, private by the owner" ON uploads;

ALTER TABLE uploads
  DROP COLUMN IF EXISTS guest_name,
  DROP COLUMN IF EXISTS caption,
  DROP COLUMN IF EXISTS is_private;

-- Files follow their entry's visibility.
DROP POLICY IF EXISTS "Uploads are viewable when their entry is" ON uploads;
CREATE POLICY "Uploads are viewable when their entry is"
  ON uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      JOIN events ON events.id = entries.event_id
      WHERE entries.id = uploads.entry_id
      AND (NOT entries.is_private OR events.owner_id = auth.uid())
    )
  );

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public entries are viewable by everyone, private by the owner" ON entries;
CREATE POLICY "Public entries are viewable by everyone, private by the owner"
  ON entries FOR SELECT
  USING (
    NOT is_private
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = entries.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert entries" ON entries;
CREATE POLICY "Anyone can insert entries"
  ON entries FOR INSERT
  WITH CHECK (true);

-- Deleting an entry cascades to its uploads; the storage trigger still fires.
DROP POLICY IF EXISTS "Event owners can delete entries" ON entries;
CREATE POLICY "Event owners can delete entries"
  ON entries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = entries.event_id
      AND events.owner_id = auth.uid()
    )
  );

-- Inserts an entry and its files in one transaction. Guests (anon) can't
-- delete, so two separate inserts could leave a half-saved entry behind.
-- SECURITY INVOKER keeps RLS and GRANTs in force.
CREATE OR REPLACE FUNCTION create_entry(p_entry JSONB, p_uploads JSONB)
RETURNS VOID
LANGUAGE sql
SECURITY INVOKER
AS $$
  INSERT INTO entries (id, event_id, guest_name, message, is_private)
  SELECT id, event_id, guest_name, message, is_private
  FROM jsonb_populate_record(NULL::entries, p_entry);

  INSERT INTO uploads (id, entry_id, event_id, file_url, thumbnail_url, media_type, file_size_bytes, sort_order)
  SELECT id, entry_id, event_id, file_url, thumbnail_url, media_type, file_size_bytes, sort_order
  FROM jsonb_populate_recordset(NULL::uploads, p_uploads);
$$;

GRANT SELECT, INSERT ON public.entries TO anon, authenticated;
GRANT DELETE ON public.entries TO authenticated;
GRANT EXECUTE ON FUNCTION create_entry(JSONB, JSONB) TO anon, authenticated;
