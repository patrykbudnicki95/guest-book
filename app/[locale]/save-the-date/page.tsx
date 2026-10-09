import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import {
  CalendarPlus,
  Clock,
  Music,
  Palette,
  Smartphone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, faqPageNode } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/seo/config";
import { ADDONS, PLANS, formatPrice } from "@/lib/pricing";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import { SaveTheDateShowcase } from "./components/save-the-date-showcase";

const FEATURE_ICONS = [Sparkles, Music, Palette, Clock, CalendarPlus, Smartphone];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata.saveTheDate" });

  return buildMetadata({
    href: "/save-the-date",
    locale,
    title: t("title"),
    description: t("description", { price: ADDONS.saveTheDate.price }),
  });
}

export default async function SaveTheDateMarketingPage() {
  const locale = await getLocale();

  const t = await getTranslations("saveTheDatePage");
  const tFooter = await getTranslations("footer");

  const prices = {
    addonPrice: formatPrice(ADDONS.saveTheDate.price),
    goldPrice: formatPrice(PLANS.gold.price),
  };

  const steps = [1, 2, 3].map((index) => ({
    title: t(`how.${index}.title`),
    description: t(`how.${index}.description`),
  }));

  const features = [1, 2, 3, 4, 5, 6].map((index) => ({
    title: t(`features.${index}.title`),
    description: t(`features.${index}.description`),
  }));

  const faqItems = [1, 2, 3, 4, 5].map((index) => ({
    question: t(`faq.${index}.question`),
    answer: t(`faq.${index}.answer`, prices),
  }));

  const jsonLd = [
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/save-the-date", locale) },
    ]),
    faqPageNode(faqItems),
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <section className="pb-12 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: tFooter("howItWorks"), href: "/" },
              { label: t("breadcrumb") },
            ]}
          />

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-script text-4xl leading-tight md:text-6xl">
              {t("heading")}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("lead")}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full shadow-md shadow-primary/20">
                <Link href="/signup">{t("ctaPrimary")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/demo/save-the-date">{t("ctaDemo")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("priceNote", prices)}</p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">{t("showcase.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("showcase.subtitle")}</p>
          </div>
          <SaveTheDateShowcase previewUrl={`${new URL(siteConfig.url).host}/e/…/save-the-date`} />
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-2xl font-bold md:text-3xl">{t("how.title")}</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border bg-white p-6 shadow-sm">
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
          <h2 className="mb-12 text-2xl font-bold md:text-3xl">{t("features.title")}</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index];
              return (
                <div key={feature.title}>
                  <Icon className="size-6 text-primary" strokeWidth={1.5} />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-10 text-2xl font-bold md:text-3xl">{t("pricing.title")}</h2>
          <div className="grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-primary bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("pricing.gold.title")}</h3>
              <p className="mt-2 text-3xl font-bold">{prices.goldPrice}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("pricing.gold.description")}
              </p>
              <Link
                href={{ pathname: "/packages/[plan]", params: { plan: "gold" } }}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("pricing.gold.cta")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("pricing.addon.title")}</h3>
              <p className="mt-2 text-3xl font-bold">{prices.addonPrice}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("pricing.addon.description")}
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("pricing.addon.cta")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">{t("timing.title")}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{t("timing.body")}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{t("timing.vsInvitation")}</p>
        </div>
      </section>

      <FAQ title={t("faqTitle")} items={faqItems} />

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-pink-400" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">{t("ctaSubtitle")}</p>
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
