"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fileKeyFromPublicUrl, getDownloadUrl } from "@/lib/storage/r2";
import { EventIdWithNamesSchema, EventForPdfSchema, EventPlanSummarySchema, UploadFileUrlSchema, EntryWithMediaAndEventSchema, EntryForExportSchema, type Entry, type EntryForExport } from "@/lib/schemas/database";
import {
  formatBytes,
  getDownloadWindowEnd,
  getStorageState,
  getUploadWindowEnd,
  isDownloadOpen,
  isGuestUploadOpen,
  type StorageState,
} from "@/lib/permissions";
import type { PlanId } from "@/lib/pricing";

export interface DashboardStats {
  totalPhotos: number;
  totalStorage: string;
  totalStorageBytes: number;
  activeEvents: number;
  recentUploads: number;
}

export interface EventPlanSummary {
  id: string;
  names: string;
  date: string;
  plan: PlanId;
  storage: StorageState;
  uploadWindowEnd: string;
  downloadWindowEnd: string;
  isUploadOpen: boolean;
  isDownloadOpen: boolean;
}

export type DashboardEntry = Entry & {
  event_id: string;
  event_names: string | null;
};

export type EventExportResult =
  | { success: true; eventNames: string; entries: EntryForExport[] }
  | { success: false; error: "notFound" | "downloadClosed" | "loadFailed" };

export interface UserEvent {
  id: string;
  names: string;
}

export interface UserEventForPdf {
  id: string;
  names: string;
  date: string;
  location: string | null;
  plan_id: PlanId;
}

const EMPTY_STATS: DashboardStats = {
  totalPhotos: 0,
  totalStorage: formatBytes(0),
  totalStorageBytes: 0,
  activeEvents: 0,
  recentUploads: 0,
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get user's events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, names, date, plan_id, storage_used_bytes")
    .eq("owner_id", userId)
    .eq("is_active", true);

  if (eventsError || !events) {
    console.error("[getDashboardStats] Error fetching events:", eventsError);
    return EMPTY_STATS;
  }

  // Parse and validate with Zod
  const parsedEvents = z.array(EventPlanSummarySchema).safeParse(events);
  if (!parsedEvents.success) {
    console.error("[getDashboardStats] Zod validation failed:", z.prettifyError(parsedEvents.error));
    console.error("[getDashboardStats] Raw data:", JSON.stringify(events, null, 2));
    return EMPTY_STATS;
  }

  const eventIds = parsedEvents.data.map((e) => e.id);

  if (eventIds.length === 0) {
    return EMPTY_STATS;
  }

  // The counter is maintained by a trigger on uploads, so this is the real
  // number rather than an estimate from the file count.
  const totalStorageBytes = parsedEvents.data.reduce(
    (sum, event) => sum + event.storage_used_bytes,
    0,
  );

  // Get all uploads for user's events
  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("file_url, created_at")
    .in("event_id", eventIds);

  if (uploadsError || !uploads) {
    return {
      ...EMPTY_STATS,
      totalStorage: formatBytes(totalStorageBytes),
      totalStorageBytes,
      activeEvents: eventIds.length,
    };
  }

  // Parse and validate with Zod
  const parsedUploads = z.array(UploadFileUrlSchema).safeParse(uploads);
  const validUploads = parsedUploads.success ? parsedUploads.data : [];

  // Get uploads from last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const recentUploads = validUploads.filter((upload) => new Date(upload.created_at) > oneDayAgo).length;

  return {
    totalPhotos: validUploads.length,
    totalStorage: formatBytes(totalStorageBytes),
    totalStorageBytes,
    activeEvents: eventIds.length,
    recentUploads,
  };
}

/** Plan, quota usage and access windows for every event the user owns. */
export async function getEventPlanSummaries(userId: string): Promise<EventPlanSummary[]> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, names, date, plan_id, storage_used_bytes")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !events) {
    console.error("[getEventPlanSummaries] Error fetching events:", error);
    return [];
  }

  const parsed = z.array(EventPlanSummarySchema).safeParse(events);
  if (!parsed.success) {
    console.error("[getEventPlanSummaries] Zod validation failed:", z.prettifyError(parsed.error));
    console.error("[getEventPlanSummaries] Raw data:", JSON.stringify(events, null, 2));
    return [];
  }

  return parsed.data.map((event) => {
    const plan = event.plan_id;
    const eventDate = event.date;

    return {
      id: event.id,
      names: event.names,
      date: eventDate,
      plan,
      storage: getStorageState({ plan, usedBytes: event.storage_used_bytes }),
      uploadWindowEnd: getUploadWindowEnd({ plan, eventDate }).toISOString(),
      downloadWindowEnd: getDownloadWindowEnd({ plan, eventDate }).toISOString(),
      isUploadOpen: isGuestUploadOpen({ plan, eventDate }),
      isDownloadOpen: isDownloadOpen({ plan, eventDate }),
    };
  });
}

export async function getUserEntries(userId: string): Promise<DashboardEntry[]> {
  const supabase = await createClient();

  // Get user's events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, names")
    .eq("owner_id", userId)
    .eq("is_active", true);

  if (eventsError || !events) {
    return [];
  }

  // Parse and validate with Zod
  const parsedEvents = z.array(EventIdWithNamesSchema).safeParse(events);
  if (!parsedEvents.success) {
    return [];
  }

  const eventIds = parsedEvents.data.map((e) => e.id);
  const eventMap = new Map(parsedEvents.data.map((e) => [e.id, e.names]));

  if (eventIds.length === 0) {
    return [];
  }

  // Get all entries (with their files) for user's events
  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, guest_name, message, is_private, created_at, event_id, uploads(id, file_url, thumbnail_url, media_type)")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "uploads" });

  if (error || !entries) {
    return [];
  }

  // Parse and validate with Zod
  const parsedEntries = z.array(EntryWithMediaAndEventSchema).safeParse(entries);
  if (!parsedEntries.success) {
    console.error(
      "[getUserEntries] Zod validation failed:",
      z.prettifyError(parsedEntries.error),
    );
    console.error("[getUserEntries] Raw data:", JSON.stringify(entries, null, 2));
    return [];
  }

  return parsedEntries.data.map((entry) => ({
    ...entry,
    event_names: eventMap.get(entry.event_id) || null,
  }));
}

/** PostgREST caps a response at 1000 rows by default, so entries are paged. */
const EXPORT_PAGE_SIZE = 1000;
/** Long enough for a slow connection to get through a whole wedding. */
const EXPORT_URL_TTL_SECONDS = 24 * 60 * 60;

/**
 * Every entry of one event, oldest first, with file sizes so the browser can
 * build the "download all" ZIP straight from R2. Only the owner may call it,
 * and only while the plan's download window is open.
 */
export async function getEventExport(eventId: string): Promise<EventExportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "notFound" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, names, date, plan_id, storage_used_bytes")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !event) {
    console.error("[getEventExport] Error fetching event:", eventError);
    return { success: false, error: "notFound" };
  }

  const parsedEvent = EventPlanSummarySchema.safeParse(event);
  if (!parsedEvent.success) {
    console.error("[getEventExport] Zod validation failed:", z.prettifyError(parsedEvent.error));
    console.error("[getEventExport] Raw data:", JSON.stringify(event, null, 2));
    return { success: false, error: "loadFailed" };
  }

  if (!isDownloadOpen({ plan: parsedEvent.data.plan_id, eventDate: parsedEvent.data.date })) {
    return { success: false, error: "downloadClosed" };
  }

  const entries: EntryForExport[] = [];

  for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("entries")
      .select("id, guest_name, message, created_at, uploads(file_url, media_type, file_size_bytes)")
      .eq("event_id", eventId)
      .order("created_at")
      .order("id")
      .order("sort_order", { referencedTable: "uploads" })
      .range(from, from + EXPORT_PAGE_SIZE - 1);

    if (error || !data) {
      console.error("[getEventExport] Error fetching entries:", error);
      return { success: false, error: "loadFailed" };
    }

    const parsed = z.array(EntryForExportSchema).safeParse(data);
    if (!parsed.success) {
      console.error("[getEventExport] Zod validation failed:", z.prettifyError(parsed.error));
      console.error("[getEventExport] Raw data:", JSON.stringify(data, null, 2));
      return { success: false, error: "loadFailed" };
    }

    entries.push(...parsed.data);

    if (data.length < EXPORT_PAGE_SIZE) {
      break;
    }
  }

  const signedEntries = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      uploads: await Promise.all(
        entry.uploads.map(async (upload) => {
          const fileKey = fileKeyFromPublicUrl(upload.file_url);
          return fileKey
            ? { ...upload, file_url: await getDownloadUrl(fileKey, EXPORT_URL_TTL_SECONDS) }
            : upload;
        }),
      ),
    })),
  );

  return { success: true, eventNames: parsedEvent.data.names, entries: signedEntries };
}

export async function getUserEvents(userId: string): Promise<UserEvent[]> {
  const supabase = await createClient();

  // Get user's events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, names")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (eventsError || !events) {
    console.error("[getUserEvents] Error fetching events:", eventsError);
    return [];
  }

  // Parse and validate with Zod
  const parsedEvents = z.array(EventIdWithNamesSchema).safeParse(events);
  if (!parsedEvents.success) {
    console.error("[getUserEvents] Zod validation failed:");
    console.error("Validation errors:", JSON.stringify(parsedEvents.error.format(), null, 2));
    console.error("Raw data:", JSON.stringify(events, null, 2));
    return [];
  }

  return parsedEvents.data.map((event) => ({
    id: event.id,
    names: event.names,
  }));
}

export async function getUserEventsForPdf(userId: string): Promise<UserEventForPdf[]> {
  const supabase = await createClient();

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, names, date, location, plan_id")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (eventsError || !events) {
    console.error("[getUserEventsForPdf] Error fetching events:", eventsError);
    return [];
  }

  const parsedEvents = z.array(EventForPdfSchema).safeParse(events);
  if (!parsedEvents.success) {
    console.error("[getUserEventsForPdf] Zod validation failed:", z.prettifyError(parsedEvents.error));
    console.error("[getUserEventsForPdf] Raw data:", JSON.stringify(events, null, 2));
    return [];
  }

  return parsedEvents.data;
}
