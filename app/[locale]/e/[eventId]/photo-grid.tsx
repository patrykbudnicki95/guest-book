"use client";

import { useTranslations } from "next-intl";
import { MediaImage } from "@/components/media-image";
import { Play } from "lucide-react";
import type { Upload } from "./upload-drawer";

interface PhotoGridProps {
  uploads: Upload[];
}

export function PhotoGrid({ uploads }: PhotoGridProps) {
  const t = useTranslations("guestView");

  if (uploads.length === 0) {
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
    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="group relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm"
        >
          {upload.media_type === "image" ? (
            <MediaImage
              src={upload.thumbnail_url || upload.file_url}
              alt={upload.caption || t("memory")}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="relative h-full w-full">
              {upload.thumbnail_url ? (
                <MediaImage
                  src={upload.thumbnail_url}
                  alt={upload.caption || t("videoAlt")}
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
          {upload.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="line-clamp-2 text-xs text-white">{upload.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

