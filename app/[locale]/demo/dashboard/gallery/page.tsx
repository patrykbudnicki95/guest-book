"use client";

import { GalleryTab } from "@/app/[locale]/(admin)/dashboard/gallery/components/gallery-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export default function DemoGalleryPage() {
  const { event, entries, deleteEntry } = useDemoWorkspace();

  return (
    <GalleryTab
      entries={entries}
      downloadOpenByEvent={{ [event.id]: true }}
      onDelete={deleteEntry}
    />
  );
}
