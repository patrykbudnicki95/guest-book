import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/seo/config";
import { localizedUrl } from "@/lib/seo/metadata";
import { getTranslations } from "next-intl/server";
import { CURRENCY, PRODUCT_LIST } from "@/lib/pricing";
import { getGuidesForLocale } from "@/app/[locale]/guides/content";

/**
 * A plain-text summary for tools and assistants that fetch a site directly.
 * Generated so prices, URLs and the article list can never drift from the app.
 */
export async function GET() {
  const locale = routing.defaultLocale;
  const guides = getGuidesForLocale(locale);
  const tProducts = await getTranslations({ locale, namespace: "products" });

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    "Wirtualna księga gości weselnych: goście dodają zdjęcia, filmy i życzenia po zeskanowaniu kodu QR, bez instalowania aplikacji i bez zakładania konta. Para młoda pobiera wszystkie materiały po weselu.",
    "",
    "## Najważniejsze strony",
    `- Strona główna: ${localizedUrl("/", locale)}`,
    `- Jak to działa: ${localizedUrl("/virtual-guestbook", locale)}`,
    `- Save the date online: ${localizedUrl("/save-the-date", locale)}`,
    `- Cennik: ${localizedUrl("/pricing", locale)}`,
    `- Poradnik: ${localizedUrl("/guides", locale)}`,
    `- O nas: ${localizedUrl("/about", locale)}`,
    `- Kontakt: ${localizedUrl("/contact", locale)}`,
    "",
    `## Aplikacje (cennik: ${localizedUrl("/pricing", locale)})`,
  ];

  for (const product of PRODUCT_LIST) {
    lines.push(
      `- ${tProducts(`${product.id}.name`)}: ${product.price} ${CURRENCY} — ${tProducts(`${product.id}.tagline`)}`,
    );
  }

  if (guides.length > 0) {
    lines.push("", "## Poradniki");

    for (const guide of guides) {
      const url = localizedUrl(
        { pathname: "/guides/[slug]", params: { slug: guide.slug } },
        locale,
      );
      lines.push(`- ${guide.title}: ${url}`);
    }
  }

  if (siteConfig.contactEmail) {
    lines.push("", `Kontakt: ${siteConfig.contactEmail}`);
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
