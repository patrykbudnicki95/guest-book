import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EventForSeatingSchema } from "@/lib/schemas/database";
import { noindexMetadata } from "@/lib/seo/metadata";
import { hasFeature } from "@/lib/permissions";
import { getPublishedSeating } from "@/app/actions/seating-actions";
import type { AppLocale } from "@/i18n/routing";
import { SeatingBrowser } from "./components/seating-browser";
import { Skeleton } from "@/components/ui/skeleton";

interface TablesPageProps {
  params: Promise<{ locale: AppLocale; eventId: string }>;
}

async function getEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, names, plan_id")
    .eq("id", eventId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const parsed = EventForSeatingSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[TablesPage.getEvent] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[TablesPage.getEvent] Raw data:", JSON.stringify(data, null, 2));
    return null;
  }

  return parsed.data;
}

/** Guest names are personal data, so this page is never indexed either. */
export async function generateMetadata({
  params,
}: TablesPageProps): Promise<Metadata> {
  const { locale, eventId } = await params;
  const t = await getTranslations({ locale, namespace: "guestView.seating" });
  const event = await getEvent(eventId);

  return noindexMetadata(
    event ? t("metaTitle", { names: event.names }) : t("title"),
  );
}

function TablesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border-b bg-white p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-3 h-11 w-full rounded-full" />
      </div>
      <div className="mx-auto max-w-2xl space-y-4 px-4">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

async function TablesContent({ params }: TablesPageProps) {
  const { eventId } = await params;
  const [event, seating] = await Promise.all([
    getEvent(eventId),
    getPublishedSeating(eventId),
  ]);

  if (!event) {
    const t = await getTranslations("guestView");
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("eventNotFound")}</h1>
          <p className="mt-2 text-muted-foreground">{t("eventNotFoundDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <SeatingBrowser
      eventNames={event.names}
      tables={
        hasFeature({ plan: event.plan_id, feature: "findYourTable" })
          ? seating
          : null
      }
      backHref={{ pathname: "/e/[eventId]", params: { eventId } }}
    />
  );
}

export default function TablesPage({ params }: TablesPageProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense fallback={<TablesSkeleton />}>
        <TablesContent params={params} />
      </Suspense>
    </div>
  );
}
