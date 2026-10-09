import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getSaveTheDateList } from "@/app/actions/save-the-date-actions";
import { SaveTheDateTab } from "./components/save-the-date-tab";
import { Skeleton } from "@/components/ui/skeleton";

function SaveTheDateSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="hidden h-[640px] rounded-[3rem] lg:block" />
    </div>
  );
}

async function SaveTheDateContent() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const events = await getSaveTheDateList(user.id);

  return <SaveTheDateTab events={events} />;
}

export default function SaveTheDatePage() {
  return (
    <Suspense fallback={<SaveTheDateSkeleton />}>
      <SaveTheDateContent />
    </Suspense>
  );
}
