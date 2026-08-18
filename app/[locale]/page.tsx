import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Download,
  Heart,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { HeroSection } from "./components/hero-section";
import { PricingCard } from "./components/pricing-card";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";
import { FAQ } from "./components/faq";
import { LandingHeader } from "./components/landing-header";
import { LandingFooter } from "./components/landing-footer";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const howItWorksSteps = [
    {
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
      icon: <Smartphone className="size-7" />,
    },
    {
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
      icon: <QrCode className="size-7" />,
    },
    {
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
      icon: <Camera className="size-7" />,
    },
    {
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
      icon: <Download className="size-7" />,
    },
  ];

  const testimonials = [
    { quote: t("testimonials.1.quote"), author: t("testimonials.1.author") },
    { quote: t("testimonials.2.quote"), author: t("testimonials.2.author") },
    { quote: t("testimonials.3.quote"), author: t("testimonials.3.author") },
  ];

  const faqItems = [
    { question: t("faq.1.question"), answer: t("faq.1.answer") },
    { question: t("faq.2.question"), answer: t("faq.2.answer") },
    { question: t("faq.3.question"), answer: t("faq.3.answer") },
    { question: t("faq.4.question"), answer: t("faq.4.answer") },
    { question: t("faq.5.question"), answer: t("faq.5.answer") },
  ];

  const basicFeatures = [
    t("pricing.basic.features.1"),
    t("pricing.basic.features.2"),
    t("pricing.basic.features.3"),
    t("pricing.basic.features.4"),
    t("pricing.basic.features.5"),
  ];

  const silverFeatures = [
    t("pricing.silver.features.1"),
    t("pricing.silver.features.2"),
    t("pricing.silver.features.3"),
    t("pricing.silver.features.4"),
    t("pricing.silver.features.5"),
  ];

  const goldFeatures = [
    t("pricing.gold.features.1"),
    t("pricing.gold.features.2"),
    t("pricing.gold.features.3"),
    t("pricing.gold.features.4"),
    t("pricing.gold.features.5"),
    t("pricing.gold.features.6"),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />

      <HeroSection
        badge={t("hero.badge")}
        title={t("hero.title")}
        titleAccent={t("hero.titleAccent")}
        subtitle={t("hero.subtitle")}
        ctaText={t("cta.button")}
        demoText={t("hero.viewDemo")}
      />

      {/* How it works */}
      <div id="how-it-works">
        <HowItWorks
          title={t("howItWorks.title")}
          subtitle={t("howItWorks.subtitle")}
          steps={howItWorksSteps}
        />
      </div>

      {/* Features / Benefits */}
      <section className="bg-muted/30 py-20 md:py-28">
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
                <Heart className="size-7 text-primary" />
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
                <Sparkles className="size-7 text-primary" />
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
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              {t("pricing.title")}
            </h2>
            <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            <PricingCard
              planId="basic"
              title={t("pricing.basic.title")}
              description={t("pricing.basic.description")}
              price={t("pricing.basic.price")}
              originalPrice={t("pricing.basic.originalPrice")}
              features={basicFeatures}
              cta={t("pricing.choosePlan")}
            />
            <PricingCard
              planId="silver"
              title={t("pricing.silver.title")}
              description={t("pricing.silver.description")}
              price={t("pricing.silver.price")}
              originalPrice={t("pricing.silver.originalPrice")}
              features={silverFeatures}
              cta={t("pricing.choosePlan")}
              highlighted
            />
            <PricingCard
              planId="gold"
              title={t("pricing.gold.title")}
              description={t("pricing.gold.description")}
              price={t("pricing.gold.price")}
              originalPrice={t("pricing.gold.originalPrice")}
              features={goldFeatures}
              cta={t("pricing.choosePlan")}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        title={t("testimonials.title")}
        subtitle={t("testimonials.subtitle")}
        items={testimonials}
      />

      {/* FAQ */}
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

      <LandingFooter />
    </div>
  );
}
