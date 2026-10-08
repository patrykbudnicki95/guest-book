"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/permissions";
import type { EventExportResult } from "@/app/actions/dashboard-actions";
import type { EntryForExport } from "@/lib/schemas/database";
import {
  PART_MAX_BYTES,
  canStreamToDisk,
  exportZip,
  pickZipDestination,
  safeName,
  splitIntoParts,
  type ExportProgress,
} from "../lib/export-zip";

interface DownloadAllProps {
  /** Events whose download window is still open. */
  events: { id: string; names: string }[];
  loadExport: (eventId: string) => Promise<EventExportResult>;
}

type Status = "loading" | "ready" | "running" | "done" | "error";

type ExportData = { eventNames: string; entries: EntryForExport[] };

const EMPTY_PROGRESS: ExportProgress = {
  doneBytes: 0,
  doneFiles: 0,
  failedFiles: 0,
  part: 1,
};

export function DownloadAll({ events, loadExport }: DownloadAllProps) {
  const t = useTranslations("dashboard.gallery.downloadAll");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExportData | null>(null);
  const [streamToDisk, setStreamToDisk] = useState(false);
  const [progress, setProgress] = useState(EMPTY_PROGRESS);
  const abortRef = useRef<AbortController | null>(null);

  // Leaving the page kills the download, so warn while it runs.
  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  if (events.length === 0) {
    return null;
  }

  const files = data?.entries.flatMap((entry) => entry.uploads) ?? [];
  const totalBytes = files.reduce((sum, file) => sum + file.file_size_bytes, 0);
  const photos = files.filter((file) => file.media_type === "image").length;
  const videos = files.length - photos;
  const wishes = data?.entries.filter((entry) => entry.message).length ?? 0;
  const partCount =
    data && !streamToDisk ? splitIntoParts(data.entries, PART_MAX_BYTES).length : 1;

  const handleOpen = async (eventId: string) => {
    setOpen(true);
    setStatus("loading");
    setError(null);
    setData(null);
    setProgress(EMPTY_PROGRESS);
    setStreamToDisk(canStreamToDisk());

    let result: EventExportResult;
    try {
      result = await loadExport(eventId);
    } catch (loadError) {
      console.error("[DownloadAll] Failed to load export:", loadError);
      result = { success: false, error: "loadFailed" };
    }

    if (!result.success) {
      setError(t(`errors.${result.error}`));
      setStatus("error");
      return;
    }

    if (result.entries.length === 0) {
      setError(t("empty"));
      setStatus("error");
      return;
    }

    setData({ eventNames: result.eventNames, entries: result.entries });
    setStatus("ready");
  };

  const handleStart = async () => {
    if (!data) {
      return;
    }

    let destination: WritableStream | null = null;

    if (streamToDisk) {
      try {
        destination = await pickZipDestination(
          `${safeName(data.eventNames, "wedding")}.zip`,
        );
      } catch (pickError) {
        console.error("[DownloadAll] Save picker failed:", pickError);
        setError(t("errors.downloadFailed"));
        setStatus("error");
        return;
      }

      if (!destination) {
        return;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(EMPTY_PROGRESS);
    setStatus("running");

    try {
      const result = await exportZip({
        eventNames: data.eventNames,
        entries: data.entries,
        labels: {
          albumFile: t("albumFile"),
          anonymous: tCommon("anonymous"),
          locale,
        },
        destination,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setProgress(result);
      setStatus("done");
    } catch (exportError) {
      if (controller.signal.aborted) {
        setStatus("ready");
        return;
      }
      console.error("[DownloadAll] Export failed:", exportError);
      setError(t("errors.downloadFailed"));
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      abortRef.current?.abort();
    }
    setOpen(next);
  };

  return (
    <>
      {events.length === 1 ? (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => handleOpen(events[0].id)}
        >
          <Download />
          {t("button")}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <Download />
              {t("button")}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {events.map((event) => (
              <DropdownMenuItem key={event.id} onClick={() => handleOpen(event.id)}>
                {event.names}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="text-left">
              <DrawerTitle>{t("title")}</DrawerTitle>
              <DrawerDescription>
                {t("description", { album: `${t("albumFile")}.html` })}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-3 px-4 text-sm">
              {status === "loading" && (
                <p className="text-muted-foreground">{t("loading")}</p>
              )}

              {status === "error" && <p className="text-destructive">{error}</p>}

              {data && status !== "error" && status !== "loading" && (
                <p className="font-medium">
                  {[
                    t("photos", { count: photos }),
                    t("videos", { count: videos }),
                    t("wishes", { count: wishes }),
                    formatBytes(totalBytes),
                  ].join(" · ")}
                </p>
              )}

              {status === "ready" && (
                <>
                  <p className="text-muted-foreground">{t("keepOpen")}</p>
                  {partCount > 1 && (
                    <p className="text-muted-foreground">
                      {t("parts", {
                        count: partCount,
                        size: formatBytes(PART_MAX_BYTES),
                      })}
                    </p>
                  )}
                </>
              )}

              {status === "running" && (
                <>
                  <Progress
                    value={
                      totalBytes > 0
                        ? Math.min(100, (progress.doneBytes / totalBytes) * 100)
                        : 0
                    }
                  />
                  <p className="text-muted-foreground">
                    {t("progress", {
                      done: progress.doneFiles,
                      total: files.length,
                      doneSize: formatBytes(progress.doneBytes),
                      totalSize: formatBytes(totalBytes),
                    })}
                    {partCount > 1 &&
                      ` · ${t("partProgress", { part: progress.part, total: partCount })}`}
                  </p>
                </>
              )}

              {status === "done" && (
                <>
                  <p>{t("done")}</p>
                  {progress.failedFiles > 0 && (
                    <p className="text-destructive">
                      {t("failedFiles", { count: progress.failedFiles })}
                    </p>
                  )}
                </>
              )}
            </div>

            <DrawerFooter>
              {status === "ready" && (
                <Button className="rounded-full" onClick={handleStart}>
                  <Download />
                  {t("start")}
                </Button>
              )}
              {status === "running" ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => abortRef.current?.abort()}
                >
                  {tCommon("cancel")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleOpenChange(false)}
                >
                  {t("close")}
                </Button>
              )}
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
