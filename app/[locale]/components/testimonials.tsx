import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

const TESTIMONIALS = ["1", "2", "3"] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((id) => (
            <div
              key={id}
              className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-5 text-sm leading-relaxed text-foreground/80">
                &ldquo;{t(`${id}.quote`)}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {t(`${id}.author`).charAt(0)}
                </div>
                <p className="text-sm font-medium">{t(`${id}.author`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
