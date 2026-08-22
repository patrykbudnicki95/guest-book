import { formatBytes, getLimits } from "./permissions";
import { PLANS, PLAN_IDS, type PlanId } from "./pricing";

type TranslationValues = Record<string, string | number>;
type Translator = (key: string, values?: TranslationValues) => string;

/**
 * Numbers that appear in marketing copy, taken from the same entitlements the
 * server enforces. Copy uses ICU placeholders so a limit change cannot leave the
 * pricing page promising something the app rejects.
 */
export function planCopyValues(planId: PlanId): TranslationValues {
  const limits = getLimits(planId);

  return {
    downloadDays: limits.downloadDays,
    guestAccessDays: limits.guestAccessDays,
    qrTableCards: limits.qrTableCards,
    storage: formatBytes(limits.storageBytes),
    maxFileSize: formatBytes(limits.maxFileBytes),
  };
}

/** Ranges for copy that talks about all plans at once, such as the FAQ. */
export function planRangeValues(): TranslationValues {
  const downloadDays = PLAN_IDS.map((id) => getLimits(id).downloadDays);
  const guestAccessDays = PLAN_IDS.map((id) => getLimits(id).guestAccessDays);
  const storage = PLAN_IDS.map((id) => getLimits(id).storageBytes);

  return {
    minDownloadDays: Math.min(...downloadDays),
    maxDownloadDays: Math.max(...downloadDays),
    minGuestAccessDays: Math.min(...guestAccessDays),
    maxGuestAccessDays: Math.max(...guestAccessDays),
    minStorage: formatBytes(Math.min(...storage)),
    maxStorage: formatBytes(Math.max(...storage)),
  };
}

/**
 * Feature bullets stay in the message files (they are marketing copy) while the
 * number of bullets per plan comes from `lib/pricing.ts` and the numbers inside
 * them come from the entitlements.
 */
export function planFeatures(t: Translator, planId: PlanId): string[] {
  const values = planCopyValues(planId);

  return Array.from({ length: PLANS[planId].featureCount }, (_, index) =>
    t(`pricing.${planId}.features.${index + 1}`, values),
  );
}
