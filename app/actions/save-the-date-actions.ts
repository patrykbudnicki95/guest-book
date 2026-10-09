"use server";

import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  R2_BUCKET_NAME,
  buildPublicUrl,
  fileKeyFromPublicUrl,
  r2Client,
} from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";
import {
  EventForSaveTheDateSchema,
  EventSaveTheDateSchema,
  GuestSaveTheDateSchema,
  SaveTheDateUpdateSchema,
  type EventForSaveTheDate,
  type GuestSaveTheDate,
  type SaveTheDateUpdate,
} from "@/lib/schemas/database";
import { hasFeature } from "@/lib/permissions";
import { getEventPlanContext } from "@/lib/permissions/server";
import {
  SAVE_THE_DATE_ASSETS,
  isSaveTheDateAssetKind,
  type SaveTheDateAssetKind,
} from "@/lib/save-the-date";
import type { Json } from "@/types/supabase";

export type SaveTheDateEvent = EventForSaveTheDate & {
  saveTheDate: SaveTheDateUpdate | null;
};

/** The owner's events with their save the date, draft or published. */
export async function getSaveTheDateList(
  userId: string,
): Promise<SaveTheDateEvent[]> {
  const supabase = await createClient();

  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("id, names, date, location, plan_id, addons")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (eventsError || !eventsData) {
    console.error("[getSaveTheDateList] Error fetching events:", eventsError);
    return [];
  }

  const events = z.array(EventForSaveTheDateSchema).safeParse(eventsData);
  if (!events.success) {
    console.error(
      "[getSaveTheDateList] Zod validation failed:",
      z.prettifyError(events.error),
    );
    console.error(
      "[getSaveTheDateList] Raw data:",
      JSON.stringify(eventsData, null, 2),
    );
    return [];
  }

  if (events.data.length === 0) {
    return [];
  }

  const { data: rowsData, error: rowsError } = await supabase
    .from("event_save_the_date")
    .select("event_id, template, content, is_published")
    .in(
      "event_id",
      events.data.map((event) => event.id),
    );

  if (rowsError || !rowsData) {
    console.error("[getSaveTheDateList] Error fetching save the date:", rowsError);
    return [];
  }

  const rows = z.array(EventSaveTheDateSchema).safeParse(rowsData);
  if (!rows.success) {
    console.error(
      "[getSaveTheDateList] Zod validation failed:",
      z.prettifyError(rows.error),
    );
    console.error("[getSaveTheDateList] Raw data:", JSON.stringify(rowsData, null, 2));
    return [];
  }

  return events.data.map((event) => {
    const row = rows.data.find((item) => item.event_id === event.id);
    return {
      ...event,
      saveTheDate: row
        ? {
            template: row.template,
            content: row.content,
            is_published: row.is_published,
          }
        : null,
    };
  });
}

/**
 * The event and its published page for guests. RLS only returns published rows
 * to guests; the explicit filter keeps the owner's own visit identical.
 */
export async function getPublishedSaveTheDate(eventId: string): Promise<{
  event: EventForSaveTheDate;
  saveTheDate: GuestSaveTheDate | null;
} | null> {
  const supabase = await createClient();

  const [eventResult, rowResult] = await Promise.all([
    supabase
      .from("events")
      .select("id, names, date, location, plan_id, addons")
      .eq("id", eventId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("event_save_the_date")
      .select("template, content")
      .eq("event_id", eventId)
      .eq("is_published", true)
      .maybeSingle(),
  ]);

  if (eventResult.error || !eventResult.data) {
    if (eventResult.error) {
      console.error("[getPublishedSaveTheDate] Supabase error:", eventResult.error);
    }
    return null;
  }

  const event = EventForSaveTheDateSchema.safeParse(eventResult.data);
  if (!event.success) {
    console.error(
      "[getPublishedSaveTheDate] Zod validation failed:",
      z.prettifyError(event.error),
    );
    console.error(
      "[getPublishedSaveTheDate] Raw data:",
      JSON.stringify(eventResult.data, null, 2),
    );
    return null;
  }

  if (rowResult.error) {
    console.error("[getPublishedSaveTheDate] Supabase error:", rowResult.error);
  }

  if (!rowResult.data) {
    return { event: event.data, saveTheDate: null };
  }

  const row = GuestSaveTheDateSchema.safeParse(rowResult.data);
  if (!row.success) {
    console.error(
      "[getPublishedSaveTheDate] Zod validation failed:",
      z.prettifyError(row.error),
    );
    console.error(
      "[getPublishedSaveTheDate] Raw data:",
      JSON.stringify(rowResult.data, null, 2),
    );
    return { event: event.data, saveTheDate: null };
  }

  const unlocked = hasFeature({
    plan: event.data.plan_id,
    feature: "saveTheDate",
    addons: event.data.addons,
  });

  return { event: event.data, saveTheDate: unlocked ? row.data : null };
}

/** Ownership plus the Gold-or-add-on check every write needs. */
async function checkOwnedSaveTheDate(
  eventId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { data: owned } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!owned) {
    return { ok: false, error: "Event not found" };
  }

  const context = await getEventPlanContext(eventId);
  if (!context) {
    return { ok: false, error: "Event not found" };
  }

  if (
    !hasFeature({
      plan: context.plan_id,
      feature: "saveTheDate",
      addons: context.addons,
    })
  ) {
    return { ok: false, error: "planUpgradeRequired" };
  }

  return { ok: true };
}

export async function updateSaveTheDate(
  eventId: string,
  data: SaveTheDateUpdate,
): Promise<{ success: boolean; error?: string }> {
  const parsed = SaveTheDateUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  const check = await checkOwnedSaveTheDate(eventId);
  if (!check.ok) {
    return { success: false, error: check.error };
  }

  const { content } = parsed.data;

  // Only files uploaded through the presign below, so the page can't point at
  // (or make next/image fetch from) an arbitrary host.
  const assetPrefix = `events/${eventId}/save-the-date/`;
  const isOwnAsset = (url: string | null) =>
    url === null || Boolean(fileKeyFromPublicUrl(url)?.startsWith(assetPrefix));
  if (!isOwnAsset(content.photo_url) || !isOwnAsset(content.music_url)) {
    return { success: false, error: "invalidFileType" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("event_save_the_date")
    // @ts-expect-error Supabase upsert() infers 'never' - types/supabase.ts event_save_the_date.Insert is correct
    .upsert({
      event_id: eventId,
      template: parsed.data.template,
      content: {
        ...content,
        names: content.names.trim(),
        eyebrow: content.eyebrow.trim(),
        message: content.message.trim(),
        location: content.location.trim(),
      } as Json,
      is_published: parsed.data.is_published,
    });

  if (error) {
    console.error("[updateSaveTheDate] Error saving save the date:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Signs a direct-to-R2 upload for the page photo or its background music. The
 * size is part of the signature, so R2 rejects a bigger file than the one checked.
 */
export async function getPresignedUrlForSaveTheDateAsset(input: {
  eventId: string;
  kind: SaveTheDateAssetKind;
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<
  | { success: true; uploadUrl: string; publicUrl: string }
  | { success: false; error: string }
> {
  if (!isSaveTheDateAssetKind(input.kind)) {
    return { success: false, error: "invalidFileType" };
  }

  const rules = SAVE_THE_DATE_ASSETS[input.kind];

  if (!(rules.types as readonly string[]).includes(input.fileType)) {
    return { success: false, error: "invalidFileType" };
  }

  if (input.fileSize <= 0 || input.fileSize > rules.maxBytes) {
    return { success: false, error: "fileTooLarge" };
  }

  const check = await checkOwnedSaveTheDate(input.eventId);
  if (!check.ok) {
    return { success: false, error: check.error };
  }

  const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `events/${input.eventId}/save-the-date/${input.kind}/${crypto.randomUUID()}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: input.fileType,
    ContentLength: input.fileSize,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });

  return { success: true, uploadUrl, publicUrl: buildPublicUrl(fileKey) };
}
