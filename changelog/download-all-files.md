# download-all-files

Couples can download every photo, video and wish of a wedding in one go, without the export running on (or timing out on) the server. Marketing pages are now prerendered as static HTML.

## Added

- "Download all" in the dashboard gallery (and `/demo`): with several events it asks which one, and it only appears while that event's download window is open (re-checked on the server).
- The ZIP is built in the browser from files fetched straight from R2, so no file bytes pass through Vercel and there is no function timeout, whatever the gallery size.
- One folder per guest entry (`001 Anna Kowalska/01.jpg`, oldest first) plus a `Wishes.html` / `Życzenia.html` album that shows each wish with its photos and videos, offline.
- Chrome and Edge stream a single ZIP of any size to disk; Safari and Firefox get several ZIPs of up to 1 GB, each with its own album.
- Progress (files and bytes), cancel, a leave-page warning while running, and skipped-file reporting instead of failing the whole export.

## Changed

- Home, marketing, guide, package, login, signup and demo pages are fully static (`○`) instead of rendered on every request; the dashboard prerenders its shell and streams user data. `[locale]` is now the root layout and reads the locale via `next/root-params` (replaces the deprecated `setRequestLocale`), which also removes the dev "runtime data" console errors.
- URLs outside any locale get a dedicated 404 page (`global-not-found`), and the footer year is fixed at build time.

## Manual steps

- In the Cloudflare dashboard, R2 bucket → Settings → CORS policy: allow `GET` (and `HEAD`) from the app origins (localhost, preview and production domains), next to the existing `PUT`. Without it every file fetch fails with a CORS error.
