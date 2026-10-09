import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSeatingList } from "@/app/actions/seating-actions";
import { SeatingTab } from "./components/seating-tab";
import { Skeleton } from "@/components/ui/skeleton";

function SeatingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}

async function SeatingContent() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const events = await getSeatingList(user.id);

  return <SeatingTab events={events} />;
}

export default function SeatingPage() {
  return (
    <Suspense fallback={<SeatingSkeleton />}>
      <SeatingContent />
    </Suspense>
  );
}
