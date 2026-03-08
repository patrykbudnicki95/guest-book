import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getEventSettingsList } from "@/app/actions/settings-actions";
import { SettingsTab } from "./components/settings-tab";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  );
}

async function SettingsContent() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const events = await getEventSettingsList(user.id);

  return <SettingsTab events={events} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
