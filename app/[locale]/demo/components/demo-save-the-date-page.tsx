"use client";

import { useTranslations } from "next-intl";
import { SaveTheDateView } from "@/components/save-the-date/save-the-date-view";
import { useDemoWorkspace } from "@/lib/demo/provider";
import { hasApp } from "@/lib/permissions";

export function DemoSaveTheDatePage() {
  const t = useTranslations("saveTheDate.guest");
  const { event, saveTheDate } = useDemoWorkspace();

  if (
    !saveTheDate.is_published ||
    !hasApp({ products: event.products, app: "saveTheDate" })
  ) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold">{t("notReadyTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("notReadyDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <SaveTheDateView
      template={saveTheDate.template}
      content={saveTheDate.content}
      date={event.date}
    />
  );
}
