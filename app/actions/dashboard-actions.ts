"use server";

import { createClient } from "@/lib/supabase/server";

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
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("owner_id", userId)
    .eq("is_active", true);

  const eventIds = events?.map((e) => e.id) || [];

  if (eventIds.length === 0) {
    return {
      totalPhotos: 0,
      totalStorage: "0 MB",
      activeEvents: 0,
      recentUploads: 0,
    };
  }

  // Get all uploads for user's events
  const { data: uploads } = await supabase
    .from("uploads")
    .select("file_url, created_at")
    .in("event_id", eventIds);

  // Get uploads from last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const recentUploads = uploads?.filter(
    (upload) => new Date(upload.created_at) > oneDayAgo
  ).length || 0;

  // Calculate total storage (rough estimate based on file count)
  // In a real app, you'd track actual file sizes
  const totalPhotos = uploads?.length || 0;
  const estimatedMB = Math.round((totalPhotos * 3) / 10) / 100; // Rough estimate: ~3MB per photo average
  const totalStorage = estimatedMB < 1 
    ? `${Math.round(estimatedMB * 1000)} KB` 
    : `${estimatedMB.toFixed(2)} MB`;

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
  const { data: events } = await supabase
    .from("events")
    .select("id, names")
    .eq("owner_id", userId)
    .eq("is_active", true);

  const eventIds = events?.map((e) => e.id) || [];
  const eventMap = new Map(events?.map((e) => [e.id, e.names]) || []);

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

  return uploads.map((upload) => ({
    id: upload.id,
    file_url: upload.file_url,
    thumbnail_url: upload.thumbnail_url,
    media_type: upload.media_type as "image" | "video",
    guest_name: upload.guest_name,
    caption: upload.caption,
    created_at: upload.created_at,
    event_id: upload.event_id,
    event_names: eventMap.get(upload.event_id) || null,
  }));
}

