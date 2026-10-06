---
paths:
  - "lib/storage/**"
  - "app/actions/upload-actions.ts"
  - "app/**/e/**/upload-drawer.tsx"
  - "app/**/dashboard/event-page/**"
---

# Storage (Cloudflare R2)

- **Never send file bytes through the Next.js server** (Vercel bandwidth). The browser PUTs straight to R2 using a **presigned URL**.
- Presigned URLs are created server-side with `PutObjectCommand` + `getSignedUrl` (in `app/actions/upload-actions.ts`, with helpers in `lib/storage/r2.ts`). Sign `ContentLength` too.
- Validate MIME type and size **before** presigning. Plan limits come from `checkUploadAllowed`, which runs again on save.
- On save, the server calls `HeadObject` to get the authoritative size, re-checks quota, then inserts the `uploads` row. A DB trigger maintains `events.storage_used_bytes`. When a row is removed, delete the R2 object as well.
- Guest uploads use optimistic UI.
- The bucket is public today, so any download-window rule only exists in the UI. Be careful with `next/image` on R2 URLs because of Vercel optimization limits.

For more detail, including the env vars, read `docs/architecture/storage.md`.
