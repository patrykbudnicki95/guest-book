"use client";

import { useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Download, Lock } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Entry, EntryMedia } from "@/lib/schemas/database";

interface EntryViewerProps {
  /** The entry to show; `null` closes the viewer. */
  entry: Entry | null;
  onOpenChange: (open: boolean) => void;
  /** Shows a download button for the current file when given. */
  onDownload?: (media: EntryMedia) => void;
}

export function EntryViewer({ entry, onOpenChange, onDownload }: EntryViewerProps) {
  const tCommon = useTranslations("common");
  const t = useTranslations("entryViewer");
  const format = useFormatter();
  // Keep the last entry rendered while the drawer animates closed.
  const [shown, setShown] = useState(entry);

  if (entry && entry !== shown) {
    setShown(entry);
  }

  return (
    <Drawer open={entry !== null} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        {shown && (
          <div className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden">
            <DrawerHeader className="text-left">
              <DrawerTitle className="flex items-center gap-2">
                {shown.guest_name || tCommon("anonymous")}
                {shown.is_private && (
                  <Badge variant="secondary">
                    <Lock />
                    {t("private")}
                  </Badge>
                )}
              </DrawerTitle>
              <DrawerDescription>
                {format.dateTime(new Date(shown.created_at), {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 overflow-y-auto px-4 pb-6">
              {shown.uploads.length > 0 && (
                <EntryCarousel
                  key={shown.id}
                  uploads={shown.uploads}
                  onDownload={onDownload}
                />
              )}
              {shown.message && (
                <p className="text-sm whitespace-pre-line">{shown.message}</p>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function EntryCarousel({
  uploads,
  onDownload,
}: {
  uploads: EntryMedia[];
  onDownload?: (media: EntryMedia) => void;
}) {
  const t = useTranslations("entryViewer");
  const tCommon = useTranslations("common");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (next: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: next * scroller.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* data-vaul-no-drag: horizontal swipes scroll the carousel instead of dragging the drawer. */}
        <div
          ref={scrollerRef}
          data-vaul-no-drag
          onScroll={(e) =>
            setIndex(
              Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth),
            )
          }
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl bg-black [scrollbar-width:none]"
        >
          {uploads.map((media, i) => (
            <div
              key={media.id}
              className="relative aspect-square w-full shrink-0 snap-center sm:aspect-video"
            >
              {media.media_type === "image" ? (
                <MediaImage
                  src={media.file_url}
                  alt={t("mediaAlt", { current: i + 1, total: uploads.length })}
                  fill
                  className="object-contain"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              ) : (
                <video
                  src={media.file_url}
                  controls
                  playsInline
                  preload="metadata"
                  className="size-full object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {uploads.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 left-2 hidden -translate-y-1/2 rounded-full sm:inline-flex"
              disabled={index === 0}
              onClick={() => scrollTo(index - 1)}
              aria-label={t("previous")}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-full sm:inline-flex"
              disabled={index === uploads.length - 1}
              onClick={() => scrollTo(index + 1)}
              aria-label={t("next")}
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>

      <div className="flex min-h-8 items-center justify-between text-sm text-muted-foreground">
        <span>
          {uploads.length > 1 &&
            t("counter", { current: index + 1, total: uploads.length })}
        </span>
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onDownload(uploads[index])}
          >
            <Download />
            {tCommon("download")}
          </Button>
        )}
      </div>
    </div>
  );
}
