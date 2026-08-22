import type { AppLocale } from "@/i18n/routing";
import type { GuideArticle, GuideContent } from "./types";
import { jakZebracZdjecia } from "./pl/jak-zebrac-zdjecia-z-wesela-od-gosci";
import { ksiegaTradycyjnaCzyWirtualna } from "./pl/ksiega-gosci-tradycyjna-czy-wirtualna";
import { kodQrNaWesele } from "./pl/kod-qr-na-wesele-zdjecia-od-gosci";
import { jakZachecicGosci } from "./pl/jak-zachecic-gosci-do-dodawania-zdjec";

/**
 * Ordered newest-intent-first; the hub renders them in this order.
 * English translations can be added per article without touching the routes —
 * locales missing from `translations` simply have no page and no sitemap entry.
 */
export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: "collect-wedding-photos",
    translations: { pl: jakZebracZdjecia },
  },
  {
    id: "traditional-vs-virtual-guestbook",
    translations: { pl: ksiegaTradycyjnaCzyWirtualna },
  },
  {
    id: "wedding-qr-code",
    translations: { pl: kodQrNaWesele },
  },
  {
    id: "encourage-guests-to-upload",
    translations: { pl: jakZachecicGosci },
  },
];

export function getGuidesForLocale(locale: AppLocale): GuideContent[] {
  return GUIDE_ARTICLES.map((article) => article.translations[locale]).filter(
    (content): content is GuideContent => Boolean(content),
  );
}

export function getGuideArticleBySlug(
  locale: AppLocale,
  slug: string,
): GuideArticle | null {
  return (
    GUIDE_ARTICLES.find(
      (article) => article.translations[locale]?.slug === slug,
    ) ?? null
  );
}

export function getGuideLocales(article: GuideArticle): AppLocale[] {
  return Object.keys(article.translations) as AppLocale[];
}

/** Every (locale, slug) pair that has content — used by the sitemap. */
export function getAllGuideEntries(): {
  locale: AppLocale;
  content: GuideContent;
}[] {
  return GUIDE_ARTICLES.flatMap((article) =>
    getGuideLocales(article).map((locale) => ({
      locale,
      content: article.translations[locale] as GuideContent,
    })),
  );
}

export function getRelatedGuides(
  locale: AppLocale,
  currentSlug: string,
  limit = 3,
): GuideContent[] {
  return getGuidesForLocale(locale)
    .filter((content) => content.slug !== currentSlug)
    .slice(0, limit);
}
