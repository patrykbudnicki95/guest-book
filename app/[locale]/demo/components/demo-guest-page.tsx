"use client";

import { GuestViewContentClient } from "@/app/[locale]/e/[eventId]/guest-view-content-client";
import { DEMO_MAX_FILE_BYTES, useDemoWorkspace } from "@/lib/demo/provider";

export function DemoGuestPage() {
  const { event, entries, addEntry } = useDemoWorkspace();

  // The demo guest page shows what a guest sees, so private entries stay in
  // the demo dashboard only.
  const guestEntries = entries.filter((entry) => !entry.is_private);

  return (
    <div className="min-h-screen bg-muted/20">
      <GuestViewContentClient
        event={event}
        initialEntries={guestEntries}
        uploadWindow={{ isOpen: true, closesAt: event.date }}
        onUpload={addEntry}
        maxFileBytes={DEMO_MAX_FILE_BYTES}
        headerClassName="top-12"
      />
    </div>
  );
}
