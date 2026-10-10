import type {
  EventFull,
  EventPageContentUpdate,
  EventSettingsUpdate,
  SaveTheDateUpdate,
  SeatingUpdate,
} from "@/lib/schemas/database";
import {
  DEMO_COVER_KEY,
  DEMO_COVER_FALLBACK,
  DEMO_COVER_SENTINEL,
  DEMO_DB_NAME,
  DEMO_DB_VERSION,
  DEMO_EVENT_ID,
  DEMO_SAVE_THE_DATE_KEYS,
  isStoredDemoCover,
} from "./constants";
import { createDemoSaveTheDate, createDemoSeating, createDemoSeed } from "./seed";

const KV_STORE = "kv";
const FILES_STORE = "files";
const EVENT_KEY = "event";
const ENTRIES_KEY = "entries";
const SEATING_KEY = "seating";
const SAVE_THE_DATE_KEY = "saveTheDate";
/** Stands in for a blob URL in IndexedDB; blob URLs die with the page. */
const STORED_ASSET = "local:asset";

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
  seating: SeatingUpdate;
  saveTheDate: SaveTheDateUpdate;
}> {
  const event = createDemoSeed();
  const seating = createDemoSeating();
  const saveTheDate = createDemoSaveTheDate();
  await kvPut(EVENT_KEY, event);
  await kvPut(ENTRIES_KEY, [] satisfies StoredEntryMeta[]);
  await kvPut(SEATING_KEY, seating);
  await kvPut(SAVE_THE_DATE_KEY, saveTheDate);
  await fileDelete(DEMO_COVER_KEY);
  return { event, entries: [], seating, saveTheDate };
}

export async function loadDemoRecord(): Promise<{
  event: EventFull;
  entries: StoredEntryMeta[];
  seating: SeatingUpdate;
  saveTheDate: SaveTheDateUpdate;
  saveTheDateFiles: Partial<Record<keyof typeof DEMO_SAVE_THE_DATE_KEYS, Blob>>;
  cover: Blob | null;
  files: Record<string, Blob>;
}> {
  const event = await kvGet<EventFull>(EVENT_KEY);
  const entries = await kvGet<StoredEntryMeta[]>(ENTRIES_KEY);

  // No entries key means a fresh browser or a demo saved before entries
  // existed, and no products means one saved before apps replaced plans;
  // start over so stale data doesn't linger.
  if (!event || event.id !== DEMO_EVENT_ID || !entries || !Array.isArray(event.products)) {
    const seeded = await resetDemoRecord();
    return { ...seeded, saveTheDateFiles: {}, cover: null, files: {} };
  }

  // Demos saved before seating existed get the sample plan.
  const seating = (await kvGet<SeatingUpdate>(SEATING_KEY)) ?? createDemoSeating();
  // Demos saved before save the date existed get the sample page.
  const saveTheDate =
    (await kvGet<SaveTheDateUpdate>(SAVE_THE_DATE_KEY)) ?? createDemoSaveTheDate();
  const saveTheDateFiles: Partial<Record<keyof typeof DEMO_SAVE_THE_DATE_KEYS, Blob>> = {};
  for (const [kind, key] of Object.entries(DEMO_SAVE_THE_DATE_KEYS)) {
    const blob = await fileGet(key);
    if (blob) {
      saveTheDateFiles[kind as keyof typeof DEMO_SAVE_THE_DATE_KEYS] = blob;
    }
  }
  const cover = (await fileGet(DEMO_COVER_KEY)) ?? null;
  const files: Record<string, Blob> = {};

  for (const file of entries.flatMap((entry) => entry.files)) {
    const blob = await fileGet(file.id);
    if (blob) {
      files[file.id] = blob;
    }
  }

  return { event, entries, seating, saveTheDate, saveTheDateFiles, cover, files };
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

export async function saveDemoSeating(seating: SeatingUpdate): Promise<void> {
  await kvPut(SEATING_KEY, seating);
}

/**
 * Blob URLs are swapped for a marker before saving and back for fresh ones on
 * load. A removed asset also drops its blob.
 */
export async function saveDemoSaveTheDate(saveTheDate: SaveTheDateUpdate): Promise<void> {
  const { photo_url, music_url } = saveTheDate.content;
  const stored = (url: string | null) => (url?.startsWith("blob:") ? STORED_ASSET : url);

  if (!photo_url) await fileDelete(DEMO_SAVE_THE_DATE_KEYS.photo);
  if (!music_url) await fileDelete(DEMO_SAVE_THE_DATE_KEYS.music);

  await kvPut(SAVE_THE_DATE_KEY, {
    ...saveTheDate,
    content: {
      ...saveTheDate.content,
      photo_url: stored(photo_url),
      music_url: stored(music_url),
    },
  } satisfies SaveTheDateUpdate);
}

export function isStoredDemoAsset(url: string | null): boolean {
  return url === STORED_ASSET;
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
  seating: SeatingUpdate;
  saveTheDate: SaveTheDateUpdate;
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
