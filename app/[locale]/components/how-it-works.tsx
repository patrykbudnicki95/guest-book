import { useTranslations } from "next-intl";
import { Camera, Download, QrCode, Smartphone } from "lucide-react";

const STEPS = [
  { key: "step1", icon: <Smartphone className="size-7" /> },
  { key: "step2", icon: <QrCode className="size-7" /> },
  { key: "step3", icon: <Camera className="size-7" /> },
  { key: "step4", icon: <Download className="size-7" /> },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={step.key}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-primary/10 transition-all group-hover:ring-primary/25 group-hover:shadow-xl">
                  <div className="text-primary">{step.icon}</div>
                  <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{t(`${step.key}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`${step.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
