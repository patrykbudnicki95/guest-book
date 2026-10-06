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
const ENTRIES_KEY = "entries";

/** One file of an entry; its blob lives in the files store under `id`. */
export type StoredFileMeta = {
  id: string;
  media_type: "image" | "video";
  file_size_bytes: number;
};

export type StoredEntryMeta = {
  id: string;
  guest_name: string | null;
  message: string | null;
  is_private: boolean;
  created_at: string;
  files: StoredFileMeta[];
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
  entries: StoredEntryMeta[];
}> {
  const event = createDemoSeed();
  await kvPut(EVENT_KEY, event);
  await kvPut(ENTRIES_KEY, [] satisfies StoredEntryMeta[]);
  await fileDelete(DEMO_COVER_KEY);
  return { event, entries: [] };
}

export async function loadDemoRecord(): Promise<{
  event: EventFull;
  entries: StoredEntryMeta[];
  cover: Blob | null;
  files: Record<string, Blob>;
}> {
  const event = await kvGet<EventFull>(EVENT_KEY);
  const entries = await kvGet<StoredEntryMeta[]>(ENTRIES_KEY);

  // No entries key means a fresh browser or a demo saved before entries
  // existed; start over so stale per-upload blobs don't linger.
  if (!event || event.id !== DEMO_EVENT_ID || !entries) {
    const seeded = await resetDemoRecord();
    return { ...seeded, cover: null, files: {} };
  }

  const cover = (await fileGet(DEMO_COVER_KEY)) ?? null;
  const files: Record<string, Blob> = {};

  for (const file of entries.flatMap((entry) => entry.files)) {
    const blob = await fileGet(file.id);
    if (blob) {
      files[file.id] = blob;
    }
  }

  return { event, entries, cover, files };
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

export async function saveDemoEntries(
  entries: StoredEntryMeta[],
): Promise<void> {
  await kvPut(ENTRIES_KEY, entries);
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
  entries: StoredEntryMeta[];
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
