import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, faqPageNode } from "@/lib/seo/json-ld";
import { CURRENCY_SYMBOL, PLANS } from "@/lib/pricing";
import { planRangeValues } from "@/lib/plan-features";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getGuidesForLocale } from "../guides/content";

type GuestbookPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: GuestbookPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.virtualGuestbook",
  });

  return buildMetadata({
    href: "/virtual-guestbook",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function VirtualGuestbookPage({
  params,
}: GuestbookPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guestbookPage");
  const tFooter = await getTranslations("footer");
  const tGuides = await getTranslations("guidesPage");

  const steps = [1, 2, 3, 4].map((index) => ({
    title: t(`how.${index}.title`),
    description: t(`how.${index}.description`),
  }));

  const reasons = [1, 2, 3, 4].map((index) => ({
    title: t(`why.${index}.title`),
    description: t(`why.${index}.description`),
  }));

  const faqRange = planRangeValues();
  const faqItems = [1, 2, 3].map((index) => ({
    question: t(`faq.${index}.question`),
    answer: t(`faq.${index}.answer`, faqRange),
  }));

  const relatedGuides = getGuidesForLocale(locale).slice(0, 3);

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      {
        name: t("breadcrumb"),
        url: localizedUrl("/virtual-guestbook", locale),
      },
    ]),
    faqPageNode(faqItems),
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
            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {t("heading")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {t("lead")}
            </p>
          </div>

          <div className="mt-14 max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {t("whatIsTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("whatIsBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-2xl font-bold md:text-3xl">
            {t("howTitle")}
          </h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-2xl font-bold md:text-3xl">
            {t("whyTitle")}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason.title} className="max-w-xl">
                <h3 className="text-lg font-semibold">{reason.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {t("planTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {t("planBody")}
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("planLink")} ({PLANS.basic.price}–{PLANS.gold.price}{" "}
              {CURRENCY_SYMBOL})
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <FAQ title={t("faqTitle")} items={faqItems} />

      {relatedGuides.length > 0 && (
        <section className="border-t py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-2xl font-bold">{t("guidesTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedGuides.map((guide) => (
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
                    {tGuides("readMore")}
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
            <Link href="/signup">{t("ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
