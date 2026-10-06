-- Guests can mark an upload as private: it is then shown only to the couple
-- (the event owner) in the dashboard and never in the public guest gallery.

ALTER TABLE uploads ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- Replace the blanket public read with one that hides private uploads from
-- everyone except the event owner. Guests are `anon`, so they only see public rows.
DROP POLICY IF EXISTS "Uploads are viewable by everyone" ON uploads;
DROP POLICY IF EXISTS "Public uploads are viewable by everyone, private by the owner" ON uploads;
CREATE POLICY "Public uploads are viewable by everyone, private by the owner"
  ON uploads FOR SELECT
  USING (
    NOT is_private
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = uploads.event_id
      AND events.owner_id = auth.uid()
    )
  );
