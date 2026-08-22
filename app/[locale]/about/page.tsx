import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode, organizationNode } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Button } from "@/components/ui/button";

type AboutPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.about" });

  return buildMetadata({
    href: "/about",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("aboutPage");
  const tFooter = await getTranslations("footer");

  const jsonLd = [
    organizationNode(),
    breadcrumbListNode([
      { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
      { name: t("breadcrumb"), url: localizedUrl("/about", locale) },
    ]),
  ];

  return (
    <MarketingShell>
      <JsonLd data={jsonLd} />

      <section className="pb-20 pt-10 md:pt-14">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: tFooter("howItWorks"), href: "/" },
              { label: t("breadcrumb") },
            ]}
          />

          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("heading")}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {t("lead")}
            </p>

            <h2 className="mt-12 text-2xl font-bold">{t("whyTitle")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("whyBody")}
            </p>

            <h2 className="mt-12 text-2xl font-bold">{t("howTitle")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("howBody")}
            </p>

            <h2 className="mt-12 text-2xl font-bold">{t("companyTitle")}</h2>
            {/* TODO: replace with the real company name, address, NIP and REGON. */}
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("companyPlaceholder")}
            </p>

            <Button asChild className="mt-8 rounded-full" size="lg">
              <Link href="/contact">{t("contactCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
