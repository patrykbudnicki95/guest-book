import { PLAN_IDS, type PlanId } from "@/lib/pricing";
import {
  PLAN_ENTITLEMENTS,
  type PlanFeature,
  type PlanLimits,
} from "./entitlements";

export {
  DEFAULT_PLAN_ID,
  PLAN_ENTITLEMENTS,
  PLAN_FEATURES,
  type PlanEntitlement,
  type PlanFeature,
  type PlanLimits,
} from "./entitlements";

export function getLimits(plan: PlanId): PlanLimits {
  return PLAN_ENTITLEMENTS[plan].limits;
}

export function hasFeature({
  plan,
  feature,
}: {
  plan: PlanId;
  feature: PlanFeature;
}): boolean {
  return (PLAN_ENTITLEMENTS[plan].features as readonly PlanFeature[]).includes(
    feature,
  );
}

/**
 * The cheapest plan that includes the feature, for "available in Silver" copy.
 * Relies on PLAN_IDS being ordered from cheapest to most complete.
 */
export function getMinimumPlanFor(feature: PlanFeature): PlanId | null {
  return PLAN_IDS.find((plan) => hasFeature({ plan, feature })) ?? null;
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

export function getUploadWindowEnd({
  plan,
  eventDate,
}: {
  plan: PlanId;
  eventDate: string;
}): Date {
  return endOfDayAfter(eventDate, getLimits(plan).guestAccessDays);
}

/**
 * Open until the guest access window closes. There is deliberately no lower
 * bound, so couples can test the guestbook before the wedding.
 */
export function isGuestUploadOpen({
  plan,
  eventDate,
  now = new Date(),
}: {
  plan: PlanId;
  eventDate: string;
  now?: Date;
}): boolean {
  return now <= getUploadWindowEnd({ plan, eventDate });
}

export function getDownloadWindowEnd({
  plan,
  eventDate,
}: {
  plan: PlanId;
  eventDate: string;
}): Date {
  return endOfDayAfter(eventDate, getLimits(plan).downloadDays);
}

export function isDownloadOpen({
  plan,
  eventDate,
  now = new Date(),
}: {
  plan: PlanId;
  eventDate: string;
  now?: Date;
}): boolean {
  return now <= getDownloadWindowEnd({ plan, eventDate });
}

export type StorageState = {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  percentUsed: number;
};

export function getStorageState({
  plan,
  usedBytes,
}: {
  plan: PlanId;
  usedBytes: number;
}): StorageState {
  const totalBytes = getLimits(plan).storageBytes;
  const safeUsed = Math.max(0, usedBytes);

  return {
    usedBytes: safeUsed,
    totalBytes,
    remainingBytes: Math.max(0, totalBytes - safeUsed),
    percentUsed: Math.min(100, Math.round((safeUsed / totalBytes) * 100)),
  };
}

export type UploadRejectionReason =
  | "eventInactive"
  | "windowClosed"
  | "mediaTypeNotAllowed"
  | "fileTooLarge"
  | "quotaExceeded";

export type UploadCheckResult =
  | { allowed: true }
  | { allowed: false; reason: UploadRejectionReason };

/**
 * The one place that decides whether a guest upload may proceed. Both the
 * presign action and the post-upload save call this, and the guest UI mirrors it
 * for feedback.
 */
export function checkUploadAllowed({
  plan,
  eventDate,
  isActive,
  usedBytes,
  fileBytes,
  mediaType,
  now = new Date(),
}: {
  plan: PlanId;
  eventDate: string;
  isActive: boolean;
  usedBytes: number;
  fileBytes: number;
  mediaType: "image" | "video";
  now?: Date;
}): UploadCheckResult {
  if (!isActive) {
    return { allowed: false, reason: "eventInactive" };
  }

  if (!isGuestUploadOpen({ plan, eventDate, now })) {
    return { allowed: false, reason: "windowClosed" };
  }

  if (mediaType === "video" && !hasFeature({ plan, feature: "videoUploads" })) {
    return { allowed: false, reason: "mediaTypeNotAllowed" };
  }

  const limits = getLimits(plan);

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
