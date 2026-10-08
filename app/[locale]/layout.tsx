import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/seo/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    title: {
      default: t("home.title"),
      template: `%s | ${siteConfig.name}`,
    },
    description: t("home.description"),
  };
}

/**
 * The root layout. `[locale]` is a root param, so the locale is known at build
 * time and every page that doesn't read request data prerenders statically.
 */
export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
