"use client";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card
      className={`relative flex h-full flex-col ${highlighted ? "border-primary shadow-md" : ""}`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>{description}</Badge>
        </div>
      )}
      <CardHeader className={highlighted ? "pt-6" : ""}>
        <CardTitle className="text-xl">{title}</CardTitle>
        {!highlighted && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{price} zł</span>
          <span className="text-muted-foreground line-through text-sm">
            {originalPrice} zł
          </span>
        </div>
        <ul className="space-y-2 text-sm">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="mt-auto w-full" variant={highlighted ? "default" : "outline"}>
          <Link href={`/signup?plan=${planId}`}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
