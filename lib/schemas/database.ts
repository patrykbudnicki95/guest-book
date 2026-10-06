import { z } from "zod";
import { PLAN_IDS } from "@/lib/pricing";

export const PlanIdSchema = z.enum(PLAN_IDS);

// Event schemas
export const EventIdSchema = z.object({
  id: z.string().uuid(),
});

/** Plan + usage for the dashboard plan card. */
export const EventPlanSummarySchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
  plan_id: PlanIdSchema,
  storage_used_bytes: z.coerce.number().int().nonnegative(),
});

/** Everything the permission layer needs to decide what an event may do. */
export const EventPlanContextSchema = z.object({
  id: z.string().uuid(),
  plan_id: PlanIdSchema,
  date: z.string(),
  is_active: z.boolean(),
  storage_used_bytes: z.coerce.number().int().nonnegative(),
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
  plan_id: PlanIdSchema,
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
  plan_id: PlanIdSchema,
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
  plan_id: PlanIdSchema,
  storage_used_bytes: z.coerce.number().int().nonnegative(),
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

// One file of an entry, as nested under `entries.select("..., uploads(...)")`
export const EntryMediaSchema = z.object({
  id: z.string().uuid(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  media_type: z.enum(["image", "video"]),
});

// Entry with its files (guest view)
export const EntryWithMediaSchema = z.object({
  id: z.string().uuid(),
  guest_name: z.string().nullable(),
  message: z.string().nullable(),
  is_private: z.boolean(),
  created_at: z.string(),
  uploads: z.array(EntryMediaSchema),
});

// Entry with its files and event (dashboard gallery)
export const EntryWithMediaAndEventSchema = EntryWithMediaSchema.extend({
  event_id: z.string().uuid(),
});

// Entry lookup before deleting it and its R2 objects
export const EntryForDeleteSchema = z.object({
  event_id: z.string().uuid(),
  uploads: z.array(UploadFileUrlSchema.pick({ file_url: true })),
});

// Insert schemas
export const EntryInsertSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  guest_name: z.string().nullable(),
  message: z.string().nullable(),
  is_private: z.boolean(),
});

export const UploadInsertSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  entry_id: z.string().uuid(),
  file_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  media_type: z.enum(["image", "video"]),
  file_size_bytes: z.number().int().positive(),
  sort_order: z.number().int().nonnegative(),
});

// Type exports
export type EventId = z.infer<typeof EventIdSchema>;
export type EventPlanContext = z.infer<typeof EventPlanContextSchema>;
export type EventPlanSummaryRow = z.infer<typeof EventPlanSummarySchema>;
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
export type EntryMedia = z.infer<typeof EntryMediaSchema>;
export type Entry = z.infer<typeof EntryWithMediaSchema>;
export type EntryInsert = z.infer<typeof EntryInsertSchema>;
export type UploadInsert = z.infer<typeof UploadInsertSchema>;

