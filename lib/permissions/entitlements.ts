import type { PlanId } from "@/lib/pricing";

const MB = 1024 ** 2;
const GB = 1024 ** 3;

/**
 * Every capability the app can gate on. Some are declared before they exist so
 * the pricing table can advertise them and wiring them up later is a single
 * `hasFeature` call at the new call site.
 */
export const PLAN_FEATURES = [
  "guestUploads",
  "photoGallery",
  "qrCode",
  "customBranding",
  "schedule",
  "menu",
  "videoUploads",
  "qrTableCards",
  "findYourTable",
  "saveTheDate",
  "weddingGames",
] as const;

export type PlanFeature = (typeof PLAN_FEATURES)[number];

export type PlanLimits = {
  /** Total bytes of guest uploads allowed for one event. */
  storageBytes: number;
  /** Largest single file a guest may upload. */
  maxFileBytes: number;
  /** Days after the wedding date during which guests can still upload. */
  guestAccessDays: number;
  /** Days after the wedding date during which the couple can download. */
  downloadDays: number;
  /** Printed QR table cards included in the package. */
  qrTableCards: number;
};

export type PlanEntitlement = {
  features: readonly PlanFeature[];
  limits: PlanLimits;
};

/**
 * Single source of truth for what each plan allows. The UI, the server actions
 * and the marketing feature bullets all read from here, so changing a limit is
 * a one-line edit that propagates everywhere.
 */
export const PLAN_ENTITLEMENTS = {
  basic: {
    features: ["guestUploads", "photoGallery", "qrCode"],
    limits: {
      storageBytes: 100 * GB,
      maxFileBytes: 50 * MB,
      guestAccessDays: 3,
      downloadDays: 14,
      qrTableCards: 0,
    },
  },
  silver: {
    features: [
      "guestUploads",
      "photoGallery",
      "qrCode",
      "customBranding",
      "schedule",
      "menu",
    ],
    limits: {
      storageBytes: 400 * GB,
      maxFileBytes: 100 * MB,
      guestAccessDays: 5,
      downloadDays: 30,
      qrTableCards: 0,
    },
  },
  gold: {
    features: [
      "guestUploads",
      "photoGallery",
      "qrCode",
      "customBranding",
      "schedule",
      "menu",
      "videoUploads",
      "qrTableCards",
      "findYourTable",
      "saveTheDate",
      "weddingGames",
    ],
    limits: {
      storageBytes: 800 * GB,
      maxFileBytes: 200 * MB,
      guestAccessDays: 14,
      downloadDays: 90,
      qrTableCards: 3,
    },
  },
} as const satisfies Record<PlanId, PlanEntitlement>;

export const DEFAULT_PLAN_ID: PlanId = "basic";
