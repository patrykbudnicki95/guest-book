import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { GuestViewContentClient } from "./guest-view-content-client";
import { EventFullSchema, UploadGuestSchema } from "@/lib/schemas/database";
import type { Upload } from "./upload-drawer";

async function getEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, names, date, location, theme_color, cover_photo_url, welcome_message, schedule, menu",
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

async function getEventUploads(eventId: string): Promise<Upload[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uploads")
    .select(
      "id, file_url, thumbnail_url, media_type, guest_name, caption, created_at",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getEventUploads] Supabase error:", error);
    return [];
  }

  if (!data) {
    console.warn("[getEventUploads] No data returned from Supabase");
    return [];
  }

  const parsed = z.array(UploadGuestSchema).safeParse(data);
  if (!parsed.success) {
    console.error("[getEventUploads] Zod validation failed:");
    console.error(
      "Validation errors:",
      JSON.stringify(parsed.error.format(), null, 2),
    );
    console.error("Raw data:", JSON.stringify(data, null, 2));
    return [];
  }

  return parsed.data.map((upload) => ({
    id: upload.id,
    file_url: upload.file_url,
    thumbnail_url: upload.thumbnail_url,
    media_type: upload.media_type,
    guest_name: upload.guest_name,
    caption: upload.caption,
    created_at: upload.created_at,
  }));
}

export async function GuestViewContent({ eventId }: { eventId: string }) {
  const [event, uploads] = await Promise.all([
    getEvent(eventId),
    getEventUploads(eventId),
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

  return <GuestViewContentClient event={event} initialUploads={uploads} />;
}
