import { z } from "zod";

// Event schemas
export const EventIdSchema = z.object({
  id: z.string().uuid(),
});

export const EventIdWithNamesSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
});

export const EventOwnerSchema = z.object({
  owner_id: z.string().uuid(),
});

export const EventBasicSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
});

// Upload schemas
export const UploadFileUrlSchema = z.object({
  file_url: z.string().url(),
  created_at: z.string(),
});

export const UploadFullSchema = z.object({
  id: z.string().uuid(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  media_type: z.enum(["image", "video"]),
  guest_name: z.string().nullable(),
  caption: z.string().nullable(),
  created_at: z.string(),
  event_id: z.string().uuid(),
});

export const UploadEventIdSchema = z.object({
  event_id: z.string().uuid(),
});

// Insert schemas
export const UploadInsertSchema = z.object({
  event_id: z.string().uuid(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  media_type: z.enum(["image", "video"]),
  guest_name: z.string().nullable(),
  caption: z.string().nullable(),
});

// Type exports
export type EventId = z.infer<typeof EventIdSchema>;
export type EventIdWithNames = z.infer<typeof EventIdWithNamesSchema>;
export type EventOwner = z.infer<typeof EventOwnerSchema>;
export type UploadFileUrl = z.infer<typeof UploadFileUrlSchema>;
export type UploadFull = z.infer<typeof UploadFullSchema>;
export type UploadEventId = z.infer<typeof UploadEventIdSchema>;
export type UploadInsert = z.infer<typeof UploadInsertSchema>;

