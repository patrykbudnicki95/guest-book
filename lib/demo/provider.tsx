"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { EventFull, EventPageContentUpdate, EventSettingsUpdate } from "@/lib/schemas/database";
import type { DashboardUpload } from "@/app/actions/dashboard-actions";
import type { Upload } from "@/app/[locale]/e/[eventId]/upload-drawer";
import {
  DEMO_COVER_KEY,
  DEMO_COVER_FALLBACK,
  DEMO_MAX_FILE_BYTES,
  DEMO_MAX_UPLOADS,
} from "./constants";
import {
  applyPageContent,
  applySettings,
  deleteDemoFile,
  loadDemoRecord,
  putDemoFile,
  resetDemoRecord,
  saveDemoEvent,
  saveDemoUploads,
  type StoredUploadMeta,
} from "./store";
import { hasFeature } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import type { DemoUploadResult, DemoWorkspace } from "./types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime"];

type Hydrated = {
  event: EventFull;
  uploads: DashboardUpload[];
  metas: StoredUploadMeta[];
};

const DemoContext = createContext<DemoWorkspace | null>(null);

function mediaTypeFor(fileType: string): "image" | "video" {
  return IMAGE_TYPES.includes(fileType) ? "image" : "video";
}

function toDashboardUpload(
  event: EventFull,
  meta: StoredUploadMeta,
  objectUrl: string,
): DashboardUpload {
  return {
    id: meta.id,
    file_url: objectUrl,
    thumbnail_url: meta.media_type === "image" ? objectUrl : null,
    media_type: meta.media_type,
    guest_name: meta.guest_name,
    caption: meta.caption,
    created_at: meta.created_at,
    event_id: event.id,
    event_names: event.names,
  };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<EventFull | null>(null);
  const [uploads, setUploads] = useState<DashboardUpload[]>([]);
  const [metas, setMetas] = useState<StoredUploadMeta[]>([]);
  const objectUrls = useRef<string[]>([]);

  const revokeAll = useCallback(() => {
    for (const url of objectUrls.current) {
      URL.revokeObjectURL(url);
    }
    objectUrls.current = [];
  }, []);

  const rememberUrl = useCallback((url: string) => {
    objectUrls.current.push(url);
    return url;
  }, []);

  const applyRecord = useCallback(
    (record: Awaited<ReturnType<typeof loadDemoRecord>>): Hydrated => {
      revokeAll();

      const coverUrl = record.cover
        ? rememberUrl(URL.createObjectURL(record.cover))
        : DEMO_COVER_FALLBACK;

      const eventWithCover: EventFull = {
        ...record.event,
        cover_photo_url: coverUrl,
        storage_used_bytes: record.uploads.reduce(
          (sum, item) => sum + item.file_size_bytes,
          0,
        ),
      };

      const mapped = record.uploads.flatMap((meta) => {
        const blob = record.files[meta.id];
        if (!blob) {
          return [];
        }

        const url = rememberUrl(URL.createObjectURL(blob));
        return [toDashboardUpload(eventWithCover, meta, url)];
      });

      setEvent(eventWithCover);
      setUploads(mapped);
      setMetas(record.uploads);

      return { event: eventWithCover, uploads: mapped, metas: record.uploads };
    },
    [rememberUrl, revokeAll],
  );

  useEffect(() => {
    let cancelled = false;

    void loadDemoRecord()
      .then((record) => {
        if (cancelled) {
          return;
        }

        applyRecord(record);
      })
      .catch((error) => {
        console.error("[DemoProvider] Failed to load demo:", error);
      });

    return () => {
      cancelled = true;
      revokeAll();
    };
  }, [applyRecord, revokeAll]);

  const updateSettings = useCallback(
    async (data: EventSettingsUpdate) => {
      if (!event) {
        return { success: false, error: "Demo not ready" };
      }

      const next = await applySettings(event, data);
      const withCover: EventFull = {
        ...next,
        cover_photo_url: event.cover_photo_url,
      };
      setEvent(withCover);
      setUploads((prev) =>
        prev.map((upload) => ({ ...upload, event_names: withCover.names })),
      );
      return { success: true };
    },
    [event],
  );

  const updatePageContent = useCallback(
    async (data: EventPageContentUpdate) => {
      if (!event) {
        return { success: false, error: "Demo not ready" };
      }

      const next = await applyPageContent(event, data);
      setEvent({
        ...next,
        cover_photo_url:
          data.cover_photo_url === null ||
          data.cover_photo_url === DEMO_COVER_FALLBACK
            ? DEMO_COVER_FALLBACK
            : event.cover_photo_url,
      });
      return { success: true };
    },
    [event],
  );

  const uploadCover = useCallback(
    async (file: File) => {
      if (!event) {
        throw new Error("Demo not ready");
      }

      await putDemoFile(DEMO_COVER_KEY, file);
      const publicUrl = rememberUrl(URL.createObjectURL(file));
      const next: EventFull = { ...event, cover_photo_url: publicUrl };
      await saveDemoEvent(next);
      setEvent(next);
      return { publicUrl };
    },
    [event, rememberUrl],
  );

  const addUpload = useCallback(
    async (input: {
      file: File;
      guestName?: string;
      caption?: string;
    }): Promise<DemoUploadResult> => {
      if (!event) {
        return { ok: false, reason: "eventNotFound" };
      }

      if (metas.length >= DEMO_MAX_UPLOADS) {
        return { ok: false, reason: "quotaExceeded" };
      }

      if (input.file.size <= 0 || input.file.size > DEMO_MAX_FILE_BYTES) {
        return { ok: false, reason: "fileTooLarge" };
      }

      if (!IMAGE_TYPES.includes(input.file.type) && !VIDEO_TYPES.includes(input.file.type)) {
        return { ok: false, reason: "invalidFileType" };
      }

      if (
        VIDEO_TYPES.includes(input.file.type) &&
        !hasFeature({ plan: event.plan_id, feature: "videoUploads" })
      ) {
        return { ok: false, reason: "mediaTypeNotAllowed" };
      }

      const mediaType = mediaTypeFor(input.file.type);
      const meta: StoredUploadMeta = {
        id: crypto.randomUUID(),
        media_type: mediaType,
        guest_name: input.guestName || null,
        caption: input.caption || null,
        created_at: new Date().toISOString(),
        file_size_bytes: input.file.size,
      };

      await putDemoFile(meta.id, input.file);
      const nextMetas = [meta, ...metas];
      await saveDemoUploads(nextMetas);

      const objectUrl = rememberUrl(URL.createObjectURL(input.file));
      const dashboardRow = toDashboardUpload(event, meta, objectUrl);
      const usedBytes = nextMetas.reduce(
        (sum, item) => sum + item.file_size_bytes,
        0,
      );

      setMetas(nextMetas);
      setUploads((prev) => [dashboardRow, ...prev]);
      setEvent((prev) =>
        prev ? { ...prev, storage_used_bytes: usedBytes } : prev,
      );

      const upload: Upload = {
        id: meta.id,
        file_url: objectUrl,
        thumbnail_url: mediaType === "image" ? objectUrl : null,
        media_type: mediaType,
        guest_name: meta.guest_name,
        caption: meta.caption,
        created_at: meta.created_at,
      };

      return { ok: true, upload };
    },
    [event, metas, rememberUrl],
  );

  const deleteUpload = useCallback(
    async (uploadId: string) => {
      await deleteDemoFile(uploadId);
      const nextMetas = metas.filter((item) => item.id !== uploadId);
      await saveDemoUploads(nextMetas);
      const usedBytes = nextMetas.reduce(
        (sum, item) => sum + item.file_size_bytes,
        0,
      );

      setMetas(nextMetas);
      setUploads((prev) => prev.filter((item) => item.id !== uploadId));
      setEvent((prev) =>
        prev ? { ...prev, storage_used_bytes: usedBytes } : prev,
      );

      return { success: true };
    },
    [metas],
  );

  const reset = useCallback(async () => {
    await resetDemoRecord();
    const record = await loadDemoRecord();
    applyRecord(record);
  }, [applyRecord]);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <DemoContext.Provider
      value={{
        event,
        uploads,
        isReady: true,
        updateSettings,
        updatePageContent,
        uploadCover,
        addUpload,
        deleteUpload,
        reset,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoWorkspace(): DemoWorkspace {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemoWorkspace must be used within DemoProvider");
  }

  return context;
}

export { DEMO_EVENT_ID, DEMO_COVER_FALLBACK, DEMO_MAX_FILE_BYTES, DEMO_MAX_UPLOADS } from "./constants";
