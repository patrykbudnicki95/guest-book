import { APP_IDS, ownedApps, type AppId, type ProductId } from "@/lib/pricing";
import {
  APP_ENTITLEMENTS,
  NO_LIMITS,
  type Feature,
  type Limits,
} from "./entitlements";

export {
  APP_ENTITLEMENTS,
  FEATURES,
  NO_LIMITS,
  type AppEntitlement,
  type Feature,
  type Limits,
} from "./entitlements";

/** `products` is always the event's `events.products`, Gold included. */
type Owned = { products: readonly ProductId[] };

export function hasApp({ products, app }: Owned & { app: AppId }): boolean {
  return ownedApps(products).includes(app);
}

export function hasFeature({ products, feature }: Owned & { feature: Feature }): boolean {
  return ownedApps(products).some((app) =>
    (APP_ENTITLEMENTS[app].features as readonly Feature[]).includes(feature),
  );
}

/** The most generous value of each limit across the owned apps. */
export function getLimits(products: readonly ProductId[]): Limits {
  return ownedApps(products).reduce<Limits>((limits, app) => {
    const appLimits: Partial<Limits> = APP_ENTITLEMENTS[app].limits;
    const merged = { ...limits };
    for (const key of Object.keys(appLimits) as (keyof Limits)[]) {
      merged[key] = Math.max(merged[key], appLimits[key] ?? 0);
    }
    return merged;
  }, NO_LIMITS);
}

/** The app that sells a feature, for "available in X" copy. */
export function getAppFor(feature: Feature): AppId | null {
  return (
    APP_IDS.find((app) =>
      (APP_ENTITLEMENTS[app].features as readonly Feature[]).includes(feature),
    ) ?? null
  );
}

/**
 * Windows are computed in UTC so the server and the browser always agree. The
 * event date is a plain `DATE` column, and the deadline runs to the end of the
 * last day.
 */
function endOfDayAfter(eventDate: string, days: number): Date {
  const end = new Date(`${eventDate}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + days);
  end.setUTCHours(23, 59, 59, 999);

  return end;
}

export function getUploadWindowEnd({ products, eventDate }: { products: readonly ProductId[]; eventDate: string }): Date {
  return endOfDayAfter(eventDate, getLimits(products).guestAccessDays);
}

/**
 * Open until the guest access window closes. There is deliberately no lower
 * bound, so couples can test the guestbook before the wedding.
 */
export function isGuestUploadOpen({
  products,
  eventDate,
  now = new Date(),
}: {
  products: readonly ProductId[];
  eventDate: string;
  now?: Date;
}): boolean {
  return now <= getUploadWindowEnd({ products, eventDate });
}

export function getDownloadWindowEnd({ products, eventDate }: { products: readonly ProductId[]; eventDate: string }): Date {
  return endOfDayAfter(eventDate, getLimits(products).downloadDays);
}

export function isDownloadOpen({
  products,
  eventDate,
  now = new Date(),
}: {
  products: readonly ProductId[];
  eventDate: string;
  now?: Date;
}): boolean {
  return now <= getDownloadWindowEnd({ products, eventDate });
}

export type StorageState = {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  percentUsed: number;
};

export function getStorageState({ products, usedBytes }: { products: readonly ProductId[]; usedBytes: number }): StorageState {
  const totalBytes = getLimits(products).storageBytes;
  const safeUsed = Math.max(0, usedBytes);

  return {
    usedBytes: safeUsed,
    totalBytes,
    remainingBytes: Math.max(0, totalBytes - safeUsed),
    percentUsed:
      totalBytes > 0 ? Math.min(100, Math.round((safeUsed / totalBytes) * 100)) : 0,
  };
}

/** Files a guest can attach to one entry. The same for every event. */
export const MAX_FILES_PER_ENTRY = 10;

/** Seats around one table in the seating plan. The same for every event. */
export const MAX_SEATS_PER_TABLE = 100;

export type UploadRejectionReason =
  | "eventInactive"
  | "windowClosed"
  | "mediaTypeNotAllowed"
  | "fileTooLarge"
  | "quotaExceeded";

export type UploadCheckResult = { allowed: true } | { allowed: false; reason: UploadRejectionReason };

/**
 * The one place that decides whether a guest upload may proceed. Both the
 * presign action and the post-upload save call this, and the guest UI mirrors it
 * for feedback.
 */
export function checkUploadAllowed({
  products,
  eventDate,
  isActive,
  usedBytes,
  fileBytes,
  mediaType,
  now = new Date(),
}: {
  products: readonly ProductId[];
  eventDate: string;
  isActive: boolean;
  usedBytes: number;
  fileBytes: number;
  mediaType: "image" | "video";
  now?: Date;
}): UploadCheckResult {
  // To a guest, an event without the guestbook app is simply not taking uploads.
  if (!isActive || !hasFeature({ products, feature: "guestUploads" })) {
    return { allowed: false, reason: "eventInactive" };
  }

  if (!isGuestUploadOpen({ products, eventDate, now })) {
    return { allowed: false, reason: "windowClosed" };
  }

  if (mediaType === "video" && !hasFeature({ products, feature: "videoUploads" })) {
    return { allowed: false, reason: "mediaTypeNotAllowed" };
  }

  const limits = getLimits(products);

  if (fileBytes <= 0 || fileBytes > limits.maxFileBytes) {
    return { allowed: false, reason: "fileTooLarge" };
  }

  if (usedBytes + fileBytes > limits.storageBytes) {
    return { allowed: false, reason: "quotaExceeded" };
  }

  return { allowed: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const decimals = value >= 100 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}
