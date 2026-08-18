"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Camera } from "lucide-react";
import { PhotoGrid } from "./photo-grid";
import { UploadDrawer, type Upload } from "./upload-drawer";
import { EventHero } from "./components/event-hero";
import { EventInfo } from "./components/event-info";
import { EventSchedule } from "./components/event-schedule";
import { EventMenu } from "./components/event-menu";
import type { EventFull } from "@/lib/schemas/database";

export function GuestViewContentClient({
  event,
  initialUploads,
}: {
  event: EventFull;
  initialUploads: Upload[];
}) {
  const t = useTranslations("guestView");
  const [uploads, setUploads] = useState(initialUploads);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleUploadSuccess = (newUpload: Upload) => {
    setUploads((prev) => [newUpload, ...prev]);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur-lg">
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
      <EventSchedule schedule={event.schedule} />

      {/* Menu */}
      <EventMenu menu={event.menu} />

      {/* Gallery */}
      <section className="px-0 py-6">
        <h2 className="mb-4 px-4 text-center text-2xl font-bold">
          {t("galleryTitle")}
        </h2>
        <PhotoGrid uploads={uploads} />
      </section>

      {/* Floating Add Photo button */}
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

      {/* Spacer for FAB */}
      <div className="h-20" />

      <UploadDrawer
        eventId={event.id}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
