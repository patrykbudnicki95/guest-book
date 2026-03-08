import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("welcomeBack")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("signInToManage")}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

