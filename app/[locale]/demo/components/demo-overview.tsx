"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, HardDrive, ExternalLink } from "lucide-react";
import { formatBytes } from "@/lib/permissions";
import {
  DEMO_MAX_FILE_BYTES,
  DEMO_MAX_UPLOADS,
  useDemoWorkspace,
} from "@/lib/demo/provider";

export function DemoOverview() {
  const t = useTranslations("demo");
  const { event, uploads } = useDemoWorkspace();
  const usedBytes = event.storage_used_bytes;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{event.names}</h2>
        <p className="text-sm text-muted-foreground">{t("overviewTitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("photos")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Camera className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {uploads.length}
              <span className="text-lg font-normal text-muted-foreground">
                /{DEMO_MAX_UPLOADS}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("storage")}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <HardDrive className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatBytes(usedBytes)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("openGuest")}</CardTitle>
          <CardDescription>
            {t("capHint", {
              count: DEMO_MAX_UPLOADS,
              size: formatBytes(DEMO_MAX_FILE_BYTES),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-full">
            <Link href="/demo">
              <ExternalLink className="mr-2 size-4" />
              {t("guest")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
