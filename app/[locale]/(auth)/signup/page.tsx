import { getTranslations } from "next-intl/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("createAccount")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("signUpToStart")}
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

