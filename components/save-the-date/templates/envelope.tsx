"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
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
import { ArchPhoto, Grain, Monogram, Ornament, ScrollCue, StackedNames } from "../decor";
import type { SaveTheDateTemplateProps } from "../types";

type Stage = "closed" | "opening" | "open";

const shade = (percent: number, mix: "black" | "white") =>
  `color-mix(in oklab, var(--std-accent) ${percent}%, ${mix})`;

/**
 * A wax-sealed envelope. The tap breaks the seal, the flap folds back, the card
 * slides out, and the page unfolds from it.
 */
export function EnvelopeTemplate({ content, date, onOpen }: SaveTheDateTemplateProps) {
  const t = useTranslations("saveTheDate.view");
  const [stage, setStage] = useState<Stage>("closed");
  const [flapBehind, setFlapBehind] = useState(false);
  const eventDate = useEventDate(date);
  const script = isScriptFont(content.font);

  const open = () => {
    if (stage !== "closed") return;
    onOpen();
    setStage("opening");
    window.setTimeout(() => setFlapBehind(true), 450);
  };

  return (
    <AnimatePresence mode="wait">
      {stage !== "open" ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative flex min-h-[100cqh] w-full flex-col items-center justify-center gap-12 overflow-hidden px-6"
        >
          <Grain />
          <motion.p
            className="font-(family-name:--std-serif) text-xl italic opacity-80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: stage === "closed" ? 0.8 : 0, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
          >
            {t("envelopeLead")}
          </motion.p>

          <motion.div
            className="relative aspect-[3/2] w-[min(84cqw,27rem)]"
            style={{ perspective: 1400 }}
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={
              stage === "opening"
                ? { opacity: 1, y: "22%", rotate: 0 }
                : { opacity: 1, y: 0, rotate: -2 }
            }
            transition={{ duration: stage === "opening" ? 1.2 : 1.1, ease: EASE, delay: stage === "opening" ? 0.8 : 0.2 }}
          >
            <div
              className="absolute inset-0 rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
              style={{ background: shade(78, "black") }}
            />

            <motion.div
              className="absolute inset-x-[5%] bottom-[5%] top-[5%] z-10 flex flex-col items-center justify-center rounded-sm bg-(--std-bg) px-4 text-center shadow-md"
              animate={{ y: stage === "opening" ? "-58%" : 0 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.75 }}
              onAnimationComplete={() => {
                if (stage === "opening") window.setTimeout(() => setStage("open"), 650);
              }}
            >
              <span className="font-(family-name:--std-sans) text-[0.55rem] uppercase tracking-[0.35em] text-(--std-accent)">
                {content.eyebrow}
              </span>
              <span
                className={cn(
                  "mt-1 font-(family-name:--std-display) leading-tight",
                  script ? "text-[clamp(1.6rem,8cqw,2.6rem)]" : "text-[clamp(1.2rem,6cqw,2rem)]",
                )}
              >
                {content.names}
              </span>
              <span className="mt-1 font-(family-name:--std-serif) text-sm italic opacity-70">
                {eventDate.long}
              </span>
            </motion.div>

            <div
              className="absolute inset-0 z-20 rounded-md"
              style={{
                background: `linear-gradient(160deg, ${shade(96, "white")}, ${shade(100, "black")})`,
                clipPath: "polygon(0 0, 50% 54%, 100% 0, 100% 100%, 0 100%)",
              }}
            />

            <motion.div
              className="absolute inset-x-0 top-0 h-[60%] origin-top"
              style={{
                zIndex: flapBehind ? 5 : 30,
                background: `linear-gradient(180deg, ${shade(88, "white")}, ${shade(94, "black")})`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transformStyle: "preserve-3d",
              }}
              animate={{ rotateX: stage === "opening" ? 180 : 0 }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            />

            <motion.div
              className="absolute left-1/2 top-[60%] z-40 flex size-[clamp(3.5rem,16cqw,4.75rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-(family-name:--std-serif) text-[clamp(0.9rem,4cqw,1.2rem)] italic text-(--std-bg) shadow-[inset_0_2px_6px_rgba(255,255,255,0.25),0_6px_14px_rgba(0,0,0,0.35)]"
              style={{ background: `radial-gradient(circle at 35% 30%, ${shade(80, "white")}, ${shade(62, "black")})` }}
              animate={
                stage === "opening"
                  ? { scale: [1, 1.15, 0], opacity: [1, 1, 0], rotate: 25 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="absolute inset-1.5 rounded-full border border-(--std-bg)/35" />
              {initialsOf(content.names).join("&")}
            </motion.div>
          </motion.div>

          <TapHint className={cn(stage !== "closed" && "invisible")} />
          <button
            type="button"
            onClick={open}
            disabled={stage !== "closed"}
            aria-label={t("open")}
            className="absolute inset-0 z-50 cursor-pointer"
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

          <section className="relative flex min-h-[100cqh] flex-col items-center justify-center px-6 py-20 text-center">
            <motion.p
              className="font-(family-name:--std-sans) text-[0.7rem] uppercase tracking-[0.4em] text-(--std-accent)"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            >
              {content.eyebrow}
            </motion.p>

            <StackedNames
              names={content.names}
              delay={0.4}
              className={cn(
                "mt-6 font-(family-name:--std-display) leading-[0.95]",
                script ? "text-[clamp(3.5rem,19cqw,9rem)]" : "text-[clamp(3rem,15cqw,8rem)]",
              )}
              joinerClassName="text-[0.45em] italic text-(--std-accent)"
            />

            <Ornament className="mt-8" delay={1.1} />

            <motion.p
              className="mt-6 font-(family-name:--std-serif) text-[clamp(1.5rem,6.5cqw,2.6rem)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.3 }}
            >
              {eventDate.long}
            </motion.p>

            {content.location && (
              <motion.p
                className="mt-3 font-(family-name:--std-sans) text-xs uppercase tracking-[0.3em] opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1, delay: 1.6 }}
              >
                {content.location}
              </motion.p>
            )}

            <ScrollCue className="text-(--std-accent)" />
          </section>

          {content.photo_url && (
            <section className="relative px-6 pb-24">
              <ArchPhoto src={content.photo_url} alt={content.names} />
            </section>
          )}

          {content.message && (
            <section className="relative mx-auto max-w-xl px-8 pb-24 text-center">
              <Reveal>
                <p className="whitespace-pre-line font-(family-name:--std-serif) text-[clamp(1.25rem,5cqw,1.65rem)] italic leading-relaxed">
                  {content.message}
                </p>
              </Reveal>
            </section>
          )}

          {content.show_countdown && (
            <section className="relative px-4 pb-24">
              <Reveal>
                <p className="mb-6 text-center font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.35em] text-(--std-accent)">
                  {t("countdownTitle")}
                </p>
                <Countdown
                  date={date}
                  className="gap-2 @md:gap-4"
                  unitClassName="w-[clamp(4rem,20cqw,6.5rem)] rounded-t-full border border-(--std-accent)/35 px-1 pb-4 pt-6"
                  valueClassName="font-(family-name:--std-serif) text-[clamp(1.75rem,8cqw,3rem)] leading-none"
                  labelClassName="mt-2 font-(family-name:--std-sans) text-[0.6rem] uppercase tracking-[0.2em] opacity-60"
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

          <footer className="relative flex flex-col items-center gap-5 pb-20">
            <Reveal className="flex flex-col items-center gap-5">
              <Monogram names={content.names} />
              <InvitationToFollow />
            </Reveal>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
