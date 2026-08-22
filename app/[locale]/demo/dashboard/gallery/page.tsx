"use client";

import { GalleryTab } from "@/app/[locale]/(admin)/dashboard/gallery/components/gallery-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export default function DemoGalleryPage() {
  const { event, uploads, deleteUpload } = useDemoWorkspace();

  return (
    <GalleryTab
      uploads={uploads}
      downloadOpenByEvent={{ [event.id]: true }}
      onDelete={deleteUpload}
    />
  );
}
