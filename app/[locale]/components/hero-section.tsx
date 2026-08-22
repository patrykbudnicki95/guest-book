"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type HeroSectionProps = {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  ctaText: string;
  demoText: string;
};

export function HeroSection({
  title,
  titleAccent,
  subtitle,
  ctaText,
  demoText,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-pink-50/80 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              {title}{" "}
              <span className="font-script italic text-primary">
                {titleAccent}
              </span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/25">
                <Link href="/signup">{ctaText}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base"
              >
                <Link
                  href={{
                    pathname: "/e/[eventId]",
                    params: { eventId: "demo-event-123" },
                  }}
                >
                  {demoText}
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative mx-auto w-80">
              <div className="absolute -right-6 -top-6 h-72 w-72 rounded-full bg-primary/10" />
              <div className="absolute -bottom-4 -left-4 h-48 w-48 rounded-full bg-pink-100" />
              <div className="relative rotate-3 overflow-hidden rounded-2xl shadow-2xl transition-transform hover:rotate-0">
                <Image
                  src="https://placehold.co/400x500/fce7f3/ec4899?text=Wedding&font=playfair-display"
                  alt="Wedding guestbook"
                  width={400}
                  height={500}
                  className="h-auto w-full object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-8 -right-8 -rotate-6 overflow-hidden rounded-xl shadow-xl">
                <Image
                  src="https://placehold.co/200x250/fce7f3/ec4899?text=Photos&font=playfair-display"
                  alt="Guest photos"
                  width={200}
                  height={250}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
