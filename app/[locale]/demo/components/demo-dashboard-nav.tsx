"use client";

import { DashboardNav } from "@/app/[locale]/(admin)/dashboard/dashboard-nav";
import { useDemoWorkspace } from "@/lib/demo/provider";
import { ownedApps } from "@/lib/pricing";

export function DemoDashboardNav() {
  const { event } = useDemoWorkspace();

  return <DashboardNav basePath="/demo/dashboard" apps={ownedApps(event.products)} />;
}
