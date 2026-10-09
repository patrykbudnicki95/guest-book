"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Monitor, RotateCcw, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SAVE_THE_DATE_PALETTES,
  SAVE_THE_DATE_TEMPLATE_DEFAULTS,
  createSaveTheDateContent,
} from "@/lib/save-the-date";
import {
  SAVE_THE_DATE_TEMPLATES,
  type SaveTheDateTemplate,
} from "@/lib/schemas/database";
import { SaveTheDateView } from "@/components/save-the-date/save-the-date-view";
import { BrowserFrame, PhoneFrame } from "@/components/save-the-date/device-frame";

const SAMPLE_DATE = "2027-06-19";

const SAMPLES: Record<SaveTheDateTemplate, { names: string; location: string; photo: string }> = {
  envelope: { names: "Ola & Kuba", location: "Kraków", photo: "/images/hero-couple.jpeg" },
  editorial: { names: "Marta i Piotr", location: "Sopot", photo: "/images/demo-hero.jpeg" },
  polaroid: { names: "Natalia & Bartek", location: "Kazimierz Dolny", photo: "/images/hero-couple.jpeg" },
  botanical: { names: "Hania i Szymon", location: "Wrocław", photo: "/images/demo-hero.jpeg" },
};

/** The real guest component with sample couples, one tab per template. */
export function SaveTheDateShowcase({ previewUrl }: { previewUrl: string }) {
  const t = useTranslations("saveTheDatePage.showcase");
  const tTemplates = useTranslations("saveTheDate.templates");
  const tDefaults = useTranslations("saveTheDate.defaults");
  const [template, setTemplate] = useState<SaveTheDateTemplate>("envelope");
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [replayKey, setReplayKey] = useState(0);

  const sample = SAMPLES[template];
  const content = createSaveTheDateContent({
    template,
    names: sample.names,
    location: sample.location,
    eyebrow: tDefaults("eyebrow"),
    message: tDefaults("message"),
    photoUrl: sample.photo,
  });
  const view = (
    <SaveTheDateView
      key={`${template}-${device}-${replayKey}`}
      template={template}
      content={content}
      date={SAMPLE_DATE}
    />
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-muted/60 p-1.5 [scrollbar-width:none]">
          {SAVE_THE_DATE_TEMPLATES.map((id) => {
            const palette = SAVE_THE_DATE_PALETTES[SAVE_THE_DATE_TEMPLATE_DEFAULTS[id].palette];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTemplate(id)}
                aria-pressed={template === id}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  template === id
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className="relative size-4 overflow-hidden rounded-full border"
                  style={{ background: palette.background }}
                >
                  <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: palette.accent }} />
                </span>
                {tTemplates(`${id}.name`)}
              </button>
            );
          })}
        </div>

        <div className="hidden gap-1 rounded-full bg-muted/60 p-1.5 md:flex">
          {(
            [
              { id: "desktop", icon: Monitor },
              { id: "phone", icon: Smartphone },
            ] as const
          ).map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              aria-label={t(id)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full transition-all",
                device === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <p className="mx-auto max-w-md text-center text-sm text-muted-foreground">
        {tTemplates(`${template}.description`)}
      </p>

      {device === "desktop" ? (
        <BrowserFrame url={previewUrl} className="max-w-5xl">
          {view}
        </BrowserFrame>
      ) : (
        <PhoneFrame>{view}</PhoneFrame>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setReplayKey((key) => key + 1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <RotateCcw className="size-3.5" />
          {t("replay")}
        </button>
      </div>
    </div>
  );
}
