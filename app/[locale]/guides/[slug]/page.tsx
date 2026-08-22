import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl, type SeoHref } from "@/lib/seo/metadata";
import {
  articleNode,
  breadcrumbListNode,
  faqPageNode,
} from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Prose } from "../components/prose";
import {
  getGuideArticleBySlug,
  getGuideLocales,
  getGuidesForLocale,
  getRelatedGuides,
} from "../content";

type GuideArticlePageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

/**
 * Returns every slug that exists in any locale, because Cache Components
 * requires a non-empty result per parent param. Locales without a translation
 * for a slug fall through to `notFound()`.
 */
export function generateStaticParams() {
  const slugs = new Set<string>();

  for (const locale of routing.locales) {
    for (const guide of getGuidesForLocale(locale)) {
      slugs.add(guide.slug);
    }
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuideArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getGuideArticleBySlug(locale, slug);
  const content = article?.translations[locale];

  if (!article || !content) {
    return {};
  }

  const availableLocales = getGuideLocales(article);
  const hrefByLocale = Object.fromEntries(
    availableLocales.map((entry) => [
      entry,
      {
        pathname: "/guides/[slug]" as const,
        params: { slug: article.translations[entry]?.slug ?? slug },
      },
    ]),
  ) as Partial<Record<AppLocale, SeoHref>>;

  return buildMetadata({
    href: { pathname: "/guides/[slug]", params: { slug } },
    locale,
    title: content.metaTitle,
    description: content.description,
    availableLocales,
    hrefByLocale,
    type: "article",
    publishedTime: content.datePublished,
  });
}

export default async function GuideArticlePage({
  params,
}: GuideArticlePageProps) {
  const { locale, slug } = await params;
  const article = getGuideArticleBySlug(locale, slug);
  const content = article?.translations[locale];

  if (!article || !content) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations("guidesPage");
  const tFooter = await getTranslations("footer");
  const format = await getFormatter();

  const articleUrl = localizedUrl(
    { pathname: "/guides/[slug]", params: { slug: content.slug } },
    locale,
  );
  const related = getRelatedGuides(locale, content.slug);

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/guides", locale) },
      { name: content.title, url: articleUrl },
    ]),
    articleNode({
      headline: content.title,
      description: content.description,
      url: articleUrl,
      locale,
      datePublished: content.datePublished,
      dateModified: content.dateModified,
    }),
    ...(content.faq?.length ? [faqPageNode(content.faq)] : []),
  ];

  const Body = content.Body;

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <article className="pb-16 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: tFooter("howItWorks"), href: "/" },
              { label: t("breadcrumb"), href: "/guides" },
              { label: content.title },
            ]}
          />

          <header className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <time dateTime={content.datePublished}>
                {format.dateTime(new Date(content.datePublished), {
                  dateStyle: "long",
                })}
              </time>
              {" · "}
              {t("readingTime", { minutes: content.readingMinutes })}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {content.title}
            </h1>
          </header>

          <div className="mt-10">
            <Prose>
              <Body />
            </Prose>
          </div>

          <Link
            href="/guides"
            className="mt-12 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" />
            {t("backToGuides")}
          </Link>
        </div>
      </article>

      {content.faq?.length ? (
        <FAQ title={t("faqTitle")} items={content.faq} />
      ) : null}

      {related.length > 0 && (
        <section className="border-t py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold">{t("relatedTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((guide) => (
                <Link
                  key={guide.slug}
                  href={{
                    pathname: "/guides/[slug]",
                    params: { slug: guide.slug },
                  }}
                  className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <h3 className="text-base font-semibold leading-snug">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {guide.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t("readMore")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-pink-400" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">
            {t("ctaSubtitle")}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full bg-white px-10 text-base font-semibold text-primary shadow-xl hover:bg-white/90"
          >
            <Link href="/pricing">{t("ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
