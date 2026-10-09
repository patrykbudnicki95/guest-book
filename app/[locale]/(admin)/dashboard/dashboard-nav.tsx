"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Armchair,
  CalendarHeart,
  LayoutDashboard,
  Image,
  QrCode,
  Settings,
  Sparkles,
} from "lucide-react";
import type { StaticAppPathname } from "@/i18n/routing";

export type DashboardBasePath = "/dashboard" | "/demo/dashboard";

const navByBase: Record<
  DashboardBasePath,
  readonly {
    href: StaticAppPathname;
    labelKey:
      | "overview"
      | "eventPage"
      | "saveTheDate"
      | "seating"
      | "gallery"
      | "qrCode"
      | "settings";
    icon: typeof LayoutDashboard;
  }[]
> = {
  "/dashboard": [
    { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
    { href: "/dashboard/event-page", labelKey: "eventPage", icon: Sparkles },
    { href: "/dashboard/save-the-date", labelKey: "saveTheDate", icon: CalendarHeart },
    { href: "/dashboard/seating", labelKey: "seating", icon: Armchair },
    { href: "/dashboard/gallery", labelKey: "gallery", icon: Image },
    { href: "/dashboard/qr-code", labelKey: "qrCode", icon: QrCode },
    { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
  ],
  "/demo/dashboard": [
    { href: "/demo/dashboard", labelKey: "overview", icon: LayoutDashboard },
    { href: "/demo/dashboard/event-page", labelKey: "eventPage", icon: Sparkles },
    { href: "/demo/dashboard/save-the-date", labelKey: "saveTheDate", icon: CalendarHeart },
    { href: "/demo/dashboard/seating", labelKey: "seating", icon: Armchair },
    { href: "/demo/dashboard/gallery", labelKey: "gallery", icon: Image },
    { href: "/demo/dashboard/qr-code", labelKey: "qrCode", icon: QrCode },
    { href: "/demo/dashboard/settings", labelKey: "settings", icon: Settings },
  ],
};

export function DashboardNav({
  basePath = "/dashboard",
}: {
  basePath?: DashboardBasePath;
}) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const navItems = navByBase[basePath];

  return (
    <nav className="grid w-full grid-cols-7 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border/50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-all sm:px-3",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden truncate sm:inline">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
