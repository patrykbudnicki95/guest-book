# multi-file-entries

Guests can send several photos and videos with one wish, or a wish on its own, and both the guest gallery and the dashboard show them as one entry.

## Added

- A guest can pick up to 10 photos/videos in one go, see previews, remove any before sending, and follow a single progress bar while they upload 3 at a time.
- Text-only wishes: a guest can send a message without any photo.
- Tapping an entry in the guest gallery (or its preview in the dashboard) opens a drawer with a swipeable carousel, the guest's name and the wish. The dashboard viewer downloads the current file while the download window is open.

## Changed

- The guest gallery shows one tile per entry, with a file-count badge; text-only wishes get their own quote tile.
- The dashboard gallery lists one row per entry with stacked thumbnails and a file count; deleting a row deletes the whole entry and its files.
- If some files fail to upload, the entry is still saved with the rest and the guest is told how many were missed. The storage quota is checked for the whole batch before anything uploads.
- The `/demo` sandbox follows the same entry model. Existing demo data in the browser is reset once.

## Manual steps

- Run `supabase/migrations/004_add_entries.sql` in the Supabase SQL editor. It turns every existing upload into its own entry.
