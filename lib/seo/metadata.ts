import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { OG_LOCALES, absoluteUrl, siteConfig } from "./config";

export type SeoHref = Parameters<typeof getPathname>[0]["href"];

export function localizedPath(href: SeoHref, locale: AppLocale): string {
  return getPathname({ href, locale });
}

export function localizedUrl(href: SeoHref, locale: AppLocale): string {
  return absoluteUrl(localizedPath(href, locale));
}

type BuildMetadataOptions = {
  href: SeoHref;
  locale: AppLocale;
  title: string;
  description: string;
  /**
   * Locales that actually have content for this route. Locales left out get no
   * hreflang entry, which keeps untranslated pages from looking like duplicates.
   */
  availableLocales?: readonly AppLocale[];
  /** Needed when a route's dynamic segment differs per locale, e.g. guide slugs. */
  hrefByLocale?: Partial<Record<AppLocale, SeoHref>>;
  /** Skips the `| brand` suffix from the layout template. Use for the homepage. */
  absoluteTitle?: boolean;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
};

export function buildMetadata({
  href,
  locale,
  title,
  description,
  availableLocales = routing.locales,
  hrefByLocale,
  absoluteTitle = false,
  noindex = false,
  type = "website",
  publishedTime,
}: BuildMetadataOptions): Metadata {
  const canonical = localizedUrl(href, locale);

  const languages = Object.fromEntries(
    availableLocales.map((entry) => [
      entry,
      localizedUrl(hrefByLocale?.[entry] ?? href, entry),
    ]),
  );

  if (availableLocales.includes(routing.defaultLocale)) {
    languages["x-default"] = localizedUrl(
      hrefByLocale?.[routing.defaultLocale] ?? href,
      routing.defaultLocale,
    );
  }

  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type,
      title: socialTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: OG_LOCALES[locale],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
    ...(noindex
      ? { robots: { index: false, follow: false, nocache: true } }
      : {}),
  };
}

export function noindexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: false, follow: false, nocache: true },
  };
}
