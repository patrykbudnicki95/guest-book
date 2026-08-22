import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
} from "@/lib/schemas/database";
import {
  DEMO_COVER_KEY,
  DEMO_COVER_FALLBACK,
  DEMO_COVER_SENTINEL,
  DEMO_DB_NAME,
  DEMO_DB_VERSION,
  DEMO_EVENT_ID,
  isStoredDemoCover,
} from "./constants";
import { createDemoSeed } from "./seed";

const KV_STORE = "kv";
const FILES_STORE = "files";
const EVENT_KEY = "event";
const UPLOADS_KEY = "uploads";

export type StoredUploadMeta = {
  id: string;
  media_type: "image" | "video";
  guest_name: string | null;
  caption: string | null;
  created_at: string;
  file_size_bytes: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DEMO_DB_NAME, DEMO_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE);
      }
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function reqToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    const value = await reqToPromise(
      db.transaction(KV_STORE, "readonly").objectStore(KV_STORE).get(key),
    );
    return value as T | undefined;
  } finally {
    db.close();
  }
}

async function kvPut(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(
      db.transaction(KV_STORE, "readwrite").objectStore(KV_STORE).put(value, key),
    );
  } finally {
    db.close();
  }
}

async function fileGet(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  try {
    return await reqToPromise(
      db.transaction(FILES_STORE, "readonly").objectStore(FILES_STORE).get(key),
    );
  } finally {
    db.close();
  }
}

async function filePut(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(
      db.transaction(FILES_STORE, "readwrite").objectStore(FILES_STORE).put(blob, key),
    );
  } finally {
    db.close();
  }
}

async function fileDelete(key: string): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(
      db.transaction(FILES_STORE, "readwrite").objectStore(FILES_STORE).delete(key),
    );
  } finally {
    db.close();
  }
}

async function persistSeed(): Promise<{
  event: EventFull;
  uploads: StoredUploadMeta[];
}> {
  const event = createDemoSeed();
  await kvPut(EVENT_KEY, event);
  await kvPut(UPLOADS_KEY, [] satisfies StoredUploadMeta[]);
  await fileDelete(DEMO_COVER_KEY);
  return { event, uploads: [] };
}

export async function loadDemoRecord(): Promise<{
  event: EventFull;
  uploads: StoredUploadMeta[];
  cover: Blob | null;
  files: Record<string, Blob>;
}> {
  const event = await kvGet<EventFull>(EVENT_KEY);

  if (!event || event.id !== DEMO_EVENT_ID) {
    const seeded = await persistSeed();
    return { ...seeded, cover: null, files: {} };
  }

  const uploads = (await kvGet<StoredUploadMeta[]>(UPLOADS_KEY)) ?? [];
  const cover = (await fileGet(DEMO_COVER_KEY)) ?? null;
  const files: Record<string, Blob> = {};

  for (const upload of uploads) {
    const blob = await fileGet(upload.id);
    if (blob) {
      files[upload.id] = blob;
    }
  }

  return { event, uploads, cover, files };
}

export function serializeEvent(event: EventFull): EventFull {
  return {
    ...event,
    cover_photo_url: isStoredDemoCover(event.cover_photo_url)
      ? DEMO_COVER_SENTINEL
      : null,
  };
}

export async function saveDemoEvent(event: EventFull): Promise<void> {
  await kvPut(EVENT_KEY, serializeEvent(event));
}

export async function saveDemoUploads(
  uploads: StoredUploadMeta[],
): Promise<void> {
  await kvPut(UPLOADS_KEY, uploads);
}

export async function putDemoFile(key: string, blob: Blob): Promise<void> {
  await filePut(key, blob);
}

export async function deleteDemoFile(key: string): Promise<void> {
  await fileDelete(key);
}

export async function applySettings(
  current: EventFull,
  data: EventSettingsUpdate,
): Promise<EventFull> {
  const next: EventFull = {
    ...current,
    names: data.names,
    date: data.date,
    location: data.location ?? null,
    theme_color: data.theme_color ?? current.theme_color,
  };

  await saveDemoEvent(next);
  return next;
}

export async function applyPageContent(
  current: EventFull,
  data: EventPageContentUpdate,
): Promise<EventFull> {
  const next: EventFull = { ...current };

  if (data.welcome_message !== undefined) {
    next.welcome_message = data.welcome_message;
  }
  if (data.schedule !== undefined) {
    next.schedule = data.schedule;
  }
  if (data.menu !== undefined) {
    next.menu = data.menu;
  }
  if (data.cover_photo_url !== undefined) {
    if (
      data.cover_photo_url === null ||
      data.cover_photo_url === DEMO_COVER_FALLBACK
    ) {
      next.cover_photo_url = null;
      await deleteDemoFile(DEMO_COVER_KEY);
    } else {
      next.cover_photo_url = DEMO_COVER_SENTINEL;
    }
  }

  await saveDemoEvent(next);
  return next;
}

export async function resetDemoRecord(): Promise<{
  event: EventFull;
  uploads: StoredUploadMeta[];
}> {
  const db = await openDb();
  try {
    await reqToPromise(db.transaction(KV_STORE, "readwrite").objectStore(KV_STORE).clear());
    await reqToPromise(
      db.transaction(FILES_STORE, "readwrite").objectStore(FILES_STORE).clear(),
    );
  } finally {
    db.close();
  }

  return persistSeed();
}
