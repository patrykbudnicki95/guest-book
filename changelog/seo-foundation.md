# seo-foundation

Gives the app a real SEO foundation: locale-aware metadata, crawl files, structured data, and the first indexable marketing and content pages.

## Added

- `lib/seo` module (config, metadata builder with canonical + hreflang, JSON-LD builders) and `lib/pricing.ts` as the single source of truth for plan prices.
- Crawl files: `robots.txt`, `sitemap.xml` with hreflang alternates, `llms.txt`, an OG image generated via `next/og`, and an SVG favicon.
- Indexable marketing pages: `/cennik`, `/pakiety/{basic,silver,gold}`, `/wirtualna-ksiega-gosci`, `/o-nas`, `/kontakt`, each with breadcrumbs and JSON-LD.
- Polish guide hub at `/poradnik` with four articles on a typed TSX content registry; locales without a translation return 404 instead of thin duplicates.
- Localized route slugs through next-intl `pathnames`, so Polish URLs are Polish and English lives under `/en`.

## Changed

- Guest event pages, `/login`, `/signup` and the whole `/dashboard` tree now send `noindex`; guest galleries were previously indexable.
- Header, footer, pricing card and FAQ moved to `components/marketing/` and are shared by every marketing route; nav now links to real pages instead of homepage anchors.
- Prices come from `lib/pricing.ts` instead of the message files, so on-page prices and `Product` structured data cannot drift apart.

## Removed

- `landing.pricing.*.price` and `originalPrice` keys from `messages/pl.json` and `messages/en.json`.

## Manual steps

- Add `NEXT_PUBLIC_SITE_URL=https://your-domain.pl` to `.env` and to Vercel. Until it is set, canonicals and the sitemap point at `http://localhost:3000`.
- Optionally set `NEXT_PUBLIC_CONTACT_EMAIL` to render a real address on `/kontakt` and in `Organization` structured data.
- Fill in the company data placeholders on `/o-nas` (name, address, NIP, REGON).
