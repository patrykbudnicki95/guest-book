import type { AppLocale } from "@/i18n/routing";

const FALLBACK_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    return FALLBACK_URL;
  }

  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

  return withProtocol.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Wirtualna Księga Gości",
  url: resolveSiteUrl(),
  /** Empty until a real address exists — never emitted as fake contact data. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "",
  twitterHandle: "",
} as const;

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const OG_LOCALES: Record<AppLocale, string> = {
  pl: "pl_PL",
  en: "en_US",
};

export function absoluteUrl(path: string): string {
  if (!path || path === "/") {
    return `${siteConfig.url}/`;
  }

  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
