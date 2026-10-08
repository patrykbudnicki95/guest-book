import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "./globals.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * 404 for URLs that never reach the `[locale]` root layout. There is no locale
 * here, so it renders in the default one.
 */
export default async function GlobalNotFound() {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: "notFound",
  });

  return (
    <html lang={routing.defaultLocale}>
      <head>
        <title>{t("title")}</title>
      </head>
      <body className="flex min-h-screen items-center justify-center p-4 antialiased">
        <main className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
          {/* Plain next/link: there's no locale context for the i18n Link here. */}
          <Link href="/" className="inline-block font-medium text-primary underline">
            {t("home")}
          </Link>
        </main>
      </body>
    </html>
  );
}
