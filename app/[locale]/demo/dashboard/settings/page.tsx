"use client";

import { SettingsTab } from "@/app/[locale]/(admin)/dashboard/settings/components/settings-tab";
import { useDemoWorkspace } from "@/lib/demo/provider";

export default function DemoSettingsPage() {
  const { event, updateSettings } = useDemoWorkspace();

  return (
    <SettingsTab
      events={[
        {
          id: event.id,
          names: event.names,
          date: event.date,
          location: event.location,
          theme_color: event.theme_color,
          plan_id: event.plan_id,
        },
      ]}
      variant="demo"
      onSave={async (_eventId, data) => updateSettings(data)}
    />
  );
}
