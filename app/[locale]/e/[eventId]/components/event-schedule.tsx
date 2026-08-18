"use client";

import { useTranslations } from "next-intl";
import type { ScheduleItem } from "@/lib/schemas/database";

interface EventScheduleProps {
  schedule: ScheduleItem[] | null;
}

export function EventSchedule({ schedule }: EventScheduleProps) {
  const t = useTranslations("guestView.schedule");

  if (!schedule || schedule.length === 0) return null;

  return (
    <section className="px-4 py-8">
      <h2 className="mb-6 text-center text-2xl font-bold">{t("title")}</h2>
      <div className="mx-auto max-w-md">
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-primary/20" />

          {schedule.map((item, index) => (
            <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Dot */}
              <div className="relative z-10 mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white">
                <div className="size-3 rounded-full bg-primary" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-semibold text-primary">{item.time}</p>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
