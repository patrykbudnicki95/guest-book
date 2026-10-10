"use client";

import { useTranslations } from "next-intl";
import { Armchair, BookHeart, CalendarHeart, Crown, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  APPS_TOTAL_PRICE,
  APP_IDS,
  PRODUCTS,
  formatPrice,
  ownedApps,
  type AppId,
  type ProductId,
} from "@/lib/pricing";

const APP_ICONS: Record<AppId, typeof BookHeart> = {
  guestbook: BookHeart,
  saveTheDate: CalendarHeart,
  seating: Armchair,
};

interface DiscoverAppsProps {
  products: readonly ProductId[];
  /** Demo only: "buys" the product on the spot, so its tabs appear in the navigation. */
  onAdd?: (product: ProductId) => void;
}

/**
 * The apps the couple doesn't own yet, plus Gold. Kept on the overview so the
 * navigation stays limited to what they bought.
 */
export function DiscoverApps({ products, onAdd }: DiscoverAppsProps) {
  const t = useTranslations("dashboard.discover");
  const tProducts = useTranslations("products");
  const owned = ownedApps(products);
  const missing = APP_IDS.filter((app) => !owned.includes(app));

  if (missing.length === 0) {
    return null;
  }

  const action = (product: ProductId, primary: boolean) =>
    onAdd ? (
      <Button
        size="sm"
        variant={primary ? "default" : "outline"}
        className="rounded-full"
        onClick={() => onAdd(product)}
      >
        <Plus className="mr-1.5 size-3.5" />
        {t("addInDemo")}
      </Button>
    ) : (
      <>
        <Button asChild size="sm" variant={primary ? "default" : "outline"} className="rounded-full">
          <Link href="/pricing">{t("buy")}</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href={{ pathname: "/demo/dashboard", query: { apps: product } }} target="_blank">
            {t("tryDemo")}
          </Link>
        </Button>
      </>
    );

  return (
    <Card className="rounded-xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {missing.map((app) => {
            const Icon = APP_ICONS[app];
            return (
              <div key={app} className="flex flex-col rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(PRODUCTS[app].price)}</span>
                </div>
                <p className="mt-3 font-semibold">{tProducts(`${app}.name`)}</p>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">
                  {tProducts(`${app}.tagline`)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">{action(app, false)}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Crown className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{t("goldTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("goldDescription", {
                  price: formatPrice(PRODUCTS.gold.price),
                  total: formatPrice(APPS_TOTAL_PRICE),
                })}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">{action("gold", true)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
