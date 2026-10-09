"use client";

import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import type { SaveTheDateContent, SaveTheDateTemplate } from "@/lib/schemas/database";
import { fontVariables } from "./fonts";
import { MusicToggle } from "./parts";
import { EnvelopeTemplate } from "./templates/envelope";
import { EditorialTemplate } from "./templates/editorial";
import { PolaroidTemplate } from "./templates/polaroid";
import { BotanicalTemplate } from "./templates/botanical";
import type { SaveTheDateTemplateProps } from "./types";

const TEMPLATES: Record<SaveTheDateTemplate, (props: SaveTheDateTemplateProps) => React.ReactNode> = {
  envelope: EnvelopeTemplate,
  editorial: EditorialTemplate,
  polaroid: PolaroidTemplate,
  botanical: BotanicalTemplate,
};

/**
 * The guest-facing save the date. It sizes itself with container queries and
 * `cqh`, so the same component fills the phone on the guest page and fits
 * inside the dashboard and marketing previews (see `device-frame.tsx`).
 */
export function SaveTheDateView({
  template,
  content,
  date,
}: {
  template: SaveTheDateTemplate;
  content: SaveTheDateContent;
  date: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const Template = TEMPLATES[template];

  // Browsers only allow sound after a user gesture, so the template's
  // "open" tap is where the music starts.
  const handleOpen = () => {
    setOpened(true);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.6;
      void audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="@container relative min-h-[100cqh] overflow-x-clip bg-(--std-bg) font-(family-name:--std-sans) text-(--std-text)"
        style={{
          "--std-bg": content.colors.background,
          "--std-text": content.colors.text,
          "--std-accent": content.colors.accent,
          ...fontVariables(content.font),
        } as React.CSSProperties}
      >
        <Template content={content} date={date} onOpen={handleOpen} />

        {content.music_url && (
          <>
            <audio ref={audioRef} src={content.music_url} loop preload="none" />
            {opened && <MusicToggle playing={playing} onToggle={toggleMusic} />}
          </>
        )}
      </div>
    </MotionConfig>
  );
}
