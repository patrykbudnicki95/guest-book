"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  title: string;
  subtitle?: string;
  items: FAQItem[];
};

export function FAQ({ title, subtitle, items }: FAQProps) {
  return (
    <section className="bg-muted/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-2xl space-y-3"
        >
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border bg-white px-6 shadow-sm data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="py-5 text-left font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
