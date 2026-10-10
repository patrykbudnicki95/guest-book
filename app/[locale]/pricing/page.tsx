import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, itemListNode } from "@/lib/seo/json-ld";
import {
  APPS_TOTAL_PRICE,
  LOWEST_PRICE,
  PRODUCT_LIST,
  PRODUCT_PAGES,
} from "@/lib/pricing";
import { productCopyValues, productFeatures } from "@/lib/plan-features";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { PricingCard } from "@/components/marketing/pricing-card";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata.pricing" });

  return buildMetadata({
    href: "/pricing",
    locale,
    title: t("title"),
    description: t("description", { price: LOWEST_PRICE }),
  });
}

export default async function PricingPage() {
  const locale = await getLocale();

  const t = await getTranslations("pricingPage");
  const tLanding = await getTranslations("landing");
  const tFooter = await getTranslations("footer");

  const values = productCopyValues();
  const faqItems = [1, 2, 3, 4, 5].map((index) => ({
    question: tLanding(`faq.${index}.question`),
    answer: tLanding(`faq.${index}.answer`, values),
  }));

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/pricing", locale) },
    ]),
    itemListNode({
      name: t("heading"),
      items: PRODUCT_LIST.map((product) => ({
        name: tLanding(`pricing.${product.id}.title`),
        url: localizedUrl(PRODUCT_PAGES[product.id] ?? "/pricing", locale),
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
              {t("intro", values)}
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_LIST.map((product) => {
              const page = PRODUCT_PAGES[product.id];
              return (
                <PricingCard
                  key={product.id}
                  product={product}
                  title={tLanding(`pricing.${product.id}.title`)}
                  description={tLanding(`pricing.${product.id}.description`)}
                  features={productFeatures(tLanding, product.id)}
                  cta={tLanding("pricing.choose")}
                  compareAtPrice={product.id === "gold" ? APPS_TOTAL_PRICE : undefined}
                  details={page ? { href: page, label: tLanding("pricing.seeDetails") } : undefined}
                />
              );
            })}
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_LIST.map((product) => {
              const page = PRODUCT_PAGES[product.id];
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-2 text-lg font-semibold">
                    {tLanding(`pricing.${product.id}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`choose.${product.id}`, values)}
                  </p>
                  {page && (
                    <Link
                      href={page}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {tLanding("pricing.seeDetails")}
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
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
