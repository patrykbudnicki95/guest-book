"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Camera } from "lucide-react";
import { PhotoGrid } from "./photo-grid";
import {
  UploadDrawer,
  type LocalEntryInput,
  type LocalEntryResult,
} from "./upload-drawer";
import { EventHero } from "./components/event-hero";
import { EventInfo } from "./components/event-info";
import { EventSchedule } from "./components/event-schedule";
import { EventMenu } from "./components/event-menu";
import { hasFeature } from "@/lib/permissions";
import type { Entry, EventFull } from "@/lib/schemas/database";
import { cn } from "@/lib/utils";

export function GuestViewContentClient({
  event,
  initialEntries,
  uploadWindow,
  onUpload,
  maxFileBytes,
  headerClassName,
}: {
  event: EventFull;
  initialEntries: Entry[];
  uploadWindow: { isOpen: boolean; closesAt: string };
  onUpload?: (input: LocalEntryInput) => Promise<LocalEntryResult>;
  maxFileBytes?: number;
  headerClassName?: string;
}) {
  const t = useTranslations("guestView");
  const format = useFormatter();
  const [entries, setEntries] = useState(initialEntries);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const handleUploadSuccess = (newEntry: Entry) => {
    setIsDrawerOpen(false);
    // Private entries go to the couple only, so they never join the guest grid.
    if (newEntry.is_private) return;
    setEntries((prev) =>
      prev.some((entry) => entry.id === newEntry.id)
        ? prev
        : [newEntry, ...prev],
    );
  };

  return (
    <>
      {/* Sticky top bar */}
      <header
        className={cn(
          "sticky z-20 border-b bg-white/90 backdrop-blur-lg",
          headerClassName ?? "top-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2.5">
          <p className="truncate text-sm font-semibold">{event.names}</p>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero */}
      <EventHero
        names={event.names}
        date={event.date}
        coverPhotoUrl={event.cover_photo_url}
        location={event.location}
      />

      {/* Welcome message */}
      <EventInfo welcomeMessage={event.welcome_message} />

      {/* Schedule */}
      {hasFeature({ plan: event.plan_id, feature: "schedule" }) && (
        <EventSchedule schedule={event.schedule} />
      )}

      {/* Menu */}
      {hasFeature({ plan: event.plan_id, feature: "menu" }) && (
        <EventMenu menu={event.menu} />
      )}

      {/* Gallery */}
      <section className="px-0 py-6">
        <h2 className="mb-4 px-4 text-center text-2xl font-bold">
          {t("galleryTitle")}
        </h2>
        <PhotoGrid entries={entries} />
      </section>

      {/* Floating Add Photo button */}
      {uploadWindow.isOpen ? (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            size="lg"
            className="rounded-full px-8 shadow-xl shadow-primary/30"
          >
            <Camera className="mr-2 size-5" />
            {t("addPhoto")}
          </Button>
        </div>
      ) : (
        <div className="px-4 pb-6">
          <div className="rounded-2xl border bg-muted/40 p-4 text-center">
            <p className="font-semibold">{t("upload.closedTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("upload.closedDescription", {
                date: format.dateTime(new Date(uploadWindow.closesAt), {
                  dateStyle: "long",
                }),
              })}
            </p>
          </div>
        </div>
      )}

      {/* Spacer for FAB */}
      {uploadWindow.isOpen && <div className="h-20" />}

      <UploadDrawer
        eventId={event.id}
        plan={event.plan_id}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUploadSuccess={handleUploadSuccess}
        onUpload={onUpload}
        maxFileBytes={maxFileBytes}
      />
    </>
  );
}
