"use client";

import { useMemo } from "react";
import { SaveTheDateTab } from "@/app/[locale]/(admin)/dashboard/save-the-date/components/save-the-date-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export function DemoSaveTheDateTab() {
  const { event, saveTheDate, updateSaveTheDate, uploadSaveTheDateAsset } =
    useDemoWorkspace();

  // Stable reference: SaveTheDateTab reloads its draft whenever the event changes.
  const events = useMemo(
    () => [
      {
        id: event.id,
        names: event.names,
        date: event.date,
        location: event.location,
        products: event.products,
        saveTheDate,
      },
    ],
    [event.id, event.names, event.date, event.location, event.products, saveTheDate],
  );

  return (
    <SaveTheDateTab
      events={events}
      variant="demo"
      onSave={async (_eventId, data) => updateSaveTheDate(data)}
      onUploadAsset={uploadSaveTheDateAsset}
    />
  );
}
