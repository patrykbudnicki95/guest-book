# feat/save-the-date

Couples can build an animated save the date page to send guests months before the wedding. It comes with Gold or as a 100 zł add-on on any plan.

## Added

- New dashboard tab "Save the date" with a live phone preview. Couples pick one of four templates (envelope with a wax seal, magazine cover, developing polaroid, botanical wreath), then edit names, heading, place and message, choose a colour palette or their own colours and a font pairing, upload a photo and background music, and switch the countdown and "add to calendar" buttons on or off.
- Guest page `/e/<id>/save-the-date`: it opens with the template's tap animation (which also starts the music), reveals sections as guests scroll, counts down live and exports to Google Calendar or an .ics file. Never indexed; a draft stays hidden by RLS until "Show to guests" is on.
- Add-ons on events (`events.addons`): `hasFeature` takes the event's add-ons, `PlanLock` shows the add-on price, and the dev plan switcher in Settings can toggle the add-on.
- Indexable marketing page `/save-the-date-online` (`/en/save-the-date`) with a live template switcher (phone and desktop frames), FAQ and pricing, linked from the header, footer, pricing page, sitemap and llms.txt.
- The demo has the same editor (`/demo/dashboard/save-the-date`) and a published sample page (`/demo/save-the-date`).

## Changed

- Gold lists "Animated save the date" as a seventh feature, and the pricing page has an add-ons section.

## Manual steps

- Run `supabase/migrations/006_add_save_the_date.sql` in the Supabase SQL editor.
