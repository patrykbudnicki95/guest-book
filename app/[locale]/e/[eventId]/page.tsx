import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EventIdWithNamesSchema } from "@/lib/schemas/database";
import { noindexMetadata } from "@/lib/seo/metadata";
import type { AppLocale } from "@/i18n/routing";
import { GuestViewContent } from "./guest-view-content";
import { Skeleton } from "@/components/ui/skeleton";

interface GuestViewPageProps {
  params: Promise<{ locale: AppLocale; eventId: string }>;
}

async function getEventNames(eventId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, names")
    .eq("id", eventId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const parsed = EventIdWithNamesSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEventNames] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getEventNames] Raw data:", JSON.stringify(data, null, 2));
    return null;
  }

  return parsed.data.names;
}

/**
 * Guest galleries contain photos and names of private guests, so they must never
 * be indexed. The title is still event-specific for link previews when couples
 * share the URL in a chat.
 */
export async function generateMetadata({
  params,
}: GuestViewPageProps): Promise<Metadata> {
  const { locale, eventId } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.event" });
  const names = await getEventNames(eventId);

  return noindexMetadata(
    names ? t("title", { names }) : t("fallbackTitle"),
    t("description"),
  );
}

function GuestViewSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1 h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function GuestViewPageContent({ params }: GuestViewPageProps) {
  const { eventId } = await params;

  return <GuestViewContent eventId={eventId} />;
}

export default function GuestViewPage({ params }: GuestViewPageProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense fallback={<GuestViewSkeleton />}>
        <GuestViewPageContent params={params} />
      </Suspense>
    </div>
  );
}
