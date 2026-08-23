# Storage (Cloudflare R2)

## Rules

1. Never stream file bytes through the Next.js server (Vercel bandwidth).
2. Guests upload with a **presigned PUT** from the browser.
3. Server generates the URL (`PutObjectCommand` + `getSignedUrl`) in `app/actions/upload-actions.ts`.
4. Shared client/helpers: `lib/storage/r2.ts`.

## Flow

1. Guest picks file → client asks server for a presigned URL (type, size, event id).
2. Server loads event plan context → `checkUploadAllowed` → returns URL + public object URL.
3. Client PUTs to R2; UI can be optimistic.
4. Client calls save action; server `HeadObject`s for authoritative size, re-checks quota, inserts `uploads` row (trigger updates `storage_used_bytes`).

## Env vars

| Variable | Purpose |
|----------|---------|
| `R2_ACCOUNT_ID` | S3 API endpoint |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Credentials |
| `R2_BUCKET_NAME` | Bucket |
| `NEXT_PUBLIC_R2_DOMAIN` | Public base URL for objects (also `next/image` remotePatterns) |

## Caveats

- Bucket is **public** for viewing today → download-day limits are UX-only.
- Prefer cautious use of `next/image` against Vercel image optimization limits.
- Always validate MIME/type and size before presign.
