---
name: new-guide
description: Write or translate an SEO guide article under /poradnik (pl) or /en/guides - the content file, the GUIDE_ARTICLES entry, per-locale slug and keywords, FAQ, internal links, and the dates that feed the sitemap. Use when asked to write a guide, blog post, article or poradnik, to translate an existing guide to English, or to update or refresh a guide's content.
allowed-tools: Read, Glob, Grep, Bash(git diff:*), Bash(npm run lint:*), Bash(npm run build:*)
---

# Writing a guide article

Guides are long-tail SEO content that brings couples to the product. Each article is a typed TSX object, so no CMS, route or `messages/*.json` change is needed: the hub, article page, metadata, hreflang, JSON-LD (`Article`, `BreadcrumbList`, `FAQPage`), related links and sitemap all derive from the content files. Read one existing article first. `content/pl/kod-qr-na-wesele-zdjecia-od-gosci.tsx` is a good template.

## 1. Pick the keyword and slug

- Agree on **one main search phrase per article per locale**, written the way couples actually search ("kod qr na wesele zdjęcia od gości", not "QR-based media collection"). Before writing, check that no existing article targets the same phrase, because two pages competing for one keyword hurt both.
- The **slug is per locale** and built from that locale's keyword: lowercase, hyphenated, **no Polish diacritics** (`ksiega-gosci-…`, not `księga-gości-…`). The English translation gets its own English slug, not the Polish one.
- Once a guide is published, **never change its slug**, because there are no redirects. Fix the title instead.

## 2. Create the content file

`app/[locale]/guides/content/<locale>/<slug>.tsx`, exporting a camelCase `GuideContent` (`types.ts`):

| Field | Rule |
| --- | --- |
| `slug` | as in step 1, identical to the file name |
| `title` | the H1, containing the keyword naturally. Can be long. |
| `metaTitle` | the `<title>`, with the keyword first and **no more than about 50 characters**. The layout appends ` \| Wirtualna Księga Gości` (24 characters), and Google truncates titles at around 60. |
| `description` | meta description, 140–160 characters, a concrete promise with the keyword |
| `excerpt` | 1–2 sentences for the hub and related-article cards. Different from `description`. |
| `datePublished` | ISO date (`YYYY-MM-DD`) of first publication. **Never change it later.** |
| `dateModified` | leave it out on a new article. Set it to today on a **substantive** update (not a typo fix). It feeds `lastModified` in the sitemap and `dateModified` in the JSON-LD. |
| `readingMinutes` | body word count ÷ 200, rounded |
| `faq` | 3–5 real questions people search for, each with a 1–3 sentence answer. Rendered on the page and as `FAQPage` JSON-LD. Plain strings only. |
| `Body` | `() => (<>…</>)` |

**Body markup:** use only `<p>`, `<h2>`, `<h3>`, `<ul>/<ol>/<li>`, `<strong>`, `<blockquote>` and `Link` as direct children of the fragment. `Prose` styles exactly those. Don't use an `<h1>` (the page renders the title) or classes or components from `components/ui`.

## 3. Register it

Add an entry to `GUIDE_ARTICLES` in `content/index.ts`:

```ts
{ id: "stable-english-id", translations: { pl: myGuidePl } },
```

- `id` is a stable English identifier that every translation shares.
- **Order matters.** The hub renders in array order, and the "related guides" section takes the first 3 others. Put a new article where it belongs by intent, usually near the top.
- **Translating** an existing article means adding `en: myGuideEn` to that article's `translations`, not creating a new entry. That's what links pl ↔ en through hreflang. The first English article also makes `/en/guides` exist, because a hub with no articles returns 404.

## 4. Writing

- Write in the target language natively, not as a literal translation. In Polish, address the couple in the plural ("Wasze", "przygotujcie"), as the existing articles do.
- Get to the answer in the first paragraph, use `h2`s as steps or questions, and use lists for anything scannable. Aim for about 600–1200 words.
- **Never invent product facts.** Prices, storage, file limits and days come from `lib/pricing.ts` and `PLAN_ENTITLEMENTS`. Prefer linking to `/pricing` over writing a number into the text, because a hardcoded number goes stale.
- **Internal links:** include 2–3 per article, using `Link` from `@/i18n/navigation`. Link to `/virtual-guestbook` or `/pricing` and to related guides, with the **same-locale** slug: `{ pathname: "/guides/[slug]", params: { slug: "…" } }`. An English article must link to English slugs. Consider adding a link back from an older related article too.

## 5. Verify

- `npm run lint` and `npm run build`. The build pre-renders every slug through `generateStaticParams`, so a broken article fails there.
- Tell the user which URLs to check by hand: `/poradnik/<slug>` and/or `/en/guides/<slug>`, the hub, and `/sitemap.xml`. If translated, also check that the language switcher lands on the other locale's slug.
- Changelog: one line under `Added`, such as "Guide: <title> (pl)".
