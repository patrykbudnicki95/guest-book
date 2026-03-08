import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

type Testimonial = {
  quote: string;
  author: string;
};

type TestimonialsProps = {
  title: string;
  items: Testimonial[];
};

export function Testimonials({ title, items }: TestimonialsProps) {
  return (
    <section className="border-t py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold">{title}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Quote className="text-muted-foreground mb-2 size-8" />
                <p className="mb-4 text-sm italic">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-muted-foreground text-sm font-medium">
                  — {item.author}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
