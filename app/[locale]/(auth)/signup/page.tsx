import { getTranslations } from "next-intl/server";
import { SignupForm } from "./signup-form";
import { Sparkles } from "lucide-react";

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{t("createAccount")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("signUpToStart")}
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
