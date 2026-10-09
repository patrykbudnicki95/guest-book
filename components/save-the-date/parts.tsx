"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useFormatter, useTranslations, type DateTimeFormatOptions } from "next-intl";
import { CalendarPlus, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared easing: a long, soft settle that reads as "paper", not "app". */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its children in once they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The event date in every shape the templates need. `date` is a plain DATE, so
 * it is formatted in UTC to keep server and browser on the same day.
 */
export function useEventDate(date: string) {
  const format = useFormatter();
  const value = new Date(`${date}T00:00:00.000Z`);
  const part = (options: DateTimeFormatOptions) =>
    format.dateTime(value, { ...options, timeZone: "UTC" });

  return {
    long: part({ day: "numeric", month: "long", year: "numeric" }),
    weekday: part({ weekday: "long" }),
    day: part({ day: "2-digit" }),
    month: part({ month: "long" }),
    monthNumber: part({ month: "2-digit" }),
    year: part({ year: "numeric" }),
  };
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

/** Counts to local midnight of the wedding day; `null` until mounted. */
function useRemaining(date: string): Remaining | null | "today" | "past" {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  if (now === null) {
    return null;
  }

  const target = new Date(`${date}T00:00:00`).getTime();
  const diff = target - now;

  if (diff <= -24 * 60 * 60 * 1000) {
    return "past";
  }
  if (diff <= 0) {
    return "today";
  }

  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function Countdown({
  date,
  className,
  unitClassName,
  valueClassName,
  labelClassName,
}: {
  date: string;
  className?: string;
  unitClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
}) {
  const t = useTranslations("saveTheDate.view.countdown");
  const remaining = useRemaining(date);

  if (remaining === "past") {
    return null;
  }

  if (remaining === "today") {
    return (
      <p className={cn("text-center font-(family-name:--std-serif) text-3xl italic", className)}>
        {t("today")}
      </p>
    );
  }

  const units = [
    { key: "days", value: remaining?.days },
    { key: "hours", value: remaining?.hours },
    { key: "minutes", value: remaining?.minutes },
    { key: "seconds", value: remaining?.seconds },
  ] as const;

  return (
    <div className={cn("flex justify-center", className)} aria-live="off">
      {units.map((unit) => (
        <div key={unit.key} className={cn("flex flex-col items-center", unitClassName)}>
          <span className={cn("tabular-nums", valueClassName)}>
            {unit.value === undefined
              ? "–"
              : String(unit.value).padStart(unit.key === "days" ? 1 : 2, "0")}
          </span>
          <span className={labelClassName}>{t(unit.key)}</span>
        </div>
      ))}
    </div>
  );
}

function compactDate(date: string, offsetDays = 0): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + offsetDays);
  return value.toISOString().slice(0, 10).replaceAll("-", "");
}

function escapeIcs(text: string): string {
  return text.replace(/[\\,;]/g, (match) => `\\${match}`).replace(/\n/g, "\\n");
}

/** Google Calendar link plus an .ics file for Apple Calendar and Outlook. */
export function CalendarActions({
  names,
  date,
  location,
  className,
  buttonClassName,
}: {
  names: string;
  date: string;
  location: string;
  className?: string;
  buttonClassName?: string;
}) {
  const t = useTranslations("saveTheDate.view.calendar");
  const title = t("eventTitle", { names });
  const start = compactDate(date);
  const end = compactDate(date, 1);

  const googleUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    location,
    details: t("details"),
  }).toString()}`;

  const downloadIcs = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wirtualna Ksiega Gosci//Save the date//PL",
      "BEGIN:VEVENT",
      `UID:${start}-${encodeURIComponent(names)}@save-the-date`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcs(title)}`,
      location ? `LOCATION:${escapeIcs(location)}` : "",
      `DESCRIPTION:${escapeIcs(t("details"))}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "save-the-date.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  const button = cn(
    "inline-flex items-center justify-center gap-2 rounded-full border border-current px-5 py-3 font-(family-name:--std-sans) text-[0.7rem] font-medium uppercase tracking-[0.22em] transition-opacity hover:opacity-70",
    buttonClassName,
  );

  return (
    <div className={cn("flex flex-wrap justify-center gap-3", className)}>
      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={button}>
        <CalendarPlus className="size-3.5" />
        {t("google")}
      </a>
      <button type="button" onClick={downloadIcs} className={button}>
        <CalendarPlus className="size-3.5" />
        {t("apple")}
      </button>
    </div>
  );
}

/** Floating play/pause for the background track, with dancing bars while playing. */
export function MusicToggle({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("saveTheDate.view.music");

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={playing ? t("pause") : t("play")}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 1 }}
      className="fixed bottom-5 right-5 z-50 flex size-12 items-center justify-center rounded-full bg-(--std-text)/85 text-(--std-bg) shadow-lg backdrop-blur"
    >
      {playing ? (
        <span className="flex h-4 items-end gap-0.75" aria-hidden>
          {[0, 0.2, 0.4].map((delay) => (
            <motion.span
              key={delay}
              className="w-0.75 rounded-full bg-current"
              animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
              transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
            />
          ))}
        </span>
      ) : (
        <VolumeX className="size-5" />
      )}
    </motion.button>
  );
}

/** "Tap to open", breathing gently so it reads as an invitation, not a button. */
export function TapHint({ className }: { className?: string }) {
  const t = useTranslations("saveTheDate.view");

  return (
    <motion.span
      className={cn(
        "font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.3em]",
        className,
      )}
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      {t("tapToOpen")}
    </motion.span>
  );
}

export function InvitationToFollow({ className }: { className?: string }) {
  const t = useTranslations("saveTheDate.view");

  return (
    <p
      className={cn(
        "font-(family-name:--std-sans) text-[0.65rem] uppercase tracking-[0.3em] opacity-60",
        className,
      )}
    >
      {t("invitationToFollow")}
    </p>
  );
}
