import { defineRouting } from "next-intl/routing";

/**
 * Internal pathnames (the keys) match the folder structure under `app/[locale]`.
 * Marketing routes get localized slugs so Polish URLs read naturally while the
 * English versions stay in English. Every href passed to `Link` or `redirect`
 * must exist here.
 */
export const pathnames = {
  "/": "/",
  "/login": "/login",
  "/signup": "/signup",
  "/dashboard": "/dashboard",
  "/dashboard/gallery": "/dashboard/gallery",
  "/dashboard/settings": "/dashboard/settings",
  "/dashboard/qr-code": "/dashboard/qr-code",
  "/dashboard/event-page": "/dashboard/event-page",
  "/demo": "/demo",
  "/demo/dashboard": "/demo/dashboard",
  "/demo/dashboard/gallery": "/demo/dashboard/gallery",
  "/demo/dashboard/settings": "/demo/dashboard/settings",
  "/demo/dashboard/qr-code": "/demo/dashboard/qr-code",
  "/demo/dashboard/event-page": "/demo/dashboard/event-page",
  "/e/[eventId]": "/e/[eventId]",
  "/pricing": {
    pl: "/cennik",
    en: "/pricing",
  },
  "/packages/[plan]": {
    pl: "/pakiety/[plan]",
    en: "/packages/[plan]",
  },
  "/virtual-guestbook": {
    pl: "/wirtualna-ksiega-gosci",
    en: "/virtual-guestbook",
  },
  "/guides": {
    pl: "/poradnik",
    en: "/guides",
  },
  "/guides/[slug]": {
    pl: "/poradnik/[slug]",
    en: "/guides/[slug]",
  },
  "/about": {
    pl: "/o-nas",
    en: "/about",
  },
  "/contact": {
    pl: "/kontakt",
    en: "/contact",
  },
} as const;

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  pathnames,
});

export type AppPathname = keyof typeof pathnames;
export type AppLocale = (typeof routing.locales)[number];

/** Pathnames without dynamic segments, usable directly as a `Link` href. */
export type StaticAppPathname = {
  [K in AppPathname]: K extends `${string}[${string}]${string}` ? never : K;
}[AppPathname];
