"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
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
import { ScrollCue } from "../decor";
import type { SaveTheDateTemplateProps } from "../types";

/** Letters rise one by one; words never break mid-word. */
function SplitLetters({ text, delay, className }: { text: string; delay: number; className?: string }) {
  const words = text.split(" ");
  const offsets = words.map((_, index) => words.slice(0, index).join("").length);

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} aria-hidden className="inline-block overflow-hidden whitespace-nowrap pb-[0.08em] align-bottom">
          {[...word].map((letter, letterIndex) => (
            <motion.span
              key={letterIndex}
              className="inline-block"
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 1,
                ease: EASE,
                delay: delay + (offsets[wordIndex] + letterIndex) * 0.035,
              }}
            >
              {letter}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && <span className="inline-block w-[0.3em]" />}
        </span>
      ))}
    </span>
  );
}

/**
 * A magazine cover: a dark curtain parts, the photo slowly settles, and the
 * names set themselves letter by letter.
 */
export function EditorialTemplate({ content, date, onOpen }: SaveTheDateTemplateProps) {
  const t = useTranslations("saveTheDate.view");
  const [opened, setOpened] = useState(false);
  const [curtainGone, setCurtainGone] = useState(false);
  const eventDate = useEventDate(date);
  const script = isScriptFont(content.font);
  const start = 0.9;

  const open = () => {
    if (opened) return;
    onOpen();
    setOpened(true);
  };

  return (
    <div className="relative">
      {!curtainGone && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className={cn("absolute inset-y-0 w-1/2 bg-(--std-bg)", side === "left" ? "left-0" : "right-0")}
              animate={{ x: opened ? (side === "left" ? "-100%" : "100%") : 0 }}
              transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.35 }}
              onAnimationComplete={() => {
                if (opened && side === "right") setCurtainGone(true);
              }}
            />
          ))}

          <AnimatePresence>
            {!opened && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.span
                  className="h-px w-40 bg-(--std-accent)"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.4, ease: EASE }}
                />
                <motion.p
                  className="font-(family-name:--std-serif) text-[clamp(2rem,10cqw,3.5rem)] italic leading-none"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
                >
                  {content.eyebrow}
                </motion.p>
                <motion.span
                  className="h-px w-40 bg-(--std-accent)"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
                />
                <TapHint className="mt-6 text-(--std-accent)" />
                <button
                  type="button"
                  onClick={open}
                  aria-label={t("open")}
                  className="absolute inset-0 cursor-pointer"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!opened ? (
        <div className="min-h-[100cqh]" />
      ) : (
        <>
          <section className="relative flex min-h-[100cqh] flex-col justify-between overflow-hidden px-6 py-8 @2xl:px-14 @2xl:py-12">
            {content.photo_url ? (
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 9, ease: [0.16, 1, 0.3, 1] }}
              >
                <MediaImage src={content.photo_url} alt={content.names} fill priority sizes="100vw" className="object-cover" />
              </motion.div>
            ) : (
              <motion.span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center font-(family-name:--std-display) text-[60cqw] leading-none text-transparent"
                style={{ WebkitTextStroke: "1px var(--std-accent)" }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.35, scale: 1 }}
                transition={{ duration: 3, ease: EASE, delay: start }}
              >
                {initialsOf(content.names).join("")}
              </motion.span>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-(--std-bg) via-(--std-bg)/35 to-(--std-bg)/40" />

            <motion.div
              className="relative flex items-center justify-between font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.4em]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: start + 0.4 }}
            >
              <span>{content.eyebrow}</span>
              <span className="text-(--std-accent)">{eventDate.year}</span>
            </motion.div>

            <div className="relative pb-10">
              <h1
                className={cn(
                  "font-(family-name:--std-display) leading-[0.92]",
                  script
                    ? "text-[clamp(3.5rem,17cqw,9rem)]"
                    : "text-[clamp(2.75rem,13cqw,8rem)] uppercase tracking-tight",
                )}
              >
                <SplitLetters text={content.names} delay={start + 0.2} />
              </h1>
              <motion.span
                className="mt-6 block h-px origin-left bg-(--std-accent)"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: EASE, delay: start + 1.1 }}
              />
              <motion.p
                className="mt-5 flex flex-wrap items-baseline justify-between gap-2 font-(family-name:--std-sans) text-xs uppercase tracking-[0.35em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: start + 1.5 }}
              >
                <span>
                  {eventDate.day} · {eventDate.monthNumber} · {eventDate.year}
                </span>
                {content.location && <span className="opacity-70">{content.location}</span>}
              </motion.p>
            </div>

            <ScrollCue delay={start + 2.4} />
          </section>

          <section className="px-6 py-24 @2xl:px-14">
            {[
              { value: eventDate.day, className: "font-(family-name:--std-serif) text-[clamp(6rem,38cqw,16rem)] leading-[0.85]" },
              { value: eventDate.month, className: "font-(family-name:--std-serif) text-[clamp(2rem,10cqw,4.5rem)] italic" },
              { value: `${eventDate.weekday} · ${eventDate.year}`, className: "font-(family-name:--std-sans) text-xs uppercase tracking-[0.4em] text-(--std-accent)" },
            ].map((line, index) => (
              <Reveal key={index} delay={index * 0.12} className="border-t border-(--std-text)/15 py-4">
                <p className={line.className}>{line.value}</p>
              </Reveal>
            ))}
          </section>

          {content.message && (
            <section className="grid gap-6 px-6 pb-24 @2xl:grid-cols-[1fr_2fr] @2xl:px-14">
              <Reveal>
                <p className="font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.4em] text-(--std-accent)">
                  {t("fromUs")}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="whitespace-pre-line font-(family-name:--std-serif) text-[clamp(1.4rem,5.5cqw,2.25rem)] leading-snug">
                  {content.message}
                </p>
              </Reveal>
            </section>
          )}

          {content.location && (
            <section className="grid gap-6 px-6 pb-24 @2xl:grid-cols-[1fr_2fr] @2xl:px-14">
              <Reveal>
                <p className="font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.4em] text-(--std-accent)">
                  {t("where")}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-(family-name:--std-serif) text-[clamp(1.75rem,8cqw,3.5rem)] leading-tight">
                  {content.location}
                </p>
              </Reveal>
            </section>
          )}

          {content.show_countdown && (
            <section className="px-6 pb-24 @2xl:px-14">
              <Reveal>
                <Countdown
                  date={date}
                  className="divide-x divide-(--std-text)/15 border-y border-(--std-text)/15"
                  unitClassName="flex-1 py-6"
                  valueClassName="font-(family-name:--std-serif) text-[clamp(2rem,10cqw,4.5rem)] leading-none"
                  labelClassName="mt-2 font-(family-name:--std-sans) text-[0.6rem] uppercase tracking-[0.25em] opacity-60"
                />
              </Reveal>
            </section>
          )}

          {content.show_calendar && (
            <section className="px-6 pb-24">
              <Reveal>
                <CalendarActions names={content.names} date={date} location={content.location} />
              </Reveal>
            </section>
          )}

          <footer className="flex flex-col items-center gap-4 px-6 pb-16 text-center">
            <Reveal className="flex flex-col items-center gap-4">
              <p className={cn("font-(family-name:--std-display) text-3xl", !script && "uppercase tracking-tight")}>
                {content.names}
              </p>
              <InvitationToFollow />
            </Reveal>
          </footer>
        </>
      )}
    </div>
  );
}
