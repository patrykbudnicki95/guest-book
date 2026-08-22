"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EventIdWithNamesSchema, EventForPdfSchema, EventPlanSummarySchema, UploadFileUrlSchema, UploadFullSchema } from "@/lib/schemas/database";
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

export interface DashboardUpload {
  id: string;
  file_url: string;
  thumbnail_url: string | null;
  media_type: "image" | "video";
  guest_name: string | null;
  caption: string | null;
  created_at: string;
  event_id: string;
  event_names: string | null;
}

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

export async function getUserUploads(userId: string): Promise<DashboardUpload[]> {
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

  // Get all uploads for user's events
  const { data: uploads, error } = await supabase
    .from("uploads")
    .select("id, file_url, thumbnail_url, media_type, file_size_bytes, guest_name, caption, created_at, event_id")
    .in("event_id", eventIds)
    .order("created_at", { ascending: false });

  if (error || !uploads) {
    return [];
  }

  // Parse and validate with Zod
  const parsedUploads = z.array(UploadFullSchema).safeParse(uploads);
  if (!parsedUploads.success) {
    return [];
  }

  return parsedUploads.data.map((upload) => ({
    id: upload.id,
    file_url: upload.file_url,
    thumbnail_url: upload.thumbnail_url,
    media_type: upload.media_type,
    guest_name: upload.guest_name,
    caption: upload.caption,
    created_at: upload.created_at,
    event_id: upload.event_id,
    event_names: eventMap.get(upload.event_id) || null,
  }));
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
