# Virtual Wedding Guestbook

QR-based wedding guestbook SaaS: guests scan a code, upload photos/videos and wishes — no app install. Couples manage events from a dashboard.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind 4, shadcn/ui, next-intl (`pl` / `en`)
- **Backend:** Supabase (Auth, Postgres, RLS)
- **Storage:** Cloudflare R2 (presigned client uploads)
- **Also planned:** Stripe, Resend

## Getting started

```bash
npm install
# set env vars (see table below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (auth redirects, SEO) |
| `NEXT_PUBLIC_R2_DOMAIN` | Public R2 base URL |
| `R2_ACCOUNT_ID` | Cloudflare account id |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API keys |
| `R2_BUCKET_NAME` | Bucket name |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact page (optional) |
| `NEXT_PUBLIC_ENABLE_PLAN_SWITCHER` | `true` only for local plan testing |

Apply DB from `supabase/schema.sql` (fresh) or run `supabase/migrations/` on an existing project.

### Scripts

| Script | Use |
|--------|-----|
| `npm run dev` | Local development (humans) |
| `npm run lint` | ESLint |
| `npm run build` | Production build (agents verify with this + lint) |

## Docs & AI agents

- **[docs/README.md](./docs/README.md)** — index (product, architecture, engineering, Next cache)
- **[docs/product/roadmap.md](./docs/product/roadmap.md)** — backlog
- **`.cursor/rules/`** — short always-on and file-scoped agent rules
- **`changelog/`** — one file per branch; see `changelog/TEMPLATE.md`

## License

Private / unpublished — not production yet.
