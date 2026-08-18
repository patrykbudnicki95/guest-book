"use client";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PlanId = "basic" | "silver" | "gold";

type PricingCardProps = {
  planId: PlanId;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

export function PricingCard({
  planId,
  title,
  description,
  price,
  originalPrice,
  features,
  cta,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all ${
        highlighted
          ? "scale-[1.02] border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20"
          : "border-border shadow-sm hover:shadow-md"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-md">
            {description}
          </Badge>
        </div>
      )}

      <div className={`mb-4 ${highlighted ? "pt-2" : ""}`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        {!highlighted && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-lg text-muted-foreground">zł</span>
        <span className="ml-1 text-sm text-muted-foreground line-through">
          {originalPrice} zł
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-3 text-primary" />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={`w-full rounded-full ${
          highlighted
            ? "bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90"
            : "border-primary/20 text-primary hover:bg-primary/5"
        }`}
        variant={highlighted ? "default" : "outline"}
        size="lg"
      >
        <Link href={`/signup?plan=${planId}`}>{cta}</Link>
      </Button>
    </div>
  );
}
