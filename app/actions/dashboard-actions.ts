"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { EventIdSchema, EventIdWithNamesSchema, UploadFileUrlSchema, UploadFullSchema } from "@/lib/schemas/database";

export interface DashboardStats {
  totalPhotos: number;
  totalStorage: string;
  activeEvents: number;
  recentUploads: number;
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

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get user's events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_active", true);

  if (eventsError || !events) {
    return {
      totalPhotos: 0,
      totalStorage: "0 MB",
      activeEvents: 0,
      recentUploads: 0,
    };
  }

  // Parse and validate with Zod
  const parsedEvents = z.array(EventIdSchema).safeParse(events);
  if (!parsedEvents.success) {
    return {
      totalPhotos: 0,
      totalStorage: "0 MB",
      activeEvents: 0,
      recentUploads: 0,
    };
  }

  const eventIds = parsedEvents.data.map((e) => e.id);

  if (eventIds.length === 0) {
    return {
      totalPhotos: 0,
      totalStorage: "0 MB",
      activeEvents: 0,
      recentUploads: 0,
    };
  }

  // Get all uploads for user's events
  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("file_url, created_at")
    .in("event_id", eventIds);

  if (uploadsError || !uploads) {
    return {
      totalPhotos: 0,
      totalStorage: "0 MB",
      activeEvents: eventIds.length,
      recentUploads: 0,
    };
  }

  // Parse and validate with Zod
  const parsedUploads = z.array(UploadFileUrlSchema).safeParse(uploads);
  const validUploads = parsedUploads.success ? parsedUploads.data : [];

  // Get uploads from last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const recentUploads = validUploads.filter((upload) => new Date(upload.created_at) > oneDayAgo).length;

  // Calculate total storage (rough estimate based on file count)
  // In a real app, you'd track actual file sizes
  const totalPhotos = validUploads.length;
  const estimatedMB = Math.round((totalPhotos * 3) / 10) / 100; // Rough estimate: ~3MB per photo average
  const totalStorage = estimatedMB < 1 ? `${Math.round(estimatedMB * 1000)} KB` : `${estimatedMB.toFixed(2)} MB`;

  return {
    totalPhotos,
    totalStorage,
    activeEvents: eventIds.length,
    recentUploads,
  };
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
    .select("id, file_url, thumbnail_url, media_type, guest_name, caption, created_at, event_id")
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
