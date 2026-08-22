import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PLAN_LIST } from "@/lib/pricing";
import { Heart } from "lucide-react";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tPricing = await getTranslations("landing.pricing");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Heart className="size-4 fill-primary text-primary" />
              <span className="font-semibold">
                Wirtualna{" "}
                <span className="font-script italic text-primary">
                  Księga Gości
                </span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("product")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/virtual-guestbook"
                  className="transition-colors hover:text-foreground"
                >
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition-colors hover:text-foreground"
                >
                  {t("pricing")}
                </Link>
              </li>
              {PLAN_LIST.map((plan) => (
                <li key={plan.id}>
                  <Link
                    href={{
                      pathname: "/packages/[plan]",
                      params: { plan: plan.id },
                    }}
                    className="transition-colors hover:text-foreground"
                  >
                    {tPricing(`${plan.id}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">{t("company")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/guides"
                  className="transition-colors hover:text-foreground"
                >
                  {t("guides")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-foreground"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-foreground"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {year} Wirtualna Księga Gości. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
