import { z } from "zod";

// Event schemas
export const EventIdSchema = z.object({
  id: z.string().uuid(),
});

export const EventIdWithNamesSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
});

export const EventForPdfSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
  location: z.string().nullable(),
});

export const EventOwnerSchema = z.object({
  owner_id: z.string().uuid(),
});

export const EventBasicSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
});

export const EventSettingsSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
  location: z.string().nullable(),
  theme_color: z.string().nullable(),
});

export const EventSettingsUpdateSchema = z.object({
  names: z.string().min(1, "Nazwa jest wymagana"),
  date: z.string().min(1, "Data jest wymagana"),
  location: z.string().optional(),
  theme_color: z.string().optional(),
});

// Schedule & Menu schemas
export const ScheduleItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().nullish(),
});

export const MenuItemSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
});

export const MenuSectionSchema = z.object({
  title: z.string(),
  items: z.array(MenuItemSchema),
});

// Full event schema (for guest page)
export const EventFullSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
  location: z.string().nullable(),
  theme_color: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
  welcome_message: z.string().nullable(),
  schedule: z.array(ScheduleItemSchema).nullable(),
  menu: z.array(MenuSectionSchema).nullable(),
});

// Event page content update schema
export const EventPageContentUpdateSchema = z.object({
  cover_photo_url: z.string().nullable().optional(),
  welcome_message: z.string().nullable().optional(),
  schedule: z.array(ScheduleItemSchema).nullable().optional(),
  menu: z.array(MenuSectionSchema).nullable().optional(),
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

// Schema for upload query without event_id (used in guest view)
export const UploadGuestSchema = z.object({
  id: z.string().uuid(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  media_type: z.enum(["image", "video"]),
  guest_name: z.string().nullable(),
  caption: z.string().nullable(),
  created_at: z.string(),
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
export type EventForPdf = z.infer<typeof EventForPdfSchema>;
export type EventOwner = z.infer<typeof EventOwnerSchema>;
export type EventSettings = z.infer<typeof EventSettingsSchema>;
export type EventSettingsUpdate = z.infer<typeof EventSettingsUpdateSchema>;
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuSection = z.infer<typeof MenuSectionSchema>;
export type EventFull = z.infer<typeof EventFullSchema>;
export type EventPageContentUpdate = z.infer<typeof EventPageContentUpdateSchema>;
export type UploadFileUrl = z.infer<typeof UploadFileUrlSchema>;
export type UploadFull = z.infer<typeof UploadFullSchema>;
export type UploadGuest = z.infer<typeof UploadGuestSchema>;
export type UploadEventId = z.infer<typeof UploadEventIdSchema>;
export type UploadInsert = z.infer<typeof UploadInsertSchema>;

