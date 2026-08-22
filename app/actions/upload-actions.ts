"use server";

import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  R2_BUCKET_NAME,
  buildPublicUrl,
  deleteObject,
  fileKeyFromPublicUrl,
  getObjectInfo,
  r2Client,
} from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";
import {
  UploadInsertSchema,
  UploadFullSchema,
  UploadEventIdSchema,
  EventOwnerSchema,
  type UploadInsert,
} from "@/lib/schemas/database";
import { getEventPlanContext } from "@/lib/permissions/server";
import {
  checkUploadAllowed,
  type UploadRejectionReason,
} from "@/lib/permissions";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export type UploadFailureReason =
  | UploadRejectionReason
  | "invalidFileType"
  | "eventNotFound"
  | "objectMissing"
  | "saveFailed";

export type PresignedUrlResult =
  | { ok: true; uploadUrl: string; fileKey: string }
  | { ok: false; reason: UploadFailureReason };

export type SaveUploadResult =
  | {
      ok: true;
      id: string;
      file_url: string;
      thumbnail_url: string | null;
      media_type: "image" | "video";
    }
  | { ok: false; reason: UploadFailureReason };

function mediaTypeFor(fileType: string): "image" | "video" {
  return ALLOWED_IMAGE_TYPES.includes(fileType) ? "image" : "video";
}

/**
 * Signs a direct-to-R2 upload only if the event's plan allows it. `ContentLength`
 * is part of the signature so R2 rejects a payload of a different size than the
 * one we approved.
 */
export async function getPresignedUrl(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
  eventId: string;
}): Promise<PresignedUrlResult> {
  const { fileName, fileType, fileSize, eventId } = input;

  if (!ALLOWED_TYPES.includes(fileType)) {
    return { ok: false, reason: "invalidFileType" };
  }

  const context = await getEventPlanContext(eventId);

  if (!context) {
    return { ok: false, reason: "eventNotFound" };
  }

  const check = checkUploadAllowed({
    plan: context.plan_id,
    eventDate: context.date,
    isActive: context.is_active,
    usedBytes: context.storage_used_bytes,
    fileBytes: fileSize,
    mediaType: mediaTypeFor(fileType),
  });

  if (!check.allowed) {
    return { ok: false, reason: check.reason };
  }

  const uuid = crypto.randomUUID();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `events/${eventId}/${uuid}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 900,
  });

  return { ok: true, uploadUrl, fileKey };
}

/**
 * Runs after the client has PUT the file. The size and media type are read back
 * from R2 rather than taken from the request, and the quota is re-checked because
 * another guest may have uploaded in the meantime.
 */
export async function saveUploadToDb(input: {
  eventId: string;
  fileKey: string;
  guestName?: string;
  caption?: string;
}): Promise<SaveUploadResult> {
  const { eventId, fileKey, guestName, caption } = input;
  const supabase = await createClient();

  const objectInfo = await getObjectInfo(fileKey);

  if (!objectInfo) {
    return { ok: false, reason: "objectMissing" };
  }

  const context = await getEventPlanContext(eventId);

  if (!context) {
    await deleteObject(fileKey);
    return { ok: false, reason: "eventNotFound" };
  }

  const contentType = objectInfo.contentType ?? "";

  if (!ALLOWED_TYPES.includes(contentType)) {
    await deleteObject(fileKey);
    return { ok: false, reason: "invalidFileType" };
  }

  const mediaType = mediaTypeFor(contentType);

  const check = checkUploadAllowed({
    plan: context.plan_id,
    eventDate: context.date,
    isActive: context.is_active,
    usedBytes: context.storage_used_bytes,
    fileBytes: objectInfo.sizeBytes,
    mediaType,
  });

  if (!check.allowed) {
    await deleteObject(fileKey);
    return { ok: false, reason: check.reason };
  }

  const fileUrl = buildPublicUrl(fileKey);

  const insertData: UploadInsert = {
    event_id: eventId,
    file_url: fileUrl,
    thumbnail_url: mediaType === "image" ? fileUrl : null,
    media_type: mediaType,
    file_size_bytes: objectInfo.sizeBytes,
    guest_name: guestName || null,
    caption: caption || null,
  };

  const validated = UploadInsertSchema.safeParse(insertData);

  if (!validated.success) {
    console.error(
      "[saveUploadToDb] Zod validation failed:",
      z.prettifyError(validated.error),
    );
    console.error(
      "[saveUploadToDb] Raw data:",
      JSON.stringify(insertData, null, 2),
    );
    await deleteObject(fileKey);
    return { ok: false, reason: "saveFailed" };
  }

  const { data, error } = await supabase
    .from("uploads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(validated.data as any)
    .select()
    .single();

  if (error || !data) {
    console.error("[saveUploadToDb] Supabase insert failed:", error);
    await deleteObject(fileKey);
    return { ok: false, reason: "saveFailed" };
  }

  const parsedUpload = UploadFullSchema.safeParse(data);

  if (!parsedUpload.success) {
    console.error(
      "[saveUploadToDb] Zod validation failed on inserted row:",
      z.prettifyError(parsedUpload.error),
    );
    console.error("[saveUploadToDb] Raw data:", JSON.stringify(data, null, 2));
    return { ok: false, reason: "saveFailed" };
  }

  return {
    ok: true,
    id: parsedUpload.data.id,
    file_url: parsedUpload.data.file_url,
    thumbnail_url: parsedUpload.data.thumbnail_url,
    media_type: parsedUpload.data.media_type,
  };
}

export async function deleteUpload(
  uploadId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .select("event_id, file_url")
    .eq("id", uploadId)
    .single();

  if (uploadError || !upload) {
    throw new Error("Upload not found");
  }

  const parsedUpload = UploadEventIdSchema.extend({
    file_url: z.string().url(),
  }).safeParse(upload);

  if (!parsedUpload.success) {
    console.error(
      "[deleteUpload] Zod validation failed:",
      z.prettifyError(parsedUpload.error),
    );
    console.error("[deleteUpload] Raw data:", JSON.stringify(upload, null, 2));
    throw new Error("Invalid upload data");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("owner_id")
    .eq("id", parsedUpload.data.event_id)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found");
  }

  const parsedEvent = EventOwnerSchema.safeParse(event);
  if (!parsedEvent.success) {
    throw new Error("Invalid event data");
  }

  if (parsedEvent.data.owner_id !== user.id) {
    throw new Error("Unauthorized: You don't own this event");
  }

  // Delete the row first: the trigger releases the quota, and a leftover R2
  // object is cheaper to reconcile than a row pointing at a deleted file.
  const { error: deleteError } = await supabase
    .from("uploads")
    .delete()
    .eq("id", uploadId);

  if (deleteError) {
    throw new Error(`Failed to delete upload: ${deleteError.message}`);
  }

  const fileKey = fileKeyFromPublicUrl(parsedUpload.data.file_url);

  if (fileKey) {
    await deleteObject(fileKey);
  } else {
    console.error(
      "[deleteUpload] Could not derive R2 key from url:",
      parsedUpload.data.file_url,
    );
  }

  return { success: true };
}
