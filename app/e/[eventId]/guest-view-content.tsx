import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { GuestViewContentClient } from "./guest-view-content-client";
import { EventBasicSchema, UploadGuestSchema } from "@/lib/schemas/database";
import type { Upload } from "./upload-drawer";

async function getEvent(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, names, date")
    .eq("id", eventId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("[getEvent] Error fetching event:", error);
    return null;
  }

  // Parse and validate with Zod
  const parsed = EventBasicSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[getEvent] Zod validation failed:", z.prettifyError(parsed.error));
    console.error("[getEvent] Raw data:", data);
    return null;
  }

  return parsed.data;
}

async function getEventUploads(eventId: string): Promise<Upload[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("uploads")
    .select("id, file_url, thumbnail_url, media_type, guest_name, caption, created_at")
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

  // Parse and validate with Zod
  const parsed = z.array(UploadGuestSchema).safeParse(data);
  if (!parsed.success) {
    console.error("[getEventUploads] Zod validation failed:");
    console.error("Validation errors:", JSON.stringify(parsed.error.format(), null, 2));
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
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Event not found</h1>
          <p className="mt-2 text-muted-foreground">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  return <GuestViewContentClient event={event} initialUploads={uploads} />;
}

