"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, HardDrive, Calendar, Upload, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { PlanUsageCard } from "./plan-usage-card";
import type {
  DashboardStats,
  EventPlanSummary,
  UserEvent,
} from "@/app/actions/dashboard-actions";

interface OverviewTabProps {
  stats: DashboardStats;
  events: UserEvent[];
  planSummaries: EventPlanSummary[];
}

export function OverviewTab({
  stats,
  events,
  planSummaries,
}: OverviewTabProps) {
  const t = useTranslations("dashboard.overview");
  const tCommon = useTranslations("common");
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  const copyToClipboard = async (eventId: string, eventName: string) => {
    const url = `${window.location.origin}/e/${eventId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEventId(eventId);
      toast.success(t("linkCopiedFor", { name: eventName }));
      setTimeout(() => setCopiedEventId(null), 2000);
    } catch (error) {
      console.error("[copyToClipboard] Failed to copy:", error);
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalPhotos")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Camera className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPhotos}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("acrossAllEvents")}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("storageUsed")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <HardDrive className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStorage}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("totalStorage")}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeEvents")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeEvents}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("currentlyActive")}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("recentUploads")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recentUploads}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("last24Hours")}
            </p>
          </CardContent>
        </Card>
      </div>

      <PlanUsageCard summaries={planSummaries} />

      {events.length > 0 && (
        <Card className="rounded-xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t("shareEventLinks")}</CardTitle>
            <CardDescription>{t("copyShareDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => {
              const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/e/${event.id}`;
              const isCopied = copiedEventId === event.id;

              return (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{event.names}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(event.id, event.names)}
                      className="gap-2 rounded-full"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-4" />
                          {tCommon("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          {tCommon("copy")}
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={eventUrl}
                      readOnly
                      className="rounded-lg font-mono text-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("welcomeBack")}</CardTitle>
          <CardDescription>{t("manageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("navHint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
