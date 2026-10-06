---
name: seo-requirements
description: What an indexable page in this app must ship - server-rendered content, buildMetadata with pl/en alternates, JSON-LD via the shared nodes, and a sitemap entry - plus which pages must stay noindex. Load before adding or changing a marketing route or guide under app/[locale], before moving page content into a client component, and whenever asked about SEO, metadata, structured data, canonicals, sitemap, robots or indexing.
allowed-tools: Read, Glob, Grep, Bash(git diff:*)
---

# SEO requirements

The marketing pages (`/`, `/virtual-guestbook`, `/pricing`, `/packages/[plan]`, `/guides`, `/guides/[slug]`, `/about`, `/contact`) are the acquisition channel. A page can look perfect in the browser and still be invisible to crawlers, and neither lint nor build will notice. Copy an existing page rather than starting from scratch. `app/[locale]/pricing/page.tsx` is the reference.

## Checklist for a new indexable page

1. **Route.** Add the pathname to `i18n/routing.ts`, with a localized Polish slug for marketing pages (`/cennik`, `/poradnik`). `pl` has no URL prefix and `en` lives under `/en`.
2. **Server-rendered content.** The page is an async server component that calls `setRequestLocale(locale)` and gets its copy from `getTranslations`. Use `'use client'` only for interactive leaves, never for the text that has to be indexed.
3. **Metadata.** `generateMetadata` returns `buildMetadata({ href, locale, title, description })` from `lib/seo/metadata.ts`. That sets the canonical, hreflang `languages` with `x-default` pointing to `pl`, OpenGraph and Twitter. Copy goes under `metadata.<page>` in both `messages/*.json`.
   - If the page exists in only some locales, pass `availableLocales` so untranslated locales get no hreflang entry. The guides do this.
   - If the dynamic segment differs per locale, pass `hrefByLocale`. Guide slugs are per locale.
   - For the homepage only, pass `absoluteTitle: true` to skip the `| brand` suffix.
4. **JSON-LD.** Build nodes with the helpers in `lib/seo/json-ld.ts` (`breadcrumbListNode`, `itemListNode`, `productNode`, `softwareApplicationNode`, `faqPageNode`, `articleNode`, `organizationNode`, `webSiteNode`) and render one `<JsonLd data={[...]} />` (`components/json-ld.tsx`). An array becomes an `@graph`. Build URLs with `localizedUrl(href, locale)` and never by hand.
5. **Sitemap.** Add the route to `app/sitemap.ts` through `localizedEntries(...)` so every locale cross-links. If it's a key page, add it to `app/llms.txt/route.ts` too.
6. **Prices and plan numbers** come from `lib/pricing.ts` and `planCopyValues` / `planRangeValues`, never from literals in copy.

## Guides

Articles are TSX in `app/[locale]/guides/content/<locale>/` and are registered in `GUIDE_ARTICLES` (`content/index.ts`) with `translations: { pl, en? }`. Adding a translation needs no routing change: the page, metadata alternates and sitemap all follow `getGuideLocales`. A locale without a translation gets `notFound()`.

## Must stay noindex

The guest galleries `/e/[eventId]` (private photos and names), the dashboard, login, signup and `/demo` use `noindexMetadata(...)` and are disallowed in `app/robots.ts`. Don't "fix" that. For a new private route, do both: add `noindexMetadata` and a robots disallow for the `pl` and `/en` paths.

## Verifying

There are no automated checks for any of this. Hand these steps to the human, who runs the server:

- `curl -s -u <basic-auth> <url> | grep '<text that must be indexed>'`. If it's not in the raw HTML, it's client-only. Devtools show the DOM after hydration, so they don't count.
- Look for exactly one `<script type="application/ld+json">` and validate it with Google's Rich Results Test.
- Switch language on the page. It must not 404, and `<link rel="alternate" hreflang>` must point at real URLs.
- `/sitemap.xml` lists the new URL in each available locale.

Note: until launch, `proxy.ts` puts the whole site behind Basic Auth and sends `X-Robots-Tag: noindex`, so crawlers see nothing today. That's intended.
