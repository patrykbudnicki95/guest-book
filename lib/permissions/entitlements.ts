import type { AppId } from "@/lib/pricing";

const MB = 1024 ** 2;
const GB = 1024 ** 3;

/** Every capability the app can gate on. Each belongs to exactly one app. */
export const FEATURES = [
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
] as const;

export type Feature = (typeof FEATURES)[number];

export type Limits = {
  /** Total bytes of guest uploads allowed for one event. */
  storageBytes: number;
  /** Largest single file a guest may upload. */
  maxFileBytes: number;
  /** Days after the wedding date during which guests can still upload. */
  guestAccessDays: number;
  /** Days after the wedding date during which the couple can download. */
  downloadDays: number;
  /** Printed QR table cards included. */
  qrTableCards: number;
  /** Tables in the "find your table" seating plan. */
  seatingTables: number;
};

export type AppEntitlement = {
  features: readonly Feature[];
  /** Only the limits this app is about; the rest stay at zero. */
  limits: Partial<Limits>;
};

/**
 * Single source of truth for what each app allows. The UI, the server actions
 * and the marketing feature bullets all read from here, so changing a limit is
 * a one-line edit that propagates everywhere. Gold is not listed: it grants
 * every app (see `ownedApps` in `lib/pricing.ts`).
 */
export const APP_ENTITLEMENTS = {
  guestbook: {
    features: [
      "guestUploads",
      "photoGallery",
      "qrCode",
      "customBranding",
      "schedule",
      "menu",
      "videoUploads",
      "qrTableCards",
    ],
    limits: {
      storageBytes: 800 * GB,
      maxFileBytes: 200 * MB,
      guestAccessDays: 14,
      downloadDays: 90,
      qrTableCards: 3,
    },
  },
  saveTheDate: {
    features: ["saveTheDate"],
    limits: {},
  },
  seating: {
    features: ["findYourTable"],
    limits: { seatingTables: 100 },
  },
} as const satisfies Record<AppId, AppEntitlement>;

/** An event that owns nothing gets nothing. */
export const NO_LIMITS: Limits = {
  storageBytes: 0,
  maxFileBytes: 0,
  guestAccessDays: 0,
  downloadDays: 0,
  qrTableCards: 0,
  seatingTables: 0,
};
