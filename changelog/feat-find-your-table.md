# feat/find-your-table

Gold events get "Znajdź swój stół": the couple builds a seating plan and guests look up their table and seat on the event page.

## Added

- New dashboard tab "Stoły": add up to the plan's table limit (100 on Gold), pick round, rectangular or one-sided rectangular, set up to 100 seats and paste guest names one per line in seat order.
- Each table is drawn live with numbered seats (plain HTML/CSS, no library); free seats are dashed, and long tables scroll sideways to the found seat.
- "Show the plan to guests" switch, off by default, plus a note that anyone with the event link will see the names.
- Guests get a "Twój stół" button in the event page header leading to a separate page (`/e/<id>/tables`) that lists every table with its guests. The search box (ignoring case and Polish characters) narrows it to the matching tables and highlights the seats.
- An unpublished plan is hidden by the database itself (RLS), not only in the UI; the plan is deleted together with its event.
- The demo includes a published sample plan and the same editor.

## Manual steps

- Run `supabase/migrations/005_add_event_seating.sql` in the Supabase SQL editor.
