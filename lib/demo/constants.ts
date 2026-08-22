export const DEMO_DB_NAME = "wkg-demo";
export const DEMO_DB_VERSION = 1;

/** Stable UUID so EventFullSchema and dashboard types accept the demo event. */
export const DEMO_EVENT_ID = "00000000-0000-4000-8000-0000000000de";

export const DEMO_MAX_UPLOADS = 20;
export const DEMO_MAX_FILE_BYTES = 8 * 1024 * 1024;

export const DEMO_COVER_KEY = "cover";
export const DEMO_COVER_SENTINEL = "local:cover";

/** Sample hero in `public/images`. Used until the visitor uploads their own. */
export const DEMO_COVER_FALLBACK = "/images/demo-hero.jpeg";

export function isStoredDemoCover(url: string | null | undefined): boolean {
  return url === DEMO_COVER_SENTINEL || Boolean(url?.startsWith("blob:"));
}
