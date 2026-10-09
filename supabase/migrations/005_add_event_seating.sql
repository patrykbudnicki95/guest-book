-- "Find your table" (Gold): the couple's seating plan, searchable by guests.
-- It lives in its own table rather than on `events` because events are readable
-- by everyone, and an unpublished plan must stay hidden from guests at the RLS
-- level, not only in the UI.

CREATE TABLE IF NOT EXISTS event_seating (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  -- [{ id, name, shape: 'round' | 'rectangle' | 'head', seats: string[] }]
  tables JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Off until the couple finishes the plan; guests only read published rows.
  is_published BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE event_seating ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published seating is viewable by everyone, drafts by the owner" ON event_seating;
CREATE POLICY "Published seating is viewable by everyone, drafts by the owner"
  ON event_seating FOR SELECT
  USING (
    is_published
    OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seating.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can insert seating" ON event_seating;
CREATE POLICY "Event owners can insert seating"
  ON event_seating FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seating.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can update seating" ON event_seating;
CREATE POLICY "Event owners can update seating"
  ON event_seating FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seating.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event owners can delete seating" ON event_seating;
CREATE POLICY "Event owners can delete seating"
  ON event_seating FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_seating.event_id
      AND events.owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_event_seating_updated_at ON event_seating;
CREATE TRIGGER update_event_seating_updated_at
  BEFORE UPDATE ON event_seating
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

GRANT SELECT ON public.event_seating TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_seating TO authenticated;
