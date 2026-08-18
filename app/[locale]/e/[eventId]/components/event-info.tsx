"use client";

interface EventInfoProps {
  welcomeMessage: string | null;
}

export function EventInfo({ welcomeMessage }: EventInfoProps) {
  if (!welcomeMessage) return null;

  return (
    <section className="px-4 py-8 text-center">
      <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground italic">
        &ldquo;{welcomeMessage}&rdquo;
      </p>
    </section>
  );
}
