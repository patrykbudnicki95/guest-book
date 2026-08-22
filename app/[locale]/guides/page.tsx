import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, itemListNode } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getGuidesForLocale } from "./content";

type GuidesPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

function localesWithGuides(): AppLocale[] {
  return routing.locales.filter(
    (locale) => getGuidesForLocale(locale).length > 0,
  );
}

export async function generateMetadata({
  params,
}: GuidesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.guides" });

  return buildMetadata({
    href: "/guides",
    locale,
    title: t("title"),
    description: t("description"),
    availableLocales: localesWithGuides(),
  });
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const guides = getGuidesForLocale(locale);

  // An empty hub would be thin content, so untranslated locales get a 404.
  if (guides.length === 0) {
    notFound();
  }

  const t = await getTranslations("guidesPage");
  const tFooter = await getTranslations("footer");
  const format = await getFormatter();

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/guides", locale) },
    ]),
    itemListNode({
      name: t("heading"),
      items: guides.map((guide) => ({
        name: guide.title,
        url: localizedUrl(
          { pathname: "/guides/[slug]", params: { slug: guide.slug } },
          locale,
        ),
      })),
    }),
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <section className="pb-16 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: tFooter("howItWorks"), href: "/" },
              { label: t("breadcrumb") },
            ]}
          />

          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("heading")}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("intro")}
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={{
                  pathname: "/guides/[slug]",
                  params: { slug: guide.slug },
                }}
                className="group flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <time dateTime={guide.datePublished}>
                    {format.dateTime(new Date(guide.datePublished), {
                      dateStyle: "long",
                    })}
                  </time>
                  {" · "}
                  {t("readingTime", { minutes: guide.readingMinutes })}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-snug">
                  {guide.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {guide.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t("readMore")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
