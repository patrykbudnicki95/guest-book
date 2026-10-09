"use client";

import { useMemo } from "react";
import { SeatingTab } from "@/app/[locale]/(admin)/dashboard/seating/components/seating-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export function DemoSeatingTab() {
  const { event, seating, updateSeating } = useDemoWorkspace();

  // Stable reference: SeatingTab reloads its draft whenever the event changes.
  const events = useMemo(
    () => [{ id: event.id, names: event.names, plan_id: event.plan_id, seating }],
    [event.id, event.names, event.plan_id, seating],
  );

  return (
    <SeatingTab
      events={events}
      onSave={async (_eventId, data) => updateSeating(data)}
    />
  );
}
