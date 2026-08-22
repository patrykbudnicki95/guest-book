"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getMinimumPlanFor, type PlanFeature } from "@/lib/permissions";
import { PLAN_LABELS } from "@/lib/pricing";

/**
 * Shown in place of an editor the current plan does not include. The server
 * actions reject the same writes, so this is purely so the couple understands
 * why the surface is unavailable.
 */
export function PlanLock({ feature }: { feature: PlanFeature }) {
  const t = useTranslations("dashboard.planLock");
  const minimumPlan = getMinimumPlanFor(feature);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <Lock className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{t("title")}</p>
        <p className="text-sm text-muted-foreground">
          {minimumPlan
            ? t("availableIn", { plan: PLAN_LABELS[minimumPlan] })
            : t("comingSoon")}
        </p>
      </div>
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link href="/pricing">{t("cta")}</Link>
      </Button>
    </div>
  );
}
