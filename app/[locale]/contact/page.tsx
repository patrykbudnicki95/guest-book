import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { buildMetadata, localizedUrl } from "@/lib/seo/metadata";
import { breadcrumbListNode } from "@/lib/seo/json-ld";
import { siteConfig } from "@/lib/seo/config";
import { JsonLd } from "@/components/json-ld";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { ArrowRight, Mail } from "lucide-react";

type ContactPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  return buildMetadata({
    href: "/contact",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contactPage");
  const tFooter = await getTranslations("footer");

  const jsonLd = breadcrumbListNode([
    { name: tFooter("howItWorks"), url: localizedUrl("/", locale) },
    { name: t("breadcrumb"), url: localizedUrl("/contact", locale) },
  ]);

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

            <div className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="size-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{t("emailTitle")}</h2>
              </div>
              {/* TODO: set NEXT_PUBLIC_CONTACT_EMAIL so a real address renders here. */}
              {siteConfig.contactEmail ? (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
                >
                  {siteConfig.contactEmail}
                </a>
              ) : (
                <p className="mt-4 text-muted-foreground">
                  {t("emailPlaceholder")}
                </p>
              )}
            </div>

            <h2 className="mt-14 text-2xl font-bold">{t("faqTitle")}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {t("faqBody")}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("faqLink")}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/guides"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("guidesLink")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
