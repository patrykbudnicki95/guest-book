import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { GuestViewContentClient } from "./guest-view-content-client";
import {
  EntryWithMediaSchema,
  EventFullSchema,
  type Entry,
} from "@/lib/schemas/database";
import { getUploadWindowEnd, isGuestUploadOpen } from "@/lib/permissions";

async function getEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, names, date, location, theme_color, cover_photo_url, welcome_message, schedule, menu, plan_id, storage_used_bytes",
    )
    .eq("id", eventId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("[getEvent] Error fetching event:", error);
    return null;
  }

  const parsed = EventFullSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEvent] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getEvent] Raw data:", data);
    return null;
  }

  return parsed.data;
}

async function getEventEntries(eventId: string): Promise<Entry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, guest_name, message, is_private, created_at, uploads(id, file_url, thumbnail_url, media_type)",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "uploads" });

  if (error) {
    console.error("[getEventEntries] Supabase error:", error);
    return [];
  }

  if (!data) {
    console.warn("[getEventEntries] No data returned from Supabase");
    return [];
  }

  const parsed = z.array(EntryWithMediaSchema).safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEventEntries] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getEventEntries] Raw data:", JSON.stringify(data, null, 2));
    return [];
  }

  return parsed.data;
}

export async function GuestViewContent({ eventId }: { eventId: string }) {
  const [event, entries] = await Promise.all([
    getEvent(eventId),
    getEventEntries(eventId),
  ]);

  if (!event) {
    const t = await getTranslations("guestView");
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("eventNotFound")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("eventNotFoundDesc")}
          </p>
        </div>
      </div>
    );
  }

  // Computed on the server so a guest with a skewed clock cannot reopen the
  // window; the server actions enforce it again anyway.
  const uploadWindow = {
    isOpen: isGuestUploadOpen({ plan: event.plan_id, eventDate: event.date }),
    closesAt: getUploadWindowEnd({
      plan: event.plan_id,
      eventDate: event.date,
    }).toISOString(),
  };

  return (
    <GuestViewContentClient
      event={event}
      initialEntries={entries}
      uploadWindow={uploadWindow}
    />
  );
}
