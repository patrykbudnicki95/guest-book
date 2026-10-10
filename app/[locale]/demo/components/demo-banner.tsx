"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDemoWorkspace } from "@/lib/demo/provider";
import { PRODUCT_IDS, ownedApps, type ProductId } from "@/lib/pricing";
import { DemoPersistDrawer } from "./demo-persist-drawer";

/** The guest page of the first owned app, so "Guest view" always leads somewhere real. */
const GUEST_PAGES = {
  guestbook: "/demo",
  saveTheDate: "/demo/save-the-date",
  seating: "/demo/tables",
} as const;

export function DemoBanner() {
  const t = useTranslations("demo");
  const tProducts = useTranslations("products");
  const pathname = usePathname();
  const router = useRouter();
  const { event, reset, setProducts } = useDemoWorkspace();
  const [persistOpen, setPersistOpen] = useState(false);
  const [isResetting, startReset] = useTransition();

  const apps = ownedApps(event.products);
  const guestHref = apps.length > 0 ? GUEST_PAGES[apps[0]] : "/demo";
  const isGuest = Object.values(GUEST_PAGES).some((href) => pathname === href);
  const isDashboard = pathname.startsWith("/demo/dashboard");
  // A demo switched to one product shows it; anything else was assembled in "Discover".
  const edition = event.products.length === 1 ? event.products[0] : "custom";

  const handleReset = () => {
    startReset(async () => {
      await reset();
      toast.success(t("resetDone"));
    });
  };

  const handleEdition = (product: string) => {
    void setProducts([product as ProductId]).then(() => router.push("/demo/dashboard"));
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50">
        <div className="flex h-12 items-center gap-2 overflow-x-auto px-3">
          <p className="hidden shrink-0 text-xs text-amber-950 lg:block">
            {t("banner")}
          </p>
          <p className="shrink-0 text-xs font-medium text-amber-950 lg:hidden">
            {t("bannerShort")}
          </p>
          <Select value={edition} onValueChange={handleEdition}>
            <SelectTrigger
              size="sm"
              aria-label={t("edition")}
              className="h-8 shrink-0 rounded-full border-amber-300 bg-white text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_IDS.map((product) => (
                <SelectItem key={product} value={product}>
                  {tProducts(`${product}.name`)}
                </SelectItem>
              ))}
              {edition === "custom" && (
                <SelectItem value="custom" disabled>
                  {t("editionCustom")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              asChild
              variant={isGuest ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 rounded-full text-xs", isGuest && "bg-white")}
            >
              <Link href={guestHref}>{t("guest")}</Link>
            </Button>
            <Button
              asChild
              variant={isDashboard ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 rounded-full text-xs",
                isDashboard && "bg-white",
              )}
            >
              <Link href="/demo/dashboard">{t("dashboard")}</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full text-xs"
              onClick={handleReset}
              disabled={isResetting}
            >
              {t("reset")}
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-full text-xs shadow-none"
              onClick={() => setPersistOpen(true)}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </div>
      <DemoPersistDrawer open={persistOpen} onOpenChange={setPersistOpen} />
    </>
  );
}
