# feat/save-the-date

Couples can build an animated save the date page to send guests months before the wedding. It's sold as its own app and is included in Gold.

## Added

- New dashboard tab "Save the date" with a live phone preview. Couples pick one of four templates (envelope with a wax seal, magazine cover, developing polaroid, botanical wreath), then edit names, heading, place and message, choose a colour palette or their own colours and a font pairing, upload a photo and background music, and switch the countdown and "add to calendar" buttons on or off.
- Guest page `/e/<id>/save-the-date`: it opens with the template's tap animation (which also starts the music), reveals sections as guests scroll, counts down live and exports to Google Calendar or an .ics file. Never indexed; a draft stays hidden by RLS until "Show to guests" is on.
- Indexable marketing page `/save-the-date-online` (`/en/save-the-date`) with a live template switcher (phone and desktop frames), FAQ and pricing, linked from the header, footer, pricing page, sitemap and llms.txt.
- The demo has the same editor (`/demo/dashboard/save-the-date`) and a published sample page (`/demo/save-the-date`).

## Changed

- Save the date appears on the pricing page as its own app and inside Gold.

## Manual steps

- Run `supabase/migrations/006_add_save_the_date.sql` in the Supabase SQL editor.
