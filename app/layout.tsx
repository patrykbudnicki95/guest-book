import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "next-intl/server";
import { siteConfig } from "@/lib/seo/config";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

async function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

function RootLayoutFallback() {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen animate-pulse bg-muted`}
      />
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<RootLayoutFallback />}>
      <RootLayoutContent>{children}</RootLayoutContent>
    </Suspense>
  );
}
