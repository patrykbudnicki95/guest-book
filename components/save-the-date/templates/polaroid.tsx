"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { initialsOf } from "@/lib/save-the-date";
import { cn } from "@/lib/utils";
import { isScriptFont } from "../fonts";
import {
  CalendarActions,
  Countdown,
  EASE,
  InvitationToFollow,
  Reveal,
  TapHint,
  useEventDate,
} from "../parts";
import { Grain, ScrollCue } from "../decor";
import type { SaveTheDateTemplateProps } from "../types";

type Stage = "waiting" | "developing" | "developed";

const DEVELOP_SECONDS = 3.2;

/** A slowly turning postmark with the date in the middle. */
function DateStamp({ label, day, month }: { label: string; day: string; month: string }) {
  const pathId = useId();

  return (
    <div className="relative size-32 text-(--std-accent)">
      <motion.svg
        viewBox="0 0 120 120"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <defs>
          <path id={pathId} d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
        </defs>
        <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
        <text className="fill-current font-(family-name:--std-sans) text-[8.5px] uppercase tracking-[0.3em]">
          <textPath href={`#${pathId}`}>
            {`${label} • ${label} • `}
          </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-(family-name:--std-serif) text-4xl leading-none text-(--std-text)">{day}</span>
        <span className="mt-1 font-(family-name:--std-sans) text-[0.55rem] uppercase tracking-[0.25em]">{month}</span>
      </div>
    </div>
  );
}

/**
 * An instant photo, still blank. The tap gives it a shake, the picture
 * develops out of the dark, and the names appear in the margin as if written.
 */
export function PolaroidTemplate({ content, date, onOpen }: SaveTheDateTemplateProps) {
  const t = useTranslations("saveTheDate.view");
  const [stage, setStage] = useState<Stage>("waiting");
  const eventDate = useEventDate(date);
  const script = isScriptFont(content.font);
  const started = stage !== "waiting";

  const develop = () => {
    if (started) return;
    onOpen();
    setStage("developing");
    window.setTimeout(() => setStage("developed"), DEVELOP_SECONDS * 1000);
  };

  return (
    <div className="relative">
      <Grain />

      <section className="relative flex min-h-[100cqh] flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <motion.p
          className="font-(family-name:--std-sans) text-[0.7rem] uppercase tracking-[0.4em] text-(--std-accent)"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        >
          {content.eyebrow}
        </motion.p>

        <motion.div
          className="relative w-[min(72cqw,22rem)] bg-white p-[4.5%] pb-[20%] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 60, rotate: 6 }}
          animate={
            started
              ? { opacity: 1, y: 0, rotate: [-3, 4, -5, 3, -2, -3] }
              : { opacity: 1, y: 0, rotate: -3 }
          }
          transition={started ? { duration: 0.8, ease: "easeInOut" } : { duration: 1.2, ease: EASE, delay: 0.4 }}
        >
          {[
            "-left-4 top-2 -rotate-[32deg]",
            "-right-4 top-2 rotate-[32deg]",
          ].map((position) => (
            <span
              key={position}
              aria-hidden
              className={cn("absolute z-10 h-6 w-20 bg-(--std-accent)/25 backdrop-blur-[1px]", position)}
            />
          ))}

          <div className="relative aspect-square overflow-hidden bg-[#2b2622]">
            <motion.div
              className="absolute inset-0"
              initial={{ filter: "sepia(1) contrast(0.5) brightness(0.4) blur(8px)" }}
              animate={{
                filter: started
                  ? "sepia(0) contrast(1) brightness(1) blur(0px)"
                  : "sepia(1) contrast(0.5) brightness(0.4) blur(8px)",
              }}
              transition={{ duration: DEVELOP_SECONDS, ease: "easeOut", delay: 0.6 }}
            >
              {content.photo_url ? (
                <MediaImage src={content.photo_url} alt={content.names} fill priority sizes="22rem" className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-(--std-accent) font-(family-name:--std-display) text-[clamp(3rem,20cqw,7rem)] text-(--std-bg)">
                  {initialsOf(content.names).join("&")}
                </div>
              )}
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-[#1f1b18]"
              initial={{ opacity: 0.92 }}
              animate={{ opacity: started ? 0 : 0.92 }}
              transition={{ duration: DEVELOP_SECONDS * 0.8, ease: "easeOut", delay: 0.6 }}
            />
          </div>

          <motion.p
            className={cn(
              "absolute inset-x-[4.5%] bottom-0 flex h-[20%] items-center justify-center font-(family-name:--std-display) leading-none text-[#2b2622]",
              script ? "text-[clamp(1.5rem,7.5cqw,2.4rem)]" : "text-[clamp(1.1rem,5.5cqw,1.8rem)]",
            )}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: started ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: DEVELOP_SECONDS * 0.7 }}
          >
            {content.names}
          </motion.p>
        </motion.div>

        {stage === "developed" ? (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <DateStamp label={content.eyebrow} day={eventDate.day} month={`${eventDate.month} ${eventDate.year}`} />
            {content.location && (
              <p className="flex items-center gap-1.5 font-(family-name:--std-sans) text-xs uppercase tracking-[0.25em] opacity-70">
                <MapPin className="size-3.5" />
                {content.location}
              </p>
            )}
          </motion.div>
        ) : (
          <TapHint className={cn("h-32 pt-4", started && "invisible")} />
        )}

        {stage === "developed" && <ScrollCue delay={1.2} className="text-(--std-accent)" />}

        {!started && (
          <button
            type="button"
            onClick={develop}
            aria-label={t("open")}
            className="absolute inset-0 z-20 cursor-pointer"
          />
        )}
      </section>

      {stage === "developed" && (
        <>
          {content.message && (
            <section className="relative px-6 pb-24">
              <Reveal>
                <div className="mx-auto max-w-lg -rotate-1 bg-white/70 px-8 py-10 shadow-sm [background-image:repeating-linear-gradient(transparent,transparent_31px,color-mix(in_oklab,var(--std-accent)_20%,transparent)_32px)]">
                  <p className="whitespace-pre-line font-(family-name:--std-serif) text-[clamp(1.15rem,4.8cqw,1.45rem)] leading-8">
                    {content.message}
                  </p>
                </div>
              </Reveal>
            </section>
          )}

          {content.show_countdown && (
            <section className="relative px-4 pb-24">
              <Reveal>
                <p className="mb-6 text-center font-(family-name:--std-serif) text-2xl italic">
                  {t("countdownTitle")}
                </p>
                <Countdown
                  date={date}
                  className="gap-2 @md:gap-4"
                  unitClassName="w-[clamp(4rem,19cqw,6rem)] bg-white px-1 py-4 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)] odd:-rotate-2 even:rotate-2"
                  valueClassName="font-(family-name:--std-serif) text-[clamp(1.6rem,7.5cqw,2.6rem)] leading-none text-(--std-accent)"
                  labelClassName="mt-2 font-(family-name:--std-sans) text-[0.58rem] uppercase tracking-[0.2em] text-[#2b2622]/60"
                />
              </Reveal>
            </section>
          )}

          {content.show_calendar && (
            <section className="relative px-6 pb-24">
              <Reveal>
                <CalendarActions
                  names={content.names}
                  date={date}
                  location={content.location}
                  buttonClassName="border-transparent bg-(--std-accent) text-(--std-bg)"
                />
              </Reveal>
            </section>
          )}

          <footer className="relative flex flex-col items-center gap-3 px-6 pb-16 text-center">
            <Reveal className="flex flex-col items-center gap-3">
              <p className="font-(family-name:--std-display) text-3xl">{content.names}</p>
              <InvitationToFollow />
            </Reveal>
          </footer>
        </>
      )}
    </div>
  );
}
