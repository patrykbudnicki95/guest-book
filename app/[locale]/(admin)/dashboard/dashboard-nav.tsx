"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", labelKey: "overview" },
  { href: "/dashboard/gallery", labelKey: "gallery" },
  { href: "/dashboard/qr-code", labelKey: "qrCode" },
  { href: "/dashboard/settings", labelKey: "settings" },
] as const;

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");

  return (
    <nav className="grid w-full grid-cols-4 gap-1 rounded-lg bg-muted p-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-center text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

