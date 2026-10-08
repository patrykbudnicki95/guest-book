import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

/**
 * The locale comes from the `[locale]` root param, which Next knows at build
 * time, so pages prerender statically. Root params aren't available in Server
 * Actions, so those pass the locale explicitly (`getTranslations({ locale })`).
 */
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const paramValue = await rootLocale();

    if (!hasLocale(routing.locales, paramValue)) {
      notFound();
    }

    locale = paramValue;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
