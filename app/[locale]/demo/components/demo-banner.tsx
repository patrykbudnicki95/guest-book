"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDemoWorkspace } from "@/lib/demo/provider";
import { DemoPersistDrawer } from "./demo-persist-drawer";

export function DemoBanner() {
  const t = useTranslations("demo");
  const pathname = usePathname();
  const { reset } = useDemoWorkspace();
  const [persistOpen, setPersistOpen] = useState(false);
  const [isResetting, startReset] = useTransition();

  const isGuest = pathname === "/demo";
  const isDashboard = pathname.startsWith("/demo/dashboard");

  const handleReset = () => {
    startReset(async () => {
      await reset();
      toast.success(t("resetDone"));
    });
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50">
        <div className="flex h-12 items-center gap-2 overflow-x-auto px-3">
          <p className="hidden shrink-0 text-xs text-amber-950 sm:block">
            {t("banner")}
          </p>
          <p className="shrink-0 text-xs font-medium text-amber-950 sm:hidden">
            {t("bannerShort")}
          </p>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Button
              asChild
              variant={isGuest ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 rounded-full text-xs", isGuest && "bg-white")}
            >
              <Link href="/demo">{t("guest")}</Link>
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
