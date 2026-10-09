import { z } from "zod";
import { ADDON_IDS, PLAN_IDS } from "@/lib/pricing";
import { MAX_SEATS_PER_TABLE } from "@/lib/permissions";

export const PlanIdSchema = z.enum(PLAN_IDS);
export const AddonIdsSchema = z.array(z.enum(ADDON_IDS));

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
  addons: AddonIdsSchema,
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
  addons: AddonIdsSchema,
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

// Seating ("find your table") schemas
export const SEATING_SHAPES = ["round", "rectangle", "head"] as const;

export const SeatingTableSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(60),
  shape: z.enum(SEATING_SHAPES),
  /** One name per seat, in seat order; an empty string is a free seat. */
  seats: z.array(z.string().max(80)).min(1).max(MAX_SEATS_PER_TABLE),
});

/** `event_seating.select("tables")` (guest page) */
export const GuestSeatingSchema = z.object({
  tables: z.array(SeatingTableSchema),
});

/** `event_seating.select("event_id, tables, is_published")` (dashboard) */
export const EventSeatingSchema = z.object({
  event_id: z.string().uuid(),
  tables: z.array(SeatingTableSchema),
  is_published: z.boolean(),
});

/** `events.select("id, names, plan_id")` for the seating editor */
export const EventForSeatingSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  plan_id: PlanIdSchema,
});

/** The table count limit depends on the plan, so the action checks it. */
export const SeatingUpdateSchema = EventSeatingSchema.omit({ event_id: true });

// Save the date schemas
export const SAVE_THE_DATE_TEMPLATES = [
  "envelope",
  "editorial",
  "polaroid",
  "botanical",
] as const;

export const SAVE_THE_DATE_FONTS = [
  "classic",
  "romantic",
  "modern",
  "timeless",
] as const;

const HexColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);

export const SaveTheDateContentSchema = z.object({
  names: z.string().max(80),
  eyebrow: z.string().max(60),
  message: z.string().max(600),
  location: z.string().max(120),
  photo_url: z.string().url().nullable(),
  music_url: z.string().url().nullable(),
  font: z.enum(SAVE_THE_DATE_FONTS),
  colors: z.object({
    background: HexColorSchema,
    text: HexColorSchema,
    accent: HexColorSchema,
  }),
  show_countdown: z.boolean(),
  show_calendar: z.boolean(),
});

/** `event_save_the_date.select("event_id, template, content, is_published")` (dashboard) */
export const EventSaveTheDateSchema = z.object({
  event_id: z.string().uuid(),
  template: z.enum(SAVE_THE_DATE_TEMPLATES),
  content: SaveTheDateContentSchema,
  is_published: z.boolean(),
});

/** `event_save_the_date.select("template, content")` (guest page) */
export const GuestSaveTheDateSchema = EventSaveTheDateSchema.pick({
  template: true,
  content: true,
});

export const SaveTheDateUpdateSchema = EventSaveTheDateSchema.omit({
  event_id: true,
});

/** `events.select("id, names, date, location, plan_id, addons")` */
export const EventForSaveTheDateSchema = z.object({
  id: z.string().uuid(),
  names: z.string(),
  date: z.string(),
  location: z.string().nullable(),
  plan_id: PlanIdSchema,
  addons: AddonIdsSchema,
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

// Entry with file sizes, for the "download all" ZIP
export const EntryForExportSchema = z.object({
  id: z.string().uuid(),
  guest_name: z.string().nullable(),
  message: z.string().nullable(),
  created_at: z.string(),
  uploads: z.array(
    z.object({
      file_url: z.string().url(),
      media_type: z.enum(["image", "video"]),
      file_size_bytes: z.coerce.number().int().nonnegative(),
    }),
  ),
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
export type SeatingShape = (typeof SEATING_SHAPES)[number];
export type SeatingTable = z.infer<typeof SeatingTableSchema>;
export type EventForSeating = z.infer<typeof EventForSeatingSchema>;
export type EventSeating = z.infer<typeof EventSeatingSchema>;
export type SeatingUpdate = z.infer<typeof SeatingUpdateSchema>;
export type SaveTheDateTemplate = (typeof SAVE_THE_DATE_TEMPLATES)[number];
export type SaveTheDateFont = (typeof SAVE_THE_DATE_FONTS)[number];
export type SaveTheDateContent = z.infer<typeof SaveTheDateContentSchema>;
export type SaveTheDateUpdate = z.infer<typeof SaveTheDateUpdateSchema>;
export type GuestSaveTheDate = z.infer<typeof GuestSaveTheDateSchema>;
export type EventForSaveTheDate = z.infer<typeof EventForSaveTheDateSchema>;
export type UploadFileUrl = z.infer<typeof UploadFileUrlSchema>;
export type EntryMedia = z.infer<typeof EntryMediaSchema>;
export type Entry = z.infer<typeof EntryWithMediaSchema>;
export type EntryForExport = z.infer<typeof EntryForExportSchema>;
export type EntryInsert = z.infer<typeof EntryInsertSchema>;
export type UploadInsert = z.infer<typeof UploadInsertSchema>;

