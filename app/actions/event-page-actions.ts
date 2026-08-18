"use server";

import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";
import {
  EventFullSchema,
  EventPageContentUpdateSchema,
  EventForPdfSchema,
  type EventFull,
  type EventPageContentUpdate,
} from "@/lib/schemas/database";
import type { Database, Json } from "@/types/supabase";

const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function getEventPageDataList(userId: string): Promise<EventFull[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, names, date, location, theme_color, cover_photo_url, welcome_message, schedule, menu",
    )
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getEventPageDataList] Error fetching events:", error);
    return [];
  }

  const parsed = z.array(EventFullSchema).safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEventPageDataList] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getEventPageDataList] Raw data:", JSON.stringify(data, null, 2));
    return [];
  }

  return parsed.data;
}

export async function getEventPageData(
  eventId: string,
): Promise<EventFull | null> {
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
    console.error("[getEventPageData] Error fetching event:", error);
    return null;
  }

  const parsed = EventFullSchema.safeParse(data);
  if (!parsed.success) {
    console.error(
      "[getEventPageData] Zod validation failed:",
      z.prettifyError(parsed.error),
    );
    console.error("[getEventPageData] Raw data:", JSON.stringify(data, null, 2));
    return null;
  }

  return parsed.data;
}

export async function updateEventPageContent(
  eventId: string,
  data: EventPageContentUpdate,
): Promise<{ success: boolean; error?: string }> {
  const parsed = EventPageContentUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: Database["public"]["Tables"]["events"]["Update"] = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.cover_photo_url !== undefined) {
    updateData.cover_photo_url = parsed.data.cover_photo_url;
  }
  if (parsed.data.welcome_message !== undefined) {
    updateData.welcome_message = parsed.data.welcome_message;
  }
  if (parsed.data.schedule !== undefined) {
    updateData.schedule = (parsed.data.schedule as Json) ?? null;
  }
  if (parsed.data.menu !== undefined) {
    updateData.menu = (parsed.data.menu as Json) ?? null;
  }

  const { error } = await supabase
    .from("events")
    // @ts-expect-error Supabase update() infers 'never' - types/supabase.ts events.Update is correct
    .update(updateData)
    .eq("id", eventId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[updateEventPageContent] Error updating event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getPresignedUrlForCoverPhoto(
  fileName: string,
  fileType: string,
  eventId: string,
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  if (!ALLOWED_COVER_TYPES.includes(fileType)) {
    throw new Error(
      `Invalid file type. Allowed types: ${ALLOWED_COVER_TYPES.join(", ")}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!event) {
    throw new Error("Event not found or unauthorized");
  }

  const uuid = crypto.randomUUID();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `events/${eventId}/cover/${uuid}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 900,
  });

  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is not set");
  }

  return {
    uploadUrl,
    fileKey,
    publicUrl: `${r2Domain}/${fileKey}`,
  };
}

/** Lightweight helper for QR page — re-export friendly shape */
export async function getEventsForOwner(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, names, date, location")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const parsed = z.array(EventForPdfSchema).safeParse(data);
  return parsed.success ? parsed.data : [];
}
