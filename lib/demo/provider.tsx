"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
  SaveTheDateUpdate,
  SeatingUpdate,
} from "@/lib/schemas/database";
import type { SaveTheDateAssetKind } from "@/lib/save-the-date";
import { isProductId, type ProductId } from "@/lib/pricing";
import type {
  DashboardEntry,
  EventExportResult,
} from "@/app/actions/dashboard-actions";
import type {
  LocalEntryInput,
  LocalEntryResult,
} from "@/app/[locale]/e/[eventId]/upload-drawer";
import {
  DEMO_COVER_KEY,
  DEMO_COVER_FALLBACK,
  DEMO_MAX_FILE_BYTES,
  DEMO_MAX_UPLOADS,
  DEMO_SAVE_THE_DATE_KEYS,
} from "./constants";
import {
  applyPageContent,
  applySettings,
  deleteDemoFile,
  isStoredDemoAsset,
  loadDemoRecord,
  putDemoFile,
  resetDemoRecord,
  saveDemoEvent,
  saveDemoEntries,
  saveDemoSaveTheDate,
  saveDemoSeating,
  type StoredEntryMeta,
} from "./store";
import { MAX_FILES_PER_ENTRY, getLimits, hasFeature } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import type { DemoWorkspace } from "./types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime"];

type Hydrated = {
  event: EventFull;
  entries: DashboardEntry[];
  metas: StoredEntryMeta[];
};

const DemoContext = createContext<DemoWorkspace | null>(null);

/**
 * `?apps=saveTheDate` (or `gold`, or a comma list) on any demo link picks what
 * the demo event owns, so each app's landing page can open its own demo.
 */
function requestedProducts(): ProductId[] | null {
  const raw = new URLSearchParams(window.location.search).get("apps");
  const products = raw?.split(",").filter(isProductId) ?? [];
  return products.length > 0 ? [...new Set(products)] : null;
}

function mediaTypeFor(fileType: string): "image" | "video" {
  return IMAGE_TYPES.includes(fileType) ? "image" : "video";
}

function usedBytesOf(metas: StoredEntryMeta[]): number {
  return metas
    .flatMap((meta) => meta.files)
    .reduce((sum, file) => sum + file.file_size_bytes, 0);
}

function fileCountOf(metas: StoredEntryMeta[]): number {
  return metas.reduce((sum, meta) => sum + meta.files.length, 0);
}

/** `objectUrls` maps a file id to its blob URL; files without one are left out. */
function toDashboardEntry(
  event: EventFull,
  meta: StoredEntryMeta,
  objectUrls: Record<string, string>,
): DashboardEntry {
  return {
    id: meta.id,
    guest_name: meta.guest_name,
    message: meta.message,
    is_private: meta.is_private,
    created_at: meta.created_at,
    event_id: event.id,
    event_names: event.names,
    uploads: meta.files.flatMap((file) => {
      const url = objectUrls[file.id];
      if (!url) {
        return [];
      }

      return [
        {
          id: file.id,
          file_url: url,
          thumbnail_url: file.media_type === "image" ? url : null,
          media_type: file.media_type,
        },
      ];
    }),
  };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<EventFull | null>(null);
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [metas, setMetas] = useState<StoredEntryMeta[]>([]);
  const [seating, setSeating] = useState<SeatingUpdate | null>(null);
  const [saveTheDate, setSaveTheDate] = useState<SaveTheDateUpdate | null>(null);
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
        storage_used_bytes: usedBytesOf(record.entries),
      };

      const objectUrls = Object.fromEntries(
        Object.entries(record.files).map(([id, blob]) => [
          id,
          rememberUrl(URL.createObjectURL(blob)),
        ]),
      );
      const mapped = record.entries.map((meta) =>
        toDashboardEntry(eventWithCover, meta, objectUrls),
      );

      setEvent(eventWithCover);
      setEntries(mapped);
      setMetas(record.entries);
      setSeating(record.seating);

      const assetUrl = (kind: SaveTheDateAssetKind, url: string | null) => {
        if (!isStoredDemoAsset(url)) return url;
        const blob = record.saveTheDateFiles[kind];
        return blob ? rememberUrl(URL.createObjectURL(blob)) : null;
      };
      setSaveTheDate({
        ...record.saveTheDate,
        content: {
          ...record.saveTheDate.content,
          photo_url: assetUrl("photo", record.saveTheDate.content.photo_url),
          music_url: assetUrl("music", record.saveTheDate.content.music_url),
        },
      });

      return { event: eventWithCover, entries: mapped, metas: record.entries };
    },
    [rememberUrl, revokeAll],
  );

  useEffect(() => {
    let cancelled = false;

    void loadDemoRecord()
      .then(async (record) => {
        const requested = requestedProducts();
        if (requested) {
          record = { ...record, event: { ...record.event, products: requested } };
          await saveDemoEvent(record.event);
        }

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

  const setProducts = useCallback(
    async (products: ProductId[]) => {
      if (!event) {
        return;
      }

      const next: EventFull = { ...event, products: [...new Set(products)] };
      await saveDemoEvent(next);
      setEvent(next);
    },
    [event],
  );

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
      setEntries((prev) =>
        prev.map((entry) => ({ ...entry, event_names: withCover.names })),
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

  /** Same checks as `updateSeating`, minus auth. */
  const updateSeating = useCallback(
    async (data: SeatingUpdate) => {
      if (!event) {
        return { success: false, error: "Demo not ready" };
      }

      if (!hasFeature({ products: event.products, feature: "findYourTable" })) {
        return { success: false, error: "planUpgradeRequired" };
      }

      if (data.tables.length > getLimits(event.products).seatingTables) {
        return { success: false, error: "tooManyTables" };
      }

      const next: SeatingUpdate = {
        is_published: data.is_published,
        tables: data.tables.map((table) => ({
          ...table,
          name: table.name.trim(),
          seats: table.seats.map((seat) => seat.trim()),
        })),
      };
      await saveDemoSeating(next);
      setSeating(next);
      return { success: true };
    },
    [event],
  );

  /** Same checks as `updateSaveTheDate`, minus auth. */
  const updateSaveTheDate = useCallback(
    async (data: SaveTheDateUpdate) => {
      if (!event) {
        return { success: false, error: "Demo not ready" };
      }

      if (!hasFeature({ products: event.products, feature: "saveTheDate" })) {
        return { success: false, error: "planUpgradeRequired" };
      }

      await saveDemoSaveTheDate(data);
      setSaveTheDate(data);
      return { success: true };
    },
    [event],
  );

  const uploadSaveTheDateAsset = useCallback(
    async (kind: SaveTheDateAssetKind, file: File) => {
      await putDemoFile(DEMO_SAVE_THE_DATE_KEYS[kind], file);
      return { url: rememberUrl(URL.createObjectURL(file)) };
    },
    [rememberUrl],
  );

  const addEntry = useCallback(
    async (input: LocalEntryInput): Promise<LocalEntryResult> => {
      if (!event) {
        return { ok: false, reason: "eventNotFound" };
      }

      const message = input.message?.trim() || null;

      if (input.files.length > MAX_FILES_PER_ENTRY) {
        return { ok: false, reason: "tooManyFiles" };
      }

      if (!message && input.files.length === 0) {
        return { ok: false, reason: "emptyEntry" };
      }

      if (fileCountOf(metas) + input.files.length > DEMO_MAX_UPLOADS) {
        return { ok: false, reason: "quotaExceeded" };
      }

      for (const file of input.files) {
        if (file.size <= 0 || file.size > DEMO_MAX_FILE_BYTES) {
          return { ok: false, reason: "fileTooLarge" };
        }

        if (!IMAGE_TYPES.includes(file.type) && !VIDEO_TYPES.includes(file.type)) {
          return { ok: false, reason: "invalidFileType" };
        }

        if (
          VIDEO_TYPES.includes(file.type) &&
          !hasFeature({ products: event.products, feature: "videoUploads" })
        ) {
          return { ok: false, reason: "mediaTypeNotAllowed" };
        }
      }

      const files = input.files.map((file) => ({
        file,
        meta: {
          id: crypto.randomUUID(),
          media_type: mediaTypeFor(file.type),
          file_size_bytes: file.size,
        },
      }));

      const meta: StoredEntryMeta = {
        id: crypto.randomUUID(),
        guest_name: input.guestName?.trim() || null,
        message,
        is_private: input.isPrivate,
        created_at: new Date().toISOString(),
        files: files.map((item) => item.meta),
      };

      for (const item of files) {
        await putDemoFile(item.meta.id, item.file);
      }
      const nextMetas = [meta, ...metas];
      await saveDemoEntries(nextMetas);

      const objectUrls = Object.fromEntries(
        files.map((item) => [
          item.meta.id,
          rememberUrl(URL.createObjectURL(item.file)),
        ]),
      );
      const entry = toDashboardEntry(event, meta, objectUrls);

      setMetas(nextMetas);
      setEntries((prev) => [entry, ...prev]);
      setEvent((prev) =>
        prev ? { ...prev, storage_used_bytes: usedBytesOf(nextMetas) } : prev,
      );

      return { ok: true, entry, skipped: 0 };
    },
    [event, metas, rememberUrl],
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      const meta = metas.find((item) => item.id === entryId);
      for (const file of meta?.files ?? []) {
        await deleteDemoFile(file.id);
      }
      const nextMetas = metas.filter((item) => item.id !== entryId);
      await saveDemoEntries(nextMetas);

      setMetas(nextMetas);
      setEntries((prev) => prev.filter((item) => item.id !== entryId));
      setEvent((prev) =>
        prev ? { ...prev, storage_used_bytes: usedBytesOf(nextMetas) } : prev,
      );

      return { success: true };
    },
    [metas],
  );

  /** Same shape as `getEventExport`: oldest first, files read from IndexedDB. */
  const getExport = useCallback(async (): Promise<EventExportResult> => {
    if (!event) {
      return { success: false, error: "notFound" };
    }

    const sizes = new Map(
      metas.flatMap((meta) =>
        meta.files.map((file) => [file.id, file.file_size_bytes]),
      ),
    );

    return {
      success: true,
      eventNames: event.names,
      entries: [...entries].reverse().map((entry) => ({
        id: entry.id,
        guest_name: entry.guest_name,
        message: entry.message,
        created_at: entry.created_at,
        uploads: entry.uploads.map((upload) => ({
          file_url: upload.file_url,
          media_type: upload.media_type,
          file_size_bytes: sizes.get(upload.id) ?? 0,
        })),
      })),
    };
  }, [event, entries, metas]);

  const reset = useCallback(async () => {
    await resetDemoRecord();
    const record = await loadDemoRecord();
    applyRecord(record);
  }, [applyRecord]);

  if (!event || !seating || !saveTheDate) {
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
        entries,
        seating,
        saveTheDate,
        isReady: true,
        setProducts,
        updateSettings,
        updatePageContent,
        uploadCover,
        updateSeating,
        updateSaveTheDate,
        uploadSaveTheDateAsset,
        addEntry,
        deleteEntry,
        getExport,
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
