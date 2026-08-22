import type { MetadataRoute } from "next";
import { routing, type AppLocale } from "@/i18n/routing";
import { localizedUrl, type SeoHref } from "@/lib/seo/metadata";
import { PLAN_IDS } from "@/lib/pricing";
import {
  GUIDE_ARTICLES,
  getGuideLocales,
  getGuidesForLocale,
} from "./[locale]/guides/content";

type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Builds one entry per locale that actually has the page, cross-linking them
 * through `alternates.languages` so Google sees them as translations rather
 * than duplicates.
 */
function localizedEntries(
  hrefByLocale: Partial<Record<AppLocale, SeoHref>>,
  options: {
    lastModified?: Date;
    changeFrequency?: SitemapEntry["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap {
  const locales = Object.keys(hrefByLocale) as AppLocale[];

  const languages = Object.fromEntries(
    locales.map((locale) => [
      locale,
      localizedUrl(hrefByLocale[locale] as SeoHref, locale),
    ]),
  );

  return locales.map((locale) => ({
    url: localizedUrl(hrefByLocale[locale] as SeoHref, locale),
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency ?? "monthly",
    priority: options.priority ?? 0.6,
    alternates: { languages },
  }));
}

function sameHrefForAllLocales(
  href: SeoHref,
): Partial<Record<AppLocale, SeoHref>> {
  return Object.fromEntries(routing.locales.map((locale) => [locale, href]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    ...localizedEntries(sameHrefForAllLocales("/"), {
      changeFrequency: "weekly",
      priority: 1,
    }),
    ...localizedEntries(sameHrefForAllLocales("/virtual-guestbook"), {
      changeFrequency: "monthly",
      priority: 0.9,
    }),
    ...localizedEntries(sameHrefForAllLocales("/pricing"), {
      changeFrequency: "weekly",
      priority: 0.9,
    }),
    ...PLAN_IDS.flatMap((plan) =>
      localizedEntries(
        sameHrefForAllLocales({
          pathname: "/packages/[plan]",
          params: { plan },
        }),
        { changeFrequency: "monthly", priority: 0.8 },
      ),
    ),
    ...localizedEntries(sameHrefForAllLocales("/about"), { priority: 0.4 }),
    ...localizedEntries(sameHrefForAllLocales("/contact"), { priority: 0.4 }),
  ];

  const guideHubLocales = routing.locales.filter(
    (locale) => getGuidesForLocale(locale).length > 0,
  );

  if (guideHubLocales.length > 0) {
    entries.push(
      ...localizedEntries(
        Object.fromEntries(
          guideHubLocales.map((locale) => [locale, "/guides" as SeoHref]),
        ),
        { changeFrequency: "weekly", priority: 0.7 },
      ),
    );
  }

  for (const article of GUIDE_ARTICLES) {
    const locales = getGuideLocales(article);

    if (locales.length === 0) {
      continue;
    }

    const hrefByLocale = Object.fromEntries(
      locales.map((locale) => [
        locale,
        {
          pathname: "/guides/[slug]" as const,
          params: { slug: article.translations[locale]?.slug as string },
        },
      ]),
    ) as Partial<Record<AppLocale, SeoHref>>;

    const lastModified = locales
      .map((locale) => article.translations[locale])
      .map((content) => content?.dateModified ?? content?.datePublished)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1);

    entries.push(
      ...localizedEntries(hrefByLocale, {
        lastModified: lastModified ? new Date(lastModified) : new Date(),
        changeFrequency: "yearly",
        priority: 0.6,
      }),
    );
  }

  return entries;
}
