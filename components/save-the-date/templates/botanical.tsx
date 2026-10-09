"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
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
import { ArchPhoto, Branch, Grain, Ornament, ScrollCue, StackedNames, Wreath } from "../decor";
import type { SaveTheDateTemplateProps } from "../types";

/** Fixed, hand-picked spots so server and browser render the same petals. */
const PETALS = [
  { left: "8%", size: 10, duration: 14, delay: 0 },
  { left: "22%", size: 7, duration: 18, delay: 4 },
  { left: "41%", size: 9, duration: 16, delay: 9 },
  { left: "58%", size: 6, duration: 20, delay: 2 },
  { left: "73%", size: 11, duration: 15, delay: 6 },
  { left: "88%", size: 8, duration: 19, delay: 11 },
];

function FallingPetals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((petal) => (
        <motion.span
          key={petal.left}
          className="absolute rounded-[60%_0_60%_0] bg-(--std-accent)/30"
          style={{ left: petal.left, width: petal.size, height: petal.size * 1.4 }}
          initial={{ top: "-5%", rotate: 0, x: 0 }}
          animate={{ top: "105%", rotate: 360, x: [0, 24, -16, 12, 0] }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
            x: { duration: petal.duration, repeat: Infinity, ease: "easeInOut", delay: petal.delay },
          }}
        />
      ))}
    </div>
  );
}

/**
 * A garden in line art: a leaf wreath draws itself around the initials, opens
 * on tap, and branches grow in from the corners of the page.
 */
export function BotanicalTemplate({ content, date, onOpen }: SaveTheDateTemplateProps) {
  const t = useTranslations("saveTheDate.view");
  const [opened, setOpened] = useState(false);
  const eventDate = useEventDate(date);
  const script = isScriptFont(content.font);

  const open = () => {
    if (opened) return;
    onOpen();
    setOpened(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!opened ? (
        <motion.div
          key="intro"
          className="relative flex min-h-[100cqh] flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
          exit={{ opacity: 0, scale: 1.15, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Grain />
          <motion.p
            className="font-(family-name:--std-sans) text-[0.7rem] uppercase tracking-[0.4em] text-(--std-accent)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            {content.eyebrow}
          </motion.p>
          <Wreath names={content.names} className="w-[min(70cqw,20rem)]" />
          <TapHint className="text-(--std-accent)" />
          <button
            type="button"
            onClick={open}
            aria-label={t("open")}
            className="absolute inset-0 cursor-pointer"
          />
        </motion.div>
      ) : (
        <motion.div
          key="page"
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Grain />

          <section className="relative flex min-h-[100cqh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
            <FallingPetals />
            <Branch className="absolute -left-6 -top-4 w-[min(45cqw,16rem)] -scale-y-100" delay={0.2} />
            <Branch className="absolute -bottom-4 -right-6 w-[min(45cqw,16rem)] -scale-x-100" delay={0.5} />

            <motion.p
              className="relative font-(family-name:--std-sans) text-[0.7rem] uppercase tracking-[0.4em] text-(--std-accent)"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.4 }}
            >
              {content.eyebrow}
            </motion.p>

            <StackedNames
              names={content.names}
              delay={0.6}
              className={cn(
                "relative mt-6 font-(family-name:--std-display) leading-[0.95]",
                script ? "text-[clamp(3.5rem,18cqw,8.5rem)]" : "text-[clamp(3rem,14cqw,7.5rem)] font-light",
              )}
              joinerClassName="text-[0.4em] italic text-(--std-accent)"
            />

            <Ornament className="relative mt-8" delay={1.3} />

            <motion.p
              className="relative mt-6 font-(family-name:--std-serif) text-[clamp(1.4rem,6cqw,2.4rem)] italic"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.5 }}
            >
              {eventDate.long}
            </motion.p>

            {content.location && (
              <motion.p
                className="relative mt-3 font-(family-name:--std-sans) text-xs uppercase tracking-[0.3em] opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1, delay: 1.8 }}
              >
                {content.location}
              </motion.p>
            )}

            <ScrollCue className="text-(--std-accent)" delay={2.4} />
          </section>

          {content.photo_url && (
            <section className="relative px-6 pb-24">
              <ArchPhoto src={content.photo_url} alt={content.names} />
            </section>
          )}

          {content.message && (
            <section className="relative mx-auto max-w-xl px-8 pb-24 text-center">
              <Reveal>
                <p className="whitespace-pre-line font-(family-name:--std-serif) text-[clamp(1.25rem,5cqw,1.6rem)] leading-relaxed">
                  {content.message}
                </p>
              </Reveal>
            </section>
          )}

          {content.show_countdown && (
            <section className="relative px-4 pb-24">
              <Reveal>
                <Countdown
                  date={date}
                  className="gap-2 @md:gap-5"
                  unitClassName="aspect-square w-[clamp(4.25rem,20cqw,7rem)] justify-center rounded-full border border-(--std-accent)/40"
                  valueClassName="font-(family-name:--std-serif) text-[clamp(1.5rem,7cqw,2.75rem)] leading-none"
                  labelClassName="mt-1 font-(family-name:--std-sans) text-[0.55rem] uppercase tracking-[0.2em] opacity-60"
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
                  buttonClassName="text-(--std-accent)"
                />
              </Reveal>
            </section>
          )}

          <footer className="relative flex flex-col items-center gap-4 px-6 pb-16 text-center">
            <Reveal className="flex flex-col items-center gap-4">
              <Wreath names={content.names} className="w-28" />
              <InvitationToFollow />
            </Reveal>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
