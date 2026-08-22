import { PLANS, type PlanId } from "./pricing";

type Translator = (key: string) => string;

/**
 * Feature bullets stay in the message files (they are marketing copy) while the
 * number of bullets per plan comes from `lib/pricing.ts`.
 */
export function planFeatures(t: Translator, planId: PlanId): string[] {
  return Array.from({ length: PLANS[planId].featureCount }, (_, index) =>
    t(`pricing.${planId}.features.${index + 1}`),
  );
}
