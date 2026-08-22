"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { StaticAppPathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Heart, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

const navLinks: { href: StaticAppPathname; labelKey: string }[] = [
  { href: "/virtual-guestbook", labelKey: "howItWorks" },
  { href: "/pricing", labelKey: "pricing" },
  { href: "/guides", labelKey: "guides" },
];

export function SiteHeader() {
  const t = useTranslations("landing.nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="size-5 fill-primary text-primary" />
          <span className="text-lg font-bold">
            Wirtualna{" "}
            <span className="font-script italic text-primary">Księga Gości</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full shadow-md shadow-primary/20"
          >
            <Link href="/signup">{t("getStarted")}</Link>
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-medium text-muted-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 rounded-full"
            >
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild size="sm" className="flex-1 rounded-full">
              <Link href="/signup">{t("getStarted")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
