"use client";

import { GuestViewContentClient } from "@/app/[locale]/e/[eventId]/guest-view-content-client";
import { GuestbookUnavailable } from "@/app/[locale]/e/[eventId]/components/guestbook-unavailable";
import { DEMO_MAX_FILE_BYTES, useDemoWorkspace } from "@/lib/demo/provider";
import { hasApp } from "@/lib/permissions";

export function DemoGuestPage() {
  const { event, entries, seating, addEntry } = useDemoWorkspace();

  // The demo guest page shows what a guest sees, so private entries stay in
  // the demo dashboard only.
  const guestEntries = entries.filter((entry) => !entry.is_private);

  if (!hasApp({ products: event.products, app: "guestbook" })) {
    return <GuestbookUnavailable />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <GuestViewContentClient
        event={event}
        initialEntries={guestEntries}
        uploadWindow={{ isOpen: true, closesAt: event.date }}
        seatingHref={
          hasApp({ products: event.products, app: "seating" }) &&
          seating.is_published &&
          seating.tables.length > 0
            ? "/demo/tables"
            : null
        }
        onUpload={addEntry}
        maxFileBytes={DEMO_MAX_FILE_BYTES}
        headerClassName="top-12"
      />
    </div>
  );
}
