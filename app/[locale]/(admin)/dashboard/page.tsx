import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getUserEvents } from "@/app/actions/dashboard-actions";
import { OverviewTab } from "./components/overview-tab";
import { Skeleton } from "@/components/ui/skeleton";

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

async function OverviewContent() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const [stats, events] = await Promise.all([
    getDashboardStats(user.id),
    getUserEvents(user.id),
  ]);

  return <OverviewTab stats={stats} events={events} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewContent />
    </Suspense>
  );
}

