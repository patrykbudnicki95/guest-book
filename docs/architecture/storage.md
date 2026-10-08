# Storage (Cloudflare R2)

## Rules

1. Never stream file bytes through the Next.js server (Vercel bandwidth).
2. Guests upload with a **presigned PUT** from the browser.
3. Server generates the URL (`PutObjectCommand` + `getSignedUrl`) in `app/actions/upload-actions.ts`.
4. Shared client/helpers: `lib/storage/r2.ts`.

## Flow

1. Guest picks up to `MAX_FILES_PER_ENTRY` files → client asks `getPresignedUrls` for the batch (type, size, event id).
2. Server loads event plan context → `checkUploadAllowed` per file with a running total, so the **whole batch** must fit the quota → returns one URL + key per file, or one rejection reason.
3. Client PUTs to R2, 3 files at a time. A failed file doesn't stop the others.
4. Client calls `saveEntry` with the keys that made it (or none, for a text-only wish). Server `HeadObject`s each for authoritative size, re-checks quota, deletes and skips files that fail, then calls the `create_entry` RPC to insert the entry and its `uploads` rows atomically (trigger updates `storage_used_bytes`).
5. `deleteEntry` deletes the entry row (cascade + trigger release the quota), then the R2 objects.

## Download all (ZIP)

Built in the couple's browser so no bytes pass through Vercel and nothing can time out:

1. `getEventExport` (owner + download window check) pages through the event's entries and returns presigned **GET** URLs on the S3 endpoint (not the public domain, whose CDN cache may hold copies without CORS headers).
2. `gallery/lib/export-zip.ts` fetches each file from R2 and streams it into a ZIP with `client-zip` (stored, not recompressed), plus an offline HTML album of the wishes.
3. Chrome/Edge stream one ZIP to disk via `showSaveFilePicker`; other browsers get ~1 GB parts held in memory.

Requires `GET` in the bucket's CORS policy.

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
