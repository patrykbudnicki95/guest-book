export const PLAN_IDS = ["basic", "silver", "gold"] as const;

export type PlanId = (typeof PLAN_IDS)[number];

export type Plan = {
  id: PlanId;
  price: number;
  originalPrice: number;
  featureCount: number;
  highlighted: boolean;
};

export const CURRENCY = "PLN";
export const CURRENCY_SYMBOL = "zł";

/**
 * Prices live here and nowhere else. Google treats a mismatch between the price
 * rendered on the page and the price in Product structured data as invalid markup,
 * so the pricing cards, the package pages and the JSON-LD all read from this map.
 */
export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    price: 299,
    originalPrice: 399,
    featureCount: 5,
    highlighted: false,
  },
  silver: {
    id: "silver",
    price: 399,
    originalPrice: 499,
    featureCount: 5,
    highlighted: true,
  },
  gold: {
    id: "gold",
    price: 499,
    originalPrice: 599,
    featureCount: 6,
    highlighted: false,
  },
};

export const PLAN_LIST: Plan[] = PLAN_IDS.map((id) => PLANS[id]);

export function isPlanId(value: string): value is PlanId {
  return PLAN_IDS.includes(value as PlanId);
}

export function formatPrice(amount: number): string {
  return `${amount} ${CURRENCY_SYMBOL}`;
}
