import { Star } from "lucide-react";

type Testimonial = {
  quote: string;
  author: string;
};

type TestimonialsProps = {
  title: string;
  subtitle?: string;
  items: Testimonial[];
};

export function Testimonials({ title, subtitle, items }: TestimonialsProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
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
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {item.author.charAt(0)}
                </div>
                <p className="text-sm font-medium">{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
