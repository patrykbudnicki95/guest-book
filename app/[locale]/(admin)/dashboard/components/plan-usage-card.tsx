"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes, getLimits, hasApp } from "@/lib/permissions";
import type { EventPlanSummary } from "@/app/actions/dashboard-actions";

function Deadline({
  label,
  iso,
  isOpen,
  closedLabel,
}: {
  label: string;
  iso: string;
  isOpen: boolean;
  closedLabel: string;
}) {
  const format = useFormatter();

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {format.dateTime(new Date(iso), { dateStyle: "medium" })}
        {!isOpen && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {closedLabel}
          </span>
        )}
      </p>
    </div>
  );
}

export function PlanUsageCard({ summaries }: { summaries: EventPlanSummary[] }) {
  const t = useTranslations("dashboard.plan");
  const tProducts = useTranslations("products");

  if (summaries.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {summaries.map((summary) => {
          const limits = getLimits(summary.products);
          const hasGuestbook = hasApp({ products: summary.products, app: "guestbook" });

          return (
            <div key={summary.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{summary.names}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {summary.products.length === 0 && (
                    <Badge variant="outline">{t("noProducts")}</Badge>
                  )}
                  {summary.products.map((product) => (
                    <Badge key={product} variant="secondary">
                      {tProducts(`${product}.name`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {hasGuestbook && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("storage")}</span>
                      <span className="font-medium">
                        {t("storageValue", {
                          used: formatBytes(summary.storage.usedBytes),
                          total: formatBytes(summary.storage.totalBytes),
                        })}
                      </span>
                    </div>
                    <Progress value={summary.storage.percentUsed} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Deadline
                      label={t("guestUploadsUntil")}
                      iso={summary.uploadWindowEnd}
                      isOpen={summary.isUploadOpen}
                      closedLabel={t("closed")}
                    />
                    <Deadline
                      label={t("downloadUntil")}
                      iso={summary.downloadWindowEnd}
                      isOpen={summary.isDownloadOpen}
                      closedLabel={t("closed")}
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {t("maxFileSize")}
                      </p>
                      <p className="text-sm font-medium">
                        {formatBytes(limits.maxFileBytes)}
                      </p>
                    </div>
                  </div>

                  {limits.qrTableCards > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("qrTableCards")}: {limits.qrTableCards}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
