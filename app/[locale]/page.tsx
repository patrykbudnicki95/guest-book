import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Camera, Heart, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const t = await getTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-8 inline-flex items-center rounded-full border bg-muted px-4 py-2 text-sm">
          <Sparkles className="mr-2 size-4" />
          {t("hero.badge")}
        </div>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">{t("hero.createAccount")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/e/demo-event-123">{t("hero.viewDemo")}</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 py-16">
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

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t("pricing.title")}</h2>
          <p className="text-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.free.title")}</CardTitle>
              <CardDescription>{t("pricing.free.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">{t("pricing.free.perMonth")}</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.free.event")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.free.photos")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.free.features")}
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">{t("pricing.free.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>{t("pricing.pro.title")}</CardTitle>
              <CardDescription>{t("pricing.pro.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">{t("pricing.pro.perMonth")}</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.pro.events")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.pro.photos")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.pro.support")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.pro.download")}
                </li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/login">{t("pricing.pro.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.enterprise.title")}</CardTitle>
              <CardDescription>{t("pricing.enterprise.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">$99</span>
                <span className="text-muted-foreground">{t("pricing.enterprise.perMonth")}</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.enterprise.everything")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.enterprise.branding")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.enterprise.support")}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  {t("pricing.enterprise.analytics")}
                </li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/login">{t("pricing.enterprise.cta")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t("cta.title")}</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {t("cta.subtitle")}
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">{t("cta.button")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
