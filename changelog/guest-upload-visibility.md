# guest-upload-visibility

Guests can send a memory privately, so it reaches only the couple instead of the shared guest gallery.

## Added

- "Only for the couple" switch in the guest upload drawer (off by default), with a short note on who will see the memory and a matching success toast.
- Private uploads are hidden from the guest gallery by RLS: anonymous visitors only get public rows, and only the event owner can read private ones.
- The dashboard gallery marks private uploads with a "Private" badge, and the couple sees a lock icon on them when viewing their own event page while logged in.
- `/demo` supports the switch: private demo uploads show in the demo dashboard but not on the demo guest page.

## Changed

- Dashboard gallery column headers are translated instead of always showing in English.

## Manual steps

- Run `supabase/migrations/003_add_upload_visibility.sql` in the Supabase SQL editor (adds `uploads.is_private` and replaces the uploads SELECT policy).
