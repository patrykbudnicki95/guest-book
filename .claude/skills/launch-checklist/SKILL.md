---
name: launch-checklist
description: Pre-production launch checklist for this app - removing the Basic Auth gate, turning off the plan switcher, production env vars and Supabase auth URLs, making R2 private with signed URLs so download windows are really enforced, legal pages and indexing. Use when preparing to go live, deploying to production, asked "what's left before launch", or when touching proxy.ts auth, the plan switcher or R2 bucket privacy.
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(git log:*), Bash(npm run lint:*), Bash(npm run build:*)
---

# Launch checklist

The app runs as a private preview. Several things are deliberately "preview only" and **all** of them must flip together at launch. Go through the list, report each item as ✅ done / ❌ open / ⚠️ needs the user (dashboard or account work Claude can't do), and do the code items only when the user asks. Re-check the code each time instead of trusting this file. The state below was true on 2026-10-06.

## 1. Code (Claude can do these)

- [ ] **Remove the Basic Auth gate in `proxy.ts`.** Delete everything below `// NOTE: REMOVE WHOLE CODE BELOW…` up to `export default`, and restore `export default createMiddleware(routing);`. Keep the `config.matcher`. This also removes the `X-Robots-Tag: noindex` header, which is what makes the site indexable.
- [ ] **Leave the plan switcher off.** `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER` must be unset in production (it's checked in `settings-tab.tsx` and on the server in `setEventPlan`). Without payments, every event stays on **Basic**, so decide with the user whether Stripe (roadmap) is a launch blocker.
- [ ] **Make R2 private and use signed URLs.** This is a project, not a toggle. Today `uploads.file_url`, `thumbnail_url` and `events.cover_photo_url` store **public** URLs (`buildPublicUrl`), and the guest grid, dashboard gallery and event cover render them directly. So download windows (`isDownloadOpen`) are only enforced in the UI. Doing this properly means:
  - storing object keys (or deriving them with `fileKeyFromPublicUrl`) and serving every read through a server-generated **signed GET** with a short expiry;
  - enforcing `isDownloadOpen` / upload windows on the server before signing;
  - updating `next/image` `remotePatterns` or switching those images to `unoptimized`;
  - a `db-change` migration if the column semantics change.

  Plan this as its own branch and update `docs/architecture/storage.md` and `permissions.md` "Known gaps" when it's done.
- [ ] **Replace placeholder images.** The homepage hero uses `placehold.co` (`app/[locale]/components/hero-section.tsx`), so check whether `app/actions/mock-actions.ts` is still used and remove it if not. Then drop `placehold.co` from `next.config.ts` `remotePatterns`.
- [ ] **Clean up after the gate.** `changelog/seo-permissions-demo.md` contains the preview credentials. Remove them, and tell the user they're still in git history, so they should change them if the preview is reused.

## 2. Environment (⚠️ the user does these in Vercel / dashboards)

- [ ] `NEXT_PUBLIC_SITE_URL=https://<prod-domain>` in Vercel Production. Without it, canonicals, the sitemap, OG URLs **and signup confirmation emails** fall back to `http://localhost:3000` (`lib/seo/config.ts`, `auth-actions.ts`).
- [ ] All the vars in the README table are set for Production: Supabase URL and anon key, R2 keys, bucket, domain. Set `NEXT_PUBLIC_CONTACT_EMAIL` if the contact page should show an address.
- [ ] Supabase → Authentication → URL configuration: **Site URL** and **Redirect URLs** use the production domain.
- [ ] Every migration in `supabase/migrations/` has been applied to the **production** project (compare with the SQL editor history).
- [ ] R2 bucket **CORS** allows `PUT` from the production origin, or guest uploads fail in the browser.
- [ ] Resend or SMTP is configured for Supabase auth emails. The default Supabase mailer is rate-limited.

## 3. Legal and product (⚠️ the user decides)

- [ ] Privacy policy and cookie information (roadmap). The app stores couples' emails and guests' photos and names, so GDPR applies.
- [ ] Decide whether `/demo` "save to my event" stays a stub at launch.

## 4. After deploy

- [ ] `curl -sI https://<domain>/` returns 200 with no `WWW-Authenticate` or `X-Robots-Tag` header.
- [ ] `/robots.txt` and `/sitemap.xml` show production URLs, not localhost.
- [ ] Sign up with a real email and check the confirmation link goes to the production domain.
- [ ] Do a guest upload from a phone on mobile data.
- [ ] Submit the sitemap in Google Search Console.

Report the open items grouped by who has to act (Claude / user), with launch blockers first.
