"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Upload } from "./upload-drawer";

interface PhotoGridProps {
  uploads: Upload[];
}

export function PhotoGrid({ uploads }: PhotoGridProps) {
  if (uploads.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <p className="text-lg text-muted-foreground">No photos yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to share a memory!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {uploads.map((upload) => (
        <div
          key={upload.id}
          className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
        >
          {upload.media_type === "image" ? (
            <Image
              src={upload.thumbnail_url || upload.file_url}
              alt={upload.caption || "Wedding memory"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="relative h-full w-full">
              {upload.thumbnail_url ? (
                <Image
                  src={upload.thumbnail_url}
                  alt={upload.caption || "Wedding video"}
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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="line-clamp-2 text-xs text-white">{upload.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

