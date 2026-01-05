"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { PhotoGrid } from "./photo-grid";
import { UploadDrawer, type Upload } from "./upload-drawer";

interface Event {
  id: string;
  names: string;
  date: string;
}

export function GuestViewContentClient({
  event,
  initialUploads,
}: {
  event: Event;
  initialUploads: Upload[];
}) {
  const [uploads, setUploads] = useState(initialUploads);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleUploadSuccess = (newUpload: Upload) => {
    setUploads((prev) => [newUpload, ...prev]);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile-first header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{event.names}</h1>
            <p className="text-sm text-muted-foreground">{event.date}</p>
          </div>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            size="lg"
            className="ml-4 shrink-0"
          >
            <Camera className="mr-2 size-4" />
            Add Photo
          </Button>
        </div>
      </header>

      {/* Photo grid */}
      <main className="pb-8">
        <PhotoGrid uploads={uploads} />
      </main>

      {/* Upload drawer */}
      <UploadDrawer
        eventId={event.id}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}

