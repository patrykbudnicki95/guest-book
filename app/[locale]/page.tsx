import type { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import {
  faqPageNode,
  organizationNode,
  softwareApplicationNode,
  webSiteNode,
} from "@/lib/seo/json-ld";
import { APPS_TOTAL_PRICE, PRODUCT_LIST, PRODUCT_PAGES } from "@/lib/pricing";
import { productCopyValues, productFeatures } from "@/lib/plan-features";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PricingCard } from "@/components/marketing/pricing-card";
import { FAQ } from "@/components/marketing/faq";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Camera,
  Download,
  HeartHandshake,
  ImageOff,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { HeroSection } from "./components/hero-section";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return buildMetadata({
    href: "/",
    locale,
    title: t("title"),
    description: t("description"),
    absoluteTitle: true,
  });
}

export default async function LandingPage() {
  const locale = await getLocale();

  const t = await getTranslations("landing");

  const values = productCopyValues();
  const faqItems = [1, 2, 3, 4, 5].map((index) => ({
    question: t(`faq.${index}.question`),
    answer: t(`faq.${index}.answer`, values),
  }));

  const problems = [
    {
      title: t("problem.1.title"),
      description: t("problem.1.description"),
      icon: <MessagesSquare className="size-6 text-primary" />,
    },
    {
      title: t("problem.2.title"),
      description: t("problem.2.description"),
      icon: <ImageOff className="size-6 text-primary" />,
    },
    {
      title: t("problem.3.title"),
      description: t("problem.3.description"),
      icon: <HeartHandshake className="size-6 text-primary" />,
    },
  ];

  const jsonLd = [
    organizationNode(),
    webSiteNode(locale),
    softwareApplicationNode({
      description: t("definition.body"),
      url: localizedUrl("/", locale),
      locale,
      offers: PRODUCT_LIST.map((product) => ({
        product,
        name: t(`pricing.${product.id}.title`),
        url: localizedUrl(PRODUCT_PAGES[product.id] ?? "/pricing", locale),
      })),
    }),
    faqPageNode(faqItems),
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <HeroSection />

      {/* Definition — states plainly what the product is, for readers and for
          search engines building an entity around the brand. */}
      <section className="border-y bg-white py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            {t("definition.title")}
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("definition.body")}
          </p>
          <Link
            href="/virtual-guestbook"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("definition.link")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Problem / solution */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t("problem.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("problem.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="rounded-2xl border bg-white p-8 shadow-sm"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                  {problem.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{problem.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Benefits */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Camera className="size-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("features.uploads.title")}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("features.uploads.description")}
              </p>
            </div>
            <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Sparkles className="size-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("features.gallery.title")}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("features.gallery.description")}
              </p>
            </div>
            <div className="group rounded-2xl border bg-white p-8 shadow-sm transition-all hover:shadow-md">
              <div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <Download className="size-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t("features.management.title")}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("features.management.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t("pricing.title")}
            </h2>
            <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_LIST.map((product) => {
              const page = PRODUCT_PAGES[product.id];
              return (
                <PricingCard
                  key={product.id}
                  product={product}
                  title={t(`pricing.${product.id}.title`)}
                  description={t(`pricing.${product.id}.description`)}
                  features={productFeatures(t, product.id)}
                  cta={t("pricing.choose")}
                  compareAtPrice={product.id === "gold" ? APPS_TOTAL_PRICE : undefined}
                  details={page ? { href: page, label: t("pricing.seeDetails") } : undefined}
                />
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("pricing.comparePlans")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />

      <div id="faq">
        <FAQ title={t("faq.title")} items={faqItems} />
      </div>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-pink-400" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">
            {t("cta.subtitle")}
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="rounded-full bg-white px-10 text-base font-semibold text-primary shadow-xl hover:bg-white/90"
          >
            <Link href="/signup">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
