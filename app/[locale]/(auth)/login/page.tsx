import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";
import { Heart } from "lucide-react";

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
