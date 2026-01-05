"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/storage/r2";
import { createClient } from "@/lib/supabase/server";
import {
  UploadInsertSchema,
  UploadFullSchema,
  UploadEventIdSchema,
  EventOwnerSchema,
  type UploadInsert,
} from "@/lib/schemas/database";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadData {
  eventId: string;
  fileKey: string;
  mediaType: "image" | "video";
  guestName?: string;
  caption?: string;
}

export async function getPresignedUrl(
  fileName: string,
  fileType: string,
  eventId: string
): Promise<PresignedUrlResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`);
  }

  // Generate unique file key
  const uuid = crypto.randomUUID();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileKey = `events/${eventId}/${uuid}-${sanitizedFileName}`;

  // Create PutObjectCommand
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
  });

  // Generate presigned URL (15 minutes expiry)
  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 900, // 15 minutes
  });

  return {
    uploadUrl,
    fileKey,
  };
}

export async function saveUploadToDb(
  uploadData: UploadData
): Promise<{ id: string; file_url: string; thumbnail_url: string | null }> {
  const supabase = await createClient();

  // Construct public URL
  const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
  if (!r2Domain) {
    throw new Error("NEXT_PUBLIC_R2_DOMAIN environment variable is not set");
  }

  const fileUrl = `${r2Domain}/${uploadData.fileKey}`;

  // For now, thumbnail_url is null (can be generated later)
  // For images, we could use the same URL, for videos we'd need to generate thumbnails
  const thumbnailUrl = uploadData.mediaType === "image" ? fileUrl : null;

  // Prepare insert data and validate with Zod
  const insertData: UploadInsert = {
    event_id: uploadData.eventId,
    file_url: fileUrl,
    thumbnail_url: thumbnailUrl,
    media_type: uploadData.mediaType,
    guest_name: uploadData.guestName || null,
    caption: uploadData.caption || null,
  };

  // Validate with Zod before inserting
  const validatedData = UploadInsertSchema.parse(insertData);

  // Insert into database (type assertion needed for Supabase client type inference)
  const { data, error } = await supabase
    .from("uploads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(validatedData as any)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save upload to database: ${error?.message || "Unknown error"}`);
  }

  // Parse and validate response with Zod
  const parsedUpload = UploadFullSchema.parse(data);

  return {
    id: parsedUpload.id,
    file_url: parsedUpload.file_url,
    thumbnail_url: parsedUpload.thumbnail_url,
  };
}

export async function deleteUpload(uploadId: string): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // Get current user to verify ownership
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the upload with its event
  const { data: upload, error: uploadError } = await supabase
    .from("uploads")
    .select("event_id")
    .eq("id", uploadId)
    .single();

  if (uploadError || !upload) {
    throw new Error("Upload not found");
  }

  // Parse and validate with Zod
  const parsedUpload = UploadEventIdSchema.safeParse(upload);
  if (!parsedUpload.success) {
    throw new Error("Invalid upload data");
  }

  // Verify the event belongs to the user
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("owner_id")
    .eq("id", parsedUpload.data.event_id)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found");
  }

  // Parse and validate event with Zod
  const parsedEvent = EventOwnerSchema.safeParse(event);
  if (!parsedEvent.success) {
    throw new Error("Invalid event data");
  }

  if (parsedEvent.data.owner_id !== user.id) {
    throw new Error("Unauthorized: You don't own this event");
  }

  // Delete the upload
  const { error: deleteError } = await supabase.from("uploads").delete().eq("id", uploadId);

  if (deleteError) {
    throw new Error(`Failed to delete upload: ${deleteError.message}`);
  }

  return { success: true };
}
