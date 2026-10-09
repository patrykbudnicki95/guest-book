-- Save the date: an animated announcement page the couple sends months before
-- the wedding. It comes with Gold or as a one-off add-on on any plan, so events
-- get an `addons` list next to `plan_id`. The page itself lives in its own table
-- (like event_seating) so a draft stays hidden from guests at the RLS level.

ALTER TABLE events ADD COLUMN IF NOT EXISTS addons TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_addons_check;
ALTER TABLE events ADD CONSTRAINT events_addons_check
  CHECK (addons <@ ARRAY['saveTheDate']::TEXT[]);

CREATE TABLE IF NOT EXISTS event_save_the_date (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  template TEXT NOT NULL DEFAULT 'envelope',
  -- { names, eyebrow, message, location, photo_url, music_url, font,
  --   colors: { background, text, accent }, show_countdown, show_calendar }
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Off until the couple is happy with it; guests only read published rows.
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_save_the_date DROP CONSTRAINT IF EXISTS event_save_the_date_template_check;
ALTER TABLE event_save_the_date ADD CONSTRAINT event_save_the_date_template_check
  CHECK (template IN ('envelope', 'editorial', 'polaroid', 'botanical'));

ALTER TABLE event_save_the_date ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published save the date is viewable by everyone, drafts by the owner" ON event_save_the_date;
CREATE POLICY "Published save the date is viewable by everyone, drafts by the owner"
  ON event_save_the_date FOR SELECT
  USING (
    is_published
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_save_the_date.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can insert save the date" ON event_save_the_date;
CREATE POLICY "Event owners can insert save the date"
  ON event_save_the_date FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_save_the_date.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can update save the date" ON event_save_the_date;
CREATE POLICY "Event owners can update save the date"
  ON event_save_the_date FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_save_the_date.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can delete save the date" ON event_save_the_date;
CREATE POLICY "Event owners can delete save the date"
  ON event_save_the_date FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_save_the_date.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_event_save_the_date_updated_at ON event_save_the_date;
CREATE TRIGGER update_event_save_the_date_updated_at
  BEFORE UPDATE ON event_save_the_date
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT ON public.event_save_the_date TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_save_the_date TO authenticated;
