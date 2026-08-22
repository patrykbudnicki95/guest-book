"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { DashboardNav } from "@/app/[locale]/(admin)/dashboard/dashboard-nav";

export default function DemoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard");

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-12 z-40 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Heart className="size-5 fill-primary text-primary" />
            <h1 className="text-xl font-bold">{t("title")}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <DashboardNav basePath="/demo/dashboard" />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
