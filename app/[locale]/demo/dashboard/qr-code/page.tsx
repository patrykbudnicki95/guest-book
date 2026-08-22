"use client";

import { QRCodeTab } from "@/app/[locale]/(admin)/dashboard/qr-code/components/qr-code-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export default function DemoQrCodePage() {
  const { event } = useDemoWorkspace();

  return (
    <QRCodeTab
      events={[
        {
          id: event.id,
          names: event.names,
          date: event.date,
          location: event.location,
          plan_id: event.plan_id,
        },
      ]}
      guestHref="/demo"
    />
  );
}
