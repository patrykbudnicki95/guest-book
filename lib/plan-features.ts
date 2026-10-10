import { formatBytes, getLimits } from "./permissions";
import { APPS_TOTAL_PRICE, PRODUCTS, formatPrice, type ProductId } from "./pricing";

type TranslationValues = Record<string, string | number>;
type Translator = (key: string, values?: TranslationValues) => string;

/**
 * Numbers that appear in marketing copy, taken from the same entitlements and
 * prices the server enforces. Copy uses ICU placeholders so a limit or price
 * change cannot leave the site promising something the app rejects.
 */
export function productCopyValues(): TranslationValues {
  const guestbook = getLimits(["guestbook"]);
  const seating = getLimits(["seating"]);

  return {
    downloadDays: guestbook.downloadDays,
    guestAccessDays: guestbook.guestAccessDays,
    qrTableCards: guestbook.qrTableCards,
    storage: formatBytes(guestbook.storageBytes),
    maxFileSize: formatBytes(guestbook.maxFileBytes),
    seatingTables: seating.seatingTables,
    guestbookPrice: formatPrice(PRODUCTS.guestbook.price),
    saveTheDatePrice: formatPrice(PRODUCTS.saveTheDate.price),
    seatingPrice: formatPrice(PRODUCTS.seating.price),
    goldPrice: formatPrice(PRODUCTS.gold.price),
    appsTotalPrice: formatPrice(APPS_TOTAL_PRICE),
  };
}

/**
 * Feature bullets stay in the message files (they are marketing copy) while the
 * number of bullets per product comes from `lib/pricing.ts` and the numbers
 * inside them come from the entitlements.
 */
export function productFeatures(t: Translator, productId: ProductId): string[] {
  const values = productCopyValues();

  return Array.from({ length: PRODUCTS[productId].featureCount }, (_, index) =>
    t(`pricing.${productId}.features.${index + 1}`, values),
  );
}
