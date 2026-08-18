import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getEventPageDataList } from "@/app/actions/event-page-actions";
import { EventPageTab } from "./components/event-page-tab";
import { Skeleton } from "@/components/ui/skeleton";

function EventPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  );
}

async function EventPageContent() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const events = await getEventPageDataList(user.id);

  return <EventPageTab events={events} />;
}

export default function EventPagePage() {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <EventPageContent />
    </Suspense>
  );
}
