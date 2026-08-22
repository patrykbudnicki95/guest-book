"use client";

import { Heart, MapPin, Calendar } from "lucide-react";
import { MediaImage } from "@/components/media-image";

interface EventHeroProps {
  names: string;
  date: string;
  coverPhotoUrl: string | null;
  location: string | null;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function EventHero({
  names,
  date,
  coverPhotoUrl,
  location,
}: EventHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {coverPhotoUrl ? (
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
          <MediaImage
            src={coverPhotoUrl}
            alt={names}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-linear-to-br from-primary via-primary to-pink-400 sm:aspect-[16/9] md:aspect-[21/9]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
          <Heart className="absolute size-48 fill-white/5 text-white/5" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white sm:p-10">
        <h1 className="mb-2 font-script text-3xl italic sm:text-4xl md:text-5xl">
          {names}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/80 sm:gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(date)}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
