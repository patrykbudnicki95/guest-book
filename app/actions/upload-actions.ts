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
  type StoredObjectInfo,
} from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";
import {
  EntryForDeleteSchema,
  EntryInsertSchema,
  EventOwnerSchema,
  UploadInsertSchema,
  type Entry,
  type EntryInsert,
  type EventPlanContext,
  type UploadInsert,
} from "@/lib/schemas/database";
import { getEventPlanContext } from "@/lib/permissions/server";
import {
  MAX_FILES_PER_ENTRY,
  checkUploadAllowed,
  isGuestUploadOpen,
  type UploadRejectionReason,
} from "@/lib/permissions";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export type UploadFailureReason =
  | UploadRejectionReason
  | "invalidFileType"
  | "tooManyFiles"
  | "emptyEntry"
  | "eventNotFound"
  | "objectMissing"
  | "saveFailed";

export type PresignedUrlsResult =
  | { ok: true; items: { uploadUrl: string; fileKey: string }[] }
  | { ok: false; reason: UploadFailureReason };

export type SaveEntryResult =
  | { ok: true; entry: Entry; skipped: number }
  | { ok: false; reason: UploadFailureReason };

function mediaTypeFor(fileType: string): "image" | "video" {
  return ALLOWED_IMAGE_TYPES.includes(fileType) ? "image" : "video";
}

async function deleteObjects(fileKeys: string[]) {
  await Promise.all(fileKeys.map((fileKey) => deleteObject(fileKey)));
}

/**
 * Signs direct-to-R2 uploads for one entry only if the event's guestbook allows the
 * whole batch. `ContentLength` is part of each signature so R2 rejects a payload
 * of a different size than the one we approved.
 */
export async function getPresignedUrls(input: {
  eventId: string;
  files: { fileName: string; fileType: string; fileSize: number }[];
}): Promise<PresignedUrlsResult> {
  const { eventId, files } = input;

  if (files.length > MAX_FILES_PER_ENTRY) {
    return { ok: false, reason: "tooManyFiles" };
  }

  if (files.some((file) => !ALLOWED_TYPES.includes(file.fileType))) {
    return { ok: false, reason: "invalidFileType" };
  }

  const context = await getEventPlanContext(eventId);

  if (!context) {
    return { ok: false, reason: "eventNotFound" };
  }

  // The batch has to fit as a whole, so each file is checked against the stored
  // usage plus the files before it.
  let usedBytes = context.storage_used_bytes;

  for (const file of files) {
    const check = checkUploadAllowed({
      products: context.products,
      eventDate: context.date,
      isActive: context.is_active,
      usedBytes,
      fileBytes: file.fileSize,
      mediaType: mediaTypeFor(file.fileType),
    });

    if (!check.allowed) {
      return { ok: false, reason: check.reason };
    }

    usedBytes += file.fileSize;
  }

  const items = await Promise.all(
    files.map(async (file) => {
      const uuid = crypto.randomUUID();
      const sanitizedFileName = file.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `events/${eventId}/${uuid}-${sanitizedFileName}`;

      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        ContentType: file.fileType,
        ContentLength: file.fileSize,
      });

      const uploadUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 900,
      });

      return { uploadUrl, fileKey };
    }),
  );

  return { ok: true, items };
}

/**
 * Re-checks one uploaded object against the guestbook limits. The size and media type are
 * read back from R2 rather than taken from the request.
 */
function checkStoredObject(
  objectInfo: StoredObjectInfo | null,
  context: EventPlanContext,
  usedBytes: number,
):
  | { ok: true; sizeBytes: number; mediaType: "image" | "video" }
  | { ok: false; reason: UploadFailureReason } {
  if (!objectInfo) {
    return { ok: false, reason: "objectMissing" };
  }

  const contentType = objectInfo.contentType ?? "";

  if (!ALLOWED_TYPES.includes(contentType)) {
    return { ok: false, reason: "invalidFileType" };
  }

  const mediaType = mediaTypeFor(contentType);
  const check = checkUploadAllowed({
    products: context.products,
    eventDate: context.date,
    isActive: context.is_active,
    usedBytes,
    fileBytes: objectInfo.sizeBytes,
    mediaType,
  });

  if (!check.allowed) {
    return { ok: false, reason: check.reason };
  }

  return { ok: true, sizeBytes: objectInfo.sizeBytes, mediaType };
}

/**
 * Runs after the client has PUT the files (possibly none, for a text-only wish).
 * The quota is re-checked because another guest may have uploaded in the
 * meantime. Files that fail the check are deleted and skipped; the entry is
 * saved with the rest.
 */
export async function saveEntry(input: {
  eventId: string;
  guestName?: string;
  message?: string;
  isPrivate: boolean;
  fileKeys: string[];
}): Promise<SaveEntryResult> {
  const { eventId, isPrivate, fileKeys } = input;
  const guestName = input.guestName?.trim() || null;
  const message = input.message?.trim() || null;

  if (fileKeys.length > MAX_FILES_PER_ENTRY) {
    return { ok: false, reason: "tooManyFiles" };
  }

  if (!message && fileKeys.length === 0) {
    return { ok: false, reason: "emptyEntry" };
  }

  // Only objects presigned for this event may be attached to its entries.
  if (fileKeys.some((fileKey) => !fileKey.startsWith(`events/${eventId}/`))) {
    return { ok: false, reason: "saveFailed" };
  }

  const context = await getEventPlanContext(eventId);

  if (!context) {
    await deleteObjects(fileKeys);
    return { ok: false, reason: "eventNotFound" };
  }

  // checkUploadAllowed covers this for files; a text-only wish needs it too.
  if (!context.is_active) {
    await deleteObjects(fileKeys);
    return { ok: false, reason: "eventInactive" };
  }

  if (!isGuestUploadOpen({ products: context.products, eventDate: context.date })) {
    await deleteObjects(fileKeys);
    return { ok: false, reason: "windowClosed" };
  }

  const objects = await Promise.all(
    fileKeys.map((fileKey) => getObjectInfo(fileKey)),
  );

  const entryId = crypto.randomUUID();
  const uploads: UploadInsert[] = [];
  const rejectedKeys: string[] = [];
  let firstRejection: UploadFailureReason | null = null;
  let usedBytes = context.storage_used_bytes;

  fileKeys.forEach((fileKey, index) => {
    const result = checkStoredObject(objects[index], context, usedBytes);

    if (!result.ok) {
      rejectedKeys.push(fileKey);
      firstRejection ??= result.reason;
      return;
    }

    usedBytes += result.sizeBytes;
    const fileUrl = buildPublicUrl(fileKey);

    uploads.push({
      id: crypto.randomUUID(),
      event_id: eventId,
      entry_id: entryId,
      file_url: fileUrl,
      thumbnail_url: result.mediaType === "image" ? fileUrl : null,
      media_type: result.mediaType,
      file_size_bytes: result.sizeBytes,
      sort_order: uploads.length,
    });
  });

  await deleteObjects(rejectedKeys);

  if (uploads.length === 0 && !message) {
    return { ok: false, reason: firstRejection ?? "emptyEntry" };
  }

  const acceptedKeys = fileKeys.filter((key) => !rejectedKeys.includes(key));

  // The id is generated here because the insert can't return the row: a guest
  // (anon) is not allowed to read back an entry they marked private.
  const entryData: EntryInsert = {
    id: entryId,
    event_id: eventId,
    guest_name: guestName,
    message,
    is_private: isPrivate,
  };

  const validatedEntry = EntryInsertSchema.safeParse(entryData);

  if (!validatedEntry.success) {
    console.error(
      "[saveEntry] Zod validation failed:",
      z.prettifyError(validatedEntry.error),
    );
    console.error("[saveEntry] Raw data:", JSON.stringify(entryData, null, 2));
    await deleteObjects(acceptedKeys);
    return { ok: false, reason: "saveFailed" };
  }

  const validatedUploads = z.array(UploadInsertSchema).safeParse(uploads);

  if (!validatedUploads.success) {
    console.error(
      "[saveEntry] Zod validation failed:",
      z.prettifyError(validatedUploads.error),
    );
    console.error("[saveEntry] Raw data:", JSON.stringify(uploads, null, 2));
    await deleteObjects(acceptedKeys);
    return { ok: false, reason: "saveFailed" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_entry", {
    p_entry: validatedEntry.data,
    p_uploads: validatedUploads.data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (error) {
    console.error("[saveEntry] Supabase insert failed:", error);
    await deleteObjects(acceptedKeys);
    return { ok: false, reason: "saveFailed" };
  }

  return {
    ok: true,
    skipped: rejectedKeys.length,
    entry: {
      id: entryId,
      guest_name: guestName,
      message,
      is_private: isPrivate,
      created_at: new Date().toISOString(),
      uploads: validatedUploads.data.map((upload) => ({
        id: upload.id,
        file_url: upload.file_url,
        thumbnail_url: upload.thumbnail_url,
        media_type: upload.media_type,
      })),
    },
  };
}

export async function deleteEntry(
  entryId: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select("event_id, uploads(file_url)")
    .eq("id", entryId)
    .single();

  if (entryError || !entry) {
    throw new Error("Entry not found");
  }

  const parsedEntry = EntryForDeleteSchema.safeParse(entry);

  if (!parsedEntry.success) {
    console.error(
      "[deleteEntry] Zod validation failed:",
      z.prettifyError(parsedEntry.error),
    );
    console.error("[deleteEntry] Raw data:", JSON.stringify(entry, null, 2));
    throw new Error("Invalid entry data");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("owner_id")
    .eq("id", parsedEntry.data.event_id)
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

  // Delete the row first: the cascade removes its uploads and the trigger
  // releases the quota, and a leftover R2 object is cheaper to reconcile than a
  // row pointing at a deleted file.
  const { error: deleteError } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId);

  if (deleteError) {
    throw new Error(`Failed to delete entry: ${deleteError.message}`);
  }

  const fileKeys = parsedEntry.data.uploads.flatMap((upload) => {
    const fileKey = fileKeyFromPublicUrl(upload.file_url);

    if (!fileKey) {
      console.error(
        "[deleteEntry] Could not derive R2 key from url:",
        upload.file_url,
      );
      return [];
    }

    return [fileKey];
  });

  await deleteObjects(fileKeys);

  return { success: true };
}
