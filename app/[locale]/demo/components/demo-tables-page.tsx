"use client";

import { SeatingBrowser } from "@/app/[locale]/e/[eventId]/tables/components/seating-browser";
import { useDemoWorkspace } from "@/lib/demo/provider";
import { hasApp } from "@/lib/permissions";

export function DemoTablesPage() {
  const { event, seating } = useDemoWorkspace();

  return (
    <div className="min-h-screen bg-muted/20">
      <SeatingBrowser
        eventNames={event.names}
        tables={
          hasApp({ products: event.products, app: "seating" }) &&
          seating.is_published &&
          seating.tables.length > 0
            ? seating.tables
            : null
        }
        backHref="/demo"
        headerClassName="top-12"
      />
    </div>
  );
}
