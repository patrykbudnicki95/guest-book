"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MediaImage } from "@/components/media-image";
import { EntryViewer } from "@/components/entry-viewer";
import { Layers, Lock, Play, Quote } from "lucide-react";
import type { Entry } from "@/lib/schemas/database";

interface PhotoGridProps {
  entries: Entry[];
}

export function PhotoGrid({ entries }: PhotoGridProps) {
  const t = useTranslations("guestView");
  const tCommon = useTranslations("common");
  const [openEntry, setOpenEntry] = useState<Entry | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Play className="size-6 text-primary" />
        </div>
        <p className="text-lg font-medium">{t("noPhotos")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("noPhotosSubtitle")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {entries.map((entry) => {
          const cover = entry.uploads[0];

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setOpenEntry(entry)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted text-left shadow-sm"
            >
              {!cover ? (
                <div className="flex h-full flex-col gap-2 bg-primary/10 p-3">
                  <Quote className="size-4 shrink-0 text-primary" />
                  <p className="line-clamp-5 flex-1 text-sm">{entry.message}</p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {entry.guest_name || tCommon("anonymous")}
                  </p>
                </div>
              ) : cover.media_type === "image" ? (
                <MediaImage
                  src={cover.thumbnail_url || cover.file_url}
                  alt={entry.message || t("memory")}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              ) : (
                <div className="relative h-full w-full">
                  {cover.thumbnail_url ? (
                    <MediaImage
                      src={cover.thumbnail_url}
                      alt={entry.message || t("videoAlt")}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Play className="size-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-black/60 p-3">
                      <Play className="size-6 fill-white text-white" />
                    </div>
                  </div>
                </div>
              )}
              {entry.uploads.length > 1 && (
                <div
                  className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white"
                  aria-label={t("filesCount", { count: entry.uploads.length })}
                >
                  <Layers className="size-3.5" />
                  {entry.uploads.length}
                </div>
              )}
              {/* RLS only returns private entries to the couple, so only they see this. */}
              {entry.is_private && (
                <div
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5"
                  title={t("privateBadge")}
                >
                  <Lock className="size-3.5 text-white" aria-label={t("privateBadge")} />
                </div>
              )}
              {cover && entry.message && (
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="line-clamp-2 text-xs text-white">{entry.message}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <EntryViewer
        entry={openEntry}
        onOpenChange={(open) => !open && setOpenEntry(null)}
      />
    </>
  );
}
