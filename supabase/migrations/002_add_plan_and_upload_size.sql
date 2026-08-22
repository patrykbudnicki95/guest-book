-- Plan-based entitlements: per-event plan plus real storage accounting.

-- Each event is bought as a one-off package, so the plan lives on the event
-- rather than on the profile.
ALTER TABLE events ADD COLUMN IF NOT EXISTS plan_id TEXT NOT NULL DEFAULT 'basic';

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_plan_id_check;
ALTER TABLE events ADD CONSTRAINT events_plan_id_check
  CHECK (plan_id IN ('basic', 'silver', 'gold'));

-- Denormalised counter so quota checks are a single indexed read instead of an
-- aggregate over every upload row. Maintained by the trigger below.
ALTER TABLE events ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE uploads ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION sync_event_storage_used()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE events
      SET storage_used_bytes = storage_used_bytes + NEW.file_size_bytes
      WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE events
      SET storage_used_bytes = GREATEST(0, storage_used_bytes - OLD.file_size_bytes)
      WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE events
      SET storage_used_bytes = GREATEST(
        0,
        storage_used_bytes - OLD.file_size_bytes + NEW.file_size_bytes
      )
      WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_event_storage_used_trigger ON uploads;
CREATE TRIGGER sync_event_storage_used_trigger
  AFTER INSERT OR UPDATE OF file_size_bytes OR DELETE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION sync_event_storage_used();

-- Bring existing events in line with whatever is already in the uploads table.
UPDATE events
  SET storage_used_bytes = COALESCE(
    (SELECT SUM(file_size_bytes) FROM uploads WHERE uploads.event_id = events.id),
    0
  );
