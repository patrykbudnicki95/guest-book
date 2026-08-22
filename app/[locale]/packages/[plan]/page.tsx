import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, productNode } from "@/lib/seo/json-ld";
import {
  CURRENCY_SYMBOL,
  PLANS,
  PLAN_IDS,
  PLAN_LIST,
  isPlanId,
  type PlanId,
} from "@/lib/pricing";
import { planCopyValues, planFeatures } from "@/lib/plan-features";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

type PackagePageProps = {
  params: Promise<{ locale: AppLocale; plan: string }>;
};

export function generateStaticParams() {
  return PLAN_IDS.map((plan) => ({ plan }));
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { locale, plan } = await params;

  if (!isPlanId(plan)) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: `metadata.packages.${plan}`,
  });

  return buildMetadata({
    href: { pathname: "/packages/[plan]", params: { plan } },
    locale,
    title: t("title"),
    description: t("description", {
      price: PLANS[plan].price,
      ...planCopyValues(plan),
    }),
  });
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { locale, plan } = await params;

  if (!isPlanId(plan)) {
    notFound();
  }

  setRequestLocale(locale);

  const planId: PlanId = plan;
  const planData = PLANS[planId];

  const t = await getTranslations("packagePage");
  const tLanding = await getTranslations("landing");
  const tPricing = await getTranslations("pricingPage");
  const tFooter = await getTranslations("footer");
  const tMeta = await getTranslations(`metadata.packages.${planId}`);

  const planName = tLanding(`pricing.${planId}.title`);
  const copyValues = planCopyValues(planId);
  const features = planFeatures(tLanding, planId);
  const packageUrl = localizedUrl(
    { pathname: "/packages/[plan]", params: { plan: planId } },
    locale,
  );

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      {
        name: tPricing("breadcrumb"),
        url: localizedUrl("/pricing", locale),
      },
      { name: tMeta("title"), url: packageUrl },
    ]),
    productNode({
      plan: planData,
      name: t("productName", { name: planName }),
      description: t(`${planId}.intro`),
      url: packageUrl,
      offerUrl: localizedUrl(
        { pathname: "/signup", query: { plan: planId } },
        locale,
      ),
    }),
  ];

  const otherPlans = PLAN_LIST.filter((entry) => entry.id !== planId);

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <section className="pb-16 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: tFooter("howItWorks"), href: "/" },
              { label: tPricing("breadcrumb"), href: "/pricing" },
              { label: tMeta("title") },
            ]}
          />

          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {tMeta("title")}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {t(`${planId}.intro`, copyValues)}
              </p>

              <h2 className="mt-12 text-2xl font-bold">
                {t("forWhomTitle")}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {t(`${planId}.forWhom`)}
              </p>

              <h2 className="mt-12 text-2xl font-bold">
                {t("includedTitle")}
              </h2>
              <ul className="mt-5 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pt-4">
              <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">
                  {planName}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{planData.price}</span>
                  <span className="text-lg text-muted-foreground">
                    {CURRENCY_SYMBOL}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("priceNote", {
                    originalPrice: planData.originalPrice,
                    currency: CURRENCY_SYMBOL,
                  })}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-6 w-full rounded-full shadow-lg shadow-primary/25"
                >
                  <Link
                    href={{ pathname: "/signup", query: { plan: planId } }}
                  >
                    {t("cta", { name: planName })}
                  </Link>
                </Button>
                <Link
                  href="/pricing"
                  className="mt-4 block text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t("backToPricing")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold">{t("otherTitle")}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {otherPlans.map((entry) => (
              <Link
                key={entry.id}
                href={{
                  pathname: "/packages/[plan]",
                  params: { plan: entry.id },
                }}
                className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold">
                    {tLanding(`pricing.${entry.id}.title`)}
                  </h3>
                  <span className="shrink-0 font-semibold">
                    {entry.price} {CURRENCY_SYMBOL}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {tPricing(`choose.${entry.id}`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {tLanding("pricing.seeDetails")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
