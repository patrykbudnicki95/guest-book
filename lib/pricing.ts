import type { StaticAppPathname } from "@/i18n/routing";

/**
 * The apps a couple can own. Each one is sold on its own and has its own
 * entitlements in `lib/permissions/entitlements.ts`.
 */
export const APP_IDS = ["guestbook", "saveTheDate", "seating"] as const;

export type AppId = (typeof APP_IDS)[number];

/** What can be bought (`events.products`): every app, plus Gold, which grants all of them. */
export const PRODUCT_IDS = [...APP_IDS, "gold"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export type Product = {
  id: ProductId;
  price: number;
  featureCount: number;
  highlighted: boolean;
};

export const CURRENCY = "PLN";
export const CURRENCY_SYMBOL = "zł";

/**
 * Prices live here and nowhere else. Google treats a mismatch between the price
 * rendered on the page and the price in Product structured data as invalid markup,
 * so the pricing cards and the JSON-LD all read from this map.
 *
 * Placeholders until the keyword and competitor research is in (see
 * `docs/product/roadmap.md`). Gold costs about as much as two apps, so it's the
 * obvious pick once a couple wants a second one.
 */
export const PRODUCTS: Record<ProductId, Product> = {
  guestbook: { id: "guestbook", price: 249, featureCount: 6, highlighted: false },
  saveTheDate: { id: "saveTheDate", price: 100, featureCount: 5, highlighted: false },
  seating: { id: "seating", price: 99, featureCount: 4, highlighted: false },
  gold: { id: "gold", price: 349, featureCount: 5, highlighted: true },
};

export const PRODUCT_LIST: Product[] = PRODUCT_IDS.map((id) => PRODUCTS[id]);

/** What the apps cost bought one by one, to show what Gold saves. */
export const APPS_TOTAL_PRICE = APP_IDS.reduce((sum, id) => sum + PRODUCTS[id].price, 0);

/** The cheapest way in, for "from X zł" copy. */
export const LOWEST_PRICE = Math.min(...PRODUCT_LIST.map((product) => product.price));

/**
 * The apps a list of purchases unlocks. Gold unlocks every app, including ones
 * added after the purchase.
 */
export function ownedApps(products: readonly ProductId[]): AppId[] {
  return products.includes("gold")
    ? [...APP_IDS]
    : APP_IDS.filter((app) => products.includes(app));
}

export function isProductId(value: string): value is ProductId {
  return (PRODUCT_IDS as readonly string[]).includes(value);
}

export function formatPrice(amount: number): string {
  return `${amount} ${CURRENCY_SYMBOL}`;
}

/** Products that already have a marketing landing page. */
export const PRODUCT_PAGES: Partial<Record<ProductId, StaticAppPathname>> = {
  guestbook: "/virtual-guestbook",
  saveTheDate: "/save-the-date",
};
