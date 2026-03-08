import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  Camera,
  Download,
  Heart,
  QrCode,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { PricingCard } from "./components/pricing-card";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";
import { FAQ } from "./components/faq";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  const howItWorksSteps = [
    {
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
      icon: <Smartphone className="size-6" />,
    },
    {
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
      icon: <QrCode className="size-6" />,
    },
    {
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
      icon: <Camera className="size-6" />,
    },
    {
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
      icon: <Download className="size-6" />,
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
      <header className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </header>

      {/* Above the fold: Compact Hero + Pricing */}
      <section className="container mx-auto flex min-h-[85vh] flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-4 py-2 text-sm">
            <Sparkles className="mr-2 size-4" />
            {t("hero.badge")}
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mb-4 text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <Button asChild variant="link" className="text-base">
            <Link href="/e/demo-event-123">{t("hero.viewDemo")}</Link>
          </Button>
        </div>

        <div className="mb-4 text-center">
          <h2 className="mb-1 text-xl font-semibold">{t("pricing.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
      </section>

      {/* Demo CTA */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("demo.title")}</h2>
          <p className="mb-6 text-muted-foreground">{t("demo.description")}</p>
          <Button asChild size="lg">
            <Link href="/e/demo-event-123">{t("demo.button")}</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <HowItWorks title={t("howItWorks.title")} steps={howItWorksSteps} />

      {/* Benefits (Features) */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t("features.title")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Camera className="mb-2 size-8 text-primary" />
                <CardTitle>{t("features.uploads.title")}</CardTitle>
                <CardDescription>
                  {t("features.uploads.description")}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="mb-2 size-8 text-primary" />
                <CardTitle>{t("features.gallery.title")}</CardTitle>
                <CardDescription>
                  {t("features.gallery.description")}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="mb-2 size-8 text-primary" />
                <CardTitle>{t("features.management.title")}</CardTitle>
                <CardDescription>
                  {t("features.management.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials title={t("testimonials.title")} items={testimonials} />

      {/* FAQ */}
      <FAQ title={t("faq.title")} items={faqItems} />

      {/* Final CTA */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t("cta.title")}</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {t("cta.subtitle")}
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
