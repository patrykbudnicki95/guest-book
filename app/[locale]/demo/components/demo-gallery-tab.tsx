"use client";

import { GalleryTab } from "@/app/[locale]/(admin)/dashboard/gallery/components/gallery-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export function DemoGalleryTab() {
  const { event, entries, deleteEntry, getExport } = useDemoWorkspace();

  return (
    <GalleryTab
      entries={entries}
      downloadOpenByEvent={{ [event.id]: true }}
      onDelete={deleteEntry}
      onLoadExport={getExport}
    />
  );
}
