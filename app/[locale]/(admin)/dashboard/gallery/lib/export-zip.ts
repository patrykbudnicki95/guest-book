import { makeZip } from "client-zip";
import type { EntryForExport } from "@/lib/schemas/database";

/**
 * Browsers without `showSaveFilePicker` (Safari, Firefox) have to hold a whole
 * ZIP in memory before saving it, so they get several ZIPs of about this size.
 */
export const PART_MAX_BYTES = 1024 ** 3;

/** Files fetched ahead of the one being zipped, to hide per-request latency. */
const PREFETCH = 4;
const PROGRESS_INTERVAL_MS = 250;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

export type ExportLabels = {
  /** File name of the HTML album, without extension. */
  albumFile: string;
  anonymous: string;
  locale: string;
};

export type ExportProgress = {
  doneBytes: number;
  doneFiles: number;
  failedFiles: number;
  part: number;
};

type SaveFilePicker = (options: {
  suggestedName: string;
  types: { description: string; accept: Record<string, string[]> }[];
}) => Promise<{ createWritable: () => Promise<WritableStream> }>;

/** Chrome and Edge can stream one ZIP of any size straight to disk. */
export function canStreamToDisk(): boolean {
  return typeof window !== "undefined" && "showSaveFilePicker" in window;
}

/** Must run inside the click handler: the picker needs a user gesture. */
export async function pickZipDestination(
  fileName: string,
): Promise<WritableStream | null> {
  const picker = (window as unknown as { showSaveFilePicker: SaveFilePicker })
    .showSaveFilePicker;

  try {
    const handle = await picker({
      suggestedName: fileName,
      types: [{ description: "ZIP", accept: { "application/zip": [".zip"] } }],
    });
    return await handle.createWritable();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }
    throw error;
  }
}

export function safeName(value: string, fallback: string): string {
  const cleaned = value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)
    .replace(/[. ]+$/, "");

  return cleaned || fallback;
}

/**
 * Groups entries into ZIPs of at most `maxBytes`. An entry is never split, so
 * each part's album can show every wish in it next to its own photos.
 */
export function splitIntoParts(
  entries: EntryForExport[],
  maxBytes: number,
): EntryForExport[][] {
  const parts: EntryForExport[][] = [[]];
  let partBytes = 0;

  for (const entry of entries) {
    const entryBytes = entry.uploads.reduce(
      (sum, upload) => sum + upload.file_size_bytes,
      0,
    );

    if (parts[parts.length - 1].length > 0 && partBytes + entryBytes > maxBytes) {
      parts.push([]);
      partBytes = 0;
    }

    parts[parts.length - 1].push(entry);
    partBytes += entryBytes;
  }

  return parts;
}

type ZippedEntry = {
  entry: EntryForExport;
  /** Paths relative to the album, one per file that made it into the ZIP. */
  files: { path: string; mediaType: "image" | "video" }[];
};

function extensionFor(response: Response, url: string, mediaType: string): string {
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const fromUrl = /\.([a-z0-9]{2,5})$/i.exec(new URL(url).pathname)?.[1];

  return (
    EXTENSION_BY_TYPE[contentType] ??
    fromUrl?.toLowerCase() ??
    (mediaType === "video" ? "mp4" : "jpg")
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

/** A self-contained page that shows each wish with the photos next to it. */
function buildAlbum(
  title: string,
  zipped: ZippedEntry[],
  labels: ExportLabels,
): string {
  const dateFormat = new Intl.DateTimeFormat(labels.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const articles = zipped
    .map(({ entry, files }) => {
      const media = files
        .map(({ path, mediaType }) => {
          const src = escapeHtml(encodePath(path));
          return mediaType === "video"
            ? `<video src="${src}" controls preload="metadata"></video>`
            : `<a href="${src}" target="_blank"><img src="${src}" loading="lazy" alt=""></a>`;
        })
        .join("");

      return `<article>
<h2>${escapeHtml(entry.guest_name || labels.anonymous)}</h2>
<time>${dateFormat.format(new Date(entry.created_at))}</time>
${entry.message ? `<p>${escapeHtml(entry.message)}</p>` : ""}
${media ? `<div class="media">${media}</div>` : ""}
</article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="${labels.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{margin:0;padding:24px 16px;background:#faf8f5;color:#2b2b2b;font-family:Georgia,serif}
main{max-width:860px;margin:0 auto}
h1{text-align:center;font-weight:normal;font-size:2.2rem;margin:0 0 32px}
article{background:#fff;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
h2{margin:0;font-size:1.25rem}
time{display:block;color:#888;font-size:.85rem;margin-top:4px}
p{white-space:pre-line;font-size:1.05rem;line-height:1.6}
.media{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-top:12px}
.media img,.media video{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;background:#eee}
</style>
</head>
<body>
<main>
<h1>${escapeHtml(title)}</h1>
${articles}
</main>
</body>
</html>`;
}

/**
 * Streams one ZIP: a folder per entry with its files, fetched straight from
 * storage, then the HTML album. Files that fail to download are skipped and
 * counted rather than failing the whole export.
 */
function zipPart({
  entries,
  indexOffset,
  root,
  labels,
  signal,
  onBytes,
  onFile,
}: {
  entries: EntryForExport[];
  indexOffset: number;
  root: string;
  labels: ExportLabels;
  signal: AbortSignal;
  onBytes: (bytes: number) => void;
  onFile: (ok: boolean) => void;
}): ReadableStream<Uint8Array> {
  const queue = entries.flatMap((entry, entryIndex) =>
    entry.uploads.map((upload, fileIndex) => ({
      upload,
      entryIndex,
      fileIndex,
    })),
  );

  const fetches: Promise<Response>[] = [];
  const startFetch = (index: number) => {
    if (index < queue.length && !fetches[index]) {
      // no-store: gigabytes of files shouldn't fill the HTTP cache.
      const request = fetch(queue[index].upload.file_url, {
        signal,
        cache: "no-store",
      });
      // Marked handled so an abort doesn't surface as an unhandled rejection
      // for files that were prefetched but never awaited.
      request.catch(() => {});
      fetches[index] = request;
    }
  };

  async function* files() {
    const zipped: ZippedEntry[] = entries.map((entry) => ({ entry, files: [] }));

    for (let index = 0; index < queue.length; index += 1) {
      for (let ahead = index; ahead <= index + PREFETCH; ahead += 1) {
        startFetch(ahead);
      }

      const { upload, entryIndex, fileIndex } = queue[index];
      let response: Response;

      try {
        response = await fetches[index];
      } catch (error) {
        if (signal.aborted) {
          throw error;
        }
        console.error("[exportZip] Failed to fetch:", upload.file_url, error);
        onFile(false);
        continue;
      }

      if (!response.ok || !response.body) {
        console.error("[exportZip] Failed to fetch:", upload.file_url, response.status);
        onFile(false);
        continue;
      }

      const entry = entries[entryIndex];
      const folder = `${String(indexOffset + entryIndex + 1).padStart(3, "0")} ${safeName(
        entry.guest_name ?? "",
        labels.anonymous,
      )}`;
      const path = `${folder}/${String(fileIndex + 1).padStart(2, "0")}.${extensionFor(
        response,
        upload.file_url,
        upload.media_type,
      )}`;
      zipped[entryIndex].files.push({ path, mediaType: upload.media_type });

      yield {
        name: `${root}/${path}`,
        lastModified: new Date(entry.created_at),
        input: response.body.pipeThrough(
          new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
              onBytes(chunk.byteLength);
              controller.enqueue(chunk);
            },
            flush() {
              onFile(true);
            },
          }),
        ),
      };
    }

    yield {
      name: `${root}/${safeName(labels.albumFile, "album")}.html`,
      lastModified: new Date(),
      input: buildAlbum(root, zipped, labels),
    };
  }

  return makeZip(files());
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Builds the ZIP(s) in the browser. With `destination` everything streams into
 * one file; otherwise each part is assembled in memory and saved in turn.
 */
export async function exportZip({
  eventNames,
  entries,
  labels,
  destination,
  signal,
  onProgress,
}: {
  eventNames: string;
  entries: EntryForExport[];
  labels: ExportLabels;
  destination: WritableStream | null;
  signal: AbortSignal;
  onProgress: (progress: ExportProgress) => void;
}): Promise<ExportProgress> {
  const root = safeName(eventNames, "wedding");
  const parts = destination ? [entries] : splitIntoParts(entries, PART_MAX_BYTES);
  const progress: ExportProgress = { doneBytes: 0, doneFiles: 0, failedFiles: 0, part: 1 };
  let lastReport = 0;

  const report = (force = false) => {
    const now = Date.now();
    if (force || now - lastReport > PROGRESS_INTERVAL_MS) {
      lastReport = now;
      onProgress({ ...progress });
    }
  };

  let indexOffset = 0;

  for (const [index, part] of parts.entries()) {
    progress.part = index + 1;
    report(true);

    const stream = zipPart({
      entries: part,
      indexOffset,
      root,
      labels,
      signal,
      onBytes: (bytes) => {
        progress.doneBytes += bytes;
        report();
      },
      onFile: (ok) => {
        if (ok) {
          progress.doneFiles += 1;
        } else {
          progress.failedFiles += 1;
        }
        report();
      },
    });
    indexOffset += part.length;

    if (destination) {
      await stream.pipeTo(destination, { signal });
    } else {
      const blob = await new Response(stream).blob();
      const fileName =
        parts.length > 1 ? `${root} (${index + 1}-${parts.length}).zip` : `${root}.zip`;
      saveBlob(blob, fileName);
    }
  }

  report(true);
  return progress;
}
