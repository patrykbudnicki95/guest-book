# Product vision

## Value proposition

A QR-code web app where wedding guests upload photos/videos and leave wishes in a digital album — no app install. Speed, simplicity, and low bandwidth cost for the couple.

## Roles

### Guest (mobile, unauthenticated)

1. Scans QR → lands on `/e/[eventId]` (locale-aware).
2. No account; access is the event UUID.
3. Opens **Add Memory** drawer → selects up to 10 photos/videos → client gets presigned URLs → uploads to Cloudflare R2.
4. Optional wish / guest name; one entry = one name + one wish + its files. A wish alone (no files) is fine too.
5. Sees a grid of other guests' entries and can open one to swipe through its files.

### Couple (authenticated admin)

1. Signs up / logs in via Supabase Auth.
2. Owns one or more **events**; plan is per event (`events.plan_id`).
3. Dashboard: overview, gallery moderation, event page content, QR/PDF, settings.
4. Payments via Stripe are planned; today plans can be switched only with a local plan-switcher flag.

### Demo mode

`/demo` lets visitors explore guest + dashboard flows with changes stored in the browser only (no server persistence for demo edits). Revisit when new product features ship so the demo stays in sync.

## Non-goals (for now)

- Guest email/password auth
- Enforcing download deadlines on public R2 URLs (UI-only until private bucket + signed GET)
