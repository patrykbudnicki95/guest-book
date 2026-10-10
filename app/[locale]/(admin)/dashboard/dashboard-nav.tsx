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
import type { AppId } from "@/lib/pricing";

export type DashboardBasePath = "/dashboard" | "/demo/dashboard";

type NavItem = {
  path: "" | "/event-page" | "/save-the-date" | "/seating" | "/gallery" | "/qr-code" | "/settings";
  labelKey: "overview" | "eventPage" | "saveTheDate" | "seating" | "gallery" | "qrCode" | "settings";
  icon: typeof LayoutDashboard;
  /** The app the tab belongs to; tabs without one are always shown. */
  app?: AppId;
};

const NAV_ITEMS: NavItem[] = [
  { path: "", labelKey: "overview", icon: LayoutDashboard },
  { path: "/event-page", labelKey: "eventPage", icon: Sparkles, app: "guestbook" },
  { path: "/save-the-date", labelKey: "saveTheDate", icon: CalendarHeart, app: "saveTheDate" },
  { path: "/seating", labelKey: "seating", icon: Armchair, app: "seating" },
  { path: "/gallery", labelKey: "gallery", icon: Image, app: "guestbook" },
  { path: "/qr-code", labelKey: "qrCode", icon: QrCode, app: "guestbook" },
  { path: "/settings", labelKey: "settings", icon: Settings },
];

/** Only the apps the couple owns get tabs; the rest live in "Discover" on the overview. */
export function DashboardNav({
  basePath = "/dashboard",
  apps,
}: {
  basePath?: DashboardBasePath;
  apps: readonly AppId[];
}) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const navItems = NAV_ITEMS.filter((item) => !item.app || apps.includes(item.app));

  return (
    <nav
      className="grid w-full gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border/50"
      style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
    >
      {navItems.map((item) => {
        const href = `${basePath}${item.path}` as StaticAppPathname;
        const isActive = pathname === href;
        const Icon = item.icon;
        return (
          <Link
            key={href}
            href={href}
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
