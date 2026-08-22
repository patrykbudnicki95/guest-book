import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, itemListNode } from "@/lib/seo/json-ld";
import { PLANS, PLAN_LIST } from "@/lib/pricing";
import { planFeatures } from "@/lib/plan-features";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { PricingCard } from "@/components/marketing/pricing-card";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type PricingPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.pricing" });

  return buildMetadata({
    href: "/pricing",
    locale,
    title: t("title"),
    description: t("description", { price: PLANS.basic.price }),
  });
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricingPage");
  const tLanding = await getTranslations("landing");
  const tFooter = await getTranslations("footer");

  const faqItems = [1, 2, 3, 4, 5].map((index) => ({
    question: tLanding(`faq.${index}.question`),
    answer: tLanding(`faq.${index}.answer`),
  }));

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/pricing", locale) },
    ]),
    itemListNode({
      name: t("heading"),
      items: PLAN_LIST.map((plan) => ({
        name: tLanding(`pricing.${plan.id}.title`),
        url: localizedUrl(
          { pathname: "/packages/[plan]", params: { plan: plan.id } },
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

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
            {PLAN_LIST.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                title={tLanding(`pricing.${plan.id}.title`)}
                description={tLanding(`pricing.${plan.id}.description`)}
                features={planFeatures(tLanding, plan.id)}
                cta={tLanding("pricing.choosePlan")}
                detailsLabel={tLanding("pricing.seeDetails")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {t("chooseTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("chooseSubtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PLAN_LIST.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">
                  {tLanding(`pricing.${plan.id}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`choose.${plan.id}`)}
                </p>
                <Link
                  href={{
                    pathname: "/packages/[plan]",
                    params: { plan: plan.id },
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {tLanding("pricing.seeDetails")}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>

          <Link
            href="/virtual-guestbook"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("guideLink")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <FAQ title={t("faqTitle")} items={faqItems} />

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
