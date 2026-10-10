-- Apps instead of plans. An event now owns a list of products: single apps
-- ('guestbook', 'saveTheDate', 'seating') and/or 'gold', which grants every
-- app. This replaces `plan_id` (Basic / Silver / Gold) and `addons`.
--
-- It also closes a hole: owners could UPDATE any column of their own event,
-- including what they paid for. Owners now get column-level INSERT/UPDATE
-- privileges that leave out `products` and `storage_used_bytes`; only the
-- service role (checkout, the dev switcher) and SECURITY DEFINER triggers can
-- change those.

ALTER TABLE events ADD COLUMN IF NOT EXISTS products TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_products_check;
ALTER TABLE events ADD CONSTRAINT events_products_check
  CHECK (products <@ ARRAY['guestbook', 'saveTheDate', 'seating', 'gold']::TEXT[]);

-- Backfill while the old columns still exist: Gold stays Gold, Basic and Silver
-- become the guestbook app, and the save the date add-on carries over.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'plan_id'
  ) THEN
    UPDATE events
      SET products = CASE WHEN plan_id = 'gold' THEN ARRAY['gold'] ELSE ARRAY['guestbook'] END
      WHERE products = '{}';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'addons'
  ) THEN
    UPDATE events
      SET products = products || ARRAY['saveTheDate']
      WHERE 'saveTheDate' = ANY(addons)
        AND NOT ('gold' = ANY(products))
        AND NOT ('saveTheDate' = ANY(products));
  END IF;
END $$;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_addons_check;
ALTER TABLE events DROP COLUMN IF EXISTS addons;
ALTER TABLE events DROP COLUMN IF EXISTS plan_id;

-- Owners may write only the columns they edit in the dashboard. Supabase's
-- default privileges grant table-wide writes to anon and authenticated, so both
-- are revoked first (a table-level REVOKE also clears column grants).
REVOKE INSERT, UPDATE ON public.events FROM anon, authenticated;
GRANT INSERT (
  owner_id, names, date, location, qr_code_url, theme_color,
  cover_photo_url, welcome_message, schedule, menu, is_active
) ON public.events TO authenticated;
GRANT UPDATE (
  names, date, location, qr_code_url, theme_color,
  cover_photo_url, welcome_message, schedule, menu, is_active, updated_at
) ON public.events TO authenticated;
