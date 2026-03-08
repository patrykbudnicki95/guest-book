import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "./dashboard-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

async function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale: locale as "pl" | "en" });
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-sm text-muted-foreground">
              {t("signedInAs")} <span className="font-medium text-foreground">{user.email || ""}</span>
            </div>
          </div>
        </div>
        <DashboardNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

