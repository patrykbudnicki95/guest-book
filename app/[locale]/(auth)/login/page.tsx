import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { noindexMetadata } from "@/lib/seo/metadata";
import type { AppLocale } from "@/i18n/routing";
import { LoginForm } from "./login-form";
import { Heart } from "lucide-react";

type LoginPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.login" });

  return noindexMetadata(t("title"));
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Heart className="size-6 fill-primary text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("welcomeBack")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("signInToManage")}
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
