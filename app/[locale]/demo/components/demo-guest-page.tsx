"use client";

import { GuestViewContentClient } from "@/app/[locale]/e/[eventId]/guest-view-content-client";
import {
  DEMO_MAX_FILE_BYTES,
  useDemoWorkspace,
} from "@/lib/demo/provider";
import type { Upload } from "@/app/[locale]/e/[eventId]/upload-drawer";

export function DemoGuestPage() {
  const { event, uploads, addUpload } = useDemoWorkspace();

  const guestUploads: Upload[] = uploads.map((upload) => ({
    id: upload.id,
    file_url: upload.file_url,
    thumbnail_url: upload.thumbnail_url,
    media_type: upload.media_type,
    guest_name: upload.guest_name,
    caption: upload.caption,
    created_at: upload.created_at,
  }));

  return (
    <div className="min-h-screen bg-muted/20">
      <GuestViewContentClient
        event={event}
        initialUploads={guestUploads}
        uploadWindow={{ isOpen: true, closesAt: event.date }}
        onUpload={addUpload}
        maxFileBytes={DEMO_MAX_FILE_BYTES}
        headerClassName="top-12"
      />
    </div>
  );
}
