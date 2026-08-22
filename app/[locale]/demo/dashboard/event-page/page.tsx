"use client";

import { EventPageTab } from "@/app/[locale]/(admin)/dashboard/event-page/components/event-page-tab";
import {
  DEMO_COVER_FALLBACK,
  DEMO_MAX_FILE_BYTES,
  useDemoWorkspace,
} from "@/lib/demo/provider";

export default function DemoEventPage() {
  const { event, updatePageContent, uploadCover } = useDemoWorkspace();

  return (
    <EventPageTab
      events={[event]}
      onSave={async (_eventId, data) => updatePageContent(data)}
      onCoverUpload={uploadCover}
      maxCoverBytes={DEMO_MAX_FILE_BYTES}
      fallbackCoverUrl={DEMO_COVER_FALLBACK}
    />
  );
}
